---
component: Menu
metadataVersion: 1
frameworks: [ng, react, vue]
---

# Menu

## When to use

## Preferred patterns

<!-- ultimate:generated:start section="preferred-patterns" -->

<!-- ultimate:generated:end section="preferred-patterns" -->

## Allowed/recommended APIs

<!-- ultimate:generated:start section="allowed-apis" -->

### ng props

- `model`: UMenuItem[] (default: [])
- `popup`: boolean (default: false)

### react props

- `model`: UMenuItem[] (required)
- `popup`: boolean (default: false)
- `popupAlignment`: "left" | "right" | undefined
- `id`: string | undefined
- `ariaLabel`: string | undefined
- `ariaLabelledBy`: string | undefined
- `className`: string | undefined
- `style`: React.CSSProperties | undefined
- `baseZIndex`: number | undefined
- `appendTo`: HTMLElement | (() => HTMLElement) | undefined
- `closeOnEscape`: boolean (default: true)

### react events

- `onShow` (callback-prop): shown
- `onHide` (callback-prop): hidden

### vue props

- `model`: Array (default: [])
- `popup`: Boolean (default: false)
- `appendTo`: [String, Object] (default: body)
- `autoZIndex`: Boolean (default: true)
- `baseZIndex`: Number (default: 0)
- `tabindex`: Number (default: 0)
- `ariaLabel`: String (default: null)
- `ariaLabelledby`: String (default: null)

### vue events

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
