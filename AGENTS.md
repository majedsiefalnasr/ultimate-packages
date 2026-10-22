# AGENTS.md — Repository Orientation

**Purpose:** a small, stable map for any AI agent (or human) starting work in this repository — what Ultimate is, where to find authoritative current state, and how to operate safely here. This file is deliberately narrow. It does not track current phase status, open gaps, or architectural decisions — it points to where those live and stays correct precisely because it never restates them.

---

## 1. What Ultimate is

Ultimate is a company-owned, multi-framework UI platform derived from selected MIT-licensed Prime ecosystem source baselines. It targets Angular, React, and Vue, with an architecture that remains extensible to additional frameworks. Ultimate owns the resulting source, public API, package architecture, tooling, metadata, and AI integration — there is no required runtime dependency on PrimeNG, PrimeVue, PrimeReact, or PrimeUIX packages. See `docs/architecture/BLUEPRINT.md` §1 for the full statement.

---

## 2. Source-of-truth hierarchy

When two sources disagree, resolve toward the higher-authority tier as the actual fact, then correct whichever lower-authority document was stale — never assume a lower-authority source is right just because it looks more specific or more recently edited.

1. **Real repository evidence** — actual source code, actual test results, actual CI output, actual git history. Wins every disagreement, always.
2. **`docs/architecture/BLUEPRINT.md`** — architectural intent and governance.
3. **`docs/architecture/DECISIONS.md`** (ADRs) — binding architectural decisions within the Blueprint's scope.
4. **Current-state documents** (`docs/architecture/COMPONENT_INVENTORY.md`, `PERFORMANCE.md`, `PARITY_PLAYBOOK.md`) — the layer most likely to be stale relative to reality. Re-verify against real evidence before relying on one for a consequential decision.
5. **`README.md`** and other general/onboarding documentation — descriptive, not authoritative for current project state.
6. **AI context files / Skills / `llms.txt` / MCP tool responses** — one-directional consumers of tiers 2-4. Never authoritative for anything upstream of themselves. Within this tier, freshness guarantees differ: MCP tool responses read `@ultimate/component-metadata` live at request time; `llms.txt`/`llms-full.txt`/generated Skill sections are static committed snapshots, no fresher than their last commit date.

---

## 3. Verification model

These four claims are distinct — name which one applies, don't say "done" or "working" ambiguously:

- **Implemented** — the code exists. Confirmed by reading the source directly.
- **Verified** — a check was run once and passed at that moment.
- **CI-enforced** — a script in `.github/workflows/ci.yml` or `.github/workflows/browser.yml` will fail the build if the condition regresses. Whether a check also blocks merges depends on branch protection (ADR-068).
- **Externally unexercisable** — the claim can't be proven locally because it requires a real external event (an actual npm publish, an actual GitHub branch-protection setting, an actual security advisory). Disclose this honestly rather than falsely claiming it's proven, or endlessly trying to simulate it.

Verification evidence lives in different places depending on its durability: CI artifacts are ephemeral (e.g. `test-results/`); committed baseline documents are durable (e.g. `docs/architecture/SAST_BASELINE.md`, `ACCESSIBILITY_BASELINE.md`, `PERFORMANCE.md`).

---

## 4. Where to find things

| For...                                              | See                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Architectural intent and governance                 | `docs/architecture/BLUEPRINT.md`                                              |
| Why a past architectural choice was made            | `docs/architecture/DECISIONS.md`                                              |
| Package layout and boundaries                       | `docs/architecture/PACKAGE_ARCHITECTURE.md`                                   |
| Component-level facts (props, accessibility, tests) | `@ultimate/component-metadata` records, MCP tools, or direct component source |
| Current component coverage                          | `docs/architecture/COMPONENT_INVENTORY.md`                                    |
| Prime-parity verification process and status        | `docs/architecture/PARITY_PLAYBOOK.md`                                        |
| Performance/bundle-size baselines                   | `docs/architecture/PERFORMANCE.md`                                            |
| Accessibility baseline                              | `docs/architecture/ACCESSIBILITY_BASELINE.md`                                 |
| Source provenance of ported code                    | `docs/architecture/PROVENANCE.md`                                             |

---

## 5. AI Operating Rules

### 5.1 Git / branching

- Before starting work, check the current branch and working-tree state (`git status`, `git branch --show-current`) — don't assume the current branch is the right one.
- Unless the task's own context already establishes the branch, ask whether to continue on the current branch or create a new one.
- `main` is the release branch and `develop` the integration branch (ADR-068). Direct work on either requires explicit authorization.
- Preserve existing uncommitted changes — never `reset --hard`, `clean -f`, `checkout --`, or otherwise discard working-tree state you didn't create, without confirming it's safe first.
- Destructive git operations (force-push, hard reset, branch deletion, history rewrite) require explicit authorization each time — a prior authorization for a different operation doesn't carry forward.
- Pushing to a remote requires explicit authorization unless the task's context already grants it.
- New work branches from `develop` and opens its PR against `develop`. `release/*` (from `develop`) and `hotfix/*` (from `main`) are reserved: each merges into `main` and back into `develop`. After any merge into `main`, including the Version Packages PR, `main` is merged back into `develop`. Other prefixes stay an implementation-level choice.
- Create work branches and worktrees with `--no-track`, and push with an explicit `src:dst` refspec. With `push.default=upstream`, a branch tracking `origin/develop` or `origin/main` pushes straight to it.
- Run `pnpm install` under Node 24.15.0 in each checkout or worktree before committing. Git hooks live in `.husky/_` (`core.hooksPath`), which husky creates per checkout. Without it git runs no hooks and gives no warning.

### 5.2 Git commits

- This repository's commits follow Conventional Commits shape — `type(scope): short description` (see `git log` for real, current examples).
- Don't commit merely because files changed — a commit corresponds to authorized work.
- Review `git status`/`git diff` before staging or committing — never stage blindly.
- Never use `git add -A`/`git add .` as a default — stage only the files the current authorized task actually touched.
- Never include unrelated changes (the user's own in-progress edits, another agent's work) in a commit.
- Never push a commit unless the task's context explicitly authorizes it.
- Feature PRs merge into `develop` with a merge commit; squash and rebase merges are not used (ADR-068).

### 5.3 Pre-work repository safety

Before modifying any repository file, establish: the current branch, the current working-tree status, and any existing relevant uncommitted changes. This prevents mistaking an existing dirty working tree for your own work, or working against the wrong branch.

### 5.4 Surfacing ambiguity

- Approval for one task does not automatically authorize a different task.
- Surface ambiguity or conflicting evidence to the human rather than silently resolving an architectural question that belongs to them.

### 5.5 Project language

- Write every repository artifact in English: documentation, ADRs, glossary entries, code, code comments, test names, commit messages, branch names, and GitHub issue and PR titles and bodies.
- Converse with the user in whatever language they use; translate decisions into English when recording them.
- Use another language for a specific artifact only when the user explicitly requests it for that artifact.

---

## 6. Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (`majedsiefalnasr/ultimate-packages`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map one-to-one to GitHub labels of the same name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` (if present) plus ADRs in `docs/architecture/DECISIONS.md`. See `docs/agents/domain.md`.
