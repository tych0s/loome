import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Runtime redirect to the game archive. The target origin is deployment
 * configuration (GAME_ARCHIVE_URL), never hardcoded in the public repo.
 */
export const Route = createFileRoute("/play")({
  loader: () => {
    throw redirect({ href: process.env.GAME_ARCHIVE_URL ?? "/" });
  },
});
