// CHEMIN: src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  shape?: 'default' | 'pill'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', shape = 'default', isLoading, children, disabled, ...props }, ref) => {
    
    // Base mécanique : Transition rapide, aucune élévation fantaisiste
    const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 ease-out focus:outline-none disabled:opacity-30 disabled:pointer-events-none will-change-transform'
    
    const shapeClasses = shape === 'pill' ? 'rounded-full' : 'rounded-[8px]'

    const sizeClasses = {
      sm: 'h-8 px-4 text-[12px]',
      md: 'h-10 px-5 text-[13px]',
      lg: 'h-12 px-6 text-[14px]',
    }[size]

    // Matrice de contraste stricte et chirurgicale
    const variantClasses = {
      // PRIMARY: Blanc pur mat, mécanique, zéro halo, assombrissement technique au survol.
      primary: 'bg-white text-black hover:bg-[#E0E0E0] active:bg-[#CCCCCC] active:scale-[0.98] border border-transparent',
      
      // SECONDARY: Verre fumé Carbone profond avec bordure subtile
      secondary: 'bg-white/[0.02] text-white border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-[0.98]',
      
      // GHOST: Furtif, couleur secondaire
      ghost: 'bg-transparent text-[#A0A0A0] hover:text-white hover:bg-white/[0.04] active:scale-[0.98]',
      
      // DANGER: Sémantique vitale
      danger: 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444] hover:text-white active:scale-[0.98]',
    }[variant]

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${shapeClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />}
        <span className="truncate relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )
  }
)
Button.displayName = 'Button'