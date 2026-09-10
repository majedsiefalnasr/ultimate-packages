# Migration Strategy

## 1. Purpose

This document is the migration-strategy artifact satisfying Blueprint §35/§40's "migration strategy" objective. Migration between `@ultimate/*` package versions is, by design, a **documentation-only strategy**: a manual process a consumer follows by reading release notes and applying the changes described there. No automated migration tooling exists or is planned as part of this strategy.

## 2. How to migrate between Ultimate versions

To migrate a project from one `@ultimate/*` package version to another:

1. Identify the version range being crossed (current installed version → target version).
2. Read the relevant section(s) of the root [`CHANGELOG.md`](../../CHANGELOG.md) covering every version in that range.
3. Apply any breaking-change notes called out by a `major`-bump changeset entry for those versions. Breaking changes are expected only on major-version bumps once the packages are at `1.0.0` or above (see the SemVer caveat below for the pre-`1.0.0` exception).
4. Re-run the project's build and test suite after updating, since changelog entries describe intent but do not substitute for local verification.

This process is manual today because no `@ultimate/*` package has ever had a real release: every one of the 17 packages in `packages/*/package.json` is still at its initial `0.1.0` version, verified directly from the workspace package manifests. Until a first real version bump ships, there is no version-to-version migration history to walk through — this section describes the process that will apply once releases begin, not a record of past migrations.

## 3. Pre-`1.0.0` SemVer caveat

Every `@ultimate/*` package is currently pre-`1.0.0`. Per SemVer's own specification, minor (and even patch) releases below `1.0.0` may introduce breaking changes; the normal "minor version bumps are backward-compatible, only major bumps break" guarantee does not apply yet. Consumers installing any `@ultimate/*` package at a `0.x.y` version should treat every version bump — not just major bumps — as a potential breaking change until the corresponding package reaches `1.0.0`, and should always read the changelog before upgrading.

## 4. Relationship to `compatibility-manifest.json` and `COMPATIBILITY.md`

This document covers a different concern from [`docs/architecture/compatibility-manifest.json`](./compatibility-manifest.json) and [`docs/architecture/COMPATIBILITY.md`](./COMPATIBILITY.md). Those two files track _framework-version_ compatibility: which Angular, React, and Vue versions (and, in `COMPATIBILITY.md`'s case, which underlying third-party library baselines) each `@ultimate/*` package currently supports. This document, by contrast, covers _Ultimate-version-to-Ultimate-version_ migration: how a consumer moves their project from one released version of an `@ultimate/*` package to a later one. Framework-support ranges and Ultimate-version migration are tracked separately and should not be conflated; consult `compatibility-manifest.json`/`COMPATIBILITY.md` for framework-version support, and this document for upgrade guidance between Ultimate's own releases.

## 5. CLI migration-tooling non-goals

`@ultimate/cli create`, `@ultimate/cli migrate`, and `@ultimate/cli update` commands do not exist in this repository and are explicitly out of scope. The CLI package currently ships only `init`, `add`, and `ai` commands. No automated codemod, migration script, or migration CLI command is planned as part of this document or this migration strategy — migration is, and is intended to remain, a manual process driven by reading `CHANGELOG.md` and applying its notes by hand.

## 6. Initial state

This document's initial version is a template/contract, not a historical record. No per-version migration-guide entries are fabricated here, since no `@ultimate/*` package has ever shipped a real version — all 17 remain at `0.1.0`. Real, version-specific migration-guide entries will be added to this document only as real breaking-change releases actually occur, mirroring the same discipline already applied to `CHANGELOG.md`'s `[Unreleased]`-only state.
