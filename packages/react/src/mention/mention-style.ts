import type { StyleModule } from "@ultimate/react-core";

/**
 * `useComponentBase`-shaped style module for `UMention`. The rules are
 * PrimeReact 10.9.9's `MentionBase.js` styles, `.p-mention*` renamed to
 * `.u-mention*`, with the panel, list and item painted by the
 * `@primeuix/styles` 2.0.3 `autocomplete` overlay, list and option rules on
 * the Aura `autocomplete` tokens. Aura has no `mention` module, so
 * `UMention` registers `autocomplete` as an additional preset key (ADR-067,
 * ADR-105). The textarea is `UInputTextarea` and keeps its own `textarea`
 * styles. The highlighted item uses the option focus tokens, as the
 * keyboard-focused AutoComplete option does.
 *
 * The module stays in `@ultimate/react` (ADR-082 exception): only
 * PrimeReact ships Mention, so no other framework shares this stylesheet.
 * PrimeReact's leftover `.p-autocomplete-loader` rule is not carried.
 */
const css = /*css*/ `
.u-mention {
  display: inline-flex;
  position: relative;
}

.u-mention .u-mention-panel {
  min-width: 100%;
}

.u-mention-panel {
  position: absolute;
  top: 0;
  left: 0;
  overflow: auto;
  background: dt('autocomplete.overlay.background');
  color: dt('autocomplete.overlay.color');
  border: 1px solid dt('autocomplete.overlay.border.color');
  border-radius: dt('autocomplete.overlay.border.radius');
  box-shadow: dt('autocomplete.overlay.shadow');
}

.u-mention-items {
  margin: 0;
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: dt('autocomplete.list.gap');
  padding: dt('autocomplete.list.padding');
}

.u-mention-item {
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: dt('autocomplete.option.padding');
  border: 0 none;
  color: dt('autocomplete.option.color');
  background: transparent;
  transition:
    background dt('autocomplete.transition.duration'),
    color dt('autocomplete.transition.duration'),
    border-color dt('autocomplete.transition.duration');
  border-radius: dt('autocomplete.option.border.radius');
}

.u-mention-item:hover,
.u-mention-item.u-mention-item-selected {
  background: dt('autocomplete.option.focus.background');
  color: dt('autocomplete.option.focus.color');
}
`;

export interface MentionRootClassesParams {
  focused?: boolean;
  filled?: boolean;
}

export interface MentionItemClassesParams {
  selected?: boolean;
}

const classes = {
  root: (params: MentionRootClassesParams = {}) => [
    "u-mention u-component p-inputwrapper",
    {
      "p-inputwrapper-filled": Boolean(params.filled),
      "p-inputwrapper-focus": Boolean(params.focused),
    },
  ],
  input: "u-mention-input",
  panel: "u-mention-panel",
  items: "u-mention-items",
  item: (params: MentionItemClassesParams = {}) => [
    "u-mention-item",
    { "u-mention-item-selected": Boolean(params.selected) },
  ],
};

/** Aura keys whose variables the panel, list and item rules read. */
export const mentionPresetKeys: readonly string[] = ["autocomplete"];

export const mentionStyleModule: StyleModule = { css, classes };
