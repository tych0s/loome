# Contributing

Thanks for helping build Loome.

Loome is designed to be public, auditable and safe by default. Contributions
should preserve that model.

## Before You Start

- Read [ARCHITECTURE.md](ARCHITECTURE.md) and [THREAT_MODEL.md](THREAT_MODEL.md).
- Keep secrets, local credentials, private logs and user data out of commits.
- Use `.env.example` only for variable names and comments.

## Pull Request Expectations

- Keep each PR focused on one change.
- Explain the user-visible behavior or security reason for the change.
- Add or update tests when behavior changes.
- Document new environment variables in `.env.example`.
- Do not weaken the game sandbox, AI implementer boundary or deployment gates.
- Run `./scripts/check-public-safety.sh` before opening a public PR.

## Commit Style

Use concise, descriptive commit messages. Conventional Commits are preferred:

```txt
feat: add proposal voting model
fix: redact token-like values from run logs
docs: describe game sandbox boundary
```

## Security-Sensitive Changes

Changes to auth, database policies, CI, deployment, logging, sandboxing,
proposal synthesis, implementer permissions or admin actions require extra
maintainer review.

Do not open a public issue containing a real vulnerability exploit, credential,
private token, user data or production detail. Use the security reporting path
in [SECURITY.md](SECURITY.md).
