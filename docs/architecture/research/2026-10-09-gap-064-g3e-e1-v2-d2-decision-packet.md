# G3-E E1-V2 — D2 evidence disposition decision packet

**Date:** 2026-10-09  
**Status:** Prepared for human decision only. No evidence acceptance, audit, repair, rerun or continuation authorized by this document.

## 1. Decision scope and authority

The human authorized a research/documentation review of the completed D2 attempt and preparation of this packet. The [D2 authorization packet](2026-10-09-gap-064-g3e-e1-v2-d2-readiness-authorization.md) was subsequently approved for one bounded diagnostic. Its original preparation header remains historical; the human ruling supplied execution authority without granting another attempt or campaign continuation.

The decision now concerns how to carry forward **successful readiness observations from an attempt whose final container-byte audit failed to execute**. This is not a C1 parity, E1-V2 classification, baseline or Task 6 closeout decision. No autonomous execution policy is created here.

For this packet, **E** is `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/`; **D** is `E/d2-readiness/`. These ignored artifacts are retained local evidence, not promised contents of a clean checkout. The complete [D2 result](../../../.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/d2-readiness/result.md) and [final-integrity record](../../../.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/d2-readiness/final-integrity.json) remain unchanged.

## 2. Evidence reviewed

All retained D2 files were read, including the full result, artifact sources, configuration, driver diff, orchestration command and preparation log. Large input/worktree/hash manifests were read as existing records; no hashes were recomputed or new audit performed.

| Retained evidence | Relevant contents |
| --- | --- |
| `D/result.md` | Observations, execution defect, limitations, cleanup and preserved state |
| `D/artifacts/{d2-readiness.spec.ts,playwright.d2.config.ts,driver.diff,hashes.json}` | One diagnostic test, existing loader/readiness imports, read-only listeners, bounded decode, PrimeNG-only configuration, recorded provenance |
| `D/commands.log`, `preparation.log` | Actual launch/preparation/selection/diagnostic sequence, original-input comparisons and failed exit trap |
| `D/input-integrity.json`, `starting-state.json` | Corrected archive identity, 3793 members, 3792 regular manifest entries, fixture topology PASS, five fixture hashes, branch/commit/dirty state, 100 protected-content hashes |
| `D/environment.json` | Recorded pinned runtime identities; viewport/typography intent, supplemented by actual page evidence |
| `D/selection.json`, `selection-validation.json` | Exactly one expected diagnostic identity/file/project; worker 1, retries 0, snapshots none; reporter `webServer: null` handled as absence, not isolation proof |
| `D/diagnostic-runner.json`, `diagnostic.log`, `playwright/.last-run.json` | One test passed, retry 0, no runner errors; 983 ms test duration, approximately 4.7 s runner duration; no other retained runner attachments |
| `D/images.json`, `network.json`, `events.json`, `readiness.json`, `errors.json` | Correlated URLs/responses/events, image state, timing, explicit decoding and empty error buffers |
| `D/server.log` | Extracted lines from diagnostic log; not an independent server-process audit |
| `D/final-integrity.json`, `cleanup.json` | Host comparison PASS, final container audit UNAVAILABLE, exit 1, recorded container disposal |
| `D/artifact-hashes.json` | Existing evidence-hash inventory; read without a fresh hash-validation claim |
| [D1 report](2026-10-09-gap-064-g3e-e1-v2-v1-readiness-d1-investigation.md), [readiness decision packet](2026-10-09-gap-064-g3e-e1-v2-v1-readiness-decision-packet.md), [fixture correction packet](2026-10-09-gap-064-g3e-e1-v2-fixture-preparation-correction-packet.md) | Original failure, missing-link evidence, exhausted budgets and separation of preparation/D2/D3 |

## 3. Confirmed observations and their limits

“Confirmed” below means supported by retained execution evidence, not a new verification in this review.

| Subject | Supported observation | Source / limit |
| --- | --- | --- |
| Input | Corrected archive SHA-256 `b61a8ef908dd41eb9b00ab10b9efb8c90507ebb40a29d4d9292b60036f9c750a`; app-local fixture link and five shared hashes verified after extraction | `input-integrity.json`, completed preparation sequence; not a final container-state measurement |
| Environment | Linux arm64; approved Playwright 1.63.0 Jammy image/ID; Node v24.20.0; pnpm 9.6.0; Playwright 1.63.0; Chromium 153.0.8010.12; PrimeNG 21.1.9; PrimeUIX 2.0.3 | Identity record and commands; no new runtime identity check here |
| Page | One created page, default case mapped to `imagecompare/sized`; actual viewport 1280×720/DPR1; html/body 16px Times New Roman; font status loaded | Driver and `readiness.json`/`images.json`; accepted fixture typography, not general PrimeNG typography |
| Readiness | Existing `complete && naturalWidth > 0` predicate passed; recorded host-start→host-end approximately 43.25 ms | Includes diagnostic snapshot overhead; not image download duration or a benchmark |
| Errors | No relevant page/console errors, image error events or request failures recorded; buffers did not overflow | Within captured scope only; absence does not prove universal absence of errors |
| Diagnostic runner | One standalone test passed; one worker, retries 0 | Not V1, C1 parity or campaign acceptance |
| Overall attempt | Container invocation exited 1 after the exit hook raised `SyntaxError` | Diagnostic success and orchestration failure are separate outcomes |

### Image observations

Both `src` and `currentSrc` resolved to the URLs below. Neither had a srcset/sizes override. Both were connected and already complete in the pre-readiness snapshot.

| Actual URL | Recorded response | Native event / natural dimensions | Explicit decode |
| --- | --- | --- | --- |
| `http://localhost:6022/media/landscape-1.png` | GET; 200 OK; `image/png`; content-length 17876; request finished; no redirect or service worker recorded | Load at page 173.4 ms; `complete: true`; 800×600 | Fulfilled, page 902.7→902.9 ms |
| `http://localhost:6022/media/landscape-2.png` | GET; 200 OK; `image/png`; content-length 17841; request finished; no redirect or service worker recorded | Load at page 173.5 ms; `complete: true`; 800×600 | Fulfilled, page 902.7→903.4 ms |

Readiness page timestamps were 858.4→899.4 ms. Both decode calls were made once on eligible images and returned within the remaining original five-second host window; no extension or retry is recorded. Host/page clocks remain distinct. HTTP response bodies were not retained or hash-compared; matching content lengths do not establish byte identity of served responses.

### Preparation-log qualification

The full preparation log records `msgpackr-extract` lifecycle errors, including `ERR_UNKNOWN_FILE_EXTENSION`, a native compilation fallback, missing `gcc` and a node-gyp failure. The frozen pnpm installation nevertheless completed (`Done in 1m 18.7s`) and execution proceeded through the original-input comparison and successful diagnostic. These are child install-script outcomes, not separately issued project-build or repair commands.

Do not replace that record with a claim that every dependency lifecycle step passed. The retained evidence does not establish this dependency's relevance to the measured image-loading path or its usability for future work. This review does not investigate that unrelated dependency or recommend installing a compiler. The human should retain this qualification when deciding whether the environment evidence is sufficient for the next gate; any investigation/remediation would require its own authorization.

## 4. Inferences and unavailable evidence

| Claim | Disposition |
| --- | --- |
| Expected assets were served and decoded in this corrected-input D2 observation | Supported by correlated responses, load events, natural dimensions and fulfilled decode promises |
| Missing fixture link caused the original V1 timeout | Specific plausible explanation, strengthened by corrected-input success; **not proven**. There was no runtime control observation of the failed archive |
| Original V1 received a 404, suffered a network failure or failed decoding | **Unknown**; do not infer any of these outcomes retrospectively |
| Every original container input remained byte-identical after D2 | **Unavailable**: the final audit did not execute |
| Missing audit demonstrates a product/source defect or tampering | **Unsupported**. The observed defect is executor shell quoting, not a measured source difference |
| Protected host contents were unchanged at D2 completion | Supported by the retained host final comparison and protected hashes; distinct from disposed container contents |
| C1 achieves parity / AC1–AC9 are satisfied | **Not established** by D2. Ultimate and `root-style` were not observed; no parity comparison or acceptance occurred |

## 5. Missing container audit and recovery feasibility

The orchestration's EXIT trap embedded Python inside shell-quoted text. The executed log shows quotes lost in `pathlib.Path(/work)`, producing `SyntaxError`. The command was intended to compare all original `/work` input bytes at exit. It did not perform that comparison.

`final-integrity.json` is a later **host reporting record**, not output from a successful container exit audit. It explicitly distinguishes:

- pre-diagnostic container input comparison: PASS;
- final host byte/status/protected-content comparison: PASS;
- post-diagnostic container-byte comparison: UNAVAILABLE.

None replaces another. Cleanup records report the `--rm` container exited and its absence was confirmed. The retained inventory has no post-diagnostic `/work` filesystem copy or final per-file hash snapshot. Therefore **the exact missing historical audit cannot be completed from the identified retained artifacts without recreating an environment—and recreation would measure a different environment, not recover the disposed state**.

A separately authorized artifact-only integrity review could assess retained logs, manifests or evidence-file consistency. It cannot fill this historical container-byte gap. No such audit was performed in this task. If another independently retained final filesystem snapshot is later identified by the human, its inspection needs an explicit bounded authorization; do not assume that it exists or search outside scope automatically.

## 6. Original V1 and acceptance accounting

Preserve the original V1 FAIL on PrimeNG Angular `imagecompare/default`: the five-second readiness assertion failed before Ultimate or `root-style` observation. D2 has a separate diagnostic title/file, standalone runner and explicit instrumentation. Its readiness success cannot replace the original result, clear the campaign stop or be recorded as a V1 pass.

V6/V7/V5 remain their original PASS evidence; V2/V3/V4/V8 remain NOT RUN. AC1–AC9 remain unresolved and subject to final review. D2 supplies readiness evidence only. It does not cover canonical C1 geometry/clipping, five-case parity, regression screenshots, accessibility/reach, or V8 provenance/integrity verification. No missing-check waiver or acceptance-criteria revision is proposed here.

## 7. Human options — none applied

| Option | Action and consequence | Required authorization |
| --- | --- | --- |
| **A — Preserve/defer** | Retain observations and explicit missing-audit qualification; leave all gates stopped. Human may defer disposition without any new execution | Human disposition if choosing whether to accept evidence for a later gate; retention alone grants no continuation |
| **B — Retained-evidence-only integrity review** | If useful, review existing records under a defined no-runtime scope. Can strengthen evidence-file provenance/accounting; cannot prove disposed `/work` bytes. Exact historical final audit is not feasible from the identified artifacts | Separate bounded audit authorization, exact artifacts, allowed checks/output and stop. No container recreation, hook repair or browser implied |
| **C — Prepare separately budgeted D3/future-execution design** | Carry D2 observations forward as qualified readiness evidence if the human accepts that use. Design future repeated V1 with corrected input, frozen environment, preserved original failure and an explicit budget. A future final audit would cover that future run only | First authorize packet/design preparation; later approve exact preparation/exit-hook representation, integrity capture, invocation/budget and execution. D3 and any later V2→V3→V4→V8 continuation require explicit rulings |
| **D — Require a fully audited new D2 attempt** | If complete D2 execution evidence is mandatory, a new environment/pass and reliable final audit could supply new evidence; it cannot repair history. Repeats already-observed readiness and consumes new resources/budget | Separate exact repair/design approval and a new D2 authorization/budget. Existing one-pass authority is exhausted; no automatic retry or repair |

No option authorizes changing C1, assets, fonts, source/configuration/readiness/timeouts, baselines or protected classifications. B is not an equivalent substitute for the missing audit. C does not replay passing V5/V6/V7 or assume remaining members may bypass V1. D is not recommended solely as a way to relabel the original audit PASS.

## 8. Recommendation and exact next decision

**Proposal for human approval:** preserve the positive D2 loading/readiness/decode observations as **qualified diagnostic evidence**, retain overall-attempt exit failure and the historical final container audit as **UNAVAILABLE**, and make **no automatic continuation**. Include the preparation-log qualification. Do not classify D2 as a fully completed integrity-verified attempt.

The narrow next progress option is **C at its documentation/design stage only**, if the human judges qualified D2 evidence sufficient to prepare D3. Otherwise choose A; choose B only for a defined retained-evidence question it can actually answer, or D if new fully audited D2 evidence is required. This packet makes none of those human choices.

Suggested ruling language, **not granted**:

> Preserve D2's recorded image-serving, readiness and decoding observations as qualified diagnostic evidence. Preserve the executor exit failure, preparation-log qualification and missing post-diagnostic container-byte audit as unavailable; do not mark that audit passed or infer a product defect. Keep original V1 FAIL and all governance/acceptance states unchanged. [Choose: defer further work; or authorize preparation only of a bounded D3 execution/verification decision packet.] No runtime execution, exit-hook repair, audit, rerun or campaign continuation is authorized by this ruling unless separately and explicitly specified.

Any future correction must be separately approved before applying it. Any repeated member, new environment or runtime observation requires a fresh explicit budget. Final review remains human-controlled; no option automatically closes E1-V2, completes Task 6, accepts a baseline or promotes parity status.

## 9. Stop and preserved state

Only this new decision packet was created. Historical D2 artifacts and authorization documents were not rewritten. No fresh audit, hash verification, browser/container/server execution, exit-hook repair, environment recreation, D2/V1/V1–V8 rerun, generator, implementation or autonomous execution policy occurred.

E1-V2 remains **B / OPEN**; Task 6 **STOPPED / not complete**; AC1–AC9 unresolved. E1-B1 remains BLOCKED / B1-0 and protected; E1-B2 CLOSED / VERIFIED; E1-V1 A / out of scope; GAP-102/103/104/105 unchanged. The four-file C1 delta remains retained; generator count exactly one. No baseline/classification/Spec/Plan/GAP/ADR changes, commit, merge or push.

**STOP: await an explicit human disposition and any separately scoped next authorization.**
