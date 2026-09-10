import type { Preview } from "@storybook/angular";
import { applyUltimateTheme } from "@ultimate/themes";

/**
 * Applies the real Ultimate Aura preset (re-exported by `@ultimate/themes`
 * from `packages/themes/src/presets/aura/`) once, before any story renders —
 * matching every `@ultimate/ng` spec file's own `beforeAll(() =>
 * applyUltimateTheme())` convention (see e.g.
 * `packages/ng/src/button/button.spec.ts`). No token value is duplicated
 * here: this call configures the same `uix-styled` `Theme` singleton every
 * `*-core` package's `StyleSheet` registration reads from.
 */
applyUltimateTheme();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
