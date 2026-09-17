import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `RadioButtonBase` CSS classes
 * (see `.vendor-extracted/react/radiobutton/RadioButtonBase.js`), hand-
 * authored inline — matching the same 100%-local pattern React's own
 * `checkbox-style.ts`/`button-style.ts`/`badge-style.ts` already establish
 * (React never imports `@ultimate/uix-styles` for ordinary form/display
 * components — only `table`/`scroller`/`paginator` do, per those
 * components' own much larger CSS surface). Structural shape (root/box/icon,
 * checked/disabled modifiers) mirrors real `RadioButtonBase.js`'s own
 * `classes.root`/`classes.box`/`classes.icon`, renamed `p-radiobutton*` ->
 * `u-radio-button*`.
 */
const css = /*css*/ `
.u-radio-button { position: relative; display: inline-flex; user-select: none; vertical-align: bottom; }
.u-radio-button-box { display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.u-radio-button-input { cursor: pointer; position: absolute; opacity: 0; inset: 0; margin: 0; border-radius: 50%; }
.u-radio-button-icon { border-radius: 50%; }
`;

const classes = {
  root: (params: { checked?: boolean } = {}) => [
    "u-radio-button u-component",
    { "u-radio-button-checked": params.checked },
  ],
  box: (params: { checked?: boolean } = {}) => [
    "u-radio-button-box",
    { "u-radio-button-box-checked": params.checked },
  ],
  input: "u-radio-button-input",
  icon: "u-radio-button-icon",
};

export const radioButtonStyleModule: StyleModule = { css, classes };
