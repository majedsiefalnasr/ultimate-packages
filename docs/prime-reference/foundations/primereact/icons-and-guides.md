# PrimeReact 10.9.9 — icons and guides

Back to the [index](index.md).

## Icons

PrimeReact uses two separate icon mechanisms.

### Built-in SVG icon components (`components/lib/icons`)

Components render their default icons (chevrons, close, check, spinner, sort arrows, …) as small React SVG components, so the library itself does not need an icon font (`primereact-10.9.9:components/lib/icons/`).

- **47 icons**, one folder each with `index.js`, `index.d.ts` and `package.json`: `angledoubledown`, `angledoubleleft`, `angledoubleright`, `angledoubleup`, `angledown`, `angleleft`, `angleright`, `angleup`, `arrowdown`, `arrowup`, `ban`, `bars`, `blank`, `calendar`, `check`, `chevrondown`, `chevronleft`, `chevronright`, `chevronup`, `download`, `exclamationtriangle`, `eye`, `eyeslash`, `filter`, `filterslash`, `infocircle`, `minus`, `pencil`, `plus`, `refresh`, `search`, `searchminus`, `searchplus`, `sortalt`, `sortamountdown`, `sortamountupalt`, `spinner`, `star`, `starfill`, `thlarge`, `times`, `timescircle`, `trash`, `undo`, `upload`, `windowmaximize`, `windowminimize`.
- Each is published as `primereact/icons/<name>` and exports a `<Name>Icon` component, for example `CheckIcon` from `primereact/icons/check`. `blank` and `download` are the only two neither re-exported by `primereact.all.js` nor listed in the build's shared-module aliases (`primereact-10.9.9:components/lib/primereact.all.js`, `primereact-10.9.9:rollup.config.js`).
- Shape: `React.memo(React.forwardRef((inProps, ref) => <svg ref={ref} width="14" height="14" viewBox="0 0 14 14" fill="none" {...IconBase.getPTI(inProps)}><path … fill="currentColor" /></svg>))`, so the icon takes the current text colour (`primereact-10.9.9:components/lib/icons/check/index.js`).
- `IconBase` (`primereact-10.9.9:components/lib/iconbase/IconBase.js`): defaults `className: null`, `label: null`, `spin: false`. `getPTI(props)` returns the remaining props plus `className` = `p-icon` (+ `p-icon-spin` when `spin`) + the given class, `role="img"` and `aria-label` when `label` is set, and `aria-hidden` when `label` is set but empty. The `.p-icon` and `.p-icon-spin` rules live in `commonStyle` in `ComponentBase.js`.
- Types: `IconBaseProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> { className?: string; label?: string; spin?: boolean }`; each icon declares `<Name>IconProps extends IconBaseProps` and a class component type (`primereact-10.9.9:components/lib/iconbase/iconbase.d.ts`, `primereact-10.9.9:components/lib/icons/check/index.d.ts`).

### Icon props on components

Icon-bearing props are typed `IconType<Props>` (163 occurrences across the `.d.ts` files), i.e. `React.ReactNode | ((options: IconOptions) => React.ReactNode)` (`primereact-10.9.9:components/lib/utils/utils.d.ts`, `primereact-10.9.9:components/lib/dropdown/dropdown.d.ts`). `IconUtils.getJSXIcon` renders them: a string becomes a `<span>` carrying that string as class names (the PrimeIcons convention `"pi pi-check"`); a function receives `{ iconProps, element, props }` so custom icons can spread the component's computed class and pt props. The custom-icons showcase demonstrates inline SVG, Font Awesome (class string or `FontAwesomeIcon`), Material UI icons and `<img>` (`primereact-10.9.9:components/doc/customicons/svgdoc.js`, `primereact-10.9.9:components/doc/customicons/fontawesomedoc.js`, `primereact-10.9.9:components/doc/customicons/materialdoc.js`, `primereact-10.9.9:components/doc/customicons/imagedoc.js`).

### PrimeIcons (icon font)

PrimeIcons is a **separate npm package** (`primeicons`, `^7.0.0` in the showcase), not a dependency of `primereact` and not part of this archive's library source (`primereact-10.9.9:package.json`, `primereact-10.9.9:rollup.config.js`). The icons showcase covers (`primereact-10.9.9:components/doc/icons/`):

- install `npm install primeicons` and import `primeicons/primeicons.css` (`downloaddoc.js`, `importdoc.js`);
- usage as `<i className="pi pi-check">`, sizing via `font-size`, colour via `color`, spinning with `pi-spin` (`basicdoc.js`, `sizedoc.js`, `colordoc.js`, `spindoc.js`);
- the `PrimeIcons` constants from `primereact/api`, e.g. `{ label: 'New', icon: PrimeIcons.PLUS }` (`constantsdoc.js`; see [api-and-utils.md](api-and-utils.md#constants));
- a searchable list loaded at runtime from the showcase's `/data/icons.json` (`listdoc.js`, `primereact-10.9.9:service/IconService.js`), and a Figma Community library note (`figmadoc.js`).

The PrimeIcons font files and CSS themselves are **N/A** for this study: they are not in the PrimeReact archive.

## Accessibility guide

The guide page (`primereact-10.9.9:pages/guides/accessibility/index.js`, also routed at `primereact-10.9.9:pages/accessibility/index.js`) assembles six general sections from `primereact-10.9.9:components/doc/accessibility/`:

| Section       | File                 | Content (summarised)                                                                                                                                                                                                                                                                    |
| ------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Introduction  | `introductiondoc.js` | Why accessibility matters and the main disability categories (visual, hearing, mobility, cognitive). States that each component page has its own accessibility section and that the review already done for PrimeVue and PrimeNG was being ported to PrimeReact, with a Q4 2023 target. |
| WCAG          | `wcagdoc.js`         | Explains WCAG as the W3C/WAI standard the components aim to comply with, and mentions national rules such as Section 508.                                                                                                                                                               |
| Form controls | `formcontrolsdoc.js` | Prefer native form elements (keyboard and screen-reader support for free) over styled `div`s; associate labels with inputs.                                                                                                                                                             |
| Semantic HTML | `semantichtmldoc.js` | Use `header`, `nav`, `main`, `footer` and similar elements rather than generic containers.                                                                                                                                                                                              |
| WAI-ARIA      | `waiariadoc.js`      | Roles, states and properties fill the gap for custom widgets; compares a native checkbox with an ARIA-annotated custom one.                                                                                                                                                             |
| Colors        | `colorsdoc.js`       | Contrast of at least 4.5:1 and avoiding colour vibration.                                                                                                                                                                                                                               |

Component-level accessibility lives in each component's `components/doc/<name>/accessibilitydoc.js`, which lists screen-reader behaviour and a keyboard table (for example InputSwitch: hidden native checkbox with `role="switch"`, `tab` focuses, `space` toggles) (`primereact-10.9.9:components/doc/inputswitch/accessibilitydoc.js`, `primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`). Components forward `aria-*` props to their focusable element by filtering their other props with `DomHandler.ARIA_PROPS` (`['aria', 'focus-target']`) through `ObjectUtils.reduceKeys`, both of which are undeclared in `utils.d.ts` (`primereact-10.9.9:components/lib/inputswitch/InputSwitch.js`, `primereact-10.9.9:components/lib/utils/DomHandler.js`).

## RTL

N/A as a guide: PrimeReact 10.9.9 has no RTL guide page, no global `dir`/RTL configuration option and no RTL rules in the prebuilt themes (`lara-light-blue/theme.css` contains no `rtl` selector) (`primereact-10.9.9:components/doc/`, `primereact-10.9.9:pages/`, `primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`). Right-to-left support is limited to individual places:

- Dialog has an `rtl` prop (default `false`) that adds the `p-dialog-rtl` class (`primereact-10.9.9:components/lib/dialog/DialogBase.js`).
- Editor's embedded Quill CSS includes Quill's own `ql-direction-rtl` rules (`primereact-10.9.9:components/lib/editor/EditorBase.js`).
- There is no shared RTL mechanism in `ComponentBase`, and the Tailwind preset contains no `rtl` variants (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`).

## Tailwind and CSS layer guides

### Tailwind page

`pages/tailwind/index.js` has two parts: **CSS Layer** and **Unstyled Mode** (setup, example) (`primereact-10.9.9:pages/tailwind/index.js`).

- **CSS layer.** Declare the layer order `@layer tailwind-base, primereact, tailwind-utilities;` and put Tailwind's base and utilities into the outer layers, so Tailwind utilities can override PrimeReact styles without `!important`. In styled mode the theme is imported too; the guide shows a plain `@import` for Vite and `@import '…/theme.css' layer(primereact);` for Next.js (`primereact-10.9.9:components/doc/tailwind/csslayerdoc.js`).
- **Unstyled setup** (`primereact-10.9.9:components/doc/tailwind/unstyledmode/setupdoc.js`):
  1. Add `./node_modules/primereact/**/*.{js,ts,jsx,tsx}` to Tailwind's `content` globs so classes used inside the preset are not purged.
  2. Enable `PrimeReactProvider value={{ unstyled: true, pt: {} }}`.
  3. Optionally use the bundled preset: `import Tailwind from 'primereact/passthrough/tailwind'` and pass `pt: Tailwind`.
  4. Optionally add `ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge }` (from `tailwind-merge`) so local pt classes win over conflicting preset classes.
  5. Write per-component pt with Tailwind classes, using `TRANSITIONS.toggleable` for collapsible parts; each component's `theming/tailwinddoc.js` has its preset section to copy.

### CSS layer guide

`pages/guides/csslayer/index.js` uses sections from `primereact-10.9.9:components/doc/csslayer/`. Built-in component CSS (`commonStyle`) and the prebuilt themes are wrapped in `@layer primereact`, which gives them lower priority than unlayered application CSS (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`). The sections show:

- **Specificity** — a plain class added through pt (`pt={{ slider: { className: 'my-switch-slider' } }}`) overrides the layered theme without extra specificity (`specificitydoc.js`).
- **Tailwind** — the same `tailwind-base, primereact, tailwind-utilities` ordering (`tailwinddoc.js`).
- **Bootstrap** — `@layer bootstrap-reboot, primereact;` with Bootstrap Reboot imported into its layer (the sample misspells the layer as `bootstrap-rebooot` in the `@import`) (`bootstrapdoc.js`).
- **Reset** and **Normalize** — put the reset in a layer declared before `primereact` (`resetdoc.js`, `normalizedoc.js`).

Most component CSS strings in `*Base.js` files are wrapped in `@layer primereact` as well (for example `primereact-10.9.9:components/lib/dropdown/DropdownBase.js`). The exceptions, injected without a layer and therefore at normal priority, are the `styles` of Editor, FocusTrap, StepperPanel, Tree and VirtualScroller (`primereact-10.9.9:components/lib/editor/EditorBase.js`, `primereact-10.9.9:components/lib/focustrap/FocusTrapBase.js`, `primereact-10.9.9:components/lib/stepperpanel/StepperPanelBase.js`, `primereact-10.9.9:components/lib/tree/TreeBase.js`, `primereact-10.9.9:components/lib/virtualscroller/VirtualScrollerBase.js`).

### Other styling integrations

The showcase also has Bootstrap and Bulma pages (`components/doc/bootstrap/`, `components/doc/bulma/`), which show unstyled mode combined with those frameworks' classes through pt, and a PrimeFlex page under theming (`primereact-10.9.9:components/doc/bootstrap/`, `primereact-10.9.9:components/doc/bulma/`, `primereact-10.9.9:components/doc/theming/primeflexdoc.js`).
