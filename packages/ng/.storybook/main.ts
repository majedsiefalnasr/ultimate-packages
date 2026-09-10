import type { StorybookConfig } from "@storybook/angular";

/**
 * Storybook (Angular framework) configuration for `@ultimate/ng`.
 *
 * Task 1 (Phase 10 Track A) — builds a real, working Storybook instance
 * rendering all 12 shipped `@ultimate/ng` components/directives (Button,
 * Checkbox, Dialog, Menu, Paginator, Scroller, Table, Tooltip, Fluid, Badge,
 * Ripple, AutoFocus) against the Aura preset (see `./preview.ts`, which
 * imports and applies the real `@ultimate/themes` Aura preset rather than
 * duplicating any token value here).
 *
 * `@storybook/addon-a11y` is enabled below to satisfy this task's
 * accessibility-metadata *display* requirement (R1.3) — distinct from a
 * later task's automated accessibility *scanning* (R4), per the plan's own
 * note that these are separate concerns.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/angular",
    options: {
      // The `build`/`browserTarget` architect target in ../angular.json uses
      // ng-packagr's own library tsconfig (../tsconfig.json), which only
      // includes `src` — not `.storybook/`. tsconfig.storybook.json extends
      // it and adds `.storybook/**/*.ts` so ngtools/webpack can compile
      // this config directory's own TS files.
      tsConfig: "tsconfig.storybook.json",
    },
  },
};

export default config;
