# Angular actions and identity — issue #107

This bounded inventory implements live #107 under #98 at source revision
`4ad393323af126b83c46c40a53d34cdadf2070ef`. It is not platform closeout or a
product parity judgment. Start at [the generated index](index.md).

## Authorship and regeneration

Authored input: `scripts/inventory/angular-actions.json`. The existing pilot
pipeline discovers scoped files and named barrel exports; authored records
explain meaning, ownership and relationships. The pilot `angular.button` identity
and contract are reused, not renamed or duplicated as another component.

Regenerate from the repository root:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-actions.json --out docs/inventory/angular-actions
node --test scripts/inventory/*.test.mjs
```

The ten runtime records own their barrels, implementations, local style modules,
source-only style factories/parameter interfaces and protected helpers. Toolbar
composition members belong to its record. Test/story/document files have explicit
supporting dispositions in the input. Directory boundaries delimit discovery,
not the count of public APIs. Root and secondary aliases belong to one identity.
Cross-batch package IDs reconcile against `package-coverage.json`; pending detail
is explicit and does not assert complete foundation coverage.

## Executed product check

Runtime: Node `v24.15.0`. At the source revision above, executed:

```sh
pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{button,button-group,split-button,avatar,avatar-group,badge,overlay-badge,chip,tag,toolbar}/*.spec.ts'
```

**Failed, exit 1, before assertions.** Angular reported `Application bundle
generation failed.` Missing built workspace dependency declarations included
`TS2307: Cannot find module '@ultimate/ng-core'` and
`Cannot find module '@ultimate/uix-styles/table'`, with cascading `TS2339` (`cx`)
and `TS4112` (`override`) diagnostics. The Angular test tsconfig compiles sources
outside the include filter. This execution does not establish whether any scoped
behavioral assertion passes. Dependency builds and product fixes were not
attempted; source/spec presence is separately recorded as implementation evidence.

CI's conditional root `pnpm run test` step is configuration evidence, not an
observed remote result. Inventory tests are locally runnable but are not currently
included by the provenance-only `test:scripts` glob. No merge-protection claim.

## Review

Standards and Spec review were performed locally without spawning, as required.
Standards: reuse the existing public inventory seam; no new dependency, product
change, API migration or unrelated files. Fixed generated whitespace so Prettier
and byte-exact generation agree. Spec: every scoped source has one ownership or
reasoned disposition; source-only declarations and toolbar composition are
interpreted; public aliases, local/shared styling, actual theme keys and the
button-only metadata association are distinguished. No parity/gap classifications.
Owner review remains separate from this implementation review.
