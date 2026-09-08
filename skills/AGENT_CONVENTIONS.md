# Agent Instruction Conventions

Per Blueprint §26: "The platform should provide conventions for agent instruction files and Skills, while avoiding dependence on one specific coding agent." This document is tool-agnostic — it names no single coding agent or tool as required, and describes how to reference generated artifacts and Skills, not how to configure any particular agent's proprietary settings format (spec §8).

## What a consuming project's agent-instruction file should reference

A project consuming Ultimate should reference two kinds of artifact from its own agent-instruction file (an `AGENTS.md`, `CLAUDE.md`, or equivalent tool-specific convention file — this document does not prescribe which):

1. **Skill files** — one per Ultimate component, describing when to use it, preferred patterns, allowed APIs, anti-patterns, accessibility guidance, and related components. Skill files are distributed as part of the installed `@ultimate/ai` package's Skill content (see below) or may be vendored/copied into a consuming project directly.

2. **Generated LLM context** — five static files providing structured, machine-generated component context:
   - `llms.txt` — a compact, framework-neutral index of every Ultimate component.
   - `llms-full.txt` — the full structured context for every component, all frameworks.
   - `llms-ng.txt` / `llms-react.txt` / `llms-vue.txt` — the same content, narrowed to one framework's API facts.

## Where to find them (installed-package location — spec §7.1a)

Once `@ultimate/ai` is installed as a dependency of a consuming project:

```
node_modules/@ultimate/ai/dist/context/llms.txt
node_modules/@ultimate/ai/dist/context/llms-full.txt
node_modules/@ultimate/ai/dist/context/llms-ng.txt
node_modules/@ultimate/ai/dist/context/llms-react.txt
node_modules/@ultimate/ai/dist/context/llms-vue.txt
```

These are **never** at `packages/ai/dist/context/` from a consuming project's perspective — that path only exists inside the Ultimate monorepo's own source tree. A consuming project reaches the generated files exclusively through its own `node_modules`, per the normal npm package-artifact model (spec §7.1a). No CDN, no separate download, no runtime fetch.

## What these artifacts are not

Per Blueprint §25: "Generated outputs should not become the primary source of truth." These five files are derived, regenerable artifacts. If a fact in `llms-full.txt` looks wrong, the fix belongs upstream — in Ultimate's own `@ultimate/component-metadata` (for a factual error) or `skills/` content (for a guidance error) — followed by regeneration, never a hand-edit of the generated file itself.
