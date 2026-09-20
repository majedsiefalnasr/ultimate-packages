import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `IftaLabelStyle` (see
 * `.vendor-extracted/vue/iftalabel/style/IftaLabelStyle.js`, CSS body
 * sourced from `.vendor-extracted/uix-styles-full/src/iftalabel/index.ts` —
 * the real `@primeuix/styles/iftalabel` module), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract.
 * Hand-ported directly: no `@ultimate/uix-styles/ifta-label` subpath exists
 * yet and this task may not add one. `.p-iftalabel*` selectors renamed to
 * `.u-ifta-label*`.
 */
const css = /*css*/ `
    .u-ifta-label {
        display: block;
        position: relative;
    }

    .u-ifta-label label {
        position: absolute;
        pointer-events: none;
        top: dt('iftalabel.top');
        transition-property: all;
        transition-timing-function: ease;
        line-height: 1;
        font-size: dt('iftalabel.font.size');
        font-weight: dt('iftalabel.font.weight');
        inset-inline-start: dt('iftalabel.position.x');
        color: dt('iftalabel.color');
        transition-duration: dt('iftalabel.transition.duration');
    }

    .u-ifta-label .u-input-text,
    .u-ifta-label .u-textarea,
    .u-ifta-label .u-select-label,
    .u-ifta-label .u-multi-select-label,
    .u-ifta-label .u-autocomplete-input-multiple,
    .u-ifta-label .u-cascade-select-label {
        padding-block-start: dt('iftalabel.input.padding.top');
        padding-block-end: dt('iftalabel.input.padding.bottom');
    }

    .u-ifta-label:has(.u-invalid) label {
        color: dt('iftalabel.invalid.color');
    }

    .u-ifta-label:has(input:focus) label,
    .u-ifta-label:has(input:-webkit-autofill) label,
    .u-ifta-label:has(textarea:focus) label,
    .u-ifta-label:has(.u-inputwrapper-focus) label {
        color: dt('iftalabel.focus.color');
    }

    .u-ifta-label .u-input-icon {
        top: dt('iftalabel.input.padding.top');
        transform: translateY(25%);
        margin-top: 0;
    }
`;

export const iftaLabelStyleModule: StyleModule = {
  css,
  classes: { root: "u-ifta-label" },
};
