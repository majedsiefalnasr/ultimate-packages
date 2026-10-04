# GAP-083 research — Vue 3.5.0 declaration compatibility

**Date:** 2026-10-04
**Evidence gathered at:** a scratch clone at `f9958a7`, whose `packages/` tree is identical to `main` `770d44e` (Node 24.15.0, pnpm 9.6.0, vue-tsc 2.2.12, TypeScript 5.9.3, workspace Vue 3.5.42).
**Status:** research record. Sections 1–5 are the evidence and options as presented to the Architecture Discussion; §6 records the decision taken on them (ADR-050). No implementation, no GAP status change.

## 1. Question

`@ultimate/vue` and `@ultimate/vue-core` declare `vue: ^3.5.0` (ADR-042). Their shipped declarations fail to type-check against Vue 3.5.0 (GAP-083). Two facts were open in the registry:

1. the earliest 3.5.x release that accepts the emitted declarations;
2. whether `@ultimate/vue-core`'s bundled declarations fail the same way.

## 2. Method

- **Static:** for every published `@vue/runtime-core` 3.5.0–3.5.43, count the type parameters of `export type DefineComponent<…>` in `dist/runtime-core.d.ts`.
- **Empirical:** run the GAP-082 consumer check (`packages/vue/scripts/validate-consumer-types.mjs`) against several consumer Vue versions. A scratch copy of the script takes the consumer `vue` version from an environment variable instead of the workspace version; nothing else changed. The check packs `@ultimate/vue` and its workspace runtime closure, installs them with the pinned `vue`, and type-checks the barrel, all 94 export keys and the fixtures with `skipLibCheck: false` under `Bundler` and `NodeNext`.

## 3. Findings

### 3.1 Where the type changed

| Vue            | `DefineComponent` type parameters |
| -------------- | --------------------------------- |
| 3.5.0, 3.5.1   | 19                                |
| 3.5.2 – 3.5.43 | 20                                |

Vue 3.5.2 added a 20th parameter, `TypeEl extends Element = any`, used for template-ref element typing. 3.5.0 was released on 2024-09-03, 3.5.1 on 2024-09-04 and 3.5.2 on 2024-09-05.

### 3.2 Consumer check by Vue version

| Consumer Vue | Result         | TS2707             | Other errors          |
| ------------ | -------------- | ------------------ | --------------------- |
| 3.5.0        | FAIL           | 396 (198 per mode) | 176 TS2322, 26 TS2578 |
| 3.5.1        | FAIL           | 396                | same                  |
| 3.5.2        | OK, both modes | 0                  | 0                     |
| 3.5.13       | OK, both modes | 0                  | 0                     |
| 3.5.43       | OK, both modes | 0                  | 0                     |

- The earliest compatible release is **3.5.2**. Only 3.5.0 and 3.5.1 in the declared range fail.
- The TS2322 and TS2578 errors follow from the TS2707 errors: the component types are lost, so the prop-key invariant and the negative fixtures fail.

### 3.3 `@ultimate/vue-core`

**Affected.** 30 of the 396 TS2707 errors (15 per mode) are in `@ultimate/vue-core/dist/index.d.mts`; the other 366 are in `@ultimate/vue`.

### 3.4 Origin

- The emitted declarations reference `DefineComponent` with 20 arguments because `vue-tsc` and tsup's declaration build expand the inferred component types against the workspace's installed Vue (3.5.42).
- The 20th argument is always the default `any`. Across `vue` and `vue-core` there are 389 such references, all ending in `, any>`.
- Pre-existing: the last pre-GAP-082 `main` (`5e76fd5`) already emitted 154 `DefineComponent<` references in `@ultimate/vue` and 7 in `@ultimate/vue-core`. GAP-082 raised these to 607 and 15.

### 3.5 Feasibility probe: 19-argument declarations

On a scratch build only, the 20th `any` argument was removed from all 389 references (right to left, so nested references are handled), and the consumer check was re-run:

| Consumer Vue          | Result                                                      |
| --------------------- | ----------------------------------------------------------- |
| 3.5.0, 3.5.1          | OK, both modes; 88 components, 661 prop keys, fixtures pass |
| 3.5.2, 3.5.13, 3.5.43 | OK, both modes                                              |

Because the removed argument equals its default, the 19-argument form means the same type on 3.5.2 and later. This shows that compatible declarations are possible. It does not settle how they should be produced.

Not tested: building the declarations against Vue 3.5.0 or 3.5.1 types instead of post-processing them.

### 3.6 Baseline Prime

- `@primevue/core@4.5.5` declares `vue: ^3.5.0` (`npm view`), which is the source of ADR-042.
- PrimeVue 4.5.5 ships hand-written declarations that use its own three-parameter `DefineComponent` from `@primevue/core` (for example `packages/primevue/src/button/Button.d.ts:282`), so Vue's internal arity changes do not reach its consumers.
- ADR-049 chose inferred `defineComponent(...)` types for Ultimate instead.

## 4. Options for the Architecture Discussion

| Option                                        | Change                                                                                                                                                                   | Consumer effect                                                     | Cost and risk                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Raise the floor                            | Peer range `vue: ^3.5.2` for `@ultimate/vue` and `@ultimate/vue-core`; ADR amending ADR-042                                                                              | Vue 3.5.0 and 3.5.1 (released 2024-09-03/04) are no longer in range | Two manifest lines, an ADR and a MIGRATION note. Diverges from PrimeVue's `^3.5.0`, which ADR-042 already says Ultimate need not track.                        |
| B. Compatible declarations                    | Keep `^3.5.0`; emit 19-argument `DefineComponent` references, by post-processing the declarations (probe in §3.5) or by building them against older Vue types (untested) | No change                                                           | A post-build transform tied to Vue's current type shape, or a declaration build pinned to an old Vue. Each future Vue type change may need the same treatment. |
| C. Hand-written declarations (PrimeVue style) | Own `DefineComponent` alias and declarations                                                                                                                             | No change                                                           | Reverses ADR-049; rewrites the 88 components' public types.                                                                                                    |

**Independent of the choice:** a minimum-version check, for example running the existing consumer check also against the declared floor (`3.5.2` under A, `3.5.0` under B or C) in `packages/vue` `validate`. Without it, the floor can silently break again. The check takes about 3 s and about 445 MB per mode per Vue version (GAP-082 research §5).

## 5. Open points for the decision

1. The supported floor: `^3.5.2` (A) or keep `^3.5.0` (B or C).
2. Whether to add the floor check to CI, and against which version(s).
3. Under B, post-processing versus building against older Vue types.

## 6. Decision (2026-10-04, user)

Option A, recorded as ADR-050, which amends ADR-042:

- The supported Vue floor for `@ultimate/vue` and `@ultimate/vue-core` becomes `^3.5.2`.
- Option B is rejected despite the §3.5 probe, because it would couple declaration generation to Vue's internal type shape. Option C is not adopted because it reverses ADR-049.
- A consumer compatibility check against `vue@3.5.2` is added to `validate`. It checks the packed declarations of both packages and is in addition to the existing check against the workspace Vue version, not a replacement.
