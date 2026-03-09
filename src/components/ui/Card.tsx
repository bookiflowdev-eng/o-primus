// CHEMIN: src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', interactive = false, padding = 'md', children, ...props }, ref) => {
    
    // Base: Utilisation du glass panel Carbone défini dans le globals.css
    const baseClasses = 'premium-glass rounded-[12px] overflow-hidden relative'
    
    // Interactif: Élévation magnétique sans changement de teinte (pur shadow/border)
    const interactiveClasses = interactive 
      ? 'cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.03)] active:scale-[0.99] active:translate-y-0 will-change-transform' 
      : ''
    
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-8',
      xl: 'p-10', // Laboratoire / Espaces de respiration
    }[padding]

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${interactiveClasses} ${paddingClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'