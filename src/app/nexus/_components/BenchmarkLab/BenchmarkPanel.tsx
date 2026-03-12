'use client';

import { useState } from 'react';
// ✅ CORRECTION : Le chemin pointe désormais vers le bon fichier contenant la logique
import { useBenchmarkRuns } from '@/hooks/useBenchmarkRuns';
import { BenchmarkRunList } from './BenchmarkRunList';
import { BenchmarkRunInspector } from './BenchmarkRunInspector';

export function BenchmarkPanel() {
  const [url, setUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const {
    runs,
    selectedRun,
    refreshRuns,
    loadRun,
    error,
    isLoading,
  } = useBenchmarkRuns();

  async function runBenchmark() {
    if (!url.trim()) return;

    setIsRunning(true);

    try {
      const res = await fetch('/api/nexus/benchmark/firecrawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Benchmark failed');
      }

      await refreshRuns();

      if (data?.runId) {
        await loadRun(data.runId);
      }

      setUrl('');
    } catch (err) {
      console.error('BenchmarkPanel.runBenchmark error:', err);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="grid h-full grid-cols-[320px_1fr] gap-4 overflow-hidden">
      <div className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-wide text-white">Benchmark Lab</h2>
          <p className="mt-1 text-xs text-neutral-400">
            Lance un benchmark Firecrawl et inspecte les runs archivés.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-lg border border-white/10 bg-neutral-950/70 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500"
          />

          <button
            onClick={runBenchmark}
            disabled={isRunning}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRunning ? 'Running...' : 'Run Benchmark'}
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between text-xs text-neutral-400">
          <span>{isLoading ? 'Loading...' : `${runs.length} run(s)`}</span>
          <button
            onClick={refreshRuns}
            className="rounded-md border border-white/10 px-2 py-1 text-neutral-300 hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <BenchmarkRunList runs={runs} onSelect={loadRun} />
        </div>
      </div>

      <div className="min-h-0 overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
        <BenchmarkRunInspector run={selectedRun} error={error} />
      </div>
    </div>
  );
}