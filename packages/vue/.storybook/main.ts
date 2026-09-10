import type { StorybookConfig } from "@storybook/vue3-vite";
import vue from "@vitejs/plugin-vue";

/**
 * Storybook (Vue 3 + Vite framework) configuration for `@ultimate/vue`.
 *
 * Task 3 (Phase 10 Track A) — builds a real, working Storybook instance
 * rendering all 9 shipped `@ultimate/vue` items (Button, Checkbox, Dialog,
 * Menu, Paginator, Scroller, Table, Tooltip — the shared 8 — plus Ripple, a
 * directive with no `component-metadata` record, per the approved plan's §0
 * correction) against the Aura preset (see `./preview.ts`, which imports and
 * applies the real `@ultimate/themes` Aura preset rather than duplicating
 * any token value here) — same structure as Task 1's Angular and Task 2's
 * React instances, scoped to Vue's 9 items.
 *
 * `@storybook/vue3-vite` is used since this package already builds/tests
 * with Vite-family tooling (`vite`, `@vitejs/plugin-vue`, `vitest`) — no
 * second bundler is introduced.
 *
 * `@storybook/vue3-vite`'s own preset only wires a template-string
 * compilation plugin (for inline CSF `template:` strings in stories) — it
 * does NOT ship `@vitejs/plugin-vue` for real `.vue` SFC files (confirmed by
 * reading its shipped `preset.js`: its `viteFinal` only adds
 * `templateCompilation()` plus optional docgen plugins). Button, Checkbox,
 * Dialog, Menu, Paginator, Scroller, and Table are all real `.vue` SFCs
 * (`Button.vue`, `Checkbox.vue`, etc.) that Storybook's own Vite build would
 * otherwise fail to parse. `viteFinal` below adds the same
 * `@vitejs/plugin-vue` plugin this package's own `vite.config.ts` (used for
 * `vitest`) already registers — no new dependency, matching the project's
 * own established SFC-compilation setup.
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
    name: "@storybook/vue3-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(viteConfig, {
      plugins: [vue()],
    });
  },
};

export default config;
