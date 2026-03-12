import { NextResponse } from 'next/server';

import {
  getBenchmarkReadErrorMessage,
  getBenchmarkReadErrorStatus,
  readBenchmarkRunDetail,
} from '@/lib/nexus-benchmark/firecrawl/read';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ runId: string }> | { runId: string };
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { runId } = await Promise.resolve(context.params);
    const run = await readBenchmarkRunDetail(runId);

    return NextResponse.json(
      {
        success: true,
        run,
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
