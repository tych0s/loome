# Loome

Loome is an open source autonomous community game platform.

The community proposes ideas, debates them, votes on the next change and watches
a constrained AI implementation agent apply the winning proposal to a browser
game. The game starts empty and evolves through public, auditable cycles.

## Core Promise

- Every change is visible.
- Every released version is archived and playable.
- Every AI action is constrained and auditable.
- Public code never grants production access.

## Current Status

This repository is in bootstrap stage. The public documentation and safety rules
are being prepared before the application skeleton is added.

## Planned Architecture

```txt
apps/platform          Community app, chat, voting, archive and live run view
apps/admin             Protected moderation and operations panel
apps/game              Sandboxed browser game workspace
packages/game-sdk      Contract between platform and game
packages/db            Database schema and migrations
packages/shared        Shared types, schemas and utilities
packages/ui            Shared UI components
workers/npc-engine     NPC behavior and participation
workers/cycle-machine  Governance cycle orchestration
workers/synthesizer    Proposal sanitation and synthesis
workers/implementer    Constrained AI build runner
docs                   Public architecture and security documentation
```

## Non-Negotiable Security Principles

- The game runs in a sandboxed iframe on a separate origin.
- The game never authenticates users directly and never connects directly to the
  database.
- The AI implementer can write only inside `apps/game`.
- The AI implementer receives sanitized proposals, not raw community text.
- Production secrets, production config, user data and private logs are never
  committed to the repository.
- Production deployment remains controlled by protected systems and required
  quality gates.

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Threat Model](THREAT_MODEL.md)
- [Security Policy](SECURITY.md)
- [Governance](GOVERNANCE.md)
- [Contributing](CONTRIBUTING.md)
- [Agent Instructions](docs/agent-instructions.md)
- [Agent Sandbox](docs/agent-sandbox.md)
- [Versioning](docs/versioning.md)
- [Deployment](docs/deployment.md)
- [Security Controls](docs/security-controls.md)

## Local Development

The runnable application skeleton has not been committed yet. When it exists,
setup commands and required environment variables will be documented here and in
`.env.example`.

Do not put real secrets in `.env.example` or any committed file.

## Public Safety Check

Before publishing, pushing or opening a public PR, run:

```sh
./scripts/check-public-safety.sh
```

The check scans Git-public candidate files and fails on internal system
references, blocked local metadata files, environment files and common secret
patterns.
