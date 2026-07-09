import { describe, expect, it } from "vitest";
import {
  implementationBriefSchema,
  publicRunEventRecordSchema,
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

describe("publicRunEventRecordSchema", () => {
  it("accepts a typed event without a screenshot", () => {
    expect(publicRunEventRecordSchema.parse({ type: "diff_ready" })).toEqual({
      type: "diff_ready",
    });
  });

  it("accepts a typed event with a public screenshot url", () => {
    const event = {
      type: "preview_ready",
      screenshot: "https://cdn.loome.example/runs/run_ab12cd34.png",
    };
    expect(publicRunEventRecordSchema.parse(event)).toEqual(event);
  });

  it("rejects non-https or non-image screenshots", () => {
    expect(() =>
      publicRunEventRecordSchema.parse({
        type: "preview_ready",
        screenshot: "http://cdn.loome.example/x.png",
      }),
    ).toThrow();
    expect(() =>
      publicRunEventRecordSchema.parse({
        type: "preview_ready",
        screenshot: "https://cdn.loome.example/x.gif",
      }),
    ).toThrow();
  });

  it("rejects event types outside the closed enum", () => {
    expect(() =>
      publicRunEventRecordSchema.parse({ type: "raw_log_line" }),
    ).toThrow();
  });

  it("rejects unknown fields so no raw backend data leaks", () => {
    expect(() =>
      publicRunEventRecordSchema.parse({
        type: "diff_ready",
        backendUrl: "https://internal.example/run/9.png",
      }),
    ).toThrow();
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
