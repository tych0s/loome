# AGENTS.md

Guidance for automated coding agents contributing to this repository.

Loome is a public open source project. Treat every committed byte as visible
to contributors, users and security researchers. The full agent policy lives
in [docs/agent-instructions.md](docs/agent-instructions.md); this file is the
short operational version.

## Repository Shape

```txt
apps/game              Browser game workspace (only implementer-writable path)
packages/game-sdk      Platform <-> game type contract (MIT licensed)
packages/shared        Shared schemas: implementation brief, public run events
packages/db            Drizzle schema and SQL migrations
workers/implementer    Adapter to the protected implementation backend
docs                   Public architecture and security documentation
scripts                Safety and CI gate scripts
```

Additional workspaces (`apps/platform`, `apps/admin`, `packages/db`,
`packages/ui`, `workers/*`) are added when they gain real content. See
[README.md](README.md) for the planned layout.

## Commands

```sh
pnpm install                      # install (lockfile is authoritative)
pnpm check                        # Biome lint + format check
pnpm typecheck                    # strict TypeScript across workspaces
pnpm test                         # Vitest across workspaces
./scripts/check-public-safety.sh  # public leak scan (run before any push)
./scripts/check-agent-paths.sh    # implementer boundary gate (agent/* branches)
```

## Hard Rules

- Never commit secrets, `.env` files, private keys, local auth stores or
  private logs. `.env.example` stays shape-only.
- The autonomous game implementer may only change files under `apps/game/`.
  Branches named `agent/*` fail CI if they touch anything else.
- Never expose raw user-generated text to an implementation agent; only
  sanitized briefs validated by `packages/shared` schemas.
- Public surfaces may only show run events from the closed enum in
  `packages/shared`; never raw backend logs or private run identifiers.
- Do not weaken tests, CI gates, sandbox rules or the safety scripts.

## Style

- Strict TypeScript, Biome for lint/format, small surgical diffs.
- Add or update tests for meaningful behavior changes.
- Document new environment variables in `.env.example` (names only).
