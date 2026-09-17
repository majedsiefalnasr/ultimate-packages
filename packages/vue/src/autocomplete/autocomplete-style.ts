import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `AutoCompleteStyle` (see
 * `.vendor-extracted/vue/autocomplete/style/AutoCompleteStyle.js`, sourced
 * from `@primeuix/styles/autocomplete`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract.
 * Hand-ported directly, same reason documented in
 * `packages/vue/src/password/password-style.ts`.
 */
const css = /*css*/ `
    .u-autocomplete {
        display: inline-flex;
        position: relative;
    }

    .u-autocomplete-input {
        width: 100%;
    }

    .u-autocomplete.u-autocomplete-fluid {
        display: flex;
    }

    .u-autocomplete-loader {
        position: absolute;
        top: 50%;
        inset-inline-end: dt('autocomplete.padding.x');
        margin-block-start: calc(-1 * calc(dt('icon.size') / 2));
    }

    .u-autocomplete-overlay {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 100%;
        background: dt('autocomplete.overlay.background');
        color: dt('autocomplete.overlay.color');
        border: 1px solid dt('autocomplete.overlay.border.color');
        border-radius: dt('autocomplete.overlay.border.radius');
        box-shadow: dt('autocomplete.overlay.shadow');
        max-height: 15rem;
        overflow: auto;
    }

    .u-autocomplete-list {
        margin: 0;
        padding: dt('autocomplete.list.padding');
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('autocomplete.list.gap');
    }

    .u-autocomplete-option {
        cursor: pointer;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        padding: dt('autocomplete.option.padding');
        border: 0 none;
        color: dt('autocomplete.option.color');
        background: transparent;
        border-radius: dt('autocomplete.option.border.radius');
    }

    .u-autocomplete-option-focused {
        background: dt('autocomplete.option.focus.background');
        color: dt('autocomplete.option.focus.color');
    }

    .u-autocomplete-option-selected {
        background: dt('autocomplete.option.selected.background');
        color: dt('autocomplete.option.selected.color');
    }

    .u-autocomplete-empty-message {
        padding: dt('autocomplete.empty.message.padding');
    }
`;

export interface AutoCompleteClassesParams {
  filled?: boolean;
  fluid?: boolean;
  disabled?: boolean;
  focused?: boolean;
  selected?: boolean;
}

const classes = {
  root: (params: AutoCompleteClassesParams = {}) => [
    "u-autocomplete u-component",
    {
      "p-filled": Boolean(params.filled),
      "u-autocomplete-fluid": Boolean(params.fluid),
      "p-disabled": Boolean(params.disabled),
    },
  ],
  pcInputText: "u-autocomplete-input",
  loader: "u-autocomplete-loader",
  overlay: "u-autocomplete-overlay",
  list: "u-autocomplete-list",
  option: (params: AutoCompleteClassesParams = {}) => [
    "u-autocomplete-option",
    {
      "u-autocomplete-option-focused": Boolean(params.focused),
      "u-autocomplete-option-selected": Boolean(params.selected),
    },
  ],
  emptyMessage: "u-autocomplete-empty-message",
};

/** `createBaseComponent`-shaped style module for `UAutoComplete`. */
export const autoCompleteStyleModule: StyleModule = { css, classes };
