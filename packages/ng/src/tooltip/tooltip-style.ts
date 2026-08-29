import { style as tooltipStyle } from "@ultimate/uix-styles/tooltip";

/**
 * Ultimate-owned adaptation of PrimeNG's `TooltipStyle` (see
 * `.vendor-extracted/ng/tooltip/style/tooltipstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract (Task 4's
 * `base-component.spec.ts` — a plain object field, not an `@Injectable`
 * service; upstream's own `BaseStyle` subclass DI-injects itself via
 * `_componentStyle = inject(TooltipStyle)`, but this project's scoped-down
 * Option B architecture does not — see `ButtonStyle`, Task 12's
 * `button-style.ts`, for the same established pattern).
 *
 * Per Task 3's corrected finding that `@primeuix/styles` (this project's
 * `@ultimate/uix-styles`) never exports a `classes` object, this package's
 * `@ultimate/uix-styles/tooltip` subpath exports only `style` (verified:
 * `packages/uix-styles/src/tooltip/index.ts`) — the `classes` class-name-slot
 * resolver is ported here instead, locally, from the extracted reference
 * file's own `const classes = {...}`, with `.p-tooltip*` selectors renamed
 * to `.u-tooltip*`.
 *
 * Upstream's `classes.root` is the static string `'p-tooltip p-component'`
 * (no params, no resolver function) — ported as-is here (`'u-tooltip
 * u-component'`), matching `UBaseComponent.cx()`'s contract that a
 * `classes[key]` entry may be either a plain value or a `(params) => ...`
 * function (see `packages/ng-core/src/basecomponent/base-component.ts`'s
 * `cx()`: `typeof resolver === "function" ? resolver(params) : resolver`).
 */
const css = /*css*/ `
    ${tooltipStyle}
`;

/**
 * Class-name-slot resolver for `UTooltip`, ported from the extracted
 * `TooltipStyle`'s own `classes` object (`.p-tooltip*` renamed to
 * `.u-tooltip*`).
 */
const classes = {
  root: "u-tooltip u-component",
  arrow: "u-tooltip-arrow",
  text: "u-tooltip-text",
};

/** `UBaseComponent`-shaped style module for `UTooltip`. */
export const tooltipStyleModule = { css, classes };
