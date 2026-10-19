# Consolidation decision record — worktrees, disk-only content and local artifacts

**Date:** 2026-10-19
**Status:** Decisions CD-1 to CD-6 were taken by the user and executed on 2026-10-19. Each section records the authorization, the outcome and the verification. Open items are in §5.

- Final review completed on 2026-10-19; its seven corrections are applied. The record is placed at `docs/architecture/research/2026-10-19-consolidation-decision-record.md` (AGENTS.md §7.3).
- It answers the open questions the documentation-hygiene work left for a separate decision: Spec §6 ("Any later consolidation is a separate decision"), and Plan §3 "Consolidate or archive" and §4. Those questions were listed as §5.3 in the Plan's first draft.

**Evidence base:**

- `main` at `28871085` (PR #41 merged; post-merge CI identical to `94807833`);
- COMPLETION_REGISTER "Deferred (suspended) work" (S1–S7);
- the Current-State Discovery report (2026-10-18, session record);
- the read-only checks listed in §6, run on 2026-10-19.

**Labels:** **[V]** verified on 2026-10-19; **[D]** documented in an existing record but not re-verified; **[U]** unknown.

## 1. Settled; not reopened here

- **The S1–S7 work stays `DEFERRED`.** The register records each item's location. This record only asks _where_ the unique copies should live, never _whether_ the work continues.
- **Every approval status and historical record stays as merged in PR #41.**
- **The primary checkout `ultimate/` stays immutable** until a decision below says otherwise.
- **Nothing here changes PRs #15, #37 or #38.**

## 2. Inventory

### 2.1 Already preserved in `main`: no unique content

| Item                                                                                                  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Worktree `ultimate-doc-hygiene` (branch `docs/documentation-hygiene-suspended-work`, clean)           | 0 commits ahead; merged by #41 (`28871085`) **[V]**. Its git-ignored SDD ledger holds the rulings for #41, also reported in the session **[V]**.                                                                                                                                                                                                                                                          |
| Worktree `ultimate-w1-toolbar` (`feat/w1-toolbar-pilot`, clean)                                       | 0 ahead; merged by #39 **[V]**                                                                                                                                                                                                                                                                                                                                                                            |
| Worktree `ultimate-w1-batch` (`docs/w1-provenance-batch`, clean)                                      | 0 ahead; merged by #40 **[V]**. It also holds two cached archives, which can be rebuilt (see `.vendor-cache` in §2.3).                                                                                                                                                                                                                                                                                    |
| Worktree `ultimate-gap-094` (`feature/gap-094-production-provenance-scope`; 3 modified files)         | Its one commit, `c2aaedfa`, is an earlier version of the PR #22 branch. It is not an ancestor of PR #22's head `ea730eba`, so the branch was rewritten before merge (`c9089b6b`) **[V]**. Two modified scripts are identical to `main` **[V]**. The modified Spec's one line missing from `main` is an older draft: `main` has the refined wording ("any non-empty string", regex backreference) **[V]**. |
| Worktree `ultimate-gap-094-dr5` (1 untracked draft)                                                   | It differs from `main` only in the older `DRAFT` status line and a missing note; `main` reads `DECIDED` (ADR-062) **[V]**                                                                                                                                                                                                                                                                                 |
| Worktree `ultimate-gap-098` (1 untracked draft)                                                       | It differs only in the older `DRAFT` status line; `main` reads `DECIDED` (ADR-063) **[V]**                                                                                                                                                                                                                                                                                                                |
| Primary checkout: `docs/architecture/research/2026-10-14-gap-087-node-policy-research.md` (untracked) | Identical to `main` **[V]**                                                                                                                                                                                                                                                                                                                                                                               |
| Primary checkout: GAP-087 Spec and Plan (untracked)                                                   | They differ only in the older `PROPOSED` status line; `main` reads `IMPLEMENTED — PR #14` **[V]**                                                                                                                                                                                                                                                                                                         |
| Primary checkout: `DECISIONS.md` modification                                                         | All 9 added non-blank lines are already in `main` **[V]**                                                                                                                                                                                                                                                                                                                                                 |
| Local branches with no worktree and 0 commits ahead of `main` (8)                                     | `docs/adr-061-source-incorporation`, `docs/c01-ci-failure-characterization`, `docs/gap-088-closeout`, `docs/gap-090-closeout`, `docs/gap-092-closeout`, `docs/provenance-pr-diff-spec`, `fix/gap-090-codeql-sarif-handoff`, `fix/gap-092-code-quality-local-checks` **[V]**                                                                                                                               |
| Local `main` at `9ea303df`                                                                            | 102 commits behind `origin/main`, 0 ahead **[V]**                                                                                                                                                                                                                                                                                                                                                         |
| Remote branch `origin/feat/w1-toolbar-pilot`                                                          | Merged by #39; still on the remote **[V]**                                                                                                                                                                                                                                                                                                                                                                |

### 2.2 Deferred work (S1–S5): unique, status settled; only its home is open

| Item (register row)                                                            | Location                                                                                                        | Exists elsewhere?                                                                                                                               |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| W2 wave commits `e6a0f4c2` through `3675c4e0`, 6 commits (S1)                  | `ultimate-w2-menus`, `feat/w2-menus-navigation`, unpushed                                                       | **No**: this disk only **[V]**                                                                                                                  |
| Workstream 1 SDD ledger, briefs and evidence (S1)                              | `ultimate-w1-spec/.superpowers/sdd/…` (git-ignored; that branch is merged)                                      | **No** **[V]**                                                                                                                                  |
| Amendments A2/A3, uncommitted (S2)                                             | `ultimate-w2-a2a3` (Spec and Plan modified)                                                                     | **No** **[V]**                                                                                                                                  |
| Workstream 2 SDD ledger (S2)                                                   | `ultimate-w2-a2a3/.superpowers/sdd/…`                                                                           | **No** **[V]**                                                                                                                                  |
| PR #37, 1 commit (S2)                                                          | `ultimate-w2-integrity`                                                                                         | Yes: the remote branch and PR **[V]**                                                                                                           |
| PR #38, 4 commits (S2)                                                         | `ultimate-w2-cli`                                                                                               | Yes: the remote branch and PR **[V]**                                                                                                           |
| PR #15 branch `fix/phase-10-track-c-release`, `5cb9f0a3` (S3)                  | local branch, no worktree                                                                                       | Yes: the remote branch and PR **[V]**                                                                                                           |
| Phase 10 Changesets v1 Spec/Plan amendment, uncommitted (S3)                   | primary checkout                                                                                                | **No.** 7 Spec lines and 102 Plan lines are absent from `main`. PR #15 changes only `release.yml` and `MIGRATION.md` **[V]**.                   |
| Commit `b45f9d5a`, an earlier variant of the PR #15 release-gating commit (S3) | primary checkout branch `docs/gap-087-node-policy-spec`                                                         | **No.** Its remote branch is gone. It differs from `5cb9f0a3` in 7 files (+11/−216) **[V]**. Whether anything in it is still needed is **[U]**. |
| CI-health study: 2 commits and an untracked decision brief (S4)                | `ultimate-ci-health-study`                                                                                      | **No** **[V]**                                                                                                                                  |
| Bounded-autonomy proposal: 9 untracked documents and an `AGENTS.md` edit (S5)  | `ultimate-bounded-autonomous-execution`, plus one identical copy of the design document in the primary checkout | **No** (outside these two worktrees) **[V]**                                                                                                    |

### 2.3 Not deferred, and unique or unexplained

| Item                                                                                                                                 | Facts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dsh-locale-pack/` (inside the primary checkout's tree; untracked, not ignored)                                                      | **New finding.** It is a separate git clone of the third-party repository `https://github.com/sayho-pm/dsh-locale-pack.git`, a DeepSeek Harness locale plugin (v0.3.0, MIT). <br>• Branch `main` at `2d3502aa` (2026-10-12); working tree clean except `.DS_Store`; no stash; 0 commits ahead of its last-fetched `origin/main` **[V]**. <br>• The remote's `main` is now `3c062212`. Whether `2d3502aa` is in that history needs a fetch, which was not run **[U]**. <br>• Nothing on `main` references it **[V]**. <br>• Created 2026-10-12 **[V]**. Why it sits inside the Ultimate checkout is **[U]**. <br>• Risk: being untracked and not ignored, a careless `git add .` in the primary checkout would stage it as an embedded repository. <br>• The discovery report described it only as "untracked, not ignored"; the nested `.git` was not noticed then. |
| GAP-088 SSR Spec draft (`docs/superpowers/specs/2026-10-13-gap-088-ssr-web-server-selection-design.md`, untracked, primary checkout) | Absent from `main` **[V]**. GAP-088 was resolved by PR #8 and closed out in `research/2026-10-14-gap-088-…-closeout.md` **[D]**. Whether this draft became the PR #8 contract is **[U]**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `stash@{0}`: "G3-B rejected U2 vue-webkit screenshot (broken CDN render)", 1 PNG                                                     | Shared by all worktrees **[V]**. U2 was later fixed by PR #20 (`ccb97d68`) **[V]**. An earlier instruction says to keep it **[D]**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Primary checkout `.superpowers/` (3.0 GB, git-ignored)                                                                               | SDD workspaces for 45+ plans, all merged: ledgers, briefs, review diffs, Docker outputs **[V]**. They are local evidence that git does not hold **[V]**. Their value now is **[U]**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Primary checkout `.vendor-cache/` (106 MB), `.vendor-extracted/` (8.5 MB)                                                            | **Correction to the discovery report:** these are rebuildable caches, not unique copies. `scripts/provenance/fetch-vendor-cache.mjs` re-downloads each archive from `docs/architecture/checksums.json` and checks its SHA-256 **[V]**. Whether the source URLs are still reachable has not been tested **[U]**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Primary checkout `.pnpm-store/` (946 MB), `.claude/scheduled_tasks.lock` (2026-10-03), empty `.claude/worktrees/`                    | Caches and tool state; nothing unique **[V]**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Ultimate-Theme/` (sibling directory, not git)                                                                                       | It holds commercial templates and an independent `Ultimate-Core-UI` clone **[D: discovery report]**. It is not part of this repository.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## 3. Decisions needed (smallest set)

Each decision has a recommendation and states what it would allow. No option is applied by this record.

### CD-1 — Where should the unique deferred work (§2.2, "No" rows) be kept?

These items exist only on this disk.

| Option                                                                                                                                                                                                                                                                                                                                      | Effect                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Keep in place.** The register already records each path.                                                                                                                                                                                                                                                                               | No action. The risk of disk loss, or an accidental `git clean` or worktree removal, stays.                                                           |
| **B. Keep in place, plus a local backup outside every repository** (recommended). The backup is a `git bundle` of the unpushed branches (`feat/w2-menus-navigation`, `docs/ci-health-open-gap-study`, `docs/gap-087-node-policy-spec`) plus a dated archive of the uncommitted files and the two live ledgers. Its location is your choice. | Protects the work during restructuring. It is not outward-facing and changes no repository state.                                                    |
| **C. Push archive branches to `origin`.**                                                                                                                                                                                                                                                                                                   | Outward-facing: `origin` is a public repository. Uncommitted drafts would have to be committed onto unmerged branches. Needs separate authorization. |

**CD-1 outcome (2026-10-19).** The user chose option B and set the location to `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/Backups/ultimate-consolidation-2026-10-19/`, replacing the proposed `~/Backups/…`.

_Contents._

- **Bundle:** `git/ultimate-all-refs.bundle` holds **all 34 refs** (`git bundle create --all`). That includes every local branch, `refs/stash` and the `origin/*` refs, not only the three branches option B named.
- **Stash:** `stash/` holds `stash@{0}` as a patch and its PNG as a plain file.
- **Uncommitted files:** `worktrees/<name>/files/` holds byte-for-byte copies of all 26 uncommitted files in the seven dirty worktrees, plus 4 `tracked-changes.patch` files.
- **Ledgers:** `ledgers/` holds the Workstream 1, Workstream 2 and PR #41 ledgers.
- **Third party:** `third-party/dsh-locale-pack/`, including its `.git`.
- **Session records:** the earlier record draft and the discovery report.
- **Index:** `README.md` and `MANIFEST.sha256` (1,868 files).

_Verification._

- 29 checks passed:
  - `git bundle verify`, and all 34 refs at their source SHAs;
  - a clone restored from the bundle passes `fsck`, and its stash is readable;
  - every copied file and ledger is byte-identical to its source;
  - all 4 patches pass `git apply --check` at their HEAD.
- `shasum -c` reports 1,868 OK.
- The source fingerprint (every ref, the stash, and each worktree's HEAD and status) was identical before and after.

_Notes._

- Attempt 1 stopped before creating `git/`. The one fingerprint file it wrote was kept and checked before attempt 2 completed.
- One item was not captured: `dsh-locale-pack/.git/fsmonitor--daemon.ipc`, a live socket that cannot be copied and holds no data.

### CD-2 — May the six worktrees whose content is already in `main` be removed?

The six are `ultimate-doc-hygiene`, `ultimate-w1-toolbar`, `ultimate-w1-batch`, `ultimate-gap-094`, `ultimate-gap-094-dr5` and `ultimate-gap-098`.

- Their local branches go with them, and so do the superseded drafts and cache copies listed in §2.1. _(As executed, the branches were kept at first. They were removed later in the final cleanup; see §5.)_
- `ultimate-w1-spec` is excluded because it holds the S1 ledger (CD-3).

**Options:**

- **A.** Remove all six (recommended, after CD-1).
- **B.** Remove a subset.
- **C.** Keep them until the restructuring.

**CD-2 outcome (2026-10-19, partial).** Revalidated against `origin/main` `28871085`; all six passed.

- **Commits:** each HEAD is in `main`, except `ultimate-gap-094`'s superseded `c2aaedfa`, which stays on its branch and in the CD-1 bundle.
- **Uncommitted files:** every one is identical to `main` or is a superseded draft. All are byte-identical to their CD-1 backup copies.
- **Ledgers:** only `ultimate-doc-hygiene` held one (PR #41). Its folder is byte-identical to `ledgers/doc-hygiene-pr41`.
- **Other ignored content:** rebuildable only (`node_modules`, `.husky/_`, vendor-cache copies).

| Worktree               | Result                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ultimate-doc-hygiene` | **Removed** (`git worktree remove`; folder gone)                                                                                                                                                                                                                                                              |
| `ultimate-w1-toolbar`  | **Removed** (folder gone)                                                                                                                                                                                                                                                                                     |
| `ultimate-w1-batch`    | **Unregistered; folder partly deleted.** `git worktree remove` failed with "Directory not empty". About 210 entries remain: 68 tracked files identical to `29a7d4ea`, 4 `.DS_Store` files, build output (`dist/`, `.angular` cache, `node_modules` links) and a dangling `.git` pointer file. Nothing unique. |
| `ultimate-gap-094-dr5` | **Unregistered; folder empty except `.DS_Store`.** Same error, even with its fsmonitor daemon stopped first. The superseded draft was deleted; it is preserved in CD-1.                                                                                                                                       |
| `ultimate-gap-094`     | **Retained, untouched.** Removal was halted after the second failure.                                                                                                                                                                                                                                         |
| `ultimate-gap-098`     | **Retained, untouched.** Same reason.                                                                                                                                                                                                                                                                         |

**Cause.** macOS Finder writes `.DS_Store` into displayed folders during deletion **[V for dr5: only `.DS_Store` remains; inferred for w1-batch]**. No process held either folder afterwards (`lsof`).

**Other state.**

- **Branches:** all six are kept (CD-6 is separate).
- **Primary checkout:** unchanged.
- **Backups:** unchanged.

**To finish.**

1. Close any Finder windows showing these folders.
2. Delete the two leftover folders. Their content is not unique, and plain `rm -rf` is blocked by this session's safety hook, so the user runs it or authorizes another method.
3. Retry `git worktree remove` for `ultimate-gap-094` (with `--force`, because of its superseded modified files) and `ultimate-gap-098`.

**CD-2 continuation (2026-10-19).**

_Leftover folders._

- Their contents were re-confirmed as reported: `ultimate-w1-batch` 210 non-unique entries; `ultimate-gap-094-dr5` only `.DS_Store`.
- `rm -rf` on a literal path was **blocked by the session safety hook**: `dcg` rule `core.filesystem:rm-rf-root-home` ("… Ask the user to run it manually if truly needed").
- No other deletion method was used.

_`ultimate-gap-098`._

- Revalidated: HEAD `efd677fd` in `main`; its one untracked draft is byte-identical in CD-1.
- Its fsmonitor daemon was stopped, then `git worktree remove --force` ran.
- Result: **unregistered; contents deleted; folder remains with only `.DS_Store`**. It is the same Finder effect.

_`ultimate-gap-094`._

- Revalidated: it still passes. `c2aaedfa` is superseded and kept on its branch and in the CD-1 bundle; its three modified files are byte-identical in CD-1.
- It is **retained, untouched**, under the stop-on-failure rule.

_Final worktree list (9)._ `ultimate` (primary), `ultimate-bounded-autonomous-execution`, `ultimate-ci-health-study`, `ultimate-gap-094`, `ultimate-w1-spec`, `ultimate-w2-a2a3`, `ultimate-w2-cli`, `ultimate-w2-integrity`, `ultimate-w2-menus`.

_Remaining orphan folders (not git worktrees)._

- `ultimate-w1-batch`: 210 entries.
- `ultimate-gap-094-dr5`: 1 entry (`.DS_Store`).
- `ultimate-gap-098`: 1 entry (`.DS_Store`).

_Unchanged._

- All branches are kept.
- `ultimate-w1-spec` and its ledger.
- The primary checkout (8 status entries).
- Both backups (CD-1 manifest and CD-3 archive checksum still check clean).

**CD-2 completion (2026-10-19).**

_Finder._ Three windows were open. Only the one showing `…/Ultimate-Solutions-EGY/` was closed, after confirming its folder by URL. The two `Downloads` windows were left open.

_`ultimate-gap-094`._

- Revalidated: `c2aaedfa` is not in `main` and is superseded by PR #22 (merge `c9089b6b`). It is kept on `feature/gap-094-production-provenance-scope` and in the CD-1 bundle.
- Its three modified files are byte-identical in CD-1.
- Its fsmonitor daemon was stopped. `git worktree remove --force` then **succeeded with no leftover folder**.

_Final worktree list (8)._ `ultimate` (primary), `ultimate-bounded-autonomous-execution`, `ultimate-ci-health-study`, `ultimate-w1-spec`, `ultimate-w2-a2a3`, `ultimate-w2-cli`, `ultimate-w2-integrity`, `ultimate-w2-menus`. `.git/worktrees/` matches.

_Unchanged._

- `ultimate-w1-spec`: HEAD `1e14de43`, clean, and its W1 ledger is byte-identical to the CD-1 copy.
- All branches kept, including `c2aaedfa`.
- Primary checkout: 8 status entries.
- CD-1 manifest: 0 of 1,868 files failing.
- CD-3 archive checksum: OK.

_Left for manual removal through Finder (not git worktrees; nothing unique)._

- `ultimate-w1-batch`: 210 entries.
- `ultimate-gap-094-dr5`: only `.DS_Store`.
- `ultimate-gap-098`: only `.DS_Store`.

**CD-2 cleanup verified complete (2026-10-19).**

_Leftover folders._ `ultimate-w1-batch`, `ultimate-gap-094-dr5` and `ultimate-gap-098` no longer exist under `…/Ultimate-Solutions-EGY/`; they were found in `~/.Trash`. `git worktree list` shows 8 entries.

_CD-1 backup (`Backups/ultimate-consolidation-2026-10-19/`)._

- `shasum -a 256 -c MANIFEST.sha256`: 1,868 OK, 0 failed.
- The folder holds exactly the manifest's files: none unlisted, none missing.
- Its 3 `.DS_Store` files are listed and match.

_CD-3 archive (`Backups/ultimate-superpowers-history-2026-10-19/`)._ The full re-verification passed all 9 checks:

- the archive reads end to end;
- the archive, `SOURCE-MANIFEST.sha256` and the source match: 40,703 files, 0 hash mismatches, 9,987 directories, 10 symlinks;
- the live source re-hashed unchanged;
- `ARCHIVE.sha256` is OK;
- the CD-1 manifest is still clean.

### CD-3 — Where should the SDD ledgers live?

The ledgers are git-ignored and exist only on disk.

**Two live ledgers (S1, S2).**

- Recommended: keep each with its deferred work, and include them in the CD-1 backup.
- If `ultimate-w1-spec` is ever removed, the S1 ledger must move first.

**Historical ledgers in the primary checkout's `.superpowers/` (3.0 GB).** All belong to merged plans.

- **A.** Keep in place.
- **B.** Move to a dated archive outside the repository (recommended).
- **C.** Delete, after confirming that each plan's record lives in git history and closeout documents.

#### CD-3 inspection addendum (2026-10-19, read-only)

The historical `.superpowers/sdd/` was inspected without changing it. It is 3.0 GB in 40,705 files: 45 workspace folders plus 358 loose files from the older flat layout. (40,705 = 40,703 regular files + 2 file symlinks; the CD-3 archive counts its 10 symlinks separately.)

| Category                                                                               |     Size |  Files | Preserved elsewhere?                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------- | -------: | -----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Process records: ledgers (33 `progress.md`), briefs, reports, review diffs, notes      |    92 MB |  5,566 | **Partly.** Outcomes are in committed closeout and verification records for every large workspace: G3-B, C1, C2-0, C2, G3-D, G3-E (with records E-1 to E-4), tranche 1, prime-parity, GAP-082, GAP-083 and GAP-124 **[V]**. Merged commits keep the code history, so review diffs can be regenerated **[V]**. Ledger rulings and reviewer reports exist only here **[V]**. |
| Raw run evidence: Docker and Playwright result tars, screenshots, JSON, logs           | 1,408 MB | 16,356 | **No.** Accepted baselines and the summarized results are committed; the raw run outputs are not **[V]**.                                                                                                                                                                                                                                                                  |
| Repository source snapshots (`src.tar` inputs to Docker runs, `val-*/packages` copies) | 1,417 MB | 11,862 | **Rebuildable** from git history at the recorded commits **[V for history, U for the exact commit of every snapshot]**                                                                                                                                                                                                                                                     |
| Extracted upstream Prime source (`up/`)                                                |    87 MB |  5,724 | **Rebuildable** from the checksum-verified vendor archives **[V]**                                                                                                                                                                                                                                                                                                         |
| Scripts and configs                                                                    |     6 MB |  1,197 | Mostly fixtures and tools for one-off runs **[U whether any are committed elsewhere]**                                                                                                                                                                                                                                                                                     |

**Committed records point here.** Documents on `main` cite 122 distinct paths inside `.superpowers/sdd/`, and 91 of the specific ones still exist (about 1.5 GB counting cited folders) **[V]**.

- Most citations are output locations in Plan commands.
- Some are evidence citations, which the records themselves label as git-ignored local evidence. Example: the G3-E E-1 record's "Evidence (git-ignored), under `…`".
- Deleting the folder would leave those citations pointing at nothing.

**Conventions.**

- AGENTS.md §4: CI artifacts are ephemeral; committed baselines and dated research records are the durable evidence.
- The subagent-driven-development skill deletes a plan's workspace once its review is clean and merged ("the git history is the record now").
- This repository has kept workspaces after merge in practice (agent memory: "feature branch + SDD workspace kept").

**Recommended CD-3 disposition: archive in full, keep the source in place.**

- Make one compressed archive of the whole `.superpowers/sdd/`, with a SHA-256 manifest and an index mapping each workspace to its plan, merge and closeout record.
- Store it at `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/Backups/ultimate-superpowers-history-2026-10-19/`. This is a separate folder, so the verified CD-1 backup stays unchanged.
- Leave the source in place.
- Deleting or slimming the source, for example dropping the 1.5 GB of rebuildable snapshots, stays a later and separate decision, after the restructuring.

**Why not the alternatives.**

- A records-only archive (92 MB) would drop cited raw evidence.
- A selective archive needs judgment about which raw evidence matters, and that judgment can be wrong.
- Keeping everything in place without an archive leaves the only copy inside a checkout that the restructuring may replace.

**Remaining risk.** Free space is about 38 GB and the archive needs at most 3 GB, so it fits. It would sit on the same disk as the source.

**CD-3 outcome (2026-10-19).** Approved by the user and executed.

- **Location:** `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/Backups/ultimate-superpowers-history-2026-10-19/`.
- **Archive:** `superpowers-sdd-2026-10-19.tar.gz`, 750,650,186 bytes, compressed from 3.0 GB.
- **Contents:** 40,703 files, 9,987 directories and 10 symlinks, the symlinks stored as links.
- **Also in the folder:** `SOURCE-MANIFEST.sha256`, `SYMLINKS.txt`, `ARCHIVE.sha256`, `INDEX.md` (45 workspaces) and the before/after source fingerprints.
- **Verification:** all 9 checks passed.
  - The archive was read end to end.
  - The file sets of archive, manifest and source are equal.
  - Every file hash matches.
  - The directories and the symlink targets match.
  - The live source was re-hashed and is unchanged.
  - The archive checksum matches.
  - The CD-1 backup's manifest still checks clean.
- **Source:** left in place and unchanged. Deleting or slimming it remains a separate, later decision.

### CD-4 — What happens to the two non-deferred unique items in the primary checkout?

**The GAP-088 SSR Spec draft:**

- **A.** Archive it with the CD-1 backup as a historical draft (recommended).
- **B.** Commit it with a `SUPERSEDED` or historical status (needs its own documentation change).
- **C.** Discard it.

**`stash@{0}`, the rejected U2 screenshot (U2 is now fixed):**

- **A.** Keep, following the earlier instruction.
- **B.** Export the PNG into the CD-1 archive, then drop the stash (recommended).
- **C.** Drop it.

**CD-4 outcome (2026-10-19).**

- **Verification:** 21 checks passed against the CD-1 backup.
  - The GAP-088 draft copy is byte-identical to the source and is listed in the manifest.
  - The bundle's `refs/stash` matches `b7ec2269`. In a scratch clone it restores and applies cleanly.
  - The exported PNG and the patch match the original stash.
- **Stash dropped:** with the user's authorization and a guard confirming `stash@{0}` was `b7ec2269`, `git stash drop stash@{0}` ran and reported "Dropped stash@{0} (b7ec2269…)".
- **Afterwards:**
  - `git stash list` is empty and `refs/stash` no longer exists.
  - The bundle still lists `refs/stash` at `b7ec2269`.
  - The commit object is still present locally until git's garbage collection runs.
  - The CD-1 manifest still checks clean.
- **GAP-088 draft:** left in the primary checkout as instructed. It is archived in the CD-1 backup. Removing it is deferred to the decision on the primary checkout's state.

### CD-5 — What is `dsh-locale-pack/` for, and where does it belong?

This needs your answer first: why is it in the Ultimate checkout?

| Option                                                                | Effect                                                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Move it out** of the Ultimate tree to a location of your choice. | Recommended if you still use it.                                                                                                          |
| **B. Delete it.**                                                     | Safe only if it is a disposable clone. Fetching first would show whether its local commit is on the remote; nothing local is uncommitted. |
| **C. Keep it, and exclude it locally** via `.git/info/exclude`.       | No shared file changes, and it can no longer be staged by accident.                                                                       |

#### CD-5 investigation addendum (2026-10-19, local evidence only; no fetch or network query)

**Origin.**

- The user's zsh history records a manual `git clone https://github.com/sayho-pm/dsh-locale-pack.git` at epoch 1791804611, followed by `cd dsh-locale-pack` **[V]**.
- The clone's reflog records `clone: from https://github.com/sayho-pm/dsh-locale-pack.git` by "Majed Sief Alnasr" at 2026-10-12 14:30 (+03:00) **[V]**.
- One later fetch, at 2026-10-13 09:15, brought nothing new: `FETCH_HEAD` is the same `2d3502aa` **[V]**.
- VS Code has opened the clone: its config has `vscode-merge-base = origin/main` **[V]**.

**Usage.**

- DeepSeek Harness is installed at `~/.dsh`.
- Its plugin manager installed the pack **from GitHub, not from this folder**, at 2026-10-12 14:36, six minutes after the clone (`+ dsh-locale-pack github:sayho-pm/dsh-locale-pack`) **[V]**.
- It uninstalled the pack at 2026-10-18 14:06 (`- dsh-locale-pack 0.3.1`) **[V]**.
- Nothing under `~/.dsh` references the Ultimate checkout path. The pack is in neither the profile's `package.json` nor `node_modules` **[V]**.
- No Ultimate file references it (`git grep` on `main`) **[V]**.
- Other agent sessions mention it only in passing, in `git status` listings or a pasted Harness plugin list. None explains why it is here **[V]**.

**Why it sits in the Ultimate checkout:** not established from local evidence **[U]**.

- The shell history does not record the working directory of the clone.
- The timing (clone, then a GitHub install six minutes later) is consistent with inspecting the plugin before installing it, with the clone landing in whatever directory the shell was in. That is an inference, not evidence.

**Is local `2d3502aa` on the remote today?** Unknown **[U]**.

- Locally, `origin/main` was `2d3502aa` as of the 2026-10-13 fetch.
- A read-only `git ls-remote` on 2026-10-19 showed the remote `main` at `3c062212`.
- The local copy has no objects for `3c062212`, so ancestry cannot be decided without a fetch or an API query.
- Separately, the plugin manager uninstalled version 0.3.1, while the local `package.json` says 0.3.0, so the remote has moved on.

**Local state.**

- Clean working tree; no stash; 0 commits ahead of the last-fetched `origin/main` **[V]**.
- Preserved byte-for-byte in the CD-1 backup at `third-party/dsh-locale-pack/` (1,723 files; HEAD `2d3502aa`) **[V]**.
- The 2026-10-19 11:36 timestamp on `.git/index` comes from this session's earlier `git status` (a cache refresh only).

**Recommended CD-5 disposition: remove it from the Ultimate checkout.**

- It is unused: Harness never referenced this copy, and the plugin is uninstalled.
- It is clean and fully backed up.
- It can be re-cloned from its public origin.

This is a change to the primary checkout's working tree, so it needs explicit authorization. If you still want a local working copy, move it to a location outside any repository instead. The local-only alternative, adding it to `.git/info/exclude`, leaves an unused third-party repository inside the checkout.

**CD-5 outcome (2026-10-19).** The user approved moving the clone out of the checkout and keeping it, not deleting it.

- **Move:** `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/dsh-locale-pack` → `/Users/majedsiefalnasr/Documents/Work/third-party/dsh-locale-pack`.
  - A single same-filesystem rename.
  - The destination folder did not exist beforehand and is not inside any repository.
- **Before the move:**
  - The CD-1 backup manifest checked clean, 1,868 files, including the 1,723 `third-party/dsh-locale-pack/` entries.
  - The running `git fsmonitor--daemon` watching the clone was stopped. This ended a background process only; it removes its own runtime socket.
- **Verification:**
  - All 1,780 entries match by SHA-256 or link target. This excludes `.git/index`, a stat cache, and the runtime socket.
  - HEAD, refs, remote URLs and `.git/config` are identical (HEAD `2d3502aa`; origin `https://github.com/sayho-pm/dsh-locale-pack.git`).
  - `git fsck --full` passed.
  - The clone's status shows only the ignored `.DS_Store`.
  - The Ultimate working tree's porcelain status is identical except that `?? dsh-locale-pack/` is gone.
  - The CD-1 backup manifest still checks clean.
  - No fetch, no remote change and no ignore-rule change.

### CD-6 — May fully merged branch references be deleted?

- the 8 local branches in §2.1;
- the remote branch `origin/feat/w1-toolbar-pilot`.

**Options:**

- **A.** Delete them (recommended, together with CD-2). Deleting the remote branch is outward-facing and needs explicit authorization.
- **B.** Keep them.

`b45f9d5a` (S3) is not included; CD-1 covers it.

**CD-6 assessment (2026-10-19).** All 8 local branches and `origin/feat/w1-toolbar-pilot` have their tip in `main` (`28871085`) with 0 commits outside it, and all are in the CD-1 bundle.

- Merged by: PRs #18, #16, #13, #12, #17, #7 and #9. `docs/gap-090-closeout` (`a76f321b`) reached `main` through PR #8's merge `3f86cbce`.
- None of the 8 exists on GitHub any more.
- The repository has `delete_branch_on_merge=false`, which is why `origin/feat/w1-toolbar-pilot` (PR #39 head `4cfca5a8`, merged as `4a426b34`) remains.

**CD-6 local deletion outcome (2026-10-19).** Authorized by the user for the 8 local branches only, using `git branch -d` from a checkout at `main`.

- **Method:** a temporary detached worktree at `28871085` in the session scratchpad, with `core.fsmonitor=false`.
- **Pre-check:** immediately before deleting, each tip was re-checked as an ancestor of `28871085` and as present in the CD-1 bundle at the same SHA. All 8 passed.
- **Deleted:**
  - `docs/adr-061-source-incorporation` (was `53f1b949`)
  - `docs/c01-ci-failure-characterization` (was `c2577893`)
  - `docs/gap-088-closeout` (was `5745dfeb`)
  - `docs/gap-090-closeout` (was `a76f321b`)
  - `docs/gap-092-closeout` (was `0fc8cc0f`)
  - `docs/provenance-pr-diff-spec` (was `c4188038`)
  - `fix/gap-090-codeql-sarif-handoff` (was `44890f39`)
  - `fix/gap-092-code-quality-local-checks` (was `de68356d`)
- **Cleanup:** the temporary worktree was then removed with `git worktree remove`.
- **Not touched:**
  - `origin/feat/w1-toolbar-pilot` and local `feat/w1-toolbar-pilot`. Deleting the remote branch needs separate, explicit authorization.
  - All other branches and the stale local `main` (`9ea303df`).
  - The 8 worktrees and the primary checkout (8 status entries).
  - Both backups (CD-1 manifest clean; CD-3 archive checksum OK).

**CD-6 remote deletion outcome (2026-10-19).** Explicitly authorized by the user for `origin/feat/w1-toolbar-pilot` only.

- **Guards, immediately before deleting:**
  - `git ls-remote` showed the remote branch at `4cfca5a8b5293153102cc947250e66daa58f7483`.
  - The remote `main` was `28871085`, and `4cfca5a8` is its ancestor.
  - `4cfca5a8` is in the CD-1 bundle.
- **Deletion:** `git push --force-with-lease=refs/heads/feat/w1-toolbar-pilot:4cfca5a8… origin :refs/heads/feat/w1-toolbar-pilot`. The lease ensured deletion only at that SHA. The result was `- [deleted] feat/w1-toolbar-pilot`.
- **Afterwards:**
  - `git ls-remote` returns nothing for the branch, and the GitHub API returns "Branch not found".
  - The remote branches left are `fix/phase-10-track-c-release` (PR #15), `fix/w2-b3-cli-remediation` (PR #38), `fix/w2-coverage-integrity-rows` (PR #37) and `main`.
  - The local `feat/w1-toolbar-pilot` (`4cfca5a8`) is kept. All 16 local branches are unchanged.
  - The CD-1 manifest is clean and the CD-3 archive checksum is OK.

### No decision needed (stated for completeness)

- **Caches** (`.vendor-cache/`, `.vendor-extracted/`, `.pnpm-store/`): left as they are. They can be rebuilt.
- **`Ultimate-Theme/`:** outside this repository and outside consolidation scope, unless you say otherwise.
- **Local `main` at `9ea303df`:** updating it is part of any later change to the primary checkout, which stays immutable here.

## 4. Dependencies between decisions

1. CD-1 comes first, because CD-2, CD-3 and CD-4 remove or move copies.
2. CD-5 is independent.
3. CD-6 follows CD-2.
4. Every action after these decisions is a cleanup operation. It needs the explicit authorization you give through these answers, and it follows AGENTS.md §7.1.

## 5. Final cleanup, final state and open items (2026-10-19)

**Record preservation (decision A).**

- This record and the two full Spec Review reports for the documentation-hygiene Spec (`spec-review-r1.md`, `spec-review-r2.md`) are preserved at `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/Backups/ultimate-decision-records-2026-10-19/`.
- They were byte-verified, with a `SOURCES.md` and a SHA-256 `MANIFEST.sha256`. The folder is refreshed with this final version.
- The older 166-line copy in the CD-1 backup is superseded and left unchanged.

**Primary checkout** (authorized end-to-end cleanup).

- **Before:** branch `docs/gap-087-node-policy-spec` at `b45f9d5a`, with 8 status entries:
  - the `DECISIONS.md` edit;
  - the Phase 10 Spec and Plan amendment (S3);
  - the bounded-autonomy design copy;
  - the GAP-087 research copy, Spec draft and Plan draft;
  - the GAP-088 SSR Spec draft.
- **Preservation check:** all 8 were byte-identical to their CD-1 copies, and CD-1's `tracked-changes.patch` reverse-applied exactly. `b45f9d5a` is in the CD-1 bundle. No new backup was needed.
- **Cleanup:**
  - The 8 entries were moved into a temporary stash (`git stash push --include-untracked`).
  - The checkout was switched to `main`, and local `main` was fast-forwarded from `9ea303df` to `28871085` (`--ff-only`).
  - The stash's 8 files were re-verified as byte-identical to CD-1, then the stash (`4563c14b`) was dropped.
- **Result:** the primary checkout is on `main` at `28871085` with 0 status entries.
- **Unchanged:** the GAP-088 draft and the Phase 10 amendment (S3) are preserved in CD-1 only. The `docs/gap-087-node-policy-spec` branch (`b45f9d5a`, S3 variant of PR #15) is kept.

**Branches outside CD-6's original scope** (deleted on 2026-10-19 after re-checking each tip against `main` and the verified bundle).

- Deleted with `git branch -d`, each fully merged:
  - `docs/documentation-hygiene-suspended-work` (`c151bce2`)
  - `feat/w1-toolbar-pilot` (`4cfca5a8`)
  - `docs/w1-provenance-batch` (`29a7d4ea`)
  - `docs/gap-094-dr5-scope-options` (`efd677fd`)
  - `docs/gap-098-box-model-options` (`efd677fd`)
- Deleted with `git branch -D` (authorized): `feature/gap-094-production-provenance-scope` (`c2aaedfa`). It is superseded by PR #22 (merge `c9089b6b`) and preserved in the CD-1 bundle.

**Temporary items.**

- **Removed** after re-checking each one, with plain `rm` and `rmdir` on literal paths:
  - `…/Ultimate-Solutions-EGY/build-w2-b4.log` and `build-w2-b4.time`: a 2026-10-17 build log from the removed `ultimate-w2-b4-perf` worktree;
  - `ultimate/.claude/scheduled_tasks.lock`: stale, its process 82915 was not running;
  - the empty `ultimate/.claude/worktrees/` and `ultimate/.claude/`;
  - `ultimate/.playwright-mcp/`: one 2026-09-12 console log;
  - `ultimate/test-results/` and `ultimate/playwright-report/`: generated and ignored;
  - this session's copied CI logs and provenance outputs in the scratchpad.
- **Not removed (the session safety hook blocks recursive deletion of home and `/private/tmp` paths: `dcg` rule `core.filesystem:rm-rf-root-home`):**
  - the session scratchpad's scratch clones and extracted-source copies (about 480 MB under `/private/tmp/claude-501/…/5928c398…/scratchpad/`). They can be rebuilt from the CD-1 bundle and the vendor archives, and macOS clears them with `/private/tmp`.
  - The three CD-2 leftover folders in `~/.Trash`. Nothing in them is unique, and they go when the Trash is emptied.
- **Agent memory:** the stale "rejected U2 PNG in stash@{0} (keep)" entry now records the CD-4 drop and where the stash is preserved.
- **Correction to the read-only inventory:** `~/.claude-work/projects` is a symlink to `~/.claude/projects` (the same inodes). There is one copy of the session history and memory, not two.

**Historical `.superpowers/sdd/` (CD-3 follow-up): retained.**

- The CD-3 archive is verified.
- Removal is blocked for two reasons:
  1. removing a 3.0 GB directory needs a recursive delete, which the session safety hook blocks;
  2. committed documents on `main` cite 122 paths inside it (91 still existing), so local readers would lose those targets. Only the CD-3 archive and its `INDEX.md` would remain.
- Deleting it remains a user action, if wanted. The archive restores every cited path.

**Backups.**

- No separate volume is available: `/Volumes` holds only the internal disk and its system volumes, and `diskutil list external` lists nothing.
- All three backup folders are on the internal disk with the working copies:
  - `ultimate-consolidation-2026-10-19` (CD-1);
  - `ultimate-superpowers-history-2026-10-19` (CD-3);
  - `ultimate-decision-records-2026-10-19`.
- The same-disk risk remains.

**Final state.**

- **`main`:** `28871085` (origin and local).
- **Worktrees (8):**
  - `ultimate` (primary, `main`);
  - `ultimate-bounded-autonomous-execution` (S5);
  - `ultimate-ci-health-study` (S4);
  - `ultimate-w1-spec` (S1 ledger);
  - `ultimate-w2-a2a3` (S2 amendments and ledger);
  - `ultimate-w2-cli` (S2, PR #38);
  - `ultimate-w2-integrity` (S2, PR #37);
  - `ultimate-w2-menus` (S1).
- **Why the seven linked worktrees stay:** each holds deferred work or a required ledger. All their unique content is byte-identical in CD-1, and their commits are in the bundle.
- **Local branches (10):**
  - `main`;
  - `docs/bounded-autonomous-execution`;
  - `docs/ci-health-open-gap-study`;
  - `docs/gap-087-node-policy-spec`;
  - `docs/w2-amendment-a2-a3`;
  - `docs/workstream-1-component-completion-spec`;
  - `feat/w2-menus-navigation`;
  - `fix/phase-10-track-c-release`;
  - `fix/w2-b3-cli-remediation`;
  - `fix/w2-coverage-integrity-rows`.
  - Plus `docs/consolidation-decision-record`, which carries this record.
- **Remote branches (4):** `main`, `fix/phase-10-track-c-release` (PR #15), `fix/w2-b3-cli-remediation` (PR #38) and `fix/w2-coverage-integrity-rows` (PR #37).
- **Stash:** empty.

**Open items.**

1. Deferred work S1–S7 stays in its retained worktrees and branches. It is unchanged and not authorized to resume.
2. The GAP-088 draft and the Phase 10 amendment (S3) are preserved in CD-1 only. Whether either should ever be committed is a separate decision.
3. Optional user actions:
   - empty the Trash;
   - delete `.superpowers/sdd/` if wanted (archived);
   - make an off-disk copy of `Backups/`.
4. This record is committed on the local branch `docs/consolidation-decision-record`. Merging it into `main` needs a push, a PR and the user's merge authorization.

## 6. Initial checks run (read-only, 2026-10-19, before CD-1–CD-6 execution)

- **Refs:** `git fetch origin --prune`. This updated remote-tracking refs only; `origin/main` is `28871085`.
- **Worktrees and branches:** `git worktree list` (14 worktrees). `git stash list` (1 entry). For every local branch, ahead and behind counts and `git cherry` against `origin/main`.
- **Uncommitted files:** each one compared with `origin/main` by blob hash and line diff (`dirtycmp.py`). Each draft's differing line checked against `main`. The Phase 10 amendment's added lines checked line by line against `main`.
- **PR #22 and the gap-094 commit:** `gh pr view 22`; whether `c2aaedfa` is an ancestor of PR #22's head; whether `c9089b6b` is in `main`.
- **PR #15:** `gh pr view 15 --json files`; `git diff --stat 5cb9f0a3 b45f9d5a`.
- **`dsh-locale-pack/`:** `git -C dsh-locale-pack` (remote, branch, log, status, stash); `git ls-remote` of its origin (read-only); `git grep` on `main` for references; contents of `package.json`, `README.md` and `SUPPORTED_DSH.json`.
- **Caches:** the source of `scripts/provenance/fetch-vendor-cache.mjs`; the `.gitignore` entries; `du -sh` of the cache and workspace directories.
