# Specification — F5 Vue Declarations / Packaging: Resolvable Vue Types, Story Declarations, Declaration Source Maps (GAP-079)

**Status:** Implemented on `feature/prime-parity-followup` (closeout 2026-10-03); GAP-079 RESOLVED for declaration resolvability; the typed-props acceptance row is out of scope and tracked as GAP-082. Spec Review 2026-10-02 notes in §12.
**Date:** 2026-10-02
**Branch:** `feature/prime-parity-followup`
**Origin:** post-closeout scope lock (`docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §6–§7), GAP-079 (the Vue remainder of GAP-068), branch closeout deferred items 4 and 5 (`docs/architecture/research/2026-10-01-prime-parity-branch-closeout.md`).

**Required sequence:** Scope Lock → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for making `@ultimate/vue`'s shipped type declarations usable by TypeScript consumers, and for the two declaration-packaging leftovers recorded at the branch closeout.

**In scope:**

- GAP-079: `@ultimate/vue`'s emitted `.d.mts` files reference specifiers that do not resolve (`packages/vue/scripts/rename-dts.mjs`, `packages/vue/package.json` `build`).
- Vue ships Storybook declarations: 91 `*.stories.d.mts` files (`packages/vue/tsconfig.dts.json`).
- Stale declaration source-map references in React and Vue. 476 Vue and 265 React `.d.mts` files end with `sourceMappingURL=….d.ts.map`, but the maps were renamed to `.d.mts.map`. The maps' own `file` field still names `….d.ts`, and their `sources` point at `../../src/…`, which is not published (`files: ["dist", …]`).

**Out of scope:** React and Vue code splitting and output size (accepted at closeout); the Angular packaging model (GAP-081, later phase); the `exports` maps themselves (unchanged); runtime JavaScript output.

---

## 2. Human Decisions This Specification Implements

1. F5 contains GAP-079 plus the `.stories.d.mts` and `sourceMappingURL` follow-ups (scope lock §7.8).
2. React's GAP-068 approach is the reference: `packages/react/scripts/rename-dts.mjs` resolves every relative specifier to an emitted `.d.mts` and fails the build on any it cannot resolve.

---

## 3. Framework Applicability

| Item                            | Angular | React                  | Vue      |
| ------------------------------- | ------- | ---------------------- | -------- |
| GAP-079 resolvable declarations | N/A     | N/A (fixed in GAP-068) | In scope |
| Story declarations shipped      | N/A     | N/A (already excluded) | In scope |
| Stale declaration source maps   | N/A     | In scope               | In scope |

---

## 4. Existing Behavior

- **Vue build:** `tsup && vue-tsc -p tsconfig.dts.json --declaration --emitDeclarationOnly --outDir dist && node scripts/rename-dts.mjs`. `rename-dts.mjs` renames `.d.ts`/`.d.ts.map` to `.d.mts`/`.d.mts.map` and rewrites only `./….js` specifiers to `.mjs` (`:35-50`).
- **GAP-079:** extensionless specifiers and SFC specifiers are left unchanged, e.g. `dist/button/index.d.mts` contains `export { default as UButton } from "./Button.vue"` and `export { createBaseButton } from "./base-button"`. The emitted files are `Button.vue.d.mts` and `base-button.d.mts`. A consumer (`moduleResolution: Bundler`) importing `@ultimate/vue/button` gets TS2307 for both. This predates GAP-068.
- **Story declarations:** Vue's `tsconfig.dts.json` excludes only `src/**/*.spec.ts`, so 91 `*.stories.d.mts` (plus maps) ship. React's `tsconfig.dts.json` already excludes `*.stories.ts(x)` and ships none.
- **Source maps:** `tsconfig.base.json` enables `declarationMap: true`; after renaming, every comment and map `file` field names the pre-rename file. The maps' sources are unpublished.

---

## 5. Required Behavior

1. **Resolvable declarations.** Every relative specifier in `@ultimate/vue`'s emitted `.d.mts` files resolves to an emitted declaration file. That includes extensionless module specifiers and `.vue` SFC specifiers. A TypeScript consumer can then type-check imports from the barrel and from every currently exported subpath (every key of `packages/vue/package.json` `exports`, not arbitrary file paths) under both `moduleResolution: Bundler` and `NodeNext`.
2. **Types intact.** Component exports keep real prop and emit types, not `any`.
3. **Build guard.** Like React's `rename-dts.mjs`, Vue's declaration step fails the build when a relative specifier resolves to no emitted declaration file, so the defect cannot silently return.
4. **No story declarations.** `@ultimate/vue`'s `dist` contains no `*.stories.d.mts` or their maps, mirroring React's `tsconfig.dts.json` excludes.
5. **No stale map references.** No shipped `.d.mts` in `@ultimate/react` or `@ultimate/vue` references a declaration map: declaration maps are no longer emitted for either package (§12). Runtime JavaScript source maps are unaffected.

---

## 6. API Requirements

No public API change. Package `exports` maps are unchanged.

---

## 7. Dependency Relationships

Independent of F1–F4. GAP-068's shipped subpath entries (`8647317` Vue, `5ba681e` React) are the starting point.

---

## 8. Intentional Divergences That Must Remain Unchanged

React and Vue keep `splitting: false` and their current output size (closeout decision). Runtime `.mjs` output and its JavaScript source maps (`sourceMap`) are not changed by this Spec.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                                                                             | Traces to              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| A scratch consumer installing the packed `@ultimate/vue` tarball type-checks imports from the barrel and every exported subpath with zero errors under `Bundler` and under `NodeNext` | GAP-079                |
| In that consumer, passing a wrongly typed prop to a component (e.g. `UButton`) is a type error                                                                                        | GAP-079 (types intact) |
| Vue's build exits non-zero if any relative declaration specifier is unresolved (covered by a test or a deliberate negative check in the Plan)                                         | GAP-079 (guard)        |
| `find packages/vue/dist -name "*.stories.d.mts*"` returns nothing                                                                                                                     | Story declarations     |
| No `.d.mts` in `packages/{react,vue}/dist` contains a `sourceMappingURL` and no `.d.mts.map` ships; the set of `.mjs.map` files is unchanged                                          | Source maps            |
| `integrity:pack-install` passes for `@ultimate/vue` and `@ultimate/react`; existing Vue and React tests pass                                                                          | Non-regression         |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-079, GAP-068; `packages/vue/{package.json,tsconfig.dts.json,scripts/rename-dts.mjs}`; `packages/react/{tsconfig.dts.json,scripts/rename-dts.mjs}`; `tsconfig.base.json`; built output at the scope-lock baseline.

---

## 11. Explicit Out-of-Scope Items

Code splitting and output size; `exports` maps; Angular packaging (GAP-081); runtime JS source maps; newer commercial Prime releases (ADR-048).

---

## 12. Spec Review Decision (2026-10-02)

The open question is decided as **(a)**: the React and Vue declaration builds stop emitting declaration maps. Constraints:

- The change affects declaration maps (`.d.mts.map` and the `.d.mts` `sourceMappingURL` comments) only. Runtime JavaScript output and its source maps (`.mjs.map`) are unchanged, and the Plan verifies this.
- The packages' `exports` maps are unchanged.
