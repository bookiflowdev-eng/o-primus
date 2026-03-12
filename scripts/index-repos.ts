// CHEMIN_DU_FICHIER: scripts/index-repos.ts
// ACTION: UPDATE
// RAISON: Utilisation d'un Import Dynamique pour contourner le Hoisting ESM et garantir que le .env.local est lu AVANT l'initialisation de Supabase.

import * as fs from 'fs'
import * as path from 'path'
import { globSync } from 'glob'
import { loadEnvConfig } from '@next/env'

// 1. CHARGEMENT DES VARIABLES D'ENVIRONNEMENT AVANT TOUT LE RESTE
const projectDir = process.cwd()
loadEnvConfig(projectDir)

const LIBRARY_DIR = path.join(process.cwd(), 'library/repos')
const SKIPPED_REPOS = ['theatre-js__theatre', 'pmndrs__drei', 'motion-canvas']

function chunkCode(code: string, maxLength = 1500): string[] {
  const chunks: string[] = []
  let currentChunk = ""
  const lines = code.split('\n')

  for (const line of lines) {
    if (currentChunk.length + line.length > maxLength) {
      chunks.push(currentChunk)
      currentChunk = line + '\n'
    } else {
      currentChunk += line + '\n'
    }
  }
  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

async function main() {
  // 2. IMPORT DYNAMIQUE (C'est la clé : on charge Supabase SEULEMENT APRÈS le .env.local)
  const { indexUIChunks } = await import('../src/lib/rag-unified')

  console.log("🚀 Lancement de l'Indexeur O-Primus Apex...")

  if (!fs.existsSync(LIBRARY_DIR)) {
    console.error("❌ Dossier library/repos introuvable. Lance 'npm run clone-repos' d'abord.")
    return
  }

  const repos = fs.readdirSync(LIBRARY_DIR).filter(f => fs.statSync(path.join(LIBRARY_DIR, f)).isDirectory())

  for (const repo of repos) {
    if (SKIPPED_REPOS.includes(repo)) {
      console.log(`⏭️  Skip du repo massif : ${repo}`)
      continue
    }

    console.log(`\n📦 Analyse de : ${repo}`)
    const repoPath = path.join(LIBRARY_DIR, repo)
    
    const files = globSync('**/*.{ts,tsx,js,jsx}', { cwd: repoPath, ignore: ['**/node_modules/**', '**/dist/**', '**/tests/**'] })
    
    let repoChunks = []
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(repoPath, file), 'utf-8')
      if (content.trim().length < 50) continue 

      const chunks = chunkCode(content)
      for (const chunk of chunks) {
        repoChunks.push({
          content: chunk,
          category: repo.includes('three') || repo.includes('drei') ? 'webgl' : 
                    repo.includes('lenis') || repo.includes('scroll') ? 'scroll' : 
                    repo.includes('ui') || repo.includes('primitives') ? 'components' : 'animation',
          source: `${repo}/${file}`
        })
      }
    }

    if (repoChunks.length > 0) {
      console.log(`🧠 Envoi de ${repoChunks.length} vecteurs vers ui_chunks pour ${repo}...`)
      for (let i = 0; i < repoChunks.length; i += 50) {
        const batch = repoChunks.slice(i, i + 50)
        await indexUIChunks(batch as any)
      }
    } else {
      console.log(`⚠️  Aucun code pertinent trouvé dans ${repo}`)
    }
  }

  console.log("\n✅ Indexation Totale Terminée !")
}

main().catch(console.error)