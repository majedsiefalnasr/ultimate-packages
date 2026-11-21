<!-- Historical pre-normalization lead review 2026-11-18: arithmetic verified row-by-row (NG 5/2/1/0/1/0, React 0/0/3/0/6/0, Vue 5/1/2/0/1/0). Lead spot-checks: no React inputgroup source in packages/react or react-core; NG packages/ng/src/input-group/input-group-style.ts:34 targets .u-input-text while NG InputText emits u-inputtext; Vue InputText root u-input-text has no u-component, so joined rules packages/vue/src/input-group/input-group-style.ts:68-94 miss it. Row 6 N per user ruling in the phase 4 closeout record. No unresolved rows. Agent-9 report below, unchanged. -->

# InputGroup / InputGroupAddon — final report

Everything is from reading source only: no tests, builds or browser checks, and no product files written. Revision `91a8472547e34c6e92456f2b98270a1555e3a2db`. Counts are in the order C/P/M/I/N/U (complete / partial / missing / intentional / n/a / unresolved).

Path abbreviations:

- `NG` = `.vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src`
- `PR` = `.vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib`
- `PV` = `.vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src`
- `X` = repo `packages/`

`pt` follows D-PT and unstyled/`dt` follows D-SHARED #5.

## Mapping

- **Angular:** `UInputGroup` and `UInputGroupAddon` (`X/ng/src/input-group/input-group.ts:18-31,45-62`) map to `NG/inputgroup/inputgroup.ts:14-44` and `NG/inputgroupaddon/inputgroupaddon.ts:14-52`.
- **Vue:** `X/vue/src/input-group/InputGroup.vue:1-16` and `InputGroupAddon.vue:1-16` map to `PV/inputgroup/InputGroup.vue:1-14` and `PV/inputgroupaddon/InputGroupAddon.vue:1-14`.
- **React:** PrimeReact provides only a CSS pattern (`PR/componentbase/ComponentBase.js:120-141`). A grep of `packages/react` and `packages/react-core` for `inputgroup`, `input-group` and `u-input-group` found nothing. Rows 1–3 are therefore M for React. Rows that need a component API PrimeReact lacks are N.

## Capability matrix (11 rows)

| #   | Capability                                                  | NG  | React | Vue | Evidence                                                                                                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------- | --- | ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Group container with content projection                     | C   | M     | C   | X NG host `cx('root')` with `<ng-content>` (`:21,25`) vs NG `inputgroup.ts:15,22`; X Vue `InputGroup.vue:1-5` vs PV `:1-5`; PR `ComponentBase.js:120-125`                                                                                                                                                                                                    |
| 2   | Addon wrapper                                               | C   | M     | C   | X NG `:45-58` vs NG `inputgroupaddon.ts:14-25`; X Vue `InputGroupAddon.vue:1-5` vs PV `:1-5`; PR `:126-131`                                                                                                                                                                                                                                                  |
| 3   | Joined layout CSS (radius collapse, borders, nested fields) | P   | M     | P   | See the row 3 detail below                                                                                                                                                                                                                                                                                                                                   |
| 4   | Addon inline style                                          | C   | N     | C   | X NG `inlineStyle` bound to `[style]` (`:51-61`) vs NG `style` (`inputgroupaddon.ts:38-51`). The API name differs; the behavior is equivalent. Vue: single root with attribute fall-through, not suppressed (`X/vue-core/src/base/base-component.ts:30-43`).                                                                                                 |
| 5   | Root class customization                                    | C   | N     | C   | X NG host class binding vs NG `cn(cx('root'), styleClass)` (`inputgroup.ts:22,43`; `styleClass` deprecated in v20). Vue: fall-through as in row 4.                                                                                                                                                                                                           |
| 6   | `fluid` through a component input                           | N   | N     | N   | NG style checks `instance.fluid` (`inputgroupstyle.ts:45`), but `inputgroup.ts` declares no such input. N for Angular by user ruling. PV `InputGroupStyle.js:4-6` has no fluid class. React's `.p-fluid` ancestor rule is a different mechanism.                                                                                                             |
| 7   | `pt`                                                        | M   | N     | M   | NG `inputgroup.ts:32-35` (`ptms(['host','root'])`), addon likewise (`inputgroupaddon.ts:25,35`); PV `ptmi('root')` on both (`:2`). No PrimeReact InputGroup component (no `inputgroup/` under R; CSS pattern only).                                                                                                                                          |
| 8   | `ptOptions`                                                 | M   | N     | M   | N `basecomponent/basecomponent.ts:54,60,66,72` declares dt/unstyled/pt/ptOptions; VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt. X NG `packages/ng-core/src/basecomponent/base-component.ts:21-24` excludes pt/ptOptions; `:35-36` declares dt/unstyled without applying them (`:50-53`); X Vue none. React N as above. |
| 9   | Unstyled mode                                               | P   | N     | M   | X NG extends `UBaseComponent` (`:28-30`). X Vue `createBaseComponent` has only `cx` and style registration (`base-component.ts:30-43`). PV BaseInputGroup.vue:7-8.                                                                                                                                                                                           |
| 10  | Per-instance `dt`                                           | P   | N     | M   | N `basecomponent/basecomponent.ts:54,60,66,72` declares dt/unstyled/pt/ptOptions; VC `basecomponent/BaseComponent.vue:14,18,22,26` declares pt/ptOptions/unstyled/dt. X NG declares, does not apply; X Vue none.                                                                                                                                             |
| 11  | Addon token use (`inputgroup.addon.*`)                      | C   | N     | C   | X NG `input-group-style.ts:40-49,81-102`; X Vue `:38-47,79-100`; `@primeuix__styles-2.0.3/package/dist/inputgroup/index.mjs:1`                                                                                                                                                                                                                               |

## Row 3 detail (source-level selector mismatches; visual effect not tested)

**Vue (P).** The selector structure matches pinned `@primeuix/styles` 2.0.3 after the `p-` to `u-` rename (`X/vue/src/input-group/input-group-style.ts:17-121`). The problem is the classes the radius and border rules key on:

- The rules key on `.u-component` and `.u-inputwrapper`.
- `UInputText` renders only `u-input-text` (`X/vue/src/input-text/InputText.vue:4`; `input-text-style.ts:72-82`).
- So those rules do not reach sibling inputs. The inventory records the same mismatch (`docs/inventory/vue-text-entry/vue.input-group.md:13`; `README.md:28-39`).

**Angular (P).** `X/ng/src/input-group/input-group-style.ts` has the base rules, but two selector mismatches mean some of them do not apply.

- **Button:**
  - `UButton` has a `u-button` host (`X/ng/src/button/button.ts:66`). Its inner `<button>` gets `u-button u-component` (`:69-71`; `button-style.ts:67-69`).
  - The group's radius rules select direct children only: `.u-input-group > .u-component` (`input-group-style.ts:70-100`). The inner button is not a direct child, so those rules miss it.
  - The `:has(.u-button)` rule (`:61-66`) only reaches a button placed inside an addon.
  - PrimeNG targets the `p-button` host element directly (`NG/inputgroup/style/inputgroupstyle.ts:12-31`).
- **Input mask:**
  - `UInputMask` renders an inner `<input>` with class `u-inputtext` (`X/ng/src/input-mask/input-mask.ts:64-67`; `input-mask-style.ts:45`).
  - The group selects `.u-input-group .u-input-text` (`input-group-style.ts:34`), a different class name.
  - PrimeNG has `.p-inputgroup > p-inputmask > .p-inputtext` (`inputgroupstyle.ts:36`); X has no counterpart.

## Distribution (11 rows)

Normalization 2026-11-19 (toggle-audit, scratch): `pt`, `ptOptions`, `unstyled` and per-instance `dt` split into four rows per current method; PrimeReact per-instance `dt` is N (ComponentBase.js:420-423 has no dt). Counts recomputed mechanically; prior user/ADR rulings and statuses preserved.

| Framework | C   | P   | M   | I   | N   | U   |
| --------- | --- | --- | --- | --- | --- | --- |
| Angular   | 5   | 3   | 2   | 0   | 1   | 0   |
| React     | 0   | 0   | 3   | 0   | 8   | 0   |
| Vue       | 5   | 1   | 4   | 0   | 1   | 0   |

## Top gaps

1. No `pt` in Angular or Vue (row 7). Unstyled/`dt` is missing in Vue and partial in Angular (row 8).
2. The joined-layout rules do not reach the actual field and button classes (row 3).
3. React has no counterpart to PrimeReact's CSS pattern (rows 1–3).

## Inventory

- `docs/inventory/angular-text-entry/angular.input-group.md`: the Angular product suite was not run.
- `docs/inventory/vue-text-entry/vue.input-group.md`: the Vue suite was not run, and the record notes the selector mismatch.
- No runtime evidence exists for either.

## Reference defects

- **PrimeNG `p-inputgroup-fluid`:** gated on `instance.fluid` (`NG/inputgroup/style/inputgroupstyle.ts:45`), which InputGroup never declares, so the class cannot be reached. Ruled 2026-11-18: row 6 for Angular is N, and other full-width mechanisms are not classified.
- **PrimeReact CSS-only pattern:** `inputgroup.md:14` says it is "not a missing feature". That is a doc statement, not a ruling, and does not change the M classifications.

## Decisions needed (no priority)

- Whether Ultimate React should provide the CSS pattern (rows 1–3).
- The joined-layout selector mismatches in Angular and Vue (row 3).
- `pt` and unstyled/`dt`.

## Verification limits

- **Row 3.** Check in a browser: put `u-button`, `u-input-mask` and `UInputText` at the first and last positions in a group, then compare corner radii and borders against Prime.
