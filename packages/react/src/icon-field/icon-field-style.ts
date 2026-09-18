import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS, no `dt()` tokens, matching `date-picker-style.ts`'s
 * established React convention. Selector names verified against real
 * source: PrimeReact's own `IconFieldBase`/`InputIconBase` render
 * `p-icon-field`/`p-input-icon` (hyphenated — a real, verified naming
 * difference from Angular/Vue's `p-iconfield`/`p-inputicon`), while the
 * shared `@primeuix/styles/iconfield` CSS module itself still targets
 * `.p-iconfield`/`.p-inputicon` (see
 * `.vendor-extracted/uix-styles-full/src/iconfield`). This realization
 * renders `u-icon-field`/`u-input-icon` (matching React's own hyphenated
 * className convention) and this CSS module targets those same selectors,
 * so the rules actually apply to what the component renders.
 */
const css = /*css*/ `
.u-icon-field { position: relative; display: block; }
.u-input-icon {
  position: absolute;
  top: 50%;
  margin-top: -0.5rem;
  color: #6b7280;
  line-height: 1;
  z-index: 1;
}
.u-icon-field .u-input-icon:first-child { inset-inline-start: 0.75rem; }
.u-icon-field .u-input-icon:last-child { inset-inline-end: 0.75rem; }
.u-icon-field .u-input-text:not(:first-child) { padding-inline-start: 2.25rem; }
.u-icon-field .u-input-text:not(:last-child) { padding-inline-end: 2.25rem; }
`;

const classes = {
  root: (params: { iconPosition?: "left" | "right" } = {}) => [
    "u-icon-field",
    {
      "u-icon-field-left": params.iconPosition === "left",
      "u-icon-field-right": params.iconPosition === "right",
    },
  ],
};

/** `useComponentBase`-shaped style module for `UIconField` — owns the shared `.u-icon-field`/`.u-input-icon` CSS. */
export const iconFieldStyleModule: StyleModule = { css, classes };

/**
 * `useComponentBase`-shaped style module for `UInputIcon` — classes only,
 * empty `css` string (matching real `InputIconBase.js`'s own `classes`-only
 * shape, no own `styles`): `.u-input-icon`'s rules are owned by
 * `iconFieldStyleModule.css` above, registered whenever a `UIconField`
 * mounts, avoiding double-registration of the same CSS under two different
 * `componentName` keys.
 */
export const inputIconStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-icon" },
};
