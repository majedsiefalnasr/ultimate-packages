import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import "./bootstrap-theme";
import App from "./App.vue";

/**
 * Renders the app to an HTML string via `renderToString` from
 * `vue/server-renderer`, per vuejs.org/guide/scaling-up/ssr.html — Vue's
 * own real, documented SSR API (unlike React's Track, Vue's binding
 * architectural decision specifically calls for `renderToString`, not
 * streaming). Fixtures are entirely static, so no async data-fetching is
 * needed before the render resolves. bootstrap-theme's applyUltimateTheme()
 * call executes as a side effect of the import above, before App.vue's
 * first render — the same call the client entry makes.
 */
export async function render(): Promise<string> {
  const app = createSSRApp(App);
  return renderToString(app);
}
