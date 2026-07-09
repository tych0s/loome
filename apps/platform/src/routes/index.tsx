import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Code2,
  Eye,
  Gamepad2,
  type LucideIcon,
  MessagesSquare,
  Play,
  Radio,
  ShieldCheck,
  Vote,
} from "lucide-react";
import { CommunityChat } from "../components/community-chat";

export const Route = createFileRoute("/")({
  component: Home,
});

/** Server-side redirect to the archive (origin is deployment config). */
const GAME_ARCHIVE_URL = "/play";
const SOURCE_URL = "https://github.com/tych0s/loome";

const LOOP = [
  {
    icon: MessagesSquare,
    title: "Discuss",
    body: "Anyone drops in and proposes what the game should become — a genre, a name, a single mechanic.",
  },
  {
    icon: Vote,
    title: "Vote",
    body: "Ideas are sanitized into clean proposals and put to a weighted vote. Reverting is always on the ballot.",
  },
  {
    icon: Bot,
    title: "Build",
    body: "A constrained AI implements the winner live, caged to the game's own workspace. You watch it happen.",
  },
  {
    icon: Gamepad2,
    title: "Ship",
    body: "The new version ships to a permanent URL and stays playable forever. Then the next cycle begins.",
  },
] as const;

const TRUST = [
  {
    icon: Eye,
    title: "Public by default",
    body: "Every proposal, vote, and AI action is visible and auditable. The whole build happens in the open — no black boxes.",
  },
  {
    icon: ShieldCheck,
    title: "A builder on a leash",
    body: "The AI can only touch the game's own workspace, and only from sanitized, community-approved briefs. It never sees raw chat.",
  },
  {
    icon: Gamepad2,
    title: "Playable forever",
    body: "Every release keeps its own immutable URL, so the entire history stays playable as the game changes shape.",
  },
] as const;

function Home() {
  return (
    <div className="relative overflow-hidden">
      <BackdropGlow />
      <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <SiteNav />
        <Hero />
        <LoopSection />
        <TrustSection />
        <LiveRoomSection />
        <ClosingCta />
        <SiteFooter />
      </div>
    </div>
  );
}

function BackdropGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute right-[-12%] top-[-14rem] h-[38rem] w-[38rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(215,255,102,0.15), transparent 62%)",
        }}
      />
      <div
        className="absolute left-[-16%] top-[24rem] h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(75,209,197,0.12), transparent 62%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line-strong) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(120% 80% at 50% 0%, black 30%, transparent 78%)",
        }}
      />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="flex items-center justify-between gap-4 py-5">
      <a href="/" className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg border border-line-strong bg-panel text-accent">
          <Radio aria-hidden="true" className="size-5" />
        </span>
        <span className="font-bold text-fg text-xl tracking-tight">Loome</span>
      </a>
      <nav className="hidden items-center gap-7 text-muted text-sm md:flex">
        <a className="transition hover:text-fg" href="#how">
          How it works
        </a>
        <a className="transition hover:text-fg" href="/runs">
          Live runs
        </a>
        <a className="transition hover:text-fg" href={GAME_ARCHIVE_URL}>
          Play
        </a>
      </nav>
      <div className="flex items-center gap-2.5">
        <a
          href={SOURCE_URL}
          className="hidden items-center gap-2 rounded-md border border-line px-3.5 py-2 font-semibold text-fg text-sm transition hover:border-line-strong sm:inline-flex"
        >
          <Code2 aria-hidden="true" className="size-4" />
          Source
        </a>
        <a
          href="#chat"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-ink text-sm transition hover:bg-accent-soft"
        >
          Join the chat
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grid items-center gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pb-24">
      <div>
        <LivePill />
        <h1 className="mt-5 text-balance font-bold text-5xl text-fg leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]">
          The game the internet{" "}
          <span className="text-accent">builds together.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted leading-8">
          Loome starts as an empty game. The community proposes what happens
          next, votes on it, and watches a constrained AI build the winner —
          live, in public, one cycle at a time.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#chat"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-ink transition hover:bg-accent-soft"
          >
            Jump into cycle zero
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
          <a
            href="/runs"
            className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-3 font-semibold text-fg transition hover:border-accent-alt hover:text-accent-alt"
          >
            <Eye aria-hidden="true" className="size-4" />
            Watch a build run
          </a>
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-faint text-sm">
          <span>Open source</span>
          <span aria-hidden="true">·</span>
          <span>Every change is public</span>
          <span aria-hidden="true">·</span>
          <span>Archived forever</span>
        </p>
      </div>
      <HeroPreview />
    </section>
  );
}

function LivePill() {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/70 px-3.5 py-1.5 font-medium text-muted text-sm backdrop-blur">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
        <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
      </span>
      Cycle zero is forming now
    </span>
  );
}

function HeroPreview() {
  return (
    <div className="loome-float relative">
      <div
        className="rounded-2xl border border-line-strong bg-panel p-2.5 shadow-2xl"
        style={{ boxShadow: "0 40px 120px -30px rgba(0,0,0,0.75)" }}
      >
        <div className="flex items-center gap-2 px-2 pt-1 pb-2.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-2 font-mono text-faint text-xs">
            loome.game / v0.0.0
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-accent-alt/40 px-2 py-0.5 font-medium text-[0.7rem] text-accent-alt">
            <span className="size-1.5 rounded-full bg-accent-alt" />
            Live
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-line bg-ink">
          <img
            src="/sample-run-preview.png"
            alt="The current Loome game build"
            className="block aspect-video w-full object-cover"
          />
          <div className="border-line border-t px-4 py-3">
            <p className="font-medium text-fg text-sm">
              This is the game right now.
            </p>
            <p className="mt-0.5 text-muted text-sm leading-6">
              Empty, waiting for cycle zero. You decide what it becomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoopSection() {
  return (
    <section
      id="how"
      className="scroll-mt-20 border-line border-t py-16 sm:py-20"
    >
      <div className="max-w-2xl">
        <SectionEyebrow>How a cycle works</SectionEyebrow>
        <h2 className="mt-3 font-bold text-3xl text-fg tracking-tight sm:text-4xl">
          Four steps, on repeat, forever.
        </h2>
        <p className="mt-4 text-lg text-muted leading-8">
          Every change to the game moves through the same public loop. Nothing
          ships that the community did not choose.
        </p>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LOOP.map((step, index) => (
          <li
            key={step.title}
            className="relative rounded-xl border border-line bg-panel/60 p-5 transition hover:border-line-strong"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-lg border border-line-strong bg-ink text-accent">
                <step.icon aria-hidden="true" className="size-5" />
              </span>
              <span className="font-mono text-faint text-sm">0{index + 1}</span>
            </div>
            <h3 className="mt-4 font-semibold text-fg text-lg">{step.title}</h3>
            <p className="mt-1.5 text-muted text-sm leading-6">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="border-line border-t py-16 sm:py-20">
      <div className="max-w-2xl">
        <SectionEyebrow>Why it&apos;s different</SectionEyebrow>
        <h2 className="mt-3 font-bold text-3xl text-fg tracking-tight sm:text-4xl">
          An experiment you can trust to stay honest.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {TRUST.map((item) => (
          <TrustCard key={item.title} icon={item.icon} title={item.title}>
            {item.body}
          </TrustCard>
        ))}
      </div>
    </section>
  );
}

function TrustCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel/60 p-6">
      <span className="grid size-11 place-items-center rounded-lg border border-line-strong bg-ink text-accent-alt">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="mt-4 font-semibold text-fg text-lg">{title}</h3>
      <p className="mt-2 text-muted text-sm leading-6">{children}</p>
    </div>
  );
}

function LiveRoomSection() {
  return (
    <section
      id="chat"
      className="scroll-mt-20 border-line border-t py-16 sm:py-20"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="lg:sticky lg:top-16">
          <SectionEyebrow>Live now</SectionEyebrow>
          <h2 className="mt-3 font-bold text-3xl text-fg tracking-tight sm:text-4xl">
            The room where cycle zero happens.
          </h2>
          <p className="mt-4 text-lg text-muted leading-8">
            Real people and AI citizens are shaping the first playable release.
            Jump in, pitch the genre, and be one of the first voices on the
            record.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-muted text-sm">
            <Bullet>Post a proposal for the game&apos;s first shape.</Bullet>
            <Bullet>AI citizens always wear a badge — no hidden bots.</Bullet>
            <Bullet>
              Everything you say here stays public and on the record.
            </Bullet>
          </div>
        </div>
        <CommunityChat />
      </div>
    </section>
  );
}

function Bullet({ children }: { children: string }) {
  return (
    <span className="flex items-start gap-2.5">
      <ArrowUpRight
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-accent-alt"
      />
      <span>{children}</span>
    </span>
  );
}

function ClosingCta() {
  return (
    <section className="py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-panel px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 120% at 50% 0%, rgba(215,255,102,0.12), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance font-bold text-3xl text-fg tracking-tight sm:text-4xl">
            Cycle zero is about to begin.
          </h2>
          <p className="mt-4 text-lg text-muted leading-8">
            The game has no genre, no name, no rules yet. Get in early and help
            decide the very first thing Loome becomes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#chat"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-ink transition hover:bg-accent-soft"
            >
              <MessagesSquare aria-hidden="true" className="size-4" />
              Join the chat
            </a>
            <a
              href={GAME_ARCHIVE_URL}
              className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-5 py-3 font-semibold text-fg transition hover:border-line-strong hover:bg-ink"
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Play the current build
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <span className="font-semibold text-accent-alt text-sm uppercase tracking-[0.14em]">
      {children}
    </span>
  );
}

function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 border-line border-t py-8 text-faint text-sm sm:flex-row sm:items-center sm:justify-between">
      <p>Open source — public cycles, public releases, public constraints.</p>
      <div className="flex items-center gap-5">
        <a className="transition hover:text-fg" href="/runs">
          Live runs
        </a>
        <a className="transition hover:text-fg" href={GAME_ARCHIVE_URL}>
          Archive
        </a>
        <a
          className="inline-flex items-center gap-1 transition hover:text-fg"
          href={SOURCE_URL}
        >
          GitHub
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
