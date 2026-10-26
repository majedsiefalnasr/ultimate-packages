# React UButton

ID: react.button

Framework: react; availability: public

## Authored interpretation

Action button with a forwarded native HTMLButtonElement ref, inherited native button attributes, ReactNode icon/loadingIcon and optional tooltip. Internal buttonStyleModule and render helpers are owned here rather than counted independently.

## Framework surface

@ultimate/react/button exports UButton and type UButtonProps. UButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, disabled>; properties add label, icon, iconPos, loading, loadingIcon, disabled, severity, size, text, raised, rounded, outlined, link, plain, badge, badgeClassName, visible, tooltip and tooltipOptions. Children render inside the button; visible=false returns null. The source combines disabled with loading. This is implementation evidence, not executed behavior proof.

## Public exports

@ultimate/react/button#UButton
@ultimate/react/button#UButtonProps

## Owned source and evidence

packages/react/src/button/index.ts
packages/react/src/button/button.tsx
packages/react/src/button/button-style.ts

packages/react/src/button/button.tsx: React.forwardRef<HTMLButtonElement, UButtonProps>
packages/react/src/button/button.tsx: const isDisabled = disabled || loading;
packages/react/src/button/button.spec.tsx: UButton

## Relationships

react.core (pending cross-batch)
react.tooltip (pending cross-batch)
metadata.button (pending cross-batch)
themes.button (pending cross-batch)

## Verification

[
{
"state": "implemented",
"behavior": "Forward-ref native button source and props exist."
},
{
"state": "unavailable",
"behavior": "React button test runner aborted before executing assertions.",
"command": "pnpm --filter @ultimate/react exec vitest run src/button/button.spec.tsx",
"outcome": "unavailable",
"revision": "f0ad62b3",
"limitations": "Host ancestor PostCSS configuration outside the checkout references an unavailable plugin. No product behavior verified; no external configuration changed.",
"output": "Failed to load PostCSS config: Loading PostCSS Plugin failed: Cannot find module 'postcss-import'; Require stack: /Users/majedsiefalnasr/postcss.config.mjs; exit 1"
}
]
