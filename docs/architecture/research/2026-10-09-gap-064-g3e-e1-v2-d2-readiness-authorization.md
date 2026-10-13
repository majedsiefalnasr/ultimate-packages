# G3-E E1-V2 — D2 readiness diagnostic authorization packet

**Date:** 2026-10-09  
**Status:** Design prepared for human review; D2 execution unauthorized. Proposed disposable configuration and decoding instrumentation require explicit approval.

## 1. Scope, authority and evidence

The human authorized preparation of this packet only. The proposed diagnostic is **one PrimeNG Angular `imagecompare/default` observation**, one worker, retries **0**, with no reload, second page, second pass or campaign member. It is not V1 verification. Ultimate, `root-style`, other cases/frameworks and all V1–V8 invocations are excluded.

Authorities and inspected source/evidence:

- [Accepted D1 investigation](2026-10-09-gap-064-g3e-e1-v2-v1-readiness-d1-investigation.md): original five-second image-readiness timeout and omitted fixture link; runtime cause unproven.
- [Approved fixture preparation packet](2026-10-09-gap-064-g3e-e1-v2-fixture-preparation-correction-packet.md) and its retained `fixture-link-preparation/{result.md,archive-delta.json,fixture-integrity.json,symlink-integrity.json,cleanup.json}`: single added symlink and unchanged payloads, verified without runtime execution.
- [P3 packet](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-p3-execution.md), retained `campaign-continuation/commands.log`, `artifacts/g3e.spec.ts`, and existing `tooling/prime-reference/playwright.config.ts`: original invocation, observation order, server/project settings and environment.
- `tooling/prime-reference/{cases-g3e.ts,e2e/probe.ts,e2e/actions.ts,ng/package.json}`: exact case, source selectors, unchanged loader/readiness functions and reference server command.

**E** denotes `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/`. Inputs are retained local evidence, not guaranteed clean-checkout contents.

Use exclusively:

```text
E/fixture-link-preparation/production-input-with-ng-fixtures.tar
SHA-256 b61a8ef908dd41eb9b00ab10b9efb8c90507ebb40a29d4d9292b60036f9c750a
```

Preserve both original archives, the successful experiment archive and all historical failure records. The corrected archive establishes input topology, not actual HTTP/decoding success or the original failure's runtime cause.

## 2. Exact case and question

`cases-g3e.ts` maps test ID **`imagecompare/default`** to reference **`imagecompare/sized`**, with open `none`, no actions/state/clock. Navigate once to:

```text
http://localhost:6022/#/g3e/imagecompare/sized
```

Expected root: `.p-imagecompare`; relevant images: `.p-imagecompare > img:first-of-type` and `.p-imagecompare img + img`. Require exactly one root and two images with source identities `/media/landscape-1.png` and `/media/landscape-2.png`. Record actual identities; unexpected identity/count is STOP, not permission to broaden selectors. The second image is `landscape-2.png`; do not relabel it based on visible color.

Question: **Does this corrected input serve the intended images, and what actual loading/readiness/available decoding outcomes occur under the unchanged fixture environment?** No missing-link causal conclusion is presumed, and no comparison geometry or C1 acceptance is attempted.

## 3. Frozen environment and input gates

| Dimension              | Required value                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Docker                 | `mcr.microsoft.com/playwright:v1.63.0-jammy`                                           |
| Image ID               | `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`              |
| OS/platform            | Linux arm64                                                                            |
| Node / pnpm            | v24.20.0 / 9.6.0                                                                       |
| Playwright / Chromium  | 1.63.0 / 153.0.8010.12                                                                 |
| Reference dependencies | PrimeNG 21.1.9; Aura/PrimeUIX 2.0.3; existing frozen lockfile                          |
| Viewport / DPR         | 1280×720 / 1                                                                           |
| Typography             | Accepted fixture-scoped default typography; no Inter/font integration or new resources |

Before any page creation, require matching image/package/runtime identities, using Playwright's actual `chromium.executablePath()` for the executable version; no browser identity-observation page. Check the archive SHA, all original member/payload hashes, preparation topology records, lockfile and four-file/protected-content hashes against retained evidence. Extract the corrected archive once into fresh `/work`, preserving its symlink. Verify `ng/fixtures -> ../fixtures` and all five fixture hashes through both paths. A discrepancy is STOP; no repackage/repair/re-extraction.

Dependency installation, if required in the fresh container, is only existing `pnpm install --frozen-lockfile` with pnpm 9.6.0 and unchanged dependency inputs. Retain its logs and compare source/config/lockfile hashes afterward. No dependency update, generator, build, test or unrelated preparation is permitted. If PrimeNG startup cannot operate without additional build/preparation, STOP and request a ruling. Passing V5/V6/V7 are not replayed.

## 4. Proposed disposable runner configuration — approval decision

The existing approved V1 temporary configuration starts both `prime-reference-ng` and `ng-storybook`. Reusing it would introduce an unnecessary Ultimate server and its preparation requirements. This packet therefore **proposes a separate D2-only configuration**; it does not change the base or any approved temporary configuration. Human approval must explicitly include this isolation choice before materialization/execution.

Proposed exact text for disposable `/work/tooling/prime-reference/playwright.d2.config.ts`:

```ts
import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testMatch: "d2-readiness.spec.ts",
  workers: 1,
  retries: 0,
  maxFailures: 1,
  updateSnapshots: "none",
  outputDir: "/io/playwright",
  projects: base.projects,
  webServer: (base.webServer as Array<{ name?: string }>).filter(
    (s) => s.name === "prime-reference-ng"
  ),
});
```

Preserve inherited Chromium/device settings, assertion/test/server timeouts and environment. Start only `pnpm --filter prime-reference-ng run dev` on 6022 via this configuration. No React/Vue/Ultimate Storybook/SSR server. Require a fresh container without an existing server; do not silently reuse an external server. Preserve `reuseExistingServer` as inherited rather than modifying approved configuration policy.

A separate disposable test at `/work/tooling/prime-reference/e2e/d2-readiness.spec.ts` has one exact title:

```text
D2 imagecompare/default [ng] PrimeNG readiness diagnostic
```

It imports existing `load`, `environment`, `settled`, `probe` from `./probe` and `run`, `imagesLoaded` from `./actions`, with Playwright `test`/`expect`. It must not import or invoke `g3e.spec.ts`, `observe()`, internal geometry hooks, comparison/report/baseline writers, or Ultimate targets. Exact artifact text/diff/hash must be retained before discovery or runtime; an implementation that cannot follow §5 exactly is STOP, not an opportunity to improvise.

## 5. Exact instrumentation contract — approval decision

### 5.1 Before the single navigation

Use the runner's `browser` fixture, not an additional `page` fixture. Supply `load()` with a diagnostic facade exposing only `newPage(options)`: forward the original options unchanged to `browser.newPage(options)`, capture that single page for cleanup, attach listeners and `addInitScript`, then return it. This instruments the unchanged loader before its navigation without editing `probe.ts`. Require exactly one created page; no `goto` outside the existing loader, navigation replay, synthetic image fetch, routing/mock, CSS/DOM mutation, image replacement, clock manipulation or interaction.

Attach page `request`, `response`, `requestfinished`, `requestfailed`, `pageerror`, and console-error listeners. Retain image network records only for the two expected media paths or an actual image request linked to a measured case image; an unexpected case source is recorded then STOP. Assign stable per-request IDs, preserving redirects as distinct linked requests. Record method/URL/resource type, event time, response URL/status/status text, relevant content-type/content-length/location headers, `fromServiceWorker()` where available, finish/failure and `request.failure()` text. Unavailable fields stay unavailable. No response mocking, additional request, broad HAR or unrelated request-body collection.

Before navigation, add a passive init script with a page-local diagnostic buffer, document/window capturing `load` and `error` listeners, and an initial document timestamp. Accept only `HTMLImageElement` targets associated with the expected media URLs or `.p-imagecompare`; guard non-element nodes before element-only properties. Record `performance.now()`, URL/source attributes, `currentSrc`, `complete`, natural dimensions and event type. Do not prevent events or assign any image property. This buffer is diagnostic-only and disappears with the page; it creates no product DOM or style hook.

Keep each event buffer bounded at 256 records; overflow means unreliable evidence and STOP, not silent truncation. Use host monotonic timestamps and page-relative `performance.now()` separately; do not subtract them as if clocks were identical.

### 5.2 Preserve the loader and original readiness assertion

Call `load()` once with `{side:"prime",fw:"ng",ref:"g3e/imagecompare/sized",open:"none"}`. It retains navigation, root attachment, `document.fonts.ready`, the existing 300 ms delay, animation settling and pointer parking. No new synchronization or timeout value is introduced.

Follow the existing default observation sequence through readiness: `environment(page,"prime")`; `run(page, selectors, [])`; `settled(page)`; `probe(page, selectors)`; the existing first-part-present assertion; then `imagesLoaded(page,".p-imagecompare")`. Probe only these already-defined default parts, never `root-style` internals. Retain their output only as setup context, not parity evidence.

Immediately before `imagesLoaded`, record a host/page timestamp pair and a read-only snapshot of both relevant images: DOM identity/index, `src` attribute, resolved `src`, `srcset`, `sizes`, `currentSrc`, `complete`, `naturalWidth`, `naturalHeight`, `isConnected`. Also record `document.readyState`, `document.fonts.status`, existing environment output, and running-animation count. Call `imagesLoaded()` **unchanged and once**: original predicate `complete && naturalWidth > 0`, existing 5000 ms assertion timeout, no extra wait/retry. Capture its exact success or error/stack and final timestamp/snapshot in `finally`, including diagnostic buffers.

An image-readiness timeout is a diagnostic **negative observation**, preserved explicitly as such. The driver may retain it without throwing away evidence; a completed diagnostic collection must never be reported as a V1 pass or assertion waiver. Any other setup/driver defect stops the pass. If `load()` itself fails, retain available events/errors, close the page and STOP; do not reach the readiness stage through an alternate path.

### 5.3 Available decoding evidence; no extended loading window

Human approval must explicitly include the following proposed read-only `decode()` observation, or return this packet for revision. It is not currently authorized.

After the original readiness outcome, invoke `HTMLImageElement.decode()` at most once per image **only if already `complete` with positive natural width/height**. Do not assign `src`, fetch an asset, invoke decode on an unloaded image, or change the original readiness result. Run eligible calls concurrently. Record fulfilled/rejected/error or unsupported. The maximum observation allowance is the **remaining part of the original readiness-start + 5000 ms window**, calculated with the same host monotonic clock. If none remains, do not invoke decode: record `not attempted — readiness window exhausted`. If a call remains pending at that deadline, record `pending at deadline`, stop waiting and close normally. Do not reset the five-second window or keep the page open to confirm.

This is a newly proposed diagnostic observation, not a timeout increase or change to `imagesLoaded()`. Timing overhead must be disclosed. Existing native load/error events and natural dimensions remain separately reported; positive dimensions alone must not be mislabeled as an explicit fulfilled `decode()` promise. Missing load/error events are not inferred as events that occurred. No continuous polling, second observation cycle or reload is allowed. Capturing final evidence/closing resources after the deadline supplies no extra readiness or decode wait.

## 6. Invocation, discovery and environment preparation

The following is a **proposed future invocation**, not executed by packet preparation. A fresh host evidence directory is required:

`E/d2-readiness/`

Launch form from repository root after explicit D2 approval (no production worktree mount):

```sh
docker run --name ultimate-e1-v2-d2 --rm --platform linux/arm64 \
  --mount "type=bind,src=$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/fixture-link-preparation/production-input-with-ng-fixtures.tar,dst=/input/production-input.tar,readonly" \
  --mount "type=bind,src=$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/d2-readiness,dst=/io" \
  mcr.microsoft.com/playwright:v1.63.0-jammy bash
```

Extraction and identity/dependency preparation follow §3; materialize only the two §4 files. Retain exact script/config texts, diffs, hashes and invocation before discovery. Inside `/work`, perform selection-only discovery once with the same file/project/grep/options as the command below plus `--list`. Retain JSON/list output. Require exactly **one** leaf title above, file `tooling/prime-reference/e2e/d2-readiness.spec.ts`, project `prime-parity-chromium`, worker 1, retries 0, no snapshot update, and only the intended server declaration. Treat null reporter `webServer` safely; absence of reporter metadata is not proof of isolation. Verify isolation from the retained config text separately. Zero/unexpected identity/count/file/project or any validator defect is STOP; no discovery repair/rerun.

Diagnostic invocation, once only:

```sh
PLAYWRIGHT_JSON_OUTPUT_NAME=/io/diagnostic-runner.json pnpm exec playwright test \
  -c tooling/prime-reference/playwright.d2.config.ts \
  tooling/prime-reference/e2e/d2-readiness.spec.ts \
  --project=prime-parity-chromium \
  --grep '\bD2 imagecompare/default \[ng\] PrimeNG readiness diagnostic$' \
  --workers=1 --retries=0 --max-failures=1 --reporter=list,json
```

This title/file cannot select V1 or another suite. No command adds an assertion timeout, diagnostic retry, snapshot update, alternate value or confirmation invocation. Existing test timeout remains 120000 ms. Infrastructure/startup failure consumes the attempt and requires a ruling; do not restart the container or campaign.

## 7. Exact future write allowlist and retained evidence

Only after separate approval may these fresh host files/directories under `E/d2-readiness/` be created:

| Artifact                                                                      | Required content                                                                                                                                  |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artifacts/playwright.d2.config.ts`, `artifacts/d2-readiness.spec.ts`         | Exact future disposable source texts; retained before execution                                                                                   |
| `artifacts/driver.diff`, `artifacts/hashes.json`                              | Additions only; original harness/config hashes and artifact hashes                                                                                |
| `starting-state.json`, `input-integrity.json`, `environment.json`             | Branch/dirty-state and input/protected hashes; corrected archive/topology/fixture checks; exact runtime identities/settings                       |
| `commands.log`, `preparation.log`, `server.log`, `diagnostic.log`             | Exact preparation, launch/discovery/diagnostic commands and outputs, with no secrets or unrelated network-body logging                            |
| `selection.json`, `selection-validation.json`                                 | Exact discovery and guard results                                                                                                                 |
| `diagnostic-runner.json`, `playwright/`                                       | Runner report and any automatic failure/error-context attachments; no snapshot updates                                                            |
| `images.json`, `network.json`, `events.json`, `readiness.json`, `errors.json` | Per-image identities/state/decode outcomes; correlated request outcomes; native events; timestamps/assertion result; relevant page/console errors |
| `final-integrity.json`, `cleanup.json`, `artifact-hashes.json`, `result.md`   | Before/after protected/input/repository comparison; resource disposal; complete evidence hashes; facts/hypotheses and next gate                   |

Inside the one disposable container, writes are limited to extracted `/work`, dependency-install/server transient artifacts needed by the unchanged reference app, the two specified diagnostic files, and `/io` evidence. Do not overwrite `g3e.spec.ts`, approved temporary configs or any original source/test/fixture. No permanent or historical evidence changes; no additional archive creation required. Refuse a preexisting host destination or occupied container name rather than selecting a replacement.

Preserve collected event ordering and per-image/request correlation. A missing response/event/decoding value is recorded explicitly, not guessed. No screenshot/diff, parity report or new baseline is needed or authorized for D2. Evidence should report observable asset-serving outcomes and explicit decode outcomes where obtained; if decode was unavailable/pending or the correlation incomplete, report that limit instead of asserting successful decoding.

## 8. Stop, cleanup and interpretation

STOP on identity/hash/topology/source mismatch; missing protected anchor; unexpected case/image/page/selection/server; artifact discrepancy; preparation/driver defect; event overflow; unreliable timestamps/correlation; or any need for another wait/pass, mutation, configuration repair, build, generator, component/framework, mock or substituted resource. Do not correct and retry. A normal negative readiness observation is retained as a result; no subsequent campaign action follows it.

Always retain available evidence and close the one page/context/browser through runner/finally cleanup; terminate the disposable server/container and record disposal. Remove only container-owned temporary artifacts through disposal. Do not rollback production, delete historical evidence, reset/clean the worktree or recreate the environment after loss. Cleanup failure is STOP. Compare host tracked/nonignored inputs and the four C1/protected contents against saved starting hashes; only the allowlisted ignored D2 artifacts may be new.

Distinguish these conclusions:

- A recorded HTTP status is an observed response for its correlated request, not a guessed 404.
- `requestfailed` is a browser-observed request failure; absence of a response alone does not establish it.
- Load/error, natural dimensions, readiness and fulfilled/rejected decode are separate facts.
- Successful corrected-input loading would support the packaging hypothesis. It would not prove the original omitted-link archive produced a particular historical HTTP/decoding error; D2 has no control rerun of that failed input.
- Diagnostic success/failure does not accept/reject C1 rendered parity, satisfy AC1–AC9, pass V1 or authorize continuation.

## 9. Decisions required and final state

**Human review must approve or revise:** the separate PrimeNG-only disposable configuration (§4); the exact instrumentation contract including the conditional, deadline-bounded decode observation (§5); dependency/startup preparation without builds (§3); and the single D2 attempt/allowlist/invocation (§§6–8). The actual test source is not materialized now. Future materialization must retain exact text/diffs/hashes before any execution and STOP if the contract cannot be implemented without another decision. Do not silently substitute the existing V1 configuration, add a build or extend the decoding window.

Proposed authorization, not granted here:

> Authorize materialization and one D2 diagnostic pass exactly under this packet, including its separate PrimeNG-only disposable configuration and conditional decode observation within the original readiness window. Use the corrected archive and unchanged frozen environment. One worker, zero retries, one navigation/page, no V1–V8 member or Ultimate observation, no production/readiness/configuration repair and no continuation. Preserve exact artifacts/hashes and protected inputs; stop on any defect or mismatch, retain evidence, dispose the environment and return for human review.

Any repeated V1 requires a separate **D3** ruling/new invocation budget. Any V2 → V3 → V4 → V8 continuation requires explicit permission addressing the existing V1 stop. Neither D2 approval nor its outcome grants either action.

Packet preparation stops here. Only this new document was created. No artifact materialization, archive change/extraction, container/server/browser/network execution, diagnostic, campaign member, generator, build/test, experiment or verification occurred.

V6/V7/V5 remain PASS; original V1 FAIL is preserved; V2/V3/V4/V8 remain NOT RUN. E1-V2 remains **B / OPEN**; Task 6 **STOPPED / not complete**; AC1–AC9 unresolved. E1-B1 remains protected; the four-file C1 delta is retained; generator count remains exactly one. No new browser observations, baseline/status/classification/Spec/Plan/GAP/ADR changes, commit, merge or push. **D2 execution, repeated V1 and campaign continuation remain unauthorized.**
