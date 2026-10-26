# Shared button CSS

ID: shared.button-style

Framework: shared; availability: public

## Authored interpretation

Framework-neutral CSS template exported as style. It supplies tokenized button states and layout rules imported by Angular and Vue style modules; React instead embeds its own small CSS string in button-style.ts; it is not a renderable component or an assertion that all consuming frameworks expose every selector.

## Framework surface

@ultimate/uix-styles/button exports the style string. It includes .u-button, disabled cursor, icon ordering, small/large, fluid, hover, active, focus-visible, severity, outlined, text and link rules with dt(...) token placeholders. Each framework owns its button-style adapter.

## Public exports

@ultimate/uix-styles/button#style

## Owned source and evidence

packages/uix-styles/src/button/index.ts

```text
packages/uix-styles/src/button/index.ts: export const style =
packages/uix-styles/src/button/index.ts: .u-button:focus-visible
packages/ng/src/button/button-style.ts: @ultimate/uix-styles/button
packages/react/src/button/button-style.ts: const css = /*css*/
packages/vue/src/button/button-style.ts: @ultimate/uix-styles/button
```

## Relationships

themes.button (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Tokenized CSS exists; Angular and Vue adapters import it. React owns separate inline CSS; no shared import is claimed."
  },
  {
    "state": "not-run",
    "behavior": "Visual behavior and token rendering are not exercised by inventory validation."
  }
]
```
