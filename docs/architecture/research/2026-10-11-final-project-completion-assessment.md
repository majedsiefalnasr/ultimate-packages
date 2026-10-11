# Final Project Completion Assessment (2026-10-11)

**Status:** read-only assessment, **uncommitted draft** for user review. **Revision 2** recorded the user's scope rulings S-1 to S-5. **Revision 3** records the further rulings K-7, K-8, K-9, S-4 (refined), S-5 (refined), N-1 and D-40 (§1.4), and updates only the dependent conclusions. No newly authorized research has been conducted in this revision. It implements nothing, changes no GAP status, and amends no ADR, Spec, Plan, `BLUEPRINT.md`, `BLUEPRINT_GAPS.md` or `ROADMAP.md`. Proposals are recommendations only.

**Baseline:** `main` == `origin/main` == `99364dc`. Actual CI: run 38138916464 (CI) and 38138916465 (Release) at `99364dc`; the same failing step sets as 38137093707 / 38137093724 at `e32c224`.

**Sources, in AGENTS.md §2 order:**

1. repository evidence;
2. `BLUEPRINT.md`;
3. `DECISIONS.md`;
4. approved Specs and Plans;
5. `BLUEPRINT_GAPS.md`, `ROADMAP.md`, `COMPONENT_INVENTORY.md`, `PERFORMANCE.md`, `MIGRATION.md`;
6. research records.

**Labels:**

- **[R]** repository evidence;
- **[CI]** actual GitHub Actions;
- **[D]** a decision or approved document;
- **[U]** an approved user ruling recorded in this draft (§1.4);
- **[RS]** research authorized by the user but not yet conducted (its outcome is undecided);
- **[L]** a local check or measurement (not CI);
- **[X]** externally unexercisable (cannot be proven by repository checks);
- **[A]** an assumption or open question;
- **[Rec]** a recommendation that still needs approval.

The BAE document and worktree were not inspected beyond `git status`.

---

## Executive summary

1. **Completion target (after the rulings):** the **first pre-1.0 publish** [U] of a platform that includes **every remaining component-inventory area and its React/Vue counterparts** [U], with **metadata, Skills and LLM context for every in-scope shipped component** [U].
   - **All Blueprint §40 criteria apply to that publish** (D-40) [U]. An unmet criterion is an exception only if it is explicitly documented and approved by the user. No existing or proposed residual is approved by this ruling.
   - **Package names must be settled before the first pre-1.0 publish** (N-1) [U]. This is earlier than the sources' deadline ("first stable release"); the discrepancy is flagged in §1.7, and the sources are not edited.
   - **Benchmarks (S-4):** all of P1–P8 are in scope, two-stage [U]. Stage 1 baselines first; Stage 2 gates only where measured evidence supports a threshold. No threshold is decided (§5).
   - **Accessibility (S-5):** five GAPs (086, 100, 111, 112, 123) and every critical-severity component-level baseline finding are **required fixes** before the publish [U]. The general policy A1–A7 and the disposition of every other finding stay pending further research; nothing unselected is accepted as a residual (§6).
2. **The scope rulings meet recorded decisions** (§1.6). The user authorized limited research for each, without changing the recorded decisions:
   - Tree, TreeTable, TreeSelect, OrganizationChart: limited architecture research; ADR-043 preserved (K-7) [U][RS].
   - Chart and Editor: DECISION-B (external-dependency approval policy) research before any implementation path (K-8) [U][RS].
   - `config`, `passthrough`, `api`: limited research on which surfaces, if any, the approved component scope needs; the YAGNI decisions stay in force (K-9) [U][RS].
   - Implementation of these areas waits for the research outcomes and their own decisions.
3. **Release path for the first publish** is not ready:
   - Release fails at install on every push (GAP-087), and Version and Publish have never run [CI].
   - Publishing is **restricted/private** by a settled decision (`MIGRATION.md` §7.3; `.changeset/config.json` `access: "restricted"`). npm provenance is therefore recorded as not achievable, and that is not a blocker.
   - npm scope ownership, the `NPM_TOKEN` secret and branch protection are external [X].
   - Final package names are now a blocker by ruling N-1 [U]; the sources (§34, GAP-016) still say "first stable release" (§1.7).
4. **Already verified in actual CI** (unchanged from revision 1):
   - licensing, dependency and license scans;
   - package boundaries and the Prime dependency ceiling;
   - the compatibility-manifest schema;
   - the bundle-size gate and pack/install integrity;
   - tri-browser tests with the accessibility-baseline gate in all three frameworks;
   - the G3 suites, apart from two inherited failures;
   - Angular SSR.
5. **Largest remaining workstreams** under the rulings:
   - component scope expansion (S-2), including React/Vue inventories that do not yet exist;
   - metadata, Skills and LLM context from 8 components to every in-scope component (S-3);
   - CI signal restoration and the release path;
   - provenance completeness;
   - package-name settlement (N-1);
   - the S-5 required accessibility fixes, and the S-4 Stage 1 baselines;
   - the three authorized research steps (K-7, K-8, K-9) and the further S-4/S-5 criteria research.

---

## 1. Completion target

### 1.1 Authoritative criteria

- **Blueprint §40 (production readiness):**
  - verified licensing/provenance;
  - no prohibited Prime runtime dependencies;
  - stable package boundaries;
  - supported framework versions;
  - accessibility validation;
  - security process;
  - performance benchmarks;
  - visual regression coverage;
  - documented APIs;
  - metadata coverage;
  - compatibility resolver;
  - release automation;
  - migration strategy;
  - CLI quality;
  - AI/MCP quality where those phases are enabled.
- **Supporting normative text:**
  - §28: the Build/Package testing tier, including "SSR where supported";
  - §29: the security process items;
  - §30: "Accessibility regressions are release blockers for affected components";
  - §31: "establish benchmarks";
  - §35: phase exit criteria.

### 1.2 Explicitly not required

- **§41 non-goals,** for example: replacing framework build tools, rewriting every Prime component, preserving every Prime detail, forcing identical APIs, making AI mandatory, continuous Prime synchronization.
- **§43 DEFERRED:** final corporate themes, advanced AI behavior, additional frameworks, a full automated migration system, advanced design-token authoring tools, a public ecosystem strategy.
- **§43 OUT OF SCOPE FOR INITIAL PLATFORM:** replacing framework build tools, supporting every UI framework, maintaining Prime API compatibility indefinitely, automatic Prime feature synchronization.
- **§43 PROVISIONAL items** (names, boundaries, selector prefix, CLI command names, metadata schema, manifest format) are not completion criteria by themselves.

### 1.3 Ambiguities identified in revision 1

S-1 milestone, S-2 component set, S-3 metadata coverage, S-4 benchmarks, S-5 accessibility acceptance. Ruled below (revision 2), with follow-up rulings in revision 3.

### 1.4 User rulings (2026-10-11) [U]

Revision 2 rulings (S-1 to S-3 preserved unchanged; S-4 and S-5 refined in revision 3):

| ID           | Ruling                                                                                                            | Effect on this assessment                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **S-1**      | **First pre-1.0 publish**                                                                                         | Release automation and a working publish path are blockers (§1.5). Package names: see N-1                 |
| **S-2**      | **Include all remaining component-inventory areas and their React/Vue counterparts**                              | GAP-017's scope becomes in-target. Areas meeting recorded decisions are handled by K-7, K-8, K-9 (§1.6)   |
| **S-3**      | **Metadata, Skills and LLM context must cover every in-scope shipped component**                                  | Row 11 (metadata coverage) and row 16 (AI/MCP) are blockers, with coverage growing as S-2 adds components |
| S-4 (rev. 2) | Research and recommend measurable benchmark criteria before deciding the scope                                    | Superseded in part by S-4 (rev. 3)                                                                        |
| S-5 (rev. 2) | Classify existing accessibility/focus defects, then recommend measurable criteria before deciding fix vs residual | Superseded in part by S-5 (rev. 3)                                                                        |

Revision 3 rulings:

| ID       | Ruling [U]                                                                                                                                                                                                                                                                                                                                                        | Status                                      | Effect on this assessment                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **K-7**  | **Limited architecture research** for Tree, TreeTable, TreeSelect and OrganizationChart. ADR-043 preserved; no implementation authorized; ADR-043 not reinterpreted by this recording                                                                                                                                                                             | Approved research [RS]                      | The areas stay in scope (S-2) but their implementation path is undecided until the research and its decision        |
| **K-8**  | **Research DECISION-B** (external-dependency approval policy) before deciding the Chart and Editor implementation path. Neither implemented nor excluded by assumption                                                                                                                                                                                            | Approved research [RS]                      | Chart and Editor stay in scope (S-2); path undecided                                                                |
| **K-9**  | **Limited research** on which specific `config`, `passthrough` and `api` surfaces, if any, the approved component scope needs. Existing YAGNI decisions (GAP-021; ADR-018, ADR-024, ADR-032) preserved until an authorized decision changes them                                                                                                                  | Approved research [RS]                      | No surface is in or out until that decision                                                                         |
| **S-4**  | **All of P1–P8 in scope, two-stage.** Stage 1: reproducible baselines, measurement methods, environment and observed variance recorded. Stage 2: regression gates only where measured evidence supports a defensible threshold. No invented absolute timing budgets; no thresholds without measurements                                                           | Scope approved; thresholds pending evidence | §5: the methods remain [Rec]; every Stage 2 threshold is undecided                                                  |
| **S-5**  | **Required fixes before the target publish:** GAP-086, GAP-100, GAP-111, GAP-112, GAP-123, and **every critical-severity component-level accessibility baseline finding**. A1–A7 as the complete acceptance policy, and the disposition of every other finding, need further research and a separate decision. Unselected findings are **not** accepted residuals | Fixes approved; policy pending research     | §6                                                                                                                  |
| **N-1**  | **Package names settled before the first pre-1.0 publish**                                                                                                                                                                                                                                                                                                        | Approved                                    | Blocker for the target; source discrepancy flagged in §1.7                                                          |
| **D-40** | **All Blueprint §40 production-readiness criteria apply to the first pre-1.0 publish.** An unmet criterion is an exception only if explicitly documented and approved by the user. No existing or proposed residual is approved by this ruling                                                                                                                    | Approved                                    | §2 "Blocks the target?" reads every §40 row as a blocker unless an approved exception exists; §8 records exceptions |

### 1.5 S-1 implications: the first pre-1.0 publish

| Aspect                    | Evidence                                                                                                                       | Assessment                                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Release workflow          | Release fails at install on Node 20 (GAP-087); `select-mode` has never passed, so Version and Publish have never executed [CI] | **Blocker.** After GAP-087 (DR-1), the first Version/Publish run is untested end to end [A]; a dry run or first-run supervision is advisable [Rec]                                                                                               |
| Changesets                | Configured; none ever consumed (GAP-011) [R]                                                                                   | **Blocker.** A first publish needs changesets for the packages to publish                                                                                                                                                                        |
| Access model              | `access: "restricted"`; `MIGRATION.md` §7.3: `@ultimate/*` packages are "permanently restricted/private" [D]                   | Settled. A restricted publish needs an npm organization that allows private packages [X]                                                                                                                                                         |
| Publish-time provenance   | `MIGRATION.md` §7.3: not implemented and not achievable while packages are restricted [D]                                      | **Not a blocker** (settled; the repository-side provenance in rows 1–2 still applies)                                                                                                                                                            |
| Credentials and ownership | `NPM_TOKEN` secret used by `release.yml` [R]; `@ultimate/ng` returns E404 on npm [X]                                           | **External.** Scope ownership, the token and organization billing cannot be proven from the repository; E404 does not prove the scope is available                                                                                               |
| Branch protection         | `MIGRATION.md` §7.4: external, not enforceable from repository content [D]                                                     | External [X]                                                                                                                                                                                                                                     |
| Package names             | §34 and GAP-016: names are settled "before first stable release" [D]                                                           | **Blocker by ruling N-1** [U]: names are settled before the first pre-1.0 publish. Earlier than the sources require (§1.7). Settling names is its own decision work: §43 lists "exact package names" and "package boundaries" as PROVISIONAL [D] |
| Versioning                | Every package `0.1.0`; package READMEs say "unstable (pre-1.0). No semver guarantee yet" [R]                                   | Consistent with S-1                                                                                                                                                                                                                              |
| Repository metadata       | No published package declares `repository`; `license: "MIT"` and `files` are set [R]                                           | Not required by any source; listed as optional hygiene [Rec]                                                                                                                                                                                     |

### 1.6 S-2 and S-3 scope consequences, and the areas governed by recorded decisions

**Remaining Angular inventory areas not yet incorporated** (`COMPONENT_INVENTORY.md` "Remaining" section) [R]:

| Area                                                                              | Inventory classification                                         | Recorded constraint                                                                                                                                         | Status under S-2                                                                                                                                  |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| TreeSelect, Tree, TreeTable                                                       | TreeSelect ADAPT; Tree and TreeTable NEEDS ARCHITECTURE DECISION | GAP-013 / ADR-043 (protected): no shared hierarchical contract; "revisit only when a real Tree implementation surfaces genuine shared semantics"            | **K-7** [U][RS]: in scope; limited architecture research authorized; ADR-043 preserved; implementation path undecided                             |
| OrganizationChart                                                                 | ADAPT, "architectural exception, see DECISION-D"                 | React and Vue shipped since G3-E (`dd4c963`) [R]; Angular absent under the DECISION-D exclusion, its PrimeNG source imports `TreeNode` (erratum 2026-10-11) | Same research K-7 [U][RS]                                                                                                                         |
| Chart                                                                             | NEEDS ARCHITECTURE DECISION                                      | GAP-019: needs an external-dependency approval policy (DECISION-B)                                                                                          | **K-8** [U][RS]: in scope; DECISION-B research authorized before deciding the path; not implemented or excluded by assumption                     |
| Editor                                                                            | NEEDS ARCHITECTURE DECISION                                      | GAP-020: same DECISION-B                                                                                                                                    | Same research K-8 [U][RS]                                                                                                                         |
| `config` (full surface), `passthrough`, `api` (remaining surface)                 | NEEDS ARCHITECTURE DECISION                                      | GAP-021: DEFERRED by YAGNI rulings (ADR-018/024/032), "revisit only on real duplicate-pattern pressure"                                                     | **K-9** [U][RS]: limited research on which surfaces, if any, the approved scope needs; YAGNI deferrals stay in force until an authorized decision |
| `icons` (remaining ~85+)                                                          | ADAPT, mechanical                                                | None                                                                                                                                                        | In scope, unblocked                                                                                                                               |
| `usestyle`, `classnames`, `ts-helpers`, `base`, `types`, `dom`, `utils`, `motion` | NOT NEEDED                                                       | Superseded or internal tooling                                                                                                                              | Not components; out of target by their own classification [D]                                                                                     |

- **React and Vue counterparts:** no independent React or Vue inventory exists (GAP-017) [R]. Component directories today: Angular 89, React 86, Vue 94 [L]. Directories are a proxy, not a reconciled count [A]. S-2 therefore first needs React and Vue inventories, reconciled against the Angular inventory and the PrimeReact/PrimeVue baselines.
- **S-3 coverage target:** every in-scope shipped component, in each framework where it ships. Today there are 8 metadata records (`packages/component-metadata/src/records`) and 8 component Skills; `llms*.txt` reflect the same set [R]. The target grows with S-2. Its exact denominator follows from the inventories above [A].
- **GAP-040:** the Paginator rows-per-page dropdown was deferred until a Select existed. Select now exists in all three frameworks [R], so under S-2 the deferred Paginator capability is in scope and unblocked. The GAP's status text is stale (§3).

### 1.7 Source conflicts and discrepancies created or exposed by the rulings

None of these is resolved here. Each would need an authorized change to the named source, or a decision, before the source and the ruling agree.

| ID   | Ruling                                         | Source                                                                                                                    | Discrepancy                                                                                                                                                                                                                                           | Resolvable without changing an approved source?                                                                    |
| ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| SC-1 | N-1 (names before pre-1.0)                     | Blueprint §34 ("before first stable release"), GAP-016, §43 PROVISIONAL package names                                     | The ruling's deadline is earlier than the sources'. The two are compatible (settling earlier satisfies "before first stable release"), but the documents do not record the earlier deadline                                                           | **Yes for compliance**; recording N-1 in the tracking documents needs a separately authorized documentation change |
| SC-2 | D-40 (§40 applies to pre-1.0)                  | Blueprint §40 has no milestone; §45 calls the Blueprint the baseline for "v0.1"                                           | No contradiction; the Blueprint is silent. The ruling fills the gap                                                                                                                                                                                   | Yes                                                                                                                |
| SC-3 | K-7 (Tree-family research)                     | ADR-043 / GAP-013: revisit "only when a real Tree implementation surfaces genuine shared semantics"                       | Research may conclude either way. If it concludes that a shared hierarchical contract is needed, that would require an ADR-043 amendment, which is outside this recording                                                                             | **Unknown until the research**; an ADR change cannot be assumed                                                    |
| SC-4 | K-9 (cross-cutting research)                   | GAP-021; ADR-018, ADR-024, ADR-032 (YAGNI deferrals)                                                                      | If research finds a surface necessary, adopting it needs a decision that amends or supersedes those ADRs                                                                                                                                              | **Unknown until the research**                                                                                     |
| SC-5 | S-2 (all remaining areas) + K-8                | GAP-019, GAP-020 (DECISION-B unresolved)                                                                                  | Chart and Editor cannot be implemented until DECISION-B exists; DECISION-B is a new decision, not a change to an existing one                                                                                                                         | Yes (by a new decision)                                                                                            |
| SC-6 | S-5 (critical baseline findings must be fixed) | `ACCESSIBILITY_BASELINE.md` one-way-door contract: a row is removed only when its fingerprint disappears from a real scan | No conflict: fixing removes rows by the contract's own rule. Noted because the 9 Table rows (`aria-required-children`) and 10 Checkbox rows (`label`) are in already-shipped components in all three frameworks (except one Angular Checkbox row) [R] | Yes                                                                                                                |

---

## 2. Requirement-to-evidence matrix (revised for S-1 to S-5 and the revision 3 rulings)

Under D-40 [U], every §40 row blocks the target until it is met or the user approves a documented exception (§8, G14). No row below is an approved exception.

Statuses:

- **VC** — verified complete;
- **IV** — implemented, insufficiently verified;
- **OP** — open;
- **DF** — explicitly deferred;
- **UR** — unresolved.

| #   | Requirement (source)                          | Status                                                    | Evidence                                                                                                                                                                                      | Remaining work / dependency                                                                                    | Blocks the target?                                                                                                    |
| --- | --------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | Verified licensing (§40, §8, ADR-005)         | VC                                                        | License scan green [CI]; MIT baselines pinned with SHA-256 [R][D]                                                                                                                             | —                                                                                                              | No                                                                                                                    |
| 2   | Provenance complete (§40, Phase 0 exit)       | OP / UR                                                   | `provenance:validate` red [CI]; 1163 of 1915 watched files without an entry (696 production source) [L]; scope not defined (DR-5)                                                             | DR-5, then backfill (GAP-094); new S-2 components add entries                                                  | **Yes**                                                                                                               |
| 3   | No prohibited Prime runtime dependency (§40)  | VC                                                        | Dependency-ceiling and boundary validations green [CI]                                                                                                                                        | Re-verify after S-2 additions (CI-enforced)                                                                    | No (CI-enforced)                                                                                                      |
| 4   | Stable package boundaries (§40)               | VC with caveats                                           | Boundary validators green [CI]; GAP-001, GAP-016 are documentation items; package names and boundaries PROVISIONAL (§43)                                                                      | Settle names (N-1, §1.5)                                                                                       | **Yes** (names, by N-1) [U]                                                                                           |
| 5   | Supported framework versions (§40, §13, §14)  | IV                                                        | Peers: ng `^21.2.22`, react `^17 \|\| ^18 \|\| ^19`, vue `^3.5.2`; tested Angular 21.2.25, React 18.3.1, Vue 3.5.13 only [R]; the manifest's Angular `^21.0.7` contradicts the peer floor [R] | Verify or narrow the declared ranges; reconcile the manifest                                                   | **Yes** (a published support claim must be true)                                                                      |
| 6   | Accessibility validation (§40, §30)           | VC for regressions; criteria pending for existing defects | Baseline and differential gates green [CI]; 309 grandfathered rows (63 component-level); 11 open accessibility/focus GAPs [R]                                                                 | Required fixes (S-5): GAP-086, 100, 111, 112, 123 and the 19 critical baseline rows; then policy research (§6) | **Yes** for regressions (CI-enforced) and the required fixes [U]. Other existing findings: **pending** (not accepted) |
| 7   | Security process (§40, §29)                   | OP                                                        | Dependency and license scans green [CI]; SAST never evaluated (GAP-090) [CI]; advisories and patch process [X]                                                                                | GAP-090                                                                                                        | **Yes**                                                                                                               |
| 8   | Performance benchmarks (§40, §31)             | UR                                                        | Bundle-size gate green (15% relative threshold) [CI]; coverage gate red (GAP-091); only throwaway Angular creation timings [R]                                                                | Stage 1 baselines for P1–P8 (S-4); Stage 2 gates only where evidence supports them; GAP-091                    | **Yes** (Stage 1 for all of P1–P8) [U]; Stage 2 thresholds pending evidence; GAP-091 required                         |
| 9   | Visual regression coverage (§40, §28)         | VC with 2 inherited failures                              | Strict Playwright green [CI]; U2 and GAP-097 red by recorded decision                                                                                                                         | U2 (DR-4); GAP-097 depends on GAP-098; S-2 components need baselines                                           | Required pre-completion; new S-2 components need baselines (blocker for those components)                             |
| 10  | Documented APIs (§40, §27)                    | IV / UR                                                   | Storybook per framework, READMEs, `MIGRATION.md`, `llms*.txt`, 8 Skills [R]; no generated API reference found [A]                                                                             | Coverage per S-3; the documentation format and minimum are not defined by a source [A]                         | **Yes** (D-40) [U]; the measurable bar beyond S-3 coverage is undefined (§9, item 3)                                  |
| 11  | Metadata coverage (§40, Phase 6)              | OP                                                        | 8 records; metadata validation in `pnpm run validate` green [CI]                                                                                                                              | Every in-scope shipped component (S-3)                                                                         | **Yes** [U]                                                                                                           |
| 12  | Compatibility resolver (§40, §20)             | IV                                                        | Manifest schema green [CI]; Angular range inconsistent (row 5)                                                                                                                                | Reconcile                                                                                                      | **Yes**                                                                                                               |
| 13  | Release automation (§40, §44 item 9)          | OP                                                        | Release fails at install; Version/Publish never run [CI]; nothing published [X]                                                                                                               | GAP-087 (DR-1); changesets; first run; external items (§1.5)                                                   | **Yes** [U]                                                                                                           |
| 14  | Migration strategy (§40)                      | VC (strategy) / DF (automation)                           | `MIGRATION.md` [R]; automation DEFERRED (§43) [D]                                                                                                                                             | Keep current per change                                                                                        | No                                                                                                                    |
| 15  | CLI quality (§40, §19)                        | IV                                                        | 5 commands; CLI boundary green [CI]; `create`/`migrate`/`update` deferred [D]                                                                                                                 | The CLI's component catalogue grows with S-2 [A]                                                               | **Yes** (D-40) [U]; the measurable quality bar is undefined (§9, item 3)                                              |
| 16  | AI/MCP quality (§40, §22–§26)                 | IV / OP                                                   | MCP 5 tools, AI boundary green [CI]; Skills and LLM context for 8 components [R]                                                                                                              | Coverage per S-3                                                                                               | **Yes** (coverage part) [U]                                                                                           |
| 17  | SSR where supported (§28)                     | VC Angular; OP React/Vue                                  | Angular green; React/Vue jobs time out before any test (GAP-088) [CI]                                                                                                                         | GAP-088                                                                                                        | **Yes** if React/Vue SSR is claimed                                                                                   |
| 18  | Package quality / exports (§28)               | VC with 1 CI-only failure                                 | Pack/install integrity green [CI]; GAP-089 [CI]                                                                                                                                               | GAP-089                                                                                                        | Required pre-completion                                                                                               |
| 19  | CI foundation (Phase 0 exit; §44)             | OP (signal masked)                                        | 12 inherited red steps [CI]                                                                                                                                                                   | CI-health workstream (DR-1 to DR-8)                                                                            | **Yes** (red steps hide regressions)                                                                                  |
| 20  | Theme consistency across frameworks (Phase 5) | IV / accepted exception                                   | Angular and Vue through GAP-064; React exception (ROADMAP fn 1) [D]; the footnote is inaccurate (19 of 83 React style files call `dt()`) [R]                                                  | Footnote wording; S-2 components follow the same pattern                                                       | No (accepted exception)                                                                                               |
| 21  | Component scope (S-2)                         | OP                                                        | 25 Angular areas remaining (§1.6) [R]; no React/Vue inventory [R]                                                                                                                             | React/Vue inventories; K-7, K-8, K-9 research [RS] and their decisions; implementation by family               | **Yes** [U]                                                                                                           |

---

## 3. Outstanding-work inventory (all unresolved and partial GAPs, revised)

**Classes:**

- **B** — release blocker for the ruled target;
- **P** — required pre-completion;
- **D** — approved deferral;
- **O** — optional;
- **S** — stale entry;
- **C** — in target by S-2 but governed by a recorded decision; user-authorized research pending (K-7, K-8, K-9) [RS];
- **R5** — accessibility fix required before the target publish by ruling S-5 [U] (blocker);
- **A5** — accessibility defect whose fix-or-residual disposition awaits the S-5 policy research and decision (§6); not an accepted residual.

| GAP                                 | Status    | Topic                             | Class              | Basis                                                                                                                                        |
| ----------------------------------- | --------- | --------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 001                                 | DOC       | Empty `uix` umbrella              | O                  | "Nothing functionally"                                                                                                                       |
| 002                                 | DOC       | README says "Phase 0"             | **S**              | The README now says "Pre-release … nothing has been published"                                                                               |
| 008                                 | MISSING   | No consumer app                   | **S** / P          | Playgrounds exist and run the CI SSR harness; `apps/docs` and `apps/showcase` are empty. The playgrounds are the proposed P2/P8 harness (§5) |
| 011                                 | PARTIALLY | CHANGELOG / changesets            | **B**              | S-1: changesets must be consumed for a first publish                                                                                         |
| 012                                 | DEFERRED  | CODEOWNERS                        | D                  | Self-deferred                                                                                                                                |
| 013                                 | ARCH      | Tree-family contract              | **C** (K-7)        | S-2; K-7 research [RS]; ADR-043 preserved                                                                                                    |
| 016                                 | DOC       | Provisional `uix-data` name       | **B** (N-1)        | N-1 [U]: names before the pre-1.0 publish; the GAP text still says "before first stable release" (SC-1)                                      |
| 017                                 | MISSING   | Component coverage                | **B** + **S**      | In target under S-2; the text says 101, the inventory says 25                                                                                |
| 019, 020                            | ARCH      | Chart, Editor                     | **C** (K-8)        | S-2; DECISION-B research [RS]                                                                                                                |
| 021                                 | DEFERRED  | `config`, `passthrough`, `api`    | **C** (K-9)        | K-9 research [RS]; YAGNI deferrals in force until decided                                                                                    |
| 026                                 | DEFERRED  | `@primevue/forms`                 | D                  | ADR-039; not an inventory component area                                                                                                     |
| 037                                 | DOC       | PERFORMANCE narrative             | P                  | S-4 [U]: Stage 1 baselines are recorded in `PERFORMANCE.md`                                                                                  |
| 040                                 | DEFERRED  | Paginator rows-per-page           | **B** + **S**      | Its blocker (no Select) is gone; the capability is in S-2 scope                                                                              |
| 064                                 | PARTIAL   | Aura per-component tokens         | P (exit undefined) | Follow-ups below; S-2 components need the same token wiring [A]                                                                              |
| 084                                 | OPEN      | Vue menus, plain-array open state | P                  | Functional defect in a shipped component                                                                                                     |
| 085                                 | OPEN      | MegaMenu disabled column items    | O                  | LOW, visual                                                                                                                                  |
| 086                                 | OPEN      | ContextMenu keyboard navigation   | **R5**             | S-5 [U]; §6                                                                                                                                  |
| 087                                 | OPEN      | Release Node                      | **B**              | S-1                                                                                                                                          |
| 088                                 | OPEN      | React/Vue SSR CI                  | **B**              | Row 17                                                                                                                                       |
| 089                                 | OPEN      | React exports test                | P                  | Row 18                                                                                                                                       |
| 090                                 | OPEN      | SAST                              | **B**              | Row 7                                                                                                                                        |
| 091                                 | OPEN      | Coverage scope                    | P                  | DR-2                                                                                                                                         |
| 092                                 | OPEN      | Lint/format debt                  | O                  | DR-8 deferred                                                                                                                                |
| 093                                 | OPEN      | Vendor tarballs                   | P                  | DR-3                                                                                                                                         |
| 094                                 | OPEN      | Provenance entries                | **B**              | Row 2                                                                                                                                        |
| 096                                 | OPEN      | SpeedDial layout                  | P                  | Functional                                                                                                                                   |
| 097                                 | OPEN      | Drawer sizing                     | P                  | Depends on GAP-098                                                                                                                           |
| 098                                 | OPEN      | Global box model                  | P                  | 2026-10-08 ruling preserved; needs its own Spec                                                                                              |
| 099, 101                            | OPEN      | Drawer / Message parity           | O                  | Visual parity (§41)                                                                                                                          |
| 100, 111, 112, 123                  | OPEN      | Accessibility / focus             | **R5**             | S-5 [U]; §6                                                                                                                                  |
| 103, 104, 114, 115, 116, 122        | OPEN      | Accessibility / focus             | **A5**             | Disposition pending S-5 policy research; §6                                                                                                  |
| 102, 105–110, 113, 117–121, 125–130 | OPEN      | G3-E parity follow-ups            | O / P              | Visual or functional parity; MEDIUM ones (110, 113, 119, 126, 127) are P if they affect use of a shipped component [A]                       |
| 124                                 | PARTIAL   | DataView spinner                  | P                  | KL-1..KL-4 recorded; stays PARTIAL. Under D-40 each limitation needs a fix or a user-approved exception (G14)                                |

**Other stale or inconsistent records (unchanged from revision 1):**

- `ROADMAP.md` footnote 1;
- the compatibility manifest's Angular range vs the `@ultimate/ng` peer floor;
- the `validate-provenance.mjs` header comment;
- BLUEPRINT_GAPS "Recommended Next Research";
- K-1 (X-12 vs GAP-097);
- K-6 (two meanings of X-8);
- the GAP-094 size.

**Rechecks:**

- **GAP-124:** PARTIAL, consistent with the evidence.
- **GAP-064:** PARTIAL, consistent; no exit criterion is defined.
- **GAP-098:** OPEN, consistent; the 2026-10-08 ruling is preserved.
- **BAE:** untracked design document plus a worktree with an uncommitted `AGENTS.md` change; impact unknown [A]; untouched.

---

## 4. Operational readiness (unchanged; S-1 applied)

| Area                       | Actual CI [CI]                                      | Local / simulation only [L] | Not provable in the repository [X]                                                 |
| -------------------------- | --------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| CI reliability             | 12 inherited red steps                              | Docker CI simulation        | —                                                                                  |
| Release and publishing     | Release fails at install; Version/Publish never run | —                           | npm organization (private packages), `NPM_TOKEN`, first publish, branch protection |
| Compatibility              | Manifest schema green; single-version matrix        | Lockfile engine analysis    | Consumer installs on the declared ranges                                           |
| Licensing / provenance     | License scan green; provenance validation red       | Missing-entry count         | —                                                                                  |
| Accessibility              | Baseline and differential gates green               | —                           | Screen-reader and assistive-technology testing                                     |
| Security                   | Dependency scan green; SAST not evaluated           | —                           | Advisory handling, patch cadence                                                   |
| Performance                | Bundle-size gate green; coverage red                | Coverage scope split        | Real-application performance                                                       |
| Visual regression          | Green except U2 and GAP-097                         | Docker baselines            | —                                                                                  |
| Docs / metadata / AI / MCP | Generated-artifact and boundary checks green        | —                           | Usefulness to agents                                                               |

---

## 5. S-4: benchmark categories and proposed measurable criteria

**User ruling S-4 (revision 3) [U]:** all of P1–P8 are in scope, two-stage.

- **Stage 1 (approved):** for each category, record a reproducible baseline, the measurement method, the environment and the observed variance.
- **Stage 2 (conditional):** a regression gate only where measured evidence supports a defensible threshold.
- **Prohibited by the ruling:** invented absolute timing budgets; thresholds derived without measurements.

**What remains [Rec] or undecided:**

- the measurement methods in the table below are recommendations until approved through the normal gates;
- every Stage 2 threshold, and which categories get one, is undecided until Stage 1 evidence is reviewed;
- P1 already has a Stage 2 gate (15% relative) by an earlier decision [D]; this ruling does not change it.

**Source requirement [D]:** §31 lists bundle size, component cost, rendering cost, change/update cost, virtual scrolling performance, overlay performance, SSR/hydration behavior and tree-shaking, and says "Do not optimize based on assumptions; establish benchmarks". §40 lists "performance benchmarks". **No source sets a numeric threshold for any of them.**

**Repository precedent [D][R]:**

- **Two-stage model:** Phase 10 uses Stage 1 (measure and record a baseline, informational) followed by Stage 2 (regression gate against the merge base).
- **Bundle size:** Stage 2 at **15% relative increase** (`validate-bundle-size.mjs`).
- **Coverage:** **2.0 percentage points absolute** (`validate-coverage.mjs`).

| #   | §31 category              | Current evidence                                                | Proposed measurement method [Rec]                                                                                                                                                       | Proposed acceptance criterion [Rec]                                                                                                                                                                                       |
| --- | ------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Bundle size               | CI gate, 15% relative [CI]                                      | Existing `measure-package-size.mjs`                                                                                                                                                     | Keep the existing gate green for every package, including S-2 additions                                                                                                                                                   |
| P2  | Tree-shaking              | Angular spot-checks in `PERFORMANCE.md` Phase 2 [R]             | Per framework, a consumer build (playground apps, GAP-008) importing one component; record the bundle delta                                                                             | Stage 1: recorded for all three frameworks. Stage 2 (optional): a single-component import does not pull unrelated components' code                                                                                        |
| P3  | Component cost (creation) | Throwaway Angular timings for 2 components [R]                  | Committed micro-benchmark per framework: mount, then destroy, repeated N times; median and p95; in the pinned Docker Playwright image; representative set (simple, form, overlay, data) | Stage 1: baselines recorded with the method, environment and variance. Stage 2: a relative regression threshold set **from the measured Stage-1 variance** (the 15% bundle precedent is a candidate, not a derived value) |
| P4  | Rendering cost            | None [R]                                                        | Playwright plus the Performance API on Storybook stories: time from navigation to story-root render, median of N                                                                        | As P3                                                                                                                                                                                                                     |
| P5  | Change/update cost        | None [R]                                                        | Same harness: time for a prop or state update to settle (for example, Table sort, Select open)                                                                                          | As P3                                                                                                                                                                                                                     |
| P6  | Virtual scrolling         | None [R]                                                        | Scroller and virtual Table stories: scripted scroll, recording long tasks and frame durations                                                                                           | Stage 1 recorded. A Stage 2 metric (for example, no long tasks above a bound) needs an approved bound [A]                                                                                                                 |
| P7  | Overlay performance       | None [R]                                                        | Dialog, Popover, Drawer, Menu stories: open-to-visible and close-to-removed timings                                                                                                     | As P3                                                                                                                                                                                                                     |
| P8  | SSR/hydration             | Angular SSR correctness green; React/Vue blocked (GAP-088) [CI] | Playground SSR harness: server render time and time to hydrated, per framework                                                                                                          | Stage 1 after GAP-088. Correctness (existing tests) stays the gate                                                                                                                                                        |

**Notes [Rec]:**

- Timing benchmarks on shared CI runners are noisy. Comparing against the merge base in the same run (as the bundle-size gate does), or running in the pinned Docker image, reduces hardware variance.
- No absolute millisecond budget is proposed, because no source or measurement supports one yet.

**Still open:** approval of the Stage 1 measurement methods (through a research and Spec gate), then a separate decision per category on whether its Stage 1 evidence supports a Stage 2 gate and at what threshold.

---

## 6. S-5: accessibility and focus defects, classification and proposed criteria

**User ruling S-5 (revision 3) [U]:**

- **Required fixes before the target publish (approved scope requirements):**
  - GAP-086, GAP-100, GAP-111, GAP-112, GAP-123;
  - every critical-severity component-level accessibility baseline finding: today 19 rows, all in shipped components (`label` on Checkbox stories: 1 Angular, 4 React, 5 Vue; `aria-required-children` on Table stories: 3 per framework) [R].
- **Pending further research and a separate decision:** A1–A7 as the complete acceptance policy, and the disposition of every other finding (serious baseline rows, the environmental rows, and GAP-103, 104, 114, 115, 116, 122).
- **Not accepted:** no unselected finding is an accepted residual by this ruling.

Classes in §6.2 marked [Rec] remain recommendations; those marked [U] are rulings.

**Source requirement [D]:** §30: each component must define semantics, keyboard, focus, ARIA, screen-reader, disabled/loading, high-contrast and RTL behaviour; "Accessibility regressions are release blockers for affected components". The regression part is CI-enforced today. **No source states whether pre-existing defects block.**

### 6.1 Grandfathered baseline rows

309 rows in `ACCESSIBILITY_BASELINE.md`. Rule impact and WCAG tags were read from the installed axe-core 4.13.0 [R][L].

| Rule                          | Rows | axe impact   | WCAG             | Nature                                                                                                   |
| ----------------------------- | ---- | ------------ | ---------------- | -------------------------------------------------------------------------------------------------------- |
| `region`                      | 94   | moderate     | best-practice    | Environmental: the Storybook shell (246 rows marked environmental in total)                              |
| `landmark-one-main`           | 76   | moderate     | best-practice    | Environmental                                                                                            |
| `page-has-heading-one`        | 76   | moderate     | best-practice    | Environmental                                                                                            |
| `color-contrast`              | 34   | serious      | 2 AA, 1.4.3      | Component level. Some rows are upstream Aura colours (cross-tranche study X-8 (a), undecided row policy) |
| `label`                       | 10   | **critical** | 2 A, 4.1.2       | Component level                                                                                          |
| `aria-required-children`      | 9    | **critical** | 2 A, 1.3.1       | Component level                                                                                          |
| `svg-img-alt`                 | 7    | serious      | 2 A, 1.1.1       | Component level                                                                                          |
| `scrollable-region-focusable` | 3    | serious      | 2 A, 2.1.1/2.1.3 | Component level                                                                                          |

So 246 rows are best-practice findings about the Storybook page shell, not component WCAG failures. 63 rows are component-level WCAG A/AA failures: 19 critical, 44 serious.

### 6.2 Open accessibility and focus GAPs

Severity is the GAP's recorded blocking level. The WCAG mapping is this assessment's analysis [A] unless the GAP or the axe rule states it.

| GAP | Framework | Defect                                                                                                              | Recorded level | WCAG / impact                                                                    | Class                                                 |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 086 | ng, vue   | ContextMenu items not keyboard-reachable                                                                            | MEDIUM         | 2.1.1 Keyboard (A) [A]                                                           | **Required fix** [U]                                  |
| 112 | ng, vue   | Galleria: `aria-command-name` (serious, 4.1.2), `list` (serious, 1.3.1), `aria-allowed-role` (minor, best-practice) | MEDIUM         | axe [R]                                                                          | **Required fix** [U]                                  |
| 123 | ng, vue   | Listbox: `label` (critical, 4.1.2), `nested-interactive` (serious, 4.1.2)                                           | MEDIUM         | axe [R]                                                                          | **Required fix** [U]                                  |
| 114 | ng, vue   | Carousel indicators ignore arrow keys                                                                               | MEDIUM         | APG pattern; 2.1.1 only if the indicators are otherwise unreachable [A]          | Fix, or a residual with a reason [Rec]                |
| 100 | vue       | Drawer does not move focus inside on open                                                                           | MEDIUM         | 2.4.3 Focus Order (A) for a modal pattern [A]                                    | **Required fix** [U]                                  |
| 111 | vue       | Galleria full screen ignores Escape when focus is outside the content                                               | MEDIUM         | 2.1.2 / dialog pattern [A]                                                       | **Required fix** [U]                                  |
| 115 | ng        | Galleria Tab sequence differs                                                                                       | MEDIUM         | 2.4.3 [A]                                                                        | Fix, or a residual with a reason [Rec]                |
| 122 | ng        | PickList Tab order: transfer controls after the target                                                              | MEDIUM         | 2.4.3 / 1.3.2 [A]                                                                | Fix, or a residual with a reason [Rec]                |
| 103 | vue       | Image preview does not restore focus                                                                                | LOW            | 2.4.3 [A]                                                                        | Residual allowed with a reason [Rec]                  |
| 104 | vue       | ImageCompare root takes focus before the slider                                                                     | LOW            | Extra tab stop [A]                                                               | Residual allowed with a reason [Rec]                  |
| 116 | ng        | Galleria returns focus to the invoker after full screen                                                             | LOW            | Returning focus is generally recommended practice; the GAP records no intent [A] | Candidate "accepted divergence" [Rec]; needs a ruling |

### 6.3 Proposed measurable accessibility criteria [Rec]

- **A1:** no new violations. This is the existing baseline gate, extended to every S-2 component story.
- **A2:** zero **critical** component-level rows for in-scope components (today 19 rows: `label` 10, `aria-required-children` 9), plus the critical findings in GAP-123.
- **A3:** **serious** component-level WCAG A/AA rows (today 44) and the GAP-112/123 serious findings: fixed, or listed as residuals each with a reason and owner. Upstream-Aura `color-contrast` rows wait for the X-8 (a) row-policy decision.
- **A4:** every component in scope passes keyboard operability. No GAP-086-type defects remain: menus, overlays and composites are operable by keyboard per their APG pattern.
- **A5:** focus management for modal patterns: focus moves in, stays, and returns as the pattern defines (GAP-100, 111). Tab-order differences (GAP-115, 122, 103, 104) are fixed or recorded as residuals.
- **A6:** the 246 environmental best-practice rows are proposed to be treated as environmental findings, not component defects. Not accepted: their disposition is part of the pending policy decision.
- **A7:** screen-reader behaviour (§30) is externally unexercisable by CI [X]. A manual verification record per component family is proposed as evidence.

**Still open:** further research and a separate decision on A1–A7 as the complete policy, and on the disposition of every finding not listed in the S-5 ruling. The S-5 required fixes already satisfy A2 for current rows and the GAP-086/100/111 parts of A4–A5; that overlap does not adopt A2, A4 or A5 as policy.

---

## 7. Completion roadmap (revised)

Each workstream needs authorization at every gate:

> Research → Decision → Spec → Spec Review → Plan → Plan Review → Implementation → Verification → Closeout

Research authorized by revision 3 rulings ([RS]) still produces an uncommitted research record for review; its outcome is decided separately.

| Step | Workstream                                  | Content                                                                                                                                                    | Depends on                                                                              | First gate                    |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| 0    | **Remaining decisions**                     | §9 items; CI-health DR-1..DR-7                                                                                                                             | —                                                                                       | User rulings                  |
| 1    | **CI signal**                               | GAP-090, 088, 089, then 093, U2, 091; combined ADR-052 amendment (DR-6, DR-7)                                                                              | DR rulings                                                                              | Spec(s)                       |
| 2    | **Release path**                            | GAP-087 (DR-1); changesets; a first supervised Version/Publish run; external items (§1.5)                                                                  | Step 1 (CI trust); Step 2a                                                              | DR-1, then Spec               |
| 2a   | **Package names (N-1)** [U]                 | Settle the PROVISIONAL package names and boundaries (§43) before the first publish; record SC-1 in the tracking documents only with separate authorization | —                                                                                       | Research, then Decision       |
| 3    | **Truthful support claims**                 | Manifest vs peers; React 17/19 (verify or narrow); confirm the Vue floor                                                                                   | —                                                                                       | Short research, then Decision |
| 4    | **Provenance**                              | DR-5 scope, then backfill                                                                                                                                  | DR-5                                                                                    | Decision                      |
| 5    | **Component scope (S-2)**                   | React/Vue inventories; then implementation by family (icons; Paginator rows-per-page (GAP-040))                                                            | Inventories                                                                             | Research                      |
| 5a   | **K-7 research** [RS]                       | Limited architecture research: Tree, TreeTable, TreeSelect, OrganizationChart; ADR-043 preserved                                                           | —                                                                                       | Research (authorized)         |
| 5b   | **K-8 research** [RS]                       | DECISION-B, the external-dependency approval policy (Chart, Editor)                                                                                        | —                                                                                       | Research (authorized)         |
| 5c   | **K-9 research** [RS]                       | Which `config`, `passthrough`, `api` surfaces, if any, the approved scope needs; YAGNI decisions preserved                                                 | Step 5 inventories (to know the scope's needs)                                          | Research (authorized)         |
| 5d   | **Governed-area implementation**            | Tree family, Chart, Editor, any K-9 surfaces                                                                                                               | 5a–5c outcomes and their decisions (an ADR change, if any, by its own gate: SC-3, SC-4) | Decision                      |
| 6    | **Metadata / Skills / LLM context (S-3)**   | Records and Skills for every in-scope component; regenerate `llms*.txt`                                                                                    | Step 5 inventories (denominator)                                                        | Research                      |
| 7    | **Accessibility: required fixes (S-5)** [U] | GAP-086, 100, 111, 112, 123; the 19 critical baseline rows (Checkbox `label`, Table `aria-required-children`)                                              | —                                                                                       | Research per family           |
| 7a   | **Accessibility: policy research (S-5)**    | Evidence-based recommendation on A1–A7 and on the disposition of every other finding                                                                       | —                                                                                       | Research, then Decision       |
| 8    | **Benchmarks Stage 1 (S-4)** [U]            | P1–P8 baselines, methods, environment, variance                                                                                                            | GAP-008 playgrounds (P2, P8); GAP-088 (P8)                                              | Research (methods), then Spec |
| 8a   | **Benchmarks Stage 2 (S-4)**                | Gates only where Stage 1 evidence supports a threshold                                                                                                     | Step 8 evidence                                                                         | Decision per category         |
| 9    | **Stale-record correction**                 | GAP-002, 008, 017, 040; ROADMAP fn 1; GAP-094 text; validator comment                                                                                      | None (documentation)                                                                    | Documentation authorization   |
| 10   | **Final acceptance gate**                   | §8                                                                                                                                                         | Steps 0–9 as ruled                                                                      | User review                   |

**Deferrals that stay out:**

- GAP-012, 026;
- §43 DEFERRED and OUT OF SCOPE;
- the parity corpus;
- the X-8 (a) row policy, until ruled;
- GAP-092, unless chosen.

GAP-013, 019, 020 and 021 are no longer plain deferrals: S-2 puts their areas in scope, and their path depends on the K-7, K-8 and K-9 research. Their recorded decisions remain in force meanwhile.

---

## 8. Proposed final acceptance gate (revised)

Each criterion needs objective evidence. Under D-40 [U], an unmet criterion is an exception only if it is explicitly documented and approved by the user: a row in the residual register (G14) with an ID, the criterion, the reason, the user's approval date and a follow-up GAP. Nothing is pre-approved.

| #   | Criterion                               | Required evidence                                                                                                                                                                                                                                                       |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | CI trustworthy                          | The final `main` run's failing steps are exactly the approved exception list; the run ID is recorded                                                                                                                                                                    |
| G2  | Release path proven (S-1)               | A successful Release run through Version, and the first restricted publish recorded with the npm-side outcome [X: confirmed by the user]                                                                                                                                |
| G2a | Package names settled (N-1)             | A recorded naming decision; every published package uses the decided name                                                                                                                                                                                               |
| G3  | Licensing/provenance                    | License scan green; `provenance:validate` green under the DR-5 scope                                                                                                                                                                                                    |
| G4  | No Prime runtime dependency             | Dependency-ceiling and boundary validations green                                                                                                                                                                                                                       |
| G5  | Support claims true                     | Manifest = peers; every declared range tested at its floor and newest major                                                                                                                                                                                             |
| G6  | Accessibility (S-5)                     | The S-5 required fixes verified: GAP-086, 100, 111, 112, 123 resolved, and zero critical component-level rows in `ACCESSIBILITY_BASELINE.md` (rows removed only by real scans). Every other finding meets the policy decided after step 7a, or is an approved exception |
| G7  | Security                                | SAST runs and matches `SAST_BASELINE.md`; scans green                                                                                                                                                                                                                   |
| G8  | Performance (S-4)                       | Stage 1 baselines for P1–P8 recorded in `PERFORMANCE.md` (method, environment, variance); every Stage 2 gate decided after step 8a green; bundle-size and coverage gates green                                                                                          |
| G9  | Visual regression                       | Visual steps green, including S-2 components (or U2/GAP-097 as approved exceptions)                                                                                                                                                                                     |
| G10 | Component scope (S-2)                   | React/Vue inventories reconciled; every in-scope area shipped in each applicable framework; K-7, K-8, K-9 outcomes recorded as decisions                                                                                                                                |
| G11 | Metadata / Skills / LLM context (S-3)   | Records and Skills for every in-scope shipped component; `pnpm run validate` green                                                                                                                                                                                      |
| G12 | CLI / MCP / migration / documented APIs | Suites green; `MIGRATION.md` current; the CLI-quality and documented-API bars decided (§9, item 3) and met                                                                                                                                                              |
| G13 | Records consistent                      | No stale entries; GAP statuses match the evidence (changed only by user decision)                                                                                                                                                                                       |
| G14 | Exception register                      | One user-approved table of every exception to a §40 criterion or to this gate, kept in `BLUEPRINT_GAPS.md` §10 (location decided 2026-10-11)                                                                                                                            |

---

## 9. Decisions and approvals still needed

Recorded in revision 3 and therefore removed from this list: K-7, K-8, K-9 (as research authorizations), N-1, D-40. Their research steps (5a–5c) and source conflicts (§1.7) remain.

1. **S-4 Stage 1 methods:** approve the measurement methods for P1–P8 (§5) through the normal research and Spec gates. Stage 2 thresholds follow per category from the Stage 1 evidence.
2. **S-5 policy:** after the policy research (step 7a), adopt, change or reject A1–A7, and decide the disposition of every finding not covered by the required-fix list.
3. **Measurable bars D-40 leaves undefined:** "CLI quality" (row 15) and "documented APIs" beyond S-3 coverage (row 10) apply to the publish by D-40, but no source gives a measurable bar. A decision is needed on what evidence satisfies them (a research step may propose one).
4. **Outcomes of the authorized research:** K-7, K-8 and K-9 each end in a decision. If one requires changing ADR-043 or the YAGNI ADRs (SC-3, SC-4), that change needs its own authorized gate.
5. **SC-1 recording (optional):** whether to authorize a documentation change that records N-1's earlier naming deadline in the tracking documents. The sources are not edited by this assessment.

The CI-health rulings DR-1..DR-7 (decision brief) remain independent and can be decided in parallel.

---

## 10. Validation of this assessment

- **CI facts:** taken from actual GitHub Actions runs at `99364dc` and `e32c224`.
- **Repository facts:** checked at `99364dc`. Revision 2 adds:
  - the `COMPONENT_INVENTORY.md` "Remaining" rows;
  - `.changeset/config.json`, `release.yml` and `MIGRATION.md` §7.3–7.4;
  - the `ACCESSIBILITY_BASELINE.md` rule counts;
  - axe-core 4.13.0 rule impacts and tags, read from the installed package;
  - the gate thresholds in `validate-bundle-size.mjs` and `validate-coverage.mjs`.
- **Revision 3 additions:** the 19 critical baseline rows listed by story from `ACCESSIBILITY_BASELINE.md`; the absence of Tree, TreeTable, TreeSelect, Chart and Editor directories in all three frameworks, and of an Angular OrganizationChart (React and Vue OrganizationChart ship as `organization-chart`; erratum 2026-10-11). No research authorized by K-7, K-8, K-9, S-4 or S-5 was conducted.
- **Counts:** from read-only scratch scripts (not committed).
- **External facts:** npm state from one read-only query (E404) [X].
- **Untouched:** no repository file other than this draft was created or changed; the BAE document and worktree were not touched; GAP-124 and GAP-064 (PARTIAL) and GAP-098 (OPEN) are unchanged.
