# React UInputTextarea

ID: react.input-textarea

Framework: react; availability: public

## Authored interpretation

Native textarea, controlled or uncontrolled, with optional auto-resize.

## Framework surface

UInputTextarea and UInputTextareaProps expose a forwarded HTMLTextAreaElement ref plus inputRef. UInputTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, value|onChange> and adds value, onChange, invalid, variant:filled|outlined, size:small|large, fluid, autoResize, inputRef, unstyled, pt and ptOptions. With autoResize the component keeps a cachedScrollHeight ref and a resize() routine that resets height and sets it from scrollHeight, caps it at an inline max-height only when one is set, and runs from an effect keyed on autoResize and value, and from the input, focus, blur and keyup handlers, each of which calls the consumer handler. p-filled follows the value and is tracked in state for an uncontrolled defaultValue. The remaining props are merged with ptm('root') through useMergeProps. autoResize adds the u-textarea-resizable class. The root class is u-textarea u-component plus p-filled, p-invalid, p-variant-filled, u-textarea-fluid, u-textarea-resizable and u-textarea-sm or u-textarea-lg. componentName and the pass-through key are textarea, the Aura registry key. keyfilter and tooltip are separate composition, not props (ADR-097). Exports are named from @ultimate/react and @ultimate/react/input-textarea. useComponentBase from @ultimate/react-core owns cx class resolution and delegates style registration to useComponentStyle; those hooks are external foundation records, not duplicated here. The style module imports the shared @ultimate/uix-styles/textarea CSS (ADR-082). The manifest advertises dist entry/type paths; this does not prove a built or published package.

## Public exports

@ultimate/react#UInputTextarea
@ultimate/react/input-textarea#UInputTextarea
@ultimate/react#UInputTextareaProps
@ultimate/react/input-textarea#UInputTextareaProps

## Owned source and evidence

packages/react/src/input-textarea/index.ts
packages/react/src/input-textarea/input-textarea.tsx
packages/react/src/input-textarea/input-textarea-style.ts

```text
packages/react/src/input-textarea/input-textarea.tsx: export interface UInputTextareaProps
packages/react/src/input-textarea/input-textarea-style.ts: export const inputTextareaStyleModule
packages/react/src/index.ts: export * from "./input-textarea";
packages/react/package.json: "./input-textarea": {
```

## Relationships

package.ultimate.react.input-textarea → [react.input-textarea](react.input-textarea.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

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
