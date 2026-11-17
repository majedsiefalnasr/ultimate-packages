# React UTriStateCheckbox

ID: react.tri-state-checkbox

Framework: react; availability: public

## Authored interpretation

Controlled true/false/null checkbox that cycles states on click, Space or Enter.

## Framework surface

UTriStateCheckbox is a plain function component, not a forwardRef. UTriStateCheckboxProps requires value:boolean|null and adds onChange, disabled, readOnly, invalid, id, inputId, tabIndex (default 0), className and aria-label; there is no name, inputRef or autoFocus prop. State is fully controlled and has no internal state: cycle (skipped when disabled or readOnly) emits UTriStateCheckboxChangeEvent {originalEvent, value} following null -> true -> false -> null, calling onChange optionally. Click, Enter, Space (key " " or code Space) all cycle; keydown calls preventDefault. Markup inside the root div (cx root with disabled and invalid): a hidden native input type=checkbox (id=inputId, checked={value === true}, readOnly, disabled, aria-invalid={invalid || undefined}, aria-hidden="true", tabIndex=-1) with no onChange so it is inert; a span with className u-hidden-accessible and aria-live="polite" whose text is "true", "false" or "none" (the class is registered by useComponentStyle via the shared hidden-accessible rule); and a sibling box div with role="checkbox", aria-checked "true"/"false"/"mixed", aria-label, tabIndex and the click and key handlers, showing UCheckIcon for true and UTimesIcon for false from @ultimate/react-core. triStateCheckboxStyleModule defines classes root (disabled, invalid), box, input and icon; the icon key is unused because the icon elements carry no className; there is no ClassesParams interface. Aura components registry has no key for tri-state-checkbox (componentName tri-state-checkbox), so no theme link is recorded. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/tri-state-checkbox; the root barrel line and manifest subpath are both present. useComponentBase from @ultimate/react-core resolves cx classes and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. Local style CSS is hand-authored and registered; no scoped style module imports @ultimate/uix-styles. The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UTriStateCheckbox
@ultimate/react/tri-state-checkbox#UTriStateCheckbox
@ultimate/react#UTriStateCheckboxProps
@ultimate/react/tri-state-checkbox#UTriStateCheckboxProps
@ultimate/react#UTriStateCheckboxChangeEvent
@ultimate/react/tri-state-checkbox#UTriStateCheckboxChangeEvent

## Owned source and evidence

packages/react/src/tri-state-checkbox/index.ts
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx
packages/react/src/tri-state-checkbox/tri-state-checkbox-style.ts

```text
packages/react/src/tri-state-checkbox/index.ts: export { UTriStateCheckbox } from
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: export function UTriStateCheckbox({
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: if (value === null) next = true;
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: className="u-hidden-accessible" aria-live="polite"
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: role="checkbox"
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: "mixed"
packages/react/src/tri-state-checkbox/tri-state-checkbox.tsx: <UTimesIcon />
packages/react/src/tri-state-checkbox/tri-state-checkbox-style.ts: export const triStateCheckboxStyleModule
packages/react/src/index.ts: export * from "./tri-state-checkbox";
packages/react/package.json: "./tri-state-checkbox": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.tri-state-checkbox → [react.tri-state-checkbox](react.tri-state-checkbox.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.react-core.icons (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product spec for the choice and range families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/checkbox/ src/radio-button/ src/toggle-button/ src/input-switch/ src/select-button/ src/multi-state-checkbox/ src/tri-state-checkbox/ src/rating/ src/slider/ src/knob/",
    "outcome": "not-run",
    "revision": "8d8d52094058993d3ca29823d1c2cd922805570e",
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
