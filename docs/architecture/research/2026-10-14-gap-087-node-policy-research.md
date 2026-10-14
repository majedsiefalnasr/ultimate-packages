# GAP-087 — Node.js workspace and release policy research (2026-10-14)

**Status:** Research and verification record for the authorized GAP-087 decision gate. This record makes no release-workflow or package change and does not close GAP-087 or C01.

**Evidence baseline:** Remote `main` at `9ea303df0b27ab69487449bf32577e223cd8bbb0`, verified through the GitHub branch API and fetched as `origin/main` on 2026-10-14. The primary checkout remained at `a16719d99b45d230501da5dd0054ca197020d780` (11 commits behind) with unrelated untracked files untouched. All source facts below were checked against `origin/main` unless identified as remote run output.

## Question and governing decisions

GAP-087 asks for a Node.js policy that lets the complete workspace install under pnpm's strict engine check and keeps local development, CI, and all Release jobs consistent. `DECISIONS.md` through ADR-058 has no Node support-policy ADR. The Phase 10 release specification and plan govern release mode, authentication, and gating, but do not decide a supported Node range. Older specifications' Node 20 or `>=20.0.0` statements describe their point-in-time baselines; they are superseded as current facts by the locked dependency graph and remote run. No protected decision in `BLUEPRINT_GAPS.md` §5 governs this Node choice.

## Verified evidence

- [CI run 38531782178](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38531782178) ran on `main` at `9ea303df`. At the 08:12 UTC refresh, the overall run was still `in_progress`. The root `ci` job had completed **failure** in Coverage regression check, Provenance scripts self-tests, and Provenance validation; its `Install dependencies` step passed with Node `24.15.0`. All three SSR jobs and the React browser job had passed. Angular and Vue browser jobs were still running, and Vue's G3-B verification step had failed. No whole-CI success is claimed.
- [Release run 38531782252](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38531782252) at the same commit completed **failure**. Select mode failed at Install dependencies; Version and Publish were skipped. Its log reports `ERR_PNPM_UNSUPPORTED_ENGINE` for `@angular-devkit/architect@0.2201.7(chokidar@5.0.0)`: expected Node `^22.22.3 || ^24.15.0 || >=26.0.0`, got `v20.20.2`. Lockfile resolution had already been skipped as up to date.
- `.github/workflows/release.yml` sets `node-version: "20"` and runs `pnpm install --frozen-lockfile` in Select mode, Version, and Publish. All three jobs would encounter the same incompatible environment if reached.
- `.github/workflows/ci.yml` pins `node-version: "24.15.0"` in its root, browser, and SSR jobs. The root job's frozen install passed in the cited run.
- Root `package.json` is private, pins `packageManager: "pnpm@9.6.0"`, and declares `engines.node: ">=20.0.0"`. `.npmrc` sets `engine-strict=true`. No tracked `.nvmrc`, `.node-version`, `.tool-versions`, or `mise.toml` exists.
- `pnpm-lock.yaml` records `@angular-devkit/architect@0.2201.7` and other locked Angular 22.1.7 devkit packages requiring `^22.22.3 || ^24.15.0 || >=26.0.0`. The workspace also contains Angular 21.2.25 tooling. The actual failed package is the locked devkit 22 package, so GAP-087's older “Angular 21 toolchain” title is not an exact description of this run.
- The root is the only tracked `package.json` declaring `engines.node`. It is a private workspace/tooling declaration, not a demonstrated consumer runtime guarantee for each published package.

The direct failure is Node 20 versus a locked dependency's Node range under strict engine checking. It is not a lockfile drift, pnpm-version mismatch, release-mode choice, or publish authentication failure. Version and Publish have not executed; their later behavior is unverified.

## Compatibility implications and options

`>=20.0.0` admits Node 20 and 23 (and Node 25), although the cited devkit range rejects those majors; it also admits early Node 22 and 24 patches below the stated floors. With `engine-strict=true`, the declaration therefore tells local developers a workspace install is supported where pnpm can reject it. Merely changing Release to Node 24 would unblock this specific engine mismatch but leave that false local-development contract.

- **Node 24 from 24.15.0, pinned to 24.15.0 in CI and Release (recommended):** Matches the exercised CI install and gives local development and automation one version family. Root `^24.15.0` expresses the range. It excludes Node 22 and 26 despite the cited Angular packages allowing them. Only 24.15.0 is directly verified here.
- **Mirror Angular's multi-major union:** Allows more developer versions, but CI exercises only 24.15.0. The open-ended 26+ arm would advertise future workspace compatibility that has not been verified against the rest of the lockfile.
- **Change Release to 24.15.0 and retain root `>=20.0.0`:** The smallest workflow edit, but it leaves a demonstrably false strict-install policy for local development.

**Decision supported by evidence:** Adopt the first option for the **private workspace toolchain**: Node 24 with floor 24.15.0, expressed in the root engine range as `^24.15.0`; pin the executed baseline at `24.15.0` in CI and each Release job. Local development guidance should identify the same baseline and root range. This does not decide or narrow any published package's consumer Node support; that needs package-specific evidence and its own gate if required. Keep pnpm at the existing `9.6.0` pin. Do not relax engine checking or add a CI exception.

## Verification limit and next gate

The successful CI install on Node 24.15.0 verifies this workspace/lockfile combination at that commit and moment, not the entire CI run, a successful release, or all future Node 24 patches. After this decision, the next gate is a bounded GAP-087 **Specification**, followed by Spec Review, Implementation Plan, Plan Review, implementation, and verification. That work should align the root engine declaration and all three Release jobs, then prove a frozen install and the reached release-mode path on the same commit. GAP-087 remains open; C01 remains incomplete; no CI exception is warranted by this research.
