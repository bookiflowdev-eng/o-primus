'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import OmniBar from './_components/OmniBar';
import CanvasPreview from './_components/CanvasPreview';
import { SourceViewer } from './_components/SourceViewer';
import { BenchmarkPanel } from './_components/BenchmarkLab/BenchmarkPanel';
import {
  Activity,
  MonitorPlay,
  Code2,
  Monitor,
  Tablet,
  Smartphone,
  FlaskConical,
} from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';

type ViewMode = 'preview' | 'code' | 'benchmark';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export default function NexusWorkspace() {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [sidebarWidth, setSidebarWidth] = useState(400);

  const { canvasHtml, agentLogs, agentState, selectedNodeId } = useNexus();

  const isResizing = useRef(false);
  const resizeRafRef = useRef<number | null>(null);

  const startResizing = useCallback(() => {
    isResizing.current = true;
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    if (resizeRafRef.current) {
      cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = null;
    }
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (!isResizing.current) return;

    if (resizeRafRef.current) {
      cancelAnimationFrame(resizeRafRef.current);
    }

    resizeRafRef.current = requestAnimationFrame(() => {
      setSidebarWidth(Math.max(250, Math.min(mouseMoveEvent.clientX, 800)));
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      if (resizeRafRef.current) {
        cancelAnimationFrame(resizeRafRef.current);
      }
    };
  }, [resize, stopResizing]);

  const isAgentBusy =
    agentState === 'observing' ||
    agentState === 'thinking' ||
    agentState === 'acting';

  return (
    <main className="flex w-full h-full relative overflow-hidden bg-transparent pointer-events-none">
      {/* SIDEBAR GAUCHE */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="h-full bg-black/30 backdrop-blur-2xl flex flex-col relative z-10 shrink-0 border-r border-white/5 pointer-events-auto"
      >
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
            </div>
            <span className="font-black tracking-[0.2em] text-[11px] text-white">
              NEXUS // BRAIN
            </span>
          </div>

          <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-2">
            <Activity
              size={12}
              className={agentState !== 'idle' ? 'text-blue-500 animate-pulse' : 'text-green-500'}
            />
            {agentState.toUpperCase()}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 font-mono text-xs text-neutral-400">
          <div className="flex flex-col gap-2 mb-6">
            {agentLogs.map((log, i) => (
              <div
                key={i}
                className="text-[10px] opacity-80 border-l border-white/10 pl-2 py-0.5"
              >
                {log}
              </div>
            ))}
          </div>

          {selectedNodeId && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md backdrop-blur-md">
              <p className="text-blue-400 font-bold mb-2">
                🎯 Cible Verrouillée : {selectedNodeId}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* RESIZER */}
      <div
        className="w-1.5 h-full bg-transparent hover:bg-blue-500/50 cursor-col-resize z-20 transition-colors pointer-events-auto"
        onMouseDown={startResizing}
      />

      {/* SECTION DROITE */}
      <section className="flex-1 h-full bg-transparent flex flex-col relative min-w-0 pointer-events-auto">
        <header className="h-14 border-b border-white/5 bg-transparent flex items-center justify-between px-6 shrink-0 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4 min-w-0">
            {/* SWITCH: RENDER / SOURCE / BENCHMARK */}
            <div className="flex bg-neutral-900/40 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${
                  viewMode === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <MonitorPlay size={14} /> RENDER
              </button>

              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${
                  viewMode === 'code'
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Code2 size={14} /> SOURCE
              </button>

              <button
                onClick={() => setViewMode('benchmark')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${
                  viewMode === 'benchmark'
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <FlaskConical size={14} /> BENCHMARK
              </button>
            </div>

            {/* SWITCH RESPONSIVE - visible uniquement en mode RENDER */}
            {viewMode === 'preview' && (
              <div className="flex bg-neutral-900/40 rounded-lg p-1 border border-white/5 animate-in fade-in slide-in-from-left-4">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  title="Desktop (Plein écran)"
                  className={`p-1.5 rounded-md transition-all ${
                    deviceMode === 'desktop'
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Monitor size={14} />
                </button>

                <button
                  onClick={() => setDeviceMode('tablet')}
                  title="Tablette (768px)"
                  className={`p-1.5 rounded-md transition-all ${
                    deviceMode === 'tablet'
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Tablet size={14} />
                </button>

                <button
                  onClick={() => setDeviceMode('mobile')}
                  title="Mobile (375px)"
                  className={`p-1.5 rounded-md transition-all ${
                    deviceMode === 'mobile'
                      ? 'bg-white/10 text-white'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative p-4 flex justify-center bg-[#050505]/50">
          {viewMode === 'preview' ? (
            <div
              className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] h-full relative ${
                deviceMode === 'mobile'
                  ? 'w-[375px]'
                  : deviceMode === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full'
              }`}
            >
              <CanvasPreview
                code={canvasHtml ? { html: canvasHtml, css: '', js: '' } : null}
                isLoading={isAgentBusy}
              />
            </div>
          ) : viewMode === 'code' ? (
            <div className="w-full h-full min-w-0">
              <SourceViewer code={canvasHtml} />
            </div>
          ) : (
            <div className="w-full h-full min-w-0 overflow-hidden">
              <BenchmarkPanel />
            </div>
          )}
        </div>
      </section>

      <OmniBar />
    </main>
  );
}