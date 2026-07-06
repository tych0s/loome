# Implementation Backend

Loome uses an autonomous implementation backend to turn community-approved game
changes into code, previews and deployable game builds.

This document intentionally describes the public contract only. The concrete
private system behind the backend is deployment configuration, not public
repository knowledge.

## Responsibilities

Loome owns:

- Community discussion and voting.
- Proposal moderation and synthesis.
- Public implementation status.
- Version archive and changelog records.
- Admin approvals, vetoes and kill switches.

The implementation backend owns:

- Running the coding agent in an isolated workspace.
- Applying the sanitized implementation brief.
- Producing diffs, tests, builds and previews.
- Returning sanitized status events to Loome.

## Flow

```txt
community discussion
  -> moderation
  -> sanitized proposal candidates
  -> admin veto window
  -> community vote
  -> implementation brief
  -> implementation backend run
  -> path/security/build gates
  -> preview
  -> deployable game release
  -> archive
```

## Implementation Brief

Loome must never send raw user text to the backend. It sends a bounded brief:

```txt
cycleId
proposalId
title
goal
allowedPaths
acceptanceCriteria
forbiddenChanges
sdkConstraints
publicSummary
```

The default allowed path is:

```txt
apps/game/**
```

## Backend Events

Only sanitized events may be shown publicly:

```txt
run_created
plan_ready
diff_ready
tests_started
tests_passed
build_passed
preview_ready
deploy_started
deploy_finished
run_failed
```

Raw backend logs, internal URLs, tokens, local paths and provider details must
remain private.

## Autonomy Model

Loome should be autonomous by default, with non-bypassable gates:

- The backend may start automatically after a winning vote and veto window.
- The backend may only write to approved game paths.
- Production game deploys require passing checks.
- Platform, admin, database, CI and infrastructure changes are never automated
  through community votes.
- Admins must be able to stop or reject a run.

## Public Naming

Public code and docs should use neutral names:

```txt
Implementation Backend
Loome Implementer
ImplementationRun
IMPLEMENTER_BACKEND_URL
IMPLEMENTER_BACKEND_TOKEN
IMPLEMENTER_WEBHOOK_SECRET
```

Do not commit private backend product names, internal domains, auth challenge
flows, local operator paths or private runbooks.
