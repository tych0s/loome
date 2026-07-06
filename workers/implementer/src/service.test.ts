import { describe, expect, it, vi } from "vitest";
import type { BackendClient } from "./backend-client";
import { createPublicRunId, ImplementerService } from "./service";

const validBrief = {
  cycleId: "cycle-1",
  proposalId: "proposal-1",
  title: "Add a bouncing ball",
  goal: "Render a ball that bounces around the play area.",
  allowedPaths: ["apps/game/src/main.ts"],
  acceptanceCriteria: ["A ball bounces on screen."],
  forbiddenChanges: ["No new dependencies."],
  sdkConstraints: ["Use sdk.storage for persistence."],
  publicSummary: "The community voted to add a bouncing ball.",
};

function stubClient(overrides: Partial<BackendClient> = {}): BackendClient {
  return {
    submitRun: vi.fn().mockResolvedValue({ backendRunId: "backend-item-77" }),
    getRunStatus: vi.fn().mockResolvedValue({ state: "working" }),
    cancelRun: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createPublicRunId", () => {
  it("creates Loome-owned run ids", () => {
    expect(createPublicRunId()).toMatch(/^run_[a-z0-9]{8,32}$/);
  });
});

describe("ImplementerService", () => {
  it("starts a run and emits run_created", async () => {
    const service = new ImplementerService(stubClient());
    const run = await service.startRun(validBrief);
    expect(run.events).toEqual(["run_created"]);
    expect(run.state).toBe("queued");
    expect(run.publicRunId).toMatch(/^run_[a-z0-9]{8,32}$/);
  });

  it("rejects a brief escaping the game workspace before any network call", async () => {
    const client = stubClient();
    const service = new ImplementerService(client);
    const attack = { ...validBrief, allowedPaths: ["packages/db/schema.ts"] };
    await expect(service.startRun(attack)).rejects.toThrow();
    expect(client.submitRun).not.toHaveBeenCalled();
  });

  it("never exposes the backend run id on the public view", async () => {
    const service = new ImplementerService(stubClient());
    const run = await service.startRun(validBrief);
    expect(JSON.stringify(run)).not.toContain("backend-item-77");
  });

  it("emits diff_ready exactly once when the backend delivers", async () => {
    const client = stubClient({
      getRunStatus: vi.fn().mockResolvedValue({ state: "delivered" }),
    });
    const service = new ImplementerService(client);
    const run = await service.startRun(validBrief);
    expect(await service.poll(run.publicRunId)).toEqual(["diff_ready"]);
    expect(await service.poll(run.publicRunId)).toEqual([]);
    expect(service.getRun(run.publicRunId)?.events).toEqual([
      "run_created",
      "diff_ready",
    ]);
  });

  it("emits run_failed when the backend fails", async () => {
    const client = stubClient({
      getRunStatus: vi.fn().mockResolvedValue({ state: "failed" }),
    });
    const service = new ImplementerService(client);
    const run = await service.startRun(validBrief);
    expect(await service.poll(run.publicRunId)).toEqual(["run_failed"]);
  });

  it("emits nothing while the backend is still working", async () => {
    const service = new ImplementerService(stubClient());
    const run = await service.startRun(validBrief);
    expect(await service.poll(run.publicRunId)).toEqual([]);
    expect(service.getRun(run.publicRunId)?.state).toBe("working");
  });

  it("kill switch cancels the backend run and fails publicly", async () => {
    const client = stubClient();
    const service = new ImplementerService(client);
    const run = await service.startRun(validBrief);
    const killed = await service.kill(run.publicRunId);
    expect(client.cancelRun).toHaveBeenCalledWith("backend-item-77");
    expect(killed.state).toBe("failed");
    expect(killed.events).toEqual(["run_created", "run_failed"]);
  });

  it("kill switch is a no-op on terminal runs", async () => {
    const client = stubClient({
      getRunStatus: vi.fn().mockResolvedValue({ state: "delivered" }),
    });
    const service = new ImplementerService(client);
    const run = await service.startRun(validBrief);
    await service.poll(run.publicRunId);
    await service.kill(run.publicRunId);
    expect(client.cancelRun).not.toHaveBeenCalled();
  });
});
