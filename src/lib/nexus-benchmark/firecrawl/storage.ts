import 'server-only';

import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  NexusBenchmarkManifest,
  NexusBenchmarkSourceDocument,
} from '@/lib/contracts/nexus-benchmark';
import { finalizeBenchmarkManifest, inferCollectionCoverageFromCollectedFiles } from './manifest';
import type { FirecrawlRequestPayload, FirecrawlScrapeResponse } from './types';
import type { NormalizedFirecrawlArtifacts, NexusPersistableArtifact } from './normalize';

/**
 * ============================================================================
 * NEXUS BENCHMARK / FIRECRAWL / STORAGE
 * ============================================================================
 * Écrit localement un run benchmark complet dans benchmarks/nexus/<runId>.
 */

export interface PersistFirecrawlBenchmarkRunInput {
  manifest: NexusBenchmarkManifest;
  sourceDocument: NexusBenchmarkSourceDocument;
  requestPayload: FirecrawlRequestPayload;
  serializedRequestPayload: Record<string, unknown>;
  rawResponse: FirecrawlScrapeResponse;
  normalizedArtifacts: NormalizedFirecrawlArtifacts;
}

export interface PersistFirecrawlBenchmarkRunResult {
  manifest: NexusBenchmarkManifest;
  sourceDocument: NexusBenchmarkSourceDocument;
  absoluteRunDirectory: string;
  relativeRunDirectory: string;
  collectedFiles: string[];
}

function getAbsoluteRunDirectory(runId: string): string {
  return path.join(process.cwd(), 'benchmarks', 'nexus', runId);
}

function toPosixPath(relativePath: string): string {
  return relativePath.split(path.sep).join('/');
}

async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

async function ensureRunDirectories(rootDir: string): Promise<void> {
  await Promise.all([
    ensureDirectory(rootDir),
    ensureDirectory(path.join(rootDir, 'request')),
    ensureDirectory(path.join(rootDir, 'raw')),
    ensureDirectory(path.join(rootDir, 'collected')),
    ensureDirectory(path.join(rootDir, 'visual')),
    ensureDirectory(path.join(rootDir, 'runtime')),
    ensureDirectory(path.join(rootDir, 'blueprint')),
    ensureDirectory(path.join(rootDir, 'notes')),
  ]);
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  await fs.writeFile(filePath, payload, 'utf8');
}

async function writeTextFile(filePath: string, value: string): Promise<void> {
  await fs.writeFile(filePath, `${value}\n`, 'utf8');
}

async function writeArtifact(
  rootDir: string,
  artifact: NexusPersistableArtifact
): Promise<string> {
  const absolutePath = path.join(rootDir, artifact.relativePath);
  const parentDir = path.dirname(absolutePath);

  await ensureDirectory(parentDir);

  if (artifact.kind === 'text') {
    await writeTextFile(absolutePath, artifact.content);
  } else {
    await writeJsonFile(absolutePath, artifact.content);
  }

  return toPosixPath(artifact.relativePath);
}

function buildOperatorNotesMarkdown(
  sourceDocument: NexusBenchmarkSourceDocument,
  normalizedArtifacts: NormalizedFirecrawlArtifacts
): string {
  const collection = normalizedArtifacts.collection;

  const lines: string[] = [
    '# Notes opérateur',
    '',
    `## URL`,
    sourceDocument.url,
    '',
    `## Objectif`,
    sourceDocument.testObjective,
    '',
    `## Ce que Firecrawl a fourni`,
    collection.markdown ? '- markdown' : '- markdown absent',
    collection.summary ? '- summary' : '- summary absent',
    collection.html ? '- html' : '- html absent',
    collection.rawHtml ? '- rawHtml' : '- rawHtml absent',
    collection.links && collection.links.length > 0
      ? `- liens: ${collection.links.length}`
      : '- liens absents',
    collection.images && collection.images.length > 0
      ? `- images: ${collection.images.length}`
      : '- images absentes',
    collection.videos && collection.videos.length > 0
      ? `- vidéos: ${collection.videos.length}`
      : '- vidéos absentes',
    collection.screenshotUrl ? '- screenshot présent' : '- screenshot absent',
    Object.keys(collection.branding ?? {}).length > 0
      ? '- branding présent'
      : '- branding absent',
    Object.keys(collection.extraction ?? {}).length > 0
      ? '- extraction JSON présente'
      : '- extraction JSON absente',
    '',
    `## Verdict initial`,
    'Collecte terminée. Analyse visuelle et runtime encore non lancées.',
  ];

  return lines.join('\n');
}

export async function persistFirecrawlBenchmarkRun(
  input: PersistFirecrawlBenchmarkRunInput
): Promise<PersistFirecrawlBenchmarkRunResult> {
  const absoluteRunDirectory = getAbsoluteRunDirectory(input.manifest.runId);
  const relativeRunDirectory = toPosixPath(
    path.join('benchmarks', 'nexus', input.manifest.runId)
  );

  await ensureRunDirectories(absoluteRunDirectory);

  await writeJsonFile(
    path.join(absoluteRunDirectory, 'source.json'),
    input.sourceDocument
  );

  await writeJsonFile(
    path.join(absoluteRunDirectory, 'request', 'firecrawl-request.json'),
    input.serializedRequestPayload
  );

  await writeJsonFile(
    path.join(absoluteRunDirectory, 'raw', 'firecrawl-response.json'),
    input.rawResponse
  );

  const writtenCollectedFiles: string[] = [];
  for (const artifact of input.normalizedArtifacts.persistableArtifacts) {
    const relativePath = await writeArtifact(absoluteRunDirectory, artifact);
    writtenCollectedFiles.push(relativePath);
  }

  const operatorNotes = buildOperatorNotesMarkdown(
    input.sourceDocument,
    input.normalizedArtifacts
  );

  await writeTextFile(
    path.join(absoluteRunDirectory, 'notes', 'operator-notes.md'),
    operatorNotes
  );

  const finalizedManifest = finalizeBenchmarkManifest({
    manifest: input.manifest,
    requestFilePath: 'request/firecrawl-request.json',
    rawResponseFilePath: 'raw/firecrawl-response.json',
    collectedFiles: {
      collected: writtenCollectedFiles,
      notes: ['notes/operator-notes.md'],
    },
    coverage: inferCollectionCoverageFromCollectedFiles(writtenCollectedFiles),
    status: {
      collection: 'done',
    },
    nextStep: 'visual_analysis',
    errorMessage: null,
  });

  await writeJsonFile(
    path.join(absoluteRunDirectory, 'manifest.json'),
    finalizedManifest
  );

  return {
    manifest: finalizedManifest,
    sourceDocument: input.sourceDocument,
    absoluteRunDirectory,
    relativeRunDirectory,
    collectedFiles: writtenCollectedFiles,
  };
}