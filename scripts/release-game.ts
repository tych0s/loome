#!/usr/bin/env node
/**
 * Archives the built game as an immutable version folder and updates the
 * mutable alias plus the append-only versions manifest.
 *
 * Layout produced under --out:
 *   v/<version>/         immutable copy of the game build (never overwritten)
 *   v/<version>/screenshot.png  build screenshot for the log (best-effort)
 *   current/             mutable alias pointing at the latest release
 *   versions.json        append-only release manifest (game_versions record)
 *   index.html           archive landing page (copied from scripts/archive/)
 *
 * The screenshot needs a Chrome/Chromium binary on PATH or LOOME_CHROME_BIN;
 * without one (or with --no-screenshot) the release proceeds without a shot.
 *
 * Usage:
 *   node --experimental-strip-types scripts/release-game.ts \
 *     --cycle 0 --build 0 --summary "First playable version" \
 *     [--cycle-id cycle-0] [--proposal-id bootstrap] \
 *     [--out dist-archive] [--game-dist apps/game/dist] [--no-screenshot]
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  appendGameVersion,
  type GameVersionManifest,
  gameVersionManifestSchema,
  gameVersionTag,
} from "../packages/shared/src/index.ts";
import {
  captureScreenshot,
  resolveChromeBinary,
} from "./capture-screenshot.ts";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  return value?.startsWith("--") ? undefined : value;
}

function requireArg(name: string): string {
  const value = arg(name);
  if (!value) {
    console.error(`error: missing required argument --${name}`);
    process.exit(2);
  }
  return value;
}

const repoRoot = path.resolve(import.meta.dirname, "..");
const cycle = requireArg("cycle");
const build = requireArg("build");
const summary = requireArg("summary");
const outDir = path.resolve(repoRoot, arg("out") ?? "dist-archive");
const gameDist = path.resolve(repoRoot, arg("game-dist") ?? "apps/game/dist");

if (!existsSync(path.join(gameDist, "index.html"))) {
  console.error(
    `error: game build not found at ${gameDist} (run pnpm build first)`,
  );
  process.exit(2);
}

const version = `0.${cycle}.${build}`;
const versionDir = path.join(outDir, "v", version);
if (existsSync(versionDir)) {
  console.error(
    `error: ${versionDir} already exists; archived versions are immutable`,
  );
  process.exit(1);
}

const manifestPath = path.join(outDir, "versions.json");
const manifest: GameVersionManifest = existsSync(manifestPath)
  ? gameVersionManifestSchema.parse(
      JSON.parse(readFileSync(manifestPath, "utf8")),
    )
  : { versions: [] };

const commitSha = execSync("git rev-parse HEAD", { cwd: repoRoot })
  .toString()
  .trim();

mkdirSync(path.dirname(versionDir), { recursive: true });
cpSync(gameDist, versionDir, { recursive: true });
const currentDir = path.join(outDir, "current");
rmSync(currentDir, { recursive: true, force: true });
cpSync(gameDist, currentDir, { recursive: true });

// Capture the archived build so every release shows its visible result in the
// log, even for a small change. Best-effort: a missing browser or the
// --no-screenshot opt-out releases without one instead of failing.
let screenshot: string | undefined;
if (!process.argv.includes("--no-screenshot")) {
  const shotPath = path.join(versionDir, "screenshot.png");
  const captured = await captureScreenshot({
    htmlPath: path.join(versionDir, "index.html"),
    outPath: shotPath,
  });
  if (captured) {
    cpSync(shotPath, path.join(currentDir, "screenshot.png"));
    screenshot = `v/${version}/screenshot.png`;
  } else {
    console.warn(
      resolveChromeBinary()
        ? "warning: screenshot capture failed; releasing without it"
        : "warning: no Chrome binary found (set LOOME_CHROME_BIN); releasing without a screenshot",
    );
  }
}

const nextManifest = appendGameVersion(manifest, {
  version,
  gitTag: gameVersionTag(version),
  commitSha,
  cycleId: arg("cycle-id") ?? `cycle-${cycle}`,
  proposalId: arg("proposal-id") ?? "bootstrap",
  publicSummary: summary,
  createdAt: new Date().toISOString(),
  ...(screenshot ? { screenshot } : {}),
});

cpSync(
  path.join(repoRoot, "scripts/archive/index.html"),
  path.join(outDir, "index.html"),
);
writeFileSync(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);

console.log(`released game version ${version} (${gameVersionTag(version)})`);
console.log(`  immutable: ${path.relative(repoRoot, versionDir)}`);
console.log(`  alias:     ${path.relative(repoRoot, currentDir)}`);
if (screenshot) {
  console.log(`  screenshot: ${screenshot}`);
}
console.log(
  `  manifest:  ${path.relative(repoRoot, manifestPath)} (${nextManifest.versions.length} release(s))`,
);
