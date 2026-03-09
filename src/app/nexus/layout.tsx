import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEXUS | Awwwards Workspace',
  description: 'Deep Tech Generative Environment',
};

export default function NexusLayout({ children }: { children: React.ReactNode }) {
  return (
    // Le z-[9999] et fixed inset-0 garantissent que ce layout passe par-dessus
    // n'importe quel header ou footer global que tu pourrais avoir dans ton layout.tsx racine.
    <div className="fixed inset-0 z-[9999] bg-[#050505] text-neutral-300 font-sans overflow-hidden flex">
      {children}
    </div>
  );
}