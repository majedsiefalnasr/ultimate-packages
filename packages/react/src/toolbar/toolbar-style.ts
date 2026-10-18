/**
 * Ultimate-owned adaptation of PrimeReact's `Toolbar` style (real source:
 * `components/lib/toolbar/ToolbarBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/toolbar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 *
 * W1 (ADR-067, Option B): the colours, border, radius, gap and padding come from
 * the Aura `toolbar.*` tokens through `dt()`, resolved by `useComponentStyle`'s
 * `css` tag; there are no literal fallbacks. The rules mirror Ultimate's Vue
 * Toolbar style (`packages/vue/src/toolbar/toolbar-style.ts`), the applicable
 * `@primeuix/styles` 2.0.3 structural CSS.
 */
const css = /*css*/ `
.u-toolbar{display: flex;align-items: center;justify-content: space-between;flex-wrap: wrap;padding: dt('toolbar.padding');background: dt('toolbar.background');border: 1px solid dt('toolbar.border.color');color: dt('toolbar.color');border-radius: dt('toolbar.border.radius');gap: dt('toolbar.gap');}
.u-toolbar-start, .u-toolbar-center, .u-toolbar-end{display: flex;align-items: center;}
`;

const classes = {
  root: "u-toolbar u-component",
  start: "u-toolbar-start",
  center: "u-toolbar-center",
  end: "u-toolbar-end",
};

/** `useComponentBase`-shaped style module for `UToolbar`. */
export const toolbarStyleModule = { css, classes };
