/**
 * Best-effort screenshot capture for the release pipeline.
 *
 * Renders the built game to a PNG using headless Chrome through the browser's
 * own command line. No npm or browser dependency is added: the release only
 * needs a Chrome/Chromium binary on PATH (GitHub `ubuntu-latest` runners ship
 * one) or `LOOME_CHROME_BIN` pointing at one.
 *
 * The build is a Vite bundle whose `<script type="module">` will not load over
 * `file://` (module requests are blocked as cross-origin), so the directory is
 * served over a short-lived local HTTP server and Chrome shoots that URL.
 *
 * Capture is intentionally best-effort. Callers treat a `false` result as
 * "no screenshot this release" and never as a release failure, so a missing
 * browser degrades gracefully instead of blocking a public release.
 */
import { execFileSync, spawn } from "node:child_process";
import {
  createReadStream,
  existsSync,
  mkdtempSync,
  rmSync,
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

/** Binaries tried in order, after an explicit `LOOME_CHROME_BIN`. */
export const CHROME_CANDIDATES = [
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
] as const;

export interface CaptureOptions {
  /** Absolute path to the HTML file to render. */
  htmlPath: string;
  /** Absolute path to write the PNG to. */
  outPath: string;
  /** Viewport width in CSS pixels. */
  width?: number;
  /** Viewport height in CSS pixels. */
  height?: number;
  /** Scripted time (ms) granted to the page before the shot is taken. */
  virtualTimeBudgetMs?: number;
  /** Overrides binary resolution; mainly for callers that already resolved one. */
  chromeBin?: string;
}

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 800;
const DEFAULT_VIRTUAL_TIME_BUDGET_MS = 2500;
const CHROME_TIMEOUT_MS = 60_000;

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function isRunnable(bin: string): boolean {
  try {
    execFileSync(bin, ["--version"], { stdio: "ignore", timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

/** Resolves a usable Chrome binary, or `null` when none is available. */
export function resolveChromeBinary(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const explicit = env.LOOME_CHROME_BIN?.trim();
  const candidates = explicit
    ? [explicit, ...CHROME_CANDIDATES]
    : [...CHROME_CANDIDATES];
  for (const candidate of candidates) {
    if (isRunnable(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Deterministic Chrome argument list for a single screenshot. Kept pure so the
 * exact flags can be asserted without launching a browser.
 */
export function chromeScreenshotArgs(opts: {
  url: string;
  outPath: string;
  width: number;
  height: number;
  virtualTimeBudgetMs: number;
}): string[] {
  return [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    `--window-size=${opts.width},${opts.height}`,
    `--screenshot=${opts.outPath}`,
    `--virtual-time-budget=${opts.virtualTimeBudgetMs}`,
    opts.url,
  ];
}

interface StaticServer {
  port: number;
  close: () => Promise<void>;
}

/** Serves `rootDir` read-only over loopback for the duration of a capture. */
function serveDir(rootDir: string): Promise<StaticServer> {
  const root = path.resolve(rootDir);
  const server = createServer((req, res) => {
    try {
      const requested = decodeURIComponent(
        (req.url ?? "/").split("?")[0] ?? "/",
      );
      const rel = requested === "/" ? "/index.html" : requested;
      const filePath = path.resolve(path.join(root, rel));
      if (
        (filePath !== root && !filePath.startsWith(root + path.sep)) ||
        !existsSync(filePath) ||
        !statSync(filePath).isFile()
      ) {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      res.setHeader(
        "Content-Type",
        CONTENT_TYPES[path.extname(filePath).toLowerCase()] ??
          "application/octet-stream",
      );
      createReadStream(filePath).pipe(res);
    } catch {
      res.statusCode = 500;
      res.end("error");
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({
        port,
        close: () =>
          new Promise<void>((done) => {
            server.close(() => done());
          }),
      });
    });
  });
}

function runChrome(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: "ignore" });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("chrome screenshot timed out"));
    }, CHROME_TIMEOUT_MS);
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`chrome exited with code ${code}`));
      }
    });
  });
}

/**
 * Captures `htmlPath` (and its sibling assets) to `outPath`. Resolves `true`
 * only when the PNG was written; any missing browser, launch error or timeout
 * resolves to `false`.
 */
export async function captureScreenshot(
  opts: CaptureOptions,
): Promise<boolean> {
  const bin = opts.chromeBin ?? resolveChromeBinary();
  if (!bin) {
    return false;
  }
  const profileDir = mkdtempSync(path.join(tmpdir(), "loome-shot-"));
  let server: StaticServer | undefined;
  try {
    server = await serveDir(path.dirname(opts.htmlPath));
    const url = `http://127.0.0.1:${server.port}/${path.basename(opts.htmlPath)}`;
    const args = chromeScreenshotArgs({
      url,
      outPath: opts.outPath,
      width: opts.width ?? DEFAULT_WIDTH,
      height: opts.height ?? DEFAULT_HEIGHT,
      virtualTimeBudgetMs:
        opts.virtualTimeBudgetMs ?? DEFAULT_VIRTUAL_TIME_BUDGET_MS,
    });
    await runChrome(bin, [`--user-data-dir=${profileDir}`, ...args]);
    return existsSync(opts.outPath);
  } catch {
    return false;
  } finally {
    if (server) {
      await server.close();
    }
    rmSync(profileDir, { recursive: true, force: true });
  }
}
