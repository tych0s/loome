import { describe, expect, it } from "vitest";
import {
  appendGameVersion,
  type GameVersionManifest,
  gameVersionRecordSchema,
  gameVersionTag,
} from "./versions";

const record = {
  version: "0.12.3",
  gitTag: "game-v0.12.3",
  commitSha: "abc123f",
  cycleId: "cycle-12",
  proposalId: "proposal-34",
  publicSummary: "Weather system added by community vote.",
  createdAt: "2026-07-06T00:00:00.000Z",
};

describe("gameVersionRecordSchema", () => {
  it("accepts a valid record", () => {
    expect(gameVersionRecordSchema.parse(record)).toEqual(record);
  });

  it("rejects non pre-1.0 versions and malformed tags", () => {
    expect(() =>
      gameVersionRecordSchema.parse({ ...record, version: "1.0.0" }),
    ).toThrow();
    expect(() =>
      gameVersionRecordSchema.parse({ ...record, gitTag: "v0.12.3" }),
    ).toThrow();
  });

  it("accepts an optional build screenshot addressed under the archive", () => {
    const withShot = { ...record, screenshot: "v/0.12.3/screenshot.png" };
    expect(gameVersionRecordSchema.parse(withShot)).toEqual(withShot);
  });

  it("rejects screenshot paths that escape the archive", () => {
    expect(() =>
      gameVersionRecordSchema.parse({ ...record, screenshot: "../secret.png" }),
    ).toThrow();
  });
});

describe("gameVersionTag", () => {
  it("derives the release tag from the version", () => {
    expect(gameVersionTag("0.12.3")).toBe("game-v0.12.3");
  });
});

describe("appendGameVersion", () => {
  it("appends new versions", () => {
    const manifest: GameVersionManifest = { versions: [] };
    expect(appendGameVersion(manifest, record).versions).toHaveLength(1);
  });

  it("refuses to re-release an archived version", () => {
    const manifest = appendGameVersion({ versions: [] }, record);
    expect(() => appendGameVersion(manifest, record)).toThrow(/immutable/);
  });
});
