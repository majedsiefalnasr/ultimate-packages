# @ultimate/vue-core

Vue-specific foundation for the Ultimate Platform: Options-API base component architecture, directive infrastructure, overlay/focus-trap/escape/scroll/motion infrastructure, and icons.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

`vue-core`'s `createBaseComponent` is **Option B**: informed by PrimeVue's own `BaseComponent.vue` pattern, but independently authored and deliberately scoped down. It covers class-name-slot resolution (`cx()`), one-time-per-`componentName` style registration against a module-level `VueStyleSheet` instance, and the instance-level passthrough mixin (ADR-077) — an Options-API mixin factory, not a class (unlike Angular's `ng-core`) and not a hook (unlike React's `react-core`).

Directives (`v-focustrap`) use a genuinely separate mechanism (`createDirective`, ADR-033) since Vue's directive lifecycle hooks differ structurally from a component's `extends:`-consumed mixin chain — this is not true of Angular's or React's foundation tier, which have no equivalent native-directive concept. They do not take `pt`. See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/vue-core.json` for the full provenance record.

### Passthrough

`createBaseComponent` mixes in `createPassThroughMixin(componentName, hostName?)`, which adds two props, `pt` and `ptOptions`, and three methods:

- `ptm(key, params?)` returns the attributes of section `key`, plus `data-pc-name` and `data-pc-section`. Bind them with `v-bind="ptm('header')"`.
- `ptmi(key, params?)` is `ptm` merged with the component's own `$attrs` (without `pt`). Bind it on the root element: `v-bind="ptmi('root')"`.
- `ptmo(obj, key, params?)` reads an explicit passthrough object instead of the `pt` prop.
- `pt` is an object of sections. A section value is an attribute object, a string that becomes the `class`, or a function of `{ instance, props, state, attrs, parent, ... }`. Keys match without regard to case, dashes or underscores, and `a.b` reaches a nested section. A `pt:section:attribute` attribute on the component (`pt:root:class="..."`) feeds the same sections.
- `ptOptions` holds `mergeSections` and `mergeProps`. They decide how a global section value and the instance value merge. A global source is not built yet (ADR-080), so `ptOptions` has no visible effect today.
- Every instance provides itself as `$parentInstance` and injects the nearest one. `createBaseComponent({ hostName })` walks up to the instance with that component name. `pt` functions read the result as `parent.instance` (ADR-079).

Not built (ADR-080): the global and default `pt` from the plugin options, `usePassThrough`, `pt.hooks`, the `$attrSelector` attribute (scoped `dt`), and the `id` fallback of `ptmi`.

## Modules

- `base` — `createBaseComponent({ componentName, styleModule })` (an Options-API mixin factory, `extend:`-consumed by every component's own `Base*.ts`), `createBaseEditableHolder()` (v-model/controlled-uncontrolled contract, `@primevue/forms` integration excluded per ADR-039), `createBaseInput()` (the real verified `size`/`fluid`/`variant` intermediate tier).
- `directive` — `createDirective({ name, hooks })`, a separate factory (not `extends:`-consumed) returning a real Vue `ObjectDirective` — the mechanism `v-focustrap`/`v-tooltip`/`v-ripple` are all built on (ADR-033, ADR-034).
- `overlay` — `Portal`, a thin wrapper around native `<Teleport>` (an `inline` escape hatch for `disabled`/`appendTo="self"`, SSR-guarded via a `mounted` flag).
- `escape` — `createGlobalEscapeKeyMixin`/`useDisplayOrder`, a thin Vue adapter over `@ultimate/uix-utils/escape`'s shared priority-tuple registry (extracted from `react-core` during Phase 4's prerequisite work, ADR-036) — NOT a `react-core` dependency. Consumed by `UDialog` only; `UMenu`'s Escape handling is intentionally its own local mechanism (ADR-037).
- `zindex` — `useZIndex()` → `{ set, clear }`, a thin wrapper over `@ultimate/uix-utils`'s `ZIndex` singleton. Verified real keys: `modal` (Dialog), `menu` (Menu), `tooltip` (Tooltip).
- `focus-trap` — `focusTrapDirective` (`v-focustrap`), a Vue custom directive (not a component, ADR-034) using the sentinel-span technique plus a `MutationObserver` for dynamic-content focus redirection (ADR-035, a real capability neither `ng-core`'s nor `react-core`'s FocusTrap has). Does not restore focus on unmount — `UDialog`'s own responsibility.
- `scroll-lock` — `useScrollLock()` → `{ register, unregister }`, a thin Vue wrapper over `@ultimate/uix-utils/scroll-lock`'s shared refcounted registry (ADR-036).
- `motion` — `createMotionTransitionHooks(getOptions)`, wiring `@ultimate/uix-motion`'s `createMotion` into Vue's native `<transition>` hook-callback shape (`@enter`/`@leave` with a `done` callback) — a materially different call-site mechanism from Angular's `effect()` or React's `useEffect`, calling the same underlying framework-agnostic primitive.
- `styling` — `VueStyleSheet` (Vue-only `StyleSheet` subclass delegating to `@ultimate/uix-utils/dom`'s `createStyleElement`), `registerComponentStyle(componentName, styleModule, additionalPresetKeys?)` (called from `createBaseComponent`'s `mounted()` hook; the optional `additionalPresetKeys` also registers the theme variables of further Aura preset keys the component's CSS consumes, never structural CSS under them — ADR-051).
- `icons` — six standalone icon components (`SpinnerIcon`, `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `CheckIcon`, `MinusIcon`), each rendering its own inline `<svg role="img">`, matching `ng-core`'s/`react-core`'s established icon pattern. `MinusIcon` was added to close a gap identified while wiring `UCheckbox`'s indeterminate state (its only current consumer).

## Per-instance `unstyled` and `dt`

The base component declares the `unstyled` and `dt` props, so every component that extends it inherits them with no per-component code (ADR-085):

- `unstyled` — a boolean, default `undefined`. The computed `isUnstyled` is the prop. While it is true, `cx()` returns `undefined` and the instance registers only the shared base rules. There is no global fallback yet, because Ultimate Vue has no config plugin.
- `dt` — an object of token overrides scoped to the instance. It is written when the component mounts, rewritten when `dt` or the theme changes, and removed when `dt` is cleared or the component unmounts. The instance carries a `pcN` attribute while `dt` is set.
- A template that builds a class list must filter the `cx()` result instead of concatenating it with a string.

## Usage

```typescript
import { createBaseComponent, type StyleModule } from "@ultimate/vue-core";

const exampleStyleModule: StyleModule = {
  css: ".u-example-root { }",
  classes: { root: () => "u-example-root" },
};

export default {
  name: "UExample",
  extends: createBaseComponent({ componentName: "example", styleModule: exampleStyleModule }),
  template: `<div :class="cx('root')" />`,
};
```

### Server rendering and styles

Component styles are injected on the client only: they are registered on
first mount into the document `<head>`. Server-rendered HTML therefore
contains no component CSS, and markup is unstyled until hydration
(accepted; matches PrimeVue 4.5.5). Angular
(`@ultimate/ng-core`) differs: it writes styles into the per-request
document during server rendering and adopts them on hydration (GAP-078).

## Intentional deviations (spec §32)

- **Base architecture** — Options-API `extends` mixin, preserving PrimeVue's own structural mechanism, independently authored (ADR-032).
- **Directive factory** — a separate mechanism from the component mixin, matching Vue's own component/directive distinction (ADR-033).
- **FocusTrap/Tooltip/Ripple** — Vue custom directives, not components, matching verified upstream artifact shape exactly (ADR-034). FocusTrap's `MutationObserver` dynamic-content handling carried forward (ADR-035).
- **Escape** — extracted to shared `@ultimate/uix-utils/escape`, consumed via a thin adapter, not a `react-core` dependency (ADR-036).
- **Scroll-lock** — extracted to shared `@ultimate/uix-utils/scroll-lock` in full (ADR-036).
- **Passthrough** — the instance-level `pt`/`ptOptions` mixin is built for components (ADR-077/079/080); the global `pt` source, `usePassThrough` and `pt.hooks` are not built, and directives do not take `pt` — see the Passthrough section above.
- **Forms** — `@primevue/forms` excluded, a deliberate cut of a real, working PrimeVue feature (ADR-039).

## Dependencies

Depends on `@ultimate/uix-utils`, `@ultimate/uix-styled`, and `@ultimate/uix-motion` (workspace). Peers on `vue` (`^3.5.2`, Ultimate's supported floor; see ADR-050).
