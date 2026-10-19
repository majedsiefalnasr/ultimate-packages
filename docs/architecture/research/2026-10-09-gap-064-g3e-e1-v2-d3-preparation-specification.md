# G3-E E1-V2 — D3 preparation specification

**Date:** 2026-10-09  
**Status:** PROPOSED — NOT AUTHORIZED FOR EXECUTION

**Status note (2026-10-19):** nothing here is pending: E1-V2 CLOSED, E1-B1 RESOLVED (2026-10-11); see `2026-10-08-gap-064-g3e-closeout.md` lines 42–43 and 101 (line numbers as of `94807833`). The text below is the point-in-time record.

**Current write scope:** this new document only. No execution artifacts are created by this specification.

## 1. Authority and preserved state

This document supplies preparation details for review alongside the unchanged [D3 authorization packet](2026-10-09-gap-064-g3e-e1-v2-d3-authorization-packet.md), particularly §7. It neither amends that packet nor supplies a runtime grant. The human accepts D2 as qualified evidence while its final container-byte audit remains **UNAVAILABLE**. That disposition is a conversation ruling; it does not rewrite historical results.

Preserve V6/V7/V5 **PASS**, original V1 readiness **FAIL**, V2/V3/V4/V8 **NOT RUN**, E1-V2 **B / OPEN**, Task 6 **STOPPED / not complete**, and **G3-E E1-V2 AC1–AC9 unresolved**. E1-B1 remains protected; the four-file C1 delta stays retained and generator invocation count remains exactly one. No baseline acceptance, parity acceptance, campaign continuation or operational-effectiveness claim follows from preparation.

Applicable requirements remain the [remediation Spec](../../superpowers/specs/2026-10-08-gap-064-g3e-e1-v2-remediation-design.md), [remediation Plan](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-remediation.md), [P3 execution packet](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-p3-execution.md), and explicit human rulings. Fail-first, zero-retry, exact-delta and protected-scope restrictions remain binding. No V5/V6/V7 replay, D2 replay, generator, implementation or V2/V3/V4/V8 operation is included.

## 2. Evidence register and identity limits

For concise references, **E** means `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/`. The following are existing retained records inspected for this preparation, not freshly executed checks:

| Reference | Existing record                                                                                                                                             | What it establishes                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| R1        | `E/campaign-continuation/commands.log` and `result.md`                                                                                                      | Historical build/verification commands, V6/V7/V5 PASS, first-case PrimeNG readiness failure, and stopped campaign            |
| R2        | `E/campaign-continuation/materialized-artifact-hashes.txt`                                                                                                  | Recorded hashes of materialized temporary configurations, measurement helper and instrumented test                           |
| R3        | `E/fixture-link-preparation/archive-delta.json` and `result.md`                                                                                             | Corrected archive adds exactly the fixture symlink; original member metadata and payloads were preserved in that preparation |
| R4        | `E/d2-readiness/input-integrity.json`                                                                                                                       | Recorded extracted-input manifest, five fixture hashes and 100 protected-content anchors                                     |
| R5        | `E/d2-readiness/environment.json`                                                                                                                           | Recorded D2 environment identity                                                                                             |
| R6        | `E/d2-readiness/preparation.log` and `commands.log`                                                                                                         | Installation completion with lifecycle errors; historical orchestration and failed quoted audit hook                         |
| R7        | `E/d2-readiness/result.md`, `final-integrity.json` and `cleanup.json`                                                                                       | Qualified readiness observations, missing final container audit, final host preservation and disposal                        |
| R8        | [D2 authorization](2026-10-09-gap-064-g3e-e1-v2-d2-readiness-authorization.md) and [D2 decision packet](2026-10-09-gap-064-g3e-e1-v2-d2-decision-packet.md) | D2-only scope, audit limitation and documentary decision options                                                             |

Reading a retained hash does not establish current archive, runtime or artifact byte equality. Future comparisons require their own authorization. This preparation's starting worktree identity was branch `feature/gap-064-g3e-media-data`, HEAD `7c49568b50ed1017e17334152a48fb231e7ec307`; its intentional dirty state is the preservation base, not HEAD alone.

### Frozen historical input identities

Corrected input: `E/fixture-link-preparation/production-input-with-ng-fixtures.tar`, recorded SHA-256:

`b61a8ef908dd41eb9b00ab10b9efb8c90507ebb40a29d4d9292b60036f9c750a`

R3 records 3,792 original members and 3,793 corrected members. The added member is `tooling/prime-reference/ng/fixtures -> ../fixtures`. Tracked Git mode is `120000`; archive permission mode is separately recorded as decimal `493` (`0755`), not Git mode. Preserve both original archives and this derivative. Do not reconstruct inputs from HEAD or the live worktree.

R4's fixture anchors, relative to `tooling/prime-reference/fixtures/`:

| File                    | Recorded SHA-256                                                   |
| ----------------------- | ------------------------------------------------------------------ |
| `generate.mjs`          | `576f0ceedd95dc7f0ef20c952e6ac97bc8faeb2ccf6c05643b3179fd6fea2054` |
| `media/landscape-1.png` | `fcb9f0eff74f7614d7e791c920253327872740df0ac0f8f053adca98cc39fc86` |
| `media/landscape-2.png` | `a2d5d4f160a5ece9b940c0c7ca1672f3de14f49fc8c43a4732a8e670ac920a2b` |
| `media/landscape-3.png` | `b5c9f26549a9bc57d49fdbb57e75a3ff7e2651805fe74e1cd98e7f16c333ca3a` |
| `media/landscape-4.png` | `4c4ceb05138222efcd9dbf65575a199138a9c48516ad8a40d74dfaeeb26b8add` |

R4 records these four production anchors:

| Protected file                                         | Recorded SHA-256                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `packages/themes/test/utils/g3e-port.mjs`              | `0968fa2720f60ce9958110db84933b6d3a066d7b0eb35527b3ed7773e7189db5` |
| `packages/ng/src/image-compare/image-compare-style.ts` | `91deac25ff3ecb54f4f14f74c29e1780c7016365c6a4f179233b646dee01278a` |
| `docs/architecture/provenance/ng.json`                 | `cd445440982571b0ea3a4b24aedf4ce299b5e8a91df8af298395083c6e528efe` |
| `docs/architecture/PROVENANCE.md`                      | `015f9a06ecd51a935bf8f5fd3e2bffc77b47f2ba67b46e5e544778fa2beaa8db` |

Use the complete retained protected-content manifest, including E1-B1, rather than only these four examples. Missing comparison anchors or unequal values are STOP conditions. Historical coverage is not a newly passed integrity audit.

### Frozen historical environment

R5 records Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, image ID `sha256:167d0506cfbe3c294fb214b2d11737326eeee028aa611fa1ba538e5057675847`; Linux arm64; Node v24.20.0; pnpm 9.6.0; Playwright 1.63.0; Chromium 153.0.8010.12; PrimeNG 21.1.9; Aura/PrimeUIX 2.0.3. The Chromium executable was resolved through Playwright and recorded as `/ms-playwright/chromium-1243/chrome-linux-arm64/chrome`.

Preserve the frozen lockfile and approved dependency inputs, viewport 1280×720/DPR 1, and accepted fixture-scoped default typography. The recorded 16px Times New Roman is not a statement of PrimeNG's general application typography. No font integration, theme, asset, readiness or timeout change is proposed.

## 3. Build and dependency preparation proposal

**Reusable build outputs: NOT ESTABLISHED.** R1 records successful shared-package preparation and V7 Angular build/typecheck. It does not supply a reusable build-output archive with a complete output manifest, hashes, producer environment and input linkage. R4's extracted-input manifest does not inventory `packages/ng/dist/` or `packages/uix-utils/dist/` entries. This does not prove that every possible retained output is absent; it means the inspected records do not establish a safe reuse route. No live output is copied or assumed reusable.

The minimum fresh-build route supported by P3 §3 is the existing seven-package prerequisite sequence, following the frozen installation:

```sh
pnpm install --frozen-lockfile
pnpm --filter @ultimate/uix-utils run build
pnpm --filter @ultimate/uix-styled run build
pnpm --filter @ultimate/uix-styles run build
pnpm --filter @ultimate/uix-motion run build
pnpm --filter @ultimate/uix-data run build
pnpm --filter @ultimate/themes run build
pnpm --filter @ultimate/ng-core run build
```

These are proposed preparation commands, not an authorization or newly verified minimum dependency graph. Their fresh invocation budget, output paths/write inventory and final manifests remain **UNRESOLVED**. No repeated V7 Angular build/typecheck is included. Whether the V1 Storybook route requires additional Angular output beyond these prerequisites is **UNKNOWN** from the inspected provenance; approval must not imply it is unnecessary. If an additional build is required, STOP for an exact proposal and separate budget rather than replaying V7 implicitly.

The current V1 base configuration starts `prime-reference-ng` and `ng-storybook`; P3's temporary V1 configuration filters to those two servers and inherits project settings. This supports preserving that route, not substituting D2's PrimeNG-only preparation. Human review must approve the preparation route and qualify R6's errors before execution.

## 4. Proposed disposable orchestration and artifact contract

### Known representation versus unresolved identities

Propose a fresh disposable environment using only the corrected derivative, extracted under `/work`, with the source archive mounted read-only as in the retained orchestration. It must not bind the live checkout as a writable source. `/io` is the historical evidence mount convention; its new host destination, mount permissions and narrowly scoped output allowlist require approval. A fresh container name/ID, exact launch command, runner contents/hash, logging wrapper and extraction/selection validator contents/hash remain **UNRESOLVED**. Do not reuse the disposed D2 container name as an approved D3 identity.

| Disposable artifact                                        | Historical identity / future requirement                                                                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/work/tooling/prime-reference/playwright.e1v2.config.ts`  | R2 SHA `0c56c18bb9cf029830f4788dc78620adec65107f169a32e5e091100146b49d3d`; use P3 §4 content, inherited settings, Angular/Prime servers only |
| `/work/tooling/prime-reference/e2e/e1v2-measure.ts`        | R2 SHA `9872d51b54fcb25ae0760998a7203471e5068d97cf21b874d226399b29607b8d`; corrected read-only helper, P3 §5 derivation                      |
| Disposable `/work/tooling/prime-reference/e2e/g3e.spec.ts` | R2 SHA `d0093d527435a1e8d6ba14497d19ff832afdde7a9c76f74854955e550445a9d8`; only P3's approved hook; no test/readiness change                 |
| Measurement derivation source                              | P3 §5 records SHA `fc6a909fd1f01bd8b75ea5f097d174c730c9453e498eeacd5db62834a3d2c420`; preserve extraction boundaries and non-Element guard   |
| Selection validator / audit runner                         | Exact future text, derivation, hashes and locations **UNRESOLVED**; retain previously authorized null handling without broadening rules      |

Recorded hashes are comparison candidates, not claims of newly materialized equality. Retain literal future artifact text/diffs/hashes before discovery. Unexpected differences STOP. No V2–V4 config, fidelity script or accessibility validator is part of D3.

### Ordered future sequence for human review

1. Approve the complete preparation representation, evidence destination/allowlist and new budget; issue a separate runtime grant naming final reviewed identities. Until then, no step below may run.
2. Record host branch/HEAD/status and saved starting bytes of all relevant dirty/untracked and protected inputs. Stop on unexpected state; never use HEAD-only restoration. Verify archive/environment identities and manifest coverage.
3. Validate all extraction paths and link targets before extraction. Extract once, preserving the fixture link; verify type, literal target, containment, original-member metadata/payload hashes and fixture equality through both paths.
4. Materialize only the approved disposable V1 artifacts. Retain exact contents, diffs and hashes. Perform the specifically approved frozen dependency/build preparation, with logs and outcomes; no repair or replacement environment.
5. Verify the frozen runtime/configuration identity without an added browser observation pass. Perform one proposed V1-only discovery and its prescribed selection checks. Its budget is not yet granted.
6. Invoke one separately budgeted five-case V1, preserving existing ordering and prescribed observations. Retain output/exit status even on failure; no retry, subset, extra wait, reload or extra observation.
7. Retain available evidence, perform the approved future final audit before disposal, then owned cleanup and final host preservation comparison. Report invocation, semantic, audit and cleanup outcomes separately. STOP for human review.

Historical V1 invocation from R1, with its original evidence mapping shown explicitly:

```sh
G3E_BATCH=E-1 PLAYWRIGHT_JSON_OUTPUT_NAME=/io/checks/v1.json pnpm exec playwright test -c tooling/prime-reference/playwright.e1v2.config.ts tooling/prime-reference/e2e/g3e.spec.ts --project=prime-parity-chromium --grep "\bimagecompare/(root-style|default|slide|focus|rtl) \[ng\] PrimeNG 21\.1\.9 vs Ultimate$" --workers=1 --retries=0 --max-failures=1 --reporter=list,json
```

Propose preserving this command and internal result path only after approving a fresh host evidence mapping. Discovery uses the same selection with `--list --reporter=json` instead of `--reporter=list,json`; do not execute either here. Require exactly the five existing `imagecompare/default`, `root-style`, `slide`, `focus`, `rtl` title suffixes ending `[ng] PrimeNG 21.1.9 vs Ultimate`, project `prime-parity-chromium`, file `tooling/prime-reference/e2e/g3e.spec.ts`, and unchanged worker/retry/snapshot/isolation guards. Zero, duplicate or unexpected selections STOP.

### Proposed future write boundary

No new host path is selected here. Future approval must name the fresh evidence directory, starting-state copies, exact artifact/log/discovery/report files, and cleanup ownership. Historical internal output paths are `/io/checks/v1.json`, `/io/playwright/v1`, `/io/internal/prime.json`, `/io/internal/ultimate.json` and `/io/captures`; actual output inventory and name-collision handling must be frozen from approved artifact texts. An existing output directory is not permission to overwrite it.

Inside the disposable environment, permit only the reviewed extraction, listed temporary V1 artifacts, explicitly enumerated dependency/build outputs, prescribed runner outputs and separately reviewed audit artifacts. The complete dependency/build write inventory and audit representation are **UNRESOLVED**. No production, fixture, source configuration, generator data, snapshot or baseline change is permitted. The instrumented disposable test is the existing approved hook, not permission to revise tests. Every future write outside the frozen inventory is STOP.

## 5. Future final-integrity and cleanup proposal

R7 establishes D2's pre-diagnostic container comparison and final host comparison, but its final container-byte audit failed through the quoted EXIT-hook representation. The container was disposed. That historical audit remains **UNAVAILABLE** and cannot be reconstructed.

Propose an explicit, sequential final-audit phase while the new container still exists, rather than relying on the failed quoted hook. The exact runner code, quoting/serialization, host retrieval command, artifact names/hashes and bounded invocation allocation require separate review. No corrected script is created or claimed verified here.

The future audit must:

- Compare all original extracted regular-file bytes and link topology to R4's original-member manifest; compare the full protected-content set, including the four C1 files and E1-B1, to approved anchors.
- Account separately for the exact approved temporary test/config/helper deltas. Preserve starting and expected temporary bytes; do not exempt whole directories from comparison or call the deliberately instrumented test unchanged.
- Verify fixture link type, literal target, containment and target hashes through both paths. Preserve archive identity and original metadata/payload comparisons.
- Inventory permitted dependency/build/runtime additions separately against the reviewed write allowlist; an input hash match alone cannot establish that no prohibited additional file exists.
- Capture command/exit outcomes, partial logs, actual environment/container identity, selection results, prescribed captures/parity/noise reports and root-style internal measurements before disposal. Missing measurements cannot be filled by another browser pass.
- Preserve audit failure and mark missing audit evidence **UNAVAILABLE**, never PASS. Report mismatch as FAIL; do not repair, recreate, extend waits or rerun the audit.
- Record disposal of only the attempt-owned container, servers and staging resources; keep originals and retained evidence. Cleanup failure is a separate failure. Host status/content comparison must use saved starting contents and include pre-existing untracked files.

Independent review must receive the grant, input/environment identities, exact artifact texts/diffs/hashes, selection evidence, command/exit/partial-output records, prescribed image/probe evidence, before/after integrity records, output inventory and cleanup report. These must survive disposal under an explicitly approved retention destination. No successful cleanup substitutes for missing audit evidence. If mandatory capture cannot be retained, stop and preserve what remains within the approved cleanup boundary.

## 6. Dependency lifecycle qualification

R6 records `msgpackr-extract@3.0.4` lifecycle errors under Node v24.20.0/node-gyp 12.4.0, including `ERR_INVALID_ARG_TYPE`, `ERR_UNKNOWN_FILE_EXTENSION` and unavailable compiler/fallback failure. The installation nevertheless reached `Done in 1m 18.7s`. R7 subsequently records two PrimeNG fixture images served with HTTP 200, loaded with positive 800×600 natural dimensions, and fulfilled conditional decode observations.

Those facts establish completion and limited D2 readiness, not a clean lifecycle, a proven harmless optional failure, or readiness of Ultimate/Storybook/full V1. They also do not establish that the lifecycle errors caused the original V1 timeout. Relevance to D3 preparation remains **UNKNOWN**.

Smallest additional analysis proposal: read only the frozen lockfile entries and the directly relevant retained package metadata/install-log context to establish whether the failing lifecycle belongs to an optional native accelerator, its fallback contract, and whether the V1 server/build dependency chain uses it. No installation, import probe, compiler addition, runtime experiment or dependency repair. This further qualification is left for separate explicit authorization; if source evidence cannot settle runtime relevance, record UNKNOWN and seek a human disposition rather than infer safety.

## 7. Section 7 gap-to-decision mapping and budgets

| Existing D3 §7 gap              | Evidence and proposed resolution                                                                                                                                                    | Remaining uncertainty / human decision / STOP                                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. New budget and grant         | D3 §§3/5 and R1 establish exhausted historical campaign authority. Propose one repeated five-case V1, one worker, retries 0, max-failures 1, plus one separately budgeted discovery | **UNRESOLVED:** approve exact preparation, installation/build, identity, discovery, V1, audit, capture and cleanup invocation budgets. No historical counter reset or implicit grant              |
| 2. Orchestration and identities | R1/R2/P3 provide command and artifact comparison identities; §4 specifies dependency order                                                                                          | **UNRESOLVED:** fresh host evidence path/allowlist, container identity, exact driver/logging/extraction/selection/audit texts and hashes. Missing or differing identity STOP                      |
| 3. Build preparation            | R1 historical successes; R4 lacks demonstrated reusable output inventory. §3 proposes the existing seven prerequisites                                                              | **UNKNOWN:** adequate reusable outputs and additional Angular build requirement. Human must approve an exact route/budget or defer; no V7 replay by implication                                   |
| 4. Final audit / cleanup        | R7 records unavailable historical audit. §5 defines coverage and explicit pre-disposal phase                                                                                        | **UNRESOLVED:** exact representation, invocation bounds, output locations and cleanup ownership. No runtime launch before reviewed approval; no historical recovery claim                         |
| 5. Integrity anchors            | R3/R4/R5 and §2 identify retained archive/environment/fixture/protected manifests                                                                                                   | Historical coverage is **PARTIAL** for future execution: fresh equality remains unverified. Approve complete comparison inputs and temporary-delta/output coverage; missing anchors/mismatch STOP |
| 6. Preparation qualification    | R6/R7 establish lifecycle errors, installation completion and limited readiness                                                                                                     | Relevance **UNKNOWN**. Authorize the narrow read-only qualification or explicitly disposition known limits; no compiler/dependency fix or assumption of harmlessness                              |

The one-V1/one-discovery limits above are proposals, not approved new budgets. Preparation/extraction, installation, seven builds, final audit/evidence/cleanup counts remain unresolved. Repairs, retries, generators, extra browser observations, timeout increases and other campaign members remain excluded. Existing readiness and operation timeouts are unchanged; no new total-duration/resource defaults are invented. Failed, partial or UNKNOWN operations must be retained, not automatically repeated.

## 8. Acceptance and final human boundary

Use G3-E E1-V2 AC1–AC9 from Spec §8/Plan §7 without change. A future V1 may contribute placement, root/first/slider geometry, wrapper/image sizing, clipping and five-case interaction evidence under the existing ±1 px tolerance and P3 material-probe/noise rules. Image y16 alone is insufficient. Preserve P3's STOP on pending saved-image difference (`review.differing > 0`), unreliable measurements or material mismatch; do not invent a replacement threshold.

A successful repeated V1 would not supply V2 regression, V3/V4 accessibility/reach, V8 provenance verification or final acceptance. Historical V5/V6/V7 PASS stays historical, with its actual inputs and limitations. No criterion is closed here.

Next human decisions, in dependency order: resolve preparation qualification and build route; approve fresh evidence/write boundary and exact orchestration/audit representation; approve separately accounted preparation/execution/retention/cleanup budgets; review the resulting complete execution proposal; issue a separate grant if appropriate. Content approval of this specification alone cannot launch anything. V2→V3→V4→V8 continuation remains a later, separate decision.

**STOP FOR HUMAN REVIEW. D3, repeated V1 and campaign continuation remain unauthorized.**
