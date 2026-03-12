/**
 * ============================================================================
 * CONTRAT DE DONNÉES : NEXUS BENCHMARK
 * ============================================================================
 * Contrat canonique des runs de benchmark Nexus.
 * Ce contrat ne dépend pas de Firecrawl uniquement : il définit le langage
 * interne de Nexus pour stocker, lire, comparer et enrichir un run.
 */

export const NEXUS_BENCHMARK_PHASES = [
  'collection',
  'visual_analysis',
  'runtime_analysis',
  'blueprint',
] as const;

export type NexusBenchmarkPhase = typeof NEXUS_BENCHMARK_PHASES[number];

export const NEXUS_BENCHMARK_PHASE_STATUS = [
  'pending',
  'running',
  'done',
  'error',
  'skipped',
] as const;

export type NexusBenchmarkPhaseStatus =
  typeof NEXUS_BENCHMARK_PHASE_STATUS[number];

export const NEXUS_BENCHMARK_COLLECTORS = [
  'firecrawl',
  'native-browser',
  'gemini-computer-use',
  'manual-import',
] as const;

export type NexusBenchmarkCollector =
  typeof NEXUS_BENCHMARK_COLLECTORS[number];

export const NEXUS_BENCHMARK_FAMILIES = [
  'unknown',
  'saas-marketing',
  'pricing',
  'docs',
  'ecommerce',
  'portfolio',
  'media',
  'blog',
  'web-app',
  'motion-showcase',
  'luxury-brand',
] as const;

export type NexusBenchmarkFamily =
  typeof NEXUS_BENCHMARK_FAMILIES[number];

export const NEXUS_PAGE_TYPE_GUESSES = [
  'unknown',
  'homepage',
  'landing-page',
  'pricing-page',
  'product-page',
  'category-page',
  'documentation-page',
  'dashboard-page',
  'article-page',
  'collection-page',
  'interactive-showcase',
] as const;

export type NexusPageTypeGuess = typeof NEXUS_PAGE_TYPE_GUESSES[number];

export interface NexusBenchmarkToolchain {
  collector: NexusBenchmarkCollector;
  visualReader: string | null;
  runtimeReader: string | null;
  compiler: string | null;
}

export interface NexusBenchmarkStatusMap {
  collection: NexusBenchmarkPhaseStatus;
  visual_analysis: NexusBenchmarkPhaseStatus;
  runtime_analysis: NexusBenchmarkPhaseStatus;
  blueprint: NexusBenchmarkPhaseStatus;
}

export interface NexusBenchmarkCoverage {
  textual: boolean;
  structural: boolean;
  visual: boolean;
  runtime: boolean;
  interactiveStates: boolean;
  motion: boolean;
}

export interface NexusBenchmarkFileIndex {
  request: string[];
  raw: string[];
  collected: string[];
  visual: string[];
  runtime: string[];
  blueprint: string[];
  notes: string[];
}

export interface NexusBenchmarkViewport {
  width: number;
  height: number;
}

export interface NexusBenchmarkSourceDocument {
  url: string;
  sourceDomain: string;
  label: string;
  benchmarkFamily: NexusBenchmarkFamily;
  pageTypeGuess: NexusPageTypeGuess;
  pageGoalGuess: string;
  testObjective: string;
  viewport: NexusBenchmarkViewport;
  deviceProfile: string;
  locale: string;
  notes: string[];
}

export interface NexusCollectedOutputSnapshot {
  markdown?: string;
  summary?: string;
  html?: string;
  rawHtml?: string;
  cleanedHtml?: string;
  links?: string[];
  images?: string[];
  videos?: string[];
  metadata?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  extraction?: Record<string, unknown>;
  screenshotUrl?: string;
}

export interface NexusVisualAnalysisSnapshot {
  pageRegions: string[];
  sectionOrder: string[];
  layoutModel: Record<string, unknown>;
  designTokens: Record<string, unknown>;
  componentCandidates: Array<Record<string, unknown>>;
  visualDensity: string | null;
  styleSignature: Record<string, unknown>;
}

export interface NexusRuntimeAnalysisSnapshot {
  interactionStates: Array<Record<string, unknown>>;
  scrollPhases: Array<Record<string, unknown>>;
  stickyElements: Array<Record<string, unknown>>;
  motionHypotheses: Array<Record<string, unknown>>;
  uncertainBehaviors: Array<Record<string, unknown>>;
  missingRuntimeData: string[];
}

export interface NexusBlueprintSnapshot {
  pageTree: Record<string, unknown>;
  components: Array<Record<string, unknown>>;
  assets: Array<Record<string, unknown>>;
  responsiveRules: Record<string, unknown>;
  compileStrategy: Record<string, unknown>;
  ragEnhancementTargets: string[];
}

export interface NexusBenchmarkConfidenceMap {
  structure: number;
  visual: number;
  runtime: number;
  compileReadiness: number;
}

export interface NexusBenchmarkManifest {
  runId: string;
  createdAt: string;
  updatedAt: string;
  sourceUrl: string;
  sourceDomain: string;
  label: string;
  benchmarkFamily: NexusBenchmarkFamily;
  goal: string;
  collector: NexusBenchmarkCollector;
  tools: NexusBenchmarkToolchain;
  status: NexusBenchmarkStatusMap;
  files: NexusBenchmarkFileIndex;
  coverage: NexusBenchmarkCoverage;
  completenessScore: number;
  nextStep: NexusBenchmarkPhase | 'completed';
  errorMessage: string | null;
}

export interface NexusBenchmarkRunDocument {
  meta: {
    runId: string;
    sourceUrl: string;
    domain: string;
    createdAt: string;
    pageFamily: NexusBenchmarkFamily;
    pageTypeGuess: NexusPageTypeGuess;
    pageGoal: string;
    collector: NexusBenchmarkCollector;
  };
  collection: NexusCollectedOutputSnapshot;
  visualAnalysis: NexusVisualAnalysisSnapshot;
  runtimeAnalysis: NexusRuntimeAnalysisSnapshot;
  blueprint: NexusBlueprintSnapshot;
  confidence: NexusBenchmarkConfidenceMap;
}

export interface CreateNexusBenchmarkManifestInput {
  sourceUrl: string;
  benchmarkFamily?: NexusBenchmarkFamily;
  pageTypeGuess?: NexusPageTypeGuess;
  goal: string;
  label?: string;
  collector?: NexusBenchmarkCollector;
  locale?: string;
  viewport?: Partial<NexusBenchmarkViewport>;
  deviceProfile?: string;
  sourceNotes?: string[];
  pageGoalGuess?: string;
}

export function createEmptyBenchmarkStatusMap(): NexusBenchmarkStatusMap {
  return {
    collection: 'pending',
    visual_analysis: 'pending',
    runtime_analysis: 'pending',
    blueprint: 'pending',
  };
}

export function createEmptyBenchmarkCoverage(): NexusBenchmarkCoverage {
  return {
    textual: false,
    structural: false,
    visual: false,
    runtime: false,
    interactiveStates: false,
    motion: false,
  };
}

export function createEmptyBenchmarkFileIndex(): NexusBenchmarkFileIndex {
  return {
    request: [],
    raw: [],
    collected: [],
    visual: [],
    runtime: [],
    blueprint: [],
    notes: [],
  };
}

export function createEmptyVisualAnalysisSnapshot(): NexusVisualAnalysisSnapshot {
  return {
    pageRegions: [],
    sectionOrder: [],
    layoutModel: {},
    designTokens: {},
    componentCandidates: [],
    visualDensity: null,
    styleSignature: {},
  };
}

export function createEmptyRuntimeAnalysisSnapshot(): NexusRuntimeAnalysisSnapshot {
  return {
    interactionStates: [],
    scrollPhases: [],
    stickyElements: [],
    motionHypotheses: [],
    uncertainBehaviors: [],
    missingRuntimeData: [],
  };
}

export function createEmptyBlueprintSnapshot(): NexusBlueprintSnapshot {
  return {
    pageTree: {},
    components: [],
    assets: [],
    responsiveRules: {},
    compileStrategy: {},
    ragEnhancementTargets: [],
  };
}

export function createEmptyConfidenceMap(): NexusBenchmarkConfidenceMap {
  return {
    structure: 0,
    visual: 0,
    runtime: 0,
    compileReadiness: 0,
  };
}