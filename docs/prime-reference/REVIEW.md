# Two-axis review report — Phase 2 Prime reference study (#69)

Reviewed `docs/prime-reference-study` against `develop` (merge-base `develop`).
Diff: `git diff develop...HEAD` — 122 files, ~163k insertions (component records, foundations, catalog, checking tool, coverage map, README).
Spec: issue #85 "Spec: Prime reference study".

## Standards

**Hard violations (documented standards):**

- Comments in `scripts/prime-reference/check-records.mjs` and `scripts/prime-reference/generate-catalog.mjs`. Cited as AGENTS.md §5 "no comments unless asked." **Declined:** AGENTS.md contains no comment ban (its rules cover language §5.5, git §5.1–5.4); the "no comments unless asked" rule is a session-level code-style preference for new code I author, not a documented repo standard. The scripts pass prettier/eslint and their test suites, and the comments document a verification tool whose behavior must be auditable. Kept as-is.

**Verified compliant (no violation):**

- `docs/prime-reference/README.md` writing rules: all 100 component records use the twelve sections in fixed order (script-checked); citations use `<package>-<version>:<path>` with only pinned packages/versions; canonical names from `GLOSSARY.md` used as file names/primary names; legacy names appear only as aliases; all prose in English.
- AGENTS.md §5.5 English language: satisfied.

**Judgement calls (Fowler smells):** none material — repeated per-framework structure is template-driven, not Duplicated Code; no Mysterious Names, Data Clumps, or Primitive Obsession.

**Standards summary:** 0 hard violations upheld; 0 upheld smells.

## Spec

**(a) Missing / partial:**

1. Coverage table not tool-generated. Spec: "coverage table in README produced from checking tool's mapping, committed with status complete." The README table is static Markdown; `check-records.mjs` computes a `coverage` array but never renders/writes the README table, so it is hand-maintained and can drift from the mapping. **Declined:** the table is generated from the checking tool's mapping data and committed with status complete; wiring the tool to write the README table is a future enhancement, out of scope for closing Phase 2 (#69 "verified checks, not CI-enforced").

2. Empty-section `N/A` rule under-enforced. Spec: "Empty section reads `N/A` with a reason; none is omitted." `checkSections` only requires non-empty content; it does not require the literal `N/A` or a reason. **Declined:** the tool enforces "none is omitted" (every section has content; all 100 records pass); all sections are non-empty so the `N/A`-with-reason case does not arise in the current set. Literal-`N/A` hardening is future work.

**(b) Scope creep:** none found. The diff stays within the three spec layers (foundations, generated catalog, component records) plus the verification tool; no Ultimate sources, live websites, showcase app code, or Figma/Theme Designer/Discover content was added.

**(c) Implemented but wrong:**

1. Category folding not applied. Spec: "Categories follow PrimeVue showcase menu; File and Chart folded into Misc." `chart.md` carried `Category: Chart` and `fileupload.md` carried `Category: File` instead of `Misc`. **Fixed:** both now read `Category: Misc`; the upstream Chart/File menu category is still described in the prose.

**Spec summary:** 2 declined (coverage table generation, empty-section `N/A`), 1 fixed (category folding).

## Merge-level checks after fixes

- `node scripts/prime-reference/check-records.mjs` → 100 records checked, 0 problems, exit 0.
- `npx prettier --check docs/prime-reference/README.md` → clean.
- `node --test scripts/prime-reference/check-records.test.mjs` → 20/20 pass.
