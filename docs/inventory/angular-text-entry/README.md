# Angular text entry and field composition — issue #110

Implements live [#110](https://github.com/majedsiefalnasr/ultimate-packages/issues/110)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `07ced02e76e763352e806fc53006976eb0f6259d`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/angular-text-entry.json`, not generated details. The existing
pilot pipeline and family-alias resolution are reused unchanged. Scope: input-text,
textarea, input-mask, input-otp, password, float-label, ifta-label, icon-field and
input-group under `packages/ng/src`. Each family owns its index, component or directive
source and style module. `spec.ts` and `stories.ts` files are explicit supporting-file
exclusions; every scoped file has an owner or exclusion. `UInputIcon` and
`UInputGroupAddon` are recorded inside their composition records.
`input-text` and `textarea` have no `@ultimate/ng/<family>` manifest
subpath (root entry only); the others do. No scoped hooks or standalone helpers
are exported. `UInputText` and `UTextarea` are attribute directives.

Family aliases (`package.ultimate.ng.<family>`) resolve to the records; none are
same-ticket pending. Identities owned by other tickets (ng-core base classes,
overlay, fluid, themes presets, uix-styles inputtext, uix-utils classnames) stay
explicitly pending with their owning ticket in validation; relationships here do not
complete those tickets. No dedicated component-metadata record exists for these families.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-text-entry.json --out docs/inventory/angular-text-entry
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/angular-text-entry.test.mjs
pnpm exec prettier --check scripts/inventory/angular-text-entry.json scripts/inventory/angular-text-entry.test.mjs docs/inventory/angular-text-entry
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs` (41 tests, all passed),
scoped ESLint on the new test and Prettier on the new files, using the main checkout's
installed tooling because the worktree has no `node_modules`.

## Product check: unavailable / not run

The bounded Angular suite (`pnpm --filter @ultimate/ng exec ng test ...`, see each
record's claim) was **not run**: the task limited local load (no `ng test`, build or
Storybook) and the worktree has no installed dependencies. No product assertions were
executed, so nothing is claimed about runtime behavior. Spec files present are not pass
evidence. CI enforcement is recorded as workflow configuration only; no CI run was
observed. No parity or gap judgment is made.

## Source observations (recorded, not repaired)

`UPassword` and `UInputOtp.onBlur` declare outputs with no emit site; `UIconField.iconPosition`
is declared but unread; `UPassword` passes constant `invalid: false`. These are
recorded in the records as facts only.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies,
English artifacts, scoped staging. Spec: inputs, outputs, base tiers, accessor wiring,
composition members, style helpers and manifest subpaths were read from source;
byte-exact generation and preserved authorship are tested. Owner review remains outstanding.
