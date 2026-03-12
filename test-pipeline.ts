import { runGenerationPipeline } from '@/agents/router'

async function test() {
  console.log('🚀 Test pipeline O-Primus...\n')
  
  const result = await runGenerationPipeline({
    prompt: 'Landing page pour une agence de design premium, style sombre et luxueux',
    style: 'dark-premium',
    includeThreeD: false,
    targetAudience: 'entreprises tech',
    animationIntensity: 'intense',
  })

  console.log('\n✅ Pipeline terminé')
  console.log('Status:', result.status)
  console.log('Fichiers générés:', Object.keys(result.files))
  console.log('Score qualité:', result.validationScore)
  console.log('\n--- EXTRAIT page.tsx (500 chars) ---')
  console.log(result.files['page.tsx'].slice(0, 500))
}

test().catch(console.error)
