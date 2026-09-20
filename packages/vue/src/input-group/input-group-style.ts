import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `InputGroupStyle` +
 * `InputGroupAddonStyle` (see
 * `.vendor-extracted/vue/inputgroup/style/InputGroupStyle.js` and
 * `.vendor-extracted/vue/inputgroupaddon/style/InputGroupAddonStyle.js`; CSS
 * body sourced from
 * `.vendor-extracted/uix-styles-full/src/inputgroup/index.ts` — the real
 * `@primeuix/styles/inputgroup` module, which also defines
 * `.p-inputgroupaddon` itself; real `InputGroupAddonStyle` carries `classes`
 * only, no own `style` string). Bundled as one file, same convention as
 * `icon-field-style.ts`. `.p-inputgroup*`/`.p-iconfield`/`.p-floatlabel`/
 * `.p-iftalabel` selectors renamed to `.u-input-group*`/`.u-icon-field`/
 * `.u-float-label`/`.u-ifta-label`.
 */
const css = /*css*/ `
    .u-input-group,
    .u-input-group .u-icon-field,
    .u-input-group .u-float-label,
    .u-input-group .u-ifta-label {
        display: flex;
        align-items: stretch;
        width: 100%;
    }

    .u-input-group .u-float-label .u-inputwrapper,
    .u-input-group .u-ifta-label .u-inputwrapper {
        display: inline-flex;
    }

    .u-input-group .u-input-text,
    .u-input-group .u-inputwrapper {
        flex: 1 1 auto;
        width: 1%;
    }

    .u-input-group-addon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('inputgroup.addon.padding');
        background: dt('inputgroup.addon.background');
        color: dt('inputgroup.addon.color');
        border-block-start: 1px solid dt('inputgroup.addon.border.color');
        border-block-end: 1px solid dt('inputgroup.addon.border.color');
        min-width: dt('inputgroup.addon.min.width');
    }

    .u-input-group-addon:first-child,
    .u-input-group-addon + .u-input-group-addon {
        border-inline-start: 1px solid dt('inputgroup.addon.border.color');
    }

    .u-input-group-addon:last-child {
        border-inline-end: 1px solid dt('inputgroup.addon.border.color');
    }

    .u-input-group-addon:has(.u-button) {
        padding: 0;
        overflow: hidden;
    }

    .u-input-group-addon .u-button {
        border-radius: 0;
    }

    .u-input-group > .u-component,
    .u-input-group > .u-inputwrapper > .u-component,
    .u-input-group > .u-icon-field > .u-component,
    .u-input-group > .u-float-label > .u-component,
    .u-input-group > .u-float-label > .u-inputwrapper > .u-component,
    .u-input-group > .u-ifta-label > .u-component,
    .u-input-group > .u-ifta-label > .u-inputwrapper > .u-component {
        border-radius: 0;
        margin: 0;
    }

    .u-input-group-addon:first-child,
    .u-input-group > .u-component:first-child,
    .u-input-group > .u-inputwrapper:first-child > .u-component,
    .u-input-group > .u-icon-field:first-child > .u-component,
    .u-input-group > .u-float-label:first-child > .u-component,
    .u-input-group > .u-float-label:first-child > .u-inputwrapper > .u-component,
    .u-input-group > .u-ifta-label:first-child > .u-component,
    .u-input-group > .u-ifta-label:first-child > .u-inputwrapper > .u-component {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .u-input-group-addon:last-child,
    .u-input-group > .u-component:last-child,
    .u-input-group > .u-inputwrapper:last-child > .u-component,
    .u-input-group > .u-icon-field:last-child > .u-component,
    .u-input-group > .u-float-label:last-child > .u-component,
    .u-input-group > .u-float-label:last-child > .u-inputwrapper > .u-component,
    .u-input-group > .u-ifta-label:last-child > .u-component,
    .u-input-group > .u-ifta-label:last-child > .u-inputwrapper > .u-component {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .u-input-group .u-component:focus,
    .u-input-group .u-component.u-focus,
    .u-input-group .u-inputwrapper-focus,
    .u-input-group .u-component:focus ~ label,
    .u-input-group .u-component.u-focus ~ label,
    .u-input-group .u-inputwrapper-focus ~ label,
    .u-input-group .u-float-label .u-inputwrapper ~ label,
    .u-input-group .u-ifta-label .u-inputwrapper ~ label {
        z-index: 1;
    }

    .u-input-group > .u-button:not(.u-button-icon-only) {
        width: auto;
    }

    .u-input-group .u-icon-field + .u-icon-field .u-input-text {
        border-inline-start: 0;
    }
`;

/** `createBaseComponent`-shaped style module for `UInputGroup` — owns the shared CSS. */
export const inputGroupStyleModule: StyleModule = {
  css,
  classes: { root: "u-input-group" },
};

/**
 * `createBaseComponent`-shaped style module for `UInputGroupAddon` —
 * classes only, no own `css` string, matching real
 * `InputGroupAddonStyle`'s own `classes`-only shape exactly.
 */
export const inputGroupAddonStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-group-addon" },
};
