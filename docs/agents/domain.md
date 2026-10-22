# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. Layout: **single-context**.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root (if it exists).
- **`docs/architecture/DECISIONS.md`**: the ADR log for this repo (ADRs live here, not in `docs/adr/`). Read ADRs that touch the area you're about to work in.
- **`docs/architecture/BLUEPRINT.md`**: architectural intent and governance. Binding within its scope.

If `GLOSSARY.md` doesn't exist, **proceed silently**. Don't flag its absence; don't suggest creating it upfront. The `/domain-modeling` skill creates it lazily when terms actually get resolved.

Source-of-truth precedence is defined in `AGENTS.md` §2; real repository evidence wins over any document.

## Approval

Creating, triaging, or publishing issues does not authorize implementation; each task needs its own authorization (`AGENTS.md` §5.4).

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

## Flag ADR conflicts

If your output contradicts an existing ADR in `docs/architecture/DECISIONS.md`, surface it explicitly rather than silently overriding:

> _Contradicts ADR-068 (branching model), but worth reopening because…_
