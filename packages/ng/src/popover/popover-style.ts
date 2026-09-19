/**
 * Ultimate-owned adaptation of PrimeNG's `PopoverStyle` (see
 * `.vendor-extracted/ng/popover/popover.ts` / `style/popoverstyle.ts`),
 * shaped to match `UBaseComponent`'s `styleModule: {css, classes}` contract.
 * No `@ultimate/uix-styles/popover` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `tieredMenuStyleModule`).
 */
const css = /*css*/ `
.u-popover { position: absolute; top: 0; left: 0; }
.u-popover-content { position: relative; }
`;

const classes = {
  root: () => ["u-popover u-component"],
  content: "u-popover-content",
};

/** `UBaseComponent`-shaped style module for `UPopover`. */
export const popoverStyleModule = { css, classes };
