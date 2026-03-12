import { NextRequest, NextResponse } from "next/server";
import { runFirecrawlBenchmark } from "@/lib/benchmarks/firecrawl-runner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL invalide" },
        { status: 400 }
      );
    }

    const result = await runFirecrawlBenchmark(url);

    return NextResponse.json({
      success: true,
      outputDir: result.outputDir,
      raw: result.raw,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}