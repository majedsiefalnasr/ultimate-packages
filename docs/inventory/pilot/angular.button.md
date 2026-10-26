# Angular UButton

ID: angular.button

Framework: angular; availability: public

## Authored interpretation

Standalone action component. This sample uses the same responsibility across frameworks specifically to expose different contracts rather than imply behavioral equivalence. Angular uses signal inputs and event outputs, React uses DOM props and forwarded refs, and Vue uses a base factory with props, slots and dynamic root rendering. Shared CSS is an independently consumed foundation, not another rendered component.

## Framework surface

Root @ultimate/ng exports UButton through src/index.ts -> ./button. There is no @ultimate/ng/button manifest subpath. Selector u-button; standalone component extends UBaseComponent. Signal inputs include label, icon, iconPos, loading, disabled, severity, raised, rounded, text, outlined, size and fluid; outputs onClick, onFocus and onBlur. Private/protected styling helpers belong to this record, not additional products.

## Public exports

@ultimate/ng#UButton

## Owned source and evidence

packages/ng/src/button/index.ts
packages/ng/src/button/button.ts
packages/ng/src/button/button-style.ts

packages/ng/src/index.ts: export * from "./button";
packages/ng/src/button/button.ts: export class UButton extends UBaseComponent
packages/ng/src/button/button.ts: selector: "u-button"
packages/ng/src/button/button.spec.ts: UButton

## Relationships

shared.button-style
angular.core (pending cross-batch)
angular.ripple (pending cross-batch)
metadata.button (pending cross-batch)
themes.button (pending cross-batch)

## Verification

[
{
"state": "implemented",
"behavior": "Signal-input component and native button template exist; source inspection only."
},
{
"state": "not-run",
"behavior": "Angular button behavioral suite has not been executed for this pilot."
}
]
