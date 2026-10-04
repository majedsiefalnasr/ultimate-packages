# GAP-082 typed Vue props closeout — `feature/gap-082-typed-vue-props`

**Date:** 2026-10-04
**Range:** Spec, ADR-049 and research `376b23e`; Plan `31b617b`; implementation `3249079..0eebd1b` (7 commits) on a branch from `main` `5e76fd5`.
**Status:** closeout recorded. Merge awaits user authorization. Nothing pushed or merged.

## Outcome

All six Plan tasks are complete, and each passed its task review.

- **Task 4** (the nullability classification) had its own review gate before Task 5 applied it.
- **The final whole-branch review** (`31b617b..bb4d1a4`) found no Critical or Important issues. Its fix-before-merge items and the invariant hardening were fixed in `0eebd1b`, and a scoped re-review of that commit was clean.

| GAP                                                    | Status   | Delivered by                                                                |
| ------------------------------------------------------ | -------- | --------------------------------------------------------------------------- |
| GAP-082 Vue components ship without typed public props | RESOLVED | `3249079`, `f146ea8`, `145ca81`, `2e45411`, `ec3112f`, `bb4d1a4`, `0eebd1b` |
| GAP-083 Vue 3.5.0 declaration compatibility (new)      | MISSING  | registered at this closeout (pre-existing)                                  |

Delivered, per ADR-049:

- **Typed factories.** The 95 Vue base factories return inferred `defineComponent(...)` types instead of `ComponentOptions`. SFCs and `extends` chains are unchanged (ADR-032).
- **The 11 type-less props** are typed type-only, per Spec §5.2:
  - `any` for the value-like props;
  - `string | null` for `size` and `variant`;
  - `boolean | null` for `fluid`.
- **Array props.** All 44 array props accept mutable and readonly arrays (36 factory, 2 union, 6 SFC-local via JSDoc casts).
- **Nullability.** 222 props were classified in research §7:
  - 11 fixed by the Spec;
  - 19 nullable on evidence: N1 18 (one through explicit forwarding, user decision 2026-10-04), N2 1;
  - 192 non-nullable.

  18 props received a type-only `| null`; `CascadeSelectSublist.selectedValue` has no type effect (user decision).

- **CI enforcement.** `packages/vue`'s `validate` script runs the consumer type-check, which CI's "Validate generated artifacts" step already runs after "Build". The check:
  - installs the packed package with a pinned `vue`;
  - type-checks the barrel and all 94 export keys under `Bundler` and `NodeNext` with `skipLibCheck: false`;
  - runs the positive and negative fixtures;
  - runs an exhaustive per-key invariant: every exported component's runtime prop keys must exist in its `$props`.

  The invariant is hardened against `any`/`unknown`/non-constructor/index-signature false passes, and against silent shrinking of the component list or the fixtures.

## Verification

- **Consumer check:** OK in both modes. 88 prop-bearing components, 661 runtime prop keys typed, and 16 propless components derived and listed.
- **Negative control.** Against the erased baseline the check fails with 79 invariant errors, 12 unused expect-error markers and 1 TS4104 per mode.
- **Guard proofs.** A scratch `tsc` probe shows that each of these makes the hardened invariant fail:
  - `any`, `unknown`, `never`;
  - a non-constructor;
  - index-signature or `any` `$props`;
  - partial erasure.
- **Package checks:** `vue-tsc --noEmit` for `@ultimate/vue` and `@ultimate/vue-core` reports 0 errors; `apps/playground-vue` type-checks (including the readonly `UScroller :items` case); `integrity:pack-install @ultimate/vue` passes.
- **Tests:** `@ultimate/vue` 898/898 and `@ultimate/vue-core` 96/96, unchanged from `main`.
- **Runtime parity.**
  - The runtime prop-declaration comparison against a `main` build shows only the 11 type-less props going from an absent `type` to `type: null`, which Vue treats identically.
  - A bare `fluid` still yields `""`, with no new development warnings.
  - The final review confirmed parity by normalizing all 101 changed source files.
- **Costs:** recorded in research §5.
  - `@ultimate/vue` declarations: 194 KB → 623 KB.
  - Barrel gzip: +1.2%, under the 15% gate.
  - Tarball: about 1079 KB.
  - Consumer check: about 3 s and about 445 MB per mode.

## Verification boundary

- `size:validate` compares against `origin/main`. This repository has no remote, so it is externally unexercisable locally; `size:measure` and the recorded barrel gzip stand in.
- The real CI run happens only on push.

## Accepted rulings and user decisions

1. **Per-key invariant.** The exhaustive invariant (a user requirement at Task 1) is a per-key check derived from runtime props, not a "has any props" check. The weaker check would have let partially erased components such as `UScroller` pass.
2. **Commit trailer.** `3249079` carries "Claude Sonnet 5.5" in its trailer instead of the mandated "Claude Opus 5.5". It was not amended, because amending rewrites history and needs explicit authorization.
3. **Lint suppression.** `UTable.selection` keeps `Record<string, any>` with a reasoned lint suppression, because it preserves the existing inferred type.
4. **Scope count.** The `default: null` scope is 173 props, not the Spec's "142". The research regex had matched only single-line typed declarations. The total classification scope was 222.
5. **Internal prop.** `Menuitem.focusedOptionId` (internal) was typed from its `[String, Number]` constructor, which is Vue's existing inference.
6. **Kebab-case.** Kebab-case props are type-checked. Only `aria-*` kebab names fall back to native attribute typing, which is less strict but never a false error.
7. **User decisions after Task 4:**
   - `UOverlayBadge.value` is nullable through explicit forwarding to `UBadge.value`;
   - the `ariaLabelledby` pair stays as classified (OrderList nullable on N2, PickList not);
   - `UCarousel.value` stays nullable;
   - `CascadeSelectSublist.selectedValue` has no type effect.
8. **Final-review fixes.** Fixed: the stale `ComponentOptions` comments, the MIGRATION GAP-079 contradiction, the invariant hardening, the KiB label, and the MIGRATION null sentence.

## Deferred items (non-blocking)

- **Flaky test.** The `src/table/table.spec.ts` test "is exported from the package root" can time out at 5000 ms under load. It takes about 2.1 s on its own, and the final full run passed 898/898. This is the same class of load-related flake recorded at the follow-up closeout.
- **GAP-083.** Registered at this closeout and kept separate from GAP-082.
- **Minor findings.** Every per-task minor finding and its "keep deferred" disposition, as triaged by the final review, remains in the git-ignored ledger `.superpowers/sdd/2026-10-03-gap-082-typed-vue-props/progress.md`. Examples:
  - consumer-check diagnostics polish;
  - an import-style note;
  - pre-existing `BaseToast.ts:13` comment wording;
  - cosmetic comment and research wording.
- **Consumer-visible consequence of the nullability rule.** `null` on a prop whose contract excludes `null` is now a TypeScript error. Examples are `<UInputChips v-model>` with a `T[] | null` ref and `<UAccordion v-model:value>` with `string | null`. This is recorded in MIGRATION §8.

No other new GAPs were created.
