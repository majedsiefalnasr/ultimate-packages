/**
 * Ultimate-owned adaptation of PrimeNG's `MultiSelectStyle` (see
 * `.vendor-extracted/ng/multiselect/style/multiselectstyle.ts`, sourced
 * from `@primeuix/styles/multiselect`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `../password/password-style.ts`.
 *
 * `.p-multiselect*` selectors renamed to `.u-multi-select*`; `p-invalid`/
 * `p-disabled`/`p-filled`/`p-focus` kept unrenamed, matching established
 * precedent.
 */
const css = /*css*/ `
    .u-multi-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('multiselect.background');
        border: 1px solid dt('multiselect.border.color');
        transition: background dt('multiselect.transition.duration'), color dt('multiselect.transition.duration'), border-color dt('multiselect.transition.duration'), outline-color dt('multiselect.transition.duration'), box-shadow dt('multiselect.transition.duration');
        border-radius: dt('multiselect.border.radius');
        outline-color: transparent;
        box-shadow: dt('multiselect.shadow');
    }

    .u-multi-select.p-multiselect-open {
        border-color: dt('multiselect.focus.border.color');
    }

    .u-multi-select.p-disabled {
        opacity: 1;
        background: dt('multiselect.disabled.background');
        color: dt('multiselect.disabled.color');
    }

    .u-multi-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('multiselect.padding.y') dt('multiselect.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
    }

    .u-multi-select-label.u-multi-select-placeholder {
        color: dt('multiselect.placeholder.color');
    }

    .u-multi-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('multiselect.dropdown.color');
        width: dt('multiselect.dropdown.width');
    }

    .u-multi-select-clear-icon {
        position: relative;
        margin-block-start: -0.5rem;
        color: dt('multiselect.clear.icon.color');
        inset-block-start: 50%;
    }

    .u-multi-select-fluid {
        display: flex;
        width: 100%;
    }

    .u-multi-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 100%;
        background: dt('multiselect.overlay.background');
        color: dt('multiselect.overlay.color');
        border: 1px solid dt('multiselect.overlay.border.color');
        border-radius: dt('multiselect.overlay.border.radius');
        box-shadow: dt('multiselect.overlay.shadow');
    }

    .u-multi-select-header {
        display: flex;
        align-items: center;
        padding: dt('multiselect.list.header.padding');
        gap: 0.5rem;
    }

    .u-multi-select-filter {
        flex: 1 1 auto;
    }

    .u-multi-select-list-container {
        overflow: auto;
    }

    .u-multi-select-list {
        margin: 0;
        padding: dt('multiselect.list.padding');
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('multiselect.list.gap');
    }

    .u-multi-select-option {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        padding: dt('multiselect.option.padding');
        border: 0 none;
        color: dt('multiselect.option.color');
        background: transparent;
        border-radius: dt('multiselect.option.border.radius');
    }

    .u-multi-select-option-selected {
        background: dt('multiselect.option.selected.background');
        color: dt('multiselect.option.selected.color');
    }

    .u-multi-select-option-focused {
        background: dt('multiselect.option.focus.background');
        color: dt('multiselect.option.focus.color');
    }

    .u-multi-select-option-disabled {
        opacity: 1;
        color: dt('multiselect.option.disabled.color');
    }

    .u-multi-select-empty-message {
        padding: dt('multiselect.empty.message.padding');
    }
`;

/** Params `UMultiSelect` passes into `cx('root', params)` and `cx('option', params)`. */
export interface MultiSelectClassesParams {
  disabled?: boolean;
  filled?: boolean;
  focused?: boolean;
  fluid?: boolean;
  overlayVisible?: boolean;
  selected?: boolean;
  placeholder?: boolean;
}

const classes = {
  root: (params: MultiSelectClassesParams = {}) => [
    "u-multi-select u-component p-inputwrapper",
    {
      "p-disabled": params.disabled,
      "p-multiselect-open": params.overlayVisible,
      "p-inputwrapper-filled": params.filled,
      "u-multi-select-fluid": params.fluid,
    },
  ],
  label: (params: MultiSelectClassesParams = {}) => [
    "u-multi-select-label",
    { "u-multi-select-placeholder": params.placeholder },
  ],
  clearIcon: "u-multi-select-clear-icon",
  dropdown: "u-multi-select-dropdown",
  overlay: "u-multi-select-overlay",
  header: "u-multi-select-header",
  pcFilter: "u-multi-select-filter",
  listContainer: "u-multi-select-list-container",
  list: "u-multi-select-list",
  option: (params: MultiSelectClassesParams = {}) => [
    "u-multi-select-option",
    {
      "p-multiselect-option-selected": params.selected,
      "p-disabled": params.disabled,
      "p-focus": params.focused,
    },
  ],
  emptyMessage: "u-multi-select-empty-message",
};

/** `UBaseComponent`-shaped style module for `UMultiSelect`. */
export const multiSelectStyleModule = { css, classes };
