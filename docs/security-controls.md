# Security Controls

This is the initial control checklist for Loome.

## Repository Controls

- Ignore local agent metadata, `.env` files and local credentials.
- Keep `.env.example` value-free.
- Run secret scanning before commits and releases.
- Require review for security-sensitive paths.
- Pin or review CI actions and production dependencies.

## Runtime Controls

- Serve the game from a separate origin.
- Embed the game in a sandboxed iframe.
- Apply a restrictive Content Security Policy.
- Keep platform cookies and admin state unavailable to the game.
- Route game communication through the SDK contract.

## AI Controls

- Do not pass raw user text to the implementer.
- Sanitize and bound proposals before implementation.
- Restrict implementer filesystem access.
- Validate implementer diffs and logs.
- Prevent implementer-initiated production deploys.

## Implementation Backend Controls

- Use neutral public names for the backend contract.
- Keep concrete backend hosts, tokens and auth flows out of the public repo.
- Store backend credentials only in the deployment secret manager.
- Accept backend events only through authenticated webhooks or server-side
  polling.
- Convert private backend run IDs into Loome-owned public run IDs before
  displaying them.

## Logging Controls

- Redact secrets and token-like values.
- Avoid logging private user data.
- Separate public live logs from private operational logs.
- Keep audit logs for admin and release actions.

## Admin Controls

- Require strong authentication for admin access.
- Use least privilege for admin roles.
- Log moderation, veto, kill switch and release actions.
- Provide a kill switch for active implementation runs.
