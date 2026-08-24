# Exact-copy trait validation

The release gate for this change must verify:
- per-find variant traits can raise or lower appraisal without contradictory Complete set + Incomplete state;
- keeping a find persists the concrete appraisal, condition, restoration and traits;
- legacy `collection: string[]` saves normalize into concrete instances without resetting progression;
- collection quick-sale removes the lowest-value duplicate;
- Buyer Market selects and prices the best eligible concrete copy;
- typecheck, unit tests, production build and browser/release QA pass before merge.
