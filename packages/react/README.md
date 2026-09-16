# @ultimate/react

Ultimate Platform React components. See `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md` for the current component inventory.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

Every component calls `@ultimate/react-core`'s `useComponentBase` hook (Option B — see `packages/react-core/README.md`) to register its styles and resolve class-name slots. Each is a plain function component (or `React.forwardRef` where a ref/handle is exposed) with a typed props interface — no class components, no HOCs.

PrimeReact 10.9.9 is the design reference, not a runtime dependency (no `primereact`/`@primeuix/*` import anywhere in this package). Each component's prop surface is a deliberately scoped-down subset of its PrimeReact equivalent; see `docs/architecture/provenance/react.json` for the exact per-file adaptation record, including every documented deviation from the original.

## Components

- **Button (`UButton`)** — native `<button>` host, disabled/loading state (renders a `USpinnerIcon` while loading), optional icon/badge, optional `tooltip` prop sugar.
- **Checkbox (`UCheckbox`)** — binary controlled checkbox (`checked`/`onChange`), no built-in form-library binding (React has no CVA-equivalent contract; see `react-core`'s forms posture).
- **Dialog (`UDialog`)** — modal (or non-modal) overlay composing `Portal` (body-append), `FocusTrap` (Tab-cycling), and `useMotion`-driven enter/leave animation, with Escape-key dismissal and focus-return-on-close.
- **Menu (`UMenu`)** — inline or popup `role="menu"` list of `UMenuItem` entries using `aria-activedescendant` virtual focus, keyboard navigation, and an imperative `toggle`/`show`/`hide` handle for popup mode.
- **Tooltip (`UTooltip`)** — a ref-target overlay primitive showing a positioned `role="tooltip"` element on hover/focus, plus prop-sugar wiring from `UButton`/`UCheckbox`'s own `tooltip` prop.

## Usage

```tsx
import { useState } from "react";
import { UButton, UCheckbox, UDialog } from "@ultimate/react";

function Example() {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  return (
    <>
      <UButton label="Open" onClick={() => setVisible(true)} />
      <UDialog visible={visible} onHide={() => setVisible(false)} header="Example">
        <UCheckbox checked={accepted} onChange={(e) => setAccepted(Boolean(e.checked))} />
      </UDialog>
    </>
  );
}
```

## Component reference

Naming migration: every component's PrimeReact class-name prefix (`p-*`) is renamed `u-*` (e.g. `.p-button-loading` → `.u-button-loading`), per the spec's Public API Strategy. This is a one-time global rename, not restated per component below.

### Button (`UButton`)

**PrimeReact foundation:** adapted from `Button` in PrimeReact's `button/Button.js`. Excludes upstream's passthrough (`pt`/`ptm`) system and content-template projection; `children` renders after the label instead.

**Ultimate behavior:** a native `<button type="button">` with an optional leading/positioned icon, an optional text `label`, a loading state that swaps the icon for a spinning `<USpinnerIcon>` and disables the button, and an optional `tooltip` string rendered via `UTooltip` targeting the button's own ref (ref-target-primitive-plus-prop-sugar — see Tooltip below).

**Key props:**

| Prop             | Type                                                                                  | Notes                                                             |
| ---------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `label`          | `string`                                                                              | button text                                                       |
| `icon`           | `React.ReactNode`                                                                     | rendered inside a positioned `<span>`                             |
| `iconPos`        | `"left" \| "right" \| "top" \| "bottom"`                                              | default `"left"`                                                  |
| `loading`        | `boolean`                                                                             | default `false`; renders `<USpinnerIcon spin>` in place of `icon` |
| `disabled`       | `boolean`                                                                             | default `false`                                                   |
| `severity`       | `"secondary" \| "success" \| "info" \| "warning" \| "danger" \| "help" \| "contrast"` | maps to `u-button-{severity}`                                     |
| `size`           | `"small" \| "large"`                                                                  | maps to `u-button-sm`/`u-button-lg`                               |
| `tooltip`        | `string`                                                                              | rendered via `UTooltip` targeting the button itself               |
| `tooltipOptions` | `Record<string, unknown>`                                                             | spread onto the sugar `UTooltip` instance                         |

```tsx
<UButton label="Save" icon={<SaveIcon />} onClick={handleSave} tooltip="Save changes" />
```

**Accessibility:** renders a real `<button>`, so native disabled/focus/keyboard-activation semantics apply for free. `aria-label` defaults to `label` (plus a trailing badge value, if any) when no explicit `aria-label` is passed.

### Checkbox (`UCheckbox`)

**PrimeReact foundation:** adapted from `Checkbox` in PrimeReact's `checkbox/Checkbox.js`. Implements only upstream's boolean/binary mode via `checked`/`trueValue`/`falseValue` — the multi-value/group-checkbox mode and indeterminate state are excluded.

**Ultimate behavior:** a native `<input type="checkbox">` inside a `.u-checkbox-box` wrapper. Fully controlled — no internal state; the consumer owns `checked` and updates it from `onChange`.

**Key props:**

| Prop                       | Type                                    | Notes                                                         |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| `checked`                  | `unknown`                               | compared against `trueValue` to derive the checked state      |
| `trueValue` / `falseValue` | `unknown`                               | default `true`/`false`                                        |
| `onChange`                 | `(event: UCheckboxChangeEvent) => void` | `event.checked` is the next `trueValue`/`falseValue`          |
| `disabled` / `readOnly`    | `boolean`                               | default `false`                                               |
| `tooltip`                  | `string`                                | rendered via `UTooltip` targeting the checkbox's root `<div>` |

```tsx
<UCheckbox checked={accepted} onChange={(e) => setAccepted(Boolean(e.checked))} />
```

**Accessibility:** native `<input type="checkbox">` semantics; `aria-invalid` reflects the `invalid` prop.

### Dialog (`UDialog`)

**PrimeReact foundation:** adapted from `Dialog` in PrimeReact's `dialog/Dialog.js`. **Non-goal:** `UDialog` does not implement draggable, resizable, or maximizable behavior — no such props, handlers, or UI exist on this component. This is an explicit, separately-tracked scope decision (see spec §15, ADR-030), verified by a negative test (`dialog.spec.tsx`'s "exposes no draggable, resizable, or maximizable props or UI") rather than merely by the absence of such code.

**Ultimate behavior:** a modal (or non-modal) overlay rendered via `Portal` (body-append, or a given `appendTo` target) and `FocusTrap` (Tab-cycling within the dialog; always active regardless of `modal` — `modal` only gates `aria-modal` and whether `dismissableMask` can dismiss via a mask click, not whether `FocusTrap` renders), with a `header`/close-button region, `children` content, and an optional `footer`. Enter/leave is animated via `useMotion`; the actual unmount is deferred until the leave animation's `onAfterLeave` callback fires (a two-state `containerVisible` model, matching verified upstream `Dialog.js`'s `maskVisibleState`/`visibleState`/`onExited` pattern), so a plain `visible=false` doesn't strand the leave animation. Escape dismisses the dialog when `closeOnEscape` is true (via `react-core`'s priority-aware Escape mechanism). Focus returns to the element that had focus before the dialog opened, once the leave phase completes.

**Key props:**

| Prop            | Type                                     | Notes                                                                                   |
| --------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `visible`       | `boolean`                                | required, controlled                                                                    |
| `onHide`        | `(event?: React.SyntheticEvent) => void` | required                                                                                |
| `header`        | `React.ReactNode`                        | title content; drives `aria-labelledby`                                                 |
| `closable`      | `boolean`                                | default `true`; shows the close button                                                  |
| `closeOnEscape` | `boolean`                                | default `false`                                                                         |
| `modal`         | `boolean`                                | default `true`; gates `aria-modal`. `FocusTrap` is always active regardless of `modal`. |
| `blockScroll`   | `boolean`                                | default `false`; registers with `react-core`'s `useScrollLock`                          |
| `appendTo`      | `HTMLElement \| (() => HTMLElement)`     | portal target; defaults to `document.body`                                              |

```tsx
<UDialog visible={visible} onHide={() => setVisible(false)} header="Confirm" closeOnEscape>
  <p>Are you sure?</p>
</UDialog>
```

**Accessibility:** root element has `role="dialog"`, `aria-modal={modal}`, `aria-labelledby` pointing at the header, and `aria-describedby` pointing at the content region. Focus is trapped inside the dialog via `FocusTrap`, which is always active regardless of `modal` (`modal` only gates `aria-modal`, not `FocusTrap`), Escape closes it when `closeOnEscape`, and focus returns to the triggering element once the leave animation completes.

### Menu (`UMenu`)

**PrimeReact foundation:** adapted from `Menu` in PrimeReact's `menu/Menu.js`, rendering a flat, non-popup-by-default `role="menu"` list — no submenu nesting. **Focus model:** `UMenu` preserves verified upstream PrimeReact's `aria-activedescendant` virtual-focus pattern — native DOM focus stays on the root `<ul>`, and a `focusedId` state (published via `aria-activedescendant`) tracks the "active" item, rather than literally moving `document.activeElement` between items. This is an **intentional divergence from Angular's `UMenu`**, which uses a literal roving-tabindex pattern that does move real DOM focus between `<a>` elements — both frameworks' real upstream references (PrimeReact vs. PrimeNG) disagree on this exact dimension, so each Ultimate framework package preserves its own verified upstream behavior rather than forcing mechanism-level parity across frameworks (see spec §10, ADR-027).

**Ultimate behavior:** renders `model` (an array of `UMenuItem`) as `<li role="menuitem">` entries, or `<li role="separator">` for `{ separator: true }` entries. In `popup` mode (`popup={true}`), the menu is rendered via `Portal`, dismissed via `react-core`'s `useOverlayListener` (outside click/resize) and priority-aware Escape, and exposes an imperative `{ toggle, show, hide }` handle via `ref` (`React.forwardRef<UMenuHandle, UMenuProps>`). ArrowDown/ArrowUp/Home/End move the tracked `focusedId`; Enter/Space invoke the focused item; Alt+ArrowUp and Escape close a popup menu and return focus to its trigger.

**Key props:**

| Prop                | Type          | Notes                                                                          |
| ------------------- | ------------- | ------------------------------------------------------------------------------ |
| `model`             | `UMenuItem[]` | required; `{ label, icon, command, disabled, separator, visible, url, items }` |
| `popup`             | `boolean`     | default `false`; renders via `Portal` with overlay dismiss/Escape wiring       |
| `closeOnEscape`     | `boolean`     | default `true`; popup mode only                                                |
| `onShow` / `onHide` | `() => void`  | fire at the start of the enter phase / end of the leave phase, respectively    |

```tsx
const menuRef = useRef<UMenuHandle>(null);
<UButton label="Actions" onClick={(e) => menuRef.current?.toggle(e)} />
<UMenu ref={menuRef} popup model={[{ label: "Edit", command: onEdit }, { separator: true }, { label: "Delete", command: onDelete }]} />
```

**Accessibility:** root list has `role="menu"`; non-separator items are `role="menuitem"` with `aria-disabled` on disabled items; the list itself carries `aria-activedescendant` pointing at the focused item's `id` while the list has DOM focus (virtual focus, not literal — see above).

### Tooltip (`UTooltip`)

**PrimeReact foundation:** adapted from `Tooltip` in PrimeReact's `tooltip/Tooltip.js`. **API shape:** `UTooltip` is a **ref-target primitive** — a standalone component taking a `target` (a `React.RefObject<HTMLElement>`, a raw `HTMLElement`, or a CSS selector string/array) plus `content` and positioning props, rendered via `Portal`. It is **not** an attribute/directive form. `UButton` and `UCheckbox` layer **prop sugar** on top of this primitive: their own `tooltip`/`tooltipOptions` props internally render a `<UTooltip target={internalRef} content={tooltip} {...tooltipOptions} />` alongside the button/checkbox itself — so most consumers never import or render `UTooltip` directly, but it remains available standalone for any other ref'd element.

**Accessibility improvement (intentional deviation):** `UTooltip` adds a verified-absent-upstream `aria-describedby` link from the target element to the tooltip panel's id. The wiring is **additive** (an existing `aria-describedby` value on the target is preserved, not overwritten) and performs **owned-ID-only cleanup** on hide/unmount (only the tooltip's own id is stripped from the attribute, leaving any pre-existing unrelated ids intact); multi-tooltip-same-target is an explicit non-goal. See spec §9, ADR-024's Intentional Deviations table.

**Key props:**

| Prop                      | Type                                                                | Notes                                                                         |
| ------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `target`                  | `React.RefObject<HTMLElement> \| HTMLElement \| string \| string[]` | required                                                                      |
| `content`                 | `React.ReactNode`                                                   | required for the tooltip to render at all                                     |
| `position`                | `"top" \| "bottom" \| "left" \| "right"`                            | default `"right"`                                                             |
| `event`                   | `"hover" \| "focus" \| "both"`                                      | default `"hover"`                                                             |
| `showDelay` / `hideDelay` | `number`                                                            | milliseconds, default `0`                                                     |
| `closeOnEscape`           | `boolean`                                                           | default `false`; wired through `react-core`'s priority-aware Escape mechanism |

```tsx
const anchorRef = useRef<HTMLSpanElement>(null);
<span ref={anchorRef}>Hover me</span>
<UTooltip target={anchorRef} content="More info" position="top" />
```

**Accessibility:** the created panel has `role="tooltip"`; it appears on hover and (with `event="focus"` or `"both"`) keyboard focus, so keyboard-only users can trigger it too; see the `aria-describedby` behavior above.

## Dependencies

Depends on `@ultimate/react-core`, `@ultimate/uix-motion`, `@ultimate/uix-styled`, `@ultimate/uix-utils` (workspace). Peers on `react` and `react-dom` (`^17.0.0 || ^18.0.0 || ^19.0.0`).

## Provenance

See `docs/architecture/PROVENANCE.md` (PrimeReact entry) and `docs/architecture/provenance/react.json` for the full file-level incorporation record.
