import { describe, expect, it } from "vitest";
import {
  implementationBriefSchema,
  publicRunEventSchema,
  publicRunIdSchema,
} from "./index";

const validBrief = {
  cycleId: "cycle-12",
  proposalId: "proposal-34",
  title: "Add weather to the game",
  goal: "Introduce a simple weather system that changes every minute.",
  allowedPaths: ["apps/game/src/weather.ts", "apps/game/src/main.ts"],
  acceptanceCriteria: ["Weather changes are visible during play."],
  forbiddenChanges: ["No new dependencies."],
  sdkConstraints: ["Persist state only through sdk.storage."],
  publicSummary: "The community voted to add weather to the game.",
};

describe("implementationBriefSchema", () => {
  it("accepts a valid brief", () => {
    expect(implementationBriefSchema.parse(validBrief)).toEqual(validBrief);
  });

  it("rejects allowedPaths outside apps/game/", () => {
    const brief = { ...validBrief, allowedPaths: ["packages/db/schema.ts"] };
    expect(() => implementationBriefSchema.parse(brief)).toThrow();
  });

  it("rejects path traversal inside allowedPaths", () => {
    const brief = { ...validBrief, allowedPaths: ["apps/game/../../secrets"] };
    expect(() => implementationBriefSchema.parse(brief)).toThrow();
  });

  it("rejects unknown extra fields", () => {
    const brief = { ...validBrief, backendUrl: "https://example.com" };
    expect(() => implementationBriefSchema.parse(brief)).toThrow();
  });
});

describe("publicRunEventSchema", () => {
  it("accepts sanitized events", () => {
    expect(publicRunEventSchema.parse("diff_ready")).toBe("diff_ready");
  });

  it("rejects events outside the closed enum", () => {
    expect(() => publicRunEventSchema.parse("raw_log_line")).toThrow();
  });
});

describe("publicRunIdSchema", () => {
  it("accepts Loome-owned run ids", () => {
    expect(publicRunIdSchema.parse("run_ab12cd34")).toBe("run_ab12cd34");
  });

  it("rejects arbitrary backend identifiers", () => {
    expect(() => publicRunIdSchema.parse("issue-1234")).toThrow();
  });
});
