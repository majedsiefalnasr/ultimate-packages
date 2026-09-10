import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Storybook (React + Vite framework) configuration for `@ultimate/react`.
 *
 * Task 2 (Phase 10 Track A) — builds a real, working Storybook instance
 * rendering all 8 shipped `@ultimate/react` components (Button, Checkbox,
 * Dialog, Menu, Paginator, Scroller, Table, Tooltip) against the Aura
 * preset (see `./preview.tsx`, which imports and applies the real
 * `@ultimate/themes` Aura preset rather than duplicating any token value
 * here) — same structure as Task 1's Angular instance, scoped to React's 8
 * components.
 *
 * `@storybook/react-vite` is used (not `@storybook/react-webpack5`) since
 * this package already builds with Vite-family tooling (`tsup`, itself
 * esbuild/Rollup-based) — no second bundler is introduced.
 *
 * `@storybook/addon-a11y` is enabled below to satisfy this task's
 * accessibility-metadata *display* requirement (R1.3) — distinct from a
 * later task's automated accessibility *scanning* (R4), per the plan's own
 * note that these are separate concerns.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
