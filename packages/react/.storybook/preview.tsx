import type { Preview } from "@storybook/react-vite";
import { applyUltimateTheme } from "@ultimate/themes";

/**
 * Applies the real Ultimate Aura preset (re-exported by `@ultimate/themes`
 * from `packages/themes/src/presets/aura/`) once, before any story renders —
 * matching every `@ultimate/react` spec file's real runtime dependency on
 * the same `uix-styled` `Theme` singleton every `*-core` package's
 * `StyleSheet` registration reads from (see `packages/ng/.storybook/preview.ts`
 * for the equivalent Angular pattern this mirrors). No token value is
 * duplicated here.
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
