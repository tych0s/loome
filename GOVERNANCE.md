# Governance

Loome combines community participation with protected security boundaries.

The community may propose, debate and vote on the evolution of the game. The
platform, production infrastructure and security model remain under maintainer
control.

## Community Scope

Community governance can influence:

- Game mechanics and balance.
- Visual direction for the game.
- New game content and interactions.
- Reverts of recent game changes.

## Maintainer Scope

Maintainers control:

- Production deployment authority.
- Security policy and vulnerability handling.
- Database schema and access policies.
- Admin permissions and moderation tools.
- CI, release gates and infrastructure.
- The AI implementer sandbox.

## Permanent Constraints

These constraints cannot be removed by community vote:

- The game must run in a sandboxed browser runtime.
- The game must not access production secrets, platform cookies or the database.
- The AI implementer must not receive raw user-generated text.
- The AI implementer must not write outside its allowed workspace.
- Every voting cycle must include a revert option.
- Every deployed version must be auditable and archived.

## Decision Records

Meaningful architecture and governance decisions should be captured in public
docs or future architecture decision records.
