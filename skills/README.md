# Skills

One Skill file per Ultimate component currently in `@ultimate/component-metadata`'s `ALL_COMPONENTS` set (8 in v1: Button, Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip). See `docs/superpowers/specs/2026-09-07-phase-9-ai-skills-llm-context-design.md` §6 for the full contract; summarized here for contributors authoring or editing a Skill file by hand.

## Structure

Every Skill file opens with a YAML frontmatter block:

```yaml
---
component: Button
metadataVersion: 1
frameworks: [ng, react, vue]
---
```

Below the frontmatter, the file's body has 5 generated, marker-delimited sections — never hand-edit the content between a `<!-- ultimate:generated:start section="..." -->` / `<!-- ultimate:generated:end section="..." -->` pair; it is rewritten on every regeneration (`pnpm --filter @ultimate/ai run build`):

- `preferred-patterns`
- `allowed-apis`
- `anti-patterns`
- `accessibility-guidance`
- `related-components`

Everything else in the file — headings, the "When to use" section, and the prose narrative parts of "Preferred patterns"/"Anti-patterns"/"Framework-specific guidance" — is hand-authored and preserved verbatim across regenerations.

## Authoring a Skill by hand

Write prose freely outside marker pairs. Never claim a fact about a component's API, accessibility, or relationships that isn't already backed by a marker-section's generated content — if a claim needs backing, it belongs in `@ultimate/component-metadata`'s source data, not invented in a Skill's prose.

## Validating

```bash
node packages/ai/dist/bin-validate.mjs skills
```

Checks (in order): frontmatter component/framework/metadataVersion references, marker structure (all 5 present, correctly paired, non-nested), and generated-section fidelity (marker content matches what regeneration would produce). Never checks hand-authored prose for factual accuracy — that is architecturally out of scope (spec §10.2/§12).
