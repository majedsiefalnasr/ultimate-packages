# AGENTS.md — Repository Orientation

**Purpose:** a small, stable map for any AI agent (or human) starting work in this repository — what Ultimate is, where to find authoritative current state, how the development workflow gates work, and how to operate safely here. This file is deliberately narrow. It does not track current phase status, open gaps, or architectural decisions — it points to where those live and stays correct precisely because it never restates them.

---

## 1. What Ultimate is

Ultimate is a company-owned, multi-framework UI platform derived from selected MIT-licensed Prime ecosystem source baselines. It targets Angular, React, and Vue, with an architecture that remains extensible to additional frameworks. Ultimate owns the resulting source, public API, package architecture, tooling, metadata, and AI integration — there is no required runtime dependency on PrimeNG, PrimeVue, PrimeReact, or PrimeUIX packages. See `docs/architecture/BLUEPRINT.md` §1 for the full statement.

---

## 2. Source-of-truth hierarchy

When two sources disagree, resolve toward the higher-authority tier as the actual fact, then correct whichever lower-authority document was stale — never assume a lower-authority source is right just because it looks more specific or more recently edited.

1. **Real repository evidence** — actual source code, actual test results, actual CI output, actual git history. Wins every disagreement, always.
2. **`docs/architecture/BLUEPRINT.md`** — architectural intent and governance.
3. **`docs/architecture/DECISIONS.md`** (ADRs) — binding architectural decisions within the Blueprint's scope.
4. **Approved specifications and implementation plans** (`docs/superpowers/specs/`, `docs/superpowers/plans/`) — binding for their own scope. A spec/plan's own `Status:` field records that document's lifecycle state at last edit, never current repository state; consult tier 1 or tier 5 to verify whether described work has shipped.
5. **Current-state tracking documents** (`docs/architecture/BLUEPRINT_GAPS.md`, `ROADMAP.md`, `COMPONENT_INVENTORY.md`, `PERFORMANCE.md`, `MIGRATION.md`) — the layer most likely to be stale relative to reality. Re-verify against real evidence before relying on one for a consequential decision.
6. **`docs/architecture/research/*.md`** — dated, point-in-time evidence snapshots. Authoritative for what was true when written, not for current truth without re-confirmation.
7. **`README.md`** and other general/onboarding documentation — descriptive, not authoritative for current project state.
8. **AI context files / Skills / `llms.txt` / MCP tool responses** — one-directional consumers of tiers 2-5. Never authoritative for anything upstream of themselves. Within this tier, freshness guarantees differ: MCP tool responses read `@ultimate/component-metadata` live at request time; `llms.txt`/`llms-full.txt`/generated Skill sections are static committed snapshots, no fresher than their last commit date.

---

## 3. Workflow and approval gates

This project uses a gated development sequence:

**Research → Verification → Architecture Discussion → Decision → Specification → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout**

Each gate produces a specific, findable artifact:

- Research finding → `docs/architecture/research/*.md`
- Architecture decision → an ADR in `docs/architecture/DECISIONS.md`
- Specification → `docs/superpowers/specs/*.md`
- Implementation plan → `docs/superpowers/plans/*.md`

**Discovering that a task, gap, or defect exists does not itself authorize implementation.** Each gate boundary requires its own, separately granted human authorization — approval for one task or one gate does not carry forward to a different task or a later gate.

---

## 4. Verification model

These four claims are distinct — name which one applies, don't say "done" or "working" ambiguously:

- **Implemented** — the code exists. Confirmed by reading the source directly.
- **Verified** — a check was run once and passed at that moment.
- **CI-enforced** — a script in `.github/workflows/ci.yml` will fail the build if the condition regresses.
- **Externally unexercisable** — the claim can't be proven locally because it requires a real external event (an actual npm publish, an actual GitHub branch-protection setting, an actual security advisory). Disclose this honestly rather than falsely claiming it's proven, or endlessly trying to simulate it.

Verification evidence lives in different places depending on its durability: CI artifacts are ephemeral (e.g. `test-results/`); committed baseline documents are durable (e.g. `docs/architecture/SAST_BASELINE.md`, `ACCESSIBILITY_BASELINE.md`, `PERFORMANCE.md`); dated research artifacts are durable point-in-time snapshots (`docs/architecture/research/*.md`).

---

## 5. Protected decisions

Some architectural decisions are explicitly protected against reopening without new evidence. Current instances of this marker live in `docs/architecture/BLUEPRINT_GAPS.md` §5 (Open Architectural Decisions) — check there before proposing work that would revisit a settled question.

---

## 6. Where to find things

| For...                                              | See                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------- |
| Current phase/track status                          | `docs/architecture/ROADMAP.md`                                                |
| Open gaps and architectural decisions               | `docs/architecture/BLUEPRINT_GAPS.md`                                         |
| Why a past architectural choice was made            | `docs/architecture/DECISIONS.md`                                              |
| Deep evidence for a specific past finding           | `docs/architecture/research/` (dated files)                                   |
| Component-level facts (props, accessibility, tests) | `@ultimate/component-metadata` records, MCP tools, or direct component source |
| Current component coverage                          | `docs/architecture/COMPONENT_INVENTORY.md`                                    |
| Performance/bundle-size baselines                   | `docs/architecture/PERFORMANCE.md`                                            |
| Release/migration process                           | `docs/architecture/MIGRATION.md`                                              |

---

## 7. AI Operating Rules

### 7.1 Git / branching

- Before starting work, check the current branch and working-tree state (`git status`, `git branch --show-current`) — don't assume the current branch is the right one.
- Unless the task's own context already establishes the branch, ask whether to continue on the current branch or create a new one.
- Direct work on `main` requires explicit authorization.
- Preserve existing uncommitted changes — never `reset --hard`, `clean -f`, `checkout --`, or otherwise discard working-tree state you didn't create, without confirming it's safe first.
- Destructive git operations (force-push, hard reset, branch deletion, history rewrite) require explicit authorization each time — a prior authorization for a different operation doesn't carry forward.
- Pushing to a remote requires explicit authorization unless the task's context already grants it.
- No single branch-naming convention is established across this repository's history — naming is an implementation-level choice, not a fixed pattern.

### 7.2 Superpowers usage

- This repository's gated workflow (§3) is meant to be executed using the appropriate Superpowers skill for each stage, when Superpowers is available — this is a working expectation, not optional background reading.
- Use the skill appropriate to the current stage (problem exploration, specification/plan authorship, subagent-driven execution, pre-completion verification, closeout, and others as relevant) — don't invoke an unrelated skill just to satisfy a checklist.
- Using a skill never grants authorization to cross a human-approval gate on its own — the gate sequence in §3 remains binding regardless of which skill executes a given stage.
- If Superpowers is unavailable in the current environment, the workflow and its approval gates still apply. The tool's absence doesn't remove the gates.

### 7.3 Git commits

- This repository's commits follow Conventional Commits shape — `type(scope): short description` (see `git log` for real, current examples).
- Don't commit merely because files changed — a commit corresponds to authorized work at an appropriate workflow gate.
- Review `git status`/`git diff` before staging or committing — never stage blindly.
- Never use `git add -A`/`git add .` as a default — stage only the files the current authorized task actually touched.
- Never include unrelated changes (the user's own in-progress edits, another agent's work) in a commit.
- Research, specification, and plan artifacts wait for their own applicable approval gate before being committed.
- Never push a commit unless the task's context explicitly authorizes it.

### 7.4 Pre-work repository safety

Before modifying any repository file, establish: the current branch, the current working-tree status, any existing relevant uncommitted changes, and the applicable task/spec/plan and its current approval state. This prevents mistaking an existing dirty working tree for your own work, or implementing against the wrong branch/state.

### 7.5 Preserving the human-controlled model

- Discovering a problem does not authorize fixing it.
- Finding a gap does not authorize implementing it.
- An approved specification does not authorize implementation before an implementation plan exists and is itself reviewed and approved.
- Approval for one task does not automatically authorize a different task.
- Surface ambiguity or conflicting evidence to the human rather than silently resolving an architectural question that belongs to them.

### 7.6 AI model selection and delegation

- Follow [`docs/agents/AI_DELEGATION_POLICY.md`](docs/agents/AI_DELEGATION_POLICY.md) for task-tier model recommendations, same-CLI fallback, and explicitly requested delegation lanes.
- Default to the current CLI and choose the least costly capable native model for the task.
- Cross-CLI delegation requires an explicit user request; never start or substitute another AI CLI automatically.
