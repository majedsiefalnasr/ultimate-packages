# S-4 — Performance benchmarks: proposed Stage 1 measurement methods (P1–P8) (2026-10-11)

**Status:** research record, **uncommitted draft** for user review. Authorized by the user on 2026-10-11 (ruling S-4: all of P1–P8 in scope, two-stage). It proposes methods only. **No measurement has been run, and no threshold is proposed.** Stage 2 gates will follow per category from Stage 1 evidence, by separate decision. Recommendations are marked **[Rec]**.

**Status note (2026-10-19):** committed, no longer an uncommitted draft; the proposals it left pending were decided as ADR-057; see `docs/architecture/DECISIONS.md`, the ADR-057 heading (line 478 as of `94807833`). The text below is the point-in-time record.

**Labels:** [R] repository evidence · [D] decision record · [A] assumption · [Rec] recommendation.

**Baseline:** `main` == `99364dc`.

---

## 1. Ruling and constraints

- **Stage 1 (approved scope):** for each of P1–P8, a reproducible baseline, the measurement method, the environment and the observed variance, all recorded.
- **Stage 2 (conditional):** a regression gate only where measured evidence supports a defensible threshold.
- **Excluded by the ruling:** absolute timing budgets; thresholds without measurements.

## 2. Existing measurement infrastructure

| Asset                                               | What it does                                                                                                                                         | CI?                                                | Evidence             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------- |
| `measure-package-size.mjs`                          | dist size, gzip size and file count for 17 publishable packages                                                                                      | Used by the gate below                             | [R]                  |
| `validate-bundle-size.mjs`                          | Stage 2 gate: fails on more than 15% relative growth against the merge base                                                                          | **Yes** (green)                                    | [R][D]               |
| `verify-tree-shaking.mjs`, `-react.mjs`, `-vue.mjs` | esbuild bundle of built `dist/`; checks that importing Button does not pull in Dialog's overlay/focus-trap/motion code; checks side-effect retention | **No** (no `package.json` script, not in `ci.yml`) | [R]                  |
| Playwright browser jobs                             | Strict suites in `mcr.microsoft.com/playwright:v1.63.0-jammy` on `ubuntu-24.04-arm` (shared GitHub runners)                                          | Yes                                                | `ci.yml:166–168` [R] |
| SSR harnesses                                       | `apps/playground-{angular,react,vue}` (ADR-045); Angular SSR green; React/Vue time out (GAP-088)                                                     | Partly                                             | [R][D]               |
| `PERFORMANCE.md`                                    | Package sizes per phase; throwaway Angular creation timings (Button, Dialog, 100 iterations; mean dominated by a JIT-warmup outlier)                 | —                                                  | [R]                  |

## 3. Common Stage 1 protocol [Rec]

Every category records the same metadata, so baselines can be reproduced and compared:

1. **Identity:** commit SHA, date, package versions, browser name and version, Node version, pnpm version.
2. **Environment:** the pinned Playwright Docker image (the same image as CI), CPU architecture, runner type (GitHub-hosted arm64 or a local Docker host, named), viewport (1280 × 720, the Parity Playbook convention), and CPU/network throttling if any (recommended: none for Stage 1).
3. **Build:** production builds of the packages (`dist/`) and of the harness. Development-mode numbers are never recorded.
4. **Repetition:** discard W warm-up iterations; then R independent runs (fresh browser context each) of I iterations. Suggested starting values: W = 5, R = 10, I = 20. These are a starting point for the variance study, not a requirement.
5. **Statistics:** for each metric record median, p95, interquartile range and the coefficient of variation across runs. Also record **same-commit run-to-run differences**, which are the input to any Stage 2 threshold (§5).
6. **Deterministic proxies first:** where a deterministic quantity exists (bytes, module count, DOM node count, render or commit count), record it alongside or instead of wall-clock time. These have near-zero noise and gate well.
7. **Storage:** results as a machine-readable JSON artifact per run, summarized in a new `PERFORMANCE.md` section per category (documentation change at implementation time, separately authorized).

## 4. Per-category methods [Rec]

| #   | Category (§31)            | Method                                                                                                                                    | Metrics                                                                                                                   | Representative set                                                                                    | Notes                                                                                                   |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P1  | Bundle size               | Existing `measure-package-size.mjs`                                                                                                       | dist and gzip bytes, file count                                                                                           | All 17 packages                                                                                       | Already Stage 2 (15%, earlier decision); Stage 1 adds only the variance statement (deterministic: zero) |
| P2  | Tree-shaking              | Generalize the three `verify-tree-shaking*` scripts: one esbuild production bundle per component per framework, subpath and barrel import | Bundle bytes per single-component import; whether unrelated components' code is present                                   | Every shipped component (cheap and deterministic)                                                     | Run against `dist/`; add a CI script only at Stage 2                                                    |
| P3  | Component cost (creation) | Browser harness: mount, then unmount, of one component in a minimal page built from the playground app                                    | Median/p95 mount time; DOM node count after mount                                                                         | Button, InputText, Select, DatePicker, Dialog, Popover, Table (100 rows), Scroller, Tree (once built) | Uses the Performance API (`performance.mark/measure`)                                                   |
| P4  | Rendering cost            | Same harness: first render of a component with a fixed data set                                                                           | Time to first render; layout/long-task count (PerformanceObserver)                                                        | Table (1000 rows, no virtualization), DataView, OrganizationChart                                     | Fixed seeded data                                                                                       |
| P5  | Change/update cost        | Same harness: scripted update (sort, filter, value change)                                                                                | Time from action to settled DOM (next animation frame after mutation); render/commit count where the framework exposes it | Table sort and filter, Select value, Tree expand (once built)                                         | Settle detection must be identical across frameworks                                                    |
| P6  | Virtual scrolling         | Scripted scroll of a fixed distance at a fixed rate on Scroller and virtual Table                                                         | Long tasks above 50 ms (the browser definition); frame-duration distribution (p95); rendered-row count                    | 10,000 items                                                                                          | The rendered-row count is deterministic                                                                 |
| P7  | Overlay performance       | Open, then close, scripted                                                                                                                | Open-to-visible and close-to-removed times; DOM node delta after close (leak check, deterministic)                        | Dialog, Popover, Drawer, Menu, Select panel                                                           | Animations: record with motion enabled and with `prefers-reduced-motion`                                |
| P8  | SSR / hydration           | Playground SSR harnesses                                                                                                                  | Server render time; time to hydrated; hydration mismatch warnings (count, deterministic)                                  | The SSR harness pages per framework                                                                   | React/Vue depend on GAP-088 being fixed first                                                           |

## 5. How Stage 2 thresholds would be derived (method only) [Rec]

No threshold is proposed. For a category to qualify for a Stage 2 gate:

1. **Evidence of stability:** the Stage 1 same-commit run-to-run differences in the gate's environment (CI runner, not a local machine) are recorded for at least R runs.
2. **Derivation rule:** a threshold must exceed the observed same-commit noise (for example, the 99th percentile of same-commit differences). Otherwise the gate fails without any real regression.
3. **Comparison design:** compare against the merge base built and measured in the same job, as the bundle-size gate does, to cancel runner-to-runner variance.
4. **Deterministic metrics** (bytes, node counts, rendered rows, hydration warnings) can gate on exact or near-exact change. Timing metrics gate only if rule 2 gives a threshold the user considers meaningful.
5. Each threshold is approved by the user per category, with its Stage 1 evidence attached.

## 6. Risks and open points

- **Shared-runner noise:** CI runs on shared GitHub-hosted arm64 runners [R]; timing variance there is unknown until measured [A]. A local Docker run is reproducible but is not CI evidence.
- **Harness location:** P3–P7 need a minimal page per framework. The playgrounds (ADR-045: "minimal harness", "not a full playground") are the smallest existing vehicle. Using them for benchmarks extends their scope, which ADR-045 left to GAP-008. That is a scope decision, not an ADR change [D][A].
- **Storybook vs playground:** Storybook adds its own runtime and addons, so timing inside Storybook measures more than the component. Playgrounds are preferred for P3–P8; Storybook stays the visual and accessibility surface [Rec].
- **P8 depends on GAP-088** (React/Vue SSR CI).
- **Effort:** P1 exists; P2 is a script generalization; P3–P7 share one harness; P8 reuses the SSR harnesses.

## 7. Unresolved decisions

- **S4-D1:** approve the common protocol (§3) and the per-category methods (§4), or amend them.
- **S4-D2:** approve using the playground apps as the benchmark harness (GAP-008 scope; ADR-045 unchanged).
- **S4-D3:** environment of record for Stage 1: CI runner (needed for Stage 2), local Docker, or both.

## 8. Next required approval gate

**Decision** on S4-D1 to S4-D3, then a **Spec** for the Stage 1 harness and recording, Spec Review, Plan and Plan Review. Measurements are taken only at implementation. Stage 2 is a later, separate decision per category.
