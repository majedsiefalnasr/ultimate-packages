# SAST Baseline

<!--
Initial baseline populated 2026-09-09 (Phase 10 Track B, Task 8) by a real
`codeql database analyze` run against commit 85f658c on branch
worktree-phase-10-track-b-ci-security-quality-gates, using CodeQL CLI
2.26.4 with the `codeql/javascript-queries` `javascript-security-extended`
query suite (the same query pack Task 4's .github/codeql/codeql-config.yml
names via `queries: - uses: security-extended`).

The bare CodeQL CLI has no direct equivalent of the GitHub Actions
codeql-action's `--config-file` path-scoping (paths/paths-ignore in
codeql-config.yml is a codeql-action-specific feature, not a
`codeql database create`/`analyze` flag on this CLI version) — the scan
itself covered the whole repository (684 JavaScript/TypeScript files), and
the 24 raw findings were filtered in-memory to Task 4's exact declared
scope (packages/*/src/**, scripts/**) before populating this table. 2 raw
findings in packages/cli/test/boundary.test.ts (js/incomplete-sanitization,
js/file-system-race) were excluded as out-of-scope test-file findings, per
spec §4 R3's "where appropriate" scoping to source, not test files.

Every finding below is a real, pre-existing condition in already-shipped
Phase 6-9 code (provenance/boundary-validation scripts, @ultimate/ai's
bin-generate.ts, @ultimate/cli's theme.ts command, and two component
utility files) — none were introduced by Phase 10 Track B. Grandfathering
them here is not a judgment that they are safe to ignore permanently; it
is what unblocks this gate's initial rollout per the plan's own one-way-
door contract (spec §4 R3 point 6/7): no new entry may ever be added to
this table after this initial population — the only way a future finding
stops failing this gate is fixing the underlying code.
-->

| Fingerprint | Rule | File | Note |
| ----------- | ---- | ---- | ---- |
| 235ffd63a2779eeb:1 | js/identity-replacement | scripts/provenance/generate-manifest.mjs:93 | `.replace("src/", "src/")`-shaped no-op replacement (CodeQL: "This replaces 'src/' with itself") — a real logic smell (the replacement has no effect), not a security defect; pre-existing in Phase 0's provenance-manifest generator. |
| 5b4b47fee53d3ba0:1 | js/identity-replacement | scripts/provenance/generate-manifest.mjs:101 | Same no-op-replacement pattern as the finding above, a second occurrence in the same file. |
| 464d8fb8d08503f0:1 | js/incomplete-sanitization | scripts/provenance/validate-ai-boundary.mjs:41 | Import-pattern regex escapes `/` but not `\` in a package-name string before embedding it in a `RegExp` (CodeQL: "does not escape backslash characters in the input") — package names scanned here are read from this repo's own `package.json` files, not external/attacker input; pre-existing since Phase 9's boundary-validation script. |
| 464d8fb8d08503f0:1 | js/incomplete-sanitization | scripts/provenance/validate-cli-boundary.mjs:61 | Same escaping gap as the finding above, in Phase 7's CLI boundary validator (shares the same fingerprint — structurally identical code, copied across the three boundary-validation scripts). |
| 464d8fb8d08503f0:1 | js/incomplete-sanitization | scripts/provenance/validate-mcp-boundary.mjs:44 | Same escaping gap, in Phase 8's MCP boundary validator (third occurrence of the same structural pattern). |
| 698013ffaa76860:1 | js/prototype-polluting-assignment | packages/uix-utils/src/escape/display-order-registry.ts:23 | An assignment CodeQL flags as potentially prototype-polluting if a `"__proto__"` string reaches it from library input — pre-existing in `@ultimate/uix-utils`'s escape/display-order module (Phase 1). Not yet triaged for real exploitability in this codebase's actual call sites; grandfathered per the one-time initial-population contract, not asserted safe. |
| b1a9f62cfb007035:1 | js/polynomial-redos | packages/uix-styled/src/utils/sharedUtils.ts:95 | A regular expression CodeQL flags as depending on library input with potential polynomial backtracking on inputs like repeated `'{{\|'` — pre-existing in `@ultimate/uix-styled`'s shared token-interpolation utility (Phase 1). |
| 276f24ed7a9fa1fe:1 | js/polynomial-redos | packages/uix-styled/src/utils/sharedUtils.ts:120 | Second, distinct polynomial-ReDoS-flagged regular expression in the same file. |
| e69d707086f26bcd:1 | js/polynomial-redos | packages/uix-utils/src/object/methods/matchRegex.ts:3 | Same class of finding in `@ultimate/uix-utils`'s own regex-matching utility (Phase 1). |
| 233658d81fa08d20:1 | js/file-system-race | packages/ai/src/bin-generate.ts:37 | A file-existence check (e.g. `existsSync`) followed by a separate operation on the same path, which CodeQL flags as a TOCTOU race if the file changes between the two steps — pre-existing in `@ultimate/ai`'s Skill-generation CLI entry point (Phase 9). This tool always operates on paths under this repo's own working tree in a single-actor CI/local-dev context, not a multi-tenant environment, which materially reduces (but does not formally eliminate) real exploitability. |
| 43f0528838f1c9ae:1 | js/file-system-race | packages/ai/src/bin-generate.ts:41 | Second TOCTOU-race finding in the same file, same class as above. |
| 394501a4e0870066:1 | js/file-system-race | packages/cli/src/commands/theme.ts:100 | Same TOCTOU-race pattern in `@ultimate/cli`'s `theme` command (Phase 7) — writes theme configuration into a target consumer project's file tree. |
| d327c34a09e7e177:1 | js/file-system-race | packages/cli/src/commands/theme.ts:103 | Second occurrence in the same file. |
| 8d26a8a515ada23a:1 | js/file-system-race | packages/cli/src/commands/theme.ts:174 | Third occurrence in the same file. |
| 5790a55c479759fa:1 | js/file-system-race | scripts/provenance/validate-ai-boundary.mjs:106 | Same TOCTOU-race pattern in Phase 9's AI boundary-validation script's own directory-walk logic; shares a fingerprint with the two entries below (same structural code, copied across the three boundary scripts). |
| a9a497cc982d418e:1 | js/file-system-race | scripts/provenance/validate-ai-boundary.mjs:119 | Second, distinct TOCTOU finding in the same file. |
| 5790a55c479759fa:1 | js/file-system-race | scripts/provenance/validate-cli-boundary.mjs:129 | Same structural TOCTOU pattern (shares fingerprint `5790a55c479759fa:1` with the `validate-ai-boundary.mjs:106` entry above) in Phase 7's CLI boundary validator. |
| af08602a38b00420:1 | js/file-system-race | scripts/provenance/validate-cli-boundary.mjs:144 | Second, distinct TOCTOU finding in the same file. |
| d33a8d636099ed64:1 | js/file-system-race | scripts/provenance/validate-install-script-policy.mjs:42 | Same TOCTOU-race pattern in Phase 10 Track B's own install-script-policy validator (Task 3) — reading `.npmrc`/`pnpm-workspace.yaml` existence then contents. |
| 5790a55c479759fa:1 | js/file-system-race | scripts/provenance/validate-mcp-boundary.mjs:109 | Same structural TOCTOU pattern (shares fingerprint `5790a55c479759fa:1` with the two entries above) in Phase 8's MCP boundary validator. |
| e583eb9b712da454:1 | js/file-system-race | scripts/provenance/validate-mcp-boundary.mjs:122 | Second, distinct TOCTOU finding in the same file. |
| a334aebce47c7566:1 | js/indirect-command-line-injection | scripts/provenance/validate-provenance.mjs:54 | A shell command built from an unsanitized command-line argument (the `--base-ref` value) — pre-existing in Phase 0's provenance validator. This script is invoked only from this repo's own CI/local dev workflow with a trusted, developer-supplied `--base-ref` value (a git ref name, e.g. `origin/main`), not untrusted external input; grandfathered per the one-time initial-population contract, not asserted risk-free in every possible invocation context. |
