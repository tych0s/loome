import type { ImplementationBrief } from "@loome/shared";
import { describe, expect, it, vi } from "vitest";
import {
  BackendProtocolError,
  BackendRequestError,
  createHttpBackendClient,
  renderBriefDescription,
} from "./backend-client";
import { loadBackendConfig } from "./config";

const env = {
  IMPLEMENTER_BACKEND_URL: "https://backend.example/",
  IMPLEMENTER_BACKEND_TOKEN: "test-token",
  IMPLEMENTER_BACKEND_COMPANY_ID: "company-1",
  IMPLEMENTER_BACKEND_PROJECT_ID: "project-1",
  IMPLEMENTER_BACKEND_AGENT_ID: "agent-1",
};

const brief: ImplementationBrief = {
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

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("loadBackendConfig", () => {
  it("loads and normalizes the backend config", () => {
    const config = loadBackendConfig(env);
    expect(config.baseUrl).toBe("https://backend.example");
  });

  it("rejects a missing token", () => {
    expect(() =>
      loadBackendConfig({ ...env, IMPLEMENTER_BACKEND_TOKEN: undefined }),
    ).toThrow();
  });
});

describe("renderBriefDescription", () => {
  it("renders only schema-validated brief fields", () => {
    const description = renderBriefDescription(brief);
    expect(description).toContain("## Goal");
    expect(description).toContain("apps/game/src/main.ts");
    expect(description).toContain("No new dependencies.");
  });
});

describe("createHttpBackendClient", () => {
  it("submits a run to the company work queue with auth", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(201, { id: "item-9" }));
    const client = createHttpBackendClient(loadBackendConfig(env), fetchImpl);
    const result = await client.submitRun(brief);
    expect(result.backendRunId).toBe("item-9");
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      `https://backend.example/api/companies/${env.IMPLEMENTER_BACKEND_COMPANY_ID}/issues`,
    );
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.assigneeAgentId).toBe("agent-1");
    expect(body.projectId).toBe("project-1");
  });

  it("maps work item statuses to coarse run states", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { status: "done" }));
    const client = createHttpBackendClient(loadBackendConfig(env), fetchImpl);
    await expect(client.getRunStatus("item-9")).resolves.toEqual({
      state: "delivered",
    });
  });

  it("throws on unknown statuses instead of guessing", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(200, { status: "mystery" }));
    const client = createHttpBackendClient(loadBackendConfig(env), fetchImpl);
    await expect(client.getRunStatus("item-9")).rejects.toBeInstanceOf(
      BackendProtocolError,
    );
  });

  it("cancels a run by cancelling the work item", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    const client = createHttpBackendClient(loadBackendConfig(env), fetchImpl);
    await client.cancelRun("item-9");
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://backend.example/api/issues/item-9");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(String(init.body))).toEqual({ status: "cancelled" });
  });

  it("surfaces only the HTTP status on backend errors", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(jsonResponse(500, { internal: "secret-detail" }));
    const client = createHttpBackendClient(loadBackendConfig(env), fetchImpl);
    const error = await client.getRunStatus("item-9").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BackendRequestError);
    expect(String(error)).not.toContain("secret-detail");
  });
});
