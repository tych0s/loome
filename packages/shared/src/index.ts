import { z } from "zod";

export * from "./versions.ts";

/** The only path prefix the implementation backend may write to. */
export const GAME_WORKSPACE_PREFIX = "apps/game/";

/**
 * Bounded brief sent to the implementation backend. This is the only shape
 * that may cross the boundary; raw community text never does.
 */
export const implementationBriefSchema = z
  .object({
    cycleId: z.string().min(1),
    proposalId: z.string().min(1),
    title: z.string().min(1).max(200),
    goal: z.string().min(1).max(4000),
    allowedPaths: z
      .array(z.string().min(1))
      .min(1)
      .refine(
        (paths) =>
          paths.every(
            (path) =>
              path.startsWith(GAME_WORKSPACE_PREFIX) && !path.includes(".."),
          ),
        { message: `allowedPaths must stay inside ${GAME_WORKSPACE_PREFIX}` },
      ),
    acceptanceCriteria: z.array(z.string().min(1)).min(1),
    forbiddenChanges: z.array(z.string().min(1)),
    sdkConstraints: z.array(z.string().min(1)),
    publicSummary: z.string().min(1).max(1000),
  })
  .strict();

export type ImplementationBrief = z.infer<typeof implementationBriefSchema>;

/**
 * Sanitized run events that may be shown on public surfaces. Closed set:
 * anything not in this enum must never reach the public platform.
 */
export const PUBLIC_RUN_EVENTS = [
  "run_created",
  "plan_ready",
  "diff_ready",
  "tests_started",
  "tests_passed",
  "build_passed",
  "preview_ready",
  "deploy_started",
  "deploy_finished",
  "run_failed",
] as const;

export type PublicRunEvent = (typeof PUBLIC_RUN_EVENTS)[number];

export const publicRunEventSchema = z.enum(PUBLIC_RUN_EVENTS);

/**
 * Sanitized screenshot reference for a public run event: a public HTTPS image
 * URL owned by Loome. Never a backend or private URL (D8); the closed-enum
 * event type stays the security anchor and this only carries public artifacts.
 */
export const publicRunScreenshotSchema = z
  .string()
  .max(2048)
  .regex(/^https:\/\/\S+\.(png|webp)$/);

/**
 * A single sanitized run-log entry: a closed-enum event type plus optional
 * public artifacts. This is the only run-event shape public surfaces persist
 * or display; raw backend logs never take this form.
 */
export const publicRunEventRecordSchema = z
  .object({
    type: publicRunEventSchema,
    screenshot: publicRunScreenshotSchema.optional(),
  })
  .strict();

export type PublicRunEventRecord = z.infer<typeof publicRunEventRecordSchema>;

/**
 * Public run identifier owned by Loome. Private backend run identifiers must
 * be mapped to this format before being displayed anywhere public.
 */
export const publicRunIdSchema = z.string().regex(/^run_[a-z0-9]{8,32}$/);
