# PrimeNG 21.1.9 — foundations

Cross-cutting notes on how PrimeNG is installed, configured, built and styled. They describe what the pinned PrimeNG archive ships; they do not describe Ultimate. Component-specific facts belong in the component records.

All citations use the prefix `primeng-21.1.9:` followed by a path relative to the archive root (the commit-hash folder `primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/` is omitted).

## Contents

1. [Repository and package layout](#1-repository-and-package-layout)
2. [Dependencies](#2-dependencies)
3. [Installation](#3-installation)
4. [Provider setup and configuration](#4-provider-setup-and-configuration)
5. [Component architecture](#5-component-architecture)
6. [Style injection](#6-style-injection)
7. [Theming with `@primeuix/themes` and `@primeuix/styled`](#7-theming-with-primeuixthemes-and-primeuixstyled)
8. [Unstyled mode](#8-unstyled-mode)
9. [Pass-through (`pt` / `ptOptions`)](#9-pass-through-pt--ptoptions)
10. [The `api` entry point](#10-the-api-entry-point)
11. [Utilities: `utils`, `dom`, `ts-helpers`](#11-utilities-utils-dom-ts-helpers)
12. [Helper directives](#12-helper-directives)
13. [Animations and `@primeuix/motion`](#13-animations-and-primeuixmotion)
14. [Icons](#14-icons)
15. [Guides](#15-guides)
16. [LLM and AI tooling](#16-llm-and-ai-tooling)
17. [Notes for component records](#17-notes-for-component-records)

## 1. Repository and package layout

The archive is a pnpm workspace with three packages under `packages/` (`primeng`, `themes`, `mcp`) and the documentation site under `apps/showcase`. Shared dependency versions are pinned through pnpm catalogs in `pnpm-workspace.yaml`.

- `packages/primeng` — the published `primeng` package, version `21.1.9`, built with ng-packagr (`ng build primeng`). Its `publishConfig.directory` is `dist`, so the published tarball is the ng-packagr output rather than the source folder. A `prebuild` script copies `package.json` into `packages/primeng/src/` without the `exports`, `main`, `module`, `types`, `scripts` and `devDependencies` fields so that ng-packagr can generate them; a `postbuild` step copies the README and LICENSE. Tests run under Karma/Jasmine (`ng test primeng`).
- `packages/themes` — `@primeng/themes` `21.1.9`, marked `"private": true`. Its root entry re-exports `@primeuix/styled` and its `./*` subpaths map to `src/presets/<name>/index.ts`; each preset file re-exports the matching module from `@primeuix/themes` (for example `@primeuix/themes/aura/button`). It is a thin compatibility shim; the real presets live in `@primeuix/themes`.
- `packages/mcp` — `@primeng/mcp` `21.1.9`, an MCP server binary (see [§16](#16-llm-and-ai-tooling)).

The license field of all three packages is `"SEE LICENSE IN LICENSE.md"`.

### Entry points

The root entry file `packages/primeng/src/public_api.ts` contains only `export default {};`. There is no barrel: every public symbol is imported from a secondary entry point such as `primeng/button` or `primeng/api`. The root `ng-package.json` sets `dest: ../dist`, `entryFile: public_api.ts` and lists `@primeuix/styled`, `@primeuix/utils`, `@primeuix/styles` and `@primeuix/motion` as `allowedNonPeerDependencies`. Every first-level folder of `packages/primeng/src/` carries its own `ng-package.json` and `public_api.ts`, which makes it a separate entry point.

The first-level entry points are:

- **Components and component directives:** accordion, animateonscroll, autocomplete, avatar, avatargroup, badge, blockui, breadcrumb, button, buttongroup, card, carousel, cascadeselect, chart, checkbox, chip, colorpicker, confirmdialog, confirmpopup, contextmenu, dataview, datepicker, dialog, divider, dock, dragdrop, drawer, dynamicdialog, editor, fieldset, fileupload, floatlabel, fluid, focustrap, galleria, iconfield, iftalabel, image, imagecompare, inplace, inputgroup, inputgroupaddon, inputicon, inputmask, inputnumber, inputotp, inputtext, keyfilter, knob, listbox, megamenu, menu, menubar, message, metergroup, multiselect, orderlist, organizationchart, overlay, overlaybadge, paginator, panel, panelmenu, password, picklist, popover, progressbar, progressspinner, radiobutton, rating, ripple, scroller, scrollpanel, scrolltop, select, selectbutton, skeleton, slider, speeddial, splitbutton, splitter, stepper, steps, styleclass, table, tabs, tag, terminal, textarea, tieredmenu, timeline, toast, togglebutton, toggleswitch, toolbar, tooltip, tree, treeselect, treetable.
- **Infrastructure:** `api`, `base`, `basecomponent`, `baseeditableholder`, `baseinput`, `basemodelholder`, `bind`, `classnames`, `autofocus`, `config`, `dom`, `icons`, `motion`, `passthrough`, `ts-helpers`, `types`, `usestyle`, `utils`.

Two folders contain nested entry points:

- `packages/primeng/src/types/<component>/` — 91 folders, each exposing `primeng/types/<component>` with a `<component>.types.ts` file (pass-through options, template contexts, event types). There is no `primeng/types` barrel.
- `packages/primeng/src/icons/<icon>/` — 54 icon folders plus `baseicon`, each exposing `primeng/icons/<icon>`. `primeng/icons` re-exports them all.

Sources:

- `primeng-21.1.9:pnpm-workspace.yaml`
- `primeng-21.1.9:packages/primeng/package.json`
- `primeng-21.1.9:packages/primeng/scripts/prebuild.mjs`
- `primeng-21.1.9:packages/primeng/src/ng-package.json`
- `primeng-21.1.9:packages/primeng/src/public_api.ts`
- `primeng-21.1.9:packages/themes/package.json`
- `primeng-21.1.9:packages/themes/src/index.ts`
- `primeng-21.1.9:packages/themes/src/presets/aura/button/index.ts`
- `primeng-21.1.9:packages/mcp/package.json`
- `primeng-21.1.9:packages/primeng/src/icons/public_api.ts`

## 2. Dependencies

`packages/primeng/package.json` declares:

| Kind           | Package                     | Range (catalog value)                 |
| -------------- | --------------------------- | ------------------------------------- |
| peerDependency | `@angular/cdk`              | `catalog:angular21` → `^21.0.0`       |
| peerDependency | `@angular/common`           | `catalog:angular21` → `^21.0.0`       |
| peerDependency | `@angular/core`             | `catalog:angular21` → `^21.0.7`       |
| peerDependency | `@angular/forms`            | `catalog:angular21` → `^21.0.0`       |
| peerDependency | `@angular/router`           | `catalog:angular21` → `^21.0.0`       |
| peerDependency | `@angular/platform-browser` | `catalog:angular21` → `^21.0.0`       |
| peerDependency | `rxjs`                      | `^6.0.0 \|\| ^7.8.1`                  |
| dependency     | `@primeuix/styled`          | `catalog:` → `^0.7.4`                 |
| dependency     | `@primeuix/utils`           | `catalog:` → `^0.7.2`                 |
| dependency     | `@primeuix/styles`          | `catalog:` → `^2.0.3`                 |
| dependency     | `@primeuix/motion`          | `catalog:` → `^0.0.10`                |
| devDependency  | `tslib`                     | `^2.8.1` (plus Karma/Jasmine tooling) |

Observations:

- `@angular/animations` is not a peer dependency and is not imported anywhere in `packages/primeng/src` (a full-text search finds no import). Animation is handled by `@primeuix/motion` and Angular's native `animate.enter`/`animate.leave` (see [§13](#13-animations-and-primeuixmotion)).
- `@primeuix/themes` is not a dependency of `primeng`; applications install it themselves to get presets (see [§3](#3-installation)).
- `primeicons` (`^7.0.0` in the workspace catalog) is not a dependency of `primeng`. Only the showcase app depends on it. Components draw their built-in icons with the SVG icon components from `primeng/icons`.
- The workspace catalog also pins `tailwindcss-primeui` `^0.6.1` and `@primeuix/mcp` `^1.0.0`; the toolchain uses `ng-packagr` `21.0.0` and `typescript` `5.9.3`.
- `@primeng/themes` depends on `@primeuix/styled` and `@primeuix/themes`; `@primeng/mcp` depends on `@primeuix/mcp` and declares `engines.node >=12.11.0`.

Sources:

- `primeng-21.1.9:packages/primeng/package.json`
- `primeng-21.1.9:pnpm-workspace.yaml`
- `primeng-21.1.9:packages/themes/package.json`
- `primeng-21.1.9:packages/mcp/package.json`
- `primeng-21.1.9:apps/showcase/package.json`

## 3. Installation

The documented install is a single command that adds both `primeng` and `@primeuix/themes` (npm, yarn and pnpm variants are shown). Setup then registers `providePrimeNG` from `primeng/config` in the application's `ApplicationConfig` providers with a `theme` whose `preset` is a preset such as Aura imported from `@primeuix/themes/aura`. To verify the setup the docs import `ButtonModule` from `primeng/button` into a standalone component and render `<p-button label="Check" />`; they stress that each component is imported on its own so only used code is bundled.

Sources:

- `primeng-21.1.9:apps/showcase/doc/installation/download-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/installation/provider-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/installation/theme-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/installation/verify-doc.ts`

Documentation inconsistencies worth knowing:

- `installation/theme-doc.ts` passes the preset directly (`theme: Aura`) while `installation/provider-doc.ts` uses `theme: { preset: Aura }`. The type `ThemeType` is `{ preset?: any; options?: any } | 'none' | boolean | undefined`, so the object form is the typed one.
- `installation/theme-doc.ts`, `configuration/theme-doc.ts` and `configuration/provider-doc.ts` still add `provideAnimationsAsync()` from `@angular/platform-browser/animations/async`, although the library itself never uses `@angular/animations`.
- `configuration/filtermode-doc.ts` and `configuration/zindex-doc.ts` inject a `PrimeNGConfig` class from `primeng/api`. No such export exists in 21.1.9; the runtime configuration service is `PrimeNG` from `primeng/config`.

Sources:

- `primeng-21.1.9:apps/showcase/doc/configuration/theme-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/provider-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/filtermode-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/zindex-doc.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/public_api.ts`

## 4. Provider setup and configuration

`primeng/config` exports four modules: `primeng.ts`, `primeng.types.ts`, `provideprimeng.ts` and `themeprovider.ts`.

### `providePrimeNG`

```ts
export const PRIME_NG_CONFIG = new InjectionToken<PrimeNGConfigType>("PRIME_NG_CONFIG");
export function providePrimeNG(...features: PrimeNGConfigType[]): EnvironmentProviders;
```

Each feature object is registered under `PRIME_NG_CONFIG` (`multi: false`, so only the last is readable through the token), and an `provideAppInitializer` callback injects the `PrimeNG` service and calls `setConfig(feature)` for every feature in order. The result is wrapped in `makeEnvironmentProviders`, so it belongs in application or route environment providers, not component providers. Source: `primeng-21.1.9:packages/primeng/src/config/provideprimeng.ts`.

### `PrimeNGConfigType`

```ts
type PrimeNGConfigType = {
  ripple?: boolean;
  overlayAppendTo?: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any;
  /** @deprecated Since v20. Use `inputVariant` instead. */
  inputStyle?: "outlined" | "filled";
  inputVariant?: "outlined" | "filled";
  overlayOptions?: OverlayOptions;
  translation?: Translation;
  /** @experimental — documented as not yet implemented */
  unstyled?: boolean;
  zIndex?: ZIndex | null | undefined;
  pt?: GlobalPassThrough | null | undefined;
  ptOptions?: PassThroughOptions | null | undefined;
  filterMatchModeOptions?: any;
} & ThemeConfigType;

type ThemeConfigType = { theme?: ThemeType; csp?: { nonce: string | undefined } };
type ThemeType = { preset?: any; options?: any } | "none" | boolean | undefined;
type ZIndex = { modal: number; overlay: number; menu: number; tooltip: number };
```

Source: `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`.

### The `PrimeNG` service

`PrimeNG` is `@Injectable({ providedIn: 'root' })` and extends `ThemeProvider`. Most options are Angular signals, so they can be read reactively and changed at runtime (the docs show `this.primeng.ripple.set(true)`). Source: `primeng-21.1.9:packages/primeng/src/config/primeng.ts`, `primeng-21.1.9:apps/showcase/doc/configuration/dynamic-doc.ts`.

| Option                   | Storage                                  | Default                                                                                                                                                                  | Effect                                                                                                            |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `ripple`                 | `signal<boolean>`                        | `false`                                                                                                                                                                  | Enables the `pRipple` ink effect; `Ripple` checks `config.ripple()` before acting.                                |
| `inputStyle`             | signal                                   | `null`                                                                                                                                                                   | Deprecated since v20; still read as a fallback by `BaseInput.$variant`.                                           |
| `inputVariant`           | `signal<'outlined' \| 'filled' \| null>` | `null`                                                                                                                                                                   | Default variant for inputs; `BaseInput.$variant = variant() \|\| config.inputStyle() \|\| config.inputVariant()`. |
| `overlayAppendTo`        | signal                                   | `'self'`                                                                                                                                                                 | Default overlay container; `'self'` is the host element, `'body'` the document body.                              |
| `overlayOptions`         | plain field                              | `{}`                                                                                                                                                                     | Default `OverlayOptions` for overlay-based components.                                                            |
| `csp`                    | signal                                   | `{ nonce: undefined }`                                                                                                                                                   | The nonce is added to every injected `<style>` element.                                                           |
| `unstyled`               | `signal<boolean \| undefined>`           | `undefined`                                                                                                                                                              | Global unstyled mode (see [§8](#8-unstyled-mode)).                                                                |
| `pt`                     | signal                                   | `undefined`                                                                                                                                                              | Global pass-through, keyed by component (see [§9](#9-pass-through-pt--ptoptions)).                                |
| `ptOptions`              | signal                                   | `undefined`                                                                                                                                                              | Global pass-through merge options.                                                                                |
| `filterMatchModeOptions` | plain field                              | text: `startsWith, contains, notContains, endsWith, equals, notEquals`; numeric: `equals, notEquals, lt, lte, gt, gte`; date: `dateIs, dateIsNot, dateBefore, dateAfter` | Match modes offered in table filter menus.                                                                        |
| `translation`            | plain field (`Translation`)              | English strings (see below)                                                                                                                                              | Locale text used by components; read via `getTranslation(key)`.                                                   |
| `zIndex`                 | plain field (`ZIndex`)                   | `{ modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 }`                                                                                                              | Base z-index per overlay category.                                                                                |
| `theme`                  | signal (from `ThemeProvider`)            | `undefined`                                                                                                                                                              | Preset and theme options (see [§7](#7-theming-with-primeuixthemes-and-primeuixstyled)).                           |

Methods: `getTranslation(key: string)`, `setTranslation(value: Translation)` (merges into the current translation and emits on `translationObserver`), `setConfig(config: PrimeNGConfigType)` and, from `ThemeProvider`, `setThemeConfig(config: ThemeConfigType)`.

`setConfig` applies each key only when its value is truthy (`if (ripple) …`, `if (unstyled) …`). As a consequence, passing `ripple: false` or `unstyled: false` through `providePrimeNG` never changes the signal; it simply keeps the default. `theme` and `csp` are forwarded together to `setThemeConfig`. Source: `primeng-21.1.9:packages/primeng/src/config/primeng.ts`, `primeng-21.1.9:packages/primeng/src/config/themeprovider.ts`.

The JSDoc on `unstyled` calls it experimental and "not yet implemented", but `BaseComponent.$unstyled` does read `config.unstyled()`, and the unstyled guide documents `providePrimeNG({ unstyled: true })` as working. Treat the JSDoc as stale. Sources: `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`, `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`, `primeng-21.1.9:apps/showcase/doc/theming/unstyled/setup-doc.ts`.

### Locale

The default `Translation` object carries English strings for filter match modes (`startsWith` … `dateAfter`, `matchAll`, `matchAny`, `addRule`, `removeRule`, `apply`, `clear`), confirmation (`accept: 'Yes'`, `reject: 'No'`), file upload (`choose`, `upload`, `cancel`, `pending`, `completed`, `fileSizeTypes`), calendar (`dayNames`, `dayNamesShort`, `dayNamesMin`, `monthNames`, `monthNamesShort`, `chooseYear`/`chooseMonth`/`chooseDate`, `prevDecade` … `nextSecond`, `am`, `pm`, `dateFormat: 'mm/dd/yy'`, `firstDayOfWeek: 0`, `today`, `weekHeader: 'Wk'`), password strength (`weak`, `medium`, `strong`, `passwordPrompt`), list messages (`emptyMessage`, `searchMessage`, `selectionMessage: '{0} items selected'`, `emptySelectionMessage`, `emptySearchMessage`, `emptyFilterMessage`, `fileChosenMessage`, `noFileChosenMessage`) and an `aria` group of screen-reader labels (for example `star: '1 star'`, `stars: '{star} stars'`, `pageLabel: '{page}'`, `slideNumber: '{slideNumber}'`, `selectRow`, `expandRow`, `zoomImage`, `browseFiles`, `maximizeLabel`). `TranslationKeys` in `primeng/api` provides string constants for these keys.

Translations are supplied through the `translation` option at startup or replaced at runtime with `setTranslation` (the docs pair it with ngx-translate). Ready-made locale files are pointed to in the external PrimeLocale repository; none ship in the archive.

Sources:

- `primeng-21.1.9:packages/primeng/src/config/primeng.ts`
- `primeng-21.1.9:packages/primeng/src/api/translation.ts`
- `primeng-21.1.9:packages/primeng/src/api/translationkeys.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/locale/translationdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/locale/runtimedoc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/locale/repositorydoc.ts`
- `primeng-21.1.9:apps/showcase/doc/configuration/locale/apidoc.ts`

### Other configuration docs

- **CSP:** `csp: { nonce: '...' }` sets the nonce for dynamically created style elements. Source: `primeng-21.1.9:apps/showcase/doc/configuration/csp-doc.ts`.
- **Ripple:** disabled by default; `ripple: true` turns it on for supporting components. Source: `primeng-21.1.9:apps/showcase/doc/configuration/ripple-doc.ts`.
- **Input variant:** `outlined` (default look, bordered) or `filled` (background colour); a preset may add more per-variant design. Source: `primeng-21.1.9:apps/showcase/doc/configuration/inputvariant-doc.ts`.
- **Overlay append target:** `self` by default, `body` to move overlays to the document body. Source: `primeng-21.1.9:apps/showcase/doc/configuration/overlayappendto-doc.ts`.
- **zIndex:** the categories are `modal` (dialog, drawer), `overlay` (select-type popups, popover), `menu` (overlay menus) and `tooltip`. Source: `primeng-21.1.9:apps/showcase/doc/configuration/zindex-doc.ts`.
- **Theme:** four built-in presets — Aura, Material, Lara, Nora. Source: `primeng-21.1.9:apps/showcase/doc/configuration/theme-doc.ts`.

### Global pass-through type

`GlobalPassThrough` has an optional camelCase key per component pointing to that component's `*PassThrough` type (for example `accordion`, `autoComplete`, `blockUI`, `cascadeSelect`, `colorPicker`, `columnFilter`, `confirmDialog`, `iftaLabel`, `inputOtp`, `megaMenu`, `orderList`, `overlayBadge`, `radioButton`, `scrollPanel`, `speedDial`, `splitButton`, `tab`, `tabList`, `tabPanel`, `tabPanels`, `tieredMenu`, `toggleSwitch`, `treeTable`, `virtualScroller` → `VirtualScrollerPassThrough`), a `global?: { css?: string }` key whose CSS is injected as a style named `global`, and a `[key: string]: any` index signature. Several components (for example contextMenu, dataView, datePicker, listbox, multiSelect, paginator, password, pickList, textarea, tooltip) have no explicit key and are only typed through the index signature. Source: `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`.

## 5. Component architecture

### Standalone first, NgModules kept

Components and directives are standalone. Each entry point still exports an `NgModule` (104 files declare `@NgModule`) that imports and re-exports the standalone classes plus `SharedModule`, for example `ButtonModule` exporting `ButtonDirective`, `Button`, `ButtonLabel`, `ButtonIcon` and `SharedModule`. The exceptions marked `standalone: false` are internal parts of large components — 25 declarations in `table/table.ts`, 16 in `treetable/treetable.ts`, 5 in `galleria/galleria.ts` — and `Header`/`Footer` in `api/shared.ts`. Components overwhelmingly use `ChangeDetectionStrategy.OnPush` and `ViewEncapsulation.None` (styles are global, not emulated).

Sources:

- `primeng-21.1.9:packages/primeng/src/button/button.ts`
- `primeng-21.1.9:packages/primeng/src/table/table.ts`
- `primeng-21.1.9:packages/primeng/src/treetable/treetable.ts`
- `primeng-21.1.9:packages/primeng/src/galleria/galleria.ts`
- `primeng-21.1.9:packages/primeng/src/api/shared.ts`

### Class hierarchy

```text
BaseComponent<PT>                       primeng/basecomponent
├── BaseModelHolder<PT>                 primeng/basemodelholder
│   ├── InputText, Textarea
│   └── BaseEditableHolder<PT>          primeng/baseeditableholder  (ControlValueAccessor)
│       ├── CascadeSelect, Checkbox, ColorPicker, Editor, InputOtp, Knob, Listbox,
│       │   MultiSelect, RadioButton, Rating, SelectButton, Slider, ToggleButton,
│       │   ToggleSwitch, TreeSelect
│       └── BaseInput<PT>               primeng/baseinput
│           └── AutoComplete, DatePicker, InputMask, InputNumber, Password, Select
├── BaseIcon                            primeng/icons/baseicon
└── most other components and directives (Button, Ripple, AutoFocus, MotionDirective, …)
```

All base classes are `@Directive({ standalone: true })`. Sources: `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`, `primeng-21.1.9:packages/primeng/src/basemodelholder/basemodelholder.ts`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`.

### `BaseComponent<PT = any>`

`BaseComponent` is declared with `providers: [BaseComponentStyle, BaseStyle]` and implements the `Lifecycle` interface. It exports the token `PARENT_INSTANCE = new InjectionToken<BaseComponent>('PARENT_INSTANCE')`, which components provide with `useExisting` so that child components can find their parent through `inject(PARENT_INSTANCE, { optional: true, skipSelf: true })`.

Signal inputs shared by every component:

| Input       | Type                                       | Purpose                                                   |
| ----------- | ------------------------------------------ | --------------------------------------------------------- |
| `dt`        | `input<Object \| undefined>()`             | Scoped design tokens for this instance only.              |
| `unstyled`  | `input<boolean \| undefined>()`            | Per-instance unstyled mode.                               |
| `pt`        | `input<PT \| undefined>()`                 | Per-instance pass-through.                                |
| `ptOptions` | `input<PassThroughOptions \| undefined>()` | Merge behaviour between global and instance pass-through. |

Key internal members:

- `componentName` (set by subclasses, for example `'Button'`, `'Select'`) becomes `$name`, which selects the global `pt` entry and the `data-pc-name` attribute. An optional `hostName` marks a component rendered inside another one.
- `$attrSelector = uuid('pc')` — a unique attribute added to the host after view init and used to scope instance-level `dt` styles.
- `$unstyled = computed(() => this.unstyled() ?? this.directiveUnstyled() ?? this.config?.unstyled() ?? false)` — instance input wins over directive input, which wins over global config.
- `$pt` resolves the instance `pt` (or `directivePT`) against `$params = { instance: this, parent: { instance: $parentInstance } }`.
- `_componentStyle` — each component injects its own style service into this field; `$style` merges it with any host instance style.
- `cn` (from `@primeuix/utils`) is exposed as `protected readonly cn` for templates.

Template helpers:

| Method                           | Returns                                                                                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `cx(key, params?)`               | The class string for section `key` from the style service's `classes` map, or `undefined` when unstyled. |
| `sx(key?, when = true, params?)` | Inline styles for `key` from the `inlineStyles` maps of the base and component style services.           |
| `ptm(key = '', params = {})`     | Merged pass-through attributes for section `key` (global + instance + `data-pc-*` datasets).             |
| `ptms(keys: string[], params)`   | `ptm` for several keys merged together.                                                                  |
| `ptmo(obj, key, params)`         | Pass-through read from an arbitrary object (used for item-level `pt`), without global defaults.          |

Lifecycle: subclasses implement `onInit`, `onChanges`, `onDoCheck`, `onAfterContentInit`, `onAfterContentChecked`, `onAfterViewInit`, `onAfterViewChecked` and `onDestroy`. The JSDoc warns against overriding the Angular `ng*` hooks, because `BaseComponent` uses them to call the `on*` method and then run any pass-through `hooks.<name>` callbacks. The constructor fires `onBeforeInit` the same way.

Style loading performed by `BaseComponent` (browser only) is described in [§6](#6-style-injection).

Source: `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`, `primeng-21.1.9:packages/primeng/src/api/lifecycle.ts`.

### Form base classes

- `BaseModelHolder` holds `modelValue = signal<...>(undefined)`, `$filled = computed(() => isNotEmpty(this.modelValue()))` and `writeModelValue(value)`.
- `BaseEditableHolder` implements `ControlValueAccessor`. Inputs: `required`, `invalid`, `disabled` (all `booleanAttribute`), `name`. It keeps `_disabled` (forms API) and `$disabled = computed(() => this.disabled() || this._disabled())`. Subclasses override `writeControlValue(value, setModelValue)`; `writeValue`, `registerOnChange`, `registerOnTouched` and `setDisabledState` are implemented once here. Components still register themselves with `NG_VALUE_ACCESSOR` and `forwardRef` in their own providers.
- `BaseInput` adds `fluid`, `variant: 'filled' | 'outlined'`, `size: 'large' | 'small'`, `inputSize`, `pattern`, `min`, `max`, `step`, `minlength`, `maxlength`; `$variant` falls back to the global `inputStyle`/`inputVariant`; `hasFluid` returns `fluid() ?? !!pcFluid`, where `pcFluid` is an optional host `Fluid` ancestor.

Sources: `primeng-21.1.9:packages/primeng/src/basemodelholder/basemodelholder.ts`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primeng-21.1.9:packages/primeng/src/baseinput/baseinput.ts`, `primeng-21.1.9:packages/primeng/src/select/select.ts`.

### Templates

Components accept customisation templates in two ways that coexist: template reference variables read with `@ContentChild('<name>', { descendants: false })` (for example `<ng-template #dropdownicon>`), and the older `pTemplate="<name>"` directive (`PrimeTemplate` from `primeng/api`), collected with `@ContentChildren(PrimeTemplate)` and dispatched by name in `onAfterContentInit`. Templates receive typed contexts declared in `primeng/types/<component>` (for example `SelectIconTemplateContext`). Sources: `primeng-21.1.9:packages/primeng/src/select/select.ts`, `primeng-21.1.9:packages/primeng/src/api/shared.ts`, `primeng-21.1.9:packages/primeng/src/types/select/select.types.ts`.

## 6. Style injection

### `BaseStyle`

`BaseStyle` (`primeng/base`, `providedIn: 'root'`) is the base of every style service. Fields: `name = 'base'`, `css`, `style`, `classes = {}`, `inlineStyles = {}`. Its methods resolve a CSS source (string or function of `dt`) with `css`/`dt`/`Theme` from `@primeuix/styled`, minify it with `minifyCSS` from `@primeuix/utils`, and hand it to `UseStyle`:

- `load(style, options, transform)` — generic loader.
- `loadCSS(options)` — loads the service's static `css`.
- `loadStyle(options, style)` — loads the theme-driven `style` after `Theme.transformCSS`.
- `loadBaseCSS` — the small library-level CSS (`.p-hidden-accessible` for visually hidden content and `.p-overflow-hidden` using `dt('scrollbar.width')`).
- `loadBaseStyle` — the shared base style imported from `@primeuix/styles/base`.
- Theme accessors: `getCommonTheme`, `getComponentTheme`, `getPresetTheme(preset, selector, params)`, `getLayerOrderThemeCSS`.
- SSR helpers that render a `<style type="text/css" data-primeng-style-id="<name>">` string: `getStyleSheet`, `getCommonThemeStyleSheet`, `getThemeStyleSheet`.

`primeng/base` also exports `Base`, a registry of loaded style names (`isStyleNameLoaded`, `setLoadedStyleName`, `deleteLoadedStyleName`, `clearLoadedStyleNames`, `getLoadedStyleNames`) that prevents duplicate injection.

Sources: `primeng-21.1.9:packages/primeng/src/base/style/basestyle.ts`, `primeng-21.1.9:packages/primeng/src/base/base.ts`, `primeng-21.1.9:packages/primeng/src/base/public_api.ts`.

### `UseStyle`

`UseStyle.use(css, options)` (`primeng/usestyle`, `providedIn: 'root'`) creates or reuses a `<style>` element identified by `data-primeng-style-id="<name>"` and inserts it into `document.head` (at the start when `first: true`) with `type`, `media` and `nonce` attributes, updating `textContent` only when it changed. Options: `immediate = true`, `manual = false`, `name = 'style_<n>'`, `id`, `media`, `nonce`, `first = false`, `props`. All PrimeNG CSS therefore lives in runtime `<style>` tags; there are no CSS files to import for styled mode. Source: `primeng-21.1.9:packages/primeng/src/usestyle/usestyle.ts`.

### Load order performed by `BaseComponent`

1. **Core styles** (skipped when unstyled): once per style name, `BaseComponentStyle.loadCSS` (name `'common'`) and the component style's `loadCSS`.
2. **Base** (once): `loadBaseCSS` plus any `pt.global.css` loaded under the name `global`.
3. **Theme styles** (skipped when unstyled or when `config.theme() === 'none'`):
   - common theme, once: `primitive-variables`, `semantic-variables`, `global-variables` and `global-style`;
   - per component: `<name>-variables` (CSS variables from the component tokens) and `<name>-style` (the component's structural style from `@primeuix/styles`);
   - `layer-order`, once, inserted first.
4. **Scoped tokens:** when the instance has a `dt` input, a preset is generated for the selector `[<$attrSelector>]` and loaded as `<attrSelector>-<name>`; it is removed on destroy.

Theme changes (`ThemeService` event `theme:change`) re-run steps 1, 3 and 4. All nonces come from `config.csp().nonce`. Source: `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`.

`ThemeProvider` (the parent class of `PrimeNG`) also loads the common theme whenever the `theme` signal changes and clears the loaded-name registry and `ThemeService` on destroy. Source: `primeng-21.1.9:packages/primeng/src/config/themeprovider.ts`.

## 7. Theming with `@primeuix/themes` and `@primeuix/styled`

PrimeNG splits a theme into a **base** (structural CSS with CSS-variable placeholders, from `@primeuix/styles/<component>`) and a **preset** (design tokens, from `@primeuix/themes`). Tokens come in three tiers: primitive (context-free palettes such as `blue.500`), semantic (purpose names such as `primary.color`, with a `colorScheme` group for light/dark values) and component (for example `button.background`). Presets shipped: Aura, Material, Lara, Nora.

Sources: `primeng-21.1.9:apps/showcase/doc/theming/styled/architecture-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/presets-doc.ts`.

### Theme options

`theme.options` controls how CSS is generated:

| Option             | Default    | Meaning                                                                                                                                                  |
| ------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefix`           | `'p'`      | CSS variable prefix; `primary.color` becomes `var(--p-primary-color)`.                                                                                   |
| `darkModeSelector` | `'system'` | `'system'` emits `@media (prefers-color-scheme: dark)`; a selector such as `'.my-app-dark'` makes it toggleable; `false` or `'none'` disables dark mode. |
| `cssLayer`         | `false`    | `true` or `{ name, order }` wraps the library styles in a cascade layer (default name `primeng`).                                                        |

Sources: `primeng-21.1.9:apps/showcase/doc/theming/styled/options-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/darkmode-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/specificity-doc.ts`.

### Customisation API (from `@primeuix/themes`)

- `definePreset(base, overrides)` — derive a preset at setup time.
- `usePreset(preset)` — replace the active preset at runtime.
- `updatePreset(tokens)` — merge tokens into the active preset at runtime (for example a new primary palette).
- `$dt(path)` — return `{ name, variable, value }` for a token.
- Component overrides go under `components.<name>`; custom tokens under `extend`, with extra CSS supplied as `css: ({ dt }) => string`.
- Token overrides must mirror the preset's structure: if the preset defines a token under `colorScheme`, a flat override is ignored.

Sources: `primeng-21.1.9:apps/showcase/doc/theming/styled/definepreset-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/usepreset-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/updatepreset-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/dt-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/component-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/extend-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/colorscheme-doc.ts`.

### Scoped tokens, scale, fonts, focus ring

- The `dt` input scopes token overrides to one instance; the docs recommend it over `::ng-deep`. Source: `primeng-21.1.9:apps/showcase/doc/theming/styled/scopedtokens-doc.ts`.
- Components size in `rem`; changing the root `font-size` scales the suite. Fonts are inherited from the application. Sources: `primeng-21.1.9:apps/showcase/doc/theming/styled/scale-doc.ts`, `primeng-21.1.9:apps/showcase/doc/theming/styled/font-doc.ts`.
- The focus ring is a semantic token group (`focusRing.width`, `style`, `color`, `offset`). Source: `primeng-21.1.9:apps/showcase/doc/theming/styled/focusring-doc.ts`.

### CSS layers

With `cssLayer` enabled, styles sit in the `primeng` layer, so unlayered application CSS wins regardless of selector strength. The guides show ordering `primeng` after reset, normalize or Bootstrap reboot layers. Sources: `primeng-21.1.9:apps/showcase/doc/guides/csslayer/specificity-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/csslayer/reset-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/csslayer/normalize-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/csslayer/bootstrap-doc.ts`.

### Tailwind CSS

PrimeNG itself does not depend on Tailwind. The optional `tailwindcss-primeui` plugin exposes semantic colours as utilities (`bg-primary`, `text-surface-500`, `text-muted-color`), adds component-state variants (for example `p-outlined:`) and animation utilities usable with `pStyleClass` and `pAnimateOnScroll`. It ships a CSS build for Tailwind v4 (`@import "tailwindcss-primeui";`) and a JS plugin for v3. Dark mode needs Tailwind's `dark` variant aligned with `darkModeSelector`. Overriding component styles with utilities needs either the important modifier (`p-8!` in v4, `!p-8` in v3; discouraged) or `cssLayer`. PrimeFlex is retired in favour of Tailwind; `primeclt` offers a `pf2tw` migration command.

Sources: `primeng-21.1.9:apps/showcase/doc/tailwind/overview-doc.ts`, `primeng-21.1.9:apps/showcase/doc/tailwind/plugin-doc.ts`, `primeng-21.1.9:apps/showcase/doc/tailwind/extensions-doc.ts`, `primeng-21.1.9:apps/showcase/doc/tailwind/darkmode-doc.ts`, `primeng-21.1.9:apps/showcase/doc/tailwind/override-doc.ts`, `primeng-21.1.9:apps/showcase/doc/tailwind/animations-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/primeflex/overview-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/primeflex/migration-doc.ts`.

## 8. Unstyled mode

In unstyled mode neither the token CSS variables nor the theme style rules are injected; components keep behaviour and accessibility only. It is enabled globally with `providePrimeNG({ unstyled: true })` or per instance with `[unstyled]="true"`. Mechanically, `$unstyled()` stops core and theme style loading and makes `cx()` return `undefined`, so no `p-*` classes are emitted; styling is then supplied through `pt` (the docs recommend Tailwind utilities, globally via `providePrimeNG({ unstyled: true, pt: { button: { root: '…' } } })` or per instance). Volt, PrimeTek's copy-into-your-codebase Tailwind library, exists for Vue only; the docs suggest Volt-Vue as a styling reference for Angular.

Sources:

- `primeng-21.1.9:apps/showcase/doc/theming/unstyled/architecture-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/theming/unstyled/setup-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/theming/unstyled/global-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/theming/unstyled/example-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/theming/unstyled/voltui-doc.ts`
- `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`

## 9. Pass-through (`pt` / `ptOptions`)

Pass-through exposes a component's internal DOM sections so callers can attach classes, attributes, ARIA and listeners without new component API. Every component accepts `pt`, an object keyed by section name. A value may be a string (treated as a class), an attribute object, or a function receiving `PassThroughContext` and returning either.

### Types (`primeng/api`, `api/passthrough.ts`)

```ts
interface PassThroughOptions {
  mergeProps?: boolean | ((global, self, datasets?) => unknown); // default false
  mergeSections?: boolean; // default true
}
interface PassThroughContext<I = unknown, PI = unknown> {
  instance: I;
  parent: { instance: PI };
  global?: Record<PropertyKey, unknown>;
}
interface CommonPassThrough {
  hooks?: LifecycleHooks;
}
type PassThroughOption<E = HTMLElement, I = unknown, PI = unknown> =
  | PassThroughAttributes<E>
  | ((options: PassThroughContext<I, PI>) => PassThroughAttributes<E> | string)
  | string
  | null
  | undefined;
type PassThrough<I, O> =
  | (O & CommonPassThrough)
  | ((context: PassThroughContext<I>) => O & CommonPassThrough)
  | null
  | undefined;
```

`LifecycleHooks` extends `Partial<Lifecycle>` with `onBeforeInit`, so callbacks can be registered for `onBeforeInit`, `onInit`, `onChanges`, `onDoCheck`, `onAfterContentInit`, `onAfterContentChecked`, `onAfterViewInit`, `onAfterViewChecked` and `onDestroy`. Sources: `primeng-21.1.9:packages/primeng/src/api/passthrough.ts`, `primeng-21.1.9:packages/primeng/src/api/lifecycle.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/lifecycle-doc.ts`.

### Merging

Global `pt` (from `providePrimeNG`, keyed by component name) and instance `pt` are combined section by section. With the defaults (`mergeSections: true`, `mergeProps: false`) sections from both sides are kept and, for a section defined on both, the instance value replaces the global one. `mergeProps: true` merges the attribute objects instead (or a function can merge them), and `mergeSections: false` drops global sections the instance does not define. `ptOptions` may be set globally or per instance. `usePassThrough(pt1, pt2, ptOptions)` from `primeng/passthrough` builds a marked object (`{ _usept, originalValue, value }`) to apply custom merge options to a specific value. Sources: `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`, `primeng-21.1.9:packages/primeng/src/passthrough/passthrough.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/ptoptions-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/global-doc.ts`.

### Section naming and data attributes

- Section keys are camelCase (`root`, `label`, `dropdownIcon`, …). `host` targets the component host element and is applied through the `Bind` host directive.
- Nested Prime components are prefixed `pc` (for example `pcBadge` inside Button) and accept that component's own pass-through type.
- `ptm()` adds `data-pc-section="<flatcase key>"` to every section, and for `root` also `data-pc-name="<flatcase component name>"` and the instance attribute selector.

Sources: `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`, `primeng-21.1.9:packages/primeng/src/types/button/button.types.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/pcprefix-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/instance-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/passthrough/introduction-doc.ts`.

## 10. The `api` entry point

`primeng/api` gathers services, models and constants shared across components.

### Services

| Service               | Scope                              | Members                                                                                                                                                        |
| --------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FilterService`       | `providedIn: 'root'`               | `filter(value: any[], fields: any[], filterValue: any, filterMatchMode: string, filterLocale?: string)`, `filters` map, `register(rule: string, fn: Function)` |
| `OverlayService`      | `providedIn: 'root'`               | `clickObservable`, `parentDragObservable`, `add(event)`, `emitParentDrag(container)`                                                                           |
| `MessageService`      | `@Injectable()` — must be provided | `messageObserver`, `clearObserver`, `add(message: ToastMessageOptions)`, `addAll(messages)`, `clear(key?)`                                                     |
| `ConfirmationService` | `@Injectable()` — must be provided | `requireConfirmation$`, `accept`, `confirm(confirmation: Confirmation)` (returns `this`), `close()`, `onAccept()`                                              |
| `ContextMenuService`  | `@Injectable()` — must be provided | `activeItemKeyChange$`, `activeItemKey`, `changeKey(key)`, `reset()`                                                                                           |
| `TreeDragDropService` | `@Injectable()` — must be provided | `dragStart$`, `dragStop$`, `startDrag(event: TreeNodeDragEvent)`, `stopDrag(event)`                                                                            |

`FilterService.filters` implements `startsWith`, `contains`, `notContains`, `endsWith`, `equals`, `notEquals`, `in`, `between`, `lt`, `lte`, `gt`, `gte`, `is`, `isNot`, `before`, `after`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`. Text rules strip accents and lower-case with the given locale; an empty filter value matches everything. Custom rules are added with `register`.

Sources: `primeng-21.1.9:packages/primeng/src/api/filterservice.ts`, `primeng-21.1.9:packages/primeng/src/api/overlayservice.ts`, `primeng-21.1.9:packages/primeng/src/api/messageservice.ts`, `primeng-21.1.9:packages/primeng/src/api/confirmationservice.ts`, `primeng-21.1.9:packages/primeng/src/api/contextmenuservice.ts`, `primeng-21.1.9:packages/primeng/src/api/treedragdropservice.ts`, `primeng-21.1.9:apps/showcase/doc/filterservice/customconstraints-doc.ts`.

### Constants

- `FilterMatchMode` — `STARTS_WITH 'startsWith'`, `CONTAINS`, `NOT_CONTAINS`, `ENDS_WITH`, `EQUALS`, `NOT_EQUALS`, `IN 'in'`, `LESS_THAN 'lt'`, `LESS_THAN_OR_EQUAL_TO 'lte'`, `GREATER_THAN 'gt'`, `GREATER_THAN_OR_EQUAL_TO 'gte'`, `BETWEEN 'between'`, `IS 'is'`, `IS_NOT 'isNot'`, `BEFORE 'before'`, `AFTER 'after'`, `DATE_IS 'dateIs'`, `DATE_IS_NOT`, `DATE_BEFORE`, `DATE_AFTER`.
- `FilterOperator` — `AND 'and'`, `OR 'or'`.
- `ConfirmEventType` enum — `ACCEPT`, `REJECT`, `CANCEL`.
- `TranslationKeys` — key-name constants for `Translation`.
- `PrimeIcons` — 311 `static readonly` constants mapping to PrimeIcons classes, for example `ADDRESS_BOOK = 'pi pi-address-book'`.

Sources: `primeng-21.1.9:packages/primeng/src/api/filtermatchmode.ts`, `primeng-21.1.9:packages/primeng/src/api/filteroperator.ts`, `primeng-21.1.9:packages/primeng/src/api/confirmaeventtype.ts`, `primeng-21.1.9:packages/primeng/src/api/translationkeys.ts`, `primeng-21.1.9:packages/primeng/src/api/primeicons.ts`.

### Models

| Interface                        | Fields (all optional unless noted)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MenuItem`                       | `label`, `icon`, `command(event: MenuItemCommandEvent)`, `url`, `items`, `expanded`, `disabled`, `visible`, `target`, `escape`, `routerLinkActiveOptions`, `separator`, `badge`, `tooltip`, `tooltipPosition`, `badgeStyleClass`, `style`, `styleClass`, `title`, `id`, `automationId`, `tabindex`, `routerLink`, `queryParams`, `fragment`, `queryParamsHandling`, `preserveFragment`, `skipLocationChange`, `replaceUrl`, `iconStyle`, `iconClass`, `labelStyle`, `labelClass`, `linkStyle`, `linkClass`, `state`, `tooltipOptions`, `[key: string]: any` |
| `MenuItemCommandEvent`           | `originalEvent`, `item`, `index`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `MegaMenuItem`                   | like `MenuItem` but `items?: MenuItem[][]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `SelectItem<T>`                  | `label`, `value: T` (required), `styleClass`, `icon`, `title`, `disabled`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `SelectItemGroup<T>`             | `label: string` (required), `value`, `items: SelectItem<T>[]` (required)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `TreeNode<T>`                    | `label`, `data`, `icon`, `expandedIcon`, `collapsedIcon`, `children`, `leaf`, `expanded`, `type`, `parent`, `partialSelected`, `checked`, `style`, `styleClass`, `draggable`, `droppable`, `selectable`, `key`, `loading`                                                                                                                                                                                                                                                                                                                                   |
| `TreeTableNode<T>`               | extends `TreeNode` with `originalEvent`, `rowNode`, `node`, `type`, `index`, `level`, `visible`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `TreeNodeDragEvent`              | `tree`, `node`, `subNodes`, `index`, `scope`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ToastMessageOptions`            | `text`, `severity`, `summary`, `detail`, `id`, `key`, `life`, `sticky`, `closable`, `data`, `icon`, `contentStyleClass`, `styleClass`, `closeIcon`                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Confirmation`                   | `message`, `key`, `icon`, `header`, `accept`, `reject`, `acceptLabel`, `rejectLabel`, `acceptIcon`, `rejectIcon`, `acceptVisible`, `rejectVisible`, `blockScroll`, `closeOnEscape`, `dismissableMask`, `defaultFocus`, `acceptButtonStyleClass`, `rejectButtonStyleClass`, `target`, `acceptEvent`, `rejectEvent`, `acceptButtonProps`, `rejectButtonProps`, `closeButtonProps`, `closable`, `position`, `modal`                                                                                                                                            |
| `FilterMetadata`                 | `value`, `matchMode`, `operator`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `LazyLoadEvent` / `LazyLoadMeta` | `first`, `last`, `rows`, `sortField`, `sortOrder`, `multiSortMeta`, `filters`, `globalFilter`, `forceUpdate` (`LazyLoadMeta` uses nullable types and `sortField: string \| string[]`)                                                                                                                                                                                                                                                                                                                                                                       |
| `SortEvent` / `SortMeta`         | `data`, `mode`, `field`, `order`, `multiSortMeta` / `field: string`, `order: number`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `TableState`                     | `first`, `rows`, `sortField`, `sortOrder`, `multiSortMeta`, `filters`, `columnWidths`, `tableWidth`, `wrapperWidth`, `selection`, `columnOrder`, `expandedRowKeys`                                                                                                                                                                                                                                                                                                                                                                                          |
| `OverlayOptions`                 | `mode` (`'modal' \| 'overlay'`), `style`, `styleClass`, `contentStyle`, `contentStyleClass`, `target`, `appendTo`, `autoZIndex`, `baseZIndex`, `showTransitionOptions` / `hideTransitionOptions` (deprecated since v21.0.0 in favour of `motionOptions`), `motionOptions: MotionOptions`, `hideOnEscape`, `listener`, `responsive: ResponsiveOverlayOptions`, `onBeforeShow`, `onShow`, `onBeforeHide`, `onHide`, `onAnimationStart`, `onAnimationDone`                                                                                                     |
| `ScrollerOptions`                | `id`, `style`, `styleClass`, `contentStyle`, `contentStyleClass`, `tabindex`, `items`, `itemSize`, `scrollHeight`, `scrollWidth`, `orientation` (`'vertical' \| 'horizontal' \| 'both'`), `step`, `delay`, `resizeDelay`, `appendOnly`, `inline`, `lazy`, `disabled`, `loaderDisabled`, `columns`, `showSpacer`, `showLoader`, `numToleratedItems`, `loading`, `autoSize`, `trackBy`, `onLazyLoad`, `onScroll`, `onScrollIndexChange`                                                                                                                       |
| `TooltipOptions`                 | `tooltipLabel`, `tooltipPosition` (`'right' \| 'left' \| 'top' \| 'bottom'`), `tooltipEvent` (`'hover' \| 'focus' \| 'both'`), `appendTo`, `positionStyle`, `tooltipStyleClass`, `tooltipZIndex`, `escape`, `disabled`, `positionTop`, `positionLeft`, `showDelay`, `hideDelay`, `life`, `id`                                                                                                                                                                                                                                                               |
| `BlockableUI`                    | `getBlockableElement(): HTMLElement`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

`api/shared.ts` also exports `PrimeTemplate` (`[pTemplate]`, standalone, inputs `type` and `pTemplate` → `name`, method `getType()`), the non-standalone `Header` (`p-header`) and `Footer` (`p-footer`) content markers, and `SharedModule`, which exports all three.

Sources: every file listed in `primeng-21.1.9:packages/primeng/src/api/public_api.ts`, in particular `primeng-21.1.9:packages/primeng/src/api/menuitem.ts`, `primeng-21.1.9:packages/primeng/src/api/treenode.ts`, `primeng-21.1.9:packages/primeng/src/api/overlayoptions.ts`, `primeng-21.1.9:packages/primeng/src/api/scrolleroptions.ts`, `primeng-21.1.9:packages/primeng/src/api/tooltipoptions.ts`, `primeng-21.1.9:packages/primeng/src/api/confirmation.ts`, `primeng-21.1.9:packages/primeng/src/api/toastmessage.ts`, `primeng-21.1.9:packages/primeng/src/api/shared.ts`.

## 11. Utilities: `utils`, `dom`, `ts-helpers`

Modern component code imports helpers from `@primeuix/utils` (110 source files do so — `cn`, `uuid`, `isNotEmpty`, `equals`, `resolveFieldData`, `minifyCSS`, …). The PrimeNG-local helper entry points remain as legacy, still used by about two dozen components (drawer, confirmpopup, tooltip, password, autofocus, menubar, scrolltop, galleria, datepicker, toast, contextmenu, image, dialog, dragdrop, popover, blockui, treetable, table, menu, colorpicker, megamenu, tieredmenu, multiselect, overlay). None of them carries an `@deprecated` tag.

- **`primeng/utils`** exports `ZIndexUtils`, `UniqueComponentId`, `ObjectUtils`, `transformToNumber`, `transformToBoolean`.
  - `ZIndexUtils` is a singleton with `get(el)`, `set(key, el, baseZIndex)`, `clear(el)`, `getCurrent()`, `generateZIndex(key, baseZIndex)`, `revertZIndex(zIndex)`. Each new layer gets the previous top value plus 2, plus `baseZIndex` when its key differs from the top layer's key.
  - `UniqueComponentId(prefix = 'pn_id_')` returns an incrementing id.
  - `transformToBoolean(value)` is `!!value`; `transformToNumber(value)` parses strings with `parseFloat`.
  - `ObjectUtils` has static helpers: `isArray`, `isObject`, `equals`, `equalsByValue`, `resolveFieldData`, `isFunction`, `reorderArray`, `insertIntoOrderedArray`, `findIndexInList`, `contains`, `removeAccents`, `isDate`, `isEmpty`, `isNotEmpty`, `compare`, `sort`, `merge`, `isPrintableCharacter`, `getItemValue`, `findLastIndex`, `findLast`, `deepEquals`, `minifyCSS`, `toFlatCase`, `isString`.
- **`primeng/dom`** exports `DomHandler` and `ConnectedOverlayScrollHandler`.
  - `DomHandler` (static, `zindex = 1000`) covers classes (`addClass`, `removeClass`, `hasClass`, …), queries (`find`, `findSingle`, `siblings`, `index`, `getParents`, `getScrollableParents`), overlay positioning (`appendOverlay`, `alignOverlay`, `relativePosition`, `absolutePosition`), measurement (`getOuterWidth`, `getOuterHeight`, `getViewport`, `getOffset`, `getHiddenElementDimensions`, `calculateScrollbarWidth`, …), focus (`focus`, `getFocusableElements`, `getFirstFocusableElement`, `getLastFocusableElement`, `getNextFocusableElement`, `isFocusableElement`), environment (`isIOS`, `isAndroid`, `isTouchDevice`, `getBrowser`, `isClient`), scroll locking (`blockBodyScroll`, `unblockBodyScroll`) and element creation/attributes.
  - `ConnectedOverlayScrollHandler(element, listener)` attaches `listener` to the `scroll` event of every scrollable ancestor (`bindScrollListener`, `unbindScrollListener`, `destroy`).
- **`primeng/ts-helpers`** exports `Booleanish = boolean | 'true' | 'false'`, `Numberish = number | string`, `Nullable<T = void> = T | null | undefined`, `VoidListener = VoidFunction | null | undefined`.

Sources: `primeng-21.1.9:packages/primeng/src/utils/public_api.ts`, `primeng-21.1.9:packages/primeng/src/utils/zindexutils.ts`, `primeng-21.1.9:packages/primeng/src/utils/uniquecomponentid.ts`, `primeng-21.1.9:packages/primeng/src/utils/inpututils.ts`, `primeng-21.1.9:packages/primeng/src/utils/objectutils.ts`, `primeng-21.1.9:packages/primeng/src/dom/domhandler.ts`, `primeng-21.1.9:packages/primeng/src/dom/connectedoverlayscrollhandler.ts`, `primeng-21.1.9:packages/primeng/src/ts-helpers/ts-helpers.ts`.

## 12. Helper directives

| Directive    | Selector        | Entry point          | Behaviour                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------ | --------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Bind`       | `[pBind]`       | `primeng/bind`       | Input `pBind: { [key: string]: any }`. Applies an attribute object to its element: `class` via `cn`, `style` via host binding, `on*` functions as event listeners, `null`/`undefined` removes the attribute, other keys set both attribute and (when present) DOM property. `setAttrs(attrs)` lets a component push attributes when `Bind` is used as a host directive. Module `BindModule`. |
| `ClassNames` | `[pClass]`      | `primeng/classnames` | Input `pClass: PClassValue` (string, number, boolean, nullish, or `{ [key]: boolean }` map), resolved with `cn` onto the host `class`. Module `ClassNamesModule`.                                                                                                                                                                                                                            |
| `AutoFocus`  | `[pAutoFocus]`  | `primeng/autofocus`  | Extends `BaseComponent`. Input `pAutoFocus: boolean = false`. Mirrors the `autofocus` attribute and, in the browser, focuses the first focusable descendant (or the host) once. Module `AutoFocusModule`.                                                                                                                                                                                    |
| `StyleClass` | `[pStyleClass]` | `primeng/styleclass` | Toggles classes or enter/leave animation classes on a target chosen by selector or by the keywords `@next`, `@prev`, `@parent`, `@grandparent`. Inputs: `enterFromClass`, `enterActiveClass`, `enterToClass`, `leaveFromClass`, `leaveActiveClass`, `leaveToClass`, `hideOnOutsideClick`, `toggleClass`, `hideOnEscape`, `hideOnResize`, `resizeSelector`. Module `StyleClassModule`.        |

`Bind` is the backbone of pass-through: components bind `[pBind]="ptm('<section>')"` on internal elements and add `Bind` as a host directive for the `host` section. Other directive entry points (`ripple`, `focustrap`, `keyfilter`, `animateonscroll`, `tooltip`, `dragdrop`) are component-like and belong to component records.

Sources: `primeng-21.1.9:packages/primeng/src/bind/bind.ts`, `primeng-21.1.9:packages/primeng/src/classnames/classnames.ts`, `primeng-21.1.9:packages/primeng/src/autofocus/autofocus.ts`, `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`, `primeng-21.1.9:apps/showcase/doc/bind/examples-doc.ts`, `primeng-21.1.9:apps/showcase/doc/classnames/examples-doc.ts`, `primeng-21.1.9:apps/showcase/doc/styleclass/toggleclass-doc.ts`.

## 13. Animations and `@primeuix/motion`

Version 21 drops `@angular/animations`. Enter/leave animation is CSS-class based:

- **`primeng/motion`** wraps `createMotion` from `@primeuix/motion`.
  - `MotionDirective` (`[pMotion]`, extends `BaseComponent`) has aliased inputs `pMotion` (visible), `pMotionName`, `pMotionType` (`'transition' | 'animation'`), `pMotionSafe`, `pMotionDisabled`, `pMotionAppear` (default `false`), `pMotionEnter` / `pMotionLeave` (default `true`), `pMotionDuration`, `pMotionHideStrategy` (`'display' | 'visibility'`, default `'display'`), explicit class inputs (`pMotionEnterFromClass` … `pMotionLeaveToClass`) and `pMotionOptions`; outputs `pMotionOnBeforeEnter`, `pMotionOnEnter`, `pMotionOnAfterEnter`, `pMotionOnEnterCancelled`, `pMotionOnBeforeLeave`, `pMotionOnLeave`, `pMotionOnAfterLeave`, `pMotionOnLeaveCancelled`.
  - `Motion` (`p-motion`) is the component form with the same inputs unaliased, plus `mountOnEnter = true` and `unmountOnLeave = true`; its pass-through sections are `host` and `root`.
  - Classes follow `<name>-enter`, `<name>-enter-active`, `<name>-enter-to`, `<name>-leave`, `<name>-leave-active`, `<name>-leave-to`.
- Components using `pMotion`/`p-motion` include accordion, colorpicker, confirmpopup, contextmenu, datepicker, dialog, drawer, fieldset, galleria, image, menu, message, overlay, panel, panelmenu, popover, scrolltop, stepper, table, tieredmenu and toast. Tree, message, speeddial, treetable and table also use Angular's native `animate.enter`/`animate.leave`.
- Overlay-type inputs `showTransitionOptions`/`hideTransitionOptions` are deprecated since v21.0.0 in favour of `motionOptions: MotionOptions`.

The animation guide names the shared class families: `.p-collapsible-enter-active`/`-leave-active` (accordion, panel, fieldset, stepper, panelmenu), `.p-anchored-overlay-*` (select-like popups, popover, menus), `.p-dialog-*`, `.p-drawer-*`, `.p-galleria-*`, `.p-image-original-*`, `.p-message-*` and `.p-overlay-mask-*`. Animations can be customised by overriding these classes globally or per component, and reduced via `prefers-reduced-motion` by setting `animation-duration: 0s`.

Sources:

- `primeng-21.1.9:packages/primeng/src/motion/motion.component.ts`
- `primeng-21.1.9:packages/primeng/src/motion/motion.directive.ts`
- `primeng-21.1.9:packages/primeng/src/motion/motion.module.ts`
- `primeng-21.1.9:packages/primeng/src/motion/motion.utils.ts`
- `primeng-21.1.9:packages/primeng/src/motion/style/motion.style.ts`
- `primeng-21.1.9:packages/primeng/src/types/motion/motion.types.ts`
- `primeng-21.1.9:packages/primeng/src/api/overlayoptions.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/animations/introduction-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/animations/reference-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/animations/disable-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/animations/collapsibles-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/animations/anchoredoverlays-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/guides/animations/dialog-doc.ts`

## 14. Icons

### Built-in SVG icons (`primeng/icons`)

Components render their own icons with SVG components, not with an icon font. `BaseIcon` (extends `BaseComponent`, `OnPush`, `ViewEncapsulation.None`) sets host attributes `width="14"`, `height="14"`, `viewBox="0 0 14 14"`, `fill="none"` and the SVG namespace, and computes `class` as `p-icon` plus `p-icon-spin` when `spin` (a `booleanAttribute` input) is true. `BaseIconStyle` (`name: 'baseicon'`) provides `.p-icon` (inline-block, baseline, no shrink) and a 2-second linear infinite `p-icon-spin` rotation. Each icon is a standalone component whose selector is an attribute on an `<svg>` element, for example `CheckIcon` with selector `[data-p-icon="check"]`, used as `<svg data-p-icon="check">`.

The 54 icons are: AngleDoubleDown, AngleDoubleLeft, AngleDoubleRight, AngleDoubleUp, AngleDown, AngleLeft, AngleRight, AngleUp, ArrowDown, ArrowDownLeft, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp, Ban, Bars, Blank, Calendar, CaretLeft, CaretRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ExclamationTriangle, Eye, EyeSlash, Filter, FilterFill, FilterSlash, Home, InfoCircle, Minus, Pencil, Plus, Refresh, Search, SearchMinus, SearchPlus, SortAlt, SortAmountDown, SortAmountUpAlt, Spinner, Star, StarFill, ThLarge, Times, TimesCircle, Trash, Undo, Upload, WindowMaximize, WindowMinimize (folder names are lower case, for example `primeng/icons/angledoubledown`).

Sources: `primeng-21.1.9:packages/primeng/src/icons/baseicon/baseicon.ts`, `primeng-21.1.9:packages/primeng/src/icons/baseicon/style/baseiconstyle.ts`, `primeng-21.1.9:packages/primeng/src/icons/check/check.ts`, `primeng-21.1.9:packages/primeng/src/icons/public_api.ts`.

### PrimeIcons font (optional)

PrimeIcons is a separate npm package (`npm install primeicons`) whose CSS (`primeicons/primeicons.css`) the app imports into its global styles. Icons use the `pi pi-<name>` classes; size follows `font-size`, colour follows `color`, and `pi-spin` rotates. The `PrimeIcons` constants in `primeng/api` give typed access to the class names (for example in `MenuItem.icon`). Component inputs that accept an icon (such as `icon` on Button) take a class string, so any font library works.

### Custom icons

Built-in icons can be replaced through component templates such as `<ng-template #dropdownicon>` on Select, with inline SVG, Font Awesome, Material Icons or an image as the content.

Sources: `primeng-21.1.9:apps/showcase/doc/icons/download-doc.ts`, `primeng-21.1.9:apps/showcase/doc/icons/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/icons/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/icons/size-doc.ts`, `primeng-21.1.9:apps/showcase/doc/icons/color-doc.ts`, `primeng-21.1.9:apps/showcase/doc/icons/spin-doc.ts`, `primeng-21.1.9:apps/showcase/doc/icons/constants-doc.ts`, `primeng-21.1.9:apps/showcase/doc/customicons/svg-doc.ts`, `primeng-21.1.9:apps/showcase/doc/customicons/fontawesome-doc.ts`, `primeng-21.1.9:apps/showcase/doc/customicons/material-doc.ts`, `primeng-21.1.9:apps/showcase/doc/customicons/image-doc.ts`.

## 15. Guides

### Accessibility

The accessibility guide is general background rather than a PrimeNG API: it outlines disability categories and assistive technology, WCAG and legal frameworks (Section 508, the EU Web Accessibility Directive), the preference for native form controls and semantic HTML over styled `div`s, how WAI-ARIA roles and states fill the gaps for custom widgets, and a minimum colour contrast of 4.5:1. It states that PrimeNG aims for high WCAG compliance. Per-component keyboard and screen-reader behaviour is documented in each component's accessibility section (component records).

Sources: `primeng-21.1.9:apps/showcase/doc/guides/accessibility/introduction-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/accessibility/wcag-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/accessibility/formcontrols-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/accessibility/semantichtml-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/accessibility/waiaria-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/accessibility/colors-doc.ts`.

### RTL

RTL needs no configuration: styles rely on flexbox and logical properties, so setting `dir="rtl"` on `<html>` (or `direction: rtl` in CSS) is enough. Galleria and Carousel are the documented exceptions without RTL support.

Sources: `primeng-21.1.9:apps/showcase/doc/guides/rtl/configuration-doc.ts`, `primeng-21.1.9:apps/showcase/doc/guides/rtl/limitations-doc.ts`.

### Animations, CSS layers, Tailwind, pass-through

Covered in [§13](#13-animations-and-primeuixmotion), [§7](#7-theming-with-primeuixthemes-and-primeuixstyled) and [§9](#9-pass-through-pt--ptoptions).

## 16. LLM and AI tooling

- **llms.txt / llms-full.txt / Markdown pages:** the documentation site publishes an `llms.txt` index of key pages, an `llms-full.txt` listing every page, and a Markdown rendering of any page when `.md` is appended to its URL. The generated files themselves are not in the archive. Sources: `primeng-21.1.9:apps/showcase/doc/llms/llmstxt-doc.ts`, `primeng-21.1.9:apps/showcase/doc/llms/llmsfulltxt-doc.ts`, `primeng-21.1.9:apps/showcase/doc/llms/markdownextension-doc.ts`.
- **MCP server (summary only):** `@primeng/mcp` is an ESM package with a `primeng-mcp` binary that calls `runPrimeMcpServer` from `@primeuix/mcp` with bundled component data (`packages/mcp/data/components.json`) and hard-coded Angular migration notes. It is registered in clients with `npx -y @primeng/mcp` (setup pages exist for Claude Code, Cursor, VS Code, Windsurf, Zed and OpenAI Codex). It exposes tools for component lookup (`list_components`, `get_component`, `search_components`, `get_component_props`, `get_component_events`, `get_component_methods`, `get_component_slots`, `compare_components`), examples (`get_usage_example`, `list_examples`, `get_example`, `generate_component_template`), styling (`get_component_pt`, `get_component_tokens`, `get_component_styles`, `get_theming_guide`, `get_passthrough_guide`, `get_tailwind_guide`), guides (`list_guides`, `get_guide`, `get_configuration`, `get_installation`, `get_accessibility_guide`, `get_accessibility_info`, `get_migration_guide`) and discovery (`search_all`, `suggest_component`, `find_by_prop`, `find_by_event`, `find_components_with_feature`, `get_related_components`). Sources: `primeng-21.1.9:packages/mcp/package.json`, `primeng-21.1.9:packages/mcp/src/index.ts`, `primeng-21.1.9:apps/showcase/doc/mcp/introduction-doc.ts`, `primeng-21.1.9:apps/showcase/doc/mcp/tools-doc.ts`, `primeng-21.1.9:apps/showcase/doc/mcp/claudecode-doc.ts`.

## 17. Notes for component records

Patterns Wave 2 authors will meet in nearly every PrimeNG component folder:

1. **Files per component.** `packages/primeng/src/<name>/` holds `<name>.ts` (components, directives and the `NgModule`), `style/<name>style.ts`, `public_api.ts` and `ng-package.json`. Public types live separately in `packages/primeng/src/types/<name>/<name>.types.ts`, and `public_api.ts` re-exports them "for backward compatibility" (`export * from 'primeng/types/<name>'`), so `primeng/<name>` and `primeng/types/<name>` both expose the types. Composite components may have several style files (for example `stepper/style/stepstyle.ts`, `tabs/style/tabliststyle.ts`). Sources: `primeng-21.1.9:packages/primeng/src/button/public_api.ts`, `primeng-21.1.9:packages/primeng/src/select/public_api.ts`.
2. **Style service shape.** A style file imports the shared structural CSS (`import { style } from '@primeuix/styles/<name>'`), may append PrimeNG-only rules using `dt('<token.path>')` (Select adds `ng-invalid.ng-dirty` rules), defines a `classes` map (section key → string or `({ instance }) => [...]`) and optionally `inlineStyles`, and declares `@Injectable() class <Name>Style extends BaseStyle { name = '<name>'; style; classes }` plus an exported `<Name>Classes` enum with the root class names. The `name` must match the `@primeuix/themes` component key so that `<name>-variables` and `<name>-style` resolve. About 20 style files (for example chart, fluid, inputicon, overlaybadge, scroller, treetable and the stepper/tabs sub-parts) do not import from `@primeuix/styles`. Sources: `primeng-21.1.9:packages/primeng/src/button/style/buttonstyle.ts`, `primeng-21.1.9:packages/primeng/src/select/style/selectstyle.ts`.
3. **Component class shape.** `extends BaseComponent<XPassThrough>` (or a form base class); `componentName = '<Name>'`; `_componentStyle = inject(<Name>Style)`; providers include the style service and `{ provide: PARENT_INSTANCE, useExisting: <Name> }` (form controls also `NG_VALUE_ACCESSOR`); `hostDirectives: [Bind]` with `bindDirectiveInstance.setAttrs(this.ptm('host'))` in `onAfterViewChecked`. Templates bind `[class]="cx('<section>')"` and `[pBind]="ptm('<section>')"` on each section. Source: `primeng-21.1.9:packages/primeng/src/button/button.ts`.
4. **Pass-through types.** `types/<name>/<name>.types.ts` declares `<Name>PassThroughOptions<I = unknown>` (one `PassThroughOption<HTMLElement…, I>` per section, `host` first, nested components as `pc<Component>` typed with that component's `PassThrough`) and `type <Name>PassThrough<I = unknown> = PassThrough<I, <Name>PassThroughOptions<I>>`, alongside template contexts (`<Name><Template>TemplateContext`), a `<Name>Templates` interface, event interfaces and union types such as `ButtonSeverity`. The section keys used with `cx()`, `ptm()` and the PT type should match; record them from the types file. Sources: `primeng-21.1.9:packages/primeng/src/types/button/button.types.ts`, `primeng-21.1.9:packages/primeng/src/types/select/select.types.ts`.
5. **Inputs are mixed.** Decorator `@Input()` and signal `input()` coexist, sometimes in one class; record which is which because `input()` values are read as functions (`instance.invalid()` in style maps). Common shared inputs (`dt`, `unstyled`, `pt`, `ptOptions`) come from `BaseComponent`; form inputs (`required`, `invalid`, `disabled`, `name`, `fluid`, `variant`, `size`, …) from the form base classes.
6. **Recurring deprecations.** 54 `styleClass` inputs are `@deprecated since v20.0.0, use class instead`; about 40 `showTransitionOptions`/`hideTransitionOptions` inputs are deprecated since v21.0.0 in favour of `motionOptions`; directive-level `pt*` inputs (for example `ptButtonLabel`) are deprecated in favour of `p<Directive>PT` inputs. Also seen: `inputStyle` (use `inputVariant`), `size` → `badgeSize`, `virtualScrollItemSize`, and Message content via projection. Grep `@deprecated` in each component file.
7. **Directive variants.** Several components also ship an attribute directive (for example `pButton`, `pInputText`, `pTooltip`) with `p<Name>PT` and `p<Name>Unstyled` inputs that feed `directivePT`/`directiveUnstyled` on `BaseComponent`.
8. **Data attributes.** Besides `data-pc-name`/`data-pc-section`, templates expose state as `data-p-*` attributes (for example `data-p-disabled`, `data-p-severity`, and a `data-p` attribute built with `cn` from modifiers such as `loading`, `fluid`, `rounded`), useful for styling unstyled components. Source: `primeng-21.1.9:packages/primeng/src/button/button.ts`.
9. **Templates.** Record both the `#name` template-reference form and the `pTemplate="name"` form, and their context types.
10. **Icons.** Default icons are `primeng/icons` SVG components (`<svg data-p-icon="…">`); overridable via `*icon` templates; `icon` inputs accept PrimeIcons-style class strings.
11. **Animations.** Note whether a component uses `pMotion`/`p-motion`, native `animate.enter`/`animate.leave`, which shared animation class family it belongs to, and whether it exposes `motionOptions`.
12. **Services.** Toast needs `MessageService` and ConfirmDialog/ConfirmPopup need `ConfirmationService` provided by the application (they are not root-provided). Table filtering relies on the root `FilterService`; overlays use `OverlayService` and the `zIndex`/`overlayAppendTo`/`overlayOptions` config.
13. **Docs vs source.** Showcase docs lag the source in places (`PrimeNGConfig`, `provideAnimationsAsync`, the `unstyled` JSDoc). Prefer source code and `apps/showcase/doc/apidoc/index.json` for API facts; cite the showcase for usage guidance.
14. **Theme tokens.** Component tokens live in `@primeuix/themes` (cite the `@primeuix/themes-2.0.3` archive), not in this archive; `packages/themes` here only re-exports them.

## Gaps

- The `@primeuix/styled`, `@primeuix/styles`, `@primeuix/themes`, `@primeuix/utils` and `@primeuix/motion` internals (`Theme`, `ThemeService`, `definePreset`, `createMotion`, preset token trees) are outside this archive; they are covered by the `@primeuix/*` foundation notes.
- `apps/showcase/doc/theming/styled/*` palette, surface, noir and Bootstrap/forms examples are summarised only at the level of the API they demonstrate.
- No per-component accessibility or animation class mapping is recorded here beyond the shared class families; component records own those details.
