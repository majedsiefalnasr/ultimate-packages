# Specification — Typed Vue Component Props (GAP-082)

**Status:** Implemented on `feature/gap-082-typed-vue-props` (closeout 2026-10-04); GAP-082 RESOLVED; GAP-083 registered. Spec Review decisions in §12.
**Date:** 2026-10-03
**Branch:** `feature/gap-082-typed-vue-props` (from `main` `5e76fd5`)
**Origin:** GAP-082 (`docs/architecture/BLUEPRINT_GAPS.md`); decision ADR-049; evidence `docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md`. Parity baseline: ADR-048 (PrimeVue `4.5.5`, reference only).

**Required sequence:** Decision (ADR-049, approved) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

`@ultimate/vue` ships component declarations with empty or partial prop types. TypeScript consumers therefore get no prop checking: `<UButton :label="123" />` compiles. GAP-082 makes the generated declarations carry real prop types, so that wrong prop value types become compile-time errors. It must not create false errors in valid code, and it must not change runtime behavior.

**In scope:**

- the 95 Vue base factories;
- the 11 type-less props;
- all array props;
- nullability of props under the rule in §5.4;
- consumer-level verification;
- a MIGRATION note;
- recording the size and type-check cost.

**Out of scope:** see §11.

## 2. Decisions This Specification Implements

- **ADR-049** (user, 2026-10-03):
  - inferred typed factories;
  - type-only typing (no runtime behavior change);
  - arrays accept mutable and readonly arrays;
  - the contract-based nullability rule.
- **ADR-032:** Options-API `extends:` mixin chains stay. SFCs stay plain JavaScript `<script>`.
- **GAP-082 contract** (registration, GAP-079 Spec §5.2, follow-up closeout): real prop types; wrong prop types are compile errors; emits keep their existing types.
- **User direction, Decision Brief (2026-10-03):**
  - no enum precision (no `HintedString` or literal unions) unless the contract requires it;
  - no runtime behavior changes for typing;
  - the size and type-check impact is recorded.

## 3. Framework Applicability

Vue only: `packages/vue` and `packages/vue-core`. Angular and React are unaffected.

## 4. Existing Behavior (verified on `5e76fd5`)

- **Factories:**
  - 90 `createBase*` factories in `packages/vue/src` and 5 in `packages/vue-core/src` are annotated `: ComponentOptions`. The vue-core 5 are `createBaseComponent`, `createBaseEditableHolder`, `createBaseInput`, `createDisplayOrderMixin` and `createGlobalEscapeKeyMixin`.
  - 105 of 108 SFCs `extend` a factory result.
- **Exported components (104):**
  - 94 have empty props.
  - 10 have only SFC-local props.
  - 16 declare no props.
- **The 11 type-less props:**
  - `modelValue` and `defaultValue` (`base-editable-holder.ts`);
  - `size`, `fluid` and `variant` (`base-input.ts`);
  - `value` (`BaseCheckbox.ts`, `BaseRadioButton.ts`);
  - `trueValue` and `falseValue` (`BaseCheckbox.ts`, `BaseToggleSwitch.ts`).
- **Array props (44):**
  - 36 factory `type: Array` props;
  - 6 SFC-local `type: Array` props: `TieredMenuSub.vue`, `MenubarSub.vue`, `PanelMenuList.vue`, `GalleriaContent.vue`, and two in `CascadeSelectSublist.vue`;
  - 2 union types containing `Array`: UTable `selection` (`[Object, Array]`) and UAccordion `value` (`[String, Number, Array]`).
- **Null defaults:** 142 typed props use `default: null`.
- **Declaration pipeline:** `tsup` → `vue-tsc -p tsconfig.dts.json --emitDeclarationOnly` → `scripts/rename-dts.mjs` (vue). `tsup` + `rename-dts.mjs` (vue-core).

## 5. Required Behavior

### 5.1 Typed factories

Every factory listed in §4 returns `defineComponent({...})` with an inferred return type. The `: ComponentOptions` annotation is removed.

The returned options object stays the same. `defineComponent` returns its argument unchanged, so no option, prop, default, emit, hook or method may change in value.

SFCs keep their `<script>` (no `lang="ts"`, no `<script setup>`) and their `extends:` chains.

### 5.2 The 11 type-less props

Each prop gets a type-only declaration whose runtime `type` stays non-validating (`null`, which is behaviorally identical to an absent `type`):

| Props                                                            | Public type                                                                                                                                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`, `defaultValue`, `value`, `trueValue`, `falseValue` | `any`, via `type: null as unknown as PropType<any>`. `PropType<unknown>` collapses in Vue's inference and must not be used. These accept any value, including `null`. |
| `size`, `variant`                                                | `string \| null`, via a type-only `PropType`                                                                                                                          |
| `fluid`                                                          | `boolean \| null`, via a type-only `PropType`                                                                                                                         |

`size`, `variant` and `fluid` are nullable because `base-input.ts` treats `null` as "unset, inherit" (§5.4, criterion N1).

Runtime `String`/`Boolean` types must not be used. They would add development-mode prop warnings, and `Boolean` would cast a bare `fluid` attribute from `""` to `true`, which is a runtime behavior change.

**`fluid`: type contract vs. runtime behavior.** The public type `boolean | null` describes `fluid`'s intended public contract. It is not evidence that every form of usage behaves as intended at runtime today.

| `fluid` usage                      | TypeScript (after GAP-082)                 | Runtime                                                                                                                   |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `:fluid="true"` / `:fluid="false"` | valid                                      | unchanged                                                                                                                 |
| `:fluid="null"`                    | valid                                      | unchanged ("unset, inherit")                                                                                              |
| bare `<UInputText fluid />`        | valid at the TypeScript/template API level | **unchanged by GAP-082**: Vue passes `""` to the prop, and `resolvedFluid` (`this.fluid ?? …`) keeps `""`, which is falsy |
| `:fluid="'yes'"`                   | type error                                 | unchanged                                                                                                                 |

The current Ultimate runtime behavior for a bare `fluid` attribute is a separate runtime behavior gap, and GAP-082 does not change it. GAP-082 types `fluid` according to its intended public contract, without introducing Vue Boolean prop casting or any other runtime change. If bare `fluid` is confirmed as a required runtime behavior, it must be tracked and addressed separately.

### 5.3 Array props

Every array prop accepts both mutable and readonly arrays:

- **Factory props:** `type: Array as PropType<readonly unknown[]>`, plus `| null` when §5.4 applies.
- **Union props:** the same treatment for the `Array` member, with the other members kept. For example, `[Object, Array] as PropType<Record<string, any> | readonly unknown[]>`.
- **SFC-local props** in JavaScript `<script>` blocks: the equivalent JSDoc type cast, `type: /** @type {import('vue').PropType<readonly unknown[]>} */ (Array)`. `vue-tsc` honors it. No SFC is converted.

The runtime `type` stays `Array` (or the original union).

### 5.4 Nullability rule (ADR-049)

A prop's public type includes `null` only when `null` is a valid value of its runtime/public contract.

Not sufficient on its own:

- `default: null`;
- Vue's runtime acceptance of `null`, since every non-required prop accepts it.

Evidence, in priority order:

- **N1 — Ultimate source:** the component or its base handles `null` as a meaningful value for that prop, with defined behavior. Examples are a `?? fallback`, an explicit `=== null` / `== null` branch, or passing `null` through as an intended model value.
- **N2 — Ultimate usage:** Ultimate's own stories, specs, docs or playground pass `null` to the prop as intended usage.
- **N3 — PrimeVue reference:** the corresponding PrimeVue `4.5.5` prop's declared type includes `null`. This counts only when Ultimate's source handles a `null` value for that prop without error.

The rule applies to:

- the 11 props (§5.2, already decided);
- all 44 array props;
- every other prop declared with `default: null`.

Each such prop is classified as nullable or non-nullable, and the classification is recorded with its evidence (§7). A prop with no qualifying evidence stays non-nullable.

Nullable props are typed with a type-only `PropType<T | null>`, or the JSDoc equivalent in SFCs. Their runtime `type` stays as it is.

### 5.5 Emits, slots, unknown props

Emits keep their current typing: event names, array-declared payloads (`any[]`). Inherited emits that become visible through §5.1, such as `onUpdate:modelValue`, are expected.

Slots stay untyped. Unknown props are still accepted (attribute fallthrough).

### 5.6 No false errors for valid code

The existing consumer corpus must type-check with zero errors against the built packages. The corpus is:

- `packages/vue` and `packages/vue-core` sources, specs and stories (`vue-tsc --noEmit`);
- `apps/playground-vue`;
- the valid-usage fixture of §8.

### 5.7 Runtime unchanged

The built runtime must behave as on `main`:

- Test suites pass with unchanged counts.
- The effective runtime prop declarations of every exported component are identical, except the 11 props' `type` going from absent to `null`.
- No new development warnings.
- Existing runtime behavior for a bare `fluid` attribute is preserved: the prop still receives `""`, and `resolvedFluid` is unchanged. This is a regression guard for "no runtime change". It does not assert that bare `fluid` currently gives the intended full-width behavior (see §5.2).

## 6. API Requirements

- **Component props:** the public component props become typed, which is the purpose of this GAP. This adds compile errors for code that passes wrong types.
- **Factory return types:** the public `createBase*` return types change from `ComponentOptions` to the inferred component types. Using a factory result as a `ComponentOptions` value (annotation, parameter, spread) becomes a TypeScript error. `extends:` usage is unaffected.
- **Runtime:** no runtime API changes.
- **Packaging:** the `exports` maps, entry points and build scripts are unchanged.

## 7. Affected Files

- **Factories:** `packages/vue-core/src/base/{base-component,base-editable-holder,base-input}.ts` and `packages/vue-core/src/escape/{create-display-order-mixin,use-global-escape-key}.ts`.
- **Factory files in `packages/vue/src`:** every file that defines a `createBase*` factory (90 factories).
- **SFCs with local array props:** the 5 listed in §4, plus any SFC-local prop that §5.4 classifies as nullable.
- **New consumer-verification tests and fixtures:** the location and form are decided by the Plan, within §8.
- **`docs/architecture/MIGRATION.md` §8:** a consumer-facing note on typed props and on the factory return-type change.
- **`docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md`:** the nullability classification table (§5.4) and the recorded size and type-check measurements.
- **At closeout only:** `docs/architecture/BLUEPRINT_GAPS.md` (GAP-082 status).

## 8. Acceptance Criteria

| Criterion                                                                                                                                                                                                                                                                                                                       | Traces to               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Every exported prop-bearing component's emitted declaration exposes its props (a probe over all 104 exports reports no prop-bearing component with empty props); the propless components are listed                                                                                                                             | §5.1                    |
| A consumer that resolves the built `@ultimate/vue` through its `exports` map type-checks with **0 errors** under `Bundler` and under `NodeNext`. It imports the barrel and every exported subpath, with `skipLibCheck: false`.                                                                                                  | §5.1, GAP-079 invariant |
| In that consumer, `@ts-expect-error` / `@vue-expect-error` markers are all consumed. They cover: `UButton :label="123"` and `h(UButton, { label: 123 })`; wrong types for `size`, `variant` and `fluid`; a wrong type for a factory array prop, an SFC-local array prop and a union array prop                                  | §1, §5.2, §5.3          |
| Negative control: the same invalid fixture against `main`'s build leaves the markers unused (TS2578)                                                                                                                                                                                                                            | §1                      |
| A valid-usage fixture type-checks with 0 errors. It covers: `v-model` on editable components; arbitrary values for the 5 `any` props; `size`/`variant` strings and `null`; `fluid` bare, `true` and `null`; mutable and readonly arrays for factory, SFC-local and union props; `null` on a sample of props classified nullable | §5.2–§5.4, §5.6         |
| `vue-tsc --noEmit` passes for `packages/vue` and `packages/vue-core`, specs and stories included; `apps/playground-vue` type-checks against the built package (including `App.vue:44`)                                                                                                                                          | §5.6                    |
| vue and vue-core test suites pass with unchanged counts                                                                                                                                                                                                                                                                         | §5.7                    |
| The runtime prop-declaration comparison against `main`'s build shows only the 11 props' `type` absent → `null`; existing bare-`fluid` runtime behavior is preserved (prop receives `""`, `resolvedFluid` unchanged; not an assertion of intended full-width behavior); no new development warnings                              | §5.7                    |
| The nullability classification table covers the 11 props, all 44 array props and every `default: null` prop, each with N1/N2/N3 evidence or "no evidence → non-nullable"                                                                                                                                                        | §5.4                    |
| `MIGRATION.md` §8 records typed props (new compile errors for wrong types) and the `createBase*` return-type change                                                                                                                                                                                                             | §6                      |
| Declaration bytes, tarball size, barrel gzip and consumer type-check time are measured and recorded; `size:validate` passes                                                                                                                                                                                                     | §2                      |
| The consumer type-check (rows 2–5: built package, `exports`-map resolution, `skipLibCheck: false`, `Bundler` and `NodeNext`, positive and negative fixtures) is committed and runs in the existing Vue CI validation, failing the build on regression                                                                           | §9 (CI-enforced)        |
| The build-specifier guard, `integrity:pack-install @ultimate/vue`, and the existing Vue CI checks pass; touched files gain no new prettier or lint failures (including the JSDoc-cast style)                                                                                                                                    | non-regression          |

## 9. Verification Approach

**CI-enforced (Spec Review Q2).** The consumer type-check (rows 2–5) is committed as a reproducible check and wired into the existing Vue CI validation. It must:

- use the actual built `@ultimate/vue` (and `@ultimate/vue-core`) package;
- resolve imports through the package `exports` map;
- run with `skipLibCheck: false`, under both `Bundler` and `NodeNext`;
- include the positive (valid-usage) and negative (`@ts-expect-error` / `@vue-expect-error`) fixtures.

A regression that silently drops component prop types, which is how GAP-082 arose, must fail CI. The negative control against `main` (row 4) is a one-time proof during implementation and is not run in CI. The Plan chooses which existing CI job and script hosts the check.

## 10. Evidence/Source References

- Research: `docs/architecture/research/2026-10-03-gap-082-typed-vue-props-research.md` (§4.1 type-less props, §4.2 arrays, §4.3 nullability, §5 costs, §6 factory types).
- Decision: ADR-049; ADR-032; ADR-048.
- PrimeVue `4.5.5`: published tarballs; source `66dde67` (`packages/primevue/src/button/Button.d.ts`, `packages/core/src/index.d.ts`).

## 11. Explicit Out-of-Scope Items

- typed slots
- emit payload typing
- literal-union / `HintedString` enum precision
- `pt`/`dt`/`unstyled` props
- unknown-prop rejection
- PrimeVue declaration parity
- hand-written declaration files
- SFC TypeScript conversion or `<script setup>`
- runtime prop validation changes
- declaration-size reduction work
- changing the runtime behavior of a bare `fluid` attribute (a separate runtime behavior gap if confirmed; see §5.2)
- Angular, React, GAP-064

## 12. Spec Review Decisions (2026-10-03)

- **Q1 — Classification breadth: broad.** The nullability classification covers all 11 type-less props, all 44 array props and every prop currently declared with `default: null` (142). Nullability is never inferred from `default: null`. Each prop is classified by the §5.4 evidence hierarchy (N1, then N2, then N3); with none, it is non-nullable and recorded as "no qualifying evidence".
- **Q2 — Enforcement: CI-enforced.** See §9.
- **Q3 — N3 weight: unchanged.** A PrimeVue `4.5.5` nullable declaration is supporting evidence only. It counts as N3 only when Ultimate's implementation also tolerates and meaningfully handles `null`. PrimeVue is a reference baseline, not the specification of Ultimate's runtime contract.
- **`fluid` clarification.** GAP-082 types `fluid` as `boolean | null` and accepts a bare `fluid` at the TypeScript level. It does not change the runtime handling of a bare `fluid` attribute; that is a separate runtime behavior gap if confirmed (§5.2, §11).
