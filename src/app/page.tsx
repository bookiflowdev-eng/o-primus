// CHEMIN: src/app/page.tsx
// ACTION: UPDATE
// RAISON: O-Primus Apex Inviolable. Esthétique Deep Tech, Animations GSAP SOTY, Architecture DOM verrouillée (zéro Layout Shift).

'use client'

import { useRef, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

// ----------------------------------------------------------------------
// MICRO-COMPOSANTS & HOOKS D'ÉLITE
// ----------------------------------------------------------------------

// 1. Décodage Cryptographique (Scramble Text)
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>'
function ScrambleText({ text, triggerHover = false }: { text: string, triggerHover?: boolean }) {
  const [displayText, setDisplayText] = useState(triggerHover ? text : '')
  const isScrambling = useRef(false)

  const scramble = () => {
    if (isScrambling.current) return
    isScrambling.current = true
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(text.split('').map((letter, index) => {
        if (index < iteration) return text[index]
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join(''))
      
      if (iteration >= text.length) {
        clearInterval(interval)
        isScrambling.current = false
      }
      iteration += 1 / 3 // Vitesse lissée
    }, 30)
  }

  useEffect(() => {
    if (!triggerHover) scramble()
  }, [])

  return (
    <span onMouseEnter={triggerHover ? scramble : undefined} className="inline-block whitespace-nowrap">
      {displayText}
    </span>
  )
}

// 2. Bouton Magnétique avec Hitbox (Zéro casse DOM)
function MagneticButton({ children, href }: { children: ReactNode, href: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const btn = buttonRef.current
    const txt = textRef.current
    if (!btn || !txt) return

    const xToBtn = gsap.quickTo(btn, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const yToBtn = gsap.quickTo(btn, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const xToTxt = gsap.quickTo(txt, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' })
    const yToTxt = gsap.quickTo(txt, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' })

    const handleMouseMove = (e: MouseEvent) => {
      // Calcul relatif au parent direct (la Hitbox)
      const rect = btn.parentElement?.getBoundingClientRect()
      if (!rect) return
      
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      
      xToBtn(x * 0.4)
      yToBtn(y * 0.4)
      xToTxt(x * 0.15)
      yToTxt(y * 0.15)
    }

    const handleMouseLeave = () => {
      xToBtn(0); yToBtn(0); xToTxt(0); yToTxt(0)
    }

    const parent = btn.parentElement
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
      parent.addEventListener('mouseleave', handleMouseLeave)
      return () => {
        parent.removeEventListener('mousemove', handleMouseMove)
        parent.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return (
    <Link href={href} tabIndex={-1} className="contents">
      {/* Le bouton est en absolute pour bouger librement à l'intérieur de sa hitbox parente */}
      <button ref={buttonRef} className="absolute inline-flex items-center justify-center px-10 py-5 bg-text-primary text-background font-mono text-xs uppercase tracking-widest rounded-sm focus:outline-none shadow-[0_0_30px_rgba(255,255,255,0.1)] will-change-transform hover:scale-105 transition-transform duration-300">
        <span ref={textRef} className="flex items-center gap-4 pointer-events-none will-change-transform">
          {children}
          <span className="w-1.5 h-1.5 bg-background rounded-full" />
        </span>
      </button>
    </Link>
  )
}

// ----------------------------------------------------------------------
// DATA : LE DAG O-PRIMUS
// ----------------------------------------------------------------------
const O_PRIMUS_DAG = [
  { id: "01", sys: "AGENT.PROFILER", task: "Analyse_Psychographique_&_Ton", status: "200", time: "12ms" },
  { id: "02", sys: "AGENT.STRATEGIST", task: "Génération_Tokens_Spatiaux", status: "200", time: "08ms" },
  { id: "03", sys: "AGENT.ARCHITECT", task: "Injection_Copywriting_Domaine", status: "200", time: "45ms" },
  { id: "04", sys: "AGENT.MOTION", task: "Calcul_Courbes_Bezier_GSAP", status: "200", time: "03ms" },
  { id: "05", sys: "AGENT.THREE", task: "Compilation_Shaders_GLSL", status: "200", time: "112ms" },
  { id: "06", sys: "AGENT.ORCHESTRATOR", task: "Assemblage_AST_NextJS_15", status: "200", time: "24ms" },
  { id: "07", sys: "AGENT.VALIDATOR", task: "Audit_WCAG_&_Anti-Hallucination", status: "200", time: "41ms" },
]

// ----------------------------------------------------------------------
// PAGE PRINCIPALE
// ----------------------------------------------------------------------
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // 1. Orbe (GPU Accelerated)
    gsap.to('.volumetric-orb', {
      xPercent: 5, yPercent: 5, scale: 1.05, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'
    })

    // 2. Cinématique Hero
    const tl = gsap.timeline({ defaults: { ease: 'var(--ease-out-expo)' } })
    tl.to('.grid-overlay', { opacity: 1, duration: 2, delay: 0.2 })
      .fromTo('.hero-word', { yPercent: 120, opacity: 0, rotateZ: 2 }, { yPercent: 0, opacity: 1, rotateZ: 0, duration: 1.4, stagger: 0.1 }, '-=1.5')
      .fromTo('.tech-data', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 1, stagger: 0.05 }, '-=1')

    // 3. Logs (ScrollTrigger)
    const logs = gsap.utils.toArray('.log-entry')
    logs.forEach((log: any) => {
      gsap.fromTo(log, { opacity: 0, y: 15 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'var(--ease-out-expo)',
        scrollTrigger: { trigger: log, start: 'top 95%' }
      })
    })

    // 4. Parallaxe de Grille Sécurisée
    const xToGrid = gsap.quickTo('.parallax-grid', 'x', { duration: 1.5, ease: 'power3.out' })
    const yToGrid = gsap.quickTo('.parallax-grid', 'y', { duration: 1.5, ease: 'power3.out' })

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      // Mouvement max de -30px à +30px pour éviter que le SVG ne sorte de l'écran
      xToGrid((e.clientX / innerWidth - 0.5) * -60)
      yToGrid((e.clientY / innerHeight - 0.5) * -60)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-white overflow-hidden font-sans">
      
      {/* COUCHE 0 : ISOLÉE DU DOM PRINCIPAL */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Orbe centrée à droite, isolée du flux */}
        <div className="volumetric-orb absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-accent opacity-[0.08] blur-[120px] mix-blend-screen will-change-transform" style={{ transform: 'translate3d(0,0,0)' }} />
        
        {/* Grille avec marges négatives larges (-10%) pour couvrir la parallaxe */}
        <div className="parallax-grid absolute inset-[-10%] opacity-0 will-change-transform" 
             style={{ 
               backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
               backgroundSize: '4rem 4rem',
               maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
               transform: 'translate3d(0,0,0)'
             }} 
        />
      </div>
      
      <Navbar />

      <main className="relative z-10 w-full flex flex-col pt-32 md:pt-40">
        
        {/* HERO SECTION : Typographie Mathématique */}
        <section className="w-full min-h-[85vh] px-6 md:px-12 lg:px-24 flex flex-col justify-center">
          
          <div className="tech-data flex flex-wrap items-center gap-4 md:gap-6 mb-8 md:mb-12 font-mono text-[10px] text-text-muted uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2 text-accent">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]" /> 
              O-PRIMUS ONLINE
            </span>
            <span className="hidden sm:inline">|</span>
            <span>DAG: 7 AGENTS</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">ENGINE: GEMINI 3.1 PRO</span>
          </div>

          {/* Typographie clamp() : Ne casse jamais sur mobile, géant sur desktop */}
          <h1 className="font-heading font-medium tracking-tighter leading-[0.85] text-[clamp(4rem,11vw,11rem)] text-text-primary max-w-[90vw]">
            <div className="overflow-hidden pb-2"><div className="hero-word">Intelligence</div></div>
            <div className="overflow-hidden pb-2"><div className="hero-word text-text-secondary">Spatiale.</div></div>
            <div className="overflow-hidden pb-4"><div className="hero-word">Zéro dette.</div></div>
          </h1>

          <div className="mt-12 md:mt-16 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <p className="tech-data text-sm md:text-base text-text-secondary leading-relaxed font-medium text-balance">
              O-Primus n'est pas un générateur de templates. C'est un orchestrateur déterministe qui forge des architectures React, des scènes WebGL et des cinématiques GSAP d'élite.
            </p>
            
            <div className="tech-data flex flex-col justify-start gap-4">
              <Link href="/dashboard" tabIndex={-1} className="w-fit group">
                <button className="relative inline-flex items-center justify-center gap-3 px-6 py-3 bg-surface text-text-primary font-mono text-xs uppercase tracking-widest border border-border-strong hover:bg-text-primary hover:text-background transition-colors duration-500 rounded-sm focus:outline-none">
                  Initialiser le Hub
                  <span className="font-serif italic lowercase tracking-normal text-text-muted group-hover:text-background transition-colors">-&gt;</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* LOGS D'EXÉCUTION */}
        <section className="w-full px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-border-subtle/50">
          <div className="max-w-5xl mx-auto md:mx-0">
            <div className="flex items-center gap-4 mb-12 md:mb-16 text-xs font-mono uppercase tracking-[0.2em] text-text-muted">
              <span>// Trace d'exécution du Graphe</span>
              <div className="h-px w-12 md:w-24 bg-border-strong" />
            </div>

            <div className="flex flex-col gap-2 font-mono text-[10px] md:text-xs">
              <div className="flex items-center justify-between py-2 text-text-muted/50 border-b border-border-subtle mb-4">
                <div className="w-8 md:w-12">N°</div>
                <div className="w-32 md:w-48 hidden sm:block">AGENT_ID</div>
                <div className="flex-1">TÂCHE_SPÉCIFIQUE</div>
                <div className="w-12 md:w-16 text-right">HTTP</div>
                <div className="w-16 md:w-20 text-right hidden sm:block">LATENCE</div>
              </div>

              {O_PRIMUS_DAG.map((log) => (
                <div key={log.id} className="log-entry group flex items-center justify-between py-3 md:py-4 border-b border-border-subtle/30 hover:bg-surface transition-colors cursor-crosshair">
                  <div className="w-8 md:w-12 text-text-muted group-hover:text-text-primary transition-colors">{log.id}</div>
                  <div className="w-32 md:w-48 text-accent/70 hidden sm:block group-hover:text-accent transition-colors">
                    {log.sys}
                  </div>
                  <div className="flex-1 text-text-secondary group-hover:text-text-primary transition-colors overflow-hidden text-ellipsis whitespace-nowrap pr-4">
                    <ScrambleText text={log.task} triggerHover={true} />
                  </div>
                  <div className="w-12 md:w-16 text-right text-emerald-400/80 group-hover:text-emerald-400 transition-colors">[{log.status}]</div>
                  <div className="w-16 md:w-20 text-right text-text-muted hidden sm:block">
                    <ScrambleText text={log.time} triggerHover={true} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL : Hitbox Magnétique Sécurisée */}
        <section className="w-full px-6 md:px-12 lg:px-24 py-32 md:py-48 border-t border-border-subtle/50 flex flex-col md:flex-row items-center md:items-end justify-between gap-12 md:gap-16 relative z-20">
          <h2 className="font-heading font-medium tracking-tighter leading-[0.9] text-[clamp(3rem,8vw,6rem)] max-w-3xl text-text-primary pointer-events-none text-center md:text-left">
            Forgez l'avenir de <br className="hidden md:block"/><span className="text-text-secondary">vos interfaces.</span>
          </h2>
          
          {/* HITBOX : Le secret pour ne pas casser le DOM. La taille est fixe. */}
          <div className="relative w-full md:w-80 h-32 flex items-center justify-center shrink-0"> 
            <MagneticButton href="/pricing">
              Accéder aux Licences
            </MagneticButton>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}