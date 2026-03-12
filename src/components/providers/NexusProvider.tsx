'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SotyProbeData } from '@/lib/contracts/soty-probe';

export type AgentState = 'idle' | 'observing' | 'thinking' | 'acting' | 'error';

interface NexusContextType {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
  
  agentState: AgentState;
  setAgentState: (state: AgentState) => void;
  agentLogs: string[];
  addAgentLog: (log: string) => void;

  canvasHtml: string;
  setCanvasHtml: (html: string) => void;
  
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;

  // 🔴 NOUVEAU : État d'activation du Pont Neural
  isSelectionMode: boolean;
  setIsSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;

  sotyProbeData: SotyProbeData | null;
  setSotyProbeData: (data: SotyProbeData | null) => void;
  isProbing: boolean;
  setIsProbing: (status: boolean) => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export function NexusProvider({ children }: { children: ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [canvasHtml, setCanvasHtml] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 🔴 NOUVEAU : Mode sélection désactivé par défaut
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  const [sotyProbeData, setSotyProbeData] = useState<SotyProbeData | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  const addAgentLog = (log: string) => {
    setAgentLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev]);
  };

  return (
    <NexusContext.Provider
      value={{
        currentUrl, setCurrentUrl,
        agentState, setAgentState,
        agentLogs, addAgentLog,
        canvasHtml, setCanvasHtml,
        selectedNodeId, setSelectedNodeId,
        isSelectionMode, setIsSelectionMode, // 🔴 INJECTÉ
        sotyProbeData, setSotyProbeData,
        isProbing, setIsProbing,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error('useNexus doit être utilisé à l\'intérieur d\'un NexusProvider');
  }
  return context;
}