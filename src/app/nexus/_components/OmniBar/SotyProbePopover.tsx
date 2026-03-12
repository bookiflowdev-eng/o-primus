import React, { useState } from 'react';
import { Globe, Radar, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNexus } from '@/components/providers/NexusProvider';

interface SotyProbePopoverProps {
  onClose: () => void;
}

export const SotyProbePopover: React.FC<SotyProbePopoverProps> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const { isProbing, setIsProbing, setSotyProbeData, addAgentLog } = useNexus();
  const [success, setSuccess] = useState(false);

  const handleProbe = async () => {
    if (!url || !url.startsWith('http')) return;
    
    setIsProbing(true);
    addAgentLog(`[PROBE] Lancement de l'extraction bas-niveau sur : ${url}`);
    
    try {
      // Appel vers notre futur backend CDP (Phase 2)
      const res = await fetch('/api/nexus/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!res.ok) throw new Error('Échec de l\'extraction spatio-temporelle.');

      const data = await res.json();
      setSotyProbeData(data.sotyData);
      
      addAgentLog(`[PROBE SUCCESS] ADN Mathématique extrait avec succès.`);
      setSuccess(true);
      setTimeout(() => onClose(), 2000);

    } catch (error: any) {
      addAgentLog(`[PROBE ERROR] ${error.message}`);
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-xl p-3 shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-in fade-in slide-in-from-bottom-2 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-blue-400">
          <Radar size={14} className={isProbing ? "animate-[spin_2s_linear_infinite]" : ""} />
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Deep Web Probe</span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {!success ? (
        <div className="relative">
          <input 
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProbing}
            placeholder="https://awwwards.com/..."
            className="w-full bg-neutral-900/50 text-xs text-white placeholder-white/30 border border-white/10 rounded-lg py-2 pl-3 pr-8 outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleProbe()}
          />
          <button 
            onClick={handleProbe}
            disabled={isProbing || !url}
            className="absolute right-1 top-1 bottom-1 px-2 flex items-center justify-center text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-colors"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-2 rounded-lg border border-green-500/20">
          <CheckCircle2 size={14} />
          <span className="text-[10px] font-mono">ADN Extrait & Verrouillé.</span>
        </div>
      )}

      {isProbing && (
        <div className="mt-2 flex flex-col gap-1">
          <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-1/3 animate-[pulse_1s_ease-in-out_infinite] rounded-full" />
          </div>
          <span className="text-[9px] text-blue-400/60 font-mono text-center">Interrogation du moteur V8 en cours...</span>
        </div>
      )}
    </div>
  );
};