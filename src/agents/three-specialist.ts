import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerationRequest } from '@/types/generation'
import type { DesignSpec, ThreeScene } from '@/types/agent'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' })

export async function runThreeSpecialist(
  request: GenerationRequest,
  designSpec: DesignSpec,
  ragContext?: string
): Promise<ThreeScene> {
  const palette = designSpec.colorPalette ?? ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd']

  return {
    sceneCode: `import { Canvas } from '@react-three/fiber'\nimport { Float, Environment } from '@react-three/drei'\nexport function Scene() {\n  return (\n    <Canvas camera={{ position: [0, 0, 5] }}>\n      <Environment preset="city" />\n      <Float speed={2}>\n        <mesh>\n          <icosahedronGeometry args={[1, 4]} />\n          <meshStandardMaterial color="${palette[0]}" wireframe />\n        </mesh>\n      </Float>\n    </Canvas>\n  )\n}`,
    shaders: [],
    lights: ['<ambientLight intensity={0.5} />', `<pointLight position={[10, 10, 10]} color="${palette[1]}" />`],
    cameraConfig: '{ position: [0, 0, 5], fov: 75 }',
    performanceTier: 'medium',
  }
}
