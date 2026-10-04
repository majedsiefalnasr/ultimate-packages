# @ultimate/vue-core

Vue-specific foundation for the Ultimate Platform: Options-API base component architecture, directive infrastructure, overlay/focus-trap/escape/scroll/motion infrastructure, and icons.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

`vue-core`'s `createBaseComponent` is **Option B**: informed by PrimeVue's own `BaseComponent.vue` pattern, but independently authored and deliberately scoped down. It covers class-name-slot resolution (`cx()`) and one-time-per-`componentName` style registration against a module-level `VueStyleSheet` instance only — an Options-API mixin factory, not a class (unlike Angular's `ng-core`) and not a hook (unlike React's `react-core`).

PrimeVue's full passthrough (`pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo`) system and `inject: { $parentInstance }` host-lookup are explicitly excluded — same posture as Angular's `ng-core` (ADR-018), `react-core` (ADR-024), and `vue-core`'s own ADR-032. Directives (`v-focustrap`) use a genuinely separate mechanism (`createDirective`, ADR-033) since Vue's directive lifecycle hooks differ structurally from a component's `extends:`-consumed mixin chain — this is not true of Angular's or React's foundation tier, which have no equivalent native-directive concept. See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/vue-core.json` for the full provenance record.

## Modules

- `base` — `createBaseComponent({ componentName, styleModule })` (an Options-API mixin factory, `extend:`-consumed by every component's own `Base*.ts`), `createBaseEditableHolder()` (v-model/controlled-uncontrolled contract, `@primevue/forms` integration excluded per ADR-039), `createBaseInput()` (the real verified `size`/`fluid`/`variant` intermediate tier).
- `directive` — `createDirective({ name, hooks })`, a separate factory (not `extends:`-consumed) returning a real Vue `ObjectDirective` — the mechanism `v-focustrap`/`v-tooltip`/`v-ripple` are all built on (ADR-033, ADR-034).
- `overlay` — `Portal`, a thin wrapper around native `<Teleport>` (an `inline` escape hatch for `disabled`/`appendTo="self"`, SSR-guarded via a `mounted` flag).
- `escape` — `createGlobalEscapeKeyMixin`/`useDisplayOrder`, a thin Vue adapter over `@ultimate/uix-utils/escape`'s shared priority-tuple registry (extracted from `react-core` during Phase 4's prerequisite work, ADR-036) — NOT a `react-core` dependency. Consumed by `UDialog` only; `UMenu`'s Escape handling is intentionally its own local mechanism (ADR-037).
- `zindex` — `useZIndex()` → `{ set, clear }`, a thin wrapper over `@ultimate/uix-utils`'s `ZIndex` singleton. Verified real keys: `modal` (Dialog), `menu` (Menu), `tooltip` (Tooltip).
- `focus-trap` — `focusTrapDirective` (`v-focustrap`), a Vue custom directive (not a component, ADR-034) using the sentinel-span technique plus a `MutationObserver` for dynamic-content focus redirection (ADR-035, a real capability neither `ng-core`'s nor `react-core`'s FocusTrap has). Does not restore focus on unmount — `UDialog`'s own responsibility.
- `scroll-lock` — `useScrollLock()` → `{ register, unregister }`, a thin Vue wrapper over `@ultimate/uix-utils/scroll-lock`'s shared refcounted registry (ADR-036).
- `motion` — `createMotionTransitionHooks(getOptions)`, wiring `@ultimate/uix-motion`'s `createMotion` into Vue's native `<transition>` hook-callback shape (`@enter`/`@leave` with a `done` callback) — a materially different call-site mechanism from Angular's `effect()` or React's `useEffect`, calling the same underlying framework-agnostic primitive.
- `styling` — `VueStyleSheet` (Vue-only `StyleSheet` subclass delegating to `@ultimate/uix-utils/dom`'s `createStyleElement`), `registerComponentStyle(componentName, styleModule)` (called from `createBaseComponent`'s `mounted()` hook).
- `icons` — six standalone icon components (`SpinnerIcon`, `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `CheckIcon`, `MinusIcon`), each rendering its own inline `<svg role="img">`, matching `ng-core`'s/`react-core`'s established icon pattern. `MinusIcon` was added to close a gap identified while wiring `UCheckbox`'s indeterminate state (its only current consumer).

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
- **Passthrough** — PrimeVue's full `pt`/`ptOptions`/`ptm`/`ptmi`/`ptmo` system excluded entirely from both the component-mixin and directive-factory mechanisms (Option B, ADR-032/033).
- **Forms** — `@primevue/forms` excluded, a deliberate cut of a real, working PrimeVue feature (ADR-039).

## Dependencies

Depends on `@ultimate/uix-utils`, `@ultimate/uix-styled`, and `@ultimate/uix-motion` (workspace). Peers on `vue` (`^3.5.2`, Ultimate's supported floor; see ADR-050).
