import { describe, expect, it } from "vitest";
import {
  assertDiffWithinGameWorkspace,
  DiffBoundaryError,
  findForbiddenPaths,
} from "./validate-diff";

describe("findForbiddenPaths", () => {
  it("accepts changes inside the game workspace", () => {
    expect(
      findForbiddenPaths(["apps/game/src/main.ts", "apps/game/assets/a.png"]),
    ).toEqual([]);
  });

  it("flags changes outside the game workspace", () => {
    expect(
      findForbiddenPaths([
        "apps/game/src/main.ts",
        "workers/implementer/src/service.ts",
        ".github/workflows/ci.yml",
      ]),
    ).toEqual([
      "workers/implementer/src/service.ts",
      ".github/workflows/ci.yml",
    ]);
  });

  it("flags path traversal and absolute paths", () => {
    expect(
      findForbiddenPaths(["apps/game/../../.env", "/etc/passwd"]),
    ).toHaveLength(2);
  });
});

describe("assertDiffWithinGameWorkspace", () => {
  it("throws a DiffBoundaryError listing violations", () => {
    expect(() =>
      assertDiffWithinGameWorkspace(["packages/db/schema.ts"]),
    ).toThrowError(DiffBoundaryError);
  });
});
