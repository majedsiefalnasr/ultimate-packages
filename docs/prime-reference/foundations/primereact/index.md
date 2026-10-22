# PrimeReact 10.9.9 — foundations

Foundation notes for the PrimeReact part of the Prime baseline (ADR-048). They describe what the pinned archive `primereact-10.9.9.tar.gz` ships; they say nothing about Ultimate's own implementation. Every claim cites its archive path as `primereact-10.9.9:<path>`.

## Contents

| File                                                             | Covers                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [index.md](index.md) (this file)                                 | Installation, `PrimeReactProvider` / `PrimeReactContext` and every configuration option, dependencies, PrimeReact-only and legacy components |
| [architecture.md](architecture.md)                               | Package layout, build and entry points, the component base pattern, style injection, pass-through, unstyled mode, styled themes, Tailwind    |
| [api-and-utils.md](api-and-utils.md)                             | The `api` module (locale, `FilterService`, enums, `PrimeIcons`), `utils`, services, `CSSTransition` and other core helpers                   |
| [hooks.md](hooks.md)                                             | Every hook in `components/lib/hooks`                                                                                                         |
| [icons-and-guides.md](icons-and-guides.md)                       | SVG icon components, PrimeIcons, custom icons, accessibility guide, RTL, Tailwind and CSS layer guides                                       |
| [notes-for-component-records.md](notes-for-component-records.md) | Cross-cutting patterns and file locations Wave 2 component authors need                                                                      |

## At a glance

- PrimeReact 10 does **not** use `@primeuix/*` at all. No `primeuix` string appears anywhere in the archive's JavaScript, TypeScript, JSON or Markdown files, and neither the repository `package.json` nor the generated npm `package.json` lists it. Styling comes from prebuilt SASS-compiled theme CSS files plus CSS strings embedded in each component's `*Base.js` (see [architecture.md](architecture.md)) (`primereact-10.9.9:package.json`, `primereact-10.9.9:rollup.config.js`).
- The repository is a Next.js showcase site that also contains the library source. The library lives in `components/lib/`; showcase documentation sections live in `components/doc/`; routes in `pages/` (`primereact-10.9.9:package.json`, `primereact-10.9.9:components/lib/primereact.all.js`).
- Global configuration is a React context (`PrimeReactProvider`). The older static `PrimeReact` object still exists but is deprecated (`primereact-10.9.9:components/lib/api/PrimeReact.js`, `primereact-10.9.9:components/lib/api/api.d.ts`).
- Many components still carry names that PrimeNG 21 and PrimeVue 4 have renamed: Select is `Dropdown`, DatePicker is `Calendar`, Drawer is `Sidebar`, Popover is `OverlayPanel`, ToggleSwitch is `InputSwitch`, Tabs is `TabView`. PrimeReact 10.9.9 ships no component under the canonical names (no `select`, `datepicker`, `drawer`, `popover`, `toggleswitch` or `tabs` folder in `components/lib/`).

## Installation

The showcase installs the package with `npm install primereact` or `yarn add primereact` (`primereact-10.9.9:components/doc/installation/downloaddoc.js`). Components are imported one by one from their own entry point, for example `import { Button } from 'primereact/button';`, so an application bundles only what it uses (`primereact-10.9.9:components/doc/installation/usagedoc.js`).

Styled mode needs a theme stylesheet, for example `import "primereact/resources/themes/lara-light-cyan/theme.css";` (`primereact-10.9.9:components/doc/installation/styleddoc.js`). Unstyled mode instead sets `unstyled: true` on the provider (`primereact-10.9.9:components/doc/installation/unstyledmodedoc.js`). Icons used by string class names (`pi pi-check`) need the separate `primeicons` package and `import 'primeicons/primeicons.css';` (`primereact-10.9.9:components/doc/icons/downloaddoc.js`, `primereact-10.9.9:components/doc/icons/importdoc.js`).

The provider is wrapped around the application, for example in Next.js `_app.js` (`primereact-10.9.9:components/doc/installation/context.js`):

```jsx
import { PrimeReactProvider } from "primereact/api";

export default function MyApp({ Component, pageProps }) {
  return (
    <PrimeReactProvider>
      <Component {...pageProps} />
    </PrimeReactProvider>
  );
}
```

The installation page also has an "examples" section and a Next.js video section (`primereact-10.9.9:components/doc/installation/examplesdoc.js`, `primereact-10.9.9:components/doc/installation/videos/nextjsdoc.js`).

## PrimeReactProvider and PrimeReactContext

Both are exported from `primereact/api` (`primereact-10.9.9:components/lib/api/Api.js`).

- `PrimeReactContext = React.createContext()` — created without a default value, so components rendered outside a provider read `undefined` and fall back to the static `PrimeReact` object.
- `PrimeReactProvider` takes `props.value` (`value ?? {}`) and stores **each option in its own `useState`**, initialised from `value.<option> ?? <default>`. Because the values are only used as initial state, changing the `value` prop after the first render has no effect; runtime changes must go through the setters exposed on the context.
- Three effects copy `ripple`, `inputStyle` and `locale` back onto the static `PrimeReact` object; these effects are themselves marked `@deprecated`. This is how the module-level locale functions (which read `PrimeReact.locale`) see the provider's locale.

Sources: `primereact-10.9.9:components/lib/api/PrimeReactContext.js`.

Declared types (`primereact-10.9.9:components/lib/api/api.d.ts`):

```ts
type PrimeReactProviderProps = {
  value?: Partial<APIOptions>;
  children: React.ReactNode;
};
declare const PrimeReactProvider: React.FC<PrimeReactProviderProps>;
declare const PrimeReactContext: React.Context<APIOptions>;
```

### Configuration options (`APIOptions`)

Defaults are the values used by `PrimeReactProvider`; the type column is copied from `api.d.ts`.

| Option                            | Type                                                     | Provider default                                                         | Effect                                                                                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appendTo`                        | `AppendToType`                                           | `null`                                                                   | Where overlays are portalled. `Portal` resolves `props.appendTo \|\| context.appendTo \|\| PrimeReact.appendTo`, calls it if it is a function, falls back to `document.body`, and renders in place for `'self'`. |
| `styleContainer`                  | `StyleContainerType`                                     | `null` (type doc: `document.head`)                                       | Parent node for the `<style>` elements created by `useStyle`; intended for Shadow DOM.                                                                                                                           |
| `autoZIndex`                      | `boolean`                                                | `true`                                                                   | Overlay z-indexes are managed through `ZIndexUtils`; when off, each layer group increments only within itself.                                                                                                   |
| `cssTransition`                   | `boolean`                                                | `true`                                                                   | When `false`, `CSSTransition` renders children without animation (enter/exit callbacks still fire).                                                                                                              |
| `filterMatchModeOptions`          | `FilterMatchModeOptions`                                 | see below                                                                | Match modes offered in DataTable filter menus, per data type.                                                                                                                                                    |
| `hideOverlaysOnDocumentScrolling` | `boolean`                                                | `false`                                                                  | Changes what the overlay scroll listener binds to (adds `window` instead of `document.body`), so overlays close on document scroll.                                                                              |
| `inputStyle`                      | `InputStyleType`                                         | `'outlined'`                                                             | `'filled'` makes inputs render the filled variant; components add `p-variant-filled` when their own `variant` prop is unset and `context.inputStyle === 'filled'`.                                               |
| `locale`                          | `string`                                                 | `'en'`                                                                   | Active locale key for the locale API.                                                                                                                                                                            |
| `nonce`                           | `string`                                                 | `null`                                                                   | CSP nonce added to every dynamically created `<style>` element.                                                                                                                                                  |
| `nullSortOrder`                   | `number`                                                 | `1`                                                                      | How `null` values sort.                                                                                                                                                                                          |
| `ripple`                          | `boolean`                                                | `false`                                                                  | Enables the ink ripple effect; `Ripple` only loads its CSS and renders when this is on.                                                                                                                          |
| `zIndex`                          | `Partial<ZIndexOptions>`                                 | `{ modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100, toast: 1200 }` | Base z-index per layer group.                                                                                                                                                                                    |
| `pt`                              | `PrimeReactPTOptions`                                    | `undefined`                                                              | Global pass-through, keyed by lower-case component name, plus `global.css`.                                                                                                                                      |
| `ptOptions`                       | `PassThroughOptions`                                     | `{ mergeSections: true, mergeProps: true }`                              | How global and local pass-through objects are merged; may carry `classNameMergeFunction`.                                                                                                                        |
| `unstyled`                        | `boolean`                                                | `false`                                                                  | Removes all built-in style classes and component CSS.                                                                                                                                                            |
| `changeTheme`                     | `(theme?, newTheme?, linkElementId?, callback?) => void` | function                                                                 | Swaps a theme `<link>`: clones the element with id `linkElementId`, replaces `theme` with `newTheme` in its `href`, calls `callback` on load. Throws `Element with id ${linkElementId} not found.`               |

`filterMatchModeOptions` default: `text: [STARTS_WITH, CONTAINS, NOT_CONTAINS, ENDS_WITH, EQUALS, NOT_EQUALS]`, `numeric: [EQUALS, NOT_EQUALS, LESS_THAN, LESS_THAN_OR_EQUAL_TO, GREATER_THAN, GREATER_THAN_OR_EQUAL_TO]`, `date: [DATE_IS, DATE_IS_NOT, DATE_BEFORE, DATE_AFTER]` (all `FilterMatchMode` members).

Supporting types: `ZIndexOptions { modal: number; overlay: number; menu: number; tooltip: number; toast: number }`, `InputStyleType = 'outlined' | 'filled'`, `AppendToType = 'self' | HTMLElement | undefined | null | (() => HTMLElement)`, `StyleContainerType = ShadowRoot | HTMLElement | undefined | null`, `FilterMatchModeOptions { text: any[]; numeric: any[]; date: any[] }`.

Setters on the context value: `setRipple`, `setInputStyle`, `setLocale`, `setAppendTo`, `setStyleContainer`, `setCssTransition`, `setAutoZIndex`, `setHideOverlaysOnDocumentScrolling`, `setNonce`, `setNullSortOrder`, `setZIndex`, `setPtOptions`, `setPt`, `setFilterMatchModeOptions`, `setUnstyled`. `api.d.ts` declares all of them as optional `Dispatch<SetStateAction<…>>` members **except** `setPtOptions` and `setUnstyled`, which exist only at runtime.

Sources: `primereact-10.9.9:components/lib/api/PrimeReactContext.js`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/portal/Portal.js`, `primereact-10.9.9:components/lib/ripple/Ripple.js`, `primereact-10.9.9:components/lib/csstransition/CSSTransition.js`, `primereact-10.9.9:components/lib/hooks/useStyle.js`, `primereact-10.9.9:components/lib/hooks/useOverlayScrollListener.js`, `primereact-10.9.9:components/lib/inputtext/InputTextBase.js`.

### Showcase configuration page

The configuration page has sections `appendto`, `stylecontainer`, `csstransition`, `filtermatchmode`, `hideoverlays`, `inputstyle`, `nonce`, `nullsortorder`, `ripple`, `zindex` and a `Locale` group (`setup`, `import`, `setlocale`, `addlocale`, `repositorydoc`) (`primereact-10.9.9:pages/configuration/index.js`, `primereact-10.9.9:components/doc/configuration/`). The `styleContainer` example attaches a shadow root and passes it as both `appendTo` and `styleContainer` (`primereact-10.9.9:components/doc/configuration/stylecontainer.js`). The locale repository section points to the community PrimeLocale project for ready-made translations (`primereact-10.9.9:components/doc/configuration/locale/repositorydoc.js`). There is no showcase section for `pt`, `ptOptions` or `unstyled` on this page; they are documented on the pass-through and unstyled pages instead.

### Deprecated static `PrimeReact` object

The default export of `primereact/api` is a class with static fields `ripple = false`, `inputStyle = 'outlined'`, `locale = 'en'`, `appendTo = null`, `cssTransition = true`, `autoZIndex = true`, `hideOverlaysOnDocumentScrolling = false`, `nonce = null`, `nullSortOrder = 1`, `zIndex` (same defaults), `pt = undefined`, `filterMatchModeOptions` (same defaults) and a static `changeTheme`. The source marks it `@deprecated please use PrimeReactContext`; the type file says `@deprecated since version 9.6.0. Use PrimeReactContext instead.` and types it as `APIOptions`. Components still read it as a fallback everywhere (for example `ComponentBase` checks `PrimeReact.unstyled`, which the class never defines) (`primereact-10.9.9:components/lib/api/PrimeReact.js`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`).

## Dependencies

The npm `package.json` is not committed; `rollup.config.js` writes it into `dist/` at build time (`primereact-10.9.9:rollup.config.js`):

| Field                  | Value                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `peerDependencies`     | `@types/react`, `react`, `react-dom`: each `^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0`                                                                  |
| `peerDependenciesMeta` | `@types/react` is `optional: true`                                                                                                              |
| `dependencies`         | `@types/react-transition-group: ^4.4.1`, `react-transition-group: ^4.4.1`                                                                       |
| `sideEffects`          | `["**/*.css"]`                                                                                                                                  |
| `engines`              | `node: >=14.0.0`                                                                                                                                |
| `license`              | `MIT`                                                                                                                                           |
| `main` / `module`      | `primereact.all.min.js` / `primereact.all.esm.min.js`; `unpkg` and `jsdelivr` point to `primereact.all.min.js`; `web-types` is `web-types.json` |

Optional third-party libraries are not dependencies but are treated as externals by the build: `chart.js/auto` (Chart) and `quill` (Editor), both loaded lazily with a dynamic `import()` so applications install them only when they use those components, and `@fullcalendar/core`, which no file in `components/lib` imports (a leftover external entry) (`primereact-10.9.9:rollup.config.js`, `primereact-10.9.9:components/lib/chart/Chart.js`, `primereact-10.9.9:components/lib/editor/Editor.js`). The repository's own `package.json` (the showcase app, `react` `18.3.1`, `next` `12.3.7`, `react-transition-group` `^4.4.5`, `primeicons` `^7.0.0`, `primeflex` `3.3.1`, `chart.js` `4.5.0`, `quill` `2.0.3`, `engines.node >=18`) is not what npm consumers install (`primereact-10.9.9:package.json`).

## PrimeReact-only and legacy-named components

Details belong to the Wave 2 component records; this list gives names and locations. All paths are under `primereact-10.9.9:components/lib/`, with docs under `primereact-10.9.9:components/doc/<folder>/`. "Canonical" uses the names from `GLOSSARY.md`; "Vue / NG" notes whether a folder of the same legacy name exists in PrimeVue 4.5.5 (`packages/primevue/src/`) and PrimeNG 21.1.9 (`packages/primeng/src/`).

| PrimeReact component     | Folder                | Canonical name / status                                                            | Same name in Vue / NG                                                   |
| ------------------------ | --------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `Dropdown`               | `dropdown/`           | Legacy alias of **Select**                                                         | Vue yes (`@deprecated since v4. Use Select component instead.`) / NG no |
| `Calendar`               | `calendar/`           | Legacy alias of **DatePicker**                                                     | Vue yes / NG no                                                         |
| `Sidebar`                | `sidebar/`            | Legacy alias of **Drawer**                                                         | Vue yes / NG no                                                         |
| `OverlayPanel`           | `overlaypanel/`       | Legacy alias of **Popover**                                                        | Vue yes / NG no                                                         |
| `InputSwitch`            | `inputswitch/`        | Legacy alias of **ToggleSwitch**                                                   | Vue yes / NG no                                                         |
| `TabView` (+ `TabPanel`) | `tabview/`            | Legacy alias of **Tabs**                                                           | Vue yes / NG no                                                         |
| `Chips`                  | `chips/`              | Older chip-input name (PrimeVue has `chips` and `inputchips`; PrimeNG has neither) | Vue yes / NG no                                                         |
| `InputTextarea`          | `inputtextarea/`      | Older name of the Textarea component                                               | no / no                                                                 |
| `Messages`               | `messages/`           | Message list container; PrimeVue 4 and PrimeNG 21 keep only `Message`              | no / no                                                                 |
| `Steps`                  | `steps/`              | Menu-style steps; present in both other libraries alongside `Stepper`              | Vue yes / NG yes                                                        |
| `TabMenu`                | `tabmenu/`            | Menu rendered as tabs                                                              | Vue yes / NG no                                                         |
| `Mention`                | `mention/`            | PrimeReact only                                                                    | no / no                                                                 |
| `MultiStateCheckbox`     | `multistatecheckbox/` | PrimeReact only                                                                    | no / no                                                                 |
| `TriStateCheckbox`       | `tristatecheckbox/`   | PrimeReact only (the other libraries cover this with an indeterminate Checkbox)    | no / no                                                                 |
| `DataScroller`           | `datascroller/`       | PrimeReact only                                                                    | no / no                                                                 |

None of these folders carries a component-level `@deprecated` marker in its `.d.ts`; the only deprecations in this set are two members of `dropdown.d.ts` (`DropdownFilterOptions` and the `filterTemplate` option, both `@deprecated Since v9.3.0`) (`primereact-10.9.9:components/lib/dropdown/dropdown.d.ts`). Sub-parts worth noting: `calendar/CalendarPanel.js`, `dropdown/DropdownItem.js`, `dropdown/DropdownPanel.js`, `messages/UIMessage.js`.

Sources: the folders above; `primereact-10.9.9:components/lib/primereact.all.js`; `primevue-4.5.5:packages/primevue/src/`; `primeng-21.1.9:packages/primeng/src/`.
