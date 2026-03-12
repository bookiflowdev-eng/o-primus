import type { NexusCollectedOutputSnapshot } from '@/lib/contracts/nexus-benchmark';
import type {
  FirecrawlNormalizedImage,
  FirecrawlNormalizedVideo,
  FirecrawlScrapeResponse,
  FirecrawlScrapeResponseData,
} from './types';

/**
 * ============================================================================
 * NEXUS BENCHMARK / FIRECRAWL / NORMALIZE
 * ============================================================================
 * Convertit la réponse brute Firecrawl en artefacts Nexus persistables.
 */

export type NexusPersistableArtifact =
  | {
      relativePath: string;
      kind: 'text';
      content: string;
    }
  | {
      relativePath: string;
      kind: 'json';
      content: unknown;
    };

export interface NormalizedFirecrawlArtifacts {
  collection: NexusCollectedOutputSnapshot;
  persistableArtifacts: NexusPersistableArtifact[];
  collectedRelativePaths: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (isRecord(entry) && typeof entry.url === 'string') return entry.url.trim();
      if (isRecord(entry) && typeof entry.href === 'string') return entry.href.trim();
      if (isRecord(entry) && typeof entry.src === 'string') return entry.src.trim();
      return '';
    })
    .filter(Boolean);
}

function normalizeImages(value: unknown): FirecrawlNormalizedImage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return {
          src: entry.trim(),
          alt: null,
          width: null,
          height: null,
        } satisfies FirecrawlNormalizedImage;
      }

      if (isRecord(entry)) {
        const src =
          asOptionalString(entry.src) ||
          asOptionalString(entry.url) ||
          asOptionalString(entry.href);

        if (!src) return null;

        const width =
          typeof entry.width === 'number' ? entry.width : null;
        const height =
          typeof entry.height === 'number' ? entry.height : null;

        return {
          src,
          alt: asOptionalString(entry.alt) ?? null,
          width,
          height,
        } satisfies FirecrawlNormalizedImage;
      }

      return null;
    })
    .filter((entry): entry is FirecrawlNormalizedImage => Boolean(entry));
}

function normalizeVideos(value: unknown): FirecrawlNormalizedVideo[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return {
          src: entry.trim(),
          poster: null,
        } satisfies FirecrawlNormalizedVideo;
      }

      if (isRecord(entry)) {
        const src =
          asOptionalString(entry.src) ||
          asOptionalString(entry.url) ||
          asOptionalString(entry.href);

        if (!src) return null;

        return {
          src,
          poster: asOptionalString(entry.poster) ?? null,
        } satisfies FirecrawlNormalizedVideo;
      }

      return null;
    })
    .filter((entry): entry is FirecrawlNormalizedVideo => Boolean(entry));
}

function getFirecrawlData(response: FirecrawlScrapeResponse): FirecrawlScrapeResponseData {
  if (isRecord(response.data)) {
    return response.data as FirecrawlScrapeResponseData;
  }

  return response as unknown as FirecrawlScrapeResponseData;
}

function pushTextArtifact(
  artifacts: NexusPersistableArtifact[],
  relativePath: string,
  value: string | undefined
) {
  if (!value) return;

  artifacts.push({
    relativePath,
    kind: 'text',
    content: value,
  });
}

function pushJsonArtifact(
  artifacts: NexusPersistableArtifact[],
  relativePath: string,
  value: unknown
) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value) && value.length === 0) return;
  if (isRecord(value) && Object.keys(value).length === 0) return;

  artifacts.push({
    relativePath,
    kind: 'json',
    content: value,
  });
}

function extractScreenshotUrl(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (isRecord(value)) {
    return (
      asOptionalString(value.url) ||
      asOptionalString(value.src) ||
      asOptionalString(value.screenshot)
    );
  }

  return undefined;
}

export function normalizeFirecrawlResponse(
  response: FirecrawlScrapeResponse
): NormalizedFirecrawlArtifacts {
  const data = getFirecrawlData(response);

  const markdown = asOptionalString(data.markdown);
  const summary = asOptionalString(data.summary);
  const html = asOptionalString(data.html);
  const rawHtml = asOptionalString(data.rawHtml);

  const links = normalizeStringArray(data.links);
  const imagesDetailed = normalizeImages(data.images);
  const videosDetailed = normalizeVideos(data.videos);
  const imageUrls = imagesDetailed.map((image) => image.src);
  const videoUrls = videosDetailed.map((video) => video.src);

  const metadata = isRecord(data.metadata) ? data.metadata : {};
  const branding = isRecord(data.branding) ? data.branding : {};
  const extraction = isRecord(data.json) ? data.json : {};
  const screenshotUrl = extractScreenshotUrl(data.screenshot);

  const persistableArtifacts: NexusPersistableArtifact[] = [];

  pushTextArtifact(persistableArtifacts, 'collected/markdown.md', markdown);
  pushTextArtifact(persistableArtifacts, 'collected/summary.txt', summary);
  pushTextArtifact(persistableArtifacts, 'collected/html.html', html);
  pushTextArtifact(persistableArtifacts, 'collected/rawHtml.html', rawHtml);
  pushJsonArtifact(persistableArtifacts, 'collected/links.json', links);
  pushJsonArtifact(persistableArtifacts, 'collected/images.json', imagesDetailed);
  pushJsonArtifact(persistableArtifacts, 'collected/videos.json', videosDetailed);
  pushJsonArtifact(persistableArtifacts, 'collected/metadata.json', metadata);
  pushJsonArtifact(persistableArtifacts, 'collected/branding.json', branding);
  pushJsonArtifact(persistableArtifacts, 'collected/extraction.json', extraction);
  pushTextArtifact(
    persistableArtifacts,
    'collected/screenshot.url.txt',
    screenshotUrl
  );

  return {
    collection: {
      markdown,
      summary,
      html,
      rawHtml,
      links,
      images: imageUrls,
      videos: videoUrls,
      metadata,
      branding,
      extraction,
      screenshotUrl,
    },
    collectedRelativePaths: persistableArtifacts.map(
      (artifact) => artifact.relativePath
    ),
    persistableArtifacts,
  };
}