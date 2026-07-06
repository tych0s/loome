import type { LoomeSdk, SdkKeyValueStorage, SdkPlayer } from "@loome/game-sdk";

function memoryStorage(store: Map<string, unknown>): SdkKeyValueStorage {
  return {
    get: (key) => Promise.resolve(store.get(key)),
    set: (key, value) => {
      store.set(key, value);
      return Promise.resolve();
    },
  };
}

/**
 * In-memory SDK used when the game runs outside the platform iframe, so every
 * archived version stays playable standalone forever. The platform provides
 * the real, server-backed SDK instead.
 */
export function createStandaloneSdk(version: string): LoomeSdk {
  const player: SdkPlayer = { id: "local-player", displayName: "Local Player" };
  const scores: Array<{ player: SdkPlayer; score: number }> = [];
  return {
    player,
    storage: {
      player: memoryStorage(new Map()),
      global: memoryStorage(new Map()),
    },
    leaderboard: {
      submit: (score) => {
        scores.push({ player, score });
        scores.sort((a, b) => b.score - a.score);
        return Promise.resolve();
      },
      top: (n) => Promise.resolve(scores.slice(0, n)),
    },
    events: {
      emit: () => {},
    },
    version,
  };
}
