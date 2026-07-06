import type { ImplementationBrief } from "@loome/shared";
import type { BackendConfig } from "./config";

/** Coarse run states Loome derives from the backend's work-item status. */
export type BackendRunState = "queued" | "working" | "delivered" | "failed";

export interface BackendRunStatus {
  state: BackendRunState;
}

export interface BackendClient {
  submitRun(brief: ImplementationBrief): Promise<{ backendRunId: string }>;
  getRunStatus(backendRunId: string): Promise<BackendRunStatus>;
  cancelRun(backendRunId: string): Promise<void>;
}

/** Raised when the backend answers outside the expected contract. */
export class BackendProtocolError extends Error {}

/**
 * Raised on non-2xx backend responses. Carries only the HTTP status: backend
 * response bodies may contain internal details and must never propagate to
 * public surfaces or logs.
 */
export class BackendRequestError extends Error {
  readonly status: number;

  constructor(status: number, operation: string) {
    super(`implementation backend ${operation} failed with status ${status}`);
    this.status = status;
  }
}

const WORK_ITEM_STATE_MAP: Record<string, BackendRunState> = {
  backlog: "queued",
  todo: "queued",
  in_progress: "working",
  in_review: "working",
  done: "delivered",
  blocked: "failed",
  cancelled: "failed",
};

/**
 * Renders the work-item description from schema-validated brief fields only.
 * Raw community text never reaches the backend by construction.
 */
export function renderBriefDescription(brief: ImplementationBrief): string {
  const list = (items: readonly string[]) =>
    items.map((item) => `- ${item}`).join("\n");
  return [
    `Cycle: ${brief.cycleId}`,
    `Proposal: ${brief.proposalId}`,
    "",
    `## Goal`,
    brief.goal,
    "",
    `## Allowed paths`,
    list(brief.allowedPaths),
    "",
    `## Acceptance criteria`,
    list(brief.acceptanceCriteria),
    "",
    `## Forbidden changes`,
    list(brief.forbiddenChanges),
    "",
    `## SDK constraints`,
    list(brief.sdkConstraints),
  ].join("\n");
}

export function createHttpBackendClient(
  config: BackendConfig,
  fetchImpl: typeof fetch = fetch,
): BackendClient {
  const request = async (
    operation: string,
    path: string,
    init?: { method?: string; body?: unknown },
  ): Promise<unknown> => {
    const response = await fetchImpl(`${config.baseUrl}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      ...(init?.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });
    if (!response.ok) {
      throw new BackendRequestError(response.status, operation);
    }
    return response.json();
  };

  return {
    async submitRun(brief) {
      const created = (await request(
        "submit",
        `/api/companies/${config.companyId}/issues`,
        {
          method: "POST",
          body: {
            title: brief.title,
            description: renderBriefDescription(brief),
            projectId: config.projectId,
            assigneeAgentId: config.agentId,
          },
        },
      )) as { id?: string; issue?: { id?: string } };
      const backendRunId = created.id ?? created.issue?.id;
      if (!backendRunId) {
        throw new BackendProtocolError("backend did not return a work item id");
      }
      return { backendRunId };
    },

    async getRunStatus(backendRunId) {
      const item = (await request("status", `/api/issues/${backendRunId}`)) as {
        status?: string;
        issue?: { status?: string };
      };
      const rawStatus = item.status ?? item.issue?.status;
      const state = rawStatus ? WORK_ITEM_STATE_MAP[rawStatus] : undefined;
      if (!state) {
        throw new BackendProtocolError(
          `backend reported an unknown work item status`,
        );
      }
      return { state };
    },

    async cancelRun(backendRunId) {
      await request("cancel", `/api/issues/${backendRunId}`, {
        method: "PATCH",
        body: { status: "cancelled" },
      });
    },
  };
}
