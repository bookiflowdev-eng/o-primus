import type {
  NexusBenchmarkFamily,
  NexusPageTypeGuess,
  NexusBenchmarkViewport,
} from '@/lib/contracts/nexus-benchmark';
import type {
  FirecrawlAction,
  FirecrawlFormat,
  FirecrawlJsonFormatDefinition,
  FirecrawlRequestPayload,
} from './types';

/**
 * ============================================================================
 * NEXUS BENCHMARK / FIRECRAWL / CONFIG
 * ============================================================================
 * Configuration centralisée du collecteur Firecrawl pour Nexus.
 * Ce fichier sert de source unique pour les defaults, le format JSON
 * d'extraction et la fabrique de payloads.
 */

export const NEXUS_BENCHMARK_STORAGE_ROOT = 'benchmarks/nexus';
export const NEXUS_BENCHMARK_DEFAULT_COLLECTOR = 'firecrawl' as const;

export const NEXUS_BENCHMARK_DEFAULT_VIEWPORT: NexusBenchmarkViewport = {
  width: 1440,
  height: 900,
};

export const NEXUS_BENCHMARK_DEFAULT_DEVICE_PROFILE = 'desktop-chrome';
export const NEXUS_BENCHMARK_DEFAULT_LOCALE = 'fr-FR';
export const NEXUS_BENCHMARK_DEFAULT_TIMEOUT_MS = 120_000;

export const NEXUS_BENCHMARK_DEFAULT_FAMILY: NexusBenchmarkFamily =
  'saas-marketing';

export const NEXUS_BENCHMARK_DEFAULT_PAGE_TYPE: NexusPageTypeGuess =
  'landing-page';

export const NEXUS_FIRECRAWL_JSON_EXTRACTION_PROMPT = `
Analyse cette page web au maximum et retourne une structure exploitable par Nexus avec les champs suivants :
- page_type
- page_goal
- major_sections
- calls_to_action
- forms
- navigation_items
- social_links
- pricing_blocks
- faq_items
- visual_observations
- interactive_elements
- possible_motion_hints
- assets_detected
- likely_framework_hints

Contraintes :
- ne pas inventer
- utiliser des tableaux quand plusieurs éléments existent
- rester strictement descriptif
- ne retourner que des données utiles à l'analyse de page
`.trim();

export const NEXUS_FIRECRAWL_JSON_FORMAT: FirecrawlJsonFormatDefinition = {
  type: 'json',
  prompt: NEXUS_FIRECRAWL_JSON_EXTRACTION_PROMPT,
};

export const NEXUS_FIRECRAWL_DEFAULT_FORMATS: FirecrawlFormat[] = [
  'markdown',
  'summary',
  'html',
  'rawHtml',
  'cleanedHtml',
  'links',
  'images',
  'videos',
  'metadata',
  'branding',
  'screenshot',
  NEXUS_FIRECRAWL_JSON_FORMAT,
];

export const NEXUS_FIRECRAWL_DEFAULT_ACTIONS: FirecrawlAction[] = [
  { type: 'wait', milliseconds: 2_000 },
  { type: 'scroll', direction: 'down' },
  { type: 'wait', milliseconds: 1_200 },
  { type: 'scroll', direction: 'down' },
  { type: 'wait', milliseconds: 1_200 },
  { type: 'scroll', direction: 'up' },
  { type: 'wait', milliseconds: 1_000 },
];

export interface BuildFirecrawlRequestPayloadInput {
  url: string;
  formats?: FirecrawlFormat[];
  actions?: FirecrawlAction[];
  timeout?: number;
  onlyMainContent?: boolean;
}

export function buildDefaultFirecrawlRequestPayload(
  input: BuildFirecrawlRequestPayloadInput
): FirecrawlRequestPayload {
  return {
    url: normalizeBenchmarkUrl(input.url),
    formats: input.formats ?? NEXUS_FIRECRAWL_DEFAULT_FORMATS,
    onlyMainContent: input.onlyMainContent ?? false,
    timeout: input.timeout ?? NEXUS_BENCHMARK_DEFAULT_TIMEOUT_MS,
    actions: input.actions ?? NEXUS_FIRECRAWL_DEFAULT_ACTIONS,
  };
}

export function normalizeBenchmarkUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('NEXUS_BENCHMARK_INVALID_URL_EMPTY');
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function extractDomainFromUrl(url: string): string {
  const normalized = normalizeBenchmarkUrl(url);

  try {
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    throw new Error(`NEXUS_BENCHMARK_INVALID_URL_DOMAIN: ${url}`);
  }
}

export function slugifyBenchmarkSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isFirecrawlJsonFormat(
  format: FirecrawlFormat
): format is FirecrawlJsonFormatDefinition {
  return typeof format === 'object' && format !== null && format.type === 'json';
}

export function getRunDirectoryRelativePath(runId: string): string {
  return `${NEXUS_BENCHMARK_STORAGE_ROOT}/${runId}`;
}

export function getStandardCollectedFilePaths(): string[] {
  return [
    'collected/markdown.md',
    'collected/summary.txt',
    'collected/html.html',
    'collected/rawHtml.html',
    'collected/cleanedHtml.html',
    'collected/links.json',
    'collected/images.json',
    'collected/videos.json',
    'collected/metadata.json',
    'collected/branding.json',
    'collected/extraction.json',
    'collected/screenshot.url.txt',
  ];
}