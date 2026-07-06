# Agent Sandbox

Loome's autonomous implementer is intentionally constrained.

## Allowed Scope

The implementer may write only inside:

```txt
apps/game
```

It may read only the context needed to implement the winning sanitized proposal.

## Forbidden Scope

The implementer must not modify:

```txt
apps/platform
apps/admin
packages/db
workers
.github
infra
deployment config
secret config
```

## Context Firewall

The implementer must not receive raw community text. Community discussion is
untrusted input and may contain prompt injection attempts.

Only sanitized proposals produced by the synthesizer may be passed to the
implementer.

## Enforcement

The boundary should be enforced through:

- Filesystem permissions.
- Repository checks.
- CI path guards.
- Review requirements.
- Runtime environment separation.

Prompt instructions are not enough by themselves.

## Output Validation

Implementation output should be checked for:

- Writes outside the allowed path.
- Token-like values in logs or diffs.
- Network calls from the game that bypass the SDK.
- Unsafe browser APIs.
- Broken build, test or runtime checks.
