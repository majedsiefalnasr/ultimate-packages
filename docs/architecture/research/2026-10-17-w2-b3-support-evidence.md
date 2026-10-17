# W2-B3 support evidence: framework ranges and CLI

Date: 2026-10-17
Scope: Workstream 2, Spec B3-R1/B3-R2. Base: `origin/main` f5a0f138.
Status: point-in-time evidence snapshot. No range was changed except Angular (see Conclusion).

## Framework ranges

Sources: `docs/architecture/compatibility-manifest.json`, `packages/{ng,react,vue}/package.json` `peerDependencies`, `pnpm-lock.yaml`, and `CONSUMERS` in `scripts/provenance/installed-cli-mcp-smoke.mjs`.

| Framework | Declared range (manifest / peer)                                                       | Floor   | Versions installed in lockfile                                | Versions installed by smoke                                                                 | Status                                                                                                                                                                                                                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | `^21.2.22` / `^21.2.22` (`@angular/core` in `@ultimate/ng`)                            | 21.2.22 | `@angular/core` 21.2.25                                       | `^21.2.22` (resolves at install time to the newest 21.x; the exact version is not recorded) | Manifest equals peer after this change (CI-enforced by `compatibility-manifest:validate`). Floor 21.2.22 declared, not pinned: the lockfile has 21.2.25 and the smoke resolves a caret range. The MCP smoke asks the manifest about the string `21.2.22`, which does not install that version. Declared, unverified at the exact floor |
| React     | `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` / same (`react`, `react-dom` in `@ultimate/react`) | 17.0.0  | `react` 18.3.1, `react-dom` 18.3.1                            | `^18.3.1` (18.3.1; MCP asked about `18.3.1`)                                                | Equal. 18 is installed and exercised. 17 and 19 are declared, unverified: no lockfile entry, no smoke consumer                                                                                                                                                                                                                         |
| Vue       | `^3.5.2` / `^3.5.2` (`vue` in `@ultimate/vue`)                                         | 3.5.2   | `vue` 3.5.42 (the `@ultimate/vue` devDependency is `^3.5.13`) | `^3.5.13` (MCP asked about `3.5.13`)                                                        | Equal. 3.5.2 is the ADR-050 floor, declared but never installed by CI: the lockfile has 3.5.42 and the smoke consumer asks for `^3.5.13`. Declared, unverified at the floor                                                                                                                                                            |

Notes:

- The manifest-versus-peer equality is now enforced by `findPeerRangeMismatches` (`docs/architecture/compatibility-peer-ranges.mjs`), run by `docs/architecture/compatibility-manifest.test.mjs` through `pnpm run compatibility-manifest:validate`.
- That check compares strings only. It does not prove that any floor version installs or works.
- PrimeNG 21.1.9 declares `^21.0.7`, which is lower than the published Ultimate peer. The manifest and `COMPATIBILITY.md` do not claim it.

## Conclusion

- B3-R1: the Angular manifest range was `^21.0.7`, below the published peer range `^21.2.22`. It is now `^21.2.22`. CLI and MCP report Angular 21.2.21 as incompatible.
- React `^17 || ^18 || ^19` and Vue `^3.5.2` already equal their peer ranges. No range was changed (Spec B3-R1).
- Floors that CI never installs are recorded as declared, unverified: React 17 and 19, Vue 3.5.2 to 3.5.12, and Angular 21.2.22 to 21.2.24 (lockfile 21.2.25).
- CLI behaviour note: `satisfiesCaretRange` parses only the leading `x.y.z`, so `21.2.22-rc.0` matches `^21.2.22`. Strict semver orders a prerelease below its release. This is pinned as existing behaviour in `packages/cli/test/compatibility.test.ts` and is not changed here.

<!-- Task 5 appends a "CLI evidence" section below this line. -->
