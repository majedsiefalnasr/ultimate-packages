import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `InputChipsStyle` (see
 * `.vendor-extracted/vue/inputchips/style/InputChipsStyle.js`, CSS body
 * sourced from `.vendor-extracted/uix-styles-full/src/inputchips/index.ts`
 * — the real `@primeuix/styles/inputchips` module), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract.
 * `.p-inputchips*` selectors renamed to `.u-input-chips*`. This
 * realization renders each tag's markup inline (no dependency on a `Chip`
 * sub-component, since no `UChip` exists yet in this package) — see
 * `InputChips.vue`'s own doc comment for why — so this CSS module owns
 * the tag/token visuals directly instead of delegating them to a `Chip`
 * component's own style module the way real source's `.u-input-chips-chip`
 * selector (real `.p-inputchips-chip.p-chip`) implies.
 */
const css = /*css*/ `
    .u-input-chips {
        display: inline-flex;
    }

    .u-input-chips-input {
        margin: 0;
        list-style-type: none;
        cursor: text;
        overflow: hidden;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: calc(dt('inputchips.padding.y') / 2) dt('inputchips.padding.x');
        gap: calc(dt('inputchips.padding.y') / 2);
        color: dt('inputchips.color');
        background: dt('inputchips.background');
        border: 1px solid dt('inputchips.border.color');
        border-radius: dt('inputchips.border.radius');
        width: 100%;
        outline-color: transparent;
    }

    .u-input-chips:not(.u-disabled):hover .u-input-chips-input {
        border-color: dt('inputchips.hover.border.color');
    }

    .u-input-chips:not(.u-disabled).u-focus .u-input-chips-input {
        border-color: dt('inputchips.focus.border.color');
        box-shadow: dt('inputchips.focus.ring.shadow');
        outline: dt('inputchips.focus.ring.width') dt('inputchips.focus.ring.style') dt('inputchips.focus.ring.color');
        outline-offset: dt('inputchips.focus.ring.offset');
    }

    .u-input-chips.u-invalid .u-input-chips-input {
        border-color: dt('inputchips.invalid.border.color');
    }

    .u-input-chips.u-disabled .u-input-chips-input {
        opacity: 1;
        background: dt('inputchips.disabled.background');
        color: dt('inputchips.disabled.color');
    }

    .u-input-chips-chip-item {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding-top: calc(dt('inputchips.padding.y') / 2);
        padding-bottom: calc(dt('inputchips.padding.y') / 2);
        padding-inline: dt('inputchips.padding.x');
        border-radius: dt('inputchips.chip.border.radius');
        background: dt('inputchips.background');
    }

    .u-input-chips-chip-item-focused {
        background: dt('inputchips.chip.focus.background');
        color: dt('inputchips.chip.focus.color');
    }

    .u-input-chips-chip-icon {
        cursor: pointer;
    }

    .u-input-chips-input-item {
        flex: 1 1 auto;
        display: inline-flex;
        padding-top: calc(dt('inputchips.padding.y') / 2);
        padding-bottom: calc(dt('inputchips.padding.y') / 2);
    }

    .u-input-chips-input-item input {
        border: 0 none;
        outline: 0 none;
        background: transparent;
        margin: 0;
        padding: 0;
        box-shadow: none;
        border-radius: 0;
        width: 100%;
        font-family: inherit;
        font-size: 1rem;
        color: inherit;
    }
`;

const classes = {
  root: (params: { disabled?: boolean; invalid?: boolean; focused?: boolean } = {}) => [
    "u-input-chips",
    {
      "u-disabled": Boolean(params.disabled),
      "u-invalid": Boolean(params.invalid),
      "u-focus": Boolean(params.focused),
    },
  ],
  input: "u-input-chips-input",
  chipItem: (params: { focused?: boolean } = {}) => [
    "u-input-chips-chip-item",
    { "u-input-chips-chip-item-focused": Boolean(params.focused) },
  ],
  chipIcon: "u-input-chips-chip-icon",
  inputItem: "u-input-chips-input-item",
};

export const inputChipsStyleModule: StyleModule = { css, classes };
