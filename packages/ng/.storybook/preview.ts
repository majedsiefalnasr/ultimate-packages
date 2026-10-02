import { applicationConfig, type Preview } from "@storybook/angular";
import { ComponentIdGenerator } from "@ultimate/ng-core";
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
  // `UTooltip`/`UDialog` inject `ComponentIdGenerator` (GAP-006), which the
  // consuming application must provide at bootstrap.
  decorators: [applicationConfig({ providers: [ComponentIdGenerator] })],
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
