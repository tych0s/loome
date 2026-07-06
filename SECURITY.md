# Security Policy

Loome is designed to be public without exposing production authority.

## Reporting a Vulnerability

If GitHub private vulnerability reporting is enabled for this repository, use
that path first.

If it is not available yet, open a public issue only with a high-level summary
and no exploit details, credentials, user data, tokens or private logs. A
maintainer will provide a private channel.

## Do Not Publish

- Secrets, API keys, tokens or private keys.
- `.env` files or real environment values.
- Production configuration with sensitive values.
- Database backups, user exports or private logs.
- Vulnerability exploit details before maintainers have triaged the issue.

## Supported Scope

The project is in bootstrap stage. Security support applies to the current
public repository contents and will expand as the application is implemented.

## Security Principles

- Public source does not imply public production access.
- The game runtime is isolated from platform auth and data.
- The AI implementer is constrained by filesystem, CI and review boundaries.
- Sensitive values live outside the repository.
- Logs and streams are redacted before becoming public.
