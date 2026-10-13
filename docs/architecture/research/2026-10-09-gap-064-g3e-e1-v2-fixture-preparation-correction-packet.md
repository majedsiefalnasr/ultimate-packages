# G3-E E1-V2 — Fixture execution-input preparation-correction packet

**Date:** 2026-10-09  
**Status:** READY FOR HUMAN PREPARATION AUTHORIZATION — design only; correction not applied.

## 1. Authority and scope

This packet implements only the human-authorized packet-design gate following the accepted [D1 investigation](2026-10-09-gap-064-g3e-e1-v2-v1-readiness-d1-investigation.md). It proposes one disposable archive correction for the existing Angular PrimeNG fixture input. It does not authorize applying that correction, D2 diagnostics, D3/repeated V1, or campaign continuation. The [P3 execution packet](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-p3-execution.md), original failure and all historical evidence remain unchanged.

Below, **E** is `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-remediation/`; **X** is `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/e1-v2-c1-experiment/`. These are retained local evidence, not guaranteed clean-checkout assets.

## 2. Exact omission and evidence

The failed `E/production-input.tar` and `E/starting-worktree.tar` omit `tooling/prime-reference/ng/fixtures` entirely. The unchanged Angular asset configuration uses `{ "glob": "**/*", "input": "fixtures", "output": "/" }`. The repository provides that app-local input as a tracked directory symlink to the existing shared fixtures. The successful experiment archive `X/src.tar` contains this link and the same shared image bytes. D1 establishes the omission and source relationship; it does not establish an HTTP status, network failure or decoding failure.

| Required identity                   | Exact value                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| Archive/repository path             | `tooling/prime-reference/ng/fixtures`                                                    |
| Literal relative link target        | `../fixtures`                                                                            |
| Resolved archive-relative directory | `tooling/prime-reference/fixtures/`                                                      |
| Git mode and recorded link blob     | `120000`; `50c98ad3e0ddb0f0703050720db66f6ffa5b4243`                                     |
| Successful archive member           | Tar symbolic-link type `2`, size `0`, linkname `../fixtures`, permission metadata `0755` |

Git mode `120000` denotes the symlink type; tar permission metadata `0755` is not a substitute for that type. The Git blob records link text, not target-file bytes.

The failed archive already contains the target payload: `tooling/prime-reference/fixtures/generate.mjs` and `media/landscape-{1,2,3,4}.png`. It need not contain explicit directory headers for extraction to create their parent directories. No target files need to be generated, copied into the app-local path, or replaced.

### Retained SHA-256 anchors

| Input                                     | SHA-256                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `E/production-input.tar`                  | `a7fea35cb18032bc71cbc039d221472e3d01f7a2ad687f3b6fd5f8b193695fe5` |
| `E/starting-worktree.tar`                 | `0909b4ea2ecbb0b8c20074e4102b09c21c1c823788abc50a19f6438d71b465d2` |
| `X/src.tar`                               | `60bc65d477ffcae50c653c4d738e2f086a8fcb61e3351eab5811c600e2ec90a4` |
| `tooling/prime-reference/ng/angular.json` | `8a8a2740539c734cc3e400092185a7d00f5fbb5302775de3b537e06c7e8f407f` |
| Shared `media/landscape-1.png`            | `fcb9f0eff74f7614d7e791c920253327872740df0ac0f8f053adca98cc39fc86` |
| Shared `media/landscape-2.png`            | `a2d5d4f160a5ece9b940c0c7ca1672f3de14f49fc8c43a4732a8e670ac920a2b` |

The first two PNGs are the failing reference case's inputs; retained header evidence records 800×600 and lengths 17876/17841 bytes. Their equal bytes do not prove browser serving or decoding. Hash all five existing target payload files during future preparation and compare with both retained archives and the applicable retained file manifest; do not invent missing expected hashes. Any disagreement or missing comparison anchor is STOP.

## 3. Minimal proposed correction — not applied

Derive a **new** archive from the exact retained production archive. Add exactly one symlink member, copied with its metadata from `X/src.tar`, after verifying its identity against the tracked link above. Preserve every existing member, metadata and payload. Do not reconstruct inputs from HEAD or broadly repackage the live dirty worktree.

The permitted semantic archive delta is solely:

```text
+ symlink tooling/prime-reference/ng/fixtures -> ../fixtures
```

Do not dereference the link into duplicate files; change asset configuration; regenerate images; repair other links; edit package/dependency inputs; or change any source, readiness, timeout or typography setting. The new archive will have a new SHA-256; record it rather than predicting it or asserting byte equality with the original tar.

## 4. Future preparation procedure and integrity gates

These steps require separate human authorization. They are filesystem-only preparation, not permission to start an execution environment.

1. **Freeze and check inputs.** Record branch/commit, dirty-worktree inventory and the hashes above. Compare current recorded production inputs to `E/post-implementation-manifest.json` and the retained archive. Record current protected-content hashes separately where the manifest lacks an entry. Confirm the tracked link's mode/blob and literal target without modifying it. Confirm original archive contains neither the missing link nor descendants at its path; confirm the successful archive has exactly the specified link. Missing artifacts, changed anchors or a conflicting path are STOP.
2. **Retain exact preparation invocation.** Before mutation, retain the exact host-side command/script text and hash within the allowlisted evidence directory. It must implement only this recipe: copy `E/production-input.tar` to the new destination, then use Python's standard-library `tarfile` append mode on that **copy**, adding a copy of the successful archive's existing symlink `TarInfo` without a file payload. Preserve that member's metadata, including its existing PAX metadata. No general archive-builder, link discovery policy, generator or permanent tool is changed. A script defect is STOP, not permission to repair and retry.
3. **Compare archive semantics.** Enumerate the original and corrected archives in order. Record each member's name, type, linkname, mode, size, ownership metadata, mtime, PAX metadata and regular-file SHA-256. Every original member must remain identical in these respects and in order; exactly one appended member must match the successful archive's symlink metadata. Reject duplicate/conflicting names, extra entries or payload changes. Recheck original archive hashes to establish they were untouched.
4. **Validate extraction safety before extraction.** Require paths to remain within the fresh staging root, with no absolute/traversal escape or link target escaping that root. Reject conflicting topology or writes through symlink ancestors. Do not change other member types or silently skip members to accommodate extraction. If the retained archive cannot be safely extracted without another correction, STOP.
5. **Extract once into a fresh host staging directory.** Use symlink-preserving tar extraction of the corrected archive, retaining the link rather than dereferencing it. No container, install, build, server or browser is involved. Use filesystem `lstat` to require a symlink at `extracted/tooling/prime-reference/ng/fixtures`; `readlink` must equal `../fixtures`. Its resolved target must be exactly `extracted/tooling/prime-reference/fixtures`, within staging. Confirm that the five target payload files are regular files, with the same hashes through both shared and app-local paths. No alternate extraction/retry follows a failure.
6. **Verify unchanged inputs.** Compare extracted regular-file hashes with the base archive and retained post-implementation manifest. The added symlink is checked separately because the old regular-file manifest omitted it. Require exact equality for every original input, including the four C1 files, E1-B1 evidence and assertion/preset sources. Record all discrepancies and STOP; do not repair them. The only accepted topology difference is the single added symlink.
7. **Retain and clean up.** Retain the evidence below, remove only this preparation's fresh extraction staging directory, and record cleanup success. Preserve the corrected archive for a later authorized execution and preserve both original archives. Cleanup failure is STOP. Recheck repository state against the saved starting inventory: no tracked source, configuration, test, fixture, provenance or governance content may change.

The future preparation budget is **one archive correction and one filesystem extraction/validation**, with no alternative packaging variant, correction loop or runtime execution. A failed gate ends preparation immediately; evidence retention and cleanup of owned disposable files are the only remaining actions.

## 5. Exact future write allowlist and rollback boundary

Only the following fresh directory and its listed contents may be created by a separately authorized preparation step:

`E/fixture-link-preparation/`

| Disposable artifact                                                     | Purpose                                                                                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `prepare-fixture-input.py`                                              | Exact retained host-side implementation of §4; no repository tool installation or edits                         |
| `invocation.txt`, `preparation.log`                                     | Exact invocation and preparation-only output                                                                    |
| `starting-state.json`                                                   | Branch/commit, dirty-state inventory, starting protected-content hashes and input anchors                       |
| `original-members.json`, `corrected-members.json`, `archive-delta.json` | Full member metadata/payload hashes and the single-entry delta                                                  |
| `fixture-integrity.json`, `symlink-integrity.json`                      | Target bytes, topology, Git identity and extraction comparisons                                                 |
| `artifact-hashes.json`                                                  | Exact script, archive and retained evidence hashes                                                              |
| `production-input-with-ng-fixtures.tar`                                 | Corrected derivative; never overwrite `E/production-input.tar`                                                  |
| `extracted/`                                                            | One fresh staging extraction containing only the corrected archive's contents; removed after recording evidence |
| `result.md`, `cleanup.json`                                             | Preparation outcome, unresolved runtime question, unchanged-input checks and cleanup confirmation               |

If this destination already exists, STOP rather than overwrite it or choose another destination. No other file changes are allowed. The implementation of the retained script must not introduce choices beyond §4; any need to deviate requires a new ruling.

Rollback means removing only newly created staging/output owned by this preparation, after preserving failure evidence. It does **not** mean reverting the approved C1 production change or restoring from HEAD. Keep historical artifacts immutable; never use broad checkout/reset/clean. On failure, retain any partial corrected archive as explicitly unusable evidence; do not promote it as a valid input.

## 6. C1, E1-B1 and environment preservation

The four approved permanent files remain byte-identical to their retained post-implementation versions:

- `packages/themes/test/utils/g3e-port.mjs`
- `packages/ng/src/image-compare/image-compare-style.ts`
- `docs/architecture/provenance/ng.json`
- `docs/architecture/PROVENANCE.md`

All other original archive payloads remain unchanged as well. This protects E1-B1's upstream Firefox thumb group, undefined token situation, unchanged faithful preset and both failing assertions, including existing Angular/Vue assertion sources and upstream-fidelity evidence. No generator invocation or preset/assertion change is permitted. Preserve dirty work using saved starting contents/hashes, not HEAD alone.

The correction does not change the approved Docker image, dependencies/lockfile, browser, Node/pnpm, viewport/DPR, fixtures, theme, default typography ruling, configurations or runner. Future runtime authorization must independently enforce the already-approved environment and selection/server-isolation requirements. Preparation alone does not reconfirm runtime identity or authorize a browser-preparation pass.

## 7. What preparation can and cannot establish

Successful preparation establishes that the disposable input now contains the existing tracked asset-path topology and unchanged target bytes. It addresses an established packaging omission. It does **not** prove that the omission caused the original browser timeout, that image requests succeed, that images decode, that C1 satisfies parity, or that five seconds was an insufficient wait. No HTTP/decoding outcome may be reported without separately authorized runtime evidence.

AC1–AC9 are unchanged and unresolved. Archive integrity is a prerequisite for future verification, not satisfaction of rendered-geometry, clipping, interaction, accessibility or screenshot acceptance criteria.

## 8. Remaining human decisions and exact stop

1. **Preparation application:** explicitly authorize the one archive correction and filesystem validation in §§3–5, its artifact allowlist and single-attempt budget. Packet creation supplies none of that execution authority.
2. **D2, if requested:** separately authorize a bounded runtime-readiness diagnostic with exact observations and budget. Neither the accepted D1 nor successful package preparation grants D2. Its need remains a human decision.
3. **D3/repeated V1 and continuation:** separately authorize the repeated V1 invocation and its budget, retained measurement/selection/isolation constraints, and whether successful V1 permits V2 → V3 → V4 → V8. Do not replay V5/V6/V7, bypass the original V1 failure, or infer a new campaign budget. No timeout/readiness/fixture/configuration change is implicit.

**Stop reached for this task:** the one authorized packet-design pass is complete. Only this new packet was created; no preparation correction, archive creation/extraction, runtime execution, experiment or retry was performed.

V6/V7/V5 remain PASS; V1 remains FAIL with original evidence preserved; V2/V3/V4/V8 remain NOT RUN. E1-V2 remains B / OPEN; Task 6 remains STOPPED / not complete; AC1–AC9 remain unresolved. E1-B1 stays protected, the four-file C1 delta stays retained, and generator count remains exactly one. No new browser observations, baseline/status/classification changes, Spec/Plan/GAP/ADR changes, commit, merge or push. **Applying this packet, D2, D3 and campaign continuation remain unauthorized.**
