---
component: Tooltip
metadataVersion: 1
frameworks: [ng, react, vue]
---

# Tooltip

## When to use

## Preferred patterns

<!-- ultimate:generated:start section="preferred-patterns" -->

<!-- ultimate:generated:end section="preferred-patterns" -->

## Allowed/recommended APIs

<!-- ultimate:generated:start section="allowed-apis" -->
### ng props
- `uTooltip`: string | undefined
- `uTooltipPosition`: "top" | "bottom" | "left" | "right" (default: "top")
- `uTooltipDisabled`: boolean (default: false)
### react props
- `target`: React.RefObject<HTMLElement> | HTMLElement | string | string[] (required)
- `content`: React.ReactNode | undefined
- `position`: "right" | "left" | "top" | "bottom" (default: "right")
- `event`: "hover" | "focus" | "both" (default: "hover")
- `showDelay`: number (default: 0)
- `hideDelay`: number (default: 0)
- `disabled`: boolean (default: false)
- `closeOnEscape`: boolean (default: false)
- `autoZIndex`: boolean (default: true)
- `baseZIndex`: number | undefined
- `id`: string | undefined
- `className`: string | undefined
### vue props
- `value`: string (required)
- `disabled`: boolean | undefined
- `escape`: boolean (default: true)
- `class`: string | undefined
- `fitContent`: boolean (default: true)
- `id`: string | undefined
- `showDelay`: number (default: 0)
- `hideDelay`: number (default: 0)
- `autoHide`: boolean (default: true)
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
