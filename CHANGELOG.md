# Changelog

All notable changes to this project will be documented in this file.

This changelog is maintained according to the [Keep a Changelog](https://keepachangelog.com/) format. The categories listed below represent a manual, human-facing readability convention applied to organize and present changes to end users.

## Changesets Integration

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelog updates. The configuration in `.changeset/config.json` specifies `@changesets/cli/changelog` as the changelog generator, which resolves to (re-exports) `@changesets/changelog-git`.

**Important:** The five Keep-a-Changelog categories (`Added`, `Changed`, `Fixed`, `Removed`, `Security`) documented in this file represent a manual, human-facing organizational layer. This is **NOT the output shape** of the installed `@changesets/changelog-git` generator, which emits flat per-changeset bullet lines with no category grouping.

Reconciling the manual Keep-a-Changelog category convention with the generator's actual flat-bullet output — whether through manual curation after release, swapping to a different changelog generator (e.g., `@changesets/changelog-github`), or writing a custom changelog function — is a design decision owned by **Track C** of the Phase 10 initiative and is explicitly out of scope for this Task.

## Categories (Manual Convention)

When entries are released, they will be organized into the following categories:

- **Added** — New features and capabilities
- **Changed** — Changes to existing functionality
- **Fixed** — Bug fixes and corrections
- **Removed** — Removed features and deprecated APIs
- **Security** — Security fixes and advisories

## [Unreleased]

No unreleased changes yet.

---

**Ownership note:** Entries below the `## [Unreleased]` section header are populated exclusively by the Changesets release flow (implemented in Phase 10 Track C) once it is active. Changelog entries must never be added or edited manually outside the Changesets-driven release automation workflow.
