# PrimeReact 10.9.9 — architecture

How the library is laid out, built and styled. Back to the [index](index.md).

## Repository and package layout

The archive is the PrimeReact GitHub repository, which is a Next.js 12 showcase application with the library inside it (`primereact-10.9.9:package.json`):

| Path                              | Role                                                                                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/lib/`                 | Library source: one folder per component or core module (116 folders), plus `primereact.all.js` and `ts-helpers.d.ts`.                                                                                     |
| `components/doc/`                 | Showcase documentation sections, one folder per component or guide topic; `components/doc/common/apidoc/index.json` is the generated API doc.                                                              |
| `pages/`                          | Next.js routes that assemble the doc sections (one folder per component, plus `configuration`, `installation`, `theming`, `passthrough`, `unstyled`, `tailwind`, `guides`, `hooks`, `icons`, `locale`, …). |
| `public/themes/`                  | Prebuilt theme CSS (56 themes, each `theme.css` + `fonts/`), copied into the npm package.                                                                                                                  |
| `styles/`                         | Showcase SCSS (`demo/`, `layout/`, `doc/`) and the deprecated, empty `primereact.css`.                                                                                                                     |
| `api-scripts/`                    | `build-apidoc.js` and `build-webtypes.js`, which turn the `.d.ts` files into `apidoc/index.json` and `web-types.json`.                                                                                     |
| `rollup.config.js`, `gulpfile.js` | Library build.                                                                                                                                                                                             |

Sources: `primereact-10.9.9:components/lib/`, `primereact-10.9.9:pages/`, `primereact-10.9.9:public/themes/`, `primereact-10.9.9:styles/primereact.css`, `primereact-10.9.9:api-scripts/`.

### Folder anatomy

A typical component folder, using `components/lib/dropdown/` as the example (`primereact-10.9.9:components/lib/dropdown/`):

- `Dropdown.js` — the public component (`React.memo(React.forwardRef(...))`).
- `DropdownBase.js` — `ComponentBase.extend({ defaultProps, css: { classes, styles, inlineStyles } })`.
- `DropdownItem.js`, `DropdownPanel.js` — internal sub-parts (not separate entry points).
- `dropdown.d.ts` — props, events, methods and pass-through types. File name is lower case.
- `package.json` — per-entry metadata (below).
- Some folders also hold `*.spec.js` tests and `__snapshots__/`.

104 folders contain a `*Base.js`. Folders without one are the core modules `api`, `hooks`, `icons`, `utils`, `passthrough`, `overlayservice`, `terminalservice`, `keyfilter` (`KeyFilter.js` + `keyfilteroptions.d.ts`), type-only folders `menuitem`, `selectitem`, `treenode`, and `inputotp`, whose base file is named `BaseInputOtp.js` instead (`primereact-10.9.9:components/lib/`).

## Build and entry points

`npm run build:lib` sets `INPUT_DIR=components/lib/` and `OUTPUT_DIR=dist/` and runs `build:check` (lint, prettier, `tsc`, `npm audit`), `rollup -c`, `gulp build-resources` and `build:api` (`primereact-10.9.9:package.json`).

Rollup (`primereact-10.9.9:rollup.config.js`):

- **One entry per folder.** For every folder in `components/lib/` that has a file whose lower-cased name equals the folder name (`dropdown/Dropdown.js`), it emits `dist/<folder>/<folder>.cjs.js`, `.esm.js`, `.cjs.min.js`, `.esm.min.js` and an IIFE `<folder>.js` / `.min.js` with the global name `primereact.<folder>`.
- **Icons**: each `components/lib/icons/<name>/index.js` becomes `dist/icons/<name>/index.*`.
- **All-in-one**: `primereact.all.js` becomes `dist/primereact.all.*`; it re-exports every component, `api` (including the default `PrimeReact` export), hooks, utils, iconbase and 45 of the 47 icons (`blank` and `download` are not re-exported).
- **Pass-through**: `passthrough/index.js` and `passthrough/tailwind/index.js` get their own entries.
- **Shared modules stay external.** An alias plugin rewrites relative imports of shared modules to package specifiers — `../utils/Utils` → `primereact/utils`, `../api/Api` → `primereact/api`, and likewise `componentbase`, `hooks`, `ripple`, `csstransition`, `portal`, `keyfilter`, `iconbase`, the icons, `tooltip`, `virtualscroller`, `terminalservice`, `overlayservice`, `button`, `inputtext`, `inputnumber`, `messages`, `progressbar`, `dropdown`, `dialog`, `paginator`, `tree`, `passthrough` — and marks them external, so a component bundle imports, rather than inlines, the modules it shares with other components. A `corePlugin` concatenates the IIFE builds of exactly these shared modules into `dist/core/core.js` and `core.min.js` for script-tag users.
- **Externals**: `react`, `react-dom`, `react-transition-group`, `@babel/runtime`, `@fullcalendar/core`, `chart.js/auto`, `quill`.
- Every CJS and ESM file starts with the banner `'use client';` so the modules work with React Server Components setups.
- Babel uses `@babel/preset-env`, `@babel/preset-react`, `@babel/plugin-transform-runtime` (runtime helpers) and class properties.

Each folder's `package.json` points the bundler at the built files, for example `{ "main": "./dropdown.cjs.js", "module": "./dropdown.esm.js", "unpkg": "./dropdown.min.js", "types": "./dropdown.d.ts", "sideEffects": false }` (`primereact-10.9.9:components/lib/dropdown/package.json`). There is no `exports` map anywhere; deep imports such as `primereact/dropdown` resolve through these nested `package.json` files.

Gulp `build-resources` (`primereact-10.9.9:gulpfile.js`) copies `styles/primereact.css` to `dist/resources/primereact.css` and `primereact.min.css`, copies `public/themes/**` to `dist/resources/themes`, copies fonts, `README.md` and `LICENSE.md`, every `.d.ts` (with lower-cased basename) and every folder `package.json`. Tasks `build-css`, `copy-css` and `images` are marked `@deprecated`. `styles/primereact.css` is a two-line file whose only content is a comment saying that `primereact[.min].css` is deprecated and kept as an empty file so existing imports do not break (`primereact-10.9.9:styles/primereact.css`).

The generated npm `package.json` is described in [index.md](index.md#dependencies).

## Component base pattern

### `ComponentBase.extend`

Every styled component defines its base object with `ComponentBase.extend({ defaultProps, css })` (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`):

- `defaultProps` always includes `__TYPE` (the component name, e.g. `'Button'`), usually `__parentMetadata: null`, and all public props with their defaults. `ComponentBase.defaultProps` (`pt: undefined`, `ptOptions: undefined`, `unstyled: false`) is merged in.
- `css` holds up to three maps: `classes` (section key → class string or function of `{ props, state, context, … }`), `styles` (a CSS string for the component's structural rules) and `inlineStyles` (section key → style object or function). 25 base files define `inlineStyles`.

`extend` returns the input plus three helpers:

| Helper                     | What it does                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `getProps(props, context)` | `Object.assign({}, defaultProps, props)`; also stores the context on the shared `ComponentBase` object. |
| `getOtherProps(props)`     | The props whose keys are not in `defaultProps` (for spreading onto the root element).                   |
| `setMetaData(metadata)`    | Returns `{ ptm, ptmo, sx, cx, isUnstyled }` for the current render.                                     |

The `setMetaData` functions:

- `ptm(key, params)` — pass-through props for a section, combining the global pt from context with the component's own `pt` prop.
- `ptmo(obj, key, params)` — the same lookup on an arbitrary object, without the global pt.
- `cx(key, params)` — the built-in class name for a section from `css.classes`; returns `undefined` when unstyled.
- `sx(key, params, when = true)` — inline style for a section, merging `inlineStyles` entries; inline styles are applied even in unstyled mode because they carry functional values (heights, positions).
- `isUnstyled()` — `context.unstyled || PrimeReact.unstyled || props.unstyled`.

`ComponentBase` keeps "current component" state (`cProps`, `cParams`, `cName`, `context`) in module-level fields that each render overwrites, rather than in React state.

### What a component does each render

Using Button as the reference (`primereact-10.9.9:components/lib/button/Button.js`, `primereact-10.9.9:components/lib/button/ButtonBase.js`):

```js
const mergeProps = useMergeProps();
const context = React.useContext(PrimeReactContext);
const props = ButtonBase.getProps(inProps, context);
const { ptm, cx, isUnstyled } = ButtonBase.setMetaData({
  props,
  ...props.__parentMetadata,
  context: { disabled },
});
useHandleStyle(ButtonBase.css.styles, isUnstyled, { name: "button", styled: true });
// each element:
const labelProps = mergeProps({ className: cx("label") }, ptm("label"));
```

So every rendered element gets three layers, merged in this order: the built-in class (`cx`), then pass-through props (`ptm`), with `data-pc-name` / `data-pc-section` attributes added by `ptm`. Child components rendered inside a parent receive the parent's pt section through their own `pt` prop (for example `<Tooltip pt={ptm('tooltip')} />`) and, in composite components, `__parentMetadata={{ parent: metaData }}` or `hostName="Dropdown"` so nested pt lookups can see the host (`primereact-10.9.9:components/lib/dropdown/Dropdown.js`, `primereact-10.9.9:components/lib/autocomplete/AutoComplete.js`).

Non-visual helpers that do not use `ComponentBase` define a plain base object with `defaultProps`, `getProps` and `getOtherProps` only: `CSSTransitionBase` and `IconBase` (`primereact-10.9.9:components/lib/csstransition/CSSTransitionBase.js`, `primereact-10.9.9:components/lib/iconbase/IconBase.js`).

### Type declarations

Each `<name>.d.ts` declares `<Name>PassThroughOptions` (section key → `<Name>PassThroughType<HTMLAttributes>`, plus nested component pt such as `tooltip?: TooltipPassThroughOptions` and `hooks?: ComponentHooks`), `<Name>PassThroughMethodOptions` (the arguments a pt function receives, e.g. `{ props: InputSwitchProps }`), the props interface (which always ends with `pt?`, `ptOptions?: PassThroughOptions`, `unstyled?: boolean`), event interfaces and the component class with its public methods (for example `focus()`, `getElement()`, `getInput()`) (`primereact-10.9.9:components/lib/inputswitch/inputswitch.d.ts`). `PassThroughType<T, O>` is `T | ((options?: O) => T | void) | null | undefined | { [key: string]: any }` (`primereact-10.9.9:components/lib/utils/utils.d.ts`).

## Style injection

Styles are CSS strings inside JavaScript, injected at runtime by `useHandleStyle` and `useStyle` (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, `primereact-10.9.9:components/lib/hooks/useStyle.js`):

- `ComponentBase.js` embeds two shared strings. `baseStyle` holds `.p-hidden-accessible` and `.p-overflow-hidden`. `commonStyle` is wrapped in `@layer primereact { … }` and holds `.p-component` box-sizing, `.p-hidden`, `.p-disabled`, `.p-component-overlay`, `.p-link`, the `p-connected-overlay-*` and `p-toggleable-content-*` transition classes, and the structural CSS of Button, InputText/InputGroup/FloatLabel and the SVG icons.
- `useHandleStyle(styles, isUnstyled, { name, styled = false, hostName = '' })` registers four `useStyle` instances in manual mode — `base`, `common`, `global` (the `global.css` string from the global pt) and one named after the component — and loads them on mount: `base` and `global` always; `common` and the component's own string only when not unstyled; the component string is also skipped when `styled: true`. Only Button, InputText and SelectButton pass `styled: true`, because their structural CSS already sits in `commonStyle`.
- `useStyle` writes each string into a `<style data-primereact-style-id="{name}">` element inside `context.styleContainer` or `document.head`, adds the configured `nonce`, and reuses an existing element with the same id, so each component's CSS is injected once per document. Styles are not removed on unmount.
- Component CSS strings are wrapped in `@layer primereact` in 67 of the 72 base files that define `styles` (Editor, FocusTrap, StepperPanel, Tree and VirtualScroller are unlayered), so application CSS outside layers wins without extra specificity.
- Component CSS strings are **structural** only (layout, positioning, overflow). Colours, spacing, borders and fonts come from the theme CSS file in styled mode or from pass-through classes in unstyled mode.

`componentbase.d.ts` declares `useHandleStyle(styles: string, isUnstyled: () => boolean, config: { name: string; styled?: boolean; hostName?: string }): void` (`primereact-10.9.9:components/lib/componentbase/componentbase.d.ts`).

## Pass-through (pt)

Sources: `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, `primereact-10.9.9:components/lib/passthrough/index.js`, `primereact-10.9.9:components/lib/passthrough/index.d.ts`, `primereact-10.9.9:components/doc/passthrough/`.

**Local pt.** Every component accepts `pt`, an object keyed by section name (`root`, `header`, `label`, …). A section value can be:

- an object of DOM props (`{ className, style, id, onClick, 'aria-*', … }`);
- a string or an array, shorthand for `className`;
- a function receiving the method options (for example `{ props, state, context, parent }`) and returning either of the above.

Section keys are compared after `ObjectUtils.toFlatCase`, which strips `-` and `_` and lower-cases, so `togglerIcon`, `toggler-icon` and `togglericon` are the same key.

**Global pt.** `PrimeReactProvider value={{ pt }}` holds one entry per component, keyed by lower-case component name (`panel`, `autocomplete`, …), plus `global: { css }` for a CSS string injected once as the `global` style (`primereact-10.9.9:components/doc/passthrough/globalptdoc.js`, `primereact-10.9.9:components/doc/passthrough/customcss.js`). Nested components are addressed through the parent, for example `autocomplete.input.root` (`primereact-10.9.9:components/doc/passthrough/globalptdoc.js`). `PrimeReactPTOptions` in `api.d.ts` lists the typed keys. Several components that call `ptm` at runtime have no key there, so a typed global pt cannot target them without a cast: `buttongroup`, `datascroller`, `iconfield`, `inputicon`, `metergroup`, `stepper`, `tristatecheckbox` (`primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/stepper/Stepper.js`, `primereact-10.9.9:components/lib/datascroller/DataScroller.js`).

**Lifecycle hooks.** A pt object may contain `hooks: { useMountEffect, useUpdateEffect, useUnmountEffect }`, called by `useHandleStyle` for the host component (`ComponentHooks` in `primereact-10.9.9:components/lib/componentbase/componentbase.d.ts`, `primereact-10.9.9:components/doc/passthrough/lifecycle.js`). The `useMountEffect` pt hook is invoked directly in the render body on every render, not inside an effect.

**Data attributes.** Every element that receives `ptm` output gets `data-pc-section="<flat key>"`; the root element also gets `data-pc-name="<flat component name>"`. The `transition` section receives neither.

**Merging (`ptOptions`).** `PassThroughOptions` is `{ mergeSections?: boolean; mergeProps?: boolean; classNameMergeFunction?: (className1: string, className2: string) => string | undefined }`. `ptOptions` is read from the component's own prop, else the context.

- `mergeSections` (default `true`): when on, a section takes values from both the global and the local pt; when off, a section defined locally replaces the global one.
- `mergeProps`: when on, the two objects are combined with `mergeProps` (class names joined or passed to `classNameMergeFunction`, styles merged, event handlers chained); when off, the local object is spread over the global one. The provider default is `mergeProps: true`, but `ComponentBase` falls back to `false` when neither the prop nor the context supplies `ptOptions` — so the effective default depends on whether a provider is present.
- `classNameMergeFunction` lets a Tailwind app pass `twMerge` (`primereact-10.9.9:components/doc/tailwind/unstyledmode/setupdoc.js`).

**`usePassThrough(pt1, pt2, options)`** (from `primereact/passthrough`) is a plain function, not a React hook. It returns `{ _usept: { mergeSections, mergeProps, classNameMergeFunction }, originalValue: pt1, value: { ...pt1, ...pt2 } }` with defaults `mergeSections = true`, `mergeProps = false`; `ComponentBase` recognises the `_usept` marker and merges `originalValue` with `value` per section. Its purpose is to extend a preset such as the Tailwind pt without rewriting it (`primereact-10.9.9:components/doc/passthrough/usepassthroughdoc.js`).

## Unstyled mode

Unstyled mode is switched on globally with `PrimeReactProvider value={{ unstyled: true }}` or per component with the `unstyled` prop (`primereact-10.9.9:components/doc/unstyled/setupdoc.js`). Its effect, from `ComponentBase` (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`):

- `cx()` returns `undefined`, so no `p-*` class is added to any element.
- The `common` style and the component's own style are not injected. The `base` style (`.p-hidden-accessible`, `.p-overflow-hidden`) and the global pt `global.css` are still injected, and `sx()` inline styles still apply.
- Behaviour, keyboard support and ARIA attributes are unchanged; components render without visual styling until pt supplies classes.

The showcase describes the intended pairing: unstyled mode removes the built-in styling, and a global pt configuration supplies a complete design — the Tailwind preset is exactly such a configuration (`primereact-10.9.9:components/doc/unstyled/architecturedoc.js`, `primereact-10.9.9:components/doc/unstyled/themedoc.js`).

## Styled mode and themes

PrimeReact 10 styled mode splits styling into a **core** (structural CSS embedded in the components, above) and a **theme** (colours, spacing, typography) delivered as a single prebuilt CSS file (`primereact-10.9.9:components/doc/theming/architecturedoc.js`).

- **Prebuilt themes.** 56 theme folders ship in `public/themes/`, each with one `theme.css` and a `fonts/` folder, and are published as `primereact/resources/themes/<name>/theme.css`: `arya-{blue,green,orange,purple}`, `bootstrap4-{light,dark}-{blue,purple}`, `fluent-light`, `lara-{light,dark}-{amber,blue,cyan,green,indigo,pink,purple,teal}`, `luna-{amber,blue,green,pink}`, `md-{light,dark}-{indigo,deeppurple}`, `mdc-{light,dark}-{indigo,deeppurple}`, `mira`, `nano`, `nova`, `nova-accent`, `nova-alt`, `rhea`, `saga-{blue,green,orange,purple}`, `soho-{light,dark}`, `tailwind-light`, `vela-{blue,green,orange,purple}`, `viva-{light,dark}` (`primereact-10.9.9:public/themes/`, `primereact-10.9.9:gulpfile.js`). The showcase's built-in themes list is a subset of these (`primereact-10.9.9:components/doc/theming/builtinthemesdoc.js`).
- **Theme content.** A theme starts with a `:root` block of CSS variables — `--font-family`, `--surface-a`…`--surface-f`, `--surface-0`…`--surface-900`, `--gray-50`…`--gray-900`, `--primary-color`, `--primary-color-text`, `--text-color`, `--text-color-secondary`, `--content-padding`, `--inline-spacing`, `--border-radius`, `--surface-ground/section/card/overlay/border/hover`, `--focus-ring`, `--maskbg`, `--highlight-bg`, `--highlight-text-color` — followed by `@font-face` rules and component rules inside `@layer primereact` (`lara-light-blue/theme.css`, 7,068 lines, two `@layer primereact` blocks). These variables are a flat palette; they are not design tokens in the PrimeVue 4 / `@primeuix` sense and component rules use compiled literal values as well (`primereact-10.9.9:public/themes/lara-light-blue/theme.css`, `primereact-10.9.9:components/doc/theming/cssvariablesdoc.js`).
- **Custom themes** are built with SASS from the separate `primereact-sass-theme` repository (not part of this archive): copy a theme folder, edit its variables, then either compile with `sass --update themes/mytheme/theme.scss:themes/mytheme/theme.css` or import the SCSS and let the build compile it (`primereact-10.9.9:components/doc/theming/customthemedoc.js`). The SCSS sources are therefore **N/A** for this study — only the compiled CSS is in the archive.
- **Switching themes** at runtime uses `changeTheme(currentTheme, newTheme, linkElementId, callback)` from the context, which swaps the `href` of a `<link id="theme-link">` element (`primereact-10.9.9:components/doc/theming/switchthemesdoc.js`).
- **Scale.** Components size from the root font size; the showcase changes `html { font-size: 14px; }` to scale everything (`primereact-10.9.9:components/doc/theming/scaledoc.js`).
- **Scoped styling** examples use CSS modules, CSS-in-JS and a named class on the component (`primereact-10.9.9:components/doc/theming/scopedstyling/`).
- **Utility classes** shipped with the themes: `p-component`, `p-fluid`, `p-disabled`, `p-hidden-accessible`, `p-reset`, `p-link`, `p-error`, `p-invalid`, `p-text-secondary`; layout utilities come from the separate PrimeFlex library (`primereact-10.9.9:components/doc/theming/utilsdoc.js`, `primereact-10.9.9:components/doc/theming/primeflexdoc.js`).
- **Per-component class reference.** Each component has a `theming/styleddoc.js` listing its `p-*` classes and what element each targets (`primereact-10.9.9:components/doc/inputswitch/theming/styleddoc.js`).

The architecture page itself notes an intention to move styled-mode theming from SCSS variables to CSS variables in a later release; in 10.9.9 that has not happened (`primereact-10.9.9:components/doc/theming/architecturedoc.js`).

### `@primeuix` and design tokens

N/A. PrimeReact 10.9.9 has no design-token system, no `@primeuix/styled` / `@primeuix/themes` dependency, no preset objects and no `dt()` function; the only themes are the compiled CSS files above. A text search of all `.js`, `.ts`, `.json` and `.md` files in the archive for `primeuix` returns nothing (`primereact-10.9.9:package.json`, `primereact-10.9.9:rollup.config.js`).

## Tailwind preset

`primereact/passthrough/tailwind` exports a complete global pt preset, `Tailwind`, written with Tailwind utility classes, plus a named `TRANSITIONS` object (`primereact-10.9.9:components/lib/passthrough/tailwind/index.js`, 3,563 lines):

- `TRANSITIONS.toggleable` — `timeout: 500`, max-height classes; `TRANSITIONS.overlay` — `timeout: 150`, opacity/scale classes. Components consume these through their `transition` pt section.
- `Tailwind.global.css` adds the ripple keyframes keyed on `data-pd-ripple` / `data-p-ink-active` attributes.
- One entry per component, mostly functions of `{ props, state, context }` returning `className` built with `classNames`.
- Typed as `declare const Tailwind: PrimeReactPTOptions; export default Tailwind;` (`primereact-10.9.9:components/lib/passthrough/tailwind/index.d.ts`).

Usage is `PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}` (`primereact-10.9.9:components/doc/tailwind/unstyledmode/setupdoc.js`). Each component's showcase has a `theming/tailwinddoc.js` with that component's preset section to copy (`primereact-10.9.9:components/doc/inputswitch/theming/tailwinddoc.js`). The Tailwind setup guide is summarised in [icons-and-guides.md](icons-and-guides.md#tailwind-and-css-layer-guides).
