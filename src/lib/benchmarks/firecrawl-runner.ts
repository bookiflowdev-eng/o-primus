import FirecrawlApp from "@mendable/firecrawl-js";
import fs from "node:fs/promises";
import path from "node:path";

type FirecrawlRunResult = {
  outputDir: string;
  success: boolean;
  raw: unknown;
};

function slugifyUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function writeText(filePath: string, content: string) {
  await fs.writeFile(filePath, content, "utf-8");
}

export async function runFirecrawlBenchmark(url: string): Promise<FirecrawlRunResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY manquante");
  }

  const app = new FirecrawlApp({ apiKey });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeUrl = slugifyUrl(url);
  const outputDir = path.join(process.cwd(), "benchmarks", "firecrawl", `${timestamp}_${safeUrl}`);

  await ensureDir(outputDir);

  const requestPayload = {
    url,
    formats: [
      "markdown",
      "summary",
      "html",
      "rawHtml",
      "links",
      "images",
      "branding",
      "screenshot",
      {
        type: "json",
        prompt: `
Analyse cette page au maximum et retourne une structure riche contenant:
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
        `.trim(),
      },
    ],
    onlyMainContent: false,
    timeout: 120000,
    actions: [
      { type: "wait", milliseconds: 2000 },
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 1200 },
      { type: "scroll", direction: "down" },
      { type: "wait", milliseconds: 1200 },
      { type: "scroll", direction: "up" },
      { type: "wait", milliseconds: 1000 },
    ],
  };

  await writeJson(path.join(outputDir, "request.json"), requestPayload);

  const result = await app.scrapeUrl(url, requestPayload as any);
  await writeJson(path.join(outputDir, "response.json"), result);

  const data = (result as any)?.data ?? result ?? {};

  if (typeof data.markdown === "string") {
    await writeText(path.join(outputDir, "markdown.md"), data.markdown);
  }

  if (typeof data.summary === "string") {
    await writeText(path.join(outputDir, "summary.txt"), data.summary);
  }

  if (typeof data.html === "string") {
    await writeText(path.join(outputDir, "html.html"), data.html);
  }

  if (typeof data.rawHtml === "string") {
    await writeText(path.join(outputDir, "rawHtml.html"), data.rawHtml);
  }

  if (data.links) {
    await writeJson(path.join(outputDir, "links.json"), data.links);
  }

  if (data.images) {
    await writeJson(path.join(outputDir, "images.json"), data.images);
  }

  if (data.metadata) {
    await writeJson(path.join(outputDir, "metadata.json"), data.metadata);
  }

  if (data.branding) {
    await writeJson(path.join(outputDir, "branding.json"), data.branding);
  }

  if (data.json) {
    await writeJson(path.join(outputDir, "json.json"), data.json);
  }

  if (data.screenshot) {
    await writeText(path.join(outputDir, "screenshot.url.txt"), String(data.screenshot));
  }

  const manifest = {
    url,
    extractedAt: new Date().toISOString(),
    files: await fs.readdir(outputDir),
  };

  await writeJson(path.join(outputDir, "manifest.json"), manifest);

  return {
    outputDir,
    success: Boolean((result as any)?.success ?? true),
    raw: result,
  };
}