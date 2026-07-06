# Agent Instructions

Instructions for automated agents contributing to Loome.

Loome is a public open source project. Treat everything committed to this
repository as visible to contributors, users and security researchers.

## Project

Loome is an autonomous community game platform. The community proposes and votes
on changes to a browser game, while a constrained AI implementer applies the
winning safe change inside the game workspace.

The repository is being initialized. Prefer simple, reviewable changes and avoid
adding infrastructure or framework complexity before the project skeleton exists.

## Public Safety Rules

- Never commit secrets, `.env` files, private keys, database dumps, local auth
  stores, production config, user exports or private logs.
- Keep `.env.example` shape-only: variable names and comments, no real values.
- Do not put production authority in public code. Public source may describe
  deployment, but real credentials and access remain outside the repository.
- Do not expose raw user-generated text to an AI implementer. Use sanitized,
  synthesized proposals only.
- Do not give the AI implementer access outside the allowed game workspace.

## Planned Repository Shape

```txt
apps/platform          Public web app
apps/admin             Protected admin interface
apps/game              Browser game workspace
packages/game-sdk      Game runtime contract
packages/db            Drizzle schema and migrations
packages/shared        Shared types and validation
packages/ui            Shared UI components
workers/npc-engine     NPC behavior
workers/cycle-machine  Governance cycle state machine
workers/synthesizer    Proposal synthesis and moderation
workers/implementer    AI implementation runner
docs                   Public architecture and security docs
```

## Implementation Discipline

- Keep changes surgical and easy to review.
- Match existing local conventions once code exists.
- Prefer typed, validated boundaries for APIs and workers.
- Add or update tests for meaningful behavior changes.
- Run the cheapest useful local check while developing; run full project gates
  before release or handoff once those scripts exist.

## Game Implementer Boundary

The autonomous implementer must only write game code in `apps/game`. Platform,
admin, database, workers, CI and deployment files require maintainer review and
must not be changed by the game implementer.

## Security Review Checklist

Before opening or merging a PR, verify:

- No real secrets or local machine paths are included.
- Public logs and implementation streams redact credentials and tokens.
- New environment variables are documented in `.env.example`.
- Any external service integration validates signatures or sessions.
- Any game iframe/runtime change preserves sandboxing and origin isolation.
