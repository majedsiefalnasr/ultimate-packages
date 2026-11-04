# React UMention

ID: react.mention

Framework: react; availability: public

## Authored interpretation

Textarea with trigger-character suggestion overlay.

## Framework surface

UMention<T>, UMentionProps<T>, UMentionSearchEvent{originalEvent,trigger,query} and UMentionSelectEvent<T>{originalEvent,suggestion}. UMention is a generic function component and not a forwardRef: it accepts no ref. Props: value default empty, onChange(value), suggestions, field, trigger default @, delay default 0, autoHighlight default true, placeholder, disabled, rows default 3, inputId, className, onSearch, onSelect, onFocus, onBlur. The textarea has role=combobox, aria-expanded, aria-autocomplete=list and aria-activedescendant but no aria-controls although the list ul carries its own id. The search debounce uses setTimeout with delay and the timer is not cleared on unmount. Enter selects only when a highlight index is set. The overlay is an inline absolute div: no portal and no caret-based positioning. trigger is located with lastIndexOf on the text before the caret. mentionStyleModule is hard-coded CSS without tokens; the Aura registry has no mention key. Exports from @ultimate/react and @ultimate/react/mention. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UMention
@ultimate/react/mention#UMention
@ultimate/react#UMentionProps
@ultimate/react/mention#UMentionProps
@ultimate/react#UMentionSearchEvent
@ultimate/react/mention#UMentionSearchEvent
@ultimate/react#UMentionSelectEvent
@ultimate/react/mention#UMentionSelectEvent

## Owned source and evidence

packages/react/src/mention/index.ts
packages/react/src/mention/mention.tsx
packages/react/src/mention/mention-style.ts

```text
packages/react/src/mention/mention.tsx: export interface UMentionProps
packages/react/src/mention/mention-style.ts: export const mentionStyleModule
packages/react/src/index.ts: export * from "./mention";
packages/react/package.json: "./mention": {
```

## Relationships

package.ultimate.react.mention → [react.mention](react.mention.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)

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
