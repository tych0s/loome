# Versioning

Loome versions the platform, workers, SDK and game separately.

## Principles

- Every deployed game version is archived.
- Every archived version remains playable.
- Every cycle records proposal, votes, implementation run, commit, build result,
  release version and changelog.
- Reverts are first-class releases, not hidden mutations.

## Planned Version Units

```txt
loome-platform
loome-admin
loome-workers
loome-game
@loome/game-sdk
```

## Game Versioning

The game should use semantic versioning once the first playable release exists.

- Major: incompatible SDK/runtime break or large reset.
- Minor: new mechanic, mode, content family or visible capability.
- Patch: fix, balance adjustment, small polish or revert.

## Immutable Archive

Game releases should be available through immutable URLs and a moving current
URL:

```txt
/v/<version>/
/current/
```

The exact production host is intentionally not defined in public docs until the
deployment shape is finalized.
