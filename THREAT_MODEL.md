# Threat Model

This document describes the initial public threat model for Loome.

## Assets

- Production credentials and deploy authority.
- User accounts and sessions.
- Community content and moderation state.
- Game version archive.
- AI implementation logs and diffs.
- Admin actions and audit logs.
- Database integrity.

## Primary Attack Surfaces

- Community text and prompt injection attempts.
- Game iframe runtime.
- Proposal synthesis pipeline.
- AI implementer workspace.
- Public implementation logs.
- Pull requests from forks.
- CI and deployment configuration.
- Admin authentication and authorization.

## Key Risks

| Risk | Example | Baseline Mitigation |
| --- | --- | --- |
| Secret leakage | Token appears in logs or commits | Secret scanning, redaction, `.gitignore`, review gates |
| Prompt injection | User text instructs the implementer to ignore rules | Synthesizer boundary, no raw user text to implementer |
| Sandbox escape | Game reads platform cookies or calls internal APIs | Separate origin, iframe sandbox, strict SDK contract |
| Unauthorized deploy | Contributor or bot deploys to production | Protected CI, maintainer-controlled secrets |
| Malicious game change | Game code abuses browser capabilities | CSP, iframe restrictions, code review, automated checks |
| Admin compromise | Attacker controls moderation or release controls | MFA, least privilege, audit logs, kill switch |
| Supply-chain compromise | Dependency or workflow abuse | Lockfiles, pinned actions, dependency review |

## Public Log Rules

Public logs must not include:

- Secrets or token-like values.
- Raw production environment variables.
- Private user data.
- Admin-only operational details.
- Full untrusted prompt payloads.

## Review Cadence

The threat model should be updated whenever Loome adds a new authentication
flow, external service, deployment path, worker, game capability or AI
implementation permission.
