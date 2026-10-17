import { createSSRApp } from "vue";
import "./bootstrap-theme";
import App from "./App.vue";

/**
 * Mounting an SSR app (createSSRApp) on the client assumes pre-rendered HTML
 * is already present and performs hydration rather than fresh DOM creation —
 * Vue's own documented behavior (vuejs.org/guide/scaling-up/ssr.html).
 * bootstrap-theme's applyUltimateTheme() call executes as a side effect of
 * the import above, before App.vue's first render.
 */
const container = document.getElementById("app");
if (!container) {
  throw new Error('Root element with id "app" not found for hydration.');
}

createSSRApp(App).mount(container);
// ADR-057 Stage 1 P8 "time to hydrated" (scripts/perf/run-stage1.mjs):
// mount() hydrates synchronously, including App.vue's onMounted hook.
performance.mark("u-perf:hydrated");
