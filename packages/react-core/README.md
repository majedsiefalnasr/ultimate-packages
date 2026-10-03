# @ultimate/react-core

React-specific foundation for the Ultimate Platform: base component architecture, overlay/focus-trap/escape/scroll/motion infrastructure, and icons.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

`react-core`'s `useComponentBase` hook is **Option B**: informed by PrimeReact's own `ComponentBase.js` pattern, but independently authored and deliberately scoped down. It covers class-name-slot resolution (`cx()`) and one-time-per-`componentName` style registration against a module-level `StyleSheet` instance only.

PrimeReact's full passthrough (`pt`/`ptm`/`ptmo`) system (~150 lines of resolution logic in `ComponentBase.js`) is explicitly excluded — same posture as Angular's `ng-core` (ADR-018) and `react-core`'s own ADR-024. See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/react-core.json` for the full provenance record.

## Modules

- `base` — `useComponentBase({ componentName, styleModule })`, the hook every `react` component calls: registers the component's `StyleModule` (`{ css, classes }`) with the shared `reactCoreStyleSheet` singleton exactly once per `componentName` (via `useComponentStyle`'s mount-effect guard), and returns `{ cx }`, a class-name-slot resolver (`cx(key, params?) => string | undefined`) that looks up `styleModule.classes[key]` — a plain string or a `(params?) => ClassValue` function — and resolves it through `@ultimate/uix-utils`'s `classNames`. `ClassValue` is `string | Record<string, boolean | undefined> | (string | Record<string, boolean | undefined>)[]`.
- `hooks` — shared utility hooks consumed throughout `react-core` and every `react` component: `useMergeProps`, `useMountEffect`/`useUnmountEffect` (run-once-on-mount/unmount, `useEffect(fn, [])` wrappers), `useUpdateEffect` (skips the first render), `usePrevious`, `useEventListener` (target/type/listener/`when`-gated bind/unbind pair, stabilizes the actually-attached listener behind a ref so `unbind()` always removes what `bind()` attached regardless of the caller's current-render closure identity), and `useResizeListener` (a thin `window`-resize delegate over `useEventListener`).
- `overlay` — `Portal` (`element`/`appendTo`/`visible`/`onMount` props; renders into `document.body`, a given `HTMLElement`, or in-place via `appendTo="self"`, guarded for SSR via a mount-effect) and `useOverlayListener` (`{target, overlay, listener, when}` → `[bind, unbind]`; combines an outside-click document listener with a window-resize listener behind one bind/unbind pair, used by popup `UMenu` to detect dismiss-worthy interactions — the only current consumer; `UDialog` and `UTooltip` do not use it).
- `escape` — `useGlobalEscapeKey`/`useDisplayOrder`/`ESCAPE_PRIORITIES`: a single shared `document` `keydown` listener gated by a two-level `[primary, secondary]` priority tuple map, where only the highest-priority, most-recently-displayed registrant's callback fires on Escape. `ESCAPE_PRIORITIES` (`TOOLTIP: 1200`, `MENU: 500`, `DIALOG: 300`) mirrors verified PrimeReact numeric values. This mechanism is **independently reimplemented, not ported**, and is verifiably more correct than Angular's current `UDialog` Escape handling: `ng`'s `UDialog` uses a plain, unconditional `keydown.escape` host listener with no real multi-overlay stacking order (an accepted, documented limitation — see ADR-020). `react-core`'s priority-queue mechanism closes that gap for React specifically; it does not retroactively fix Angular's implementation, which remains tracked separately (see ADR-026).
- `zindex` — `useZIndex()` → `{ set, clear }`, a thin wrapper over `@ultimate/uix-utils`'s `ZIndex` singleton. `Z_INDEX_BUCKETS` (`modal: 1100`, `overlay: 1000`, `menu: 1000`, `tooltip: 1100`, `toast: 1200`) mirrors verified PrimeReact default values — direct reuse, no redesign.
- `focus-trap` — `FocusTrap`, a component (not a directive, unlike Angular's `ng-core` `UFocusTrap` attribute directive `[uFocusTrap]`) that wraps its `children` between two invisible, `tabIndex={0}` sentinel `<span>`s. Tabbing past the last real focusable descendant lands on the trailing sentinel, which redirects focus back to the first focusable element (and vice versa for the leading sentinel), using `@ultimate/uix-utils`'s `getFirstFocusableElement`/`getLastFocusableElement`. This sentinel-span mechanism matches verified upstream PrimeReact `FocusTrap.js` (not keydown interception) — see ADR-025. Supports `autoFocus`, `disabled`, and selector overrides (`autoFocusSelector`, `firstFocusableSelector`).
- `scroll-lock` — `useScrollLock()` → `{ register, unregister }`, a private, module-scoped `Set`-based registry coordinating body-scroll blocking across multiple simultaneous overlay instances (scroll stays blocked as long as at least one id is registered). This replaces PrimeReact's verified `document.primeDialogParams` global-mutation pattern with an encapsulated alternative — no property added to `document`.
- `motion` — `useMotion(elementRef, visible, options?)`, a React lifecycle wrapper around `@ultimate/uix-motion`'s imperative, Promise-based `createMotion(element, options)`: calls `.enter()`/`.leave()` on visibility change and `.cancel()` on unmount. **No `react-transition-group` dependency** — verified upstream PrimeReact `CSSTransition.js` wraps the real `react-transition-group` npm package; `react-core` reuses the already-framework-agnostic `@ultimate/uix-motion` package instead, so no new runtime dependency was introduced for motion in this package (see ADR-028).
- `styling` — `ReactStyleSheet` (in `react-style-sheet.ts`), a React-only subclass of `@ultimate/uix-styled`'s `StyleSheet<HTMLStyleElement>` overriding `createStyleElement` to delegate to `@ultimate/uix-utils/dom`'s `createStyleElement(css, attrs, document.head)`, SSR-guarded (`typeof document === "undefined"` returns `undefined`). A single module-level instance, `reactCoreStyleSheet`, mirrors Angular's `ngCoreStyleSheet` singleton pattern. `useComponentStyle(componentName, styleModule)` is the mount-effect hook that registers a component's CSS with this singleton exactly once per name (`has()`/`add()` guard). This closes a real gap found during this phase's research: Angular's own `ngCoreStyleSheet` equivalent has an independently-tracked styling gap (not fixed by Phase 3 — recorded as a Phase 2 follow-up instead), while React gets a working DOM-injection adapter from day one (see ADR-029).
- `icons` — five standalone icon components, each rendering its own inline `<svg role="img">`: `USpinnerIcon` (used by `UButton`'s loading state), `UTimesIcon` (used by `UDialog`'s close button), `UCheckIcon` (used by `UCheckbox`'s checked state), `UWindowMaximizeIcon`, and `UWindowMinimizeIcon` (ported for provenance completeness — verified upstream PrimeReact `Dialog.js` imports both, but no Phase 3 component renders a maximize/minimize toggle; not currently consumed by any `react` component). All share a base `IconProps` shape (`className`, `spin`, etc.) matching the individual icon's own prop surface.

## Usage

```tsx
import { useComponentBase, type StyleModule } from "@ultimate/react-core";

const exampleStyleModule: StyleModule = {
  css: ".u-example-root { }",
  classes: { root: () => "u-example-root" },
};

function Example() {
  const { cx } = useComponentBase({ componentName: "example", styleModule: exampleStyleModule });
  return <div className={cx("root")} />;
}
```

### Server rendering and styles

Component styles are injected on the client only: they are registered on
first mount into the document `<head>`. Server-rendered HTML therefore
contains no component CSS, and markup is unstyled until hydration
(accepted; matches PrimeReact 10.9.9). Angular
(`@ultimate/ng-core`) differs: it writes styles into the per-request
document during server rendering and adopts them on hydration (GAP-078).

## Intentional deviations (spec §32)

- **Escape handling** — preserved behavior, independently reimplemented (not ported) in `react-core`; verifiably more correct than Angular's current `UDialog` Escape handling (see `escape` above, ADR-020, ADR-026).
- **FocusTrap** — sentinel-span mechanism preserved, Ultimate-owned implementation reusing existing `getFirstFocusableElement`/`getLastFocusableElement` (see `focus-trap` above, ADR-025).
- **Motion** — `@ultimate/uix-motion`'s `createMotion` used instead of `react-transition-group`'s `CSSTransition` — no new runtime dependency (see `motion` above, ADR-028).
- **Styling** — `@ultimate/uix-styled`'s `StyleSheet` class plus a new React-only subclass adapter (`ReactStyleSheet`) delegating to `@ultimate/uix-utils/dom`'s `createStyleElement`, instead of PrimeReact's `useStyle` hook (see `styling` above, ADR-029).
- **Passthrough** — PrimeReact's full `pt`/`ptm`/`ptmo` system is excluded entirely (Option B, same posture as Angular's ADR-018) — see `base` above, ADR-024.
- **Dialog scroll registry** — a private, module-scoped `Set`-based registry replaces PrimeReact's `document.primeDialogParams` global-mutation pattern (see `scroll-lock` above).

## Dependencies

Depends on `@ultimate/uix-utils`, `@ultimate/uix-styled`, and `@ultimate/uix-motion` (workspace). Peers on `react` and `react-dom` (`^17.0.0 || ^18.0.0 || ^19.0.0`).
