// CHEMIN: src/components/ui/Badge.tsx
import { HTMLAttributes, forwardRef } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  status?: 'neutral' | 'active' | 'processing' | 'success' | 'error' | 'warning'
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', status = 'neutral', children, ...props }, ref) => {
    
    // Base: Aérodynamique absolue (rounded-full)
    const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] leading-none uppercase tracking-[0.15em] font-medium border backdrop-blur-sm transition-colors duration-300'
    
    // Matrice Monochrome & Sémantique
    const statusConfig = {
      neutral: { 
        bg: 'bg-white/[0.02]', 
        text: 'text-[#A0A0A0]', 
        border: 'border-white/[0.06]', 
        dot: 'bg-[#444444]' 
      },
      active: { 
        bg: 'bg-white/[0.05]', 
        text: 'text-white', 
        border: 'border-white/[0.15] shadow-[0_0_15px_rgba(255,255,255,0.05)]', 
        dot: 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
      },
      processing: { 
        bg: 'bg-white/[0.02]', 
        text: 'text-[#E0E0E0]', 
        border: 'border-white/[0.08]', 
        dot: 'bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
      },
      success: { 
        bg: 'bg-[#22c55e]/10', 
        text: 'text-[#22c55e]', 
        border: 'border-[#22c55e]/20', 
        dot: 'bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.4)]' 
      },
      warning: { 
        bg: 'bg-[#f59e0b]/10', 
        text: 'text-[#f59e0b]', 
        border: 'border-[#f59e0b]/20', 
        dot: 'bg-[#f59e0b]' 
      },
      error: { 
        bg: 'bg-[#ef4444]/10', 
        text: 'text-[#ef4444]', 
        border: 'border-[#ef4444]/20', 
        dot: 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
      },
    }[status]

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${className}`}
        {...props}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConfig.dot}`} aria-hidden="true" />
        <span className="translate-y-[0.5px]">{children}</span> 
      </div>
    )
  }
)
Badge.displayName = 'Badge'