/** Player identity as exposed to the game. Contains no auth material. */
export interface SdkPlayer {
  id: string;
  displayName: string;
}

export interface SdkKeyValueStorage {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

export interface SdkLeaderboard {
  submit(score: number): Promise<void>;
  top(n: number): Promise<Array<{ player: SdkPlayer; score: number }>>;
}

export interface SdkEvents {
  emit(name: string, payload: Record<string, unknown>): void;
}

/**
 * The SDK is the only I/O surface available to the game. It never exposes
 * authentication material, cookies, direct network access or database access.
 * All writes are validated and rate-limited server-side.
 */
export interface LoomeSdk {
  player: SdkPlayer;
  storage: {
    player: SdkKeyValueStorage;
    global: SdkKeyValueStorage;
  };
  leaderboard: SdkLeaderboard;
  events: SdkEvents;
  version: string;
}

/** Every Loome game exports exactly one entry point with this signature. */
export type GameMount = (
  root: HTMLElement,
  sdk: LoomeSdk,
) => void | Promise<void>;
