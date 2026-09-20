import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `IconFieldStyle` + `InputIconStyle`
 * (see `.vendor-extracted/vue/iconfield/style/IconFieldStyle.js` and
 * `.vendor-extracted/vue/inputicon/style/InputIconStyle.js`; CSS body
 * sourced from `.vendor-extracted/uix-styles-full/src/iconfield/index.ts` —
 * the real `@primeuix/styles/iconfield` module, which also defines
 * `.p-inputicon` itself; real `InputIconStyle` carries `classes` only, no
 * own `style` string, confirming InputIcon's CSS is entirely owned by
 * IconField's style module). Bundled as one file per this batch's
 * established "two Prime directories, one canonical capability" convention.
 * Hand-ported directly: no `@ultimate/uix-styles/icon-field` subpath exists
 * yet and this task may not add one. `.p-iconfield`/`.p-inputicon`
 * selectors renamed to `.u-icon-field`/`.u-input-icon`.
 */
const css = /*css*/ `
    .u-icon-field {
        position: relative;
        display: block;
    }

    .u-input-icon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .u-icon-field .u-input-icon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .u-icon-field .u-input-icon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .u-icon-field .u-input-text:not(:first-child),
    .u-icon-field .u-inputwrapper:not(:first-child) .u-input-text {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-icon-field .u-input-text:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }
`;

/** `createBaseComponent`-shaped style module for `UIconField` — owns the shared `.u-icon-field`/`.u-input-icon` CSS. */
export const iconFieldStyleModule: StyleModule = {
  css,
  classes: { root: "u-icon-field" },
};

/**
 * `createBaseComponent`-shaped style module for `UInputIcon` — classes
 * only, no own `css` string, matching real `InputIconStyle`'s own
 * `classes`-only shape exactly.
 */
export const inputIconStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-icon" },
};
