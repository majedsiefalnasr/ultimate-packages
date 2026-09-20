/**
 * Ultimate-owned adaptation of PrimeNG's `AutoCompleteStyle` (see
 * `.vendor-extracted/ng/autocomplete/style/autocompletestyle.ts`, sourced
 * from `@primeuix/styles/autocomplete`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. Hand-ported
 * directly, same reason documented in `password-style.ts`: no
 * `@ultimate/uix-styles/autocomplete` subpath exists yet and this task may
 * not add one.
 *
 * `.p-autocomplete*` selectors renamed to `.u-autocomplete*`; `p-invalid`/
 * `p-disabled`/`p-filled` kept unrenamed, matching established precedent.
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

/** Params `UAutoComplete` passes into `cx('root', params)` and `cx('option', params)`. */
export interface AutoCompleteClassesParams {
  filled?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  disabled?: boolean;
  focused?: boolean;
  selected?: boolean;
}

const classes = {
  root: (params: AutoCompleteClassesParams = {}) => {
    const { filled, invalid, fluid, disabled } = params;
    return [
      "u-autocomplete u-component",
      {
        "p-filled": filled,
        "p-invalid": invalid,
        "u-autocomplete-fluid": fluid,
        "p-disabled": disabled,
      },
    ];
  },
  pcInputText: "u-autocomplete-input",
  loader: "u-autocomplete-loader",
  overlay: "u-autocomplete-overlay",
  list: "u-autocomplete-list",
  option: (params: AutoCompleteClassesParams = {}) => [
    "u-autocomplete-option",
    {
      "u-autocomplete-option-focused": params.focused,
      "u-autocomplete-option-selected": params.selected,
    },
  ],
  emptyMessage: "u-autocomplete-empty-message",
};

/** `UBaseComponent`-shaped style module for `UAutoComplete`. */
export const autoCompleteStyleModule = { css, classes };
