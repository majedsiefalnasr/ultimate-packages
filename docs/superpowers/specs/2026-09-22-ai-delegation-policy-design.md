# Specification — AI Model Selection and Delegation Policy

**Status:** Approved — Spec Review passed; human-approved.
**Date:** 2026-09-22
**Branch:** `docs/ai-delegation-policy` (isolated worktree based on `main` at `f8cd78b`).

**Origin:** the AI model-cost and delegation-policy Brainstorming/Decision discussion in this conversation. The user selected a recommendation-based policy, current-CLI-first execution, explicit-only cross-CLI delegation, four task-complexity tiers, and per-CLI model choices for Codex, Claude Code, OpenCode, Cursor, and MiniMax.

**Required sequence:** Brainstorming/Decision (complete) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout → merge to `main`.

**This specification does not implement the policy.** It defines the required documentation and delegation configuration. `AGENTS.md` and `.delegate/config.json` remain unchanged until a separately reviewed Implementation Plan authorizes those edits.

---

## 1. Purpose

Define a repository-wide recommendation for selecting the least costly model suitable for a task while preserving review quality and human control over cross-CLI delegation.

The policy must work when the primary session runs in any of these tools:

- Codex
- Claude Code
- OpenCode
- Cursor
- MiniMax, once configured

The default behavior is **current CLI first**. An agent selects an appropriate model available within the CLI that is already running. It must not start another AI CLI unless the user explicitly requests cross-CLI delegation.

---

## 2. Binding decisions

1. **Recommendation, not a universal hard pin.** The model table supplies defaults. A task may move to a stronger model when its actual risk or complexity warrants it, with the reason reported.
2. **Current CLI first.** Native models of the active CLI are considered before any external CLI.
3. **Same-CLI fallback only by default.** If the preferred model is unavailable, exhausted, or unsupported, try the documented fallback chain within the same CLI.
4. **Cross-CLI delegation requires an explicit user request.** The policy must never silently start Codex, Claude Code, OpenCode, Cursor, MiniMax, or any other external CLI merely because its preferred model is unavailable.
5. **Explicit cross-CLI instructions override the default.** A request such as “implement with Claude Code and review with Codex” authorizes those named handoffs, subject to tool availability and authentication.
6. **No silent cross-tool substitution.** If an explicitly requested external CLI cannot run, stop that handoff and report the condition rather than choosing another CLI.
7. **Do not invent model identifiers.** Model names, aliases, effort values, and variants must come from live discovery or authoritative tool documentation.
8. **No `CLAUDE.md`.** `AGENTS.md` is the repository entry point for all supported agents, including Claude Code.
9. **MiniMax remains disabled until configured.** No MiniMax lane or model identifier is created until a working MiniMax CLI/provider, authentication, and discoverable model identifier exist.

---

## 3. Task classification

The policy uses four recommendation tiers:

| Tier            | Typical work                                                                                        | Review posture                                                             |
| --------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Mechanical      | Formatting, deterministic edits, renames, generated-file refreshes, and other low-judgment changes  | Use the cheapest capable model; verify the result mechanically.            |
| Standard        | Ordinary bounded implementation, tests, documentation, and routine debugging                        | Use the normal day-to-day model.                                           |
| Complex         | Architecture-sensitive changes, difficult debugging, multi-file reasoning, or unfamiliar subsystems | Use a stronger reasoning model and raise effort where the CLI supports it. |
| Critical review | Final review, security-sensitive review, architectural review, or review of high-impact changes     | Use the strongest designated reviewer available in the current CLI.        |

Classification follows the highest-risk material part of the assigned task. A task must not be split artificially merely to force cheaper routing. Conversely, an entire plan must not be assigned to the critical-review tier solely because its final task is a critical review.

---

## 4. Current-CLI model recommendations

| Current CLI | Mechanical                    | Standard                       | Complex                   | Critical review                                           |
| ----------- | ----------------------------- | ------------------------------ | ------------------------- | --------------------------------------------------------- |
| Codex       | `gpt-5.6-luna`                | `gpt-5.6-terra`                | `gpt-5.6-sol`             | `gpt-6-astra`                                             |
| Claude Code | `haiku`                       | `sonnet`                       | `sonnet` with high effort | `opus`                                                    |
| OpenCode    | `github-copilot/gpt-5.6-luna` | `github-copilot/gpt-5.6-terra` | `openai/gpt-5.6-sol`      | `openai/gpt-5.6-sol` with the strongest supported variant |
| Cursor      | `auto`                        | `auto`                         | `auto`                    | `auto`                                                    |
| MiniMax     | Disabled                      | Disabled                       | Disabled                  | Disabled                                                  |

These selections were based on live discovery on 2026-09-22:

- Codex exposed the four named models.
- Claude Code exposed the `haiku`, `sonnet`, and `opus` aliases.
- OpenCode exposed the named GitHub Copilot and OpenAI provider/model identifiers.
- Cursor was installed, but authenticated model discovery was unavailable; therefore all Cursor tiers remain `auto` rather than guessing identifiers.
- No configured MiniMax CLI/provider or discoverable MiniMax model was found.

The policy document must include a “last verified” date and direct future maintainers to refresh discovery when availability changes. Discovery results are operational evidence, not permanent architectural guarantees.

---

## 5. Same-CLI fallback and escalation

Within the active CLI, use these ordered fallback paths:

- **Codex:** `gpt-5.6-luna` → `gpt-5.6-terra` → `gpt-5.6-sol` → `gpt-6-astra`.
- **Claude Code:** `haiku` → `sonnet` → `sonnet` with high effort → `opus`.
- **OpenCode:** `github-copilot/gpt-5.6-luna` → `github-copilot/gpt-5.6-terra` → `openai/gpt-5.6-sol` → `openai/gpt-5.6-sol` with the strongest supported variant.
- **Cursor:** use `auto` until authenticated model discovery produces validated identifiers; do not guess.
- **MiniMax:** stop and report that MiniMax is not configured.

The chain is a capability/cost progression, not a requirement to try every weaker model after a task is already known to require a stronger tier. An agent may start at the recommended tier or escalate within the active CLI when evidence shows the current choice is insufficient. It should state material escalation or substitution briefly.

If no suitable model remains in the current CLI, report the limitation and ask for direction. Do not interpret exhaustion of the same-CLI chain as authorization for cross-CLI delegation.

---

## 6. Cross-CLI delegation configuration

The implementation must add project-local `.delegate/config.json` lanes for explicit cross-CLI requests. Lane names are tool-qualified so a user request identifies both the CLI and the task tier without ambiguity:

- `codex-mechanical`, `codex-standard`, `codex-complex`, `codex-critical-review`
- `claude-mechanical`, `claude-standard`, `claude-complex`, `claude-critical-review`
- `opencode-mechanical`, `opencode-standard`, `opencode-complex`, `opencode-critical-review`
- `cursor-mechanical`, `cursor-standard`, `cursor-complex`, `cursor-critical-review`

No MiniMax lane is created while MiniMax is disabled.

Each lane binds to exactly one implementer CLI. The configuration does not implement automatic task classification, automatic cross-CLI fallback, or a multi-tool fallback chain. It only makes explicitly requested handoffs reproducible.

Cursor lanes must omit an invented model value and use Cursor's default/automatic selection until authenticated discovery succeeds.

OpenCode lanes must use exact `provider/model` identifiers. The critical-review lane may set a variant only if its precise value is validated before implementation; otherwise it uses the verified `openai/gpt-5.6-sol` identifier without an invented variant and the policy retains the recommendation to use the strongest supported variant interactively.

Before `.delegate/config.json` is written, the implementation step must present the complete proposed JSON for human confirmation, as required by the delegation setup workflow.

---

## 7. Documentation architecture

Implementation creates or updates exactly these repository artifacts:

1. **`docs/agents/AI_DELEGATION_POLICY.md` — detailed policy.** Contains purpose, current-CLI-first behavior, tier definitions, model matrix, same-CLI fallback, escalation guidance, explicit-only cross-CLI rules, lane names, unavailable/authentication/quota handling, MiniMax's disabled condition, discovery requirements, and last-verified date.
2. **`AGENTS.md` — stable pointer.** Adds a short subsection under AI Operating Rules directing agents to the detailed policy. It must state the two durable rules that are unsafe to omit from the entry point: current-CLI-first selection and explicit user authorization for cross-CLI delegation. It must not duplicate the full model catalog.
3. **`.delegate/config.json` — explicit delegation lanes.** Contains only verified, tool-qualified lanes described in §6.

No `CLAUDE.md`, per §2. No generated AI context, application source, architecture decision, roadmap, component status, or Batch 3 artifact is modified.

---

## 8. Runtime behavior and failures

When choosing a model for a task, an agent follows this sequence:

1. Classify the task as mechanical, standard, complex, or critical review.
2. Select the recommended model for that tier in the current CLI.
3. If it cannot be used, follow the same-CLI fallback chain.
4. If no suitable same-CLI option remains, report the limitation and request direction.
5. Delegate to another CLI only when the user explicitly named or authorized that CLI.
6. If the requested external CLI is unavailable, unauthenticated, quota-limited, or lacks the requested model, report that exact condition; do not silently substitute another CLI.

Authentication status, quota state, and model availability are runtime facts. The policy documents response behavior but does not encode credentials, account identifiers, secrets, or personal information.

---

## 9. Verification requirements

The future Implementation Plan must verify at least:

1. The detailed policy and `AGENTS.md` pointer agree on current-CLI-first and explicit-only cross-CLI behavior.
2. The model table and same-CLI fallback chains contain all five requested tools and all four task tiers.
3. MiniMax is clearly disabled and has no lane.
4. Cursor has no guessed model identifier.
5. `.delegate/config.json` parses as JSON and passes any validator supplied by the installed delegation tooling.
6. Every configured model/alias was discovered live or is an explicitly supported automatic/default selection.
7. No lane creates implicit cross-CLI fallback.
8. Repository documentation formatting and existing `AGENTS.md` pointer validation pass.
9. The diff contains no `CLAUDE.md` and no change outside the three artifacts in §7, apart from this specification and its future implementation plan.
10. Pre-existing repository failures are distinguished from failures introduced by this work. The baseline Angular build currently fails because `UAutoComplete.instanceCount` and `USelect.instanceCount` are used before their declarations; this policy work must not claim to fix or cause those failures.

---

## 10. Out of scope

- Automatic task classification implemented in code.
- Automatic cross-CLI routing or fallback.
- Installing, authenticating, or configuring any AI CLI/provider.
- Adding MiniMax lanes before MiniMax is configured and discoverable.
- Guessing Cursor model identifiers while Cursor discovery is unauthenticated.
- Changing global delegation configuration outside this repository.
- Creating `CLAUDE.md` or other tool-specific copies of the policy.
- Changing Superpowers skills or delegate skill implementations.
- Changing application code, tests, architecture decisions, roadmaps, migration plans, or the paused Phase C Batch 3 work.
- Resolving the pre-existing Angular build failure discovered during baseline verification.

---

## 11. Acceptance criteria

The policy implementation is complete when:

1. `docs/agents/AI_DELEGATION_POLICY.md` contains the approved task tiers, model recommendations, fallback chains, and runtime rules.
2. `AGENTS.md` links to that policy and preserves its role as a concise repository orientation file.
3. `.delegate/config.json` contains verified, tool-qualified lanes for Codex, Claude Code, OpenCode, and Cursor, with no MiniMax lane.
4. Current-CLI-first behavior is the default everywhere, and cross-CLI delegation requires explicit user authorization.
5. Unavailable models fall back only within the active CLI unless the user authorizes another CLI.
6. Cursor remains on automatic selection and MiniMax remains disabled until live configuration supports more specific routing.
7. No model identifier, effort value, or variant is invented.
8. All verification requirements in §9 are satisfied or any pre-existing failure is explicitly preserved and reported.
9. Final Review/Closeout confirms the branch contains only the authorized policy artifacts and then merges the completed work to `main`, as explicitly requested by the user.

---

## 12. Status

**Approved.**

This specification defines the complete scope of the AI delegation policy. Its approval authorizes creation of the Implementation Plan, but not implementation until that Plan is separately reviewed and approved.
