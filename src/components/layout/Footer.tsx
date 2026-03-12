// CHEMIN: src/components/layout/Footer.tsx
import Link from 'next/link'
import { Activity } from 'lucide-react'

const LINKS = [
  { label: 'Architecture', href: '/#features' },
  { label: 'Moteur IA', href: '/#pipeline' },
  { label: 'Licences', href: '/pricing' },
  { label: 'Workspace', href: '/dashboard' },
  { label: 'Conditions', href: '/terms' },
  { label: 'Confidentialité', href: '/privacy' },
] as const

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#030303] z-10 relative mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6">
        
        {/* Marque & Logo Carbone */}
        <div className="flex items-center gap-4">
          <div 
            className="w-8 h-8 rounded-lg bg-[#121212] border border-white/[0.12] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.03)]"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-lg leading-none">O</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-heading font-semibold text-white tracking-wide">
              Primus
            </span>
            <span className="text-[10px] text-[#666666] font-mono tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Engine 3.1 Pro Actif
            </span>
          </div>
        </div>

        {/* Liens de navigation */}
        <nav 
          className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4"
          aria-label="Navigation de pied de page"
        >
          {LINKS.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors focus:outline-none"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright & System Info */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-[11px] text-[#666666] font-mono uppercase tracking-widest">
            © {new Date().getFullYear()} O-Primus
          </p>
          <p className="text-[10px] text-[#444444] font-mono flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> All systems nominal
          </p>
        </div>
      </div>
    </footer>
  )
}