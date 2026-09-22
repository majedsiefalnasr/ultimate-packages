# AI Model Selection and Delegation Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Approved — Plan Review passed; human-approved.

**Goal:** Add a repository-wide, current-CLI-first model-selection recommendation and explicit-only cross-CLI delegation lanes for Codex, Claude Code, OpenCode, and Cursor, while keeping MiniMax disabled until configured.

**Architecture:** Keep stable entry-point rules in `AGENTS.md`, detailed and changeable model guidance in `docs/agents/AI_DELEGATION_POLICY.md`, and executable explicit-delegation lanes in `.delegate/config.json`. The configuration does not classify tasks or perform cross-CLI fallback; it only resolves a tool-qualified lane after the user explicitly requests that external CLI.

**Tech Stack:** Markdown, JSON (`delegate-fleet.v1`), Node.js delegation configuration tooling, pnpm/Prettier, Git worktrees.

**Authoritative specification:** `docs/superpowers/specs/2026-09-22-ai-delegation-policy-design.md`

## Global Constraints

- Default to the CLI in which the primary session is already running.
- Treat model selections as recommendations; use the least costly capable native model and explain material escalation.
- Fall back only within the current CLI unless the user explicitly authorizes another CLI.
- Never silently substitute a different external CLI when an explicitly requested CLI is unavailable.
- Do not invent model identifiers, aliases, effort values, or variants.
- Do not create `CLAUDE.md`; Claude Code consumes `AGENTS.md` in this repository.
- Keep Cursor on its default/automatic model selection until authenticated discovery returns validated model identifiers.
- Keep MiniMax disabled and create no MiniMax lane until a working CLI/provider, authentication, and model identifier are configured.
- Do not modify application source, architecture decisions, roadmap/status documents, migration artifacts, or the paused Phase C Batch 3 work.
- Preserve the known pre-existing Angular build failure: `UAutoComplete.instanceCount` and `USelect.instanceCount` are used before their declarations.
- Work only in the isolated `docs/ai-delegation-policy` worktree until final integration.
- Commit only the files listed by each task; never stage with `git add .` or `git add -A`.

## File Map

| File                                  | Responsibility                                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/agents/AI_DELEGATION_POLICY.md` | Human-readable task tiers, per-CLI recommendations, fallback behavior, explicit delegation rules, failure handling, and maintenance guidance. |
| `AGENTS.md`                           | Stable repository-entry pointer plus the durable current-CLI-first and explicit-only cross-CLI rules.                                         |
| `.delegate/config.json`               | Tool-qualified lanes used only for explicitly requested cross-CLI dispatches.                                                                 |

## Approved lane proposal

Plan Review approval explicitly approves this exact project-scoped lane map. Any later change to a lane, model, effort, or implementer must be re-shown and re-approved before the configuration is written.

| Lane family | Mechanical                    | Standard                       | Complex                 | Critical review      |
| ----------- | ----------------------------- | ------------------------------ | ----------------------- | -------------------- |
| Codex       | `gpt-5.6-luna`                | `gpt-5.6-terra`                | `gpt-5.6-sol`           | `gpt-6-astra`        |
| Claude Code | `haiku`                       | `sonnet`                       | `sonnet`, effort `high` | `opus`               |
| OpenCode    | `github-copilot/gpt-5.6-luna` | `github-copilot/gpt-5.6-terra` | `openai/gpt-5.6-sol`    | `openai/gpt-5.6-sol` |
| Cursor      | CLI default/auto              | CLI default/auto               | CLI default/auto        | CLI default/auto     |

Exact JSON:

```json
{
  "version": "delegate-fleet.v1",
  "lanes": {
    "codex-mechanical": {
      "implementer": "codex",
      "model": "gpt-5.6-luna"
    },
    "codex-standard": {
      "implementer": "codex",
      "model": "gpt-5.6-terra"
    },
    "codex-complex": {
      "implementer": "codex",
      "model": "gpt-5.6-sol"
    },
    "codex-critical-review": {
      "implementer": "codex",
      "model": "gpt-6-astra"
    },
    "claude-mechanical": {
      "implementer": "claude",
      "model": "haiku"
    },
    "claude-standard": {
      "implementer": "claude",
      "model": "sonnet"
    },
    "claude-complex": {
      "implementer": "claude",
      "model": "sonnet",
      "effort": "high"
    },
    "claude-critical-review": {
      "implementer": "claude",
      "model": "opus"
    },
    "opencode-mechanical": {
      "implementer": "opencode",
      "model": "github-copilot/gpt-5.6-luna"
    },
    "opencode-standard": {
      "implementer": "opencode",
      "model": "github-copilot/gpt-5.6-terra"
    },
    "opencode-complex": {
      "implementer": "opencode",
      "model": "openai/gpt-5.6-sol"
    },
    "opencode-critical-review": {
      "implementer": "opencode",
      "model": "openai/gpt-5.6-sol"
    },
    "cursor-mechanical": {
      "implementer": "cursor"
    },
    "cursor-standard": {
      "implementer": "cursor"
    },
    "cursor-complex": {
      "implementer": "cursor"
    },
    "cursor-critical-review": {
      "implementer": "cursor"
    }
  }
}
```

The OpenCode critical lane intentionally omits `variant`: live discovery did not provide a validated variant token. The Cursor lanes intentionally omit `model`: Cursor model discovery was unauthenticated. MiniMax intentionally has no lane.

---

### Task 1: Add the detailed AI delegation policy

**Files:**

- Create: `docs/agents/AI_DELEGATION_POLICY.md`

**Interfaces:**

- Consumes: The binding decisions and model matrix in the approved specification.
- Produces: The stable policy target referenced by `AGENTS.md` in Task 2 and the human-readable semantics for `.delegate/config.json` in Task 3.

- [ ] **Step 1: Confirm the task starts clean and scoped**

Run:

```bash
git branch --show-current
git status --short
test "$(git branch --show-current)" = "docs/ai-delegation-policy"
```

Expected: branch is `docs/ai-delegation-policy`; only this Plan may be uncommitted at the start of implementation. Stop if any unrelated file is modified.

- [ ] **Step 2: Create the policy document**

Create `docs/agents/AI_DELEGATION_POLICY.md` with exactly this content:

```markdown
# AI Model Selection and Delegation Policy

**Last verified:** 2026-09-22

## Purpose

Use the least costly model suitable for each task without weakening verification or silently moving work between AI tools. This policy is a recommendation for model selection; task risk and observed difficulty may justify escalation.

## Default behavior: current CLI first

Stay in the CLI where the primary session is running. Classify the task, select that CLI's recommended model, and use the same-CLI fallback chain if the preferred model is unavailable.

Do not start another AI CLI unless the user explicitly requests cross-CLI delegation. If every suitable same-CLI option is unavailable, report the limitation and ask for direction.

## Task tiers

| Tier            | Typical work                                                                                         | Selection guidance                                                |
| --------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Mechanical      | Formatting, deterministic edits, renames, and generated-file refreshes                               | Use the cheapest capable model and verify mechanically.           |
| Standard        | Bounded implementation, tests, documentation, and routine debugging                                  | Use the normal day-to-day model.                                  |
| Complex         | Architecture-sensitive changes, difficult debugging, multi-file reasoning, and unfamiliar subsystems | Use a stronger reasoning model and higher effort where supported. |
| Critical review | Final, security-sensitive, architectural, or other high-impact review                                | Use the strongest designated reviewer in the current CLI.         |

Classify by the highest-risk material part of the assigned task. Do not split work artificially to force a cheaper tier, and do not classify an entire plan as critical review merely because its final task is a critical review.

## Recommended models

| Current CLI | Mechanical                    | Standard                       | Complex                   | Critical review                                           |
| ----------- | ----------------------------- | ------------------------------ | ------------------------- | --------------------------------------------------------- |
| Codex       | `gpt-5.6-luna`                | `gpt-5.6-terra`                | `gpt-5.6-sol`             | `gpt-6-astra`                                             |
| Claude Code | `haiku`                       | `sonnet`                       | `sonnet` with high effort | `opus`                                                    |
| OpenCode    | `github-copilot/gpt-5.6-luna` | `github-copilot/gpt-5.6-terra` | `openai/gpt-5.6-sol`      | `openai/gpt-5.6-sol` with the strongest supported variant |
| Cursor      | `auto`                        | `auto`                         | `auto`                    | `auto`                                                    |
| MiniMax     | Disabled                      | Disabled                       | Disabled                  | Disabled                                                  |

These are defaults, not permanent model guarantees. Explain a material escalation or substitution briefly.

## Same-CLI fallback

- Codex: `gpt-5.6-luna` → `gpt-5.6-terra` → `gpt-5.6-sol` → `gpt-6-astra`.
- Claude Code: `haiku` → `sonnet` → `sonnet` with high effort → `opus`.
- OpenCode: `github-copilot/gpt-5.6-luna` → `github-copilot/gpt-5.6-terra` → `openai/gpt-5.6-sol` → `openai/gpt-5.6-sol` with the strongest supported variant.
- Cursor: use `auto` until authenticated discovery returns validated model identifiers; never guess.
- MiniMax: stop and report that MiniMax is not configured.

Start at the tier the task requires; the arrows do not require trying a model already known to be too weak. Exhausting the current CLI's suitable choices does not authorize another CLI.

## Cross-CLI delegation

Cross-CLI delegation is opt-in. A user instruction such as “implement with Claude Code and review with Codex” authorizes only those named handoffs.

When the user explicitly requests an external CLI:

1. Use the matching tool-qualified lane from `.delegate/config.json` when available.
2. Verify the CLI is installed and authenticated before dispatch.
3. If the CLI, model, authentication, or quota is unavailable, report the condition.
4. Never silently substitute another external CLI.

Configured lane families are `codex-*`, `claude-*`, `opencode-*`, and `cursor-*`, each with `mechanical`, `standard`, `complex`, and `critical-review` tiers. Lanes make an explicitly requested handoff reproducible; they do not automatically classify or route work.

MiniMax has no lanes until a working MiniMax CLI/provider, authentication, and discoverable model identifier are configured.

## Availability and discovery

Model availability, aliases, authentication, quotas, and supported reasoning controls can change. Before adding or changing a pinned model:

1. Run the CLI's live model discovery or consult its authoritative documentation.
2. Use the exact reported identifier and the correct dial (`effort` or `variant`).
3. Do not infer a model name from another CLI's catalog.
4. Update this document's last-verified date and `.delegate/config.json` together when a lane changes.

As of the last-verified date, Codex exposed the four named Codex models, Claude Code exposed the `haiku`/`sonnet`/`opus` aliases, and OpenCode exposed the named GitHub Copilot and OpenAI identifiers. Cursor was installed but its model discovery required authentication, and no configured MiniMax CLI/provider was available.
```

- [ ] **Step 3: Verify policy content and formatting**

Run:

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec prettier --check docs/agents/AI_DELEGATION_POLICY.md
rg -n "current CLI|explicitly requests cross-CLI|MiniMax|Cursor|Critical review|Last verified" docs/agents/AI_DELEGATION_POLICY.md
git diff --check -- docs/agents/AI_DELEGATION_POLICY.md
```

Expected: Prettier reports the file is formatted; `rg` finds every required concept; `git diff --check` prints nothing.

- [ ] **Step 4: Review and commit Task 1 only**

Run:

```bash
git diff -- docs/agents/AI_DELEGATION_POLICY.md
git add docs/agents/AI_DELEGATION_POLICY.md
git diff --cached --check
git commit -m "docs(agents): add AI delegation policy"
```

Expected: the commit contains only `docs/agents/AI_DELEGATION_POLICY.md`.

---

### Task 2: Link the policy from AGENTS.md

**Files:**

- Modify: `AGENTS.md` after §7.5

**Interfaces:**

- Consumes: `docs/agents/AI_DELEGATION_POLICY.md` from Task 1.
- Produces: The repository entry-point instruction that directs every supported agent to the detailed policy.

- [ ] **Step 1: Add the concise pointer**

Append this subsection immediately after §7.5:

```markdown
### 7.6 AI model selection and delegation

- Follow [`docs/agents/AI_DELEGATION_POLICY.md`](docs/agents/AI_DELEGATION_POLICY.md) for task-tier model recommendations, same-CLI fallback, and explicitly requested delegation lanes.
- Default to the current CLI and choose the least costly capable native model for the task.
- Cross-CLI delegation requires an explicit user request; never start or substitute another AI CLI automatically.
```

- [ ] **Step 2: Verify the pointer and stable entry-point behavior**

Run:

```bash
test -f docs/agents/AI_DELEGATION_POLICY.md
rg -n "AI_DELEGATION_POLICY|Default to the current CLI|Cross-CLI delegation requires" AGENTS.md
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm agents-md-pointers:validate
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec prettier --check AGENTS.md docs/agents/AI_DELEGATION_POLICY.md
git diff --check -- AGENTS.md
```

Expected: the target exists; all three pointer concepts are found; pointer validation reports `OK`; Prettier passes; `git diff --check` prints nothing.

- [ ] **Step 3: Review and commit Task 2 only**

Run:

```bash
git diff -- AGENTS.md
git add AGENTS.md
git diff --cached --check
git commit -m "docs(agents): link AI delegation policy"
```

Expected: the commit contains only `AGENTS.md`.

---

### Task 3: Add explicit cross-CLI delegation lanes

**Files:**

- Create: `.delegate/config.json`

**Interfaces:**

- Consumes: the exact Plan Review-approved JSON under “Approved lane proposal.”
- Produces: 16 project-local lanes resolvable by the matching `*-delegate` relay when the user explicitly requests cross-CLI delegation.

- [ ] **Step 1: Refresh discovery without changing the approved proposal**

Run:

```bash
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/discover.mjs
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs load --cwd "$PWD"
```

Expected: Codex, Claude Code, OpenCode, and Cursor remain installed; the configured model identifiers remain discoverable as recorded in the specification. Cursor may remain unauthenticated because its lanes omit `model`. If a configured model is no longer discoverable, stop at the Plan gate; do not silently change the JSON.

- [ ] **Step 2: Confirm exact approval and create the configuration**

Confirm that Plan Review approved the exact lane table and JSON above. If any value changed after approval, re-show the complete table and JSON and obtain explicit approval before writing.

Create `.delegate/config.json` with the exact JSON under “Approved lane proposal.” Do not add a MiniMax lane, an OpenCode `variant`, a Cursor `model`, automatic fallback fields, or any lane not shown there.

- [ ] **Step 3: Validate, trust, and reload the project configuration**

Run:

```bash
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs validate .delegate/config.json
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs write --scope project --cwd "$PWD" .delegate/config.json
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs load --cwd "$PWD"
```

Expected: validation returns `ok: true` with all 16 lane names; write returns `projectTrusted: true`; load reports the same 16 project lanes and `projectTrusted: true`.

- [ ] **Step 4: Verify prohibited and required configuration states**

Run:

```bash
node - <<'NODE'
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('.delegate/config.json', 'utf8'));
const names = Object.keys(config.lanes);
if (config.version !== 'delegate-fleet.v1') throw new Error('wrong config version');
if (names.length !== 16) throw new Error(`expected 16 lanes, found ${names.length}`);
if (names.some((name) => name.includes('minimax'))) throw new Error('MiniMax lane must be disabled');
for (const name of ['cursor-mechanical', 'cursor-standard', 'cursor-complex', 'cursor-critical-review']) {
  if ('model' in config.lanes[name]) throw new Error(`${name} must use Cursor auto/default`);
}
if ('variant' in config.lanes['opencode-critical-review']) {
  throw new Error('OpenCode critical variant was not validated and must be omitted');
}
console.log('delegation policy lanes: OK');
NODE
git diff --check -- .delegate/config.json
```

Expected: `delegation policy lanes: OK`; `git diff --check` prints nothing.

- [ ] **Step 5: Review and commit Task 3 only**

Run:

```bash
git diff -- .delegate/config.json
git add .delegate/config.json
git diff --cached --check
git commit -m "chore(delegate): add explicit CLI lanes"
```

Expected: the commit contains only `.delegate/config.json`. The trust hash written under Git metadata is local operational state and is not staged.

---

### Task 4: Whole-policy verification and final review

**Files:**

- Verify: `docs/agents/AI_DELEGATION_POLICY.md`
- Verify: `AGENTS.md`
- Verify: `.delegate/config.json`
- Verify: `docs/superpowers/specs/2026-09-22-ai-delegation-policy-design.md`
- Verify: `docs/superpowers/plans/2026-09-22-ai-delegation-policy.md`

**Interfaces:**

- Consumes: Tasks 1–3.
- Produces: Evidence that the policy, pointer, and executable lane map agree and that no out-of-scope file was changed.

- [ ] **Step 1: Run focused documentation and configuration checks**

Run:

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec prettier --check AGENTS.md docs/agents/AI_DELEGATION_POLICY.md docs/superpowers/specs/2026-09-22-ai-delegation-policy-design.md docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm agents-md-pointers:validate
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs validate .delegate/config.json
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs load --cwd "$PWD"
git diff --check main...HEAD
```

Expected: all commands pass; loaded configuration reports 16 project lanes and `projectTrusted: true`.

- [ ] **Step 2: Verify scope and semantic agreement**

Run:

```bash
git diff --name-only main...HEAD
test ! -e CLAUDE.md
rg -n "current CLI|explicit user request|MiniMax|Cursor" AGENTS.md docs/agents/AI_DELEGATION_POLICY.md
node -e "const c=require('./.delegate/config.json'); const n=Object.keys(c.lanes); if(n.length!==16 || n.some(x=>x.includes('minimax'))) process.exit(1); console.log('lane scope: OK')"
```

Expected changed files only:

```text
.delegate/config.json
AGENTS.md
docs/agents/AI_DELEGATION_POLICY.md
docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
docs/superpowers/specs/2026-09-22-ai-delegation-policy-design.md
```

Expected: no `CLAUDE.md`; policy and pointer contain the durable rules; `lane scope: OK`.

- [ ] **Step 3: Re-run repository baseline commands and classify failures**

Run:

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm build
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm test
```

Expected baseline limitation: `pnpm build` may fail in `@ultimate/ng` with TS2729 for `UAutoComplete.instanceCount` and `USelect.instanceCount`, matching the pre-implementation baseline. `pnpm test` may depend on build artifacts. Record exact results; do not call a pre-existing failure new, do not claim full-suite success if either command fails, and do not fix either Angular source file in this task.

- [ ] **Step 4: Perform final repository/branch review**

Review:

```bash
git log --oneline main..HEAD
git diff --stat main...HEAD
git diff main...HEAD -- .delegate/config.json AGENTS.md docs/agents/AI_DELEGATION_POLICY.md docs/superpowers/specs/2026-09-22-ai-delegation-policy-design.md docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
git status --short
```

Confirm every acceptance criterion in the specification, no uncommitted file remains, no model identifier was invented, no automatic cross-CLI behavior exists, and no Batch 3 file appears in the diff.

---

### Task 5: Close out and merge to main

**Files:**

- Modify: `docs/superpowers/plans/2026-09-22-ai-delegation-policy.md` (status and completed checkboxes only)

**Interfaces:**

- Consumes: successful Task 4 final review plus the user's explicit instruction that the completed policy must merge to `main`.
- Produces: a closed Plan and an integrated `main` branch without touching the dirty Phase C Batch 3 checkout.

- [ ] **Step 1: Record verified closeout in this Plan**

Change the Plan status to `Complete — implementation, verification, and Final Review/Closeout passed; ready for the authorized merge to main.` only after Task 4 passes. Mark completed task checkboxes. Do not rewrite requirements or verification evidence.

Run:

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec prettier --check docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
git diff --check -- docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
git add docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
git commit -m "docs(agents): close out delegation policy"
```

Expected: the closeout commit contains only this Plan.

- [ ] **Step 2: Create a clean temporary main integration worktree**

From the original repository path, verify `main` is not checked out elsewhere and create a temporary integration worktree:

```bash
git worktree list --porcelain
git worktree add /private/tmp/ultimate-ai-delegation-main main
```

Expected: the new worktree checks out `main`. If that path already exists or `main` is checked out elsewhere, stop and resolve safely; never remove an unknown directory.

- [ ] **Step 3: Merge the reviewed branch**

From `/private/tmp/ultimate-ai-delegation-main` run:

```bash
git status --short
git merge --no-ff docs/ai-delegation-policy -m "merge: add AI delegation policy"
git status --short
git log -1 --oneline
```

Expected: clean status before and after; merge succeeds; the latest commit is the merge commit. Do not push.

- [ ] **Step 4: Verify integrated main and remove only the known temporary integration worktree**

Run from `/private/tmp/ultimate-ai-delegation-main`:

```bash
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm exec prettier --check AGENTS.md docs/agents/AI_DELEGATION_POLICY.md docs/superpowers/specs/2026-09-22-ai-delegation-policy-design.md docs/superpowers/plans/2026-09-22-ai-delegation-policy.md
PATH=/opt/homebrew/opt/node@24/bin:$PATH pnpm agents-md-pointers:validate
node /Users/majedsiefalnasr/.codex/skills/delegate-setup/scripts/config.mjs validate .delegate/config.json
```

Expected: all focused integration checks pass.

Then, from the original repository path:

```bash
git worktree remove /private/tmp/ultimate-ai-delegation-main
git worktree list --porcelain
```

Expected: only the known temporary main integration worktree is removed; the original dirty Phase C Batch 3 checkout and the policy worktree remain unchanged. Do not delete either branch and do not push.
