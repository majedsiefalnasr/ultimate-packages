---
component: Dialog
metadataVersion: 1
frameworks: [ng, react, vue]
---

# Dialog

## When to use

## Preferred patterns

<!-- ultimate:generated:start section="preferred-patterns" -->

<!-- ultimate:generated:end section="preferred-patterns" -->

## Allowed/recommended APIs

<!-- ultimate:generated:start section="allowed-apis" -->
### ng props
- `visible`: boolean (default: false)
- `header`: string | undefined
- `closable`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `modal`: boolean (default: true)
### ng events
- `visibleChange` (output): visibleChange
- `onShow` (output): shown
- `onHide` (output): hidden
### react props
- `visible`: boolean (required)
- `header`: React.ReactNode
- `footer`: React.ReactNode
- `children`: React.ReactNode
- `modal`: boolean (default: true)
- `closable`: boolean (default: true)
- `showCloseIcon`: boolean (default: true)
- `closeOnEscape`: boolean (default: false)
- `dismissableMask`: boolean (default: false)
- `blockScroll`: boolean (default: false)
- `baseZIndex`: number | undefined
- `appendTo`: HTMLElement | (() => HTMLElement) | undefined
- `className`: string | undefined
- `style`: React.CSSProperties | undefined
- `id`: string | undefined
- `focusOnShow`: boolean (default: true)
### react events
- `onHide` (callback-prop): hidden
### vue props
- `visible`: Boolean (default: false)
- `header`: String (default: null)
- `footer`: String (default: null)
- `modal`: Boolean (default: true)
- `closable`: Boolean (default: true)
- `closeOnEscape`: Boolean (default: true)
- `dismissableMask`: Boolean (default: false)
- `blockScroll`: Boolean (default: false)
- `baseZIndex`: Number (default: 0)
- `autoZIndex`: Boolean (default: true)
- `position`: String (default: center)
- `appendTo`: [String, Object] (default: body)
- `ariaCloseLabel`: String (default: Close)
### vue events
- `update:visible` (emit): visibleChange
- `show` (emit): shown
- `hide` (emit): hidden
<!-- ultimate:generated:end section="allowed-apis" -->

## Anti-patterns

<!-- ultimate:generated:start section="anti-patterns" -->

<!-- ultimate:generated:end section="anti-patterns" -->

## Accessibility guidance

<!-- ultimate:generated:start section="accessibility-guidance" -->

<!-- ultimate:generated:end section="accessibility-guidance" -->

## Related components

<!-- ultimate:generated:start section="related-components" -->

<!-- ultimate:generated:end section="related-components" -->

## Framework-specific guidance
