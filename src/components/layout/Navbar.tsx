// CHEMIN: src/components/layout/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useQuota } from '@/hooks/useQuota'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Activity, TerminalSquare } from 'lucide-react'

export function Navbar() {
  const { isAuthenticated, user, signIn, signOut } = useAuth()
  const { quota, canGenerate } = useQuota()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 20)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className={`flex items-center justify-between w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-[16px] ${
            isScrolled 
              ? 'premium-glass px-6 py-3' 
              : 'bg-transparent border-transparent px-2'
          }`}
        >
          {/* LOGO : O-Primus Signature Titane */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group cursor-pointer focus:outline-none rounded-lg outline-none" 
            aria-label="Accueil O-Primus"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="text-black font-bold text-xl leading-none">O</span>
            </div>
            <span className="text-lg font-heading font-semibold text-metal tracking-wide">
              Primus
            </span>
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigation principale">
            <Link href="/#features" className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors focus:outline-none">
              Architecture
            </Link>
            <Link href="/#pipeline" className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors focus:outline-none flex items-center gap-2">
              Moteur IA <Badge status="neutral">v3.1</Badge>
            </Link>
            <Link href="/pricing" className="text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors focus:outline-none">
              Licences
            </Link>
          </nav>

          {/* ACTIONS & AUTHENTIFICATION */}
          <div className="flex items-center gap-4">
            
            {/* BADGE QUOTA (Si connecté) */}
            {isAuthenticated && quota && (
              <div className="hidden sm:block">
                <Badge status={canGenerate ? 'processing' : 'error'} aria-label={`Quota: ${quota.generationsUsed} sur ${quota.generationsLimit}`}>
                  {quota.generationsUsed}/{quota.generationsLimit} ACTIFS
                </Badge>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" tabIndex={-1}>
                  <Button variant="primary" size="sm">
                    <TerminalSquare className="w-3.5 h-3.5" /> Workspace
                  </Button>
                </Link>
                
                <button 
                  onClick={() => signOut()} 
                  aria-label="Se déconnecter" 
                  title="Se déconnecter"
                  className="w-8 h-8 rounded-full overflow-hidden border border-white/[0.15] hover:border-white/[0.4] transition-all duration-300 cursor-pointer shrink-0 focus:outline-none hover:scale-105 will-change-transform"
                >
                  {user?.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.image} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-[#121212] text-white flex items-center justify-center text-[11px] font-bold font-mono">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => signIn('google')} 
                  className="hidden sm:block text-[13px] font-medium text-[#A0A0A0] hover:text-white transition-colors focus:outline-none"
                >
                  S'identifier
                </button>
                <Link href="/auth" tabIndex={-1}>
                  <Button variant="primary" size="sm">
                    <Activity className="w-3.5 h-3.5" /> Initialiser
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  )
}