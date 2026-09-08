---
component: Scroller
metadataVersion: 1
frameworks: [ng, react, vue]
---

# Scroller

## When to use

## Preferred patterns

<!-- ultimate:generated:start section="preferred-patterns" -->

<!-- ultimate:generated:end section="preferred-patterns" -->

## Allowed/recommended APIs

<!-- ultimate:generated:start section="allowed-apis" -->

### ng props

- `items`: unknown[] (default: [])
- `itemSize`: number (default: 0)
- `numToleratedItems`: number | undefined (default: undefined)
- `loading`: boolean | undefined (default: undefined)
- `disabled`: boolean (default: false)
- `lazy`: boolean (default: false)

### ng events

- `onLazyLoad` (output): lazyLoad

### react props

- `items`: unknown[] (required)
- `itemSize`: number (required)
- `numToleratedItems`: number
- `disabled`: boolean (default: false)
- `lazy`: boolean (default: false)
- `loading`: boolean

### react events

- `onLazyLoad` (callback-prop): lazyLoad

### vue props

- `items`: Array (default: [])
- `itemSize`: Number (default: 0)
- `numToleratedItems`: Number (default: null)
- `disabled`: Boolean (default: false)
- `loading`: Boolean (default: false)
- `lazy`: Boolean (default: false)

### vue events

- `lazy-load` (emit): lazyLoad

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
