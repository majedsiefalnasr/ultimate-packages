import { style as badgeStyle } from "@ultimate/uix-styles/badge";

/**
 * Ultimate-owned adaptation of PrimeNG's `BadgeStyle` (see
 * `.vendor-extracted/ng/badge/style/badgestyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract (Task 4's
 * `base-component.spec.ts` — a plain object field, not an `@Injectable`
 * service; PrimeNG's own `BaseComponent` DI-injects its style service, but
 * this project's scoped-down Option B architecture does not).
 *
 * Per Task 3's corrected finding that `@primeuix/styles` never exports a
 * `classes` object, this package's `@ultimate/uix-styles/badge` subpath
 * exports only `style` (verified: `packages/uix-styles/src/badge/index.ts`)
 * — the `classes` class-name-slot resolver is ported here instead, locally,
 * from the extracted reference file's own `const classes = {...}`, with
 * `.p-badge*` selectors renamed to `.u-badge*`.
 */
const css = /*css*/ `
    ${badgeStyle}
`;

/** Params `UBadge` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface BadgeClassesParams {
  value?: string | number | null;
  size?: string | null;
  badgeSize?: string | null;
  severity?: string | null;
}

/**
 * Class-name-slot resolver for `UBadge`, ported from the extracted
 * `BadgeStyle`'s own `classes.root` function (`.p-badge*` renamed to
 * `.u-badge*`). Takes a plain params object directly, matching
 * `UBaseComponent.cx(key, params)`'s call contract (Task 4) rather than
 * upstream's `{ instance }`-wrapped signature — `UBaseComponent` invokes
 * `styleModule.classes[key](params)` with whatever params the caller passes
 * to `cx()`, with no passthrough/instance wrapper layer.
 */
const classes = {
  root: (params: BadgeClassesParams = {}) => {
    const { value, size, badgeSize, severity } = params;

    return [
      "u-badge",
      {
        "u-badge-circle": value != null && String(value).length === 1,
        "u-badge-dot": value == null,
        "u-badge-sm": size === "small" || badgeSize === "small",
        "u-badge-lg": size === "large" || badgeSize === "large",
        "u-badge-xl": size === "xlarge" || badgeSize === "xlarge",
        "u-badge-info": severity === "info",
        "u-badge-success": severity === "success",
        "u-badge-warn": severity === "warn",
        "u-badge-danger": severity === "danger",
        "u-badge-secondary": severity === "secondary",
        "u-badge-contrast": severity === "contrast",
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UBadge`. */
export const badgeStyleModule = { css, classes };
