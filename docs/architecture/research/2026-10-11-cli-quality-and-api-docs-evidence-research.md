# CLI quality and documented APIs: measurable evidence requirements research (2026-10-11)

**Status:** research record, **uncommitted draft** for user review. Authorized by the user on 2026-10-11. Assessment revision 3 recorded that ruling D-40 makes "CLI quality" and "documented APIs" required for the pre-1.0 publish, while no source gives a measurable bar (assessment §9, item 3). This record proposes bars **[Rec]**; it decides nothing and changes no file other than itself.

**Labels:** [R] repository evidence · [D] decision record · [A] assumption · [Rec] recommendation.

**Baseline:** `main` == `99364dc`.

---

## Part A — CLI quality

### A.1 Source requirements [D]

Blueprint §19: `@ultimate/cli` is an orchestrator. It **must** detect/select the framework, invoke official framework tooling, install compatible Ultimate packages, resolve the theme, configure optional capabilities, validate compatibility, generate code/configuration and diagnose project state. It **should** support common package managers where practical. It must not replace framework build systems. "Exact command names are not final" (§43 PROVISIONAL).

### A.2 Current evidence

| §19 duty                          | Implementation [R][D]                                                        | Evidence   |
| --------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| Detect/select framework           | `init` (`detect-framework.ts`)                                               | Unit tests |
| Invoke official framework tooling | `create` **deferred** (ROADMAP fn 3); `init` works on existing projects only | —          |
| Install compatible packages       | `init`, `add` (compatibility-checked; `install-package.ts`)                  | Unit tests |
| Resolve theme                     | `theme aura`                                                                 | Unit tests |
| Configure optional capabilities   | `ai` is a stub that exits non-zero                                           | —          |
| Validate compatibility            | `compatibility.ts` and the manifest; CI validates the manifest schema        | CI green   |
| Generate code/configuration       | `generate` (stdout snippet from metadata); `init`/`theme` write config       | Unit tests |
| Diagnose                          | `doctor`, against the 8-component metadata set                               | Unit tests |
| Package managers                  | `detect-package-manager.ts`                                                  | Unit tests |

- **Test files:** 12 in `packages/cli` [R]. The CLI boundary validator is green in CI [R].
- `migrate` and `update` are deferred [D].

### A.3 Finding CLI-F1: the CLI and MCP cannot find the compatibility manifest when installed

- `packages/cli/src/commands/{init,add,theme,doctor}.ts` and `packages/mcp/src/manifest-path.ts` resolve `docs/architecture/compatibility-manifest.json` **relative to the monorepo root**: the CLI uses `join(CLI_PACKAGE_ROOT, "..", "..", "docs", …)` (`add.ts:33–41`; the same pattern appears in `init`, `theme` and `doctor`), and MCP uses `REPO_ROOT = join(__dirname, "..", "..", "..")` [R]. Installed under `node_modules/@ultimate/cli`, the CLI path resolves to `node_modules/docs/architecture/…`, which does not exist [A].
- The published `files` of `@ultimate/cli` and `@ultimate/mcp` are `["dist", "README.md"]` only [R], so an installed copy has no repository root and no manifest.
- ROADMAP footnote 3 records this as an unverified "known packaging gap … tracked as follow-up work" [D]. **No BLUEPRINT_GAPS entry tracks it** [R].
- The CI pack/install integrity check "only packs and installs", and asserts that files exist; it never runs a binary [R]. It cannot detect this.

**Assessment:** for a pre-1.0 publish (S-1) that includes the CLI and MCP, `init`, `add`, `theme`, `doctor` and the MCP compatibility tool would fail for every consumer [A, from reading the code; not executed]. This is a concrete release defect. Registering it as a GAP needs separate authorization; this research does not change BLUEPRINT_GAPS.

### A.4 Proposed measurable bar [Rec]

| ID    | Criterion                                                                                                                                                                                                                                                                  | Objective evidence                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| CLI-1 | Every shipped command has unit tests for its success path and its documented error exits                                                                                                                                                                                   | Test files map 1:1 to `src/commands/*.ts`; CI Test step green           |
| CLI-2 | **Installed-package smoke test:** pack `@ultimate/cli` (and its closure), install into a scratch project per framework (Angular, React, Vue fixtures), and run `init`, `add`, `theme`, `doctor` and `generate` successfully                                                | A CI step; would fail today because of CLI-F1                           |
| CLI-3 | Same installed-package check for `@ultimate/mcp`: the server starts over stdio and `check_framework_compatibility` returns a result                                                                                                                                        | A CI step                                                               |
| CLI-4 | Every §19 "must" duty is either implemented with CLI-1/CLI-2 evidence or recorded as an approved exception (D-40 / G14). Today the candidates for exceptions are "invoke official framework tooling" (`create` deferred) and "configure optional capabilities" (`ai` stub) | Exception register rows                                                 |
| CLI-5 | Package managers: the CLI-2 smoke test runs with pnpm and npm at minimum ("where practical")                                                                                                                                                                               | CI matrix                                                               |
| CLI-6 | `--help` output and README list every command, its arguments and its exit codes                                                                                                                                                                                            | README review plus a test that asserts each command appears in `--help` |

No coverage percentage is proposed: none of the existing coverage gates sets an absolute floor, and no measurement supports one [A].

---

## Part B — Documented APIs (beyond S-3 coverage)

### B.1 Source requirements [D]

Blueprint §27: documentation "should combine component API, behavior, usage, accessibility, theming, examples, framework-specific notes, AI guidance where useful", and "**Generated API documentation and authored guidance should be composable**". ADR-009: component metadata is the source of truth. ADR-044: Storybook is the documentation/testing surface.

### B.2 Current evidence [R]

| Surface                           | State                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook                         | 89 / 86 / 91 story files (ng/react/vue). **No docs addon, no `autodocs` tag on any story, no MDX files**; the only addon is `@storybook/addon-a11y`. Storybook currently works as a test and visual surface, not an API reference                                                                       |
| Metadata records                  | 8 records with per-framework `props`/`events` (the API). Validation (`validate-all.mjs`) is **schema-only**. Hand-written tests assert selected props, but **no automated check compares a record with the component's real public API** (drift)                                                        |
| Accessibility and guidance fields | The schema has `accessibility` (`verifiedRoles`, `verifiedAriaAttributes`, `guidance`) and `guidance` (`usageNotes`, `antiPatterns`, `migrationNotes`). **Only the Table record fills either**; the other 7 records have neither, so MCP's `get_component_accessibility` has no data to return for them |
| Skills / LLM context              | 8 Skills; `llms*.txt` for the same set (S-3 extends both)                                                                                                                                                                                                                                               |
| READMEs                           | Per package; package level, not per component                                                                                                                                                                                                                                                           |
| `apps/docs`                       | Empty (GAP-008)                                                                                                                                                                                                                                                                                         |
| Type declarations                 | Emitted `.d.ts` in each `dist/` (machine-readable API, not documentation)                                                                                                                                                                                                                               |

### B.3 Proposed measurable bar [Rec]

| ID    | Criterion                                                                                                                                       | Objective evidence                                                                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-1 | Every in-scope component has a metadata record (S-3) **with `api`, `accessibility` and `guidance` populated** for each framework where it ships | Schema extended or validator rule: required fields present (a Spec-level change)                                                                                                          |
| DOC-2 | **Drift check:** each record's props/events equal the component's real public API per framework                                                 | A CI validator comparing records with emitted `.d.ts` (or source) exports; zero mismatches                                                                                                |
| DOC-3 | **Generated API reference** rendered from metadata (props, events, accessibility, guidance) per framework, composable with authored text (§27)  | A generated artifact, for example per-component Markdown or Storybook docs pages, built in CI. The delivery location (package README, Storybook docs, `apps/docs`) is a decision (DOC-D2) |
| DOC-4 | Every in-scope component has stories for its documented states (default, disabled, invalid/loading where applicable)                            | Story inventory checked against metadata (a script)                                                                                                                                       |
| DOC-5 | Every published package has a README with install, minimal usage, peer requirements and stability status                                        | README checklist validated by a script                                                                                                                                                    |

## C. Unresolved decisions

- **CLI-D1:** adopt CLI-1 to CLI-6, or amend them.
- **CLI-D2:** authorize registering CLI-F1 as a GAP (it is currently tracked only in ROADMAP footnote 3).
- **CLI-D3:** approve or reject the candidate exceptions for `create` and `ai` (CLI-4).
- **DOC-D1:** adopt DOC-1 to DOC-5, or amend them.
- **DOC-D2:** where the generated API reference lives: Storybook docs pages (ADR-044 names Storybook as the documentation surface), package READMEs, or `apps/docs` (empty; GAP-008 scope).

## D. Next required approval gate

**Decision** on CLI-D1 to CLI-D3 and DOC-D1 to DOC-D2. Then a Spec for the CLI/MCP packaging fix and smoke tests (CLI-F1, CLI-2, CLI-3), and a Spec for the metadata drift check and generated reference (DOC-2, DOC-3), sequenced with the S-3 metadata work.
