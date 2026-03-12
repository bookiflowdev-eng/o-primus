import type {
  NexusBenchmarkCollector,
  NexusBenchmarkFamily,
  NexusPageTypeGuess,
} from '@/lib/contracts/nexus-benchmark';

/**
 * ============================================================================
 * NEXUS BENCHMARK / FIRECRAWL / TYPES
 * ============================================================================
 * Types spécifiques au collecteur Firecrawl.
 * Le but ici est de typer précisément la requête brute, la réponse brute
 * et la normalisation intermédiaire avant passage au contrat Nexus.
 */

export const FIRECRAWL_STRING_FORMATS = [
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
] as const;

export type FirecrawlStringFormat = typeof FIRECRAWL_STRING_FORMATS[number];

export interface FirecrawlJsonFormatDefinition {
  type: 'json';
  prompt: string;
}

export type FirecrawlFormat =
  | FirecrawlStringFormat
  | FirecrawlJsonFormatDefinition;

export interface FirecrawlWaitAction {
  type: 'wait';
  milliseconds: number;
}

export interface FirecrawlScrollAction {
  type: 'scroll';
  direction: 'up' | 'down';
}

export interface FirecrawlClickAction {
  type: 'click';
  selector: string;
}

export interface FirecrawlWriteAction {
  type: 'write';
  text: string;
  selector: string;
}

export interface FirecrawlPressAction {
  type: 'press';
  key: string;
}

export interface FirecrawlScreenshotAction {
  type: 'screenshot';
}

export interface FirecrawlExecuteJavascriptAction {
  type: 'executeJavascript';
  script: string;
}

export type FirecrawlAction =
  | FirecrawlWaitAction
  | FirecrawlScrollAction
  | FirecrawlClickAction
  | FirecrawlWriteAction
  | FirecrawlPressAction
  | FirecrawlScreenshotAction
  | FirecrawlExecuteJavascriptAction;

export interface FirecrawlRequestPayload {
  url: string;
  formats: FirecrawlFormat[];
  onlyMainContent: boolean;
  timeout: number;
  actions: FirecrawlAction[];
}

export interface FirecrawlScrapeResponseData {
  markdown?: string;
  summary?: string;
  html?: string;
  rawHtml?: string;
  cleanedHtml?: string;
  links?: string[];
  images?: unknown[];
  videos?: unknown[];
  metadata?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  screenshot?: string;
  json?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FirecrawlScrapeResponse {
  success?: boolean;
  warning?: string | null;
  error?: string | null;
  data?: FirecrawlScrapeResponseData;
  [key: string]: unknown;
}

export interface FirecrawlNormalizedImage {
  src: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface FirecrawlNormalizedVideo {
  src: string;
  poster: string | null;
}

export interface FirecrawlNormalizedCollectedOutputs {
  markdown?: string;
  summary?: string;
  html?: string;
  rawHtml?: string;
  cleanedHtml?: string;
  links: string[];
  images: FirecrawlNormalizedImage[];
  videos: FirecrawlNormalizedVideo[];
  metadata: Record<string, unknown>;
  branding: Record<string, unknown>;
  extraction: Record<string, unknown>;
  screenshotUrl?: string;
}

export interface FirecrawlBenchmarkRunInput {
  sourceUrl: string;
  benchmarkFamily?: NexusBenchmarkFamily;
  pageTypeGuess?: NexusPageTypeGuess;
  goal: string;
  label?: string;
  locale?: string;
  deviceProfile?: string;
  viewport?: {
    width?: number;
    height?: number;
  };
  pageGoalGuess?: string;
  sourceNotes?: string[];
  collector?: NexusBenchmarkCollector;
}

export interface FirecrawlBenchmarkScaffold {
  requestPayload: FirecrawlRequestPayload;
  runId: string;
  runDirectoryName: string;
  sourceDomain: string;
  label: string;
}