# @ultimate/cli

Command-line orchestrator for adding Ultimate packages to an existing Angular, React or Vue project (Phase 7).

## Status

Unstable (pre-1.0). No semver guarantee yet.

v1 commands: `init`, `add <package>`, `theme <preset>`, `doctor`, `generate <component>`. `ai` is a stub that prints an unavailable message and exits non-zero. `create`, `migrate` and `update` are not implemented. The compatibility manifest ships inside the package (`dist/compatibility-manifest.json`).

## Usage

```bash
npx @ultimate/cli <command> [args]
```

Run it from the root of an existing project; `init` does not scaffold a new project.

## Scope

See `docs/superpowers/specs/2026-09-07-phase-7-cli-design.md` for the v1 contract.
