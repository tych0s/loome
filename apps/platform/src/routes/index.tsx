import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Code2, Play, Radio, ShieldCheck } from "lucide-react";
import { CommunityChat } from "../components/community-chat";

export const Route = createFileRoute("/")({
  component: Home,
});

/** Server-side redirect to the archive (origin is deployment config). */
const GAME_ARCHIVE_URL = "/play";

const PIPELINE = [
  {
    phase: "Discuss",
    detail: "Public chat collects genre, name, and first-mechanic proposals.",
  },
  {
    phase: "Vote",
    detail:
      "Sanitized proposals go to a weighted vote; revert is always on the ballot.",
  },
  {
    phase: "Build",
    detail:
      "A constrained AI implements the winner live, caged to the game workspace.",
  },
  {
    phase: "Archive",
    detail:
      "Every release ships to an immutable URL and stays playable forever.",
  },
] as const;

function Home() {
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-line border-b pb-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md border border-line-strong bg-panel text-accent">
              <Radio aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-muted text-sm">Pre-season</p>
              <h1 className="text-3xl font-bold text-fg sm:text-4xl">Loome</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/runs"
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 font-semibold text-fg transition hover:border-line-strong"
            >
              <Radio aria-hidden="true" className="size-4" />
              Live run
            </a>
            <a
              href="https://github.com/tych0s/loome"
              className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 font-semibold text-fg transition hover:border-line-strong"
            >
              <Code2 aria-hidden="true" className="size-4" />
              Source
            </a>
            <a
              href={GAME_ARCHIVE_URL}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 font-semibold text-ink transition hover:bg-accent-soft"
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Play
            </a>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(27rem,1.14fr)]">
          <section className="flex flex-col justify-between gap-8 py-3 lg:min-h-[38rem]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-muted text-sm">
                <span className="size-2 rounded-full bg-accent-alt" />
                Cycle zero coming
              </div>
              <h2 className="max-w-2xl text-4xl font-bold leading-tight text-fg sm:text-5xl">
                The community room where the first version of the game is
                decided.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                Chat opens the loop: people propose the game&apos;s first shape,
                sanitized candidates go to a vote, and the winning brief moves
                into a constrained implementation run.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-accent-alt">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  <h3 className="font-semibold text-fg">Safety boundary</h3>
                </div>
                <p className="mt-2 text-muted text-sm leading-6">
                  Public chat stays on the platform; implementation agents only
                  receive validated briefs for files under the game workspace.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-panel p-4">
                <div className="flex items-center gap-2 text-accent-alt">
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  <h3 className="font-semibold text-fg">Archive first</h3>
                </div>
                <p className="mt-2 text-muted text-sm leading-6">
                  Every playable release keeps an immutable URL, so the public
                  history remains inspectable as the game changes.
                </p>
              </div>
            </div>
          </section>

          <CommunityChat />
        </main>

        <section>
          <h2 className="text-faint text-sm font-semibold">Cycle pipeline</h2>
          <ol className="mt-3 grid gap-3 md:grid-cols-4">
            {PIPELINE.map((step, index) => (
              <li
                key={step.phase}
                className="rounded-lg border border-line p-4"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-accent-alt text-sm">
                    0{index + 1}
                  </span>
                  <h3 className="font-semibold text-fg">{step.phase}</h3>
                </div>
                <p className="mt-2 text-muted text-sm leading-6">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <footer className="border-line border-t py-5 text-faint text-sm">
          Open source. Public cycles, public releases, public constraints.
        </footer>
      </div>
    </div>
  );
}
