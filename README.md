# Ultimate Platform

A company-owned, multi-framework UI platform derived from selected MIT-licensed Prime ecosystem source baselines. Targets Angular, React, and Vue, with an architecture that remains extensible to additional frameworks.

See `docs/architecture/BLUEPRINT.md` for the full architecture baseline, and `docs/architecture/` for provenance, dependency, compatibility, and decision records.

## Status

**Phase 0 — Repository Foundation, Provenance & Baseline Verification.** No component source has been migrated yet. See `docs/architecture/ROADMAP.md` for the full phase plan.

## Repository structure

```text
packages/   Ultimate framework and shared infrastructure packages
apps/       Documentation site, showcase, and framework playgrounds
skills/     AI-operational guidance (Phase 9+)
tooling/    Shared build/lint/test tooling
scripts/    Provenance and validation scripts
docs/       Architecture records, specs, and implementation plans
```

## Development

This is a pnpm workspace monorepo.

```bash
pnpm install
pnpm run lint
pnpm run format:check
pnpm run build
pnpm run test
```

## Provenance

Every Prime-derived source area incorporated into this repository is recorded in `docs/architecture/PROVENANCE.md`, including exact source version, commit SHA (or tarball integrity hash where no public commit exists), original license, and copyright holder. See that file before incorporating any new Prime-derived source.

## License

Ultimate-authored code is licensed under the terms in `LICENSE`. Prime-derived source areas retain their original MIT license and copyright notice — see the `THIRD-PARTY-NOTICES.md` file in each package that incorporates such source.
