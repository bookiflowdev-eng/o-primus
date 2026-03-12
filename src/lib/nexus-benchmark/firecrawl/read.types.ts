import type {
  NexusBenchmarkCoverage,
  NexusBenchmarkManifest,
  NexusBenchmarkSourceDocument,
  NexusBenchmarkStatusMap,
} from '@/lib/contracts/nexus-benchmark';

export type BenchmarkArtifactFileKind = 'json' | 'text' | 'unknown';

export interface BenchmarkArtifactFile {
  path: string;
  kind: BenchmarkArtifactFileKind;
  content: unknown;
}

export interface NexusBenchmarkRunSummary {
  runId: string;
  createdAt: string;
  updatedAt: string;
  sourceUrl: string;
  sourceDomain: string;
  label: string;
  benchmarkFamily: NexusBenchmarkManifest['benchmarkFamily'];
  nextStep: NexusBenchmarkManifest['nextStep'];
  completenessScore: number;
  status: NexusBenchmarkStatusMap;
  coverage: NexusBenchmarkCoverage;
}

export interface NexusBenchmarkRunDetail {
  manifest: NexusBenchmarkManifest;
  source: NexusBenchmarkSourceDocument | null;
  requestPayload: Record<string, unknown> | null;
  rawResponse: Record<string, unknown> | null;
  collected: {
    markdown: string | null;
    summary: string | null;
    html: string | null;
    rawHtml: string | null;
    cleanedHtml: string | null;
    links: unknown | null;
    images: unknown | null;
    videos: unknown | null;
    metadata: Record<string, unknown> | null;
    branding: Record<string, unknown> | null;
    extraction: Record<string, unknown> | null;
    screenshotUrl: string | null;
    otherFiles: BenchmarkArtifactFile[];
  };
  visual: Record<string, unknown> | null;
  runtime: Record<string, unknown> | null;
  blueprint: {
    nexusBlueprint: Record<string, unknown> | null;
    compilePlan: Record<string, unknown> | null;
    uncertaintyMap: Record<string, unknown> | null;
    otherFiles: BenchmarkArtifactFile[];
  };
  notes: {
    operator: string | null;
    otherFiles: BenchmarkArtifactFile[];
  };
}
