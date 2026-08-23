# Domain-layer agent instructions

Applies to `src/domain/` in addition to parent instructions.

This layer contains pure, platform-agnostic game rules.

- No Phaser, DOM, storage, Yandex SDK or rendering imports.
- Randomness must be injected through a small random-source boundary so rules are deterministic in tests.
- Economy-affecting formulas must have focused unit tests.
- Prefer explicit inputs/outputs over hidden mutable state.
- Keep stable persisted/content IDs opaque; domain logic may compare them but should not invent presentation-specific meaning.
- Changes to valuation, bidding, restoration or progression formulas require reading `docs/ECONOMY_AND_RETENTION.md` and updating tests.
