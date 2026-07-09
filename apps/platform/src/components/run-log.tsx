import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  FileDiff,
  FlaskConical,
  Hammer,
  Image as ImageIcon,
  ListChecks,
  Radio,
  Rocket,
  ScanEye,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  type PublicRun,
  type PublicRunEvent,
  type PublicRunEventRecord,
  RUN_EVENT_LABELS,
  RUN_STATE_LABELS,
  type RunState,
} from "../lib/run-log";

type IconType = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const EVENT_ICONS: Record<PublicRunEvent, IconType> = {
  run_created: Radio,
  plan_ready: ListChecks,
  diff_ready: FileDiff,
  tests_started: FlaskConical,
  tests_passed: FlaskConical,
  build_passed: Hammer,
  preview_ready: ImageIcon,
  deploy_started: Rocket,
  deploy_finished: CircleCheck,
  run_failed: CircleAlert,
};

export function RunLog({ run }: { run: PublicRun }) {
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-line border-b pb-5">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-muted transition hover:text-fg"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span className="font-semibold text-fg">Loome</span>
          </a>
          <span className="inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-muted text-sm">
            <Radio aria-hidden="true" className="size-4 text-accent-alt" />
            Live run
          </span>
        </header>

        <main className="flex flex-col gap-6">
          <section className="rounded-lg border border-line bg-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-faint text-sm">
                {run.publicRunId}
              </span>
              <StateBadge state={run.state} />
            </div>
            <h1 className="mt-3 text-balance font-semibold text-fg text-xl leading-snug sm:text-2xl">
              {run.publicSummary}
            </h1>
            <p className="mt-2 text-muted text-sm leading-6">
              A constrained AI implemented this community proposal. Every step
              is public and sanitized — the timeline below is the whole record.
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-faint text-sm font-semibold uppercase tracking-wide">
                Run timeline
              </h2>
              <span className="inline-flex items-center gap-1.5 text-faint text-xs">
                <ScanEye aria-hidden="true" className="size-3.5" />
                Sample run
              </span>
            </div>
            <ol className="flex flex-col">
              {run.events.map((event, index) => (
                <TimelineItem
                  // biome-ignore lint/suspicious/noArrayIndexKey: run events are an append-only ordered log with no stable id
                  key={`${event.type}-${index}`}
                  event={event}
                  isLast={index === run.events.length - 1}
                  failed={event.type === "run_failed"}
                />
              ))}
            </ol>
          </section>
        </main>

        <footer className="border-line border-t py-5 text-faint text-sm">
          Public cycles, public releases, public constraints.
        </footer>
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  isLast,
  failed,
}: {
  event: PublicRunEventRecord;
  isLast: boolean;
  failed: boolean;
}) {
  const Icon = EVENT_ICONS[event.type];
  const markerTone = failed
    ? "border-line-strong text-faint"
    : "border-accent-alt/40 text-accent-alt";

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute top-9 bottom-0 left-4 -translate-x-1/2 w-px bg-line"
        />
      )}
      <span
        className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-ink ${markerTone}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="font-medium text-fg">{RUN_EVENT_LABELS[event.type]}</h3>
        {event.screenshot && (
          <figure className="mt-3 overflow-hidden rounded-lg border border-line bg-ink">
            <img
              src={event.screenshot}
              alt="Preview of the game after this change"
              loading="lazy"
              className="block aspect-video w-full object-cover"
            />
            <figcaption className="border-line border-t px-3 py-2 text-faint text-xs">
              Preview of the change — what the update looks like in the game.
            </figcaption>
          </figure>
        )}
      </div>
    </li>
  );
}

function StateBadge({ state }: { state: RunState }) {
  const done = state === "delivered";
  const failed = state === "failed";
  const Icon = failed ? CircleAlert : done ? CircleCheck : Radio;
  const tone = failed
    ? "border-line-strong text-faint"
    : done
      ? "border-accent-alt/40 text-accent-alt"
      : "border-line text-muted";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-medium text-sm ${tone}`}
    >
      <Icon aria-hidden="true" className="size-4" />
      {RUN_STATE_LABELS[state]}
    </span>
  );
}
