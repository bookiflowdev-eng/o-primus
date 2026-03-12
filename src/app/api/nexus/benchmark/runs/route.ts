import { NextResponse } from 'next/server';

import {
  getBenchmarkReadErrorMessage,
  getBenchmarkReadErrorStatus,
  listBenchmarkRunIds,
  readBenchmarkRunSummary,
} from '@/lib/nexus-benchmark/firecrawl/read';
import type { NexusBenchmarkRunSummary } from '@/lib/nexus-benchmark/firecrawl/read.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const runIds = await listBenchmarkRunIds();
    const settled = await Promise.allSettled(
      runIds.map((runId) => readBenchmarkRunSummary(runId))
    );

    const runs: NexusBenchmarkRunSummary[] = settled
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<NexusBenchmarkRunSummary> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const skippedCorruptedRuns = settled.filter(
      (result) => result.status === 'rejected'
    ).length;

    return NextResponse.json(
      {
        success: true,
        count: runs.length,
        skippedCorruptedRuns,
        runs,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: getBenchmarkReadErrorMessage(error),
      },
      { status: getBenchmarkReadErrorStatus(error) }
    );
  }
}