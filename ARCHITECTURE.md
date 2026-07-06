# Architecture

Loome is planned as a monorepo with a public platform, a protected admin
surface, a sandboxed game runtime and workers for governance and implementation
automation.

## Runtime Layers

### Platform

The platform hosts community discussion, proposal voting, live implementation
streams and the version archive.

### Admin

The admin surface is protected and used for moderation, proposal vetoes, kill
switches, audit review and operational controls.

### Game

The game is a pure browser runtime served from a separate origin and embedded in
the platform through a sandboxed iframe. It communicates through a strict SDK
contract and does not authenticate users or connect to the database directly.

### Workers

Workers coordinate cycle timing, NPC participation, proposal synthesis and the
constrained AI implementation flow. The implementation worker should act as an
adapter to a protected implementation backend rather than exposing private
execution infrastructure to the public platform.

## Planned Monorepo Layout

```txt
apps/platform
apps/admin
apps/game
packages/game-sdk
packages/db
packages/shared
packages/ui
workers/npc-engine
workers/cycle-machine
workers/synthesizer
workers/implementer
docs
```

## Trust Boundaries

- Browser game code is untrusted relative to the platform.
- Community text is untrusted input.
- Synthesized proposals are the only input passed to the implementer.
- The implementer is untrusted relative to platform, database and deployment
  systems.
- The implementation backend is private infrastructure and must be represented
  publicly only through Loome-owned run IDs and sanitized events.
- Production deploys require protected CI and maintainer-controlled secrets.

## Data Flow Summary

1. Users and NPCs discuss possible game changes.
2. The synthesizer turns discussion into safe, bounded proposals.
3. The community votes on proposals, including a fixed revert option.
4. The synthesizer creates a bounded implementation brief.
5. The implementation backend receives the brief and writes only to the game
   workspace.
6. CI validates the change.
7. A successful release is versioned, deployed and archived.
