# GAP-098 — Ultimate-scoped `border-box` base layer

**Date:** 2026-10-15
**Status:** APPROVED (revision 4, with Amendment A1 from Plan Review and Amendment A2 from implementation evidence). Spec Review round 1 returned CHANGES REQUIRED; findings 1–14 applied. Round 2 returned CHANGES REQUIRED; findings N1–N3 applied. Round 3 approved; findings R1 and R2 applied (2026-10-15).
**Authority:**

- [ADR-063](../../architecture/DECISIONS.md) (GAP-098 Option B, user decision 2026-10-15).
- [GAP-098](../../architecture/BLUEPRINT_GAPS.md#gap-098--primes-global-base-style-box-sizing-border-box-is-not-applied-in-ultimate) and its effect [GAP-097](../../architecture/BLUEPRINT_GAPS.md#gap-097--drawer-sizing-under-content-box-content-overflow-and-a-full-drawer-taller-than-the-viewport).
- Options and evidence in [`research/2026-10-15-gap-098-box-model-options.md`](../../architecture/research/2026-10-15-gap-098-box-model-options.md).
- The shared-registration and SSR contracts of GAP-074/GAP-078.

## 1. Verified problem

- **Failing CI.** CI on `main` (run [38737652296](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38737652296) at `efd677fd`; style sources are unchanged at `ccb97d68`): `Ng/Drawer full and RTL G3-D layout` and `Vue/Drawer full and RTL G3-D layout` fail in Chromium, Firefox and WebKit with `|height − viewport| ≤ 1`, received 2.
- **Cause.** The rule `.u-drawer.u-drawer-position-full { height: 100vh !important; border-width: 1px }` renders 722 px under `content-box`. Prime renders 720 px because its base style makes every box `border-box`.
- **Existing rules.** Ultimate registers no box-model base. The only `box-sizing` rules are local `border-box` rules:
  - scroll-panel and carousel, in all three frameworks;
  - React select, multi-select and listbox.
- **Nothing depends on content-box.** No Ultimate style declares `content-box`.
- **Page-wide rule is not used.** `@ultimate/uix-styles/base` still exports Prime's page-wide `*` rule unchanged. Nothing imports it, and it is not the fix: the 2026-10-08 ruling excludes it.

## 2. Scope: each component's own subtree

The rule must cover Ultimate component DOM in all three frameworks and must never match the host page.

**Rejected scoping options.**

- _A `u-` class-prefix selector._ `<body>` receives `u-scroll-panel-bar-grabbed` while a ScrollPanel scrollbar is dragged, and `u-` is a common host utility prefix.
- _The `u-component` marker alone._ It is missing from 13 Angular, 28 Vue and 12 React root class lists, so frameworks would differ: for example, Angular Dialog has it and Vue Dialog does not.
- _Restoring those markers._ That is a separate port-fidelity question and is not part of this change.

**Chosen scoping: per component, from its own style module.**

- Each component's **scope roots** are taken from its style module. They are the first `u-` class of every `classes` entry whose key is `root`, `overlay`, `panel` or `mask`, or ends in `Root`, `Overlay` or `Mask`, resolved with empty params.
- The overlay, panel and mask keys are needed because Angular moves those parts to `<body>` (`uOverlay` / `appendTo="body"`), outside the component root. Examples are the Select/MultiSelect/AutoComplete/CascadeSelect/Password overlays, the DatePicker/ColorPicker panels, and the Image/Galleria/Dialog/Drawer masks. Vue and React render the same parts inside the root, where the extra roots are harmless duplicates.
- Examples: Drawer gives `u-drawer` and `u-drawer-mask`; Tabs gives `u-tabs`, `u-tablist` and `u-tabpanels`; Select gives `u-select` and `u-select-overlay`.

When a component registers its styles, its core also registers:

```css
:where(.u-drawer, .u-drawer *),
:where(.u-drawer, .u-drawer *)::before,
:where(.u-drawer, .u-drawer *)::after {
  box-sizing: border-box;
}
```

The rule is built from that component's roots and registered under the key `u-box-model:<componentName>`.

**Properties of this scoping.**

- **Same precedent as PrimeReact.** It follows PrimeReact 10.9.9 `ComponentBase.js` (`.p-component, .p-component *`).
- **Same in every framework.** The roots come from each framework's own style module, so behaviour does not depend on the `u-component` marker. Reparented overlay, panel and mask parts are covered too (§4.1 and §4.3 enforce this).
- **Projected content.** Application content inside a component subtree also becomes `border-box`, as under Prime. ADR-063 accepts this, and it is the same for every component in every framework.
  - Wrapper components carry their whole content subtree, for example Angular `<u-fluid>` (a wrapper around app forms), BlockUI, Card, Panel, Splitter, Tabs, Dialog and Drawer.
  - Host-element directives put the root class on the application's own element, for example `[uInputText]` on an `<input>`, as Prime does.
  - MIGRATION.md names both.
  - Ultimate reserves its component root class names (for example `u-card`, `u-tag`, `u-button`). A host element that uses one of them exactly is treated as part of a component.
- **Host page.** It is never matched. No component adds a root class to `<html>` or `<body>`: the only classes added there are `u-scroll-panel-bar-grabbed` and `p-overflow-hidden`/`u-overflow-hidden`. A unit test pins this.
- **Precedence.** `:where()` keeps specificity at zero, and every Ultimate sheet is unlayered. So:
  - any unlayered component or application rule that sets `box-sizing` wins;
  - a host rule inside an `@layer` (for example, Tailwind's `box-content` utility in `@layer utilities`) **loses** to this unlayered rule, as it would to any unlayered Ultimate CSS. MIGRATION.md documents this, and the override: an unlayered rule, or `!important`.
- **Unaffected rules.** Existing local `border-box` rules stay unchanged and become redundant.

## 3. Required behavior

1. **New module.** `packages/uix-styled/src/stylesheet/box-model.ts` exports:
   - `BOX_MODEL_KEY_PREFIX = "u-box-model:"`;
   - `boxModelCss(roots: readonly string[])`, which builds the rule above and throws on an empty list or a non-`u-` class;
   - `scopeRootsOf(classes, resolve)`, which extracts the roots as defined in §2;
   - `registerBoxModel(sheet, componentName, roots)`, which adds the rule once per key per sheet (`has()` guard), like `registerHiddenAccessible`.
     `@ultimate/uix-styled` exports them from `src/index.ts`. The module's comments cite `@primeuix/styles` 2.0.3 `base` and PrimeReact 10.9.9 `ComponentBase.js`.
2. **Registration in each core.** Each core calls `registerBoxModel` from its existing registration point, **immediately before** it adds the component's own CSS, and guarded by its own key. In Vue it must sit before `registerComponentStyle`'s early `has(componentName)` return. That is after the theme variables and the shared hidden-accessible and icon-spin rules, the same position in every core.
   - Angular: `ng-core` `basecomponent/base-component.ts`, on the per-document sheet.
   - Vue: `vue-core` `styling/vue-style-sheet.ts` `registerComponentStyle`.
   - React: `react-core` `styling/use-component-style.ts` `useComponentStyle`.
     Each core resolves roots with its own class resolver.
     **React** is included because PrimeReact applies the equivalent rule itself, and GAP-124's React exclusion (D-124-5) concerned icon-spin only. React is outside the parity scope (PARITY_PLAYBOOK §1), so React verification is regression-only and is shown to the owner explicitly (§4).
3. **What stays unchanged.** Component style modules, component templates and every e2e test assertion. There is no Drawer-specific change.
4. **SSR.**
   - **Angular** writes the rule into the per-request document like its other shared rules, and hydration adopts it. A test is added in `ng-core` `base-component.spec.ts`, mirroring the icon-spin test.
   - **Vue and React** inject styles on the client only (`mounted()`, `useMountEffect`). Their `ssr-contract` specs additionally assert that no `u-box-model:*` key is registered on the server.
   - `vue-core` `additional-preset-keys.spec.ts`, which compares ordered key arrays, is updated for the new key's position.
5. **Release records.**
   - A `MIGRATION.md` entry describes the consumer-visible box-model change, its scope and the layered-CSS override, following the GAP-124 entry's precedent.
   - A provenance manifest entry is added for `packages/uix-styled/src/stylesheet/box-model.ts` in `docs/architecture/provenance/uix-styled.json`, following the existing entries for hidden-accessible and icon-spin. Its status is `reference-derived`, citing both upstream rules.

## 4. Verification

1. **Unit tests.**
   - `uix-styled`: `boxModelCss` emits the exact CSS and rejects empty or non-`u-` roots; `registerBoxModel` is idempotent per key.
   - In each framework, a test enumerates **every** component style module and asserts that `scopeRootsOf` yields at least one `u-` root (fail-closed: a component with no root key fails the test). It also asserts that no root equals a class that any source adds to `<body>` or `<html>`.
   - Angular fail-closed test: every template element with `uOverlay` or `appendTo`, and any future `Teleport`/`createPortal` target, binds a `cx('<key>')` whose key is a scope key.
     - A class-less `uOverlay` wrapper is allowed only when its first element child binds a scope key. The known instance is Menu, `menu.ts`: the wrapper's child binds `cx('root')`.
     - The test also covers code-path appends to the document body (`renderer.appendChild(document.body, …)` / `document.body.appendChild`). The appended element's class must come from a scope key. The known instance is Tooltip, which uses `cx("root")`.
   - Each core asserts that the key is registered once, per document in Angular, before the component's CSS.
   - The repository `test` suite passes.
2. **G3-D target.** In the CI image (`mcr.microsoft.com/playwright:v1.63.0-jammy`, arm64), `Ng/` and `Vue/Drawer full and RTL G3-D layout` pass in all three engines, and the full G3-D step passes for ng and vue with `--retries=0`. The RTL half of that test has never run in CI, because the height assertion before it failed. A failure there is a separate finding and a stop condition, not a box-model effect.
3. **Cross-framework assessment.**
   - In the CI image, run every Playwright project the CI job runs against the unchanged baselines: the strict run plus the G3-A…G3-E steps for ng and vue, and the strict run for react.
   - Record each failure and classify it as an expected box-model geometry change, or as anything else.
   - **Any** newly failing layout or behaviour assertion, and any need to edit an assertion, is a stop condition for the user, whatever the assertion encodes.
   - Add a projected-content probe: application content inside an Angular and a Vue Dialog or Panel computes `box-sizing: border-box` in both.
   - Add a generic coverage probe in each framework.
     - With overlays open, every element carrying a `u-` class computes `box-sizing: border-box`.
     - It excludes `html`, `body` and any Storybook or harness element outside the story root (`#storybook-root` and its portal targets), so it checks only elements the component rendered.
     - In Angular it opens all 14 reparenting components (Select, MultiSelect, AutoComplete, CascadeSelect, Password, DatePicker, ColorPicker, Dialog, Drawer, Galleria, Image, ConfirmPopup, ContextMenu and Popover), plus Menu popup and Tooltip.
     - In Vue and React it opens the same set where the story exists.
     - This catches coverage holes beyond the known ones.
   - Record an inventory of component CSS descendant selectors that target unclassed elements (for example `.u-avatar img`, `.u-knob svg`, `.u-image-toolbar > button`). The coverage probe verifies them, including those inside reparented Angular parts.
4. **Baselines.**
   - Regenerate only screenshots whose difference the assessment attributes to the box model.
   - Present a before/after inventory per framework, with React listed separately as regression-only, for the owner's visual acceptance. This is a hard stop before merge (G3 baseline review gate, D-G3-7).
5. **Accessibility.** The G3 differential validators and `ACCESSIBILITY_BASELINE.md` validation pass unchanged.
6. **SSR.** The Angular, React and Vue SSR hydration projects pass.
7. **PR CI.** Both "Run G3-D verification specs" steps are green. Every other result is compared against the current `main` baseline, with no new failures; inherited failures (GAP-094 while it is open) are named.

## 5. Boundaries

- **Out of scope:**
  - GAP-099 (Drawer close button and full border);
  - GAP-096 (SpeedDial footprint);
  - restoring the `u-component` marker;
  - any page-wide rule.
- `@ultimate/uix-styles/base` is left as is. MIGRATION.md notes that it is the page-wide Prime rule and not the supported fix.
- **Merge coordination.** ADR-062 (GAP-094) and ADR-063 are both appended to `DECISIONS.md`. Whichever PR merges second rebases and keeps both.
- GAP-097/GAP-098 tracking updates belong to the closeout.
- **Next gate:** Plan and Plan Review.

## Amendment A1 (Plan Review, 2026-10-15)

- **Empty roots.** `registerBoxModel` is a no-op when `componentName` is `""` or the root list is empty. One case is vue-core's `BaseEditableHolder` default (`componentName: ""`, `classes: {}`), whose `mounted()` runs for every input-tier component. `boxModelCss` still throws on an empty list. The per-framework enumeration test (§4.1) is the fail-closed guard that every real component style module yields roots.
- **`scopeRootsOf(classes)`.** It takes `classes: Record<string, unknown>` and resolves values itself through `@ultimate/uix-utils` `cn` with `{}` params. That is the same resolution every core's `cx()` performs, so a per-core resolver argument is not needed. This supersedes §3.1's `scopeRootsOf(classes, resolve)`.
- **Vue and React also reparent.** §2 says Vue and React render overlay parts inside the root. They do not always:
  - Vue renders through vue-core `UPortal` (Teleport) in 18 components, and Vue Tooltip appends to `document.body`.
  - React uses `Portal` in drawer, tooltip, confirm-popup, galleria, image, context-menu, dialog, popover and menu.

  The same scope roots cover those parts, because the reparented element carries its root, overlay, panel or mask class. The coverage probe (§4.3) therefore includes every component that uses `UPortal`/`Portal`, and it checks elements appended directly to `<body>`.

- **Where the enumeration and reparenting checks live.** The Angular package tests run under `@angular/build:unit-test`, which does not support `import.meta.glob`. The per-framework enumeration and the Angular reparenting static check therefore live in `packages/themes/test`, which runs plain Vitest and already uses `import.meta.glob` (until now only over its own `src/presets`). Importing ng/vue/react style modules from there is new, and its feasibility was verified in Plan Review.

## Amendment A2 (implementation evidence, 2026-10-15)

- **The coverage probe found a real gap.** The Plan Task 6 coverage probe found one reparented element without a scope-key class: Vue AutoComplete teleports its `ul.u-autocomplete-list` (`cx('list')`) to `<body>` with no overlay wrapper. As a result that list and its `li.u-autocomplete-option` children stayed `content-box`. PrimeVue wraps the list in `p-autocomplete-overlay`; the Vue port does not.
- **Other teleports are fine.** Every other Vue `UPortal` child and every React `Portal` child binds `root`, `overlay`, `panel` or `mask`.
- **Change.** Without changing the template (§3.3), the scope keys gain `list`:
  `/^(root|overlay|panel|mask|list)$|(Root|Overlay|Mask)$/`.
  Where a `list` element sits inside a root, the extra root is a harmless duplicate. The enumeration guard confirms that every `list` key resolves to a `u-` class.
- **Follow-up.** Restoring the overlay wrapper in Vue AutoComplete is a separate port-fidelity question.
- **ScrollTop probe target.** Vue and React ScrollTop pass their root class to a composed `UButton`, whose attributes do not reach the DOM (the existing `inheritAttrs` behaviour, the same cause as the Card and BlockUI follow-ups). The rendered element is therefore a Button root, covered by Button's own rule, and the probe targets that button.
