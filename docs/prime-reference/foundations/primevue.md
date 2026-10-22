# PrimeVue 4.5.5 — Foundations

Hand-written foundation notes for the PrimeVue baseline pinned at version 4.5.5 (archive commit `66dde6788220fc9e6822342919d1ceb0e3460ece`). This file records what PrimeVue ships; it is an upstream reference, not a description of Ultimate. All citations use the prefix `primevue-4.5.5:` followed by a path relative to the archive root.

Contents:

1. [Repository and package map](#1-repository-and-package-map)
2. [Installation](#2-installation)
3. [PrimeVue plugin and configuration options](#3-primevue-plugin-and-configuration-options)
4. [Nuxt module](#4-nuxt-module)
5. [Auto-import resolver](#5-auto-import-resolver)
6. [Architecture: base component, base style, style loading](#6-architecture-base-component-base-style-style-loading)
7. [Pass-through](#7-pass-through)
8. [Styled mode and theming integration](#8-styled-mode-and-theming-integration)
9. [Unstyled mode](#9-unstyled-mode)
10. [Helpers: utils, api module, FilterService](#10-helpers-utils-api-module-filterservice)
11. [Directives](#11-directives)
12. [Services and composables](#12-services-and-composables)
13. [Forms library (@primevue/forms)](#13-forms-library-primevueforms)
14. [Icons](#14-icons)
15. [Guides](#15-guides)
16. [Deprecated components and replacements](#16-deprecated-components-and-replacements)
17. [Peer and runtime dependencies](#17-peer-and-runtime-dependencies)
18. [Notes for component records](#18-notes-for-component-records)

---

## 1. Repository and package map

The archive is a pnpm monorepo named `@primevue/monorepo` at version 4.5.5. Shared dependency versions are pinned through the workspace catalog. The `build:packages` script builds packages in this order: metadata, auto-import resolver, core, primevue (lib), nuxt module, themes, icons, mcp, forms, then the apps.

| Package                          | Folder                          | Role                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@primevue/core`                 | `packages/core`                 | Framework kernel: config plugin, `BaseComponent`, `BaseDirective`, `BaseStyle`, `BaseEditableHolder`, `BaseInput`, the `api` module (filters, icons constants, toast severity), `useStyle`, `useId`, utils. |
| `primevue`                       | `packages/primevue`             | The component library: one folder per component, directive, service, composable and event bus, plus `config`, `passthrough`, `usestyle`, `utils` and a `umd` bundle entry.                                  |
| `@primevue/forms`                | `packages/forms`                | `Form`, `FormField`, `useForm` and schema resolvers (wrapping `@primeuix/forms`).                                                                                                                           |
| `@primevue/icons`                | `packages/icons`                | SVG icon components used internally by components, built on `BaseIcon`.                                                                                                                                     |
| `@primevue/themes`               | `packages/themes`               | Legacy re-export layer over `@primeuix/styled` and `@primeuix/themes` presets (Aura, Lara, Material, Nora) and token types.                                                                                 |
| `@primevue/nuxt-module`          | `packages/nuxt-module`          | Nuxt 3 module: plugin install, auto-import registration, SSR style injection.                                                                                                                               |
| `@primevue/auto-import-resolver` | `packages/auto-import-resolver` | Resolver for `unplugin-vue-components`.                                                                                                                                                                     |
| `@primevue/metadata`             | `packages/metadata`             | Static name/import-path lists for components, directives and composables. Consumed by the resolver and the Nuxt module.                                                                                     |
| `@primevue/mcp`                  | `packages/mcp`                  | MCP server binary (`primevue-mcp`) built on `@primeuix/mcp`.                                                                                                                                                |
| showcase                         | `apps/showcase`                 | Documentation site (Nuxt). Component docs in `apps/showcase/doc/<component>/`, pages in `apps/showcase/pages/<component>/index.vue`, generated API data in `apps/showcase/doc/common/apidoc/index.json`.    |

All published packages declare `engines.node` `>=12.11.0` and publish from a `dist` directory where `"."` and `"./*"` map to `./*/index.mjs` style entry points.

### 1.1 `@primevue/core` exports

Subpath exports: `./api`, `./useid`, `./base/style`, `./base`, `./basecomponent/style`, `./basecomponent`, `./basedirective`, `./baseeditableholder`, `./baseinput`, `./config`, `./service`, `./useattrselector`, `./usestyle`, `./utils`. The root type file also declares shared helper types used by every component typing: `Booleanish`, `Numberish`, `Nullable`, `PassThrough<T>`, `DesignToken<T>`, `DefaultPassThrough<T>`, `HintedString`, `NoInfer`, `DefineComponent` and `EmitFn`.

### 1.2 `primevue` exports

`packages/primevue/package.json` lists 273 export entries: for each folder under `src/` there is a component entry (for example `primevue/button`) and usually a matching `/style` entry (for example `primevue/button/style`). The package marks `*.vue` files as side-effectful, points `unpkg`/`jsdelivr` at `umd/primevue.min.js`, and ships IDE metadata (`web-types.json` for JetBrains and `vetur-tags.json` / `vetur-attributes.json`) generated by `scripts/build-api.js`.

`src/` holds 149 folders. Besides the components they include: `config`, `passthrough`, `usestyle`, `useconfirm`, `usedialog`, `usetoast`, `utils`, `umd`, `portal`, `menuitem`, `treenode`, `confirmationoptions`, `dynamicdialogoptions`, the services (`confirmationservice`, `dialogservice`, `toastservice`, `terminalservice`) and event buses (`confirmationeventbus`, `dynamicdialogeventbus`, `overlayeventbus`, `toasteventbus`). The root `src/index.js` is generated and re-exports utils, the composables and each component together with its style object, so `import { Button } from 'primevue'` works. The UMD entry `src/umd/primevue.js` additionally re-exports `@primevue/core`, `BaseIcon` and `@primeuix/styled`.

Sources:

- `primevue-4.5.5:package.json`
- `primevue-4.5.5:pnpm-workspace.yaml`
- `primevue-4.5.5:packages/core/package.json`
- `primevue-4.5.5:packages/core/src/index.d.ts`
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/umd/primevue.js`
- `primevue-4.5.5:packages/primevue/scripts/build-api.js`

---

## 2. Installation

The showcase lists four installation routes: Vite, Nuxt, CDN and Laravel.

- **Vite (and Laravel, identical steps).** Install `primevue` and `@primeuix/themes` from npm, then register the plugin with `app.use(PrimeVue)` where `PrimeVue` is the default export of `primevue/config`. A theme is passed as `theme: { preset: Aura }` with `Aura` imported from `@primeuix/themes/aura`. Components are imported per path (for example `import Button from 'primevue/button'`) and registered with `app.component`.
- **Nuxt.** Install `primevue` and `@primeuix/themes`, plus `@primevue/nuxt-module` as a dev dependency, then add `'@primevue/nuxt-module'` to `modules` and configure it under the `primevue` key (see [§4](#4-nuxt-module)).
- **CDN.** Load Vue 3 global build, `primevue/umd/primevue.min.js` and a preset UMD file such as `@primeuix/themes/umd/aura.js` from unpkg; install with `app.use(PrimeVue.Config, ...)`. UMD presets exist for Aura, Lara, Nora and Material.
- **Bundle imports.** Components can also be imported from the package root (`import { Button, InputText } from 'primevue'`), except `Editor` and `Chart`, which depend on optional third-party libraries. Icons import from `@primevue/icons`.

`Editor` lazy-loads `quill` (`import('quill')`) unless a global Quill is present, and `Chart` lazy-loads `chart.js/auto`. Neither library is a dependency of `primevue`; the showcase pins `quill` 2.0.0 and `chart.js` 3.3.2 through its catalog.

Sources:

- `primevue-4.5.5:apps/showcase/doc/vite/DownloadDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/vite/PluginDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/vite/ThemeDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/vite/VerifyDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/laravel/DownloadDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/laravel/PluginDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/nuxt/DownloadDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/cdn/ScriptDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/cdn/PluginDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/cdn/ThemingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/dynamicimports/OverviewDoc.vue`
- `primevue-4.5.5:packages/primevue/src/editor/Editor.vue`
- `primevue-4.5.5:packages/primevue/src/chart/Chart.vue`
- `primevue-4.5.5:pnpm-workspace.yaml`

---

## 3. PrimeVue plugin and configuration options

### 3.1 Plugin mechanics

`primevue/config` re-exports the plugin implemented in `@primevue/core/config`. On `install(app, options)` it deep-merges the user options over `defaultOptions` (`mergeKeys`), wraps the result in a Vue `reactive` object, exposes it as `app.config.globalProperties.$primevue` and provides it under an internal symbol. `usePrimeVue()` injects it and throws `PrimeVue is not installed!` when missing. Typical runtime changes go through `usePrimeVue().config` (for example changing `config.locale` or `config.ripple`).

The plugin also sets up watchers that emit events on the internal `PrimeVueService` bus: `config:change`, `config:ripple:change`, `config:theme:change` and `config:unstyled:change`. A theme change calls `Theme.setTheme` from `@primeuix/styled` and reloads the common theme styles unless unstyled mode is active. A `theme:change` event from the theme service writes back into `config.theme`. Setting `theme: 'none'` skips loading theme styles.

### 3.2 Options (`PrimeVueConfiguration`)

| Option                   | Type                             | Default                                                     | Notes                                                                                                                                           |
| ------------------------ | -------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `ripple`                 | `boolean`                        | `false`                                                     | Enables the ripple effect on components that support it.                                                                                        |
| `inputStyle`             | `'filled' \| 'outlined'`         | `null`                                                      | `@deprecated` since v4.0; use `inputVariant`.                                                                                                   |
| `inputVariant`           | `'filled' \| 'outlined'`         | `null` (renders outlined)                                   | Global input variant. A `p-variant-filled` class on an ancestor also works, but the config option is needed for content teleported to the body. |
| `locale`                 | `PrimeVueLocaleOptions`          | English strings                                             | Reactive; see [§3.3](#33-locale).                                                                                                               |
| `filterMatchModeOptions` | `any`                            | see below                                                   | Match modes offered by filter UIs per data type.                                                                                                |
| `zIndex`                 | `PrimeVueZIndexOptions`          | `{ modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 }` | `modal` applies to Dialog/Drawer, `overlay` to Select/Popover-like overlays, `menu` to overlay menus, `tooltip` to Tooltip.                     |
| `theme`                  | `any`                            | `undefined`                                                 | `{ preset, options: { prefix, darkModeSelector, cssLayer } }` or `'none'`; see [§8](#8-styled-mode-and-theming-integration).                    |
| `unstyled`               | `boolean`                        | `false`                                                     | Global unstyled mode; see [§9](#9-unstyled-mode).                                                                                               |
| `pt`                     | `PassThrough<PrimeVuePTOptions>` | `undefined`                                                 | Global pass-through keyed by lower-case component name, plus `directives` and `global`; see [§7](#7-pass-through).                              |
| `ptOptions`              | `PassThroughOptions`             | `{ mergeSections: true, mergeProps: false }`                | Global merge strategy for pass-through.                                                                                                         |
| `csp`                    | `PrimeVueCSPOptions`             | `{ nonce: undefined }`                                      | `nonce` is written onto every generated `<style>` element.                                                                                      |

Default `filterMatchModeOptions`:

- `text`: `STARTS_WITH`, `CONTAINS`, `NOT_CONTAINS`, `ENDS_WITH`, `EQUALS`, `NOT_EQUALS`
- `numeric`: `EQUALS`, `NOT_EQUALS`, `LESS_THAN`, `LESS_THAN_OR_EQUAL_TO`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL_TO`
- `date`: `DATE_IS`, `DATE_IS_NOT`, `DATE_BEFORE`, `DATE_AFTER`

`PrimeVuePTOptions` contains one key per component in lower case (deprecated components such as `accordiontab`, `calendar`, `chips`, `dropdown`, `inputswitch`, `overlaypanel`, `sidebar` and `tabview` are present and marked `@deprecated`), a `directives` object with keys `animate`, `badge`, `focustrap`, `keyfilter`, `ripple`, `styleclass` and `tooltip`, and `global` with `css?: string | ((options) => string)`. The core type file augments Vue's `ComponentCustomProperties` with `$primevue`.

### 3.3 Locale

The default locale object holds English strings for: filter match mode labels (`startsWith` … `dateAfter`), filter UI words (`clear`, `apply`, `matchAll`, `matchAny`, `addRule`, `removeRule`), confirmation words (`accept: 'Yes'`, `reject: 'No'`), FileUpload words (`choose`, `upload`, `cancel`, `completed`, `pending`, `fileSizeTypes`), calendar data (`dayNames`, `dayNamesShort`, `dayNamesMin`, `monthNames`, `monthNamesShort`, `chooseYear` … `nextSecond`, `am`, `pm`, `today`, `weekHeader: 'Wk'`, `firstDayOfWeek: 0`, `showMonthAfterYear: false`, `dateFormat: 'mm/dd/yy'`), Password strength words (`weak`, `medium`, `strong`, `passwordPrompt`), empty/search messages (`emptyFilterMessage`, `searchMessage: '{0} results are available'`, `selectionMessage`, `emptySelectionMessage`, `emptySearchMessage`, `fileChosenMessage`, `noFileChosenMessage`, `emptyMessage`) and an `aria` sub-object of about 49 accessible labels (`trueLabel` through `listLabel`). Translations are not bundled; the docs point to the community PrimeLocale repository.

Sources:

- `primevue-4.5.5:packages/core/src/config/PrimeVue.js`
- `primevue-4.5.5:packages/primevue/src/config/Config.js`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/core/src/index.d.ts`
- `primevue-4.5.5:apps/showcase/doc/configuration/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/ThemeDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/InputVariantDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/RippleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/UnstyledDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/PTDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/PTOptionsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/ZIndexDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/csp/NonceDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/locale/SetLocaleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/configuration/locale/RepositoryDoc.vue`

---

## 4. Nuxt module

`@primevue/nuxt-module` (config key `primevue`, compatible with Nuxt `>=3.0.0`) installs the plugin, registers components/directives/composables for auto-import and injects styles during SSR.

### 4.1 Module options (`ModuleOptions`)

| Option        | Default          | Meaning                                                                                                                                                            |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `usePrimeVue` | `true`           | Install the PrimeVue plugin in the generated Nuxt plugin.                                                                                                          |
| `autoImport`  | `true`           | Use `unplugin-vue-components` with `PrimeVueResolver`; when `false`, items are registered globally instead.                                                        |
| `resolvePath` | `undefined`      | Function to rewrite import paths (`ResolvePathOptions`: `name`, `as`, `from`, `type` one of `config`, `component`, `directive`, `composable`, `service`, `style`). |
| `importPT`    | `undefined`      | `{ as?, from }` — load a pass-through object from a file and pass it as `pt`.                                                                                      |
| `importTheme` | `undefined`      | `{ as?, from }` — load a theme (for example built with `definePreset`) from a file.                                                                                |
| `loadStyles`  | `true`           | Emit style registration for components.                                                                                                                            |
| `options`     | `{}`             | PrimeVue plugin options (`PrimeVueOptions` extends `PrimeVueConfiguration`).                                                                                       |
| `components`  | `{ prefix: '' }` | `ConstructsType`: `prefix`, `name(item)`, `include`, `exclude`. `exclude` defaults to `['Editor', 'Chart']`.                                                       |
| `directives`  | `{ prefix: '' }` | Same shape; a prefix of `p` turns `v-ripple` into `v-pripple`.                                                                                                     |
| `composables` | `{}`             | Same shape without `prefix`.                                                                                                                                       |

`include`/`exclude` accept `'*'`, an array of names or `{ name, use?: { as } }` objects, or a function of the full list; matching is case-insensitive. A commented-out `cssLayerOrder` option is marked for removal.

### 4.2 Behaviour

- The module stores its options and the resolved registration lists in `runtimeConfig.public.primevue` and adds `primevue` (plus `@primevue/themes` and `@primeuix/themes` when a theme is in use) to `build.transpile`.
- Components are registered with `addComponent` (global, default export, optional prefix or name function), composables with `addImports`. Services are derived from component metadata (`ConfirmDialog`/`ConfirmPopup` → `ConfirmationService`, `DynamicDialog` → `DialogService`, `Toast` → `ToastService`) and installed by the generated plugin.
- Style registration always includes `BaseStyle`; unless `options.unstyled` is set it also includes `BaseComponentStyle` and each registered component's or directive's `<Name>Style` from `<path>/style` (the deprecated badge directive is skipped).
- A generated `#primevue-style` template computes SSR stylesheet strings (base, common theme, component themes, layer order) with the CSP nonce, and a Nitro `render:html` hook places them in the document head.
- The client runtime plugin is empty; all work happens in the generated plugin and the server plugin.

Sources:

- `primevue-4.5.5:packages/nuxt-module/src/module.ts`
- `primevue-4.5.5:packages/nuxt-module/src/types.d.ts`
- `primevue-4.5.5:packages/nuxt-module/src/register.ts`
- `primevue-4.5.5:packages/nuxt-module/src/utils.ts`
- `primevue-4.5.5:packages/nuxt-module/src/runtime/plugin.client.ts`
- `primevue-4.5.5:packages/nuxt-module/src/runtime/plugin.server.ts`
- `primevue-4.5.5:apps/showcase/doc/nuxt/configuration/ComponentsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/nuxt/configuration/DirectivesDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/nuxt/configuration/ImportPTDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/nuxt/configuration/ImportThemeDoc.vue`

---

## 5. Auto-import resolver

`PrimeVueResolver(options?: PrimeVueResolverOptions): ComponentResolver[]` returns two `unplugin-vue-components` resolvers, one of type `component` (returns `{ from }`) and one of type `directive` (returns `{ as, from }`). Options: `components.prefix`, `directives.prefix`, and `resolve(meta, type)` to override the result. The resolver strips the prefix and looks the name up case-insensitively in `@primevue/metadata`. Setup per the docs: install `unplugin-vue-components` and `@primevue/auto-import-resolver` as dev dependencies and add `Components({ resolvers: [PrimeVueResolver()] })` to the Vite config.

### 5.1 Metadata (short)

`@primevue/metadata` exports `MetaType` (`name`, `as`, `from`, `use.as`) and a `toMeta` helper that defaults `as` to the name and `from` to `primevue/<lowercased name>`. It lists components by showcase group (form, button, data, panel, overlay, file, menu, chart, messages, media, misc, plus `Form` and `FormField` from `@primevue/forms`), directives (`badge` → `BadgeDirective`, `tooltip`, `ripple`, `styleclass`, `focustrap`, `animateonscroll`, `keyfilter`) and composables (`usePrimeVue` from `primevue/config`, `useStyle`, `useConfirm`, `useToast`, `useDialog`). Deprecated names remain in the lists so they still resolve.

Sources:

- `primevue-4.5.5:packages/auto-import-resolver/index.ts`
- `primevue-4.5.5:packages/metadata/src/index.ts`
- `primevue-4.5.5:apps/showcase/doc/autoimport/UnpluginDoc.vue`

---

## 6. Architecture: base component, base style, style loading

### 6.1 `BaseComponent`

Every component's `Base<Name>.vue` declares `extends: BaseComponent` (from `@primevue/core/basecomponent`). `BaseComponent` contributes:

- **Props:** `pt`, `ptOptions`, `unstyled` (default `undefined`, falls back to config) and `dt` (scoped design tokens).
- **Identity:** an attribute selector from `useAttrSelector()` (prefix `pc`), and `uid` taken from `$attrs.id` or derived from the selector (`pv_id_…`).
- **Parent chain:** injects `$parentInstance`; nested components use `$options.hostName` so their PT and style resolve through the host (for example sub-components of DataTable).
- **PT helpers:** `ptm(key, params)` merges global PT (`config.pt[<component>]`), the instance `pt` prop and `pt:` prefixed attributes; `ptmi(key)` also merges `$attrs` (used on the root with `inheritAttrs: false`); `ptmo(obj, key)` reads from an arbitrary object. Each result carries `data-pc-name` (root only), `data-pc-section="<key>"` and the attribute selector. String or array PT values are treated as `class`.
- **Style helpers:** `cx(key)` returns the class from the component's style `classes` map (nothing when unstyled); `sx(key)` returns inline styles from `inlineStyles`.
- **Params passed to PT functions:** `{ instance, props, state, attrs, parent: { instance, props, state, attrs } }`.
- **Lifecycle hooks:** PT `hooks` (`onBeforeCreate`, `onCreated`, `onBeforeMount`, `onMounted`, `onBeforeUpdate`, `onUpdated`, `onBeforeUnmount`, `onUnmounted`) are called from both the instance PT and the global PT.
- `beforeMount` still writes `$pc` onto the root element; the source marks this for removal in v5.

### 6.2 `BaseStyle` and style loading

`BaseStyle` (`@primevue/core/base/style`, name `base`) holds the shared CSS (`.p-hidden-accessible`, `.p-overflow-hidden` using the `scrollbar.width` token, plus `@primeuix/styles/base`) and helper methods that delegate to `Theme` in `@primeuix/styled`: `load`, `loadCSS`, `loadStyle`, `getCommonTheme`, `getComponentTheme`, `getDirectiveTheme`, `getPresetTheme`, `getLayerOrderThemeCSS`, and SSR string builders `getStyleSheet`, `getCommonThemeStyleSheet`, `getThemeStyleSheet`. `extend(style)` creates a child style object. `BaseComponentStyle` is `BaseStyle.extend({ name: 'common' })`. A loaded-style-name registry (`core/src/base/Base.js`) makes each style load once.

Each component style file (for example `primevue/src/button/style/ButtonStyle.js`) imports its CSS from `@primeuix/styles/<component>` and calls `BaseStyle.extend({ name, style, classes, inlineStyles? })`.

Load order when a component is created:

1. Once per app: `base` CSS and the optional `pt.global.css` (style name `global`).
2. Unless unstyled or `theme: 'none'`: common theme (`primitive-variables`, `semantic-variables`, `global-variables`, `global-style`), then the component's `<name>-variables` and `<name>-style`, then `layer-order` inserted first.
3. Core (non-theme) component CSS via `$style.loadCSS`, re-evaluated when the unstyled flag changes.
4. When `dt` is set: scoped token CSS generated with `getPresetTheme(dt, '[<attrSelector>]')`, removed on unmount.

All styles are injected through `useStyle` as `<style data-primevue-style-id="<name>">` elements and receive `csp.nonce`.

### 6.3 Editable and input bases

- `BaseEditableHolder` (`@primevue/core/baseeditableholder`): props `modelValue`, `defaultValue`, `name`, `invalid`, `disabled`, `formControl`; emits `update:modelValue` and `value-change`; injects `$pcForm` and `$pcFormField`; computes `$filled`, `$invalid`, `$formName`, `$formControl`, `$formNovalidate`, `$formValue`; `writeValue(value, event)` updates both v-model and the form. `filled` is deprecated in favour of `$filled`.
- `BaseInput` (`@primevue/core/baseinput`) extends it with `size`, `fluid` and `variant`. `$variant` falls back to `config.inputStyle` or `config.inputVariant`; `$fluid` falls back to an enclosing `Fluid` component. `hasFluid` is deprecated.

Sources:

- `primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`
- `primevue-4.5.5:packages/core/src/basecomponent/style/BaseComponentStyle.js`
- `primevue-4.5.5:packages/core/src/base/Base.js`
- `primevue-4.5.5:packages/core/src/base/style/BaseStyle.js`
- `primevue-4.5.5:packages/core/src/usestyle/UseStyle.js`
- `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:packages/core/src/baseinput/BaseInput.vue`
- `primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.js`

---

## 7. Pass-through

Pass-through (PT) gives direct access to the DOM elements ("sections") of a component.

- **Values:** a section value may be a string (becomes `class`), an object of attributes/listeners, or a function receiving the PT options (`instance`, `props`, `state`, `parent`, and component-specific context) that returns either.
- **Instance PT:** the `pt` prop, typed per component as `PassThrough<<Name>PassThroughOptions>`.
- **Declarative PT:** attributes of the form `pt:<section>:<attr>="value"`, for example `pt:root:class` or `:pt:header:onClick`.
- **Global PT:** `config.pt.<component>`; instance values take precedence. Directives use `config.pt.directives.<name>`. `config.pt.global.css` injects custom CSS once.
- **Merge strategy:** `ptOptions` (prop or global) with `mergeSections` (default `true`, keep global sections the instance does not override) and `mergeProps` (default `false`, replace rather than merge attributes; may also be a custom merge function).
- **`usePassThrough(pt1, pt2, ptOptions)`** from `primevue/passthrough` combines two PT objects and returns `{ _usept, originalValue, value }`; the docs show the four `mergeSections` × `mergeProps` outcomes.
- **`pc` prefix:** sections named `pc<Name>` (for example `pcBadge` in Button) target a nested PrimeVue component, and their value is that component's own PT object.
- **Lifecycle hooks:** a `hooks` section receives Vue lifecycle callbacks (see [§6.1](#61-basecomponent)).
- **DOM markers:** rendered elements carry `data-pc-name` (root) and `data-pc-section`, which the docs and tests use to address sections.

Sources:

- `primevue-4.5.5:packages/primevue/src/passthrough/index.js`
- `primevue-4.5.5:packages/primevue/src/passthrough/index.d.ts`
- `primevue-4.5.5:apps/showcase/doc/passthrough/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/passthrough/GlobalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/passthrough/CustomCSSDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/passthrough/UsePassThroughDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/passthrough/DeclarativeDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/passthrough/LifecycleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/passthrough/PCPrefixDoc.vue`
- `primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`

---

## 8. Styled mode and theming integration

PrimeVue does not own its CSS or tokens in this archive. Component CSS comes from `@primeuix/styles/<component>`, token presets from `@primeuix/themes/<preset>`, and the theming engine (`Theme`, `definePreset`, `dt`, CSS variable generation) from `@primeuix/styled`. PrimeVue's `BaseStyle` and `BaseComponent` only orchestrate loading.

- **Theme structure:** base style rules that read CSS variables, plus a preset that defines design tokens in three tiers — primitive (palette), semantic (with a `colorScheme` group holding `light` and `dark`), and component tokens.
- **Presets:** Aura, Material (Material Design v2), Lara (Bootstrap-inspired) and Nora (enterprise look).
- **Theme options:** `prefix` (default `p`, giving variables such as `--p-primary-color`), `darkModeSelector` (default `'system'` which follows `prefers-color-scheme`; a class selector such as `.my-app-dark`; `false` or `'none'` disables dark mode), `cssLayer` (default `false`; `true` or `{ name, order }` wraps styles in a `primevue` layer).
- **Customization:** `definePreset(Aura, overrides)`, component-level `colorScheme` overrides, `extend` for custom tokens and a `css({ dt })` hook per component or globally. Reserved token keys: `primitive`, `semantic`, `components`, `directives`, `colorscheme`, `light`, `dark`, `common`, `root`, `states`, `extend`.
- **Runtime utilities (from `@primeuix/themes`):** `$dt(path)` returns `{ name, variable, value }`; `usePreset` replaces the preset; `updatePreset` merges; `updatePrimaryPalette` and `updateSurfacePalette`; `palette(color)` generates shades 50–950.
- **Scoped tokens:** the `dt` prop on a component instance generates CSS scoped to that instance.
- **Scale:** sizes are in `rem`, so the root font size scales the library.

`@primevue/themes` still exists, but every showcase example imports from `@primeuix/themes`; the package's entry re-exports `@primeuix/styled` and each preset/component folder re-exports the matching `@primeuix/themes` module. The changelog records the move of all themes to `@primeuix/themes`. The source does not mark `@primevue/themes` as deprecated.

Sources:

- `primevue-4.5.5:apps/showcase/doc/theming/styled/ArchitectureDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/PresetsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/configuration/OptionsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/DarkModeDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/ScopedTokensDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/ReservedKeysDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/ScaleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/CSSModulesDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/customization/`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/utils/`
- `primevue-4.5.5:apps/showcase/doc/theming/styled/csslayer/`
- `primevue-4.5.5:packages/themes/package.json`
- `primevue-4.5.5:packages/themes/src/index.js`
- `primevue-4.5.5:packages/themes/src/presets/aura/button/index.js`
- `primevue-4.5.5:packages/themes/types/button/index.d.ts`
- `primevue-4.5.5:CHANGELOG.md`

---

## 9. Unstyled mode

Unstyled mode removes the theme CSS variables and component style rules while keeping behaviour and accessibility. It is enabled globally with `unstyled: true` or per component with the `unstyled` prop. In unstyled mode `cx()` returns no classes, so styling is supplied through pass-through (global `pt` with class strings, nested `pc*` sections, or declarative `pt:` attributes). Volt is presented as the official unstyled PrimeVue + Tailwind CSS v4 component set whose source is copied into the application; it is a separate project, not part of this archive.

Sources:

- `primevue-4.5.5:apps/showcase/doc/theming/unstyled/ArchitectureDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/unstyled/SetupDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/unstyled/GlobalDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/unstyled/VoltDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/theming/unstyled/ExampleDoc.vue`

---

## 10. Helpers: utils, api module, FilterService

### 10.1 Utils

- `@primevue/core/utils` re-exports all of `@primeuix/utils` (DOM, object and string helpers, `EventBus`, `uuid`, z-index handling) and adds `ConnectedOverlayScrollHandler` (closes overlays when scroll containers move), `HelperSet`, `getVNodeProp` and `UniqueComponentId` (`@deprecated` since v4.3.0; use `uuid` from `@primeuix/utils`).
- `primevue/utils` adds `blockBodyScroll` / `unblockBodyScroll`, which use the `scrollbar.width` token.
- `useId(initialValue?)` produces `pv_id…` ids; `useAttrSelector(prefix = 'pc')` produces the attribute selector used for scoped styles.
- `useStyle(css, options)` (also at `primevue/usestyle`) injects a `<style>` element. Options: `document`, `immediate` (default `true`), `manual` (default `false`), `name`, `id`, `media`, `nonce`, `first`, `props`, `onMounted`, `onUpdated`, `onLoad`. It returns load/unload controls and state.

### 10.2 `@primevue/core/api`

The api module moved from `primevue/api` (v3) to `@primevue/core/api` in v4. It exports:

- `FilterMatchMode`: `STARTS_WITH` (`'startsWith'`), `CONTAINS`, `NOT_CONTAINS`, `ENDS_WITH`, `EQUALS`, `NOT_EQUALS`, `IN` (`'in'`), `LESS_THAN` (`'lt'`), `LESS_THAN_OR_EQUAL_TO` (`'lte'`), `GREATER_THAN` (`'gt'`), `GREATER_THAN_OR_EQUAL_TO` (`'gte'`), `BETWEEN`, `DATE_IS`, `DATE_IS_NOT`, `DATE_BEFORE`, `DATE_AFTER`.
- `FilterOperator`: `AND` (`'and'`), `OR` (`'or'`).
- `FilterService`: `filter(value, fields, filterValue, filterMatchMode, filterLocale)`, a `filters` map with one function per match mode (`startsWith`, `contains`, `notContains`, `endsWith`, `equals`, `notEquals`, `in`, `between`, `lt`, `lte`, `gt`, `gte`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`), and `register(rule, fn)` for custom rules.
- `PrimeIcons`: about 306 string constants of the form `'pi pi-<name>'`.
- `ToastSeverity`: `INFO`, `WARN`, `ERROR`, `SUCCESS`.

Sources:

- `primevue-4.5.5:packages/core/src/utils/Utils.js`
- `primevue-4.5.5:packages/core/src/utils/ConnectedOverlayScrollHandler.js`
- `primevue-4.5.5:packages/core/src/utils/UniqueComponentId.js`
- `primevue-4.5.5:packages/primevue/src/utils/Utils.js`
- `primevue-4.5.5:packages/core/src/useid/UseId.js`
- `primevue-4.5.5:packages/core/src/usestyle/UseStyle.js`
- `primevue-4.5.5:packages/core/src/api/Api.js`
- `primevue-4.5.5:packages/core/src/api/FilterMatchMode.js`
- `primevue-4.5.5:packages/core/src/api/FilterOperator.js`
- `primevue-4.5.5:packages/core/src/api/FilterService.js`
- `primevue-4.5.5:packages/core/src/api/PrimeIcons.js`
- `primevue-4.5.5:packages/core/src/api/ToastSeverity.js`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`

---

## 11. Directives

Directives are built with `BaseDirective.extend(name, options)` from `@primevue/core/basedirective`. The base wraps Vue directive hooks (`created` … `unmounted`), stores an instance on the element (`el.$instance` and `el.$<name>`), and gives directives the same PT helpers (`ptm`, `ptmo`), style helpers (`cx`, `sx`), unstyled handling (`binding.value.unstyled` or config), scoped tokens (`binding.value.dt`), global PT from `config.pt.directives.<name>`, `data-pc-*` markers and theme/style loading as components.

| Directive           | Import                     | Folder            | Status                                   |
| ------------------- | -------------------------- | ----------------- | ---------------------------------------- |
| `v-tooltip`         | `primevue/tooltip`         | `tooltip`         | Current                                  |
| `v-ripple`          | `primevue/ripple`          | `ripple`          | Current (needs `ripple: true` in config) |
| `v-styleclass`      | `primevue/styleclass`      | `styleclass`      | Current                                  |
| `v-focustrap`       | `primevue/focustrap`       | `focustrap`       | Current                                  |
| `v-keyfilter`       | `primevue/keyfilter`       | `keyfilter`       | Current                                  |
| `v-animateonscroll` | `primevue/animateonscroll` | `animateonscroll` | Current (global PT key is `animate`)     |
| `v-badge`           | `primevue/badgedirective`  | `badgedirective`  | Deprecated since v4; use `OverlayBadge`  |

Each directive folder has `Base<Name>.js` (style and defaults), `<Name>.js` (behaviour), `<Name>.d.ts` and a `style/` folder. Behavioural details belong to the Wave 2 directive records.

Sources:

- `primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`
- `primevue-4.5.5:packages/primevue/src/tooltip/`
- `primevue-4.5.5:packages/primevue/src/ripple/`
- `primevue-4.5.5:packages/primevue/src/styleclass/`
- `primevue-4.5.5:packages/primevue/src/focustrap/`
- `primevue-4.5.5:packages/primevue/src/keyfilter/`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/`
- `primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.js`
- `primevue-4.5.5:packages/metadata/src/index.ts`

---

## 12. Services and composables

| Service (plugin)      | Global property | Composable     | API                                                                                    | Used by                         |
| --------------------- | --------------- | -------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| `ToastService`        | `$toast`        | `useToast()`   | `add(message)`, `remove(message)`, `removeGroup(group)`, `removeAllGroups()`           | `Toast`                         |
| `ConfirmationService` | `$confirm`      | `useConfirm()` | `require(options)`, `close()`                                                          | `ConfirmDialog`, `ConfirmPopup` |
| `DialogService`       | `$dialog`       | `useDialog()`  | `open(content, options)` → instance with `content`, `options`, `data`, `close(params)` | `DynamicDialog`                 |

Each service is installed with `app.use(...)`, sets the global property and provides a symbol. The composables inject that symbol and throw `No PrimeVue Toast provided!`, `No PrimeVue Confirmation provided!` or `No PrimeVue Dialog provided!` when the service is missing. Services talk to their components through event buses created with `EventBus()` from `@primeuix/utils/eventbus` (`toasteventbus`, `confirmationeventbus`, `dynamicdialogeventbus`, and `overlayeventbus` for overlay coordination). `terminalservice` is a bare event bus used by `Terminal`. Other composables: `usePrimeVue` (`primevue/config`) and `useStyle` (`primevue/usestyle`).

Sources:

- `primevue-4.5.5:packages/primevue/src/toastservice/`
- `primevue-4.5.5:packages/primevue/src/confirmationservice/`
- `primevue-4.5.5:packages/primevue/src/dialogservice/`
- `primevue-4.5.5:packages/primevue/src/usetoast/`
- `primevue-4.5.5:packages/primevue/src/useconfirm/`
- `primevue-4.5.5:packages/primevue/src/usedialog/`
- `primevue-4.5.5:packages/primevue/src/terminalservice/TerminalService.js`
- `primevue-4.5.5:packages/primevue/src/overlayeventbus/`

---

## 13. Forms library (`@primevue/forms`)

Install `@primevue/forms`; import `Form` and `FormField` from `@primevue/forms`. Fields are bound by `name` instead of `v-model`.

**`Form`** renders a `<form>` (submit and reset are prevented and handled internally) and provides `$pcForm` to descendants. Props:

| Prop                    | Type               | Default |
| ----------------------- | ------------------ | ------- |
| `resolver`              | `Function`         | `null`  |
| `initialValues`         | `Object`           | `null`  |
| `validateOnValueUpdate` | `Boolean \| Array` | `true`  |
| `validateOnBlur`        | `Boolean \| Array` | `false` |
| `validateOnMount`       | `Boolean \| Array` | `false` |
| `validateOnSubmit`      | `Boolean \| Array` | `true`  |

It emits `submit` (`FormSubmitEvent`: `originalEvent`, `values`, `states`, `valid`, `errors`, …) and `reset` (`FormResetEvent`). The default slot receives `register`, `valid`, `reset` and per-field states. Exposed methods include `submit()` and `register(field, options)` (skipped when `novalidate` is set).

**`FormField`** wraps a single field (including non-PrimeVue inputs), registers with the parent form, and provides `$pcFormField`. Props: `name`, `resolver`, `initialValue`, `validateOnValueUpdate`/`Blur`/`Mount`/`Submit` (override the form; default `undefined`), `as` (default `'DIV'`) and `asChild` (default `false`).

**`useForm(options)`** returns `defineField`, `setFieldValue`, `getFieldState`, `handleSubmit`, `handleReset`, `validate`, `setValues`, `reset`, `valid`, `states` and `fields`. Field state: `value`, `touched`, `dirty`, `pristine`, `valid`, `invalid`, `error`, `errors`.

**Resolvers:** `@primevue/forms/resolvers/zod`, `yup`, `valibot`, `superstruct` and `joi`; each re-exports `@primeuix/forms/resolvers/<name>`. The docs show the first four; `joi` exists in source only. Custom resolvers receive `{ values, names }`.

**Integration:** any component built on `BaseEditableHolder` (see [§6.3](#63-editable-and-input-bases)) reads `$pcForm`/`$pcFormField` and works inside a `Form` by `name`. The "dynamic" form docs use sample components local to the showcase, not library exports.

Sources:

- `primevue-4.5.5:packages/forms/package.json`
- `primevue-4.5.5:packages/forms/src/index.js`
- `primevue-4.5.5:packages/forms/src/form/BaseForm.vue`
- `primevue-4.5.5:packages/forms/src/form/Form.vue`
- `primevue-4.5.5:packages/forms/src/form/Form.d.ts`
- `primevue-4.5.5:packages/forms/src/formfield/BaseFormField.vue`
- `primevue-4.5.5:packages/forms/src/formfield/FormField.vue`
- `primevue-4.5.5:packages/forms/src/useform/index.js`
- `primevue-4.5.5:packages/forms/src/resolvers/zod/index.js`
- `primevue-4.5.5:packages/forms/src/resolvers/joi/index.js`
- `primevue-4.5.5:apps/showcase/doc/forms/`

---

## 14. Icons

Two separate icon systems exist:

- **PrimeIcons (font).** The `primeicons` package (catalog `^7.0.0`) is imported as `primeicons/primeicons.css` and used with `pi pi-<name>` classes; size follows `font-size`, and `pi-spin` rotates. Constants are in `PrimeIcons` from `@primevue/core/api`. Components accept icon class names through `icon`-style props.
- **`@primevue/icons` (SVG components).** 48 icon components used inside components as defaults (angle, arrow, chevron, check, times, search, sort, filter, spinner, star, upload, window icons and others), each a 14×14 SVG extending `BaseIcon`. `BaseIcon` extends `BaseComponent`, has props `label` and `spin`, applies `p-icon` / `p-icon-spin`, and sets `role="img"` with `aria-label` when labelled, otherwise `aria-hidden`. Import per path (`@primevue/icons/check`) or from the root (`import { SearchIcon } from '@primevue/icons'`).

Custom icons (SVG, Font Awesome, Material, images) are applied through component icon slots.

Sources:

- `primevue-4.5.5:packages/icons/package.json`
- `primevue-4.5.5:packages/icons/src/baseicon/BaseIcon.vue`
- `primevue-4.5.5:packages/icons/src/baseicon/style/BaseIconStyle.js`
- `primevue-4.5.5:packages/icons/src/check/CheckIcon.vue`
- `primevue-4.5.5:apps/showcase/doc/icons/`
- `primevue-4.5.5:apps/showcase/doc/customicons/`

---

## 15. Guides

- **Accessibility.** The guide frames disabilities (visual, hearing, mobility, cognitive), names WCAG, Section 508 and the EU accessibility directive, and stresses native form elements with labels, semantic HTML and WAI-ARIA roles/states. A recurring pattern is a visually hidden native input (`p-hidden-accessible`) driving a styled control, shown with Checkbox. Colour guidance: at least 4.5:1 contrast and desaturated colours in dark mode. Each component page has its own accessibility section (see [§18](#18-notes-for-component-records)).
- **RTL.** There is no JavaScript option; set `dir="rtl"` or CSS `direction` and components adapt through logical properties. Galleria and Carousel do not support RTL.
- **Animations.** Enter/leave animations use CSS classes on Vue transitions. Shared class families: `.p-anchored-overlay-*` (AutoComplete, CascadeSelect, ColorPicker, ConfirmPopup, ContextMenu, DatePicker, Menu, MultiSelect, Password, Select, TieredMenu, TreeSelect), `.p-collapsible-*` (Accordion, Fieldset, Panel, PanelMenu, Stepper), `.p-dialog-*`, `.p-drawer-*`, `.p-galleria-*`, `.p-image-original-*`, `.p-message-*`, `.p-overlay-mask-*` and `.p-toast-message-*`. Reduced motion is handled by setting `animation-duration: 0s` under `prefers-reduced-motion`.
- **Tailwind CSS.** Two approaches: use Tailwind around styled PrimeVue, or unstyled mode with Tailwind classes via PT (the Volt approach). The `tailwindcss-primeui` plugin (`@import "tailwindcss-primeui"` for v4, JS plugin for v3) adds token-based utilities: `primary-[50-950]`, `surface-[0-950]`, `primary`, `primary-contrast`, `primary-emphasis`, `border-surface`, `bg-emphasis`, `bg-highlight`, `bg-highlight-emphasis`, `rounded-border`, `text-color`, `text-color-emphasis`, `text-muted-color`, `text-muted-color-emphasis`, plus animation utilities. Dark mode uses a custom `dark` variant that matches `darkModeSelector`. Overrides use `!` or a CSS layer order that places `primevue` between Tailwind base and utilities.
- **Dynamic imports.** Root-level named imports from `primevue` and `@primevue/icons`; Editor and Chart are excluded.
- **PrimeFlex.** A guide covers PrimeFlex compatibility and migration to Tailwind; PrimeFlex v4 is required with PrimeVue v4.
- **AI tools (short).** The site serves `llms.txt`, `llms-full.txt` and a `.md` version of each page. `@primevue/mcp` runs an MCP server (`npx -y @primevue/mcp`, binary `primevue-mcp`) built with `runPrimeMcpServer` from `@primeuix/mcp`; tools cover component info (props, events, methods, slots, compare), examples and templates, theming (PT, tokens, styles, theming/PT/Tailwind guides), docs (guides, configuration, installation, accessibility) and search, plus a Vue-specific `list_composables`. Setup docs exist for Claude Code, Cursor, VS Code, Windsurf, Zed and OpenAI Codex.
- **Migration to v4.** Out of scope for this reference set; the deprecation facts it contains are used in [§16](#16-deprecated-components-and-replacements).

Sources:

- `primevue-4.5.5:apps/showcase/doc/guides/accessibility/`
- `primevue-4.5.5:apps/showcase/doc/guides/rtl/ConfigurationDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/rtl/LimitationsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/animations/`
- `primevue-4.5.5:apps/showcase/doc/tailwind/`
- `primevue-4.5.5:apps/showcase/doc/guides/dynamicimports/OverviewDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/primeflex/`
- `primevue-4.5.5:apps/showcase/doc/llms/`
- `primevue-4.5.5:apps/showcase/doc/mcp/`
- `primevue-4.5.5:packages/mcp/package.json`
- `primevue-4.5.5:packages/mcp/src/index.ts`

---

## 16. Deprecated components and replacements

### 16.1 Deprecated components still shipped

| Deprecated                            | Replacement                                                   | Evidence                                                                                                |
| ------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Dropdown`                            | `Select`                                                      | Wrapper `extends: Select`, warns on mount (`dropdown/Dropdown.vue:8`).                                  |
| `Calendar`                            | `DatePicker`                                                  | Warns (`calendar/Calendar.vue:8`).                                                                      |
| `Sidebar`                             | `Drawer`                                                      | Warns (`sidebar/Sidebar.vue:8`).                                                                        |
| `OverlayPanel`                        | `Popover`                                                     | Warns (`overlaypanel/OverlayPanel.vue:8`).                                                              |
| `InputSwitch`                         | `ToggleSwitch`                                                | Warns (`inputswitch/InputSwitch.vue:8`).                                                                |
| `TabView` (+ `TabPanel` legacy props) | `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`             | Warns (`tabview/TabView.vue:121`).                                                                      |
| `AccordionTab`                        | `AccordionPanel`, `AccordionHeader`, `AccordionContent`       | Warns (`accordiontab/AccordionTab.vue:13`); Accordion `activeIndex` is deprecated in favour of `value`. |
| `Chips`                               | `InputChips` (per runtime warning)                            | Warns (`chips/Chips.vue:8`).                                                                            |
| `InputChips`                          | `AutoComplete` with multiple selection and typeahead disabled | Warns (`inputchips/InputChips.vue:79`).                                                                 |
| `InlineMessage`                       | `Message`                                                     | `@deprecated` in `inlinemessage/InlineMessage.d.ts:141`; no runtime warning.                            |
| `v-badge` (`BadgeDirective`)          | `OverlayBadge`                                                | Warns (`badgedirective/BadgeDirective.js:7`).                                                           |
| `Steps`                               | `Stepper` without panels                                      | Migration guide only; no `@deprecated` tag; removed from the showcase menu.                             |
| `TabMenu`                             | `Tabs` without panels                                         | Migration guide only; no `@deprecated` tag; removed from the showcase menu.                             |

All file references above are under `packages/primevue/src/`. Runtime warnings use the text `Deprecated since v4. Use <X> instead.` Deprecated wrappers keep their own style names (for example `DropdownStyle` is `BaseStyle.extend({ name: 'dropdown' })`) and their own keys in `PrimeVuePTOptions`.

### 16.2 Removed in v4

`TriStateCheckbox` (use `Checkbox` with `indeterminate`), `DataViewLayoutOptions` (use `SelectButton`), `switchTheme` (use `usePreset`), the `primevue/resources` themes and the `primevue/passthrough/tailwind` preset (use Volt), the `Sidebar`/`Drawer` `size` prop, Rating's cancel option, Inplace's `closable`, and the `.p-link`, `.p-highlight` and `.p-fluid` utility classes. `nuxt-primevue` was replaced by `@primevue/nuxt-module`.

### 16.3 Deprecated props, slots and events (notable)

- `inputStyle` config → `inputVariant` (since v4.0).
- Button `plain` → `severity="contrast"` (since v4.2.0, `button/Button.d.ts:183`).
- Message `sticky` (since 4.0); Message is no longer closable by default and does not auto-hide.
- Select, MultiSelect, CascadeSelect `panelStyle`/`panelClass` → `overlayStyle`/`overlayClass`; Select `inputId`/`inputStyle`/`inputClass` → `labelId`/`labelStyle`/`labelClass`.
- AutoComplete `item-select`/`item-unselect` style emits → `option-select`/`option-unselect`.
- Many capitalized icon-template slots (Paginator, Tree, Password, InputNumber and others) are deprecated in favour of lower-case `*icon` slots.
- `UniqueComponentId` (since v4.3.0) → `uuid`; `filled` → `$filled`; `hasFluid` deprecated; root `$pc` element property scheduled for removal in v5.

Sources:

- `primevue-4.5.5:packages/primevue/src/dropdown/Dropdown.vue`
- `primevue-4.5.5:packages/primevue/src/dropdown/style/DropdownStyle.js`
- `primevue-4.5.5:packages/primevue/src/calendar/Calendar.vue`
- `primevue-4.5.5:packages/primevue/src/sidebar/Sidebar.vue`
- `primevue-4.5.5:packages/primevue/src/overlaypanel/OverlayPanel.vue`
- `primevue-4.5.5:packages/primevue/src/inputswitch/InputSwitch.vue`
- `primevue-4.5.5:packages/primevue/src/tabview/TabView.vue`
- `primevue-4.5.5:packages/primevue/src/accordiontab/AccordionTab.vue`
- `primevue-4.5.5:packages/primevue/src/accordion/Accordion.d.ts`
- `primevue-4.5.5:packages/primevue/src/chips/Chips.vue`
- `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`
- `primevue-4.5.5:packages/primevue/src/inlinemessage/InlineMessage.d.ts`
- `primevue-4.5.5:packages/primevue/src/badgedirective/BadgeDirective.js`
- `primevue-4.5.5:packages/primevue/src/button/Button.d.ts`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`

---

## 17. Peer and runtime dependencies

| Package                          | Runtime dependencies                                                                                                                                                                                 | Peer dependencies |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `@primevue/core`                 | `@primeuix/styled`, `@primeuix/utils`                                                                                                                                                                | `vue` `^3.5.0`    |
| `primevue`                       | `@primeuix/styled`, `@primeuix/utils`, `@primeuix/styles`, `@primevue/core`, `@primevue/icons`                                                                                                       | none              |
| `@primevue/forms`                | `@primeuix/utils`, `@primeuix/forms`, `@primevue/core`                                                                                                                                               | none              |
| `@primevue/icons`                | `@primeuix/utils`, `@primevue/core`                                                                                                                                                                  | none              |
| `@primevue/themes`               | `@primeuix/styled`, `@primeuix/themes`                                                                                                                                                               | none              |
| `@primevue/nuxt-module`          | `@nuxt/kit` `^3`, `@primeuix/styled`, `@primeuix/utils`, `primevue`, `@primevue/auto-import-resolver`, `@primevue/metadata`, `@primevue/forms`, `unplugin-vue-components` `28.4.1`, `pathe` `^1.1.2` | none              |
| `@primevue/auto-import-resolver` | `@primevue/metadata`                                                                                                                                                                                 | none              |
| `@primevue/metadata`             | none                                                                                                                                                                                                 | none              |
| `@primevue/mcp`                  | `@primeuix/mcp`                                                                                                                                                                                      | none              |

Catalog versions: `@primeuix/styled` `^0.7.4`, `@primeuix/utils` `^0.6.2`, `@primeuix/forms` `^0.1.0`, `@primeuix/styles` `^2.0.3`, `@primeuix/themes` `^2.0.3`, `@primeuix/mcp` `^1.0.0`, `tailwindcss-primeui` `^0.6.1`, `primeicons` `^7.0.0`. `vue` is the only peer dependency in the repository, declared on `@primevue/core`. Optional, user-installed libraries: `quill` (Editor), `chart.js` (Chart), `primeicons`, `tailwindcss-primeui`, and the schema libraries behind form resolvers.

Sources:

- `primevue-4.5.5:pnpm-workspace.yaml`
- `primevue-4.5.5:packages/core/package.json`
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/forms/package.json`
- `primevue-4.5.5:packages/icons/package.json`
- `primevue-4.5.5:packages/themes/package.json`
- `primevue-4.5.5:packages/nuxt-module/package.json`
- `primevue-4.5.5:packages/auto-import-resolver/package.json`
- `primevue-4.5.5:packages/metadata/package.json`
- `primevue-4.5.5:packages/mcp/package.json`

---

## 18. Notes for component records

Where things live for a component `<Name>` with folder `<name>` (lower case):

| What                                   | Location                                                                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implementation                         | `packages/primevue/src/<name>/<Name>.vue`                                                                                                                                                    |
| Props defaults, provide, style binding | `packages/primevue/src/<name>/Base<Name>.vue` (`extends: BaseComponent`, `style: <Name>Style`, `provide()` of `$pc<Name>`)                                                                   |
| Public types                           | `packages/primevue/src/<name>/<Name>.d.ts`: `<Name>Props`, `<Name>Slots`, `<Name>EmitsOptions`, `<Name>PassThroughOptions`, `<Name>PassThroughMethodOptions`, context interfaces, methods    |
| PT section list                        | The `<Name>PassThroughOptions` interface in the `.d.ts`; `pc*` keys are nested components; `hooks` is always present.                                                                        |
| Class names                            | `packages/primevue/src/<name>/style/<Name>Style.js` (`classes` map, optional `inlineStyles`) and the `<Name>Classes` enum in `style/<Name>Style.d.ts`                                        |
| CSS                                    | Not in this archive: imported from `@primeuix/styles/<name>`.                                                                                                                                |
| Design tokens                          | Not in this archive: `@primeuix/themes/<preset>/<name>`; type re-export at `packages/themes/types/<name>/index.d.ts`; preset shim at `packages/themes/src/presets/<preset>/<name>/index.js`. |
| Tests                                  | `packages/primevue/src/<name>/<Name>.spec.js` (Vitest + `@vue/test-utils`) where present.                                                                                                    |
| Package entry                          | `packages/primevue/src/<name>/package.json` (`main`/`module` the `.vue`, `types` the `.d.ts`); `style/package.json` marks the style side-effect free.                                        |
| Showcase page                          | `apps/showcase/pages/<name>/index.vue`: lists doc sections, `apiDocs` names, the PT tab and the theming tab.                                                                                 |
| Usage docs                             | `apps/showcase/doc/<name>/*Doc.vue`; `ImportDoc.vue` gives the import path; `AccessibilityDoc.vue` gives screen reader and keyboard support.                                                 |
| PT docs                                | `apps/showcase/doc/<name>/pt/index.vue` (viewer + table from `getPTOptions('<Name>')`).                                                                                                      |
| Theming docs                           | `apps/showcase/doc/<name>/theming/index.vue` (CSS classes table, design tokens table, built-in presets; `TailwindDoc.vue` where present).                                                    |
| Generated API data                     | `apps/showcase/doc/common/apidoc/index.json` (built by `apps/showcase/scripts/build-apidoc.cjs` from the `.d.ts` files).                                                                     |
| Metadata group                         | `packages/metadata/src/components/` (showcase category, service `use.as`).                                                                                                                   |

Cross-cutting patterns to apply in every record:

- **Inherited props.** Every component inherits `pt`, `ptOptions`, `unstyled` and `dt` from `BaseComponent`. Form controls also inherit `BaseEditableHolder` props (`modelValue`, `defaultValue`, `name`, `invalid`, `disabled`, `formControl`) and, for inputs, `BaseInput` props (`size`, `fluid`, `variant`). Check the base chain before listing props as component-specific.
- **Forms.** Components on `BaseEditableHolder` work inside `@primevue/forms` `Form`/`FormField` by `name` and emit `value-change`.
- **DOM markers.** Sections render `data-pc-name` and `data-pc-section`; state is often exposed through extra `data-p-*` attributes.
- **Sub-components.** Compound components (DataTable, Tree, Menu families and others) contain internal SFCs that set `hostName` so PT and style resolve through the host; nested PrimeVue components appear as `pc*` PT keys.
- **Overlays.** Overlay components use `Portal` (`appendTo`, `'self'` disables teleport), z-index categories from `config.zIndex`, `ConnectedOverlayScrollHandler`, the overlay event bus and the `.p-anchored-overlay-*` or `.p-overlay-mask-*` animation classes.
- **Locale.** Built-in labels (aria labels, empty messages, date strings) come from `config.locale`; record which keys a component reads.
- **Icons.** Default icons are `@primevue/icons` SVG components; most components expose `<x>icon` slots and some accept PrimeIcons class strings through props. Capitalized `*Icon` slots are deprecated.
- **Deprecated names.** Deprecated components are thin wrappers or legacy implementations; describe the replacement as canonical and note the alias (see [§16](#16-deprecated-components-and-replacements)).
- **Services.** Toast, ConfirmDialog, ConfirmPopup and DynamicDialog need their service plugin and use the matching composable.
- **Optional dependencies.** Editor (Quill) and Chart (Chart.js) are excluded from root-barrel imports and from Nuxt auto-registration by default.

Sources:

- `primevue-4.5.5:packages/primevue/src/button/Button.vue`
- `primevue-4.5.5:packages/primevue/src/button/BaseButton.vue`
- `primevue-4.5.5:packages/primevue/src/button/Button.d.ts`
- `primevue-4.5.5:packages/primevue/src/button/Button.spec.js`
- `primevue-4.5.5:packages/primevue/src/button/package.json`
- `primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.js`
- `primevue-4.5.5:packages/primevue/src/button/style/ButtonStyle.d.ts`
- `primevue-4.5.5:packages/primevue/src/portal/Portal.vue`
- `primevue-4.5.5:packages/themes/types/button/index.d.ts`
- `primevue-4.5.5:apps/showcase/pages/button/index.vue`
- `primevue-4.5.5:apps/showcase/doc/button/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/button/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/common/apidoc/index.json`
- `primevue-4.5.5:apps/showcase/package.json`
