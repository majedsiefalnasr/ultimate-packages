# Section renderer

ID: ai.render-section

Framework: shared; availability: public

## Authored interpretation

Renders the content of the five generated Skill sections directly from component metadata fields.

## Framework surface

See [authored signatures and interpretation](README.md). `renderSection(section: SectionKey, component: ComponentMetadata, frameworks: readonly Framework[]): string` plus the `Framework` (ng | react | vue) and `SectionKey` (preferred-patterns, allowed-apis, anti-patterns, accessibility-guidance, related-components) types. Returns an empty string when the backing metadata field is absent.

## Public exports

@ultimate/ai#renderSection
@ultimate/ai#Framework
@ultimate/ai#SectionKey

## Owned source and evidence

packages/ai/src/render-section.ts

```text
packages/ai/src/render-section.ts: export function renderSection(
packages/ai/src/render-section.ts: export type Framework = "ng" | "react" | "vue";
```

## Relationships

package.ultimate.component-metadata.root (pending cross-batch)
package.ultimate.component-schema.root (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for Section renderer is present; this record describes the current source without asserting framework parity."
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
