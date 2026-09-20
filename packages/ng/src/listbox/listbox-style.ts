/**
 * Ultimate-owned adaptation of PrimeNG's `ListBoxStyle` (see
 * `.vendor-extracted/ng/listbox/style/listboxstyle.ts`, sourced from
 * `@primeuix/styles/listbox`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `../password/password-style.ts`.
 *
 * `.p-listbox*` selectors renamed to `.u-listbox*`; `p-invalid`/`p-disabled`
 * kept unrenamed, matching established precedent.
 */
const css = /*css*/ `
    .u-listbox {
        background: dt('listbox.background');
        color: dt('listbox.color');
        border: 1px solid dt('listbox.border.color');
        border-radius: dt('listbox.border.radius');
        transition: background dt('listbox.transition.duration'), color dt('listbox.transition.duration'), border-color dt('listbox.transition.duration'), outline-color dt('listbox.transition.duration'), box-shadow dt('listbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('listbox.shadow');
    }

    .u-listbox.p-invalid {
        border-color: dt('listbox.invalid.border.color');
    }

    .u-listbox.p-disabled {
        opacity: 1;
        background: dt('listbox.disabled.background');
        color: dt('listbox.disabled.color');
    }

    .u-listbox-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('listbox.list.header.padding');
    }

    .u-listbox-filter {
        flex: 1 1 auto;
    }

    .u-listbox-list-container {
        overflow: auto;
    }

    .u-listbox-list {
        margin: 0;
        padding: dt('listbox.list.padding');
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('listbox.list.gap');
    }

    .u-listbox-option {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        padding: dt('listbox.option.padding');
        border: 0 none;
        color: dt('listbox.option.color');
        background: transparent;
        border-radius: dt('listbox.option.border.radius');
    }

    .u-listbox-option-selected {
        background: dt('listbox.option.selected.background');
        color: dt('listbox.option.selected.color');
    }

    .u-listbox-option-focused {
        background: dt('listbox.option.focus.background');
        color: dt('listbox.option.focus.color');
    }

    .u-listbox-option-disabled {
        opacity: 1;
        color: dt('listbox.option.disabled.color');
    }

    .u-listbox-empty-message {
        padding: dt('listbox.empty.message.padding');
    }
`;

/** Params `UListbox` passes into `cx('root', params)` and `cx('option', params)`. */
export interface ListboxClassesParams {
  disabled?: boolean;
  invalid?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: ListboxClassesParams = {}) => [
    "u-listbox u-component",
    { "p-disabled": params.disabled, "p-invalid": params.invalid },
  ],
  header: "u-listbox-header",
  pcFilter: "u-listbox-filter",
  listContainer: "u-listbox-list-container",
  list: "u-listbox-list",
  option: (params: ListboxClassesParams = {}) => [
    "u-listbox-option",
    {
      "p-listbox-option-selected": params.selected,
      "p-disabled": params.disabled,
      "p-focus": params.focused,
    },
  ],
  emptyMessage: "u-listbox-empty-message",
};

/** `UBaseComponent`-shaped style module for `UListbox`. */
export const listboxStyleModule = { css, classes };
