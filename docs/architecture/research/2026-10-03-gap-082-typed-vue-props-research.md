# GAP-082 typed Vue props — research and architecture evidence

**Date:** 2026-10-03
**Repository state:** `main` `5e76fd5`. Measurements were taken in scratch copies outside the repository. No repository file was changed during the research.
**Baseline:** PrimeVue `4.5.5` (commit `66dde6788220fc9e6822342919d1ceb0e3460ece`), per ADR-048. The published tarballs `primevue@4.5.5` and `@primevue/core@4.5.5` were used.
**Status:** point-in-time evidence (AGENTS.md tier 6). Decision: ADR-049.

## 1. Root cause

Every Vue base factory is annotated `: ComponentOptions`. That covers 90 `createBase*` factories in `packages/vue/src`, plus `createBaseComponent`, `createBaseEditableHolder`, `createBaseInput` and two mixin factories in `packages/vue-core/src`: 95 in total.

All 108 SFCs use a plain JavaScript `<script>` (none use `lang="ts"` or `<script setup>`). 105 of them `extend` a factory result. `vue-tsc` does infer types from these object literals, but the annotation erases the inherited props. The emitted declarations put `ComponentOptions` in `DefineComponent`'s `Extends` slot (see `packages/vue/dist/button/Button.vue.d.mts`).

Props declared directly in an SFC survive this. Emits declared in an SFC also survive.

## 2. Gap on `main`

Of 104 exported SFC components:

- 94 have empty props.
- 10 are partially typed: only their SFC-local props survive.
- 0 are fully typed.
- 16 of the 104 declare no props at all.

For `UButton`, a wrong-type prop is accepted silently: `<UButton :label="123" />`, `h(UButton, { label: 123 })` and an unknown prop all pass.

## 3. Pinned PrimeVue

At the pinned commit, `Button.vue` is a plain JavaScript `<script>` with `extends: BaseComponent`, the same runtime pattern as Ultimate.

Its public types are a separate hand-written layer. `src/button/Button.d.ts` is byte-identical to the published `button/index.d.ts`. It types the component with a minimal custom `DefineComponent<P, S, E>` from `@primevue/core`, and adds `ButtonProps`, `ButtonSlots` and `ButtonEmits`. All 122 component directories ship such a file.

Of PrimeVue's 138 literal-union props, 131 use `HintedString<T> = (string & {}) | T`, which accepts any string (autocomplete only). Only 7 are strict unions.

PrimeVue nullability is per component and inconsistent. For example, `size` is `| null` on InputText but not on Select or Textarea. DataTable `value` is `readonly T[] | undefined | null`.

## 4. Approach A — inferred typed factories

Approach A drops the annotation and returns `defineComponent({...})`. `defineComponent(obj) === obj`, so runtime objects are identical. The scratch production replica ran the real `tsup` → `vue-tsc` → `rename-dts.mjs` builds for vue-core and vue:

- **Builds:** pass, and the specifier guard passes.
- **Tests:** vue-core 96/96 and vue 898/898, the same as `main`.
- **Typecheck:** `vue-tsc --noEmit` reports 0 errors, including specs and stories.
- **Coverage:** all 88 prop-bearing exported components expose their props. Inherited props survive two- and three-level `extends` chains.
- **Emits:** inherited emits become visible (e.g. `onUpdate:modelValue` on UInputText). Payloads stay `(...args: any[]) => any`, because emits are declared as arrays.
- **Slots:** remain untyped.
- **Consumer:**
  - Resolution goes through `exports`: the barrel plus 94 export keys, `skipLibCheck: false`.
  - Result: 0 errors under `Bundler` and under `NodeNext`.
  - `@ts-expect-error` / `@vue-expect-error` on `UButton :label="123"` and on `h(UButton, { label: 123 })` are consumed.
  - Negative control: the same markers are unused (TS2578) against `main`'s `dist`.

### 4.1 Type-less props (11)

These props have no runtime `type`: `modelValue` and `defaultValue` (`base-editable-holder.ts`); `size`, `fluid` and `variant` (`base-input.ts`); `value` (`BaseCheckbox.ts`, `BaseRadioButton.ts`); and `trueValue`/`falseValue` (`BaseCheckbox.ts`, `BaseToggleSwitch.ts`).

Under plain Approach A they infer from their defaults, as `undefined`, `null | undefined` or `boolean | undefined`. That rejects valid code: `v-model` on UInputText, USelect and UCheckbox, `size="small"` and `variant="filled"`. It also caused the only three declaration errors in `base-editable-holder.ts`.

The type-only treatment fixes this without any runtime change:

- `type: null as unknown as PropType<any>` for the five value-like props.
- `PropType<…>` for `size`, `variant` and `fluid`.

A runtime comparison covered 106 exported objects and 661 effective props. The only differences are `type: undefined` → `type: null` on these props, which Vue treats identically: no validation, no casting. A bare `fluid` attribute stays `""` in both builds.

By contrast, runtime `type: String` adds a development "Invalid prop" warning for non-string values. Runtime `type: Boolean` casts a bare `fluid` to `true`.

`PropType<unknown>` collapses to `undefined` in Vue's inference and cannot be used.

### 4.2 Array props (44)

There are 36 factory props, 6 SFC-local props and 2 unions (UTable `selection`, UAccordion `value`). `type: Array` infers a mutable `unknown[]`, which rejects `readonly` arrays (TS4104). That breaks `apps/playground-vue/src/App.vue:44` (`UScroller :items`). `main` already rejects `readonly` arrays for the SFC-local props.

The type-only treatment, `Array as PropType<readonly unknown[]>` with the unions cast likewise, accepts mutable and readonly arrays alike. Wrong types are still rejected. The playground compiles, and there is no runtime difference.

The 6 SFC-local props sit in JavaScript `<script>` blocks. A JSDoc cast `/** @type {import('vue').PropType<readonly unknown[]>} */ (Array)` is honored by `vue-tsc` and emitted into their declarations.

### 4.3 Nullability evidence

Vue's runtime accepts `null` for every non-required prop, so runtime acceptance alone distinguishes nothing. 142 typed props use `default: null`.

`default: null` alone is not evidence of a public `null` contract. For example, InputChips `modelValue` defaults to `null`, but PrimeVue types it without `null`.

`base-input.ts` treats `null` as "unset, inherit" (`this.variant ?? null`, `this.fluid ?? pcFluid`).

Of the array props with a PrimeVue counterpart, PrimeVue includes `null` for 6:

- Accordion `value`
- DataView `value`
- VirtualScroller `items` (Ultimate `UScroller`)
- DataTable `value`, `multiSortMeta` and `selection`

29 counterparts exclude `null`, and 8 Ultimate array props have no counterpart.

## 5. Costs

| Metric                                                                                 | `main`              | Approach A (with treatments) |
| -------------------------------------------------------------------------------------- | ------------------- | ---------------------------- |
| `@ultimate/vue` `.d.mts` bytes                                                         | 194 KB              | 610–620 KB                   |
| vue-core `index.d.mts`                                                                 | 17.5 KB             | 21.4 KB                      |
| Barrel `index.mjs` gzip (the CI size gate tracks only this metric, at a 15% threshold) | 135.3 KB            | 136.3 KB (+0.75%)            |
| `npm pack` tarball                                                                     | 1037 KB             | 1059 KB                      |
| Consumer typecheck, importing all 94 keys (3 runs)                                     | about 1.7 s, 245 MB | about 2.5 s, 400 MB          |

The cause of the declaration growth: each SFC declaration inlines its full inherited props type, and each factory declaration repeats it. PrimeVue `4.5.5` ships about 1.18 MB of `.d.ts`.

An earlier `du`-based figure of "+12%" was wrong; the table above uses byte counts.

Not measured:

- editor responsiveness
- consumers that import only a few subpaths

## 6. Factory return types

The `createBase*` factories are exported publicly. No code outside `packages/vue` and `packages/vue-core` uses them.

The inferred return type is not assignable to `ComponentOptions`, because the `setup` signatures differ. So `const x: ComponentOptions = createBaseButton()` fails with TS2322, as does passing the result to a `ComponentOptions` parameter or spreading it into one. `defineComponent({ extends: createBaseButton() })` still compiles.

There is no runtime difference.

`MIGRATION.md` §8 already records consumer-visible declaration changes (the GAP-079 entries).
