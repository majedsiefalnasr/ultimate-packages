# React UBadge

ID: react.badge

Framework: react; availability: public

## Authored interpretation

Standalone status badge showing a value, with severity and size, a dot for an empty value and a circle for one character.

## Framework surface

UBadge and UBadgeProps forward an HTMLSpanElement ref; the ref is the root span, where PrimeReact exposes getElement() (ADR-088). UBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">: value:string|number|null, severity:secondary|info|success|warn|warning|danger|contrast (warning is an alias of warn), size:small|large|xlarge, unstyled:boolean, pt and ptOptions; className, style and the other span attributes are merged onto the root with ptm('root'). The root renders value. BadgeSeverity is exported from the barrel; BadgeClassesParams and badgeStyleModule are owned source-only declarations. The shared @ultimate/uix-styles/badge module supplies the structural CSS (ADR-082), and badgeStyleModule adds the .u-overlaybadge wrapper rules that replace PrimeReact's .p-overlay-badge; there is no React OverlayBadge component, as in PrimeReact. Public runtime and types are named exports from both @ultimate/react and @ultimate/react/badge. The manifest advertises dist entry/type paths; this does not prove a built or published package. useComponentBase from @ultimate/react-core owns cx class resolution; createPassThrough owns ptm. Aura registry key badge matches componentName and the dt() references in the shared module. No dedicated record for this family is present in the current metadata registry; no metadata association is inferred from its name.

## Public exports

@ultimate/react#UBadge
@ultimate/react#UBadgeProps
@ultimate/react#BadgeSeverity
@ultimate/react/badge#UBadge
@ultimate/react/badge#UBadgeProps
@ultimate/react/badge#BadgeSeverity

## Owned source and evidence

packages/react/src/badge/index.ts
packages/react/src/badge/badge.tsx
packages/react/src/badge/badge-style.ts

```text
packages/react/src/badge/badge.tsx: export interface UBadgeProps
packages/react/src/badge/badge-style.ts: export const badgeStyleModule
packages/react/src/badge/badge-style.ts: @ultimate/uix-styles/badge
packages/react/src/index.ts: export * from "./badge";
```

## Relationships

package.ultimate.react.badge → [react.badge](react.badge.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.uix-styles.badge (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Forward-ref component, declared props, shared style module and described composition exist in source; not behavioral proof."
  }
]
```
