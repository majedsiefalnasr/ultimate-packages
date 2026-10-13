# G3-E E-1 — E1-V2 P3 execution packet

> **For agentic workers:** Documentation only until human P3 approval, exact artifact review and separate explicit implementation/verification authorization. Use executing-plans only after those gates. No command or recipe here grants execution authority.

**Status:** P2 **APPROVED** by explicit human ruling; P3 **READY FOR HUMAN APPROVAL** as an execution design. Implementation and verification **UNAUTHORIZED**. The temporary artifacts below are specified, not created or executed.

**Goal:** Execute the exact approved C1 production delta once, then collect one bounded verification campaign for human review.

**Authority:** [approved remediation Plan](2026-10-08-gap-064-g3e-e1-v2-remediation.md) remains binding, including §§6–11; [approved Spec](../specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md); the human's explicit approval of the [P2 production proposal](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-p2-production-proposal.md). This packet adds execution details, not another candidate, scope or verification budget. The [C1 experiment](../../architecture/research/2026-10-08-gap-064-g3e-e1-v2-c1-experiment-result.md) remains evidence only; its budget is exhausted.

## 1. Gates, budget and writable surfaces

P1 C1 and the exact P2 production delta are approved. P3 approval is pending. No source-only artifact recipe below may be executed under this preparation authorization. After P3 approval, obtain explicit authorization for implementation, materialization of the specified disposable artifacts, and the campaign; retain the resulting artifact texts/diffs/hashes for review before any check starts. Any discrepancy from this packet requires a ruling, not improvisation.

Exactly one C1 implementation and one V1–V8 campaign; one worker, retries 0, no repeat, timeout increase, snapshot update, alternate candidate, diagnostic retry or second fix. Preparation commands are not extra verification campaigns. Any invoked failing check stops all later checks. Report-mode material mismatches, unreliable required evidence and unresolved visible differences also stop. Known E1-B1 failures remain historical, unchanged and not rerun by this campaign.

Only these four permanent files may change, exactly as specified in P2:

1. `packages/themes/test/utils/g3e-port.mjs`: `RETAINED.ng.imagecompare[0]` only.
2. `packages/ng/src/image-compare/image-compare-style.ts`: generated CSS body only.
3. `docs/architecture/provenance/ng.json`: P2's exact single appended style entry.
4. `docs/architecture/PROVENANCE.md`: P2's exact sentence in the `@primeuix/styles` modification-status paragraph.

No template/runtime/API, tests/assertions, stories, fixtures, baselines, theme/token, Vue/React, shared aliases, generator functions/policy, other mapping or existing historical evidence may change. All existing dirty work is preserved.

## 2. Exact future implementation sequence

- [ ] Confirm explicit P3 and execution authorizations; record current branch, HEAD and full dirty status. Stop if missing or different from the approved input state without a ruling.
- [ ] Save exact starting bytes and SHA-256 for every tracked/nonignored untracked repository file, including the four allowed files, all Vue outputs, protected E1-B1 preset/assertions and relevant stories/harness inputs. Save the four originals separately. These starting contents, not HEAD, define the permitted delta and rollback base.
- [ ] Replace the single Angular retained-rule string with P2's approved string. Assert that the old string occurs once in the Angular entry; do not replace the identical Vue string.
- [ ] Invoke the generator **once**, from repository root, saving stdout to evidence:

```sh
node packages/themes/test/utils/g3e-port.mjs ng imagecompare > /io/generated-imagecompare.css
```

- [ ] Transfer that stdout into only the existing CSS template body of the Angular style module. Assert exactly one `/*css*/` template, no interpolation, and preserve all other module bytes. Do not recreate declarations by hand.
- [ ] Append the exact P2 JSON object and aggregate sentence, preserving existing entries/text. No global provenance regeneration.
- [ ] Inspect the diff against the saved starting bytes. Expected: one Angular generator string, one generated D5 rule, one manifest entry and one sentence. Any additional delta stops before checks. Save the approved hunk diff and resulting input hashes.

Expected sole generated rule delta:

```diff
-.u-image-compare > span{position: absolute;inset: 0;}
+.u-image-compare > span{position: absolute;inset: 0;top: auto;bottom: auto;height: 100%;}
```

The exact data/provenance strings are in P2 §§2–3 and must be copied unchanged. No production inline style is introduced.

## 3. Disposable environment and artifact locations

Proposed evidence mount: `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/` → `/io`; refuse to reuse a nonempty destination. Retain original/post-change archives and hash manifests. Build the verification input from the saved current dirty worktree plus only the approved four-file delta; do not use HEAD or the old experiment archive as the post-change product.

Use Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, recorded image ID `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`, Linux arm64, Node v24.20.0, Playwright 1.63.0 and pinned Chromium 153.0.8010.12. Record Firefox/WebKit versions from this same image when used. Keep PrimeNG 21.1.9 / PrimeUIX 2.0.3, frozen lockfile, fixture bytes and fixture-scoped typography. V1 viewport is 1280×720/DPR1. V2–V4 retain existing Angular project device settings, not a new parity viewport matrix.

Future container launch, after authorization, uses one named disposable container with `--rm --platform linux/arm64`, only the evidence directory mounted read/write, and the pinned image. Extract the archived product into `/work`; do not mount the repository as the execution tree. No new network font/resource or host browser profile. Pin pnpm 9.6.0 and install with `pnpm install --frozen-lockfile`. Stop on package/runtime/image identity mismatch.

Exact launch form from the repository root (the destination must first pass the fresh-directory check):

```sh
docker run --name ultimate-e1-v2-remediation --rm --platform linux/arm64 -it -v "$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash
```

The named container is used for all campaign members and disposed on exit. A lost container/session does not authorize a replacement campaign. Record the actual image ID before preparation; a different ID stops.

Prepare dependency build artifacts once, in this explicit order: `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles`, `@ultimate/uix-motion`, `@ultimate/uix-data`, `@ultimate/themes`, `@ultimate/ng-core`. Each invocation is `pnpm --filter <exact-package> run build`; no recursive/root build or React/Vue build. Angular's own build/type checks are V7, not repeated preparation. Stop on any preparation failure; no CI repair.

Temporary files are allowed only inside the disposable `/work` and `/io`, never as permanent repository changes:

| Artifact                                                     | Exact content/derivation contract                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `/work/tooling/prime-reference/playwright.e1v2.config.ts`    | V1 derived configuration in §4, colocated with its base so relative paths remain correct |
| `/work/playwright.e1v2.config.ts`                            | V2–V4 derived configuration in §4, colocated with root base                              |
| `/work/tooling/prime-reference/e2e/e1v2-measure.ts`          | Exact extracted read-only `measure` function described in §5                             |
| Disposable copy of `tooling/prime-reference/e2e/g3e.spec.ts` | Only §5 integration edits; save exact diff before use                                    |
| `/work/e1v2-scoped-a11y.mjs`                                 | Exact scoped copy transformation in §7; imports remain existing validator functions      |
| `/work/e1v2-fidelity.mjs`                                    | Exact read-only content in §7                                                            |
| `/io/selections/`, `/io/checks/`, `/io/internal/`            | Fresh selection manifests, command outputs and measurements; no historic-envelope import |

Before execution, retain the materialized temporary artifact text, source hashes, exact diffs, command log and environment manifest. These recipes do not permit modifying a permanent validator or altering policy. A recipe that cannot be materialized exactly stops for review; no browser may be used to troubleshoot it.

## 4. Exact temporary configurations

V1 configuration content:

```ts
import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  workers: 1,
  retries: 0,
  maxFailures: 1,
  updateSnapshots: "none",
  outputDir: "/io/playwright/v1",
  webServer: (base.webServer as Array<{ name?: string }>).filter(
    (s) => s.name === "prime-reference-ng" || s.name === "ng-storybook"
  ),
});
```

V2–V4 configuration content:

```ts
import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  workers: 1,
  retries: 0,
  maxFailures: 1,
  updateSnapshots: "none",
  outputDir: "/io/playwright/ng",
  projects: base.projects!.filter((p) =>
    ["ng-chromium", "ng-firefox", "ng-webkit"].includes(p.name!)
  ),
  webServer: (base.webServer as Array<{ name?: string }>).filter((s) => s.name === "ng-storybook"),
});
```

Assert server names are exactly `[prime-reference-ng, ng-storybook]` for V1 and `[ng-storybook]` for V2–V4, and selected project names are exact. All inherited expect thresholds, snapshot path templates, use/device settings, readiness and timeouts remain unchanged. No React/Vue/SSR server starts. Selecting an Angular project alone is not isolation. Permanent configs remain unchanged. Each command's JSON reporter output goes to a unique `/io/checks/` filename; preserve screenshots and raw expected/actual/diff outputs before the next invocation can reuse an output directory.

## 5. V1 measurement integration — no extra observation

Immutable source for the measurement function: experiment evidence `e1-v2-c1-experiment/diagnostic.spec.ts`, SHA-256 `fc6a909fd1f01bd8b75ea5f097d174c730c9453e498eeacd5db62834a3d2c420`. Extract the text starting at `async function measure(` and ending immediately before `const cases =`; change only that initial `async function` to `export async function`. Prefix `import type { Side } from "./probe";`. No experiment test body, mutation, clipping helper or override is imported. This preserves the corrected non-Element guard, measurements, source identity and read-only behavior.

In the disposable `g3e.spec.ts` copy:

1. Add `import { measure } from "./e1v2-measure";` and a module-level `const internalSeen = new Set<string>();`.
2. Immediately after its existing `await imagesLoaded(page, all[c.parts[0]]);`, add:

```ts
if (t.fw === "ng" && c.id === "imagecompare/root-style" && !internalSeen.has(t.side)) {
  const internal = await measure(page, all, t.side, true);
  mkdirSync("/io/internal", { recursive: true });
  writeFileSync(`/io/internal/${t.side}.json`, JSON.stringify(internal, null, 2));
  internalSeen.add(t.side);
}
```

3. Immediately after the existing first `prime` and `ult` observations, retain their existing capture buffers, without another screenshot call:

```ts
mkdirSync("/io/captures", { recursive: true });
const captureStem = `${c.id.replaceAll("/", "--")}.${fw}`;
writeFileSync(`/io/captures/${captureStem}.prime.png`, prime.png);
writeFileSync(`/io/captures/${captureStem}.ultimate.png`, ult.png);
```

4. After the existing `rows.push(...)` in each selected comparison test, add:

```ts
expect(all, "material probe/fact mismatch — STOP").toEqual([]);
expect(noise, "unstable existing observations — STOP").toEqual({
  probe: 0,
  primePixels: 0,
  ultimatePixels: 0,
});
if (review.differing > 0) {
  throw new Error("Saved-image difference remains pending human review — STOP campaign");
}
```

The final branch conservatively stops for unresolved saved-image review rather than declaring Match or continuing. It is a STOP for incomplete review, not a replacement numeric pixel-diff acceptance threshold or an automatic classification; the approved screenshot and Playbook acceptance rules remain unchanged. A reviewed nonzero pixel count can be valid under the Playbook, but this packet grants no automatic continuation or second run after that stop.

Keep the original parity observations and prescribed noise observations unchanged. Instrument only the first root-style observation per side; do not reload to measure, mutate styles or add a before-pass. Save the existing composite reports/images and original side captures from the existing observations in `/io`; no new capture page. After V1, inspect those images and the two internal JSONs before starting V2. Required internal outcome: root/first/slider geometry correct; second image matches Prime; root→span and span→image explain matching pixels; span/image dimensions and clip geometry valid. Missing/ambiguous evidence stops. Preserve the native-thumb limitation. Root-only probes alone cannot establish AC1/AC3.

## 6. Exact selections, commands and campaign order

Use repository-root working directory `/work`. `G3E_BATCH=E-1` is required for V1. Patterns are full-title suffix matches, not leaf-start anchors:

| Run | File                                      | Project(s)                                       | Literal grep                                                                                   | Expected selection                |
| --- | ----------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------- |
| V1  | `tooling/prime-reference/e2e/g3e.spec.ts` | `prime-parity-chromium`                          | `\bimagecompare/(root-style\|default\|slide\|focus\|rtl) \[ng\] PrimeNG 21\.1\.9 vs Ultimate$` | Five distinct named cases         |
| V2  | `packages/ng/e2e/g3e-aura-styles.spec.ts` | Each of `ng-chromium`, `ng-firefox`, `ng-webkit` | `\bNg/ImageCompare (Sized\|Rtl) rest G3-E E-1 visual$`                                         | Two per engine                    |
| V3  | Same Angular file                         | Each of those three projects                     | `\bNg/ImageCompare (Sized\|Rtl) G3-E E-1 accessibility$`                                       | Two per engine, six total         |
| V4  | Same Angular file                         | `ng-chromium`                                    | `\bNg/imagecompare selector reach G3-E reach$`                                                 | One test, existing two-story body |

The table escapes `|` for Markdown only. Exact representative commands (repeat V2/V3 once for each named engine, without changing the regex):

```sh
G3E_BATCH=E-1 pnpm exec playwright test -c tooling/prime-reference/playwright.e1v2.config.ts tooling/prime-reference/e2e/g3e.spec.ts --project=prime-parity-chromium --grep '\bimagecompare/(root-style|default|slide|focus|rtl) \[ng\] PrimeNG 21\.1\.9 vs Ultimate$' --workers=1 --retries=0 --max-failures=1 --reporter=list,json
pnpm exec playwright test -c playwright.e1v2.config.ts packages/ng/e2e/g3e-aura-styles.spec.ts --project=ng-chromium --grep '\bNg/ImageCompare (Sized|Rtl) rest G3-E E-1 visual$' --workers=1 --retries=0 --max-failures=1 --reporter=list,json
pnpm exec playwright test -c playwright.e1v2.config.ts packages/ng/e2e/g3e-aura-styles.spec.ts --project=ng-chromium --grep '\bNg/ImageCompare (Sized|Rtl) G3-E E-1 accessibility$' --workers=1 --retries=0 --max-failures=1 --reporter=list,json
pnpm exec playwright test -c playwright.e1v2.config.ts packages/ng/e2e/g3e-aura-styles.spec.ts --project=ng-chromium --grep '\bNg/imagecompare selector reach G3-E reach$' --workers=1 --retries=0 --max-failures=1 --reporter=list,json
```

For each invocation set `PLAYWRIGHT_JSON_OUTPUT_NAME` to its unique absolute path: `/io/checks/v1.json`, `/io/checks/v2-ng-chromium.json`, `/io/checks/v2-ng-firefox.json`, `/io/checks/v2-ng-webkit.json`, corresponding `v3-<project>.json`, and `/io/checks/v4.json`. Preserve stdout/stderr and exit status separately. Discovery uses corresponding `/io/selections/<run>.json` files. A missing reporter file or nonzero command exit stops; do not pipe through a command that hides the exit status.

Before any test bodies, perform discovery-only selection validation for all eight file/project/grep combinations above: use the same command with `--list --reporter=json` instead of the run reporter, preserving other selectors and V1 batch. This is not a browser pass. Retain JSON manifests. Inspect every listed spec's title/file and test project identity: require exact leaf-title sets derived from the table, exact file and project, no duplicates, and exact counts. Zero/unexpected count, identity, file or project is setup failure → STOP before any browser test. Listing must not be represented as verification or passing tests.

Future campaign order after preparation: **V6 → V7 → V5 → V1 → V2 Chromium/Firefox/WebKit → V3 Chromium/Firefox/WebKit plus one validation → V4 → V8**. Stop before the next member on any failure; do not invoke members twice. V7 runs Angular build once early to provide artifacts; it is not repeated at the end.

V5, once:

```sh
pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/image-compare/image-compare.spec.ts --watch=false
```

V7, once each:

```sh
pnpm --filter @ultimate/ng run build
pnpm --filter @ultimate/ng run typecheck
```

Do not invoke root scripts, theme pretest, full fidelity/a11y validators or unrelated suites. Existing baseline mismatch is a failing assertion even if historically explained. `updateSnapshots: "none"` prevents missing snapshots from being created; no `-u` or acceptance is allowed. If V2 fails, remaining engines/checks are not run and no baseline waiver follows.

## 7. Exact read-only scoped checks

### V3 differential validator

Inside the container, copy `scripts/provenance/validate-g3e-accessibility.mjs` to `/work/e1v2-scoped-a11y.mjs`. Perform only these exact transformations, requiring each source match once:

1. Change its import path `"./validate-accessibility-baseline.mjs"` to `"./scripts/provenance/validate-accessibility-baseline.mjs"`.
2. Change `const EXPECTED_STORY_COUNT = { ng: 4, vue: 4 };` to `const EXPECTED_STORY_COUNT = { ng: 2 };` in this disposable copy only.
3. Immediately before `if (ids.length !== EXPECTED_STORY_COUNT[fw])`, insert:

```js
const permitted = new Set(["ng-imagecompare--sized", "ng-imagecompare--rtl"]);
for (let i = ids.length - 1; i >= 0; i--) if (!permitted.has(ids[i])) ids.splice(i, 1);
if (ids.length !== 2 || [...permitted].some((id) => !ids.includes(id)))
  fail("ImageCompare story identity mismatch");
```

No other logic changes. Retain both original baseline/preexisting fingerprint sets, missing-report failure, component-story identity checks and `computeFingerprint`/`parseBaselineFingerprints`. Fresh input must contain no imported historical a11y results. Require each new envelope's `framework`/`browser` to match its file path and scan time to fall in this campaign; malformed or stale reports stop. Require all six before invoking once:

```sh
node /work/e1v2-scoped-a11y.mjs ng
```

This is a scoped temporary validation artifact, not a new permanent two-story validator or changed expected count in the repository. Report the stock full-suite validator as not run.

### V6 generated-style fidelity

Exact disposable file `/work/e1v2-fidelity.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  actualCssText,
  expectedCss,
  parseGroups,
  norm,
  COUNTS,
} from "./packages/themes/test/utils/g3e-port.mjs";
const groups = (text) => parseGroups(text).map((g) => norm(`${g.head}{${g.body}}`));
const before = readFileSync("/io/start-imagecompare-css.txt", "utf8");
const actual = groups(actualCssText("ng", "imagecompare"));
const initial = groups(before);
assert.deepEqual(COUNTS.imagecompare, [12, 12]);
assert.equal(initial.length, 13);
assert.equal(actual.length, 13);
assert.deepEqual(actual, expectedCss("ng", "imagecompare"));
assert.deepEqual(actual.slice(0, 12), initial.slice(0, 12));
assert.equal(
  actual[12],
  norm(
    ".u-image-compare > span { position: absolute; inset: 0; top: auto; bottom: auto; height: 100%; }"
  )
);
assert.ok(
  actual.some(
    (r) => r.includes("::-moz-range-thumb{") && r.includes("dt('imagecompare.handle.border.style')")
  )
);
console.log("Angular ImageCompare generated/shipped fidelity and protected D1 groups preserved");
```

`/io/start-imagecompare-css.txt` is the exact CSS body saved before the one implementation, not a new fixture. Run once with `node /work/e1v2-fidelity.mjs`; no test expectations or original fixtures are edited. Preserve other protected hashes in V8. This scopes only equality/fidelity; it does not claim E1-B1's missing-token assertions passed.

### V8 provenance/integrity

Perform one read-only final comparison with the starting file manifest and copies from §2. Require exactly the four approved file differences and no additional source/test/story/config/baseline changes. Verify bytes outside the Angular CSS body are identical; groups 1–12 and all Vue files match starting contents; generator source differs solely at the approved Angular string. Parse the manifest: original entries must be identical and the sole appended object must equal P2's exact object. Aggregate provenance must equal the starting text plus P2's single sentence at the approved paragraph. Preserve all E1-B1 preset/assertion hashes. Verify retained source references/evidence paths exist and generated/shipped equality result is present. Save the manifest comparison and hunk accounting; no global provenance validator or formatter is substituted. Any unaccounted delta stops.

## 8. Acceptance and retained evidence

The Spec's AC1–AC9 remain unchanged; no new ratio/tolerance gate:

| AC  | Required evidence                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------- |
| AC1 | V1 actual stylesheet: second/right image agrees with Prime within ±1 px, no visible displacement     |
| AC2 | V1 root/first/slider preserved, nominal canonical y19/y16/y18                                        |
| AC3 | V1 internal image/span dimensions, relative placement, clipping and pixels                           |
| AC4 | V1 five-case actions and V2 existing regression cases preserve sizing/slide/focus/RTL                |
| AC5 | Existing Playbook geometry/probes and saved-image review; pixel ratio advisory                       |
| AC6 | Unchanged V2 screenshot assertions; every mismatch accounted for and stops; no baseline accepted     |
| AC7 | V3 six fresh envelopes, unchanged differential identity/strength; V4 existing reach collector passes |
| AC8 | V6 generated equality plus V8 exact four-file/provenance/DOM/runtime/API integrity                   |
| AC9 | V5/V7 applicable checks, preserved E1-B1 failures separately reported; no overall-green claim        |

Retain human approvals, source/archive/environment hashes, dirty-state originals, exact implementation diff/generated stdout, temporary artifact contents/diffs/hashes, selection manifests, every invocation/status, raw internal JSON, parity reports/captures/noise, regression expected/actual/diffs, six a11y envelopes, reach output, unit/fidelity/build/type/provenance outputs, failures/unrun members and cleanup results. Never overwrite prior evidence or describe an unrun broad suite as passing.

## 9. Cleanup, rollback, STOP and final human gate

No experiment inline styles exist in this campaign. Remove only disposable instrumentation/configuration copies with container disposal after retaining evidence. Do not remove production changes automatically or use cleanup to obtain another run. Confirm the source worktree contains only the approved four-file delta over its saved starting state; generated build artifacts in the container are not repository changes.

On failure: capture available evidence, mark remaining members not run, stop and request a ruling. No fix/rerun, alternate candidate, timeout change or diagnostic-hook correction. DOM/template/runtime/API, shared/global/token/theme/preset, generator-policy, another framework/component, new architectural convention, new diagnostics outside this campaign or E1-B1 impact also require STOP. Do not weaken assertions or repair unrelated debt.

Rollback requires separate explicit human authorization. Reverse only these approved four-file hunks against saved starting contents. Preserve unrelated dirty work, historical evidence, GAPs, stories/baselines and E1-B1. No HEAD-based whole-file restore, reset/clean or overwrite of intervening edits. Overlap with human changes stops for a ruling. Rollback creates no verification budget.

**HARD FINAL HUMAN STOP:** present AC1–AC9 evidence and all limits. No automatic E1-V2 closure/reclassification, baseline acceptance, parity/status promotion, Task 6 completion, commit, merge or push. Successful verification supplies evidence for that decision; it does not make it.

## 10. Current gate state

- P2: **APPROVED** for the exact P2 production delta/representation only.
- P3: **READY FOR HUMAN APPROVAL**; temporary artifacts described here have not been created or run and require exact materialization/review before campaign execution.
- Implementation: **unauthorized**. Verification: **unauthorized**.
- E1-V2: **B / OPEN**, including after successful evidence until explicit human disposition.
- Task 6: **STOPPED / not complete**. E1-B1/B2/V1 and GAP-102/103/104/105 unchanged.

Only this P3 document is created now. No production/generator/provenance/test/configuration change, generator/browser/test/build/verification execution, baseline change or Spec/Plan rewrite is performed. The existing approved remediation Plan is supplemented, not replaced. Stop awaiting human review and authorization.
