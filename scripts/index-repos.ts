import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import simpleGit from 'simple-git'
import { glob } from 'glob'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { REPOS_TO_INDEX, type RepoConfig } from './repos.config'

// ─── INIT ────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' })

const REPOS_DIR = path.join(process.cwd(), '.repos-cache')
const CHUNK_SIZE = 120 // lignes max par chunk
const CHUNK_OVERLAP = 20 // lignes de chevauchement pour contexte

// ─── UTILS ───────────────────────────────────────────────────────────────────

function chunkCode(content: string, filePath: string): string[] {
  const lines = content.split('\n')
  const chunks: string[] = []

  // Skip les fichiers trop petits (< 10 lignes)
  if (lines.length < 10) return []

  // Skip les fichiers trop lourds (> 2000 lignes — probablement un bundle)
  if (lines.length > 2000) return []

  for (let i = 0; i < lines.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
    const chunk = lines.slice(i, i + CHUNK_SIZE).join('\n').trim()
    if (chunk.length > 100) { // skip les chunks vides
      chunks.push(chunk)
    }
  }

  return chunks
}

async function getEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

function buildChunkDescription(
  snippet: string,
  filePath: string,
  repoName: string,
  category: string
): string {
  // Description sémantique pour améliorer la qualité de la recherche
  const fileName = path.basename(filePath)
  const ext = path.extname(filePath)
  const langMap: Record<string, string> = {
    '.tsx': 'React TypeScript component',
    '.ts': 'TypeScript module',
    '.js': 'JavaScript module',
    '.jsx': 'React JavaScript component',
    '.glsl': 'GLSL shader',
    '.scss': 'SCSS styles',
    '.css': 'CSS styles',
  }
  const lang = langMap[ext] ?? 'code'

  // Détection de patterns clés
  const hasGSAP = snippet.includes('gsap') || snippet.includes('ScrollTrigger')
  const hasLenis = snippet.includes('Lenis') || snippet.includes('lenis')
  const hasR3F = snippet.includes('@react-three') || snippet.includes('useFrame') || snippet.includes('<Canvas')
  const hasAnimation = snippet.includes('animation') || snippet.includes('transition') || snippet.includes('keyframe')
  const hasHook = snippet.includes('use') && snippet.includes('export')

  const tags: string[] = [category, lang]
  if (hasGSAP) tags.push('GSAP ScrollTrigger animation')
  if (hasLenis) tags.push('Lenis smooth scroll')
  if (hasR3F) tags.push('React Three Fiber 3D')
  if (hasAnimation) tags.push('CSS animation')
  if (hasHook) tags.push('React hook')

  return `[${repoName}] ${fileName} — ${tags.join(', ')}`
}

// ─── CORE ─────────────────────────────────────────────────────────────────────

async function cloneOrUpdateRepo(repo: RepoConfig): Promise<string> {
  const repoDir = path.join(REPOS_DIR, repo.name)

  if (!fs.existsSync(REPOS_DIR)) {
    fs.mkdirSync(REPOS_DIR, { recursive: true })
  }

  const git = simpleGit()

  if (fs.existsSync(repoDir)) {
    console.log(`  ↻ Mise à jour de ${repo.name}...`)
    await simpleGit(repoDir).pull()
  } else {
    console.log(`  ↓ Clonage de ${repo.name}...`)
    await git.clone(repo.url, repoDir, ['--depth', '1'])
  }

  return repoDir
}

async function indexRepo(repo: RepoConfig): Promise<number> {
  console.log(`\n▶ Indexation de ${repo.name} (weight: ${repo.weight})`)

  const repoDir = await cloneOrUpdateRepo(repo)

  // Récupération des fichiers matching les globs
  const files: string[] = []
  for (const pattern of repo.includeGlobs) {
    const matches = await glob(pattern, {
      cwd: repoDir,
      ignore: repo.excludeGlobs,
      absolute: true,
    })
    files.push(...matches)
  }

  console.log(`  📁 ${files.length} fichiers trouvés`)

  let chunksIndexed = 0
  const BATCH_SIZE = 10 // traitement par batch pour éviter rate limit

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (filePath) => {
        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const relativePath = path.relative(repoDir, filePath)
          const chunks = chunkCode(content, filePath)

          for (let ci = 0; ci < chunks.length; ci++) {
            const snippet = chunks[ci]
            const chunkId = `${repo.name}::${relativePath}::${ci}`
            const description = buildChunkDescription(snippet, filePath, repo.name, repo.category)

            // Embedding du texte combiné (description + snippet) pour meilleure précision
            const textToEmbed = `${description}\n\n${snippet}`
            const embedding = await getEmbedding(textToEmbed)

            const { error } = await supabase.from('repo_chunks').upsert({
              id: chunkId,
              repo_name: repo.name,
              file_path: relativePath,
              code_snippet: snippet,
              description,
              embedding,
            }, { onConflict: 'id' })

            if (error) {
              console.error(`  ✗ Erreur chunk ${chunkId}: ${error.message}`)
            } else {
              chunksIndexed++
            }

            // Rate limit protection — 1 500 req/min max Gemini embeddings
            await new Promise(r => setTimeout(r, 40))
          }
        } catch (err) {
          // Skip les fichiers illisibles (binaires, etc.)
        }
      })
    )

    const progress = Math.round(((i + BATCH_SIZE) / files.length) * 100)
    process.stdout.write(`\r  ⟳ Progression: ${Math.min(progress, 100)}% (${chunksIndexed} chunks)`)
  }

  console.log(`\n  ✓ ${repo.name} — ${chunksIndexed} chunks indexés`)
  return chunksIndexed
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 O-Primus RAG Indexer — Démarrage\n')
  console.log(`📦 ${REPOS_TO_INDEX.length} repos à indexer\n`)

  // Vérification des env vars
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY']
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`✗ Variable d'environnement manquante: ${key}`)
      process.exit(1)
    }
  }

  let totalChunks = 0

  for (const repo of REPOS_TO_INDEX) {
    try {
      const count = await indexRepo(repo)
      totalChunks += count
    } catch (err) {
      console.error(`\n✗ Erreur sur ${repo.name}:`, err)
    }
  }

  console.log(`\n\n✅ Indexation terminée — ${totalChunks} chunks total dans Supabase`)
  console.log('🧠 Le pipeline RAG est prêt à fonctionner.')
}

main().catch(console.error)
