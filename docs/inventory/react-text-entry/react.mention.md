# React UMention

ID: react.mention

Framework: react; availability: public

## Authored interpretation

Textarea with trigger-character suggestion overlay.

## Framework surface

UMention<T>, UMentionProps<T>, UMentionChangeEvent, UMentionSearchEvent{originalEvent,trigger,query}, UMentionSelectEvent<T>{originalEvent,suggestion}, UMentionItemTemplateOptions{trigger,index} and UMentionRef{show,hide,focus,getElement,getOverlay,getInput}. UMention is React.forwardRef(UMentionInner) cast to a generic signature, so it keeps the suggestion type T and accepts a ref; the handle has no props entry. The textarea is UInputTextarea from the input-textarea record: every prop UMention does not name (variant, invalid, autoResize, placeholder, disabled, rows and other native attributes) goes to the textarea only, while id, className and style go to the root. Props: value (controlled) or defaultValue (uncontrolled), onChange(event) whose target is the textarea on typing and on picking a suggestion (ADR-105), onInput, onFocus, onBlur, suggestions, field (string or one per trigger; a dot path is resolved), trigger default @ (string or array), delay default 0, autoHighlight default true, scrollHeight default 200px, itemTemplate(suggestion, {trigger,index}), headerTemplate and footerTemplate (node or function of the props), inputId, inputRef, inputClassName, inputStyle, panelClassName, panelStyle, transitionOptions (@ultimate/uix-motion options over u-anchored-overlay), onSearch, onSelect, onShow, onHide, unstyled, pt (root, input, panel, items, item with trigger context and selected state) and ptOptions. The trigger is found on every keystroke with lastIndexOf on the text before the caret, and again on ArrowLeft/ArrowRight; the search debounce uses setTimeout with delay, and the timer is cleared on unmount by useUnmountEffect together with the overlay listeners, scroll handler and z-index. The panel opens only when the search returns suggestions and closes on a space, when the caret leaves the trigger's word, or on an empty result. ArrowDown/ArrowUp move the highlight without wrapping and scroll it into view; Enter selects only when a highlight index is set; Escape and Backspace over the trigger close. The panel is rendered in place through Portal appendTo=self, placed at the caret by getCursorOffset from @ultimate/uix-utils/dom, stacked by useZIndex, closed on an outside click by useOverlayListener, realigned on resize and on scroll of any scrollable ancestor by ConnectedOverlayScrollHandler, and animated by useMotion. The textarea has role=combobox, aria-haspopup=listbox, aria-expanded, aria-autocomplete=list, aria-controls naming the list ul while it is open, and aria-activedescendant; items are role=option with aria-selected. The root carries u-mention, p-inputwrapper, p-inputwrapper-filled and p-inputwrapper-focus, or data-p-inputwrapper-filled when unstyled. mentionStyleModule keeps the structural rules locally and paints the panel, list and items with dt() references to the Aura autocomplete overlay, list and option tokens; the Aura registry has no mention key, so mentionPresetKeys registers autocomplete as an additional preset key. MentionRootClassesParams{focused,filled} and MentionItemClassesParams{selected} type the class resolvers. Exports from @ultimate/react and @ultimate/react/mention. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. No scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UMention
@ultimate/react/mention#UMention
@ultimate/react#UMentionProps
@ultimate/react/mention#UMentionProps
@ultimate/react#UMentionSearchEvent
@ultimate/react/mention#UMentionSearchEvent
@ultimate/react#UMentionSelectEvent
@ultimate/react/mention#UMentionSelectEvent
@ultimate/react#UMentionChangeEvent
@ultimate/react/mention#UMentionChangeEvent
@ultimate/react#UMentionItemTemplateOptions
@ultimate/react/mention#UMentionItemTemplateOptions
@ultimate/react#UMentionRef
@ultimate/react/mention#UMentionRef

## Owned source and evidence

packages/react/src/mention/index.ts
packages/react/src/mention/mention.tsx
packages/react/src/mention/mention-style.ts

```text
packages/react/src/mention/mention.tsx: export interface UMentionProps
packages/react/src/mention/mention.tsx: const UMentionBase = React.forwardRef(UMentionInner);
packages/react/src/mention/mention.tsx: <UInputTextarea
packages/react/src/mention/mention.tsx: event.target = input;
packages/react/src/mention/mention.tsx: const position = getCursorOffset(
packages/react/src/mention/mention.tsx: scrollHandlerRef.current = new ConnectedOverlayScrollHandler(
packages/react/src/mention/mention.tsx: useUnmountEffect(() => {
packages/react/src/mention/mention.tsx: "aria-controls": listVisible && suggestions ? listId : undefined,
packages/react/src/mention/mention.tsx: const { ptm } = createPassThrough("mention", { props: { pt, ptOptions } });
packages/react/src/mention/mention-style.ts: export const mentionStyleModule
packages/react/src/mention/mention-style.ts: export const mentionPresetKeys: readonly string[] = ["autocomplete"];
packages/themes/src/presets/aura/index.ts: import { autocomplete } from "./autocomplete";
packages/react/src/index.ts: export * from "./mention";
packages/react/package.json: "./mention": {
```

## Relationships

package.ultimate.react.mention → [react.mention](react.mention.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
react.input-textarea

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product spec for the text-entry families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-text/ src/input-textarea/ src/input-mask/ src/input-otp/ src/password/ src/float-label/ src/icon-field/ src/input-chips/ src/mention/",
    "outcome": "not-run",
    "revision": "c49aa4e6906a9d72a1893b3fc006fce55489d0b7",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
