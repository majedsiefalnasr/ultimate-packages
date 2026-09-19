/**
 * Ultimate-owned adaptation of PrimeVue's `PopoverStyle` (see
 * `.vendor-extracted/vue/popover/Popover.vue` / `BasePopover.vue`), shaped
 * to match `createBaseComponent`'s `styleModule: {css, classes}` contract.
 * No `@ultimate/uix-styles/popover` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as other Overlay-family components).
 */
const css = /*css*/ `
.u-popover { position: absolute; top: 0; left: 0; }
.u-popover-content { position: relative; }
`;

const classes = {
  root: () => ["u-popover u-component"],
  content: "u-popover-content",
};

/** `createBaseComponent`-shaped style module for `UPopover`. */
export const popoverStyleModule = { css, classes };
