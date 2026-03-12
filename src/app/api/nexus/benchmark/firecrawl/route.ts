import { NextRequest, NextResponse } from 'next/server';

import { buildDefaultFirecrawlRequestPayload } from '@/lib/nexus-benchmark/firecrawl/config';
import {
  buildSerializableFirecrawlRequest,
  executeFirecrawlScrape,
} from '@/lib/nexus-benchmark/firecrawl/client';
import { createInitialBenchmarkManifest, createBenchmarkSourceDocument } from '@/lib/nexus-benchmark/firecrawl/manifest';
import { normalizeFirecrawlResponse } from '@/lib/nexus-benchmark/firecrawl/normalize';
import { persistFirecrawlBenchmarkRun } from '@/lib/nexus-benchmark/firecrawl/storage';
import type {
  FirecrawlAction,
  FirecrawlBenchmarkRunInput,
  FirecrawlFormat,
} from '@/lib/nexus-benchmark/firecrawl/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type BenchmarkRouteBody = Partial<FirecrawlBenchmarkRunInput> & {
  url?: string;
  sourceUrl?: string;
  formats?: FirecrawlFormat[];
  actions?: FirecrawlAction[];
  timeout?: number;
  onlyMainContent?: boolean;
};

function resolveIncomingUrl(body: BenchmarkRouteBody): string {
  const candidate = body.sourceUrl ?? body.url;

  if (!candidate || typeof candidate !== 'string' || candidate.trim().length === 0) {
    throw new Error('NEXUS_BENCHMARK_SOURCE_URL_REQUIRED');
  }

  return candidate;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BenchmarkRouteBody;
    const sourceUrl = resolveIncomingUrl(body);

    const manifest = createInitialBenchmarkManifest({
      sourceUrl,
      benchmarkFamily: body.benchmarkFamily,
      pageTypeGuess: body.pageTypeGuess,
      goal:
        body.goal ??
        'Observer toutes les sorties Firecrawl et les normaliser dans le langage Nexus.',
      label: body.label,
      collector: body.collector,
      locale: body.locale,
      viewport: body.viewport,
      deviceProfile: body.deviceProfile,
      sourceNotes: body.sourceNotes,
      pageGoalGuess: body.pageGoalGuess,
    });

    const sourceDocument = createBenchmarkSourceDocument({
      sourceUrl,
      benchmarkFamily: body.benchmarkFamily,
      pageTypeGuess: body.pageTypeGuess,
      goal:
        body.goal ??
        'Observer toutes les sorties Firecrawl et les normaliser dans le langage Nexus.',
      label: body.label,
      collector: body.collector,
      locale: body.locale,
      viewport: body.viewport,
      deviceProfile: body.deviceProfile,
      sourceNotes: body.sourceNotes,
      pageGoalGuess: body.pageGoalGuess,
    });

    const requestPayload = buildDefaultFirecrawlRequestPayload({
      url: sourceUrl,
      formats: body.formats,
      actions: body.actions,
      timeout: body.timeout,
      onlyMainContent: body.onlyMainContent,
    });

    const rawResponse = await executeFirecrawlScrape(requestPayload);
    const normalizedArtifacts = normalizeFirecrawlResponse(rawResponse);

    const persisted = await persistFirecrawlBenchmarkRun({
      manifest,
      sourceDocument,
      requestPayload,
      serializedRequestPayload: buildSerializableFirecrawlRequest(requestPayload),
      rawResponse,
      normalizedArtifacts,
    });

    return NextResponse.json(
      {
        success: true,
        runId: persisted.manifest.runId,
        outputDir: persisted.relativeRunDirectory,
        manifest: persisted.manifest,
        source: persisted.sourceDocument,
        collectedFiles: persisted.collectedFiles,
        warning:
          typeof rawResponse.warning === 'string' ? rawResponse.warning : null,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'NEXUS_BENCHMARK_UNKNOWN_ERROR';

    const status =
      message === 'NEXUS_BENCHMARK_SOURCE_URL_REQUIRED' ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}