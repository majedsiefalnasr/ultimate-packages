import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `ListboxStyle` (see
 * `.vendor-extracted/vue/listbox/style/ListboxStyle.js`, sourced from
 * `@primeuix/styles/listbox`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/vue/src/password/password-style.ts`.
 */
const css = /*css*/ `
    .u-listbox {
        background: dt('listbox.background');
        color: dt('listbox.color');
        border: 1px solid dt('listbox.border.color');
        border-radius: dt('listbox.border.radius');
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
        outline: none;
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

export interface ListboxClassesParams {
  disabled?: boolean;
  selected?: boolean;
  focused?: boolean;
}

const classes = {
  root: (params: ListboxClassesParams = {}) => [
    "u-listbox u-component",
    { "p-disabled": Boolean(params.disabled) },
  ],
  header: "u-listbox-header",
  pcFilter: "u-listbox-filter",
  listContainer: "u-listbox-list-container",
  list: "u-listbox-list",
  option: (params: ListboxClassesParams = {}) => [
    "u-listbox-option",
    {
      "u-listbox-option-selected": Boolean(params.selected),
      "u-listbox-option-focused": Boolean(params.focused),
      "u-listbox-option-disabled": Boolean(params.disabled),
    },
  ],
  emptyMessage: "u-listbox-empty-message",
};

/** `createBaseComponent`-shaped style module for `UListbox`. */
export const listboxStyleModule: StyleModule = { css, classes };
