import 'server-only';

import type {
  FirecrawlFormat,
  FirecrawlRequestPayload,
  FirecrawlScrapeResponse,
} from './types';

/**
 * ============================================================================
 * NEXUS BENCHMARK / FIRECRAWL / CLIENT
 * ============================================================================
 * Appel HTTP direct à l'API Firecrawl v2.
 * Ce client est volontairement indépendant du SDK pour rester stable,
 * explicite et compatible avec l'architecture actuelle de Nexus.
 */

const FIRECRAWL_SCRAPE_URL =
  process.env.FIRECRAWL_SCRAPE_URL?.trim() || 'https://api.firecrawl.dev/v2/scrape';

const FIRECRAWL_SUPPORTED_STRING_FORMATS = new Set([
  'markdown',
  'summary',
  'html',
  'rawHtml',
  'links',
  'images',
  'branding',
  'screenshot',
]);

type SerializableFirecrawlFormat = string | Record<string, unknown>;

function assertFirecrawlApiKey(): string {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('NEXUS_FIRECRAWL_API_KEY_MISSING');
  }

  return apiKey;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeFirecrawlFormats(
  formats: FirecrawlFormat[]
): SerializableFirecrawlFormat[] {
  const sanitized: SerializableFirecrawlFormat[] = [];

  for (const format of formats) {
    if (typeof format === 'string') {
      if (FIRECRAWL_SUPPORTED_STRING_FORMATS.has(format)) {
        sanitized.push(format);
      }
      continue;
    }

    if (isRecord(format) && format.type === 'json') {
      sanitized.push(format);
    }
  }

  if (sanitized.length === 0) {
    throw new Error('NEXUS_FIRECRAWL_NO_SUPPORTED_FORMATS');
  }

  return sanitized;
}

function sanitizeRequestPayload(
  payload: FirecrawlRequestPayload
): Record<string, unknown> {
  return {
    url: payload.url,
    formats: sanitizeFirecrawlFormats(payload.formats),
    onlyMainContent: payload.onlyMainContent,
    timeout: payload.timeout,
    actions: payload.actions,
  };
}

async function parseFirecrawlJsonResponse(
  response: Response
): Promise<FirecrawlScrapeResponse> {
  const rawText = await response.text();

  try {
    return JSON.parse(rawText) as FirecrawlScrapeResponse;
  } catch {
    throw new Error(
      `NEXUS_FIRECRAWL_INVALID_JSON_RESPONSE: ${rawText.slice(0, 500)}`
    );
  }
}

export async function executeFirecrawlScrape(
  payload: FirecrawlRequestPayload
): Promise<FirecrawlScrapeResponse> {
  const apiKey = assertFirecrawlApiKey();
  const requestBody = sanitizeRequestPayload(payload);

  const response = await fetch(FIRECRAWL_SCRAPE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify(requestBody),
  });

  const json = await parseFirecrawlJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      (typeof json.error === 'string' && json.error) ||
      `HTTP_${response.status}`;

    throw new Error(`NEXUS_FIRECRAWL_HTTP_ERROR: ${errorMessage}`);
  }

  if (json.success === false) {
    const errorMessage =
      (typeof json.error === 'string' && json.error) ||
      'NEXUS_FIRECRAWL_UNKNOWN_FAILURE';

    throw new Error(`NEXUS_FIRECRAWL_EXECUTION_ERROR: ${errorMessage}`);
  }

  return json;
}

export function buildSerializableFirecrawlRequest(
  payload: FirecrawlRequestPayload
): Record<string, unknown> {
  return sanitizeRequestPayload(payload);
}