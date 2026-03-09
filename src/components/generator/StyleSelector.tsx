'use client'

import { Card } from '@/components/ui/Card'
import { STYLES_CONFIG } from '@/config/styles.config'

interface StyleSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <label 
        id="style-selector-label"
        className="text-sm font-semibold uppercase tracking-widest text-slate-400"
      >
        Architecture Visuelle
      </label>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="radiogroup"
        aria-labelledby="style-selector-label"
      >
        {STYLES_CONFIG.map((style) => {
          const isActive = value === style.id
          
          return (
            <Card
              key={style.id}
              interactive
              onClick={() => onChange(style.id)}
              className={`p-5 cursor-pointer border transition-all duration-300 group ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.02]'
                  : 'border-white/5 opacity-70 hover:opacity-100 bg-[#12121a]'
              }`}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onChange(style.id)
                }
              }}
            >
              <div className="flex items-start gap-4">
                <span 
                  className={`text-2xl flex-shrink-0 mt-0.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                  aria-hidden="true"
                >
                  {style.emoji}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h4 className={`text-sm font-semibold transition-colors ${isActive ? 'text-indigo-300' : 'text-white'}`}>
                    {style.label}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {style.shortDesc}
                  </p>
                  <p className="text-[10px] text-indigo-400/80 font-mono mt-1">
                    {style.estimatedValue}
                  </p>
                </div>
              </div>
              
              {/* Indicateur de sélection visuel (pour l'accessibilité et le design) */}
              <div 
                className={`absolute top-4 right-4 w-4 h-4 rounded-full border-2 transition-colors duration-300 flex items-center justify-center ${
                  isActive ? 'border-indigo-400' : 'border-white/10'
                }`}
                aria-hidden="true"
              >
                {isActive && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}