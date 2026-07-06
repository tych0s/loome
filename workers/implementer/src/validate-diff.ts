import { GAME_WORKSPACE_PREFIX } from "@loome/shared";

/**
 * Server-side duplicate of the CI path gate (defense in depth): every file
 * changed by an implementation run must stay inside the game workspace.
 */
export function findForbiddenPaths(changedPaths: readonly string[]): string[] {
  return changedPaths.filter(
    (path) =>
      !path.startsWith(GAME_WORKSPACE_PREFIX) ||
      path.includes("..") ||
      path.startsWith("/"),
  );
}

export class DiffBoundaryError extends Error {
  readonly violations: string[];

  constructor(violations: string[]) {
    super(
      `implementation run changed files outside ${GAME_WORKSPACE_PREFIX}: ${violations.join(", ")}`,
    );
    this.violations = violations;
  }
}

export function assertDiffWithinGameWorkspace(
  changedPaths: readonly string[],
): void {
  const violations = findForbiddenPaths(changedPaths);
  if (violations.length > 0) {
    throw new DiffBoundaryError(violations);
  }
}
