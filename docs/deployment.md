# Deployment

This document describes the public deployment model without exposing production
authority.

## Principles

- Public code does not contain production credentials.
- Production deploys are controlled by protected CI and maintainers.
- Secrets are provided by the deployment environment, not committed files.
- Every release must pass required quality and security gates.
- Game releases are archived and traceable.

## Environments

The project should use separate local, preview and production environments.

Environment-specific values belong in the secret manager or deployment platform.
Committed files may contain only safe placeholders and documentation.

## Required Gates

Before production deploy, CI should verify:

- Type checks.
- Formatting and linting.
- Unit and integration tests.
- Game sandbox checks.
- Path restrictions for AI-generated changes.
- Secret scanning.
- Build success.

## Rollback

Rollbacks should create an auditable release record. The community voting cycle
must always include a revert option for the most recent game change.
