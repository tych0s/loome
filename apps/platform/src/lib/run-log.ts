/**
 * Public run-log types for the platform.
 *
 * These mirror the canonical contract in `@loome/shared` (PublicRunEvent /
 * PublicRunEventRecord): public surfaces only ever show the closed event enum
 * plus a sanitized screenshot url, never raw backend data. The shapes are kept
 * local so the platform stays free of a build-time dependency on the schema
 * package — keep them in sync with @loome/shared if the contract changes.
 */

export type PublicRunEvent =
  | "run_created"
  | "plan_ready"
  | "diff_ready"
  | "tests_started"
  | "tests_passed"
  | "build_passed"
  | "preview_ready"
  | "deploy_started"
  | "deploy_finished"
  | "run_failed";

export interface PublicRunEventRecord {
  type: PublicRunEvent;
  /** Public https image url (png/webp) owned by Loome, when the step is visual. */
  screenshot?: string;
}

export type RunState = "queued" | "working" | "delivered" | "failed";

/** Sanitized public projection of an implementation run. */
export interface PublicRun {
  publicRunId: string;
  state: RunState;
  publicSummary: string;
  events: PublicRunEventRecord[];
}

/** Human labels for each closed-enum event type. */
export const RUN_EVENT_LABELS: Record<PublicRunEvent, string> = {
  run_created: "Run created",
  plan_ready: "Plan ready",
  diff_ready: "Changes ready",
  tests_started: "Tests started",
  tests_passed: "Tests passed",
  build_passed: "Build passed",
  preview_ready: "Preview ready",
  deploy_started: "Deploy started",
  deploy_finished: "Deployed",
  run_failed: "Run failed",
};

export const RUN_STATE_LABELS: Record<RunState, string> = {
  queued: "Queued",
  working: "Working",
  delivered: "Delivered",
  failed: "Failed",
};

/**
 * Illustrative run shown until a live cycle is running, mirroring the pattern
 * used by the community chat. The preview step carries a real screenshot of the
 * current game build so the visual payoff is honest, not mocked chrome.
 */
export const SAMPLE_RUN: PublicRun = {
  publicRunId: "run_7f3a9c2e5b1d4a80",
  state: "delivered",
  publicSummary:
    "Add a title screen with the game name and a Play button, as the community voted.",
  events: [
    { type: "run_created" },
    { type: "plan_ready" },
    { type: "diff_ready" },
    { type: "tests_started" },
    { type: "tests_passed" },
    { type: "build_passed" },
    { type: "preview_ready", screenshot: "/sample-run-preview.png" },
    { type: "deploy_started" },
    { type: "deploy_finished" },
  ],
};
