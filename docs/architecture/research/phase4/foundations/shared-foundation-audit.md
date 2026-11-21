# Shared-foundation audit (expanded): PrimeUIX + Aura vs Ultimate NG / React / Vue

- Ultimate revision: 91a8472547e34c6e92456f2b98270a1555e3a2db (HEAD re-checked).
- Oracles: PrimeUIX utils 0.7.2, styled 0.7.4, styles 2.0.3, themes 2.0.3, motion 0.0.10; PrimeNG 21.1.9; PrimeVue 4.5.5; PrimeReact 10.9.9.
- Supersedes the 34-line baseline at /private/tmp/claude-501/-private-var-folders-vt-w58l5fv17nz9s5ybrbgpkgh80000gn-T-magpie-claude-work-501/32364a2d-57bd-4ff4-a83a-4bc358167df1/scratchpad/shared-foundation-report.md.
- **Outside component-family counts.** Every class below is a candidate; no user ruling has been applied.
- **No tests, browser, build or product edits.** "Verified" below means only: computed by a read-only Node script over pinned archives and repo source (node v24.22.2, type-stripping imports of the `.ts` preset files). Nothing was rendered.
- Scripts and machine outputs (re-runnable, read-only):
  - /private/tmp/claude-501/-private-var-folders-vt-w58l5fv17nz9s5ybrbgpkgh80000gn-T-magpie-claude-work-501/e8f4fb2e-271d-49ab-9d01-a5c06fb1e4ed/scratchpad/scripts/aura.mjs → out/aura.json (Aura key/value deep compare)
  - scripts/dt2.mjs → out/dt2.json (registration names + every `dt()` path in product style files)
  - scripts/exports.mjs → out/exports.json (export-name inventory)
  - out/mods*\*.txt, out/flat*\*.txt (style-module inventory)
  - (scripts/dt.mjs + out/dt.json = first draft, superseded by dt2)

Path prefixes: PNG = .vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src ; PV = .vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages ; PUX = .vendor-cache/extracted/@primeuix\_\_<pkg>-<ver>/package/dist

---

## 1. API inventory (PrimeUIX → Ultimate)

### 1a. Source facts (export names; computed from PUX `index.d.mts` vs Ultimate `packages/uix-*/src`)

| Group             | Prime exports                            | Ultimate exports                 | Missing in Ultimate | Added in Ultimate                                                                                                                                                               |
| ----------------- | ---------------------------------------- | -------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| utils/classnames  | 2                                        | 2                                | —                   | —                                                                                                                                                                               |
| utils/dom         | 88                                       | 90                               | —                   | `BlockBodyScrollOptions`, `UnblockBodyScrollOptions` (Prime declares these types too in `dom/index.d.mts` signatures but does not export them by name)                          |
| utils/eventbus    | 3                                        | 3                                | —                   | —                                                                                                                                                                               |
| utils/mergeprops  | 2                                        | 2                                | —                   | —                                                                                                                                                                               |
| utils/object      | 43                                       | 43                               | —                   | —                                                                                                                                                                               |
| utils/uuid        | 1                                        | 1                                | —                   | —                                                                                                                                                                               |
| utils/zindex      | 2                                        | 2                                | —                   | —                                                                                                                                                                               |
| utils/escape      | (none)                                   | 8                                | n/a                 | Ultimate-only group: `ESCAPE_PRIORITIES`, `createEscapeRegistry`, `escapeRegistry`, `createDisplayOrderRegistry`, `displayOrderRegistry`, types                                 |
| utils/scroll-lock | (none)                                   | 3                                | n/a                 | Ultimate-only: `createScrollLockRegistry`, `scrollLockRegistry`, type                                                                                                           |
| styled            | 42                                       | 55                               | —                   | `registerThemeVariables`, `registerHiddenAccessible`, `registerIconSpin`, `registerBoxModel`, `scopeRootsOf`, `*_KEY`/`*Css` constants, `toVariableOptions`, `toVariableOutput` |
| motion            | 24                                       | 24                               | —                   | —                                                                                                                                                                               |
| themes (Aura)     | 88 component keys + base + top-level css | 79 keys + base, no top-level css | see §3              | —                                                                                                                                                                               |
| styles            | 93 modules                               | 12 component subpaths + base     | see §2              | `table` (Prime calls it `datatable`)                                                                                                                                            |

**API shape: complete by name** for utils, styled and motion. No Prime export is missing.

### 1b. Behavioral divergences found (source facts, spot-checked, not exhaustive)

| Contract                  | Prime                                      | Ultimate                                                                                                        | Kind                                                   |
| ------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Theme default prefix      | `p` (PUX styled `index.mjs`, `prefix:"p"`) | `u` (packages/uix-styled/src/config/index.ts:7,13)                                                              | intentional rename, behavior-equivalent                |
| Default CSS layer name    | `primeui`                                  | `ultimate` (packages/uix-styled/src/utils/themeUtils.ts:276,511-512)                                            | rename                                                 |
| SSR style attribute       | `data-primevue-style-id`                   | `data-u-style-id` (themeUtils.ts:295,312)                                                                       | rename                                                 |
| Motion default class name | `name:"p"`                                 | `name: "p"` (packages/uix-motion/src/config/index.ts:20-28) — **not renamed**; callers pass `u-dialog`/`u-menu` | candidate inconsistency (default yields `p-*` classes) |
| ZIndex                    | utils `ZIndex.set(key, el, base?)`         | identical source (packages/uix-utils/src/zindex/index.ts:41-55 vs PUX utils `zindex/index.mjs:1`)               | equivalent                                             |
| StyleSheet update         | `StyleSheet.update` in PUX styled          | `update()` is an empty `@todo` (packages/uix-styled/src/stylesheet/index.ts:49-51)                              | behavior gap (see §4)                                  |

Limit: utils/object and utils/dom function bodies were **not** diffed one by one; only names and the spot checks above.

---

## 2. Structural style modules (all 93)

### 2a. Source facts

- Pinned PUX styles 2.0.3: 93 modules (out/mods_all.txt).
- **PrimeNG imports 84.** Not imported: `checkboxgroup inlinemessage inputchips overlaybadge radiobuttongroup tabmenu tabview treetable virtualscroller` (grep of `@primeuix/styles/<x>` in PNG). `base` is imported by PNG/base/style/basestyle.ts:3.
- **PrimeVue imports all 93.** `base` is imported by PV/core/src/base/style/BaseStyle.js:2. **Reference defect:** docs/prime-reference/foundations/primeuix.md:190 says PrimeVue imports 92 and that `base` is not imported; pinned source contradicts it. No verdict impact.
- **Ultimate shared `@ultimate/uix-styles`:** 12 component modules + `base` (packages/uix-styles/package.json:11-76): badge, button, checkbox, dialog, inputnumber, inputtext, menu, paginator, table, tooltip, virtualscroller, base. `table` is Ultimate's name for Prime `datatable`.
- Actual shared imports (product style files):
  - NG (11): badge, button, checkbox, dialog, inputnumber, inputtext, menu, paginator, table, tooltip, virtualscroller.
  - React (3): paginator, table, virtualscroller.
  - Vue (9): badge, button, checkbox, dialog, menu, paginator, table, tooltip, virtualscroller (Vue input-text / input-number are local copies).
- **`@ultimate/uix-styles/base` has no consumer** in packages/{ng,react,vue,ng-core,react-core,vue-core,uix-styled}/src (grep). Its CSS still uses `p-*` selectors (`.p-collapsible-*`, `.p-overlay-mask*`, `.p-anchored-overlay-*`, packages/uix-styles/src/base/index.ts:5-107). Cores instead register their own hidden-accessible / icon-spin / box-model CSS (packages/uix-styled/src/stylesheet/{hidden-accessible,icon-spin,box-model}.ts).
- Framework-local style files: NG 83, React 83, Vue 86 (`packages/<fw>/src/*/*style.ts`).

### 2b. Prime style modules with no same-named Ultimate component directory (dash-insensitive match)

| Framework | Prime modules with no Ultimate dir                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | base, checkboxgroup, datatable*, editor, inlinemessage, inputchips, organizationchart, radiobuttongroup, tabmenu, tabview, tree, treeselect, treetable, virtualscroller*                                                              |
| React     | badge, base, checkboxgroup, datatable*, editor, iftalabel, imagecompare, inlinemessage, inputgroup, overlaybadge, radiobuttongroup, ripple, tabmenu, tabview, textarea†, toggleswitch†, tree, treeselect, treetable, virtualscroller* |
| Vue       | base, checkboxgroup, datatable*, editor, radiobuttongroup, tabmenu, tabview, tree, treeselect, treetable, virtualscroller*                                                                                                            |

\* covered under another name: `table` (datatable) and `scroller` (virtualscroller) exist in all three.
† React covers these under PrimeReact names `input-textarea` and `input-switch`.

Ultimate dirs with no Prime style module: NG `animate-on-scroll autofocus avatar-group dynamic-dialog fluid input-mask key-filter scroller style-class table`; React `avatar-group data-scroller deferred-content input-mask input-switch input-textarea key-filter mention multi-state-checkbox scroller style-class table tri-state-checkbox`; Vue `accordion-content accordion-header accordion-panel animate-on-scroll avatar-group deferred-content dynamic-dialog input-mask key-filter scroller style-class table`.

**Interpretation:** these are component-family absences already owned by the family track; they are listed here by name, not counted as foundation gaps. The foundation-level finding is only the narrow shared-module set (12/93) and the unused `base` module.

---

## 3. Aura tokens: keys, values, registration, `dt()` use

### 3a. Verified by script (out/aura.json)

- Ultimate preset (packages/themes/src/presets/aura/index.ts:104-187) has **79** component keys; pinned Aura has **88**.
- **All 79 shared keys are leaf-identical** to pinned Aura: 0 missing leaves, 0 extra leaves, 0 differing values.
- Base `primitive` (248 leaves) and `semantic` (227 leaves): identical.
- Prime-only keys: `datatable editor ripple tabmenu tabview tree treeselect treetable virtualscroller`.
- Pinned Aura has a top-level `css` (imports `@primeuix/themes/aura/css`: option-row selection/hover rules across list, menu and table components). Ultimate's preset has **no** top-level `css`; component-level `css` on datatable/tree/treetable is absent with those keys.

### 3b. Registration key = Aura key? (out/dt2.json; regex over product source)

| Framework | Registered names that are **not** Aura keys                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Angular   | avatar-group, button-group, dynamic-dialog, input-icon, input-group-addon, input-mask, scroll-top, scroller, table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Vue       | same as Angular, plus `menuitem`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| React     | **44**: avatar-group, block-ui, button-group, cascade-select, color-picker, confirm-dialog, confirm-popup, context-menu, data-scroller, data-view, date-picker, file-upload, float-label, icon-field, input-icon, input-chips, input-mask, input-number, input-otp, input-switch, input-text, input-textarea, mega-menu, mention, meter-group, multi-select, multi-state-checkbox, order-list, organization-chart, panel-menu, pick-list, progress-bar, progress-spinner, radio-button, scroll-panel, scroll-top, scroller, select-button, speed-dial, split-button, table, tiered-menu, toggle-button, tri-state-checkbox |

- NG/Vue mismatches are all names with **no Aura key in Prime either** (Prime has no avatargroup/buttongroup/inputmask/scrolltop tokens), except `table`/`scroller`, whose Prime keys `datatable`/`virtualscroller` are themselves absent from Ultimate's preset. So NG/Vue registration keys are consistent with the preset.
- React: every kebab-case multi-word name misses its flat Aura key, because `registerThemeVariables` does not normalize (packages/uix-styled/src/stylesheet/theme-variables.ts:12-13,55-58). Aura-key-matching React names: accordion autocomplete avatar breadcrumb button card carousel checkbox chip dialog divider dock drawer fieldset galleria image inplace knob listbox menu menubar message paginator panel password popover rating select skeleton slider splitter stepper steps tabs tag terminal timeline toast toolbar tooltip.
- Ownership note: NG and Vue `file-upload` CSS reads `button.*` and `message.*` tokens without registering those keys itself (it relies on the nested UButton/UMessage registering them).

### 3c. `dt()` consumption per framework (every product `*style.ts`, including imported shared CSS)

|                                                    | Angular                                                            | React                                                            | Vue               |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------- |
| Style files                                        | 83                                                                 | 83                                                               | 86                |
| Files using any `dt()`                             | 78                                                                 | **4** (paginator, scroller, table via shared CSS; toolbar local) | 81                |
| Zero-`dt()` files                                  | avatar-group, button-group, dynamic-dialog, input-mask, scroll-top | 79                                                               | same 5 as Angular |
| Unresolved `dt()` paths                            | 187                                                                | 148                                                              | 185               |
| …of which Prime's own styles also leave unresolved | 156                                                                | 148                                                              | 157               |
| **Ultimate-only unresolved**                       | **31**                                                             | 0                                                                | **28**            |

- React: of the 79 zero-`dt()` files, 73 are **not** ADR-067 exceptions (exceptions per DECISIONS.md: mention, multi-state-checkbox, tri-state-checkbox, data-scroller, button-group, scroll-top, scroller, table). List: accordion autocomplete avatar avatar-group block-ui breadcrumb button card carousel cascade-select checkbox chip color-picker confirm-dialog confirm-popup context-menu data-view date-picker dialog divider dock drawer fieldset file-upload float-label galleria icon-field image inplace input-chips input-mask input-number input-otp input-switch input-text input-textarea knob listbox mega-menu menu menubar message meter-group multi-select order-list organization-chart panel panel-menu password pick-list popover progress-bar progress-spinner radio-button rating scroll-panel select select-button skeleton slider speed-dial split-button splitter stepper steps tabs tag terminal tiered-menu timeline toast toggle-button tooltip. (This consolidates D-SHARED React/ADR-067. Per the user ruling of 2026-11-21 (option B), every non-exception family report that has an Aura preset key now carries a React Aura-token row or an equivalent token/visual-paint row; 23 reports gained an explicit row that day and the React cell is P in all of them. InputMask and AvatarGroup have no Aura key, so they carry no such row. The 23 were verified mechanically; the other reports were spot-checked, not re-counted one by one.)
- Prime-also unresolved (reference facts, Prime's own styles reference tokens Aura does not define): all `datatable.*` (143), `virtualscroller.*` (5), `imagecompare.scope.x`, `imagecompare.handle.border.style`, `scrollpanel.barfocus.ring.width/offset`, `menubar.submenu.color`, `inputchips.chip.focus.color`, plus (in Prime only) colorpicker.preview.focus.border.color, confirmpopup.arrow.left, popover.arrow.left, fileupload.filelist.gap, rating.invalid.icon.color, ripple.background. **Reference defect candidates**: these resolve to undefined variables in Prime too.
- **Ultimate-only unresolved paths** (token names that exist in neither Aura nor Prime styles; likely renames during porting):
  - Angular (packages/ng/src/…): cascade-select/cascade-select-style.ts:110 `cascadeselect.option.disabled.color`, :133 `cascadeselect.empty.message.padding`; color-picker/color-picker-style.ts:19 `colorpicker.preview.border.color`; date-picker/date-picker-style.ts:85 `datepicker.select.month.font.weight`, :96,105 `datepicker.day.cell.padding`, :100,116,120 `datepicker.day.color`, :112 `day.width`, :113 `day.height`, :114 `day.border.radius`, :130 `day.selected.background`, :131 `day.selected.color`, :135 `day.selected.focus.shadow` (Prime uses `datepicker.date.*`); file-upload/file-upload-style.ts:45,46,54,75,93,101,105 (`fileupload.content.*`, `file.info.border.radius`, `file.size.color`, `file.actions.color`); listbox/listbox-style.ts:84, multi-select/multi-select-style.ts:137, select/select-style.ts:153 (`*.option.disabled.color`; Prime has no such token); password/password-style.ts:38,55,71,79,88 (`password.content.padding`, `meter.weak.background`, `meter.text.color`, `icon.right`); rating/rating-style.ts:46 `rating.icon.disabled.color`.
  - Vue (packages/vue/src/…): cascade-select-style.ts:99,122; color-picker-style.ts:21; date-picker-style.ts:74,84,85,90,97,98,99,101,114,115,119; file-upload-style.ts:45,46,54,86,94,98; listbox-style.ts:77; multi-select-style.ts:126; password-style.ts:40,57,73,82; rating-style.ts:44; select-style.ts:132.
- Limits: regex extraction of `dt('…')` literals; template-literal or computed paths missed; directory-level ownership; "unresolved" is a token-name check, not a rendered result (a CSS `var()` with no definition falls back to the property's initial/inherited value; impact not observed).

---

## 4. Theme-change and common-style behavior (source call sites)

### Source facts

- Emitters: `Theme.setTheme` / `setPreset` / `setOptions` emit `theme:change` (packages/uix-styled/src/config/index.ts:53-76) and clear `_loadedStyleNames`.
- Subscribers: **none** in product or core source. Grep of `ThemeService.` and of `updatePreset|usePreset|useTheme|updatePrimaryPalette|updateSurfacePalette|setPreset|setOptions(` across packages/{ng,react,vue,ng-core,react-core,vue-core,themes}/src (non-spec) found no call sites.
- Prime subscribers: PNG/basecomponent/basecomponent.ts:395-401 (`_themeChangeListener` → `ThemeService.on('theme:change')`, clears loaded names); PV/core/src/basecomponent/BaseComponent.vue:208-215.
- Ultimate registration runs once per key: NG `ngOnInit` (packages/ng-core/src/basecomponent/base-component.ts:56-76), React mount effect (packages/react-core/src/styling/use-component-style.ts:12-31), Vue `mounted` / Base\*.ts (packages/vue-core/src/styling/vue-style-sheet.ts:43-69). All guard with `sheet.has(key)`; `StyleSheet.update()` is a no-op `@todo` (packages/uix-styled/src/stylesheet/index.ts:49-51).
- Common style: `getCommon()` returns `{primitive, semantic, global, style}` (packages/uix-styled/src/utils/themeUtils.ts:69-77,171); the only product caller, `registerThemeVariables`, destructures `primitive, semantic, global` and drops `style` (packages/uix-styled/src/stylesheet/theme-variables.ts:51-52). PrimeNG loads `style` as `global-style` (PNG/basecomponent/basecomponent.ts:355-360); PrimeVue likewise (PV/core/src/basecomponent/BaseComponent.vue:170-175).
- Layer order: `Theme.getLayerOrderCSS` has no product caller; with `cssLayer` enabled, variables are wrapped in `@layer ultimate` (themeUtils.ts:509-519) but no `layer-order` statement is ever registered (Prime registers it first: PNG basecomponent.ts:375-381).

### Candidates (all three frameworks; outside family counts)

1. **Runtime theme switching does not reach mounted styles.** Partial (user ruling 2026-11-19; applies to NG/React/Vue, outside component-family counts). After `setPreset`/`setTheme`, already-registered `*-variables` keys are not replaced (has-guard + no-op update). Unverified at runtime; no app-level re-registration path exists in repo source.
2. **Preset global CSS never loaded.** Partial/missing. Two causes stack: Ultimate's preset has no top-level `css` (§3a), and the registrar drops `style` anyway. Effect: Aura's option-row selection/hover rules (`aura/css`) are absent unless a component carries equivalent rules locally (not audited per component).
3. **CSS-layer ordering incomplete when `cssLayer` is on.** Candidate partial; the default (`cssLayer:false`, packages/themes/src/apply-theme.ts:20) is unaffected.
4. **Per-instance `dt` / unstyled** — already D-SHARED #5; not re-counted.

---

## 5. Motion (source facts)

- Ultimate `@ultimate/uix-motion` is name-identical to PrimeUIX motion (§1a); `createMotion` source matches the pinned implementation structure (packages/uix-motion/src/config/index.ts:36-137).
- Call sites: NG packages/ng/src/dialog/dialog.ts:393-408 (Dialog only); React packages/react-core/src/motion/use-motion.ts:8-36 → packages/react/src/dialog/dialog.tsx:115-140, packages/react/src/menu/menu.tsx:202; Vue packages/vue-core/src/motion/use-motion.ts:14-39 → packages/vue/src/dialog/Dialog.vue:83, packages/vue/src/menu/Menu.vue:77.
- Prime contrast: PrimeNG uses `createMotion` in its motion directive/component (PNG/motion/motion.directive.ts:232, motion.component.ts:280) across ~53 import sites; PrimeVue uses Vue `<transition>`; PrimeReact `react-transition-group`.
- Candidate: engine complete; **adoption narrow** (Dialog + Menu). Per-component animation gaps belong to family rows.

---

## 6. Summary: verified vs candidates vs limits

**Verified by script (source-level):** utils/styled/motion export names complete; Aura 79/79 keys value-identical, base identical; 9 Aura keys absent; React registers 44 non-Aura names and 79/83 React style files use no `dt()`; 31 NG / 28 Vue Ultimate-only unresolved token paths; PrimeVue imports all 93 style modules (reference doc says 92).

**Candidates (rulings noted where given):** C1 theme-change not propagated (user ruling 2026-11-19: partial in all three, outside family counts); C2 Aura global css missing + common `style` dropped; C3 layer-order not registered; C4 React token pipeline effectively unused (key normalization + no `dt()`; handled at family level by the 2026-11-21 ruling, React Aura-token cell P per family); C5 31/28 broken token references in NG/Vue (date-picker, file-upload, password, select-family, rating, cascade-select, color-picker; user ruling 2026-11-19: Aura-token rows drop C to P in NG and Vue, applied in the nine family reports); C6 `@ultimate/uix-styles/base` unused and still `p-*`; C7 motion default name `p`; C8 shared style package covers 12/93.

**Limits:** no rendering, theme switching, SSR, animation or reduced-motion execution; regex-based extraction; utils function bodies not diffed; resolved-dependency tree not inspected.

## 7. Decisions and their status (updated 2026-11-21)

Resolved:

1. **Runtime theme switching (C1)** — user ruling 2026-11-19: partial in NG, React and Vue; recorded here, outside family counts. No ADR accepts set-before-mount-only theming.
2. **Ultimate-only unresolved tokens (C5)** — user ruling 2026-11-19: pushed into family rows; Aura-token rows drop from C to P in NG and Vue for date-picker, file-upload, password, select, multi-select, listbox, cascade-select, color-picker (row unchanged) and rating. Applied in the nine reports.
3. **React Aura-token architecture (C4 / D-SHARED #1)** — user ruling 2026-11-21 (option B): an explicit React Aura-token row (P, architecture) in every non-exception family report with an Aura key; the earlier M cells (Breadcrumb, Dock, OrganizationChart, Panel) and N cell (FloatLabel) were normalized to P.

4. **C2, C3, C6, C7, C8 and the remaining §8 readings** — user ruling 2026-11-21: all proposed classes in §8 approved as written (F3, F4, F6, F7, F9, F10, F12, F13, F14). Nothing in the foundation track is still unruled.

---

## 8. Foundation classification ledger (outside family counts)

Classes: C complete, P partial, M missing, N n/a. **Ruled** = user ruling recorded in `DECISIONS.md`. All 15 items are now either ruled or verified by script; none is still a proposal. Evidence is source-read only (see §6 limits); nothing was rendered.

| #   | Foundation item                                           | NG  | React | Vue | Status                                           | Basis                                                                                                                                                                                  |
| --- | --------------------------------------------------------- | --- | ----- | --- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | PrimeUIX API surface (utils, styled, motion export names) | C   | C     | C   | Verified by script                               | §1a: no Prime export missing. Function bodies of utils/object and utils/dom not diffed.                                                                                                |
| F2  | Aura preset values for shared keys                        | C   | C     | C   | Verified by script                               | §3a: 79 of 79 shared keys leaf-identical, base identical.                                                                                                                              |
| F3  | Aura preset coverage (keys)                               | P   | P     | P   | Ruled (2026-11-21)                               | §3a: 79 of 88 keys; Prime-only keys datatable, editor, ripple, tabmenu, tabview, tree, treeselect, treetable, virtualscroller. Component absences belong to family tracks.             |
| F4  | Preset top-level `css` (option-row selection/hover rules) | M   | M     | M   | Ruled (C2, 2026-11-21)                           | §3a, §4: Ultimate preset has no top-level css, and the registrar drops `style` anyway. Component-local equivalents not audited.                                                        |
| F5  | Runtime theme switching reaches mounted styles            | P   | P     | P   | Ruled (C1)                                       | §4: `theme:change` emitted, no subscriber; `StyleSheet.update()` is a no-op.                                                                                                           |
| F6  | CSS layer-order registration when `cssLayer` is on        | P   | P     | P   | Ruled (C3, 2026-11-21)                           | §4: variables wrapped in `@layer ultimate`, but no layer-order statement registered; default `cssLayer:false` unaffected.                                                              |
| F7  | Style registration key matches the Aura key               | C   | P     | C   | Verified by script, class ruled (C4, 2026-11-21) | §3b: React has 44 registered names that are not Aura keys (no kebab-case normalization); NG and Vue mismatches are names with no Aura key in Prime either.                             |
| F8  | Components consume tokens through `dt()`                  | C   | P     | C   | Ruled for family rows (C4, C5)                   | §3c: React 79 of 83 style files use no `dt()`, 73 of them non-exception; NG and Vue have 31 and 28 Ultimate-only unresolved paths, already reflected as P in the affected family rows. |
| F9  | Shared structural style modules                           | P   | P     | P   | Ruled (C8, 2026-11-21)                           | §2a: 12 shared component modules of 93 Prime modules; shared imports NG 11, React 3, Vue 9. Most styles are framework-local copies.                                                    |
| F10 | `@ultimate/uix-styles/base` in use and renamed            | P   | P     | P   | Ruled (C6, 2026-11-21)                           | §2a: no consumer in the six packages searched, and its CSS still uses `p-*` selectors.                                                                                                 |
| F11 | Motion engine                                             | C   | C     | C   | Verified by script                               | §5: name-identical to PrimeUIX motion; `createMotion` structure matches.                                                                                                               |
| F12 | Motion adoption in components                             | P   | P     | P   | Ruled (2026-11-21)                               | §5: call sites cover Dialog (NG) and Dialog + Menu (React, Vue) only. Per-component gaps stay in family rows.                                                                          |
| F13 | Motion default class-name prefix                          | P   | P     | P   | Ruled (C7, 2026-11-21)                           | §1b: default `name:"p"` was not renamed; callers pass `u-*` names.                                                                                                                     |
| F14 | Prefix, layer name and SSR attribute renames              | C   | C     | C   | Ruled (2026-11-21)                               | §1b: behavior-equivalent renames; `intentional` would need an ADR, so they are not marked I.                                                                                           |
| F15 | Per-instance `dt` and `unstyled`                          | P   | M     | M   | Ruled (D-SHARED #5), not re-counted              | Per-family rows; React per-instance `dt` is N where PrimeReact has no `dt` API.                                                                                                        |

Distribution of the 15 items (NG / React / Vue, C/P/M/N): NG 6/8/1/0 counting F15 as P and F4 as M; React 4/9/2/0; Vue 6/7/2/0. These are inventory counts of foundation items, not component-family counts, and no single verdict is derived from them.

**Open user decisions:** none for this track. Implementation scope and priority for every item belong to Phase 5.
