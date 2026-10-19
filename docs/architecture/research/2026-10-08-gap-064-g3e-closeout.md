# GAP-064 G3-E closeout record (DRAFT) — Media and Data

**Date:** 2026-10-11
**Status:** **ACCEPTED as PARTIAL** (user, 2026-10-11): an accurate record of the executed G3-E work and its remaining limitations. G3-E is **executed, not fully complete**, and GAP-064 stays **PARTIAL**. Merge and push are **not** authorized (see §9 and §10).

**Status note (2026-10-19):** original lines 20, 67, 85 and 97 (E1-V2 OPEN, E1-B1 BLOCKED, merge not ready) are superseded by original lines 42–43 and 101 (E1-B1 RESOLVED, E1-V2 CLOSED, 2026-10-11), and original lines 3–5 (merge and push not authorized, not merged) are superseded by merge `d3aabf57` on `main`; original line numbers are as of `94807833`; see merge `d3aabf57`. The text below is the point-in-time record.
**Branch:** `feature/gap-064-g3e-media-data`, head `57a3ced` (plus this draft), branched from `main` `cad9f85`. Not merged, not pushed.
**Scope:** Spec `docs/superpowers/specs/2026-10-08-gap-064-g3e-media-data-design.md`; Plan `docs/superpowers/plans/2026-10-08-gap-064-g3e-media-data.md`. Batch records:

- [E-1](2026-10-08-gap-064-g3e-e1-record.md) (Image, ImageCompare)
- [E-2](2026-10-08-gap-064-g3e-e2-record.md) (Carousel, Galleria)
- [E-3](2026-10-08-gap-064-g3e-e3-record.md) (OrderList, PickList)
- [E-4](2026-10-08-gap-064-g3e-e4-record.md) (DataView, OrganizationChart)

---

## 1. Final status per key and framework (Playbook §11)

| Key               | Angular                   | Vue      | Acceptance commit | Notes                                                                                                                                                |
| ----------------- | ------------------------- | -------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| image             | open-gap                  | open-gap | `0987331`         | Open A: GAP-103, GAP-105; E1-V1 (Angular preview eye shape, A, out of scope).                                                                        |
| imagecompare      | verified-with-differences | open-gap | `0987331`         | Angular: every canonical case Match after E1-V2 C1; `responsive` D. **E1-V2 OPEN** by ruling; **E1-B1 BLOCKED**. Vue: GAP-102, GAP-104.              |
| carousel          | open-gap                  | open-gap | `51bb61b`         | GAP-106, GAP-107, GAP-108, GAP-114.                                                                                                                  |
| galleria          | open-gap                  | open-gap | `51bb61b`         | GAP-109..113, GAP-115, GAP-116.                                                                                                                      |
| orderlist         | open-gap                  | open-gap | `d93a0eb`         | GAP-117, GAP-119, GAP-120, GAP-123; Angular GAP-118.                                                                                                 |
| picklist          | open-gap                  | open-gap | `d93a0eb`         | GAP-117, GAP-119, GAP-120, GAP-123; Angular GAP-118, GAP-121, GAP-122.                                                                               |
| dataview          | open-gap                  | open-gap | `6a97c0b`         | GAP-124 (PARTIAL), GAP-125, GAP-126 (Paginator), GAP-129 (Paginator), GAP-130. Grid layout intentional (C, D-E4-1). Vue loading: no Prime reference. |
| organizationchart | D (DECISION-D)            | open-gap | `6a97c0b`         | GAP-127, GAP-128. Toggle mouse interaction not verified.                                                                                             |

No key reaches `verified`. Every canonical case in every batch was compared (no `partial` key).

## 2. Remaining differences by class

- **B (ported):** each batch's approved mapping is ported. 7 + 63 + 7 + 14 upstream groups are mapped by framework module (see the per-batch counts in each record §7). Every ported or retained selector part is reached in a named story or carries a cited K entry (E-3: 7 K entries, E3-R1; E-4: 3, D-E4-3 and E4-R1).
- **C (intentional):** DataView grid layout (D-E4-1). Its evidence is that `itemTemplate` returns a string, so callers cannot lay out items.
- **D (not applicable):** the recorded D cases in each batch (sorting, header/footer facets, templates, responsive breakpoints, controls position, colored nodes, and Angular OrganizationChart under DECISION-D).
- **No Prime reference:** Vue DataView loading (G3E-7).
- **A (gaps):** GAP-102..130, listed in §4. The structural escalations (G3E-5) are the Galleria thumbnail carousel (GAP-110) and the OrganizationChart table and connectors (GAP-127).

## 3. Coverage gaps, limitations and open items

| Item                                                     | State                                                                                                                                                                                           |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E1-B1** (ImageCompare `handle.border.style` reference) | **RESOLVED** (user ruling (a), 2026-10-11): one documented AC2 exemption for the upstream-undefined reference; ported rule unchanged. Unit suites now 1188/1188 and 1192/1192.                  |
| **E1-V2**                                                | **CLOSED** (2026-10-11): the prescribed V2 evidence (PASS, 2/2 in each engine) was accepted by the user. Scope: V2 evidence only; no claim of complete ImageCompare parity.                     |
| Vue OrderList narrow layout                              | Unverified follow-up (E-3 record). No narrow-width check exists in the plan; no GAP and no regression is claimed.                                                                               |
| OrganizationChart toggle mouse click                     | Not verified (keyboard-only collapse case). Recorded limitation (E-4 record).                                                                                                                   |
| GAP-124 residuals                                        | The spinner does not animate (no `u-icon-spin` animation exists); non-text contrast 2.31:1, the same colours as Prime.                                                                          |
| Scope exceptions                                         | One explicitly authorized template change: the DataView loading spinner (E4-V1, `dd18310`). Story-only changes: the Angular OrderList drag story (D-E3-1) and the Vue DataView stories (E4-V2). |

## 4. GAPs linked

- **Reused:** GAP-098 (no global `box-sizing`; explanatory geometry in every batch, never fixed by a global rule), GAP-102 (Vue ImageCompare root style; registered with the Spec).
- **Registered at the batch gates:**
  - E-1: GAP-103..105.
  - E-2: GAP-106..116.
  - E-3: GAP-117..123.
  - E-4: GAP-124..130.
- **Status:** all are OPEN except **GAP-124 PARTIAL**. None of the registered GAPs is authorized for remediation beyond the E4-V1 scope exception.

## 5. Size (X-10)

Branch point `cad9f85` → head `57a3ced`: **ng 327557 → 329466 bytes (+0.583 %), vue 143201 → 144597 bytes (+0.975 %)**, below the 15 % limit. Recorded in `PERFORMANCE.md`.

## 6. Final verification at the branch head (Task 18 Step 1, `--retries=0`)

| Check                                                                     | Result                                                                                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit suites                                                               | Angular 1187/1188, Vue 1191/1192: the only failure in each is **E1-B1** (not an allowed AC7 failure; see §3). Themes 962/962.                         |
| Typecheck (`pnpm typecheck`)                                              | All packages pass.                                                                                                                                    |
| `g3e-upstream-fidelity`                                                   | 8/8 (in the themes suite).                                                                                                                            |
| `validate-g3e-accessibility.test.mjs`                                     | 10/10.                                                                                                                                                |
| Harness `run.sh parity E-1..E-4 after` (Docker `docker-final`, `57a3ced`) | Exit 0 in every batch; **noise 0** on every comparison (E-1 23 tests, E-2 37, E-3 23, E-4 18) (AC4).                                                  |
| G3-E regression spec (three engines, both frameworks)                     | From the CI simulation (same tree as `57a3ced`): ng 153/153 and vue 162/162; validator ng 66/66 and vue 69/69, 0 introduced.                          |
| Full regression (9 Storybook + 3 SSR projects)                            | 2445 passed / 7 failed: only GAP-097 ×6 and U2 (AC7).                                                                                                 |
| CI simulation (`run.sh ci ng`, `ci vue`, Task 17)                         | Strict runs and every tranche validator OK; failures only GAP-097 and U2.                                                                             |
| Provenance changed-file completeness (`cad9f85..HEAD`)                    | 40/40 after adding the 6 missing entries for the E-0 Image/Carousel/Galleria story files (earlier batch checks only covered their own commit ranges). |

**AC status:** AC4 (noise 0) and AC7 (regression) are met. The Task 18 expectation "everything passes except U2 and GAP-097" is **not fully met** because of E1-B1.

## 7. CI evidence plan

Task 17 adds the G3-E steps to `.github/workflows/ci.yml` (`57a3ced`): the G3-E specs, the differential validator and the report upload, with `G3-E` excluded from the strict run. Per ADR-052 X-12, the merge commit's CI run should show the G3-E step green, with only the inherited failures (GAP-097 in the G3-D step, U2). That run happens only after merge and push, which are user decisions.

## 8. GAP-064 status proposal (user decision)

All five G3 tranches have now been executed (G3-A..G3-E). G3-E itself leaves open items: E1-B1 BLOCKED, E1-V2 OPEN, and GAP-102..130 (one PARTIAL). **Decision (2026-10-11): keep GAP-064 `PARTIAL`.** Record G3-E as executed with its open items, and decide separately whether the remaining items close GAP-064 or move to their own GAPs. The decision is the user's at the closeout gate.

## 9. Closeout gate outcome and merge readiness (2026-10-11)

- **Accepted as PARTIAL.** GAP-064 stays PARTIAL. No GAP is closed by this acceptance.
- **MIGRATION wording reviewed** against the implementation and the batch records. Corrected:
  - DataView items render as the plain text `itemTemplate` returns (not "your own markup").
  - The Galleria full-screen overlap was observed at 1280 × 720 (not only "small viewports").
  - Angular Listbox highlights still do not apply (GAP-119).
  - The Vue OrderList narrow layout and the OrganizationChart pointer click are unverified.
  - GAP-124 is partly addressed.
  - The ImageCompare initial clip is the 50 % midpoint.
- **Merge readiness: NOT READY.** The plan's verification expectation ("everything passes except U2 and GAP-097") is not met while the E1-B1 AC2 failure stands. E1-V2 also awaits its disposition. No merge or push until an authorized E1-B1 resolution passes the required tests and E1-V2 is dispositioned; then merge readiness is reassessed against the plan's criteria.

## 10. E1 rulings and merge-readiness reassessment (2026-10-11)

- **E1-B1 RESOLVED** (option (a)) and **E1-V2 CLOSED** (V2 evidence accepted); details and actual results are in the E-1 record.
- **Plan merge-readiness criterion** (Task 18 Step 1: "everything passes except the known U2 and GAP-097 failures; harness noise 0"):

  | Check                                                 | Result                                                     |
  | ----------------------------------------------------- | ---------------------------------------------------------- |
  | Unit suites (ng, vue, themes)                         | 1188/1188, 1192/1192, 962/962 (after the E1-B1 change)     |
  | Typecheck                                             | Pass                                                       |
  | Fidelity; validator unit test                         | 8/8; 10/10                                                 |
  | G3-E regression spec and validator (Docker)           | ng 153/153, vue 162/162; ng 66/66, vue 69/69, 0 introduced |
  | Harness E-1..E-4 after (Docker, `57a3ced`)            | Noise 0 everywhere                                         |
  | Full regression and CI simulation (Docker, `57a3ced`) | Only GAP-097 ×6 and U2                                     |

  The harness, full regression and CI simulation evidence from `57a3ced` stays valid: the only changes since are documentation, provenance JSON and the two unit spec files, none of which the end-to-end runs execute.

- **Assessment:** the branch now **meets the plan's merge-readiness criteria**. G3-E is executed, with the E-1 items resolved and closed; its remaining open GAPs (GAP-102..130, GAP-124 PARTIAL) and recorded limitations stay open by design. **GAP-064 stays PARTIAL.**
- **Merge and push remain separate user decisions** (plan: "closeout acceptance, merge and push are separate user decisions"). After a merge and push, ADR-052 X-12 asks for the merge commit's CI run to show the G3-E step green, with only the inherited failures.

## 11. Post-merge CI evidence (2026-10-11)

**Merge:** `d3aabf5` on `main` is a `--no-ff` merge of `60fd82d` (the G3-E branch head) into the previous `main` `cad9f85`; its tree equals the branch head. It was pushed without force, and `origin/main` equals `main`. The feature branch `feature/gap-064-g3e-media-data` is kept.

**CI run `38088748035` (workflow CI, push of `d3aabf5`), conclusion `failure`:**

- **G3-E steps green in both frameworks:** `Run G3-E verification specs`, `G3-E differential accessibility validation` and `Upload G3-E accessibility reports` succeed in `track-a-browser-visual-a11y (ng)` and `(vue)` (ADR-052 X-12).
- **The same 12 failing steps as the previous `main` CI run `37769369281` (`cad9f85`):** none were added and none were fixed by this merge. They are:
  - `ci`: Test, Lint, Format check, Coverage regression check, Provenance validation, Provenance scripts self-tests, SAST baseline validation.
  - `track-a-browser-visual-a11y (ng)`: Run G3-D verification specs.
  - `track-a-browser-visual-a11y (vue)`: Run G3-B verification specs, Run G3-D verification specs.
  - `track-e-ssr-hydration (react)` and `(vue)`: Run Playwright SSR project.
- **G3-D Drawer failures = GAP-097.** In this run they are `Ng/Drawer full and RTL G3-D layout` (Chromium, Firefox, WebKit) and `Vue/Drawer full and RTL G3-D layout` (Chromium, Firefox, WebKit).
- **G3-B Vue WebKit Card failure = U2.** In this run it is `Vue/Card WithHeaderAndFooter G3-B visual` (vue-webkit).
- For these two groups, the comparison with the previous run is **by failing step**: the previous run's test names were not retrievable from its logs.
- **React exports test:** `packages/react` `test/exports.test.ts` still reports **6 failed / 850 passed**, matching the previous run. G3-E does not change React.
- **Long-standing red `ci` steps** (lint, format, coverage, provenance, SAST and the React test) stay registered as **GAP-087 through GAP-095**. They did not pass in this run.
- **SSR hydration:** React and Vue fail as before; Angular passes.

**Release workflow run `38088748055`: failure.** `pnpm install --frozen-lockfile` stops with `ERR_PNPM_UNSUPPORTED_ENGINE`: the job uses Node v20.20.2, while `@angular-devkit/architect` requires `^22.22.3 || ^24.15.0 || >=26.0.0`. This is an existing environment/toolchain issue (the Release runs on `cad9f85`, `4c099a9`, `c567039`, `b290919` and `0c010ca` fail the same way), not a G3-E regression.

**Status after merge:**

- **GAP-064 stays PARTIAL.** G3-E is executed and merged, not complete.
- **Still open:** GAP-102 through GAP-130 (GAP-124 PARTIAL) and the reused GAP-098.
- **Known limitations, unchanged:**
  - GAP-124: the spinner does not animate and has a 2.31:1 non-text contrast on the mask.
  - The Vue OrderList narrow layout is unverified.
  - The OrganizationChart toggle's mouse activation is unverified.
