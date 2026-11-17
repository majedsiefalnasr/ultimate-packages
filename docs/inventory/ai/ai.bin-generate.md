# Generate binary

ID: ai.bin-generate

Framework: shared; availability: internal

## Authored interpretation

The `ultimate-ai-generate` executable that rewrites Skill files and LLM-context files.

## Framework surface

See [authored signatures and interpretation](README.md). Arguments skillsDir and contextDir default to cwd/skills and cwd/dist/context. It regenerates existing Skill files in place or creates missing ones for every ALL_COMPONENTS record, writes the five context files, logs to stderr and exits 1 on Skill regeneration errors. `generateAllSkillFiles(skillsDir)` is exported from the module but not the root. The package build script runs it against ../../skills and context, so a build rewrites repository files.

## Public exports

None; owned internal source.

## Owned source and evidence

packages/ai/src/bin-generate.ts
skills/button.md
skills/checkbox.md
skills/dialog.md
skills/menu.md
skills/paginator.md
skills/scroller.md
skills/table.md
skills/tooltip.md

```text
packages/ai/src/bin-generate.ts: export function generateAllSkillFiles(skillsDir: string): {
packages/ai/src/bin-generate.ts: process.exit(1);
packages/ai/package.json: "ultimate-ai-generate": "./dist/bin-generate.mjs"
skills/button.md: component: Button
```

## Relationships

ai.skill-file
ai.context-files
package.ultimate.component-metadata.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Generate binary is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product behavior remains unverified: pnpm --filter @ultimate/ai test aborted before tests because the host ancestor PostCSS config could not load postcss-import. The package typecheck passed; the product build and artifact validator were not run because build rewrites generated files. See quality-run.json for command outcomes and limits."
  },
  {
    "state": "ci-enforced",
    "behavior": "The AI package boundary validation step in the workflow runs regardless of docs-only classification; it checks package boundaries and is not a product behavior check. Lint and format run on the docs-only path; build, typecheck and product tests are skipped. No CI run or boundary result is claimed for this inventory. For changes classified as non-docs, the workflow additionally runs build, generated artifact validation, and tests; these steps are skipped on the docs-only path.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/ai.json --out docs/inventory/ai (run twice; authored README SHA-256 checked before and after)",
    "revision": "84805a04a25704f0d942148892b9935d41c89b7c",
    "outcome": "passed",
    "output": "Scoped reconciliation completed with no problems: 24 scoped files accounted for, 15 root export identities attributed to public records, cross-scope references recorded as pending.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; cross-scope relationships remain pending, and global completeness, installed package resolution, generated artifact rewrite, binary execution and product behavior are not asserted.",
    "run": "docs/inventory/ai/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash."
  }
]
```
