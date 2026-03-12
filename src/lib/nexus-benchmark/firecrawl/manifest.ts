import {
  createEmptyBenchmarkCoverage,
  createEmptyBenchmarkFileIndex,
  createEmptyBenchmarkStatusMap,
  type CreateNexusBenchmarkManifestInput,
  type NexusBenchmarkCoverage,
  type NexusBenchmarkFileIndex,
  type NexusBenchmarkManifest,
  type NexusBenchmarkPhase,
  type NexusBenchmarkSourceDocument,
} from '@/lib/contracts/nexus-benchmark';
import {
  extractDomainFromUrl,
  getRunDirectoryRelativePath,
  getStandardCollectedFilePaths,
  normalizeBenchmarkUrl,
  slugifyBenchmarkSegment,
  NEXUS_BENCHMARK_DEFAULT_COLLECTOR,
  NEXUS_BENCHMARK_DEFAULT_DEVICE_PROFILE,
  NEXUS_BENCHMARK_DEFAULT_FAMILY,
  NEXUS_BENCHMARK_DEFAULT_LOCALE,
  NEXUS_BENCHMARK_DEFAULT_PAGE_TYPE,
  NEXUS_BENCHMARK_DEFAULT_VIEWPORT,
} from './config';

/**
 * ============================================================================
 * NEXUS BENCHMARK / FIRECRAWL / MANIFEST
 * ============================================================================
 * Construction et mise à jour du manifest d'un run de benchmark Nexus.
 * Le manifest est le point d'entrée canonique de chaque run.
 */

export function createBenchmarkRunId(
  sourceUrl: string,
  now: Date = new Date()
): string {
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const domain = extractDomainFromUrl(sourceUrl);
  const slug = slugifyBenchmarkSegment(domain);

  return `${timestamp}_${slug}`;
}

export function buildBenchmarkLabel(
  sourceUrl: string,
  explicitLabel?: string
): string {
  if (explicitLabel && explicitLabel.trim().length > 0) {
    return slugifyBenchmarkSegment(explicitLabel);
  }

  return slugifyBenchmarkSegment(extractDomainFromUrl(sourceUrl));
}

export function createBenchmarkSourceDocument(
  input: CreateNexusBenchmarkManifestInput
): NexusBenchmarkSourceDocument {
  const sourceUrl = normalizeBenchmarkUrl(input.sourceUrl);
  const sourceDomain = extractDomainFromUrl(sourceUrl);

  return {
    url: sourceUrl,
    sourceDomain,
    label: buildBenchmarkLabel(sourceUrl, input.label),
    benchmarkFamily: input.benchmarkFamily ?? NEXUS_BENCHMARK_DEFAULT_FAMILY,
    pageTypeGuess: input.pageTypeGuess ?? NEXUS_BENCHMARK_DEFAULT_PAGE_TYPE,
    pageGoalGuess: input.pageGoalGuess ?? '',
    testObjective: input.goal,
    viewport: {
      width:
        input.viewport?.width ?? NEXUS_BENCHMARK_DEFAULT_VIEWPORT.width,
      height:
        input.viewport?.height ?? NEXUS_BENCHMARK_DEFAULT_VIEWPORT.height,
    },
    deviceProfile:
      input.deviceProfile ?? NEXUS_BENCHMARK_DEFAULT_DEVICE_PROFILE,
    locale: input.locale ?? NEXUS_BENCHMARK_DEFAULT_LOCALE,
    notes: input.sourceNotes ?? [],
  };
}

export function createInitialBenchmarkManifest(
  input: CreateNexusBenchmarkManifestInput
): NexusBenchmarkManifest {
  const sourceUrl = normalizeBenchmarkUrl(input.sourceUrl);
  const sourceDomain = extractDomainFromUrl(sourceUrl);
  const runId = createBenchmarkRunId(sourceUrl);
  const createdAt = new Date().toISOString();
  const files = createEmptyBenchmarkFileIndex();

  files.request.push('request/firecrawl-request.json');
  files.notes.push('notes/operator-notes.md');

  return {
    runId,
    createdAt,
    updatedAt: createdAt,
    sourceUrl,
    sourceDomain,
    label: buildBenchmarkLabel(sourceUrl, input.label),
    benchmarkFamily: input.benchmarkFamily ?? NEXUS_BENCHMARK_DEFAULT_FAMILY,
    goal: input.goal,
    collector: input.collector ?? NEXUS_BENCHMARK_DEFAULT_COLLECTOR,
    tools: {
      collector: input.collector ?? NEXUS_BENCHMARK_DEFAULT_COLLECTOR,
      visualReader: null,
      runtimeReader: null,
      compiler: null,
    },
    status: createEmptyBenchmarkStatusMap(),
    files,
    coverage: createEmptyBenchmarkCoverage(),
    completenessScore: 0,
    nextStep: 'collection',
    errorMessage: null,
  };
}

export interface FinalizeBenchmarkManifestInput {
  manifest: NexusBenchmarkManifest;
  requestFilePath?: string;
  rawResponseFilePath?: string;
  collectedFiles?: Partial<NexusBenchmarkFileIndex>;
  coverage?: Partial<NexusBenchmarkCoverage>;
  status?: Partial<NexusBenchmarkManifest['status']>;
  nextStep?: NexusBenchmarkPhase | 'completed';
  errorMessage?: string | null;
}

export function finalizeBenchmarkManifest(
  input: FinalizeBenchmarkManifestInput
): NexusBenchmarkManifest {
  const current = input.manifest;

  const mergedFiles: NexusBenchmarkFileIndex = {
    request: dedupeFilePaths([
      ...(current.files.request ?? []),
      ...(input.requestFilePath ? [input.requestFilePath] : []),
      ...(input.collectedFiles?.request ?? []),
    ]),
    raw: dedupeFilePaths([
      ...(current.files.raw ?? []),
      ...(input.rawResponseFilePath ? [input.rawResponseFilePath] : []),
      ...(input.collectedFiles?.raw ?? []),
    ]),
    collected: dedupeFilePaths([
      ...(current.files.collected ?? []),
      ...(input.collectedFiles?.collected ?? []),
    ]),
    visual: dedupeFilePaths([
      ...(current.files.visual ?? []),
      ...(input.collectedFiles?.visual ?? []),
    ]),
    runtime: dedupeFilePaths([
      ...(current.files.runtime ?? []),
      ...(input.collectedFiles?.runtime ?? []),
    ]),
    blueprint: dedupeFilePaths([
      ...(current.files.blueprint ?? []),
      ...(input.collectedFiles?.blueprint ?? []),
    ]),
    notes: dedupeFilePaths([
      ...(current.files.notes ?? []),
      ...(input.collectedFiles?.notes ?? []),
    ]),
  };

  const mergedCoverage: NexusBenchmarkCoverage = {
    ...current.coverage,
    ...(input.coverage ?? {}),
  };

  const mergedStatus = {
    ...current.status,
    ...(input.status ?? {}),
  };

  const completenessScore = computeBenchmarkCompletenessScore(
    mergedFiles,
    mergedCoverage
  );

  return {
    ...current,
    updatedAt: new Date().toISOString(),
    files: mergedFiles,
    coverage: mergedCoverage,
    status: mergedStatus,
    completenessScore,
    nextStep: input.nextStep ?? inferNextStep(mergedStatus),
    errorMessage: input.errorMessage ?? current.errorMessage,
  };
}

export function buildExpectedCollectedFilesAfterFirecrawl(): string[] {
  return getStandardCollectedFilePaths();
}

export function computeBenchmarkCompletenessScore(
  files: NexusBenchmarkFileIndex,
  coverage: NexusBenchmarkCoverage
): number {
  let score = 0;

  if (files.request.length > 0) score += 5;
  if (files.raw.length > 0) score += 10;
  if (files.collected.length > 0) score += 20;
  if (files.visual.length > 0) score += 15;
  if (files.runtime.length > 0) score += 20;
  if (files.blueprint.length > 0) score += 10;
  if (files.notes.length > 0) score += 5;

  if (coverage.textual) score += 5;
  if (coverage.structural) score += 5;
  if (coverage.visual) score += 2;
  if (coverage.runtime) score += 1;
  if (coverage.interactiveStates) score += 1;
  if (coverage.motion) score += 1;

  return Math.min(100, score);
}

export function inferCollectionCoverageFromCollectedFiles(
  collectedFiles: string[]
): NexusBenchmarkCoverage {
  const normalized = new Set(collectedFiles.map((file) => file.toLowerCase()));

  return {
    textual:
      normalized.has('collected/markdown.md') ||
      normalized.has('collected/summary.txt'),
    structural:
      normalized.has('collected/html.html') ||
      normalized.has('collected/rawhtml.html') ||
      normalized.has('collected/cleanedhtml.html') ||
      normalized.has('collected/links.json') ||
      normalized.has('collected/extraction.json'),
    visual:
      normalized.has('collected/screenshot.url.txt') ||
      normalized.has('collected/images.json') ||
      normalized.has('collected/branding.json'),
    runtime: false,
    interactiveStates: false,
    motion: false,
  };
}

export function inferNextStep(
  status: NexusBenchmarkManifest['status']
): NexusBenchmarkPhase | 'completed' {
  if (status.collection !== 'done') return 'collection';
  if (status.visual_analysis !== 'done') return 'visual_analysis';
  if (status.runtime_analysis !== 'done') return 'runtime_analysis';
  if (status.blueprint !== 'done') return 'blueprint';
  return 'completed';
}

export function getBenchmarkRunDirectoryInfo(runId: string): {
  runId: string;
  relativePath: string;
} {
  return {
    runId,
    relativePath: getRunDirectoryRelativePath(runId),
  };
}

function dedupeFilePaths(paths: string[]): string[] {
  return Array.from(new Set(paths.filter(Boolean)));
}