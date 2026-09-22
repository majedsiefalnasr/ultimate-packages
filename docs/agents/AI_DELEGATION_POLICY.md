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
