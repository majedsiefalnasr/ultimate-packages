import type { Preview } from "@storybook/vue3-vite";
import { applyUltimateTheme } from "@ultimate/themes";

/**
 * Applies the real Ultimate Aura preset (re-exported by `@ultimate/themes`
 * from `packages/themes/src/presets/aura/`) once, before any story renders —
 * matching every `@ultimate/vue` spec file's real runtime dependency on the
 * same `uix-styled` `Theme` singleton every `*-core` package's `StyleSheet`
 * registration reads from (see `packages/react/.storybook/preview.tsx` for
 * the equivalent React pattern this mirrors). No token value is duplicated
 * here.
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
