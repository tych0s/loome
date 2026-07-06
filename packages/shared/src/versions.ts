import { z } from "zod";

/**
 * Pre-1.0 game version: 0.CYCLE.BUILD. It is the immutable archive URL
 * segment (/v/<version>/) and the source of the release git tag.
 */
export const gameVersionSchema = z.string().regex(/^0\.\d+\.\d+$/);

export const gameVersionRecordSchema = z
  .object({
    version: gameVersionSchema,
    gitTag: z.string().regex(/^game-v0\.\d+\.\d+$/),
    commitSha: z.string().regex(/^[0-9a-f]{7,40}$/),
    cycleId: z.string().min(1),
    proposalId: z.string().min(1),
    publicSummary: z.string().min(1).max(1000),
    createdAt: z.string().min(1),
  })
  .strict();

export type GameVersionRecord = z.infer<typeof gameVersionRecordSchema>;

export const gameVersionManifestSchema = z
  .object({
    versions: z.array(gameVersionRecordSchema),
  })
  .strict();

export type GameVersionManifest = z.infer<typeof gameVersionManifestSchema>;

export function gameVersionTag(version: string): string {
  return `game-v${gameVersionSchema.parse(version)}`;
}

/**
 * Appends a release record to the manifest. The archive is append-only:
 * re-releasing an existing version is refused, never overwritten.
 */
export function appendGameVersion(
  manifest: GameVersionManifest,
  record: GameVersionRecord,
): GameVersionManifest {
  const parsed = gameVersionRecordSchema.parse(record);
  if (manifest.versions.some((entry) => entry.version === parsed.version)) {
    throw new Error(
      `game version ${parsed.version} is already archived and immutable`,
    );
  }
  return { versions: [...manifest.versions, parsed] };
}
