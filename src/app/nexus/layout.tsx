import type { Metadata } from 'next';
import { NexusProvider } from '@/components/providers/NexusProvider'; // <--- AJOUT

export const metadata: Metadata = {
  title: 'NEXUS | Awwwards Workspace',
  description: 'Deep Tech Generative Environment',
};

export default function NexusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-transparent text-neutral-300 font-sans overflow-hidden flex">
      {/* On enveloppe tout le Nexus dans le Provider */}
      <NexusProvider>
        {children}
      </NexusProvider>
    </div>
  );
}