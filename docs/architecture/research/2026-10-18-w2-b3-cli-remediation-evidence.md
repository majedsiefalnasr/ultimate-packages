# W2-B3 CLI remediation evidence (CLI-1, CLI-5, CLI-6)

**Date:** 2026-10-18
**Scope:** Workstream 2 Task 6R (Plan Amendment A1, Spec W2-B3-R4). Branch `fix/w2-b3-cli-remediation`, from `origin/main` f5a0f138.
**Evidence map:** the Task 5 research record `docs/architecture/research/2026-10-17-w2-b3-support-evidence.md`, section "CLI evidence (ADR-058 CLI-1 to CLI-6)", on branch `fix/w2-b3-support-cli-evidence` (PR #34). That record is not on `main` and is not edited here. This note updates its CLI-1, CLI-5 and CLI-6 rows.

EX-1 (`create`) and EX-2 (the `ai` stub) are unchanged. No existing exit code changed. Evidence labels follow AGENTS.md §4.

## Updated rows

| Bar   | Task 5 status                                 | Evidence now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Status                         |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| CLI-1 | Missing (parts a-d)                           | (a) `packages/cli/test/commands/doctor.test.ts:102` asserts exit 0 for a compatible framework; `:116` asserts exit 0 for a detected but incompatible framework and asserts each `incompatible (<reason>)` report row (`doctor.ts:157-158`, `:174-180`); `:139` asserts exit 1 and the message when no framework is detected (`doctor.ts:111-117`). (b) `test/commands/add.test.ts:94` asserts the no-framework refusal, exit 1 and its message, with no install (`add.ts:81-87`). (c) `test/commands/theme.test.ts:164` does the same for `theme` (`theme.ts:122-128`). (d) The exits are documented in `EXIT_CODES` (`packages/cli/src/help.ts:40`), in `--help` and in the README "Exit codes" table (`packages/cli/README.md:37`); see CLI-6. The tests pin existing behaviour: they passed on first run, and a temporary mutation of each pinned exit code made all five fail. Run by the CI `Test` step. | Met (Implemented, CI-enforced) |
| CLI-6 | Missing (no `--help`; no exit codes; no test) | `ultimate --help`/`-h` and `ultimate <command> --help`/`-h` print help and exit 0 (`packages/cli/src/cli.ts:48-58`). Help is rendered from `EXIT_CODES` and `COMMAND_USAGE` (`src/help.ts:40`, `:93`, `renderHelp` `:153`). The README "Commands" section (`README.md:19`) lists every command, its arguments and its exit codes, and shows EX-1 and EX-2 as documented exceptions. `packages/cli/test/help.test.ts` asserts every command and every `EXIT_CODES` row appear in the help output (`:43`, `:62`) and in the README tables (`:76`, `:82`, `:90`, which also fails on an extra README row), that help exits 0 globally and per command for both flags (`:100-127`), and that the missing- and unknown-command paths keep exit 1 with the usage text (`:129`, `:138`). Run by the CI `Test` step.                                                                                                  | Met (Implemented, CI-enforced) |
| CLI-5 | Missing (npm smoke absent)                    | Not implemented: blocked by the Task 6R stop rule. The npm OQ-2 probe fails (below). No CLI-5 change is committed. The installed-package smoke stays pnpm only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Missing (blocked)              |

## `EXIT_CODES` sources

Every row was read from the code, not assumed.

| Command    | Code                      | Meaning (short)                                                                       | Source                                                                                            |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ultimate` | 0                         | `--help` / `-h`                                                                       | `cli.ts:48-58` (new)                                                                              |
| `ultimate` | 1                         | no command: usage                                                                     | `cli.ts:43-46`                                                                                    |
| `ultimate` | 1                         | unknown command, including `create` (EX-1): usage                                     | `cli.ts` `default` branch                                                                         |
| `ultimate` | 1                         | unexpected error (e.g. package manager cannot start)                                  | `install-package.ts:41` rejects; `bin.ts:3` top-level await; Node exits 1 (Verified)              |
| `init`     | 0 / 1 / 1 / pass-through  | success / no framework / incompatible / install failed                                | `init.ts:148-149`, `:95-96`, `:119-120`, `:129-131`                                               |
| `add`      | 0 / 1 / 1 / 1 / pass-thr. | success / missing arg / no framework / incompatible / install failed                  | `add.ts:119-120`, `cli.ts` `add` case, `add.ts:81-82`, `:104-105`, `:112-114`                     |
| `theme`    | 0 / 1 / 1 / 1 / 1 / p-t   | success / missing arg / unknown preset / no framework / incompatible / install failed | `theme.ts:174-175`, `cli.ts` `theme` case, `theme.ts:113-114`, `:122-123`, `:142-143`, `:152-154` |
| `doctor`   | 0 / 1                     | framework detected (compatible or not) / none detected                                | `doctor.ts:157-158`, `:111-112`                                                                   |
| `generate` | 0 / 1 / 1 / 1             | snippet / missing arg / no framework / unknown component                              | `generate.ts:100`, `cli.ts` `generate` case, `generate.ts:90`, `:96`                              |
| `ai`       | 1                         | always (EX-2 stub)                                                                    | `ai.ts:17-19`                                                                                     |

Every command also exits 0 for `<command> --help` / `-h`. The unexpected-error row was Verified once: in a React project with `yarn.lock` and no `yarn` on `PATH`, `ultimate add left-pad` exited 1.

## CLI-5: npm OQ-2 probe (stop rule)

Probe, run once on 2026-10-18 (Node 24.15.0, npm 11.13.0, macOS): the smoke's own `packSmokeMembers` packed every smoke member. A React consumer was written with `react`/`react-dom` `^18.3.1`, `@ultimate/cli` and `@ultimate/mcp` as `file:` tarball dependencies, and a top-level `overrides` map from every packed `@ultimate/*` name to its `file:` tarball (npm ignores `pnpm.overrides`).

```text
$ npm install --no-audit --no-fund                      -> exit 0  (added 104 packages; package-lock.json written)
$ npm install @ultimate/uix-utils --no-audit --no-fund  -> exit 1
npm error code EOVERRIDE
npm error Override for @ultimate/uix-utils@* conflicts with direct dependency
```

`node_modules/@ultimate/uix-utils` was not installed and `package-lock.json` has no entry for it. `npm view @ultimate/uix-utils` and `npm view @ultimate/react` return 404, so there is no registry fallback either. npm refuses an override for a package that the same command adds as a direct dependency. The CLI's install form is `npm install <bare name>` (`install-package.ts`), used by `init`, `add` and `theme`, so an npm consumer cannot install unpublished `@ultimate/*` packages through `overrides`.

Result: npm cannot resolve bare `@ultimate/*` names offline through `overrides` to the local tarballs. Under the Task 6R stop rule, no workaround was added and nothing was committed for CLI-5. CLI-5 needs a Plan amendment.

## Other verification (Verified, 2026-10-18)

- `pnpm --filter @ultimate/cli test`: 14 files, 106 tests passed (72 before this branch).
- `pnpm --filter @ultimate/cli run test:coverage`: `total.lines.pct` 86.33 before, 92.01 after. The `cli` row in `docs/architecture/PERFORMANCE.md` is 86.9.
- `pnpm run build && pnpm run smoke:installed`: pnpm only, all checks PASS for Angular, React and Vue plus MCP.
- `pnpm run provenance:validate -- --base-ref origin/main`: diff check passed; 646 manifest problems, unchanged. `packages/cli` is outside ADR-061's watched prefixes, so no `PROVENANCE.md` change.
- CI comparison with `main`: pending.
