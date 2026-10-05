# CI Visual Rendering Environment — Design (Proposed)

**Status:** APPROVED (2026-10-05) with option (a), the native arm64 runner. The amd64 emulation experiment (§5 b) is **not** run. It is implemented in `ae71bc5` (`.github/workflows/ci.yml`, `track-a-browser-visual-a11y` only). **The §7 verification gate PASSED** in run `37289718639`, accepted 2026-10-05; see §10. The baselines and the validators are unchanged.
**Date:** 2026-10-05.
**Scope owner:** CI / visual-baseline infrastructure. This is **not** part of GAP-064 G3-A. The G3-A work only exposed it.

---

## 1. Observed mismatch (evidence)

| Fact | Evidence |
| ---- | -------- |
| The repository's screenshot baselines are rendered in `mcr.microsoft.com/playwright:v1.63.0-jammy` on **native arm64** Docker. | `fb74a8b` ("Regenerated all 240 baselines under real Linux (Docker, native arm64, mcr.microsoft.com/playwright:v1.63.0-jammy matching the pinned @playwright/test version)"); later baseline work used the same image and architecture (GAP-064 Tranche 1 `8f402ef`, G3-A `9b92407` and `d5a9513`). |
| CI's `track-a-browser-visual-a11y` renders on the GitHub-hosted runner `ubuntu-24.04` (image 20260927.320.1, **x86_64**). The browsers come from `npx playwright install --with-deps`, so the OS libraries and fonts are the runner's own. | `.github/workflows/ci.yml` (`runs-on: ubuntu-latest`); runner header of run `37286219584`. |
| Screenshot failures predate any GAP-064 work. | `main` at `f05bd9b`, run `37191180514`: track-a ng 73, vue 56 and react 48 failures, all `toHaveScreenshot`, no other error type. The first CI run `37188652979` on 2026-10-04 showed the same pattern. |
| React fails although it has no G3-A change. | Draft PR #1 run `37286219584`: react 47 failed, all screenshots. |
| The same specs pass in the baseline environment. | Local Docker regression runs (arm64, the pinned image): 834–835 passed across the 9 Storybook and 3 SSR projects (G3-A Task 8 review record). |
| Consequence: the strict accessibility step never runs in CI. It is gated on the Playwright step, which always fails for the reason above. | `Accessibility baseline validation` was **skipped** in run `37286219584` and on `main`. |

**Root cause (established):** baselines and CI render in different environments. The environments differ in **at least** the OS image (jammy image vs `ubuntu-24.04` with the runner's own deps) and the **CPU architecture** (arm64 vs x86_64). Which of the two accounts for each pixel difference has not been isolated; see §5.

## 2. Target (decision requested)

The Playwright tests of `track-a-browser-visual-a11y` run **inside the pinned Playwright image `mcr.microsoft.com/playwright:v1.63.0-jammy`**, the same environment the baselines were rendered in. Baselines are **not** regenerated on `ubuntu-24.04`.

## 3. Invariant

> Screenshot baselines and CI visual execution use the same rendering environment: the same Playwright image (tag pinned to `@playwright/test`) **and** the same CPU architecture.

The architecture is part of the invariant because the established baselines are arm64 renders (`fb74a8b`). The same image on x86_64 is a different rendering environment until shown otherwise.

## 4. Proposed change (for review; not applied)

Only the `track-a-browser-visual-a11y` job changes:

```yaml
  track-a-browser-visual-a11y:
    runs-on: ubuntu-24.04-arm        # GitHub-hosted arm64 runner (available for public repos)
    container:
      image: mcr.microsoft.com/playwright:v1.63.0-jammy
      options: --user 1001           # Playwright's documented container setup (Firefox HOME)
    # strategy/matrix and every existing step unchanged, except:
    #   - remove "Install Playwright browsers": the image already ships the
    #     browsers of exactly Playwright 1.63.0
```

- The checkout, pnpm/Node setup, install, build, the strict run (with `--grep-invert "G3-A"`), strict `--check`, the G3-A steps and the uploads stay exactly as they are.
- **Architecture choice:** `ubuntu-24.04-arm` matches the baseline architecture exactly. If an arm64 runner is not acceptable, the alternative is `ubuntu-latest` (x86_64) with the same container, but that requires the §5 evidence first.

## 5. Open question to resolve before implementation: does architecture matter?

It is unproven whether the jammy image renders identically on amd64 and arm64. Two ways to settle it:

- **(a) Recommended:** sidestep the question by using the arm64 runner (§4). The invariant then holds by construction.
- **(b)** A read-only experiment: run the existing suite locally in `--platform linux/amd64` (emulated) against the committed baselines. If it passes, an x86_64 runner with the container is equivalent. If it fails, (a) is required. Cost: one slow emulated run. Emulation fidelity is itself a caveat.

## 6. Scope

**In scope:** only the execution environment of `track-a-browser-visual-a11y` (runner label, `container:`, and dropping the browser-install step that becomes redundant).

**Out of scope:**
- baseline regeneration on any environment;
- screenshot threshold changes;
- CI-specific visual exceptions or masks;
- validator changes (`validate-accessibility-baseline.mjs`, `validate-g3a-accessibility.mjs`);
- G3-A source or story changes;
- Toast (U2);
- any other job, including the known, separately tracked `track-e-ssr-hydration`, `ci` and SAST issues from run `37188652979`;
- pushing to `main`.

## 7. Acceptance criteria

1. On the draft PR, the existing visual suite no longer fails because of environment differences: the strict Playwright run (`--grep-invert "G3-A"`) passes for ng, vue and react, apart from retry-passing flakes, each recorded.
2. React, Angular and Vue visual tests run in the same image and architecture as the baselines.
3. The A1 contracts actually execute:
   - the strict `validate-accessibility-baseline.mjs --check` **runs** (not skipped) and passes for ng, vue and react;
   - `validate-g3a-accessibility.mjs` runs and passes (ng 93/93, vue 102/102, 0 introduced).
4. The G3-A run fails **only** on the 6 held `Toast AllSeverities` screenshots (ng and vue × chromium, firefox, webkit).
5. Artifacts are still uploaded (`accessibility-reports-*`, `playwright-report-*`, `g3a-accessibility-reports-*`).

If a criterion is not met, stop and report it. No threshold, baseline or validator change is made to make it pass.

## 8. Risks

- **Container job mechanics:** the `actions/*` steps run inside the container. `pnpm/action-setup` and `actions/setup-node` are expected to work there, but the first PR run must confirm it.
- **Runner availability/cost:** GitHub's arm64 Linux runners are free for public repositories. The repository is public, but the plan for a private future must be checked.
- **Duration:** pulling the image adds some minutes per matrix leg. The browser install step it replaces also takes minutes.

## 9. Relationship to GAP-064 / A1

A1 stays **not fully CI-verified** until §7 criteria 3–5 are observed in a real run. Once this proposal is approved and implemented, that same run is the evidence that closes A1's CI verification.

## 10. Verification outcome (accepted 2026-10-05)

Real CI run `37289718639` on commit `ae71bc5` (draft PR #1). All §7 criteria are met:

| § 7 criterion | Result |
| ------------- | ------ |
| 1. Existing visual suite passes | Strict Playwright run (`--grep-invert "G3-A"`): Angular 309, Vue 282, React 216 passed; 0 failed, 0 flaky. |
| 2. Same image and architecture as the baselines | All three jobs ran on `ubuntu-24.04-arm` (runner image `ubuntu24-arm64/20260927.135`), inside `mcr.microsoft.com/playwright:v1.63.0-jammy` (pulled digest `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`). |
| 3. Strict accessibility check runs and passes | **Ran**: Angular OK (261 nodes), Vue OK (219), React OK (198), 0 new violations. |
| 4. G3-A differential check | Angular 93/93, Vue 102/102 reports, 0 introduced, 0 stale. React correctly skips the G3-A steps. |
| 5. G3-A visual failures | Exactly the 6 held `Toast AllSeverities` screenshots (Angular and Vue × chromium, firefox, webkit). Angular 183 passed, Vue 201 passed. |
| 6. Artifacts | `accessibility-reports-*` (Angular 93, Vue 75, React 72 files), `playwright-report-*` (all three) and `g3a-accessibility-reports-*` (Angular 94, Vue 103, including the validation output) all uploaded. |

- No baseline, threshold, validator, G3-A source or story, or Toast workaround was introduced. Commit `ae71bc5` changes only the job's runner, its container and the removed browser-install step, plus this spec.
- **Outside this change's scope:**
  - The `ci` job and the React/Vue `track-e-ssr-hydration` jobs still fail. These are the known, separately tracked issues from run `37188652979`.
  - The `pnpm install` step prints a non-blocking optional native-build warning (`msgpackr-extract`), which does not affect this outcome.

