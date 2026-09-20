import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `InputMaskStyle`. Real upstream
 * `InputMaskStyle.js` (extracted this session) carries NO `@primeuix/styles`
 * import and NO own CSS — it only declares a `root` class resolver
 * (`p-inputmask` + conditional `p-filled`) and visually renders a nested
 * `InputText`, inheriting InputText's own CSS entirely. This module follows
 * that same real shape: no own `css` block beyond a thin `.u-input-mask`
 * wrapper selector, reusing `input-text-style.ts`'s `.u-input-text` token
 * CSS for the actual visual styling of the underlying input (InputMask
 * renders as `UInputText` internally, matching real source's own
 * `<InputText ... />` render, not a from-scratch input).
 */
const css = /*css*/ `
    .u-input-mask {
        display: inline-block;
    }
`;

const classes = {
  root: "u-input-mask",
};

export const inputMaskStyleModule: StyleModule = { css, classes };
