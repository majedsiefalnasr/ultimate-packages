/**
 * Ultimate-owned adaptation of PrimeNG's `IconFieldStyle` + `InputIconStyle`
 * (see `.vendor-extracted/ng/iconfield/style/iconfieldstyle.ts` and
 * `.vendor-extracted/ng/inputicon/style/inputiconstyle.ts`; CSS body sourced
 * from `.vendor-extracted/uix-styles-full/src/iconfield/index.ts` — the real
 * `@primeuix/styles/iconfield` module, which also defines `.p-inputicon`
 * itself; real `InputIconStyle` carries `classes` only, no own `style`
 * string, confirming InputIcon's CSS is entirely owned by IconField's style
 * module). Bundled as one file per this batch's established
 * "two Prime directories, one canonical capability" convention. Hand-ported
 * directly: no `@ultimate/uix-styles/icon-field` subpath exists yet and this
 * task may not add one. `.p-iconfield`/`.p-inputicon` selectors renamed to
 * `.u-icon-field`/`.u-input-icon`.
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

    .u-icon-field:has(.u-inputfield-sm) .u-input-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .u-icon-field:has(.u-inputfield-lg) .u-input-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`;

/** `UBaseComponent`-shaped style module for `UIconField` — owns the shared `.u-icon-field`/`.u-input-icon` CSS. */
export const iconFieldStyleModule = {
  css,
  classes: {
    root: "u-icon-field",
  },
};

/**
 * `UBaseComponent`-shaped style module for `UInputIcon` — classes only, no
 * own `css` string (registers an empty style body), matching real
 * `InputIconStyle`'s own `classes`-only shape exactly: `.u-input-icon`'s
 * rules are owned by `iconFieldStyleModule.css` above, registered whenever
 * an `UIconField` mounts (always the case, since `UInputIcon` has no
 * standalone use documented in real source either).
 */
export const inputIconStyleModule = {
  css: "",
  classes: {
    root: "u-input-icon",
  },
};
