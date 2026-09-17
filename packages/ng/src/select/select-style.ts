/**
 * Ultimate-owned adaptation of PrimeNG's `SelectStyle` (see
 * `.vendor-extracted/ng/select/style/selectstyle.ts`, sourced from
 * `@primeuix/styles/select`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `password-style.ts`: no `@ultimate/uix-styles/select`
 * subpath exists yet and this task may not add one.
 *
 * `.p-select*` selectors renamed to `.u-select*`; `p-invalid`/`p-disabled`/
 * `p-filled`/`p-focus` kept unrenamed, matching established precedent.
 */
const css = /*css*/ `
    .u-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('select.background');
        border: 1px solid dt('select.border.color');
        transition: background dt('select.transition.duration'), color dt('select.transition.duration'), border-color dt('select.transition.duration'), outline-color dt('select.transition.duration'), box-shadow dt('select.transition.duration');
        border-radius: dt('select.border.radius');
        outline-color: transparent;
        box-shadow: dt('select.shadow');
    }

    .u-select.p-focus {
        border-color: dt('select.focus.border.color');
        box-shadow: dt('select.focus.ring.shadow');
    }

    .u-select.p-select-open {
        border-color: dt('select.focus.border.color');
    }

    .u-select.p-invalid {
        border-color: dt('select.invalid.border.color');
    }

    .u-select.p-disabled {
        opacity: 1;
        background: dt('select.disabled.background');
        color: dt('select.disabled.color');
    }

    .u-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('select.padding.y') dt('select.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
        background: transparent;
        border: 0 none;
        outline: 0 none;
    }

    .u-select-label.u-select-placeholder {
        color: dt('select.placeholder.color');
    }

    .u-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: transparent;
        color: dt('select.dropdown.color');
        width: dt('select.dropdown.width');
        border-start-end-radius: dt('select.border.radius');
        border-end-end-radius: dt('select.border.radius');
    }

    .u-select-clear-icon {
        position: relative;
        margin-block-start: -0.5rem;
        color: dt('select.clear.icon.color');
        inset-block-start: 50%;
    }

    .u-select-fluid {
        display: flex;
        width: 100%;
    }

    .u-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 100%;
        background: dt('select.overlay.background');
        color: dt('select.overlay.color');
        border: 1px solid dt('select.overlay.border.color');
        border-radius: dt('select.overlay.border.radius');
        box-shadow: dt('select.overlay.shadow');
    }

    .u-select-header {
        padding: dt('select.list.header.padding');
    }

    .u-select-filter {
        width: 100%;
    }

    .u-select-list-container {
        overflow: auto;
    }

    .u-select-list {
        margin: 0;
        padding: dt('select.list.padding');
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('select.list.gap');
    }

    .u-select-option-group {
        cursor: auto;
        padding: dt('select.option.group.padding');
        color: dt('select.option.group.color');
        background: dt('select.option.group.background');
        font-weight: dt('select.option.group.font.weight');
    }

    .u-select-option {
        cursor: pointer;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        padding: dt('select.option.padding');
        border: 0 none;
        color: dt('select.option.color');
        background: transparent;
        border-radius: dt('select.option.border.radius');
    }

    .u-select-option.p-select-option-selected {
        background: dt('select.option.selected.background');
        color: dt('select.option.selected.color');
    }

    .u-select-option.p-focus {
        background: dt('select.option.focus.background');
        color: dt('select.option.focus.color');
    }

    .u-select-option.p-disabled {
        opacity: 1;
        color: dt('select.option.disabled.color');
    }

    .u-select-empty-message {
        padding: dt('select.empty.message.padding');
    }
`;

/** Params `USelect` passes into `cx('root', params)` and `cx('option', params)`. */
export interface SelectClassesParams {
  disabled?: boolean;
  filled?: boolean;
  focused?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  overlayVisible?: boolean;
  selected?: boolean;
  placeholder?: boolean;
}

const classes = {
  root: (params: SelectClassesParams = {}) => [
    "u-select u-component p-inputwrapper",
    {
      "p-disabled": params.disabled,
      "p-focus": params.focused,
      "p-invalid": params.invalid,
      "p-inputwrapper-filled": params.filled,
      "p-select-open": params.overlayVisible,
      "u-select-fluid": params.fluid,
    },
  ],
  label: (params: SelectClassesParams = {}) => [
    "u-select-label",
    { "u-select-placeholder": params.placeholder },
  ],
  clearIcon: "u-select-clear-icon",
  dropdown: "u-select-dropdown",
  overlay: "u-select-overlay",
  header: "u-select-header",
  pcFilter: "u-select-filter",
  listContainer: "u-select-list-container",
  list: "u-select-list",
  optionGroup: "u-select-option-group",
  option: (params: SelectClassesParams = {}) => [
    "u-select-option",
    {
      "p-select-option-selected": params.selected,
      "p-disabled": params.disabled,
      "p-focus": params.focused,
    },
  ],
  emptyMessage: "u-select-empty-message",
};

/** `UBaseComponent`-shaped style module for `USelect`. */
export const selectStyleModule = { css, classes };
