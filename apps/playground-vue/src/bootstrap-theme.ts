import { applyUltimateTheme } from "@ultimate/themes";

/**
 * Applies the real Ultimate Aura preset once, before first render — the same
 * call every `.storybook/preview.*` file in this repo already makes (see
 * `packages/vue/.storybook/preview.ts`). Imported by both entry-client.ts and
 * entry-server.ts so the call happens exactly once per environment, in a
 * location both entries execute before any component renders, per this
 * plan's binding theme-loading placement rule (applies identically to Tasks
 * 2-4). `applyUltimateTheme()` itself is confirmed SSR-safe by construction
 * (touches only in-memory Theme/uix-styled state, no document/window
 * reference anywhere in its call chain) — no environment gating is needed.
 */
applyUltimateTheme();
