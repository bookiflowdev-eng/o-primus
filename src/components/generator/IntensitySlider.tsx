'use client'

interface IntensitySliderProps {
  value: 'subtle' | 'moderate' | 'intense'
  onChange: (value: 'subtle' | 'moderate' | 'intense') => void
}

const OPTIONS = [
  { id: 'subtle', label: 'Subtile', icon: '✨' },
  { id: 'moderate', label: 'Modérée', icon: '🌊' },
  { id: 'intense', label: 'Intense', icon: '🚀' },
] as const

export function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  return (
    <div className="flex flex-col gap-4">
      <label 
        id="intensity-slider-label"
        className="text-sm font-semibold uppercase tracking-widest text-slate-400"
      >
        Cinématique GSAP
      </label>
      
      <div 
        className="flex items-center p-1.5 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden h-[52px]" 
        role="radiogroup"
        aria-labelledby="intensity-slider-label"
      >
        {OPTIONS.map((option) => {
          const isActive = value === option.id
          
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all duration-300 relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive 
                  ? 'text-black shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Fond actif animé indépendamment pour un effet "pill" glissant (simulé par le bg sur l'élément lui-même pour la robustesse) */}
              {isActive && (
                <span className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]" aria-hidden="true" />
              )}
              
              <span aria-hidden="true" className={isActive ? 'scale-110 transition-transform' : ''}>
                {option.icon}
              </span>
              <span className="hidden sm:inline">
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}