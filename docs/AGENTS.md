# Documentation agent instructions

Applies to `docs/` in addition to root instructions.

Documentation here is operational project state, not aspirational marketing copy.

- Update the existing source-of-truth document instead of creating overlapping documents for the same concern.
- Mark planned behavior as planned; do not describe unimplemented systems as shipped.
- Keep `ROADMAP.md` status consistent with code reality.
- Record durable architecture/product decisions in `DECISIONS.md`.
- When code contradicts docs, investigate which is stale rather than silently choosing one.
- Prefer concise contracts, invariants and examples that help future agents make correct changes.
