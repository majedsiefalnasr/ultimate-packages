# Tag: Phase 4 evidence matrix (source-only)

Ultimate revision `91a8472547e34c6e92456f2b98270a1555e3a2db` on `develop`. Oracles: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5. Nothing was run: no tests, build, browser or assistive-technology checks. Pinned source wins over docs.

Line numbers are source line numbers. Path keys are expanded at the end. `ADR` = `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/phase4-gap-analysis/DECISIONS.md`. `FOUND` = `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/phase4-gap-analysis/foundations/shared-foundation-audit.md`.

## Mapping

| Framework | Prime to Ultimate          | Basis                                                                                               |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| Angular   | PrimeNG `Tag` to `UTag`    | Same status label with `value`, `severity`, `icon`, `rounded`. `PN:15-18,38-43,58-73` to `NG:26-54` |
| React     | PrimeReact `Tag` to `UTag` | Same span-based label. `PR:8-16,27-42,51-57` to `R:5-12,24-39`                                      |
| Vue       | PrimeVue `Tag` to `UTag`   | Same span-based label. `PV:1-8,15-27`; `PVB:5-13` to `V:1-9,24-29`; `VB:8-17`                       |

## Distribution (C / P / M / I / N / U), 14 rows per framework

| Framework |   C |   P |   M |   I |   N |   U | Total |
| --------- | --: | --: | --: | --: | --: | --: | ----: |
| Angular   |   8 |   3 |   3 |   0 |   0 |   0 |    14 |
| React     |   4 |   4 |   4 |   0 |   2 |   0 |    14 |
| Vue       |   6 |   0 |   8 |   0 |   0 |   0 |    14 |

Cell letters by row 01-14:

- Angular: C C C M C C C C C C M M P P
- React: C P C N P C M C P P M M M N
- Vue: C C C M C C M M M C M M M M

## Capability matrix

| #   | Capability                             | Angular                                                                                                                                                                                                    | React                                                                                                                                                                        | Vue                                                                                                                                                           |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Display string `value`                 | C. Value renders as label text unless projected content overrides it. `PN:27,58-63` to `NG:33-35,47-50`                                                                                                    | C. `PR:44-57`; `PRB:34-44` to `R:5-7,24-37`                                                                                                                                  | C [default: both null]. Value is the label slot's default content. `PVB:8-13`; `PV:5-7` to `VB:11-14`; `V:6-8`                                                |
| 02  | Projected or child content             | P. Prime projects children before the icon and value. Ultimate projection replaces the value fallback inside the label span. `PN:19-27` to `NG:29-35`                                                      | P. Prime renders `value` and `children` in two spans. Ultimate renders `children ?? value`, so children suppress `value`. `PR:51-57` to `R:30-37`                            | C. Default slot replaces the label in both. `PV:3-7` to `V:3-8`                                                                                               |
| 03  | Leading icon                           | C. String icon class. `PN:21-26,65-68` to `NG:30-34,51-52`                                                                                                                                                 | C. `IconType` vs `ReactNode`, both render. `PR:20-28,51-54`; `PRB:4-6` to `R:8,30-36`                                                                                        | C. `PV:3-4`; `PVB:8-13` to `V:3-5`; `VB:14`                                                                                                                   |
| 04  | Custom icon template or slot           | M. Prime has an `icon` template. Ultimate has only a string input. `PN:21-26,75-95` to `NG:30-35,51-52`                                                                                                    | N. PrimeReact has no icon slot; `IconType` is row 03. `PR:20-28`; `PRB:34-44`                                                                                                | M. Prime has an `icon` slot. Ultimate has none. `PV:3-4`; `PVB:8-13` to `V:1-9`; `VB:11-16`                                                                   |
| 05  | Severity values                        | C. All six values accepted. `PN:55-58,97-102` to `NG:39-40,47-48`                                                                                                                                          | P. PrimeReact's API value is `warning`; Ultimate has only `warn`, so the Prime-API value gets no variant. `PRB:4-11,34-44`; `PR:34-42` to `R:5-6,24-25,33-34`                | C. `PV:19-25`; `PVB:8-13` to `V:2`; `VB:11-16`                                                                                                                |
| 06  | Rounded variant                        | C [default-differs]. Input is `undefined` in Prime and `false` in Ultimate; both render unrounded. `PN:70-73,97-102` to `NG:39-40,53-54`                                                                   | C. `PRB:34-44`; `PR:34-42` to `R:9,25,33-34`; `RS:9-10,20-27`                                                                                                                | C. `PVB:8-13`; `PV:19-25` to `VB:15`; `V:2`; `VS:12,21-29`                                                                                                    |
| 07  | Generic root attributes (ARIA, data)   | C. Host is the DOM root in both. `PN:15-18,32-36` to `NG:26-42`                                                                                                                                            | M. Prime spreads remaining span props via `getOtherProps`; Ultimate has a fixed prop list. `PR:34-42`; `PRC:434-441` to `R:5-12,24-38`                                       | M. Prime uses `ptmi('root')`; Ultimate sets `inheritAttrs:false` with no `$attrs` rebind (D-SHARED #2). `PV:1-8,15-18`; `PVC:304-310` to `V:24-28`; `VB:8-17` |
| 08  | Consumer class on root                 | C for class, verified 2026-11-21 by the Angular host probe (jsdom): a consumer `class` coexists with the generated host class and updates dynamically (precedent `ADR:65`). `PN:32-36,48-53` to `NG:39-45` | C. `className` appended to generated classes. `PR:34-42` to `R:11,31-34`                                                                                                     | M. Fallthrough disabled; `$attrs.class` not merged. `PV:1-8,15-18`; `PVC:304-310` to `V:24-28`; `VB:8-17`                                                     |
| 09  | Inline style on root                   | C. Native style on the host. `PN:15-18,32-36` to `NG:26-42`                                                                                                                                                | P. Prime applies `style`; Ultimate has no `style` prop or spread. `PR:34-42`; `PRB:34-44` to `R:5-12,24-38`                                                                  | M. Same cause as row 08. `PV:1-8,15-18`; `PVC:304-310` to `V:24-28`; `VB:8-17`                                                                                |
| 10  | Aura-token styling and severity colors | C. Local CSS reads `tag.*` token paths that exist in Ultimate Aura. `PNS:1-20`; `PUXT:18-91` to `NGS:9-19`; `UA:18-91`                                                                                     | P. Hand-authored CSS with fixed custom-property fallbacks, no `dt()`; Tag is not an ADR-067 exception. `PRB:14-32` to `RS:8-18`; `RCORE:12-31`; `ADR:29-34`; `FOUND:104,121` | C. `PVS:1-20`; `PUXT:18-91` to `VS:9-19`; `UA:18-91`                                                                                                          |
| 11  | `pt`                                   | M per D-PT. Prime offers host, root, icon, label keys. `PN:21-27,32-46`; `PNC:62-66` to `NG:29-45`; `NGC:21-24,34-53`                                                                                      | M per D-PT. `PR:12-16,20-49`; `PRC:443-505` to `R:5-12,21-23,28-39`                                                                                                          | M per D-PT. `PV:1-8`; `PVC:301-310` to `V:1-9`; `VB:8-17`                                                                                                     |
| 12  | `ptOptions`                            | M per D-PT. `PNC:66-72` to `NGC:21-24,34-53`                                                                                                                                                               | M per D-PT. `PRC:420-423,465-499` to `R:5-12,21-23,28-39`                                                                                                                    | M per D-PT. `PVC:18-21,226-239,278-310` to `VB:8-17`; `V:24-28`                                                                                               |
| 13  | `unstyled`                             | P per D-SHARED #5. Base declares the input but resolves classes and CSS unconditionally. `PNC:54-60,94-96,351,511-513` to `NGC:34-36,50-77`; `NG:39-45`                                                    | M. PrimeReact gates classes and styles on `unstyled`; Ultimate has no such prop. `PR:12-16`; `PRC:507-513,604-632` to `R:5-12,24-39`; `RC:26-31`                             | M. `PVC:22-25,36-46,315-317,336-338` to `VB:8-17`; `VC:30-42`; `V:24-28`                                                                                      |
| 14  | Per-instance `dt`                      | P per D-SHARED #5. Input declared but Tag registers variables by name and never consumes the override. `PNC:54,169-176` to `NGC:34-36,56-76`                                                               | N. PrimeReact has no `dt` API; token consumption is row 10. `PRB:34-44`; `PRC:416-428`                                                                                       | M. Prime loads a scoped `dt`; Ultimate has no `dt` prop or scoped registration. `PVC:26-29,48-60` to `VB:11-17`; `VC:30-42`; `V:24-28`                        |

## Default flags

- Angular `rounded` (row 06): PrimeNG input `undefined`, Ultimate `false`; both render unrounded. `PN:70-73`; `NG:53-54`.
- `value` default (row 01): PrimeVue/PrimeReact default null; Ultimate Vue null, Ultimate React optional/undefined. No content means no text in both. `PVB:8-13`; `PRB:34-44`; `VB:11-14`; `R:5-7`.

## Reference defects

- PrimeReact Tailwind doc uses severity `help`, not in the `TagProps` union (`docs/prime-reference/components/tag.md:139`). No matrix row depends on it.
- No other docs/source conflict that changes a class was found. Full showcase docs not audited.

## Rulings (resolved 2026-11-21)

Angular consumer class coexistence (row 08): user chose A. The 2026-11-21 Angular host probe shows a native consumer `class` coexists with the component own classes and updates dynamically. Only default inputs were probed; severity and rounded were not varied. It is not classified M merely because there is no explicit class input.

## Verification limits

- Source-only at the pinned product revision and pinned Prime archives; no DOM, computed-style or accessibility-tree evidence.
- Row 10 compares token names and declarations, not rendered colors; React's P is architectural (ADR-067).
- Vue's missing `$attrs` rebind is visible in source; its browser effect was not exercised.
- Row 08 Angular is C for class (2026-11-21 probe). No aggregate score is claimed.

## Path keys

Product paths relative to `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate`. Prime paths under `.vendor-cache/extracted/`.

| Key   | Path                                                                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| PN    | `primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/tag/tag.ts`                     |
| PNC   | `primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/basecomponent/basecomponent.ts` |
| PNS   | `primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/tag/style/tagstyle.ts`          |
| PV    | `primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/tag/Tag.vue`                  |
| PVB   | `primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/tag/BaseTag.vue`              |
| PVC   | `primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/core/src/basecomponent/BaseComponent.vue`  |
| PVS   | `primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/tag/style/TagStyle.js`        |
| PR    | `primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/tag/Tag.js`                     |
| PRB   | `primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/tag/TagBase.js`                 |
| PRC   | `primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/componentbase/ComponentBase.js` |
| PUXT  | `@primeuix__themes-2.0.3/package/types/tag/index.d.ts` and `@primeuix__themes-2.0.3/package/dist/aura/tag/index.mjs`  |
| NG    | `packages/ng/src/tag/tag.ts`                                                                                          |
| NGS   | `packages/ng/src/tag/tag-style.ts`                                                                                    |
| NGC   | `packages/ng-core/src/basecomponent/base-component.ts`                                                                |
| R     | `packages/react/src/tag/tag.tsx`                                                                                      |
| RS    | `packages/react/src/tag/tag-style.ts`                                                                                 |
| RC    | `packages/react-core/src/base/component-base.ts`                                                                      |
| RCORE | `packages/react-core/src/styling/use-component-style.ts`                                                              |
| V     | `packages/vue/src/tag/Tag.vue`                                                                                        |
| VB    | `packages/vue/src/tag/BaseTag.ts`                                                                                     |
| VS    | `packages/vue/src/tag/tag-style.ts`                                                                                   |
| VC    | `packages/vue-core/src/base/base-component.ts`                                                                        |
| UA    | `packages/themes/src/presets/aura/tag.ts`                                                                             |
