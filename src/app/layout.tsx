// CHEMIN: src/app/layout.tsx
// ACTION: UPDATE
// RAISON: Injection de l'ADN Visuel O-Primus (Design Tokens, Métadonnées Premium, Résolution conflit Scroll).

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import '@/app/globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'O-Primus | AI Architecture Orchestrator',
  description: 'Environnement d\'ingénierie spatiale et web de classe mondiale. Propulsé par l\'intelligence artificielle.',
  applicationName: 'O-Primus',
  authors: [{ name: 'O-Primus Engineering' }],
  creator: 'O-Primus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0C', // Obsidienne profonde alignée sur --color-background
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Bloque le zoom mobile indésirable pour un ressenti "Application Native"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body 
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          font-sans 
          antialiased 
          min-h-screen 
          flex 
          flex-col 
          selection:bg-[var(--color-accent)]/30 
          selection:text-white
          relative
        `}
      >
        {/* Calque de texture organique (Noise) connecté à l'utilitaire global */}
        <div className="fixed inset-0 pointer-events-none z-[-1] bg-noise" aria-hidden="true" />
        
        <SmoothScrollProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SmoothScrollProvider>
        
      </body>
    </html>
  )
}