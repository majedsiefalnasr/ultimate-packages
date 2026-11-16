# Scoped validation

Scope: `uix-utils` / #143 DOM surface; source revision: `41e8047c4ed60eed2789c89c1bb67b27469cd039`.

Global completeness: not asserted.

Scoped reconciliation passed: the 88 named exports in `packages/uix-utils/src/dom/index.ts` (84 methods and four helpers) are individually listed in `dom.md`; each is grouped by responsibility and linked to its source path pattern and root/subpath availability. Public root-barrel and manifest paths were inspected. Browser-dependent helper behavior and environment limitations are separately described.

Verification record (source revision `41e8047c4ed60eed2789c89c1bb67b27469cd039`):

- Implementation: source exports exist; verified by source inspection.
- Behavioral tests: not run, per the inventory-only task instruction. No behavior is marked verified by tests.
- Typecheck: `pnpm typecheck` passed after building workspace declarations; this is a repository-wide typecheck, not behavioral evidence.
- Lint: `pnpm lint` passed.
- Formatting: `pnpm format:check` passed across the repository; targeted Prettier checks on the three #143 Markdown files also passed.
- Build: `pnpm build` did not pass; `apps/playground-react` could not load the PostCSS plugin `postcss-import` from `/Users/majedsiefalnasr/postcss.config.mjs`. This is recorded as an unavailable workspace build check, not evidence against the inventory documentation.
- CI enforcement: workflow inspection only; no remote CI run was observed. `.github/workflows/ci.yml:69-87` runs lint and formatting on pull requests, while build, typecheck and general validation are skipped when changes classify as docs-only. `scripts/provenance/classify-changes.mjs:72-77,97-104` classifies Markdown outside tool-read and non-doc prefixes as docs-only; this `docs/inventory/` Markdown qualifies. CI configuration is not execution evidence.
- Product defects, if found during inventory, are out of this ticket's scope and must be recorded rather than fixed here.

Pending relationships:

- `package.ultimate.uix-utils.root`: shared #143/#144 record; package ownership is present in `docs/inventory/packages/packages.md`.
- `package.ultimate.uix-utils.scroll-lock`: sibling #144 scope; relationship to the DOM body's scroll helpers is recorded in `dom.md`.
- `package.ultimate.uix-utils` value/event records: #144 sibling scope; cross-ticket inventory is not a completion claim for #143.
