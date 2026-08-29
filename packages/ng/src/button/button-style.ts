import { style as buttonStyle } from "@ultimate/uix-styles/button";

/**
 * Ultimate-owned adaptation of PrimeNG's `ButtonStyle` (see
 * `.vendor-extracted/ng/button-style/buttonstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract (Task 4's
 * `base-component.spec.ts` — a plain object field, not an `@Injectable`
 * service; PrimeNG's own `BaseComponent` DI-injects its style service via
 * `_componentStyle = inject(ButtonStyle)`, but this project's scoped-down
 * Option B architecture does not).
 *
 * Per Task 3's corrected finding that `@primeuix/styles` never exports a
 * `classes` object, this package's `@ultimate/uix-styles/button` subpath
 * exports only `style` (verified: `packages/uix-styles/src/button/index.ts`)
 * — the `classes` class-name-slot resolver is ported here instead, locally,
 * from the extracted reference file's own `const classes = {...}`, with
 * `.p-button*` selectors renamed to `.u-button*`.
 *
 * The extracted `classes.root`/`classes.icon` resolvers take `({ instance })`
 * and read PrimeNG's `instance.buttonProps?.x` passthrough-fallback pattern
 * — dropped here since Phase 2's `UButton` has no passthrough/`pt` system
 * per Task 4's scoped-down `UBaseComponent`. This also means the resolvers
 * here take a plain params object directly, matching
 * `UBaseComponent.cx(key, params)`'s real call contract (confirmed against
 * `packages/ng-core/src/basecomponent/base-component.ts`: `cx()` invokes
 * `styleModule.classes[key](params)` with whatever flat params object the
 * caller passes, no `{ instance }` wrapper) — the brief's illustrative
 * `ButtonStyle` sample used an `@Injectable` service with an `{ instance }`
 * wrapper, which does not match this established pattern (also used by
 * `UBadge`'s `badge-style.ts`); adapted to the real, working contract.
 *
 * `classes.spinnerIcon` (extracted source computes it from `instance.cx('icon')`
 * entries) is also dropped: `UButton`'s loading spinner uses `classes.loadingIcon`
 * only, matching this task's spec-mandated test assertions (`u-button-loading`
 * root class + a rendered `<u-spinner-icon>`, no separate spinner-icon class
 * slot in the brief's Interfaces/Step 4 contract).
 */
const css = /*css*/ `
    ${buttonStyle}
`;

/** Params `UButton` passes into `cx('root'|'icon', params)` — see `UBaseComponent.cx()`. */
export interface ButtonClassesParams {
  hasIcon?: boolean;
  label?: string;
  loading?: boolean;
  severity?: string;
  raised?: boolean;
  rounded?: boolean;
  text?: boolean;
  outlined?: boolean;
  size?: "small" | "large";
  fluid?: boolean;
  iconPos?: "left" | "right" | "top" | "bottom";
}

/**
 * Class-name-slot resolver for `UButton`, ported from the extracted
 * `ButtonStyle`'s own `classes` object (`.p-button*` renamed to
 * `.u-button*`, passthrough/`buttonProps` fallbacks dropped).
 */
const classes = {
  root: (params: ButtonClassesParams = {}) => {
    const { hasIcon, label, loading, severity, raised, rounded, text, outlined, size, fluid } =
      params;

    return [
      "u-button u-component",
      {
        "u-button-icon-only": hasIcon && !label,
        "u-button-loading": loading,
        [`u-button-${severity}`]: severity,
        "u-button-raised": raised,
        "u-button-rounded": rounded,
        "u-button-text": text,
        "u-button-outlined": outlined,
        "u-button-sm": size === "small",
        "u-button-lg": size === "large",
        "u-button-fluid": fluid,
      },
    ];
  },
  loadingIcon: "u-button-loading-icon",
  icon: (params: ButtonClassesParams = {}) => {
    const { label, iconPos } = params;

    return [
      "u-button-icon",
      {
        [`u-button-icon-${iconPos}`]: label,
      },
    ];
  },
  label: "u-button-label",
};

/** `UBaseComponent`-shaped style module for `UButton`. */
export const buttonStyleModule = { css, classes };
