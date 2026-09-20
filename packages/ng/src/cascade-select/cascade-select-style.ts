/**
 * Ultimate-owned adaptation of PrimeNG's `CascadeSelectStyle` (see
 * `.vendor-extracted/ng/cascadeselect/style/cascadeselectstyle.ts`, sourced
 * from `@primeuix/styles/cascadeselect`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. Hand-ported
 * directly, same reason documented in `../password/password-style.ts`.
 *
 * `.p-cascadeselect*` selectors renamed to `.u-cascade-select*`;
 * `p-invalid`/`p-disabled`/`p-filled`/`p-focus` kept unrenamed, matching
 * established precedent.
 */
const css = /*css*/ `
    .u-cascade-select {
        display: inline-flex;
        cursor: pointer;
        position: relative;
        user-select: none;
        background: dt('cascadeselect.background');
        border: 1px solid dt('cascadeselect.border.color');
        border-radius: dt('cascadeselect.border.radius');
        outline-color: transparent;
    }

    .u-cascade-select.p-cascadeselect-open {
        border-color: dt('cascadeselect.focus.border.color');
    }

    .u-cascade-select.p-disabled {
        opacity: 1;
        background: dt('cascadeselect.disabled.background');
        color: dt('cascadeselect.disabled.color');
    }

    .u-cascade-select-label {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        flex: 1 1 auto;
        width: 1%;
        padding: dt('cascadeselect.padding.y') dt('cascadeselect.padding.x');
        text-overflow: ellipsis;
        cursor: pointer;
    }

    .u-cascade-select-label.u-cascade-select-placeholder {
        color: dt('cascadeselect.placeholder.color');
    }

    .u-cascade-select-dropdown {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: dt('cascadeselect.dropdown.width');
    }

    .u-cascade-select-fluid {
        display: flex;
        width: 100%;
    }

    .u-cascade-select-overlay {
        position: absolute;
        top: 0;
        left: 0;
        background: dt('cascadeselect.overlay.background');
        color: dt('cascadeselect.overlay.color');
        border: 1px solid dt('cascadeselect.overlay.border.color');
        border-radius: dt('cascadeselect.overlay.border.radius');
        box-shadow: dt('cascadeselect.overlay.shadow');
    }

    .u-cascade-select-list {
        margin: 0;
        padding: dt('cascadeselect.list.padding');
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('cascadeselect.list.gap');
        min-width: 10rem;
    }

    .u-cascade-select-option {
        cursor: pointer;
        position: relative;
    }

    .u-cascade-select-option-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: dt('cascadeselect.option.padding');
        border-radius: dt('cascadeselect.option.border.radius');
        color: dt('cascadeselect.option.color');
    }

    .u-cascade-select-option-selected > .u-cascade-select-option-content {
        background: dt('cascadeselect.option.selected.background');
        color: dt('cascadeselect.option.selected.color');
    }

    .u-cascade-select-option-focused > .u-cascade-select-option-content {
        background: dt('cascadeselect.option.focus.background');
        color: dt('cascadeselect.option.focus.color');
    }

    .u-cascade-select-option-disabled > .u-cascade-select-option-content {
        opacity: 1;
        color: dt('cascadeselect.option.disabled.color');
    }

    .u-cascade-select-group-icon {
        font-size: 0.75rem;
    }

    .u-cascade-select-sublist {
        position: absolute;
        inset-inline-start: 100%;
        top: 0;
        min-width: 10rem;
        z-index: 1;
        background: dt('cascadeselect.overlay.background');
        border: 1px solid dt('cascadeselect.overlay.border.color');
        border-radius: dt('cascadeselect.overlay.border.radius');
        box-shadow: dt('cascadeselect.overlay.shadow');
        margin: 0;
        padding: dt('cascadeselect.list.padding');
        list-style: none;
    }

    .u-cascade-select-empty-message {
        padding: dt('cascadeselect.empty.message.padding');
    }
`;

/** Params `UCascadeSelect` passes into `cx('root', params)` and `cx('option', params)`. */
export interface CascadeSelectClassesParams {
  disabled?: boolean;
  filled?: boolean;
  fluid?: boolean;
  overlayVisible?: boolean;
  placeholder?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: CascadeSelectClassesParams = {}) => [
    "u-cascade-select u-component p-inputwrapper",
    {
      "p-disabled": params.disabled,
      "p-cascadeselect-open": params.overlayVisible,
      "p-inputwrapper-filled": params.filled,
      "u-cascade-select-fluid": params.fluid,
    },
  ],
  label: (params: CascadeSelectClassesParams = {}) => [
    "u-cascade-select-label",
    { "u-cascade-select-placeholder": params.placeholder },
  ],
  dropdown: "u-cascade-select-dropdown",
  overlay: "u-cascade-select-overlay",
  list: "u-cascade-select-list",
  sublist: "u-cascade-select-sublist",
  option: (params: CascadeSelectClassesParams = {}) => [
    "u-cascade-select-option",
    {
      "u-cascade-select-option-selected": params.selected,
      "u-cascade-select-option-disabled": params.disabled,
      "u-cascade-select-option-focused": params.focused,
    },
  ],
  optionContent: "u-cascade-select-option-content",
  groupIcon: "u-cascade-select-group-icon",
  emptyMessage: "u-cascade-select-empty-message",
};

/** `UBaseComponent`-shaped style module for `UCascadeSelect`. */
export const cascadeSelectStyleModule = { css, classes };
