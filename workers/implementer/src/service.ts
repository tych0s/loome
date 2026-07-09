import { randomUUID } from "node:crypto";
import {
  type ImplementationBrief,
  implementationBriefSchema,
  type PublicRunEvent,
  type PublicRunEventRecord,
  publicRunEventRecordSchema,
} from "@loome/shared";
import type { BackendClient, BackendRunState } from "./backend-client";

/** Loome-owned public run identifier. Backend ids never leave this module. */
export function createPublicRunId(): string {
  return `run_${randomUUID().replaceAll("-", "")}`;
}

interface RunRecord {
  publicRunId: string;
  /** Private backend identifier — must never appear on public surfaces. */
  backendRunId: string;
  brief: ImplementationBrief;
  state: BackendRunState;
  events: PublicRunEventRecord[];
}

/** Public projection of a run. Contains no backend identifiers. */
export interface PublicRunView {
  publicRunId: string;
  state: BackendRunState;
  publicSummary: string;
  events: PublicRunEventRecord[];
}

/**
 * Appends a sanitized run-log entry. The closed enum validates the type and an
 * optional public screenshot url is carried through; the schema strips anything
 * else so no raw backend data can ride along.
 */
function emit(
  record: RunRecord,
  type: PublicRunEvent,
  screenshot?: string,
): PublicRunEventRecord {
  const event = publicRunEventRecordSchema.parse(
    screenshot === undefined ? { type } : { type, screenshot },
  );
  record.events.push(event);
  return event;
}

function eventForState(state: BackendRunState): PublicRunEvent | null {
  switch (state) {
    case "delivered":
      return "diff_ready";
    case "failed":
      return "run_failed";
    default:
      return null;
  }
}

function toPublicView(record: RunRecord): PublicRunView {
  return {
    publicRunId: record.publicRunId,
    state: record.state,
    publicSummary: record.brief.publicSummary,
    events: [...record.events],
  };
}

/**
 * Adapter between Loome and the protected implementation backend: validates
 * briefs, owns the public run id mapping, polls for coarse state, sanitizes
 * events and exposes the admin kill switch.
 */
export class ImplementerService {
  private readonly runs = new Map<string, RunRecord>();

  constructor(private readonly client: BackendClient) {}

  /** Validates and submits a brief. Rejects before any network call. */
  async startRun(input: unknown): Promise<PublicRunView> {
    const brief = implementationBriefSchema.parse(input);
    const { backendRunId } = await this.client.submitRun(brief);
    const record: RunRecord = {
      publicRunId: createPublicRunId(),
      backendRunId,
      brief,
      state: "queued",
      events: [],
    };
    emit(record, "run_created");
    this.runs.set(record.publicRunId, record);
    return toPublicView(record);
  }

  /** Polls the backend once and returns newly emitted public events. */
  async poll(publicRunId: string): Promise<PublicRunEventRecord[]> {
    const record = this.require(publicRunId);
    if (record.state === "delivered" || record.state === "failed") {
      return [];
    }
    const { state } = await this.client.getRunStatus(record.backendRunId);
    if (state === record.state) {
      return [];
    }
    record.state = state;
    const event = eventForState(state);
    if (!event) {
      return [];
    }
    return [emit(record, event)];
  }

  /** Admin kill switch: cancels the backend run and fails the public run. */
  async kill(publicRunId: string): Promise<PublicRunView> {
    const record = this.require(publicRunId);
    if (record.state !== "delivered" && record.state !== "failed") {
      await this.client.cancelRun(record.backendRunId);
      record.state = "failed";
      emit(record, "run_failed");
    }
    return toPublicView(record);
  }

  getRun(publicRunId: string): PublicRunView | undefined {
    const record = this.runs.get(publicRunId);
    return record ? toPublicView(record) : undefined;
  }

  private require(publicRunId: string): RunRecord {
    const record = this.runs.get(publicRunId);
    if (!record) {
      throw new Error(`unknown run: ${publicRunId}`);
    }
    return record;
  }
}
