'use client';

import { useCallback, useEffect, useState } from 'react';

export interface NexusBenchmarkRunSummary {
  runId: string;
  createdAt: string;
  updatedAt: string;
  sourceUrl: string;
  sourceDomain: string;
  label: string;
  benchmarkFamily: string;
  nextStep: string;
  completenessScore: number;
  status: {
    collection: string;
    visual_analysis: string;
    runtime_analysis: string;
    blueprint: string;
  };
  coverage: {
    textual: boolean;
    structural: boolean;
    visual: boolean;
    runtime: boolean;
    interactiveStates: boolean;
    motion: boolean;
  };
}

export interface NexusBenchmarkRunDetail {
  manifest: Record<string, unknown> | null;
  source: Record<string, unknown> | null;
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
    branding: Record<string, unknown> | null;
    extraction: Record<string, unknown> | null;
    screenshotUrl: string | null;
    otherFiles: Array<{
      path: string;
      kind: 'json' | 'text' | 'unknown';
      content: unknown;
    }>;
  };
  visual: Record<string, unknown> | null;
  runtime: Record<string, unknown> | null;
  blueprint: {
    nexusBlueprint: Record<string, unknown> | null;
    compilePlan: Record<string, unknown> | null;
    uncertaintyMap: Record<string, unknown> | null;
  };
  notes: {
    operator: string | null;
  };
}

export function useBenchmarkRuns() {
  const [runs, setRuns] = useState<NexusBenchmarkRunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState<NexusBenchmarkRunDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRuns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/nexus/benchmark/runs', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load benchmark runs');
      }

      setRuns(Array.isArray(data?.runs) ? data.runs : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRun = useCallback(async (runId: string) => {
    if (!runId) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/nexus/benchmark/runs/${runId}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load benchmark run');
      }

      setSelectedRun(data?.run ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRuns();
  }, [refreshRuns]);

  return {
    runs,
    selectedRun,
    isLoading,
    error,
    refreshRuns,
    loadRun,
  };
}