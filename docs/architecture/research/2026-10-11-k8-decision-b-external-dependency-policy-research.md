# K-8 — DECISION-B: external runtime dependency approval policy (Chart, Editor) research (2026-10-11)

**Status:** research record, **uncommitted draft** for user review. Authorized by the user on 2026-10-11 (Final Project Completion Assessment, revision 3, ruling K-8). It neither implements nor excludes Chart or Editor, and decides nothing. Recommendations are marked **[Rec]**.

**Status note (2026-10-19):** committed, no longer an uncommitted draft; the proposals it left pending were decided as ADR-055; see `docs/architecture/DECISIONS.md`, the ADR-055 heading (line 440 as of `94807833`). The text below is the point-in-time record.

**Labels:** [R] repository evidence · [U] pinned upstream source (PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5 from `.vendor-cache/`) · [N] npm registry metadata (read-only `npm view`, 2026-10-11) · [D] decision record · [A] assumption · [Rec] recommendation.

**Baseline:** `main` == `99364dc`.

---

## 1. Question

DECISION-B (BLUEPRINT_GAPS §5) asks how Ultimate approves a **non-Prime external runtime dependency**. Chart (GAP-019, Chart.js) and Editor (GAP-020, Quill) are both blocked on it. S-2 puts both in scope. What policy is supported by the evidence, and what is the smallest decision?

## 2. Existing rules and mechanisms

| Item                                                                   | What it covers                                                                                                                                                                         | Applies to Chart.js / Quill?                                                | Source                                |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| ADR-004                                                                | No required runtime dependency on PrimeNG/PrimeVue/PrimeReact or PrimeUIX packages                                                                                                     | **No**: Prime-specific (GAP-019 says so explicitly)                         | `DECISIONS.md` [D]                    |
| ADR-005                                                                | MIT baseline/provenance for Prime-derived source                                                                                                                                       | No (no source is copied)                                                    | [D]                                   |
| Blueprint §8                                                           | Provenance must distinguish "unrelated third-party dependencies"; "Legal review is required before external distribution if company policy requires it"                                | **Yes**                                                                     | `BLUEPRINT.md` §8 [D]                 |
| Blueprint §29                                                          | Dependency, license and SAST scanning, vulnerability monitoring, "malicious package/dependency review"                                                                                 | **Yes**                                                                     | [D]                                   |
| `DEPENDENCIES.md` "Runtime — retained, legitimate framework ecosystem" | `@angular/*` (including `cdk`), `rxjs`, `tslib`, Vue, React, `react-transition-group`                                                                                                  | No: Chart.js and Quill are not framework ecosystem                          | [R]                                   |
| `DEPENDENCIES.md` "Flagged exclusion — copy-paste risk"                | PrimeReact's repository root is its showcase app; its dependencies, **naming `chart.js` and `quill`**, "must never be pulled into Ultimate's dependency tree during Phase 3 migration" | **Yes, conflict K8-C1** (§3)                                                | [R]                                   |
| License scan (CI, green)                                               | `--onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;CC0-1.0"`                                                                                                              | Yes: both licenses are allowed (§4)                                         | `package.json` [R]                    |
| Dependency vulnerability scan, install-script policy (CI, green)       | `pnpm audit --prod`; `onlyBuiltDependencies` allowlist integrity                                                                                                                       | Yes, automatically, once in the lockfile                                    | [R]                                   |
| Dependency-ceiling validator                                           | Prime and `@primeuix/*` only                                                                                                                                                           | No                                                                          | `validate-dependency-ceiling.mjs` [R] |
| Precedent: `@angular/cdk`                                              | Added for OrderList/PickList drag/drop (`f757975`), declared a peer (`29a3390`, GAP-070); classified as framework ecosystem                                                            | Process precedent only: no ADR was needed because it is framework ecosystem | git, `DEPENDENCIES.md` [R]            |
| `peerDependenciesMeta` (optional peers)                                | Not used by any `packages/*/package.json`                                                                                                                                              | —                                                                           | [R]                                   |

## 3. Findings

### F-1 — Upstream treats both libraries as consumer-installed and undeclared

| File                                            | Import style [U]                  | Declared in the Prime package's `package.json`? [U]                                             |
| ----------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| PrimeNG `chart/chart.ts`                        | **static** `from 'chart.js/auto'` | No (no peer, no dependency)                                                                     |
| PrimeNG `editor/editor.ts`                      | dynamic `import('quill')`         | No                                                                                              |
| PrimeVue `chart/Chart.vue`, `editor/Editor.vue` | dynamic `import(...)`             | No                                                                                              |
| PrimeReact `chart/Chart.js`, `editor/Editor.js` | dynamic `import(...)`             | Not by the library; the repository root (the showcase) lists `chart.js` 4.5.0 and `quill` 2.0.3 |

Upstream relies on the consumer installing the library, with no declared contract. Copying that exactly would give Ultimate an undeclared runtime dependency, which no current Ultimate rule allows [A].

### F-2 — The libraries themselves [N]

| Library    | Version (latest / PrimeReact-pinned) | License      | Runtime dependencies                                     | Unpacked size |
| ---------- | ------------------------------------ | ------------ | -------------------------------------------------------- | ------------- |
| `chart.js` | 4.5.1 / 4.5.0                        | MIT          | `@kurkle/color`                                          | 6.17 MB       |
| `quill`    | 2.0.3 / 2.0.3                        | BSD-3-Clause | `lodash-es`, `parchment`, `quill-delta`, `eventemitter3` | 3.04 MB       |

Both licenses pass the existing CI allowlist. Unpacked size is not shipped size; bundle cost must be measured (S-4 P1/P2) [A]. Maintenance data (last publish: `quill` 2025-01-20, `chart.js` 2025-10-13) is registry metadata only and is no proof of health [N][A].

### F-3 — Component size is small; the dependency is the substance

Upstream non-test lines: Chart ng 249 / react 166 / vue 146; Editor ng 462 / react 1372 / vue 222 [U]. The engineering cost is small; the open question is purely the dependency policy.

### K8-C1 — Conflict with `DEPENDENCIES.md`

`DEPENDENCIES.md` names `chart.js` and `quill` as must-never-enter dependencies. The context is copy-paste risk from PrimeReact's showcase during Phase 3 migration, not a policy against the libraries themselves [R][A]. Any option that adds them needs an authorized `DEPENDENCIES.md` update that adds a new category, so the two records do not contradict each other. This is a tracking document (tier 5), not an ADR; changing it does not amend any ADR.

## 4. Options

DECISION-B already lists (a), (b) and (c). This research adds two **integration models** that apply under (a) or (b).

| Option                         | Description                                                                                                                                                                    | Fit with rulings                                                                                                                       | Assessment                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| (a) Generic policy             | Extend the Phase-0 rigor to any external runtime dependency: written criteria, a recorded decision per dependency, CI enforcement                                              | Fits S-2 and D-40 (§29 security process)                                                                                               | **[Rec]**, the option DECISION-B already "weakly favored" |
| (b) Case-by-case ADR           | One ADR per dependency, no generic criteria                                                                                                                                    | Fits, but repeats the analysis each time and has no CI enforcement                                                                     | Acceptable fallback                                       |
| (c) Scope out Chart and Editor | No external dependency                                                                                                                                                         | **Contradicts S-2**; only by a new user ruling                                                                                         | Not available without a new ruling                        |
| Integration I-1                | **Optional peer dependency** (`peerDependencies` + `peerDependenciesMeta.optional`), loaded lazily by the component only; consumers who never use Chart/Editor install nothing | Keeps the "no required runtime dependency" posture COMPONENT_INVENTORY cites; matches upstream's consumer-installed model but declared | **[Rec]**                                                 |
| Integration I-2                | Regular `dependency` of the framework package                                                                                                                                  | Every consumer installs both libraries; widens the security and size surface                                                           | Not recommended                                           |
| Integration I-3                | Adapter/injection: the consumer passes the library constructor; Ultimate declares nothing                                                                                      | No install surface, but diverges from all three upstream APIs; weaker typing                                                           | Possible; more design work                                |

## 5. Recommendation [Rec]

1. **Decide DECISION-B as option (a)** with these minimum approval criteria for any external runtime dependency:
   - the license is on the CI allowlist;
   - `pnpm audit --prod` is clean for it and its closure at approval time;
   - no install scripts, or an explicit `onlyBuiltDependencies` review;
   - the measured bundle cost is recorded (S-4 P1/P2);
   - the version range is pinned and recorded in `DEPENDENCIES.md` under a new "approved optional runtime dependencies" category;
   - it is consumed only through integration I-1.
2. **Apply it to `chart.js` and `quill`** as the first two cases (Chart, Editor), each recorded in the same decision or in two short ADRs.
3. **CI enforcement:** a small validator that fails if any framework package declares a non-framework runtime dependency or peer that is not on the approved list. This is an extension of the existing ceiling-validator pattern, specified in its own Spec.
4. **Angular upstream uses a static import for Chart.js:** an Angular Chart must use a lazy import to keep I-1 optional. This is a Spec-level detail, not a decision.

## 6. Unresolved decisions

- **K8-D1:** option (a), (b), or a new ruling for (c).
- **K8-D2:** integration model I-1, I-2 or I-3.
- **K8-D3:** approve `chart.js` and `quill` under the chosen policy, and the version ranges (`chart.js` ^4.5, `quill` ^2.0.3 suggested from upstream pins [Rec]).
- **K8-D4:** authorize the `DEPENDENCIES.md` update that resolves K8-C1.
- **Not resolvable here:** Blueprint §8's "legal review … if company policy requires it" depends on company policy, which the repository cannot show [A].

## 7. Next required approval gate

**Decision** on K8-D1 to K8-D3 (a new ADR; ADR-004 and ADR-005 are not amended), plus authorization for K8-D4. After that, the Chart and Editor Specs.
