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

## Commands

Run `ultimate --help` for this list, or `ultimate <command> --help` (or `-h`) for one command's arguments and exit codes. Help always exits 0.

| Usage                           | Arguments                                             | What it does                                                                      |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ultimate init`                 | none                                                  | Install the compatible Ultimate framework package and write ultimate.config.json. |
| `ultimate add <package>`        | `<package>`: the package name to install              | Install an Ultimate package into a compatible project.                            |
| `ultimate theme <preset>`       | `<preset>`: the preset name; v1 accepts only "aura"   | Install @ultimate/themes if needed and apply a theme preset.                      |
| `ultimate doctor`               | none                                                  | Report the detected framework, compatibility and installed components.            |
| `ultimate generate <component>` | `<component>`: a known component name, such as Button | Print a usage snippet for a known component to stdout. Writes no file.            |
| `ultimate ai`                   | none                                                  | Stub (EX-2): prints an unavailable message. Not an implemented command.           |

Documented exceptions, not implemented commands:

- `create` (EX-1): not implemented. Create the project with the framework's own tooling, then run `ultimate init`. `ultimate create` is an unknown command and exits 1.
- `ai` (EX-2): a stub. It prints an unavailable message and always exits 1.

### Exit codes

Every exit path of the `ultimate` bin. The table matches `EXIT_CODES` in `src/help.ts`, and `test/help.test.ts` fails if they disagree. "package-manager exit code" means the non-zero exit code of the `npm`, `pnpm` or `yarn` install that the command ran, passed through unchanged.

| Command    | Exit code                 | Meaning                                                               |
| ---------- | ------------------------- | --------------------------------------------------------------------- |
| `ultimate` | 0                         | --help or -h: help printed                                            |
| `ultimate` | 1                         | no command given: usage printed                                       |
| `ultimate` | 1                         | unknown command (including create, EX-1): usage printed               |
| `ultimate` | 1                         | unexpected error, such as a package manager that cannot be started    |
| `init`     | 0                         | framework package installed and ultimate.config.json written          |
| `init`     | 1                         | refused: no Angular, React or Vue dependency in package.json          |
| `init`     | 1                         | refused: the framework version has no compatible Ultimate package     |
| `init`     | package-manager exit code | the package-manager install failed; its exit code is passed through   |
| `init`     | 0                         | --help or -h: help printed                                            |
| `add`      | 0                         | package installed                                                     |
| `add`      | 1                         | missing argument: no package name given                               |
| `add`      | 1                         | refused: no Angular, React or Vue dependency in package.json          |
| `add`      | 1                         | refused: the framework version has no compatible Ultimate package     |
| `add`      | package-manager exit code | the package-manager install failed; its exit code is passed through   |
| `add`      | 0                         | --help or -h: help printed                                            |
| `theme`    | 0                         | preset applied, ultimate.config.json and the theme entry file written |
| `theme`    | 1                         | missing argument: no preset name given                                |
| `theme`    | 1                         | refused: unknown preset (v1 accepts only aura)                        |
| `theme`    | 1                         | refused: no Angular, React or Vue dependency in package.json          |
| `theme`    | 1                         | refused: the framework version has no compatible Ultimate package     |
| `theme`    | package-manager exit code | the package-manager install failed; its exit code is passed through   |
| `theme`    | 0                         | --help or -h: help printed                                            |
| `doctor`   | 0                         | report printed for a detected framework, compatible or incompatible   |
| `doctor`   | 1                         | report printed: no supported framework detected                       |
| `doctor`   | 0                         | --help or -h: help printed                                            |
| `generate` | 0                         | snippet printed to stdout                                             |
| `generate` | 1                         | missing argument: no component name given                             |
| `generate` | 1                         | refused: no Angular, React or Vue dependency in package.json          |
| `generate` | 1                         | refused: unknown component name                                       |
| `generate` | 0                         | --help or -h: help printed                                            |
| `ai`       | 1                         | always: stub, Phase 9 (AI Skills) not started (EX-2)                  |
| `ai`       | 0                         | --help or -h: help printed                                            |

## Scope

See `docs/superpowers/specs/2026-09-07-phase-7-cli-design.md` for the v1 contract.
