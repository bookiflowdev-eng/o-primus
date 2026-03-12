import React, { useState, useEffect } from 'react';
import { useTelemetryStream } from '@/hooks/nexus/useTelemetryStream';
import { SpatialOverlay, BoundingBox } from './SpatialOverlay';

export const TelemetryView: React.FC = () => {
  const { videoRef, status } = useTelemetryStream();
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);

  // Séquence de Scan IA Simulée
  useEffect(() => {
    if (status !== 'connected') {
      setBoxes([]);
      return;
    }

    // Le "cerveau" scanne la page virtuellement
    const sequence = [
      { delay: 800, box: { id: 'nav', x: '5%', y: '5%', width: '90%', height: '10%', type: 'container', label: 'GLOBAL_NAV_GRID' } },
      { delay: 1600, box: { id: 'hero', x: '10%', y: '25%', width: '80%', height: '40%', type: 'container', label: 'HERO_WRAPPER' } },
      { delay: 2200, box: { id: 'title', x: '15%', y: '30%', width: '50%', height: '12%', type: 'text', label: 'H1_TYPOGRAPHY' } },
      { delay: 2800, box: { id: 'cta', x: '15%', y: '50%', width: '15%', height: '7%', type: 'interactive', label: 'PRIMARY_CTA_BUTTON' } },
      { delay: 3500, box: { id: 'img', x: '55%', y: '30%', width: '30%', height: '30%', type: 'image', label: 'MEDIA_ASSET' } },
    ];

    const timeouts = sequence.map(({ delay, box }) =>
      setTimeout(() => {
        setBoxes((prev) => [...prev, box as BoundingBox]);
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [status]);

  return (
    <div className="relative w-full h-full bg-[#050505] rounded-xl overflow-hidden flex items-center justify-center border border-white/[0.05] shadow-2xl">
      
      {/* SIMULATION VISUELLE CSS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
      </div>

      {status !== 'connected' && (
        <div className="absolute flex flex-col items-center justify-center text-white/50 space-y-6 z-10">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 border-t-2 border-l-2 border-[#3b82f6] rounded-full animate-spin" />
            <div className="absolute inset-2 border-b-2 border-r-2 border-[#ef4444] rounded-full animate-[spin_1.5s_linear_reverse]" />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/70">
            {status === 'connecting' ? 'Establishing Neural Link' : 'Telemetry Offline'}
          </p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`relative z-10 w-full h-full object-contain transition-opacity duration-1000 ${
          status === 'connected' && videoRef.current?.srcObject ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <SpatialOverlay boxes={boxes} />

      {/* HUD Télémétrie */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none z-50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-mono text-[10px] text-white/70 uppercase tracking-wider">
            [ SYSTEM: NEXUS CORTEX ]
          </span>
        </div>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest pl-4">
          TARGET: REMOTE_DOM_RENDERER
        </span>
        {/* Compteur d'analyse temps réel */}
        {status === 'connected' && (
          <span className="font-mono text-[9px] text-blue-400 uppercase tracking-widest pl-4 mt-2 animate-in fade-in">
            &gt; NODES ISOLATED : {boxes.length}
          </span>
        )}
      </div>
      
    </div>
  );
};