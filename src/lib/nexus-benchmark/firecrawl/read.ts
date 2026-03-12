import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  NexusBenchmarkManifest,
  NexusBenchmarkSourceDocument,
} from '@/lib/contracts/nexus-benchmark';
import type {
  BenchmarkArtifactFile,
  BenchmarkArtifactFileKind,
  NexusBenchmarkRunDetail,
  NexusBenchmarkRunSummary,
} from './read.types';

const BENCHMARK_ROOT = path.join(process.cwd(), 'benchmarks', 'nexus');

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/');
}

function assertSafeRunId(runId: string): string {
  if (
    !runId ||
    runId.trim().length === 0 ||
    runId.includes('..') ||
    runId.includes('/') ||
    runId.includes('\\')
  ) {
    throw new Error('NEXUS_BENCHMARK_INVALID_RUN_ID');
  }

  return runId.trim();
}

function getRunDirectory(runId: string): string {
  return path.join(BENCHMARK_ROOT, assertSafeRunId(runId));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'NEXUS_BENCHMARK_UNKNOWN_ERROR';
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  if (!(await pathExists(filePath))) return null;

  const payload = await fs.readFile(filePath, 'utf8');
  return JSON.parse(payload) as T;
}

async function readTextIfExists(filePath: string): Promise<string | null> {
  if (!(await pathExists(filePath))) return null;
  return fs.readFile(filePath, 'utf8');
}

async function readArtifactFile(
  runDirectory: string,
  relativePath: string
): Promise<BenchmarkArtifactFile | null> {
  const normalizedRelativePath = toPosixPath(relativePath);
  const absolutePath = path.join(runDirectory, normalizedRelativePath);

  if (!(await pathExists(absolutePath))) return null;

  const extension = path.extname(normalizedRelativePath).toLowerCase();

  if (extension === '.json') {
    return {
      path: normalizedRelativePath,
      kind: 'json',
      content: await readJsonIfExists(absolutePath),
    };
  }

  if (
    extension === '.md' ||
    extension === '.txt' ||
    extension === '.html' ||
    extension === '.css' ||
    extension === '.js' ||
    extension === '.url'
  ) {
    return {
      path: normalizedRelativePath,
      kind: 'text',
      content: await readTextIfExists(absolutePath),
    };
  }

  return {
    path: normalizedRelativePath,
    kind: 'unknown',
    content: await fs.readFile(absolutePath, 'utf8'),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function ensureRunDirectoryExists(runId: string): Promise<string> {
  const directory = getRunDirectory(runId);

  if (!(await pathExists(directory))) {
    throw new Error('NEXUS_BENCHMARK_RUN_NOT_FOUND');
  }

  return directory;
}

async function readRequiredManifest(runId: string): Promise<NexusBenchmarkManifest> {
  const runDirectory = await ensureRunDirectoryExists(runId);
  const manifestPath = path.join(runDirectory, 'manifest.json');
  const manifest = await readJsonIfExists<NexusBenchmarkManifest>(manifestPath);

  if (!manifest) {
    throw new Error('NEXUS_BENCHMARK_RUN_MANIFEST_NOT_FOUND');
  }

  return manifest;
}

async function readJsonFromPreferredPaths<T>(
  runDirectory: string,
  indexedPaths: string[],
  fallbackPath: string
): Promise<T | null> {
  const candidates = [...indexedPaths, fallbackPath];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const normalized = toPosixPath(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const filePath = path.join(runDirectory, normalized);
    const value = await readJsonIfExists<T>(filePath);
    if (value !== null) return value;
  }

  return null;
}

async function readTextFromPreferredPaths(
  runDirectory: string,
  indexedPaths: string[],
  fallbackPath: string
): Promise<string | null> {
  const candidates = [...indexedPaths, fallbackPath];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const normalized = toPosixPath(candidate);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const filePath = path.join(runDirectory, normalized);
    const value = await readTextIfExists(filePath);
    if (value !== null) return value;
  }

  return null;
}

export async function listBenchmarkRunIds(): Promise<string[]> {
  if (!(await pathExists(BENCHMARK_ROOT))) {
    return [];
  }

  const entries = await fs.readdir(BENCHMARK_ROOT, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
}

export async function readBenchmarkManifest(
  runId: string
): Promise<NexusBenchmarkManifest> {
  return readRequiredManifest(runId);
}

export async function readBenchmarkSource(
  runId: string
): Promise<NexusBenchmarkSourceDocument | null> {
  const safeRunId = assertSafeRunId(runId);
  const runDirectory = await ensureRunDirectoryExists(safeRunId);
  return readJsonIfExists<NexusBenchmarkSourceDocument>(
    path.join(runDirectory, 'source.json')
  );
}

export async function readBenchmarkRunSummary(
  runId: string
): Promise<NexusBenchmarkRunSummary> {
  const manifest = await readRequiredManifest(runId);

  return {
    runId: manifest.runId,
    createdAt: manifest.createdAt,
    updatedAt: manifest.updatedAt,
    sourceUrl: manifest.sourceUrl,
    sourceDomain: manifest.sourceDomain,
    label: manifest.label,
    benchmarkFamily: manifest.benchmarkFamily,
    nextStep: manifest.nextStep,
    completenessScore: manifest.completenessScore,
    status: manifest.status,
    coverage: manifest.coverage,
  };
}

export async function readBenchmarkRunDetail(
  runId: string
): Promise<NexusBenchmarkRunDetail> {
  const safeRunId = assertSafeRunId(runId);
  const runDirectory = await ensureRunDirectoryExists(safeRunId);
  const manifest = await readRequiredManifest(safeRunId);
  const source = await readJsonIfExists<NexusBenchmarkSourceDocument>(
    path.join(runDirectory, 'source.json')
  );

  const requestPayload = await readJsonFromPreferredPaths<Record<string, unknown>>(
    runDirectory,
    manifest.files.request,
    'request/firecrawl-request.json'
  );

  const rawResponse = await readJsonFromPreferredPaths<Record<string, unknown>>(
    runDirectory,
    manifest.files.raw,
    'raw/firecrawl-response.json'
  );

  const collected: NexusBenchmarkRunDetail['collected'] = {
    markdown: null,
    summary: null,
    html: null,
    rawHtml: null,
    cleanedHtml: null,
    links: null,
    images: null,
    videos: null,
    metadata: null,
    branding: null,
    extraction: null,
    screenshotUrl: null,
    otherFiles: [],
  };

  for (const relativePath of manifest.files.collected) {
    const artifact = await readArtifactFile(runDirectory, relativePath);
    if (!artifact) continue;

    const fileName = path.posix.basename(toPosixPath(relativePath));

    switch (fileName) {
      case 'markdown.md':
        collected.markdown = typeof artifact.content === 'string' ? artifact.content : null;
        break;
      case 'summary.txt':
        collected.summary = typeof artifact.content === 'string' ? artifact.content : null;
        break;
      case 'html.html':
        collected.html = typeof artifact.content === 'string' ? artifact.content : null;
        break;
      case 'rawHtml.html':
        collected.rawHtml = typeof artifact.content === 'string' ? artifact.content : null;
        break;
      case 'cleanedHtml.html':
        collected.cleanedHtml = typeof artifact.content === 'string' ? artifact.content : null;
        break;
      case 'links.json':
        collected.links = artifact.content;
        break;
      case 'images.json':
        collected.images = artifact.content;
        break;
      case 'videos.json':
        collected.videos = artifact.content;
        break;
      case 'metadata.json':
        collected.metadata = asRecord(artifact.content);
        break;
      case 'branding.json':
        collected.branding = asRecord(artifact.content);
        break;
      case 'extraction.json':
        collected.extraction = asRecord(artifact.content);
        break;
      case 'screenshot.url.txt':
        collected.screenshotUrl = asTrimmedString(artifact.content);
        break;
      default:
        collected.otherFiles.push(artifact);
    }
  }

  const visual = await readJsonFromPreferredPaths<Record<string, unknown>>(
    runDirectory,
    manifest.files.visual,
    'visual/visual-analysis.json'
  );

  const runtime = await readJsonFromPreferredPaths<Record<string, unknown>>(
    runDirectory,
    manifest.files.runtime,
    'runtime/runtime-analysis.json'
  );

  const blueprint: NexusBenchmarkRunDetail['blueprint'] = {
    nexusBlueprint: await readJsonFromPreferredPaths<Record<string, unknown>>(
      runDirectory,
      manifest.files.blueprint,
      'blueprint/nexus-blueprint.json'
    ),
    compilePlan: await readJsonFromPreferredPaths<Record<string, unknown>>(
      runDirectory,
      manifest.files.blueprint,
      'blueprint/compile-plan.json'
    ),
    uncertaintyMap: await readJsonFromPreferredPaths<Record<string, unknown>>(
      runDirectory,
      manifest.files.blueprint,
      'blueprint/uncertainty-map.json'
    ),
    otherFiles: [],
  };

  for (const relativePath of manifest.files.blueprint) {
    const fileName = path.posix.basename(toPosixPath(relativePath));
    if (
      fileName === 'nexus-blueprint.json' ||
      fileName === 'compile-plan.json' ||
      fileName === 'uncertainty-map.json'
    ) {
      continue;
    }

    const artifact = await readArtifactFile(runDirectory, relativePath);
    if (artifact) blueprint.otherFiles.push(artifact);
  }

  const operator = await readTextFromPreferredPaths(
    runDirectory,
    manifest.files.notes,
    'notes/operator-notes.md'
  );

  const otherNoteFiles: BenchmarkArtifactFile[] = [];
  for (const relativePath of manifest.files.notes) {
    const fileName = path.posix.basename(toPosixPath(relativePath));
    if (fileName === 'operator-notes.md') continue;

    const artifact = await readArtifactFile(runDirectory, relativePath);
    if (artifact) otherNoteFiles.push(artifact);
  }

  return {
    manifest,
    source,
    requestPayload,
    rawResponse,
    collected,
    visual,
    runtime,
    blueprint,
    notes: {
      operator,
      otherFiles: otherNoteFiles,
    },
  };
}

export function getBenchmarkReadErrorStatus(error: unknown): number {
  const message = getErrorMessage(error);

  if (message === 'NEXUS_BENCHMARK_INVALID_RUN_ID') return 400;
  if (
    message === 'NEXUS_BENCHMARK_RUN_NOT_FOUND' ||
    message === 'NEXUS_BENCHMARK_RUN_MANIFEST_NOT_FOUND'
  ) {
    return 404;
  }

  return 500;
}

export function getBenchmarkReadErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}
