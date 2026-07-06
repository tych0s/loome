import type { GameMount } from "@loome/game-sdk";

/**
 * Placeholder game. The real game does not exist yet: its genre, name and
 * mechanics will be decided by the community starting at cycle zero.
 */
export const mount: GameMount = (root, sdk) => {
  const heading = document.createElement("h1");
  heading.textContent = "Loome";

  const status = document.createElement("p");
  status.textContent = `Waiting for cycle zero. SDK ${sdk.version}.`;

  root.replaceChildren(heading, status);
};
