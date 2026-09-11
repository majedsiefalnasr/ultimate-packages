import type { ApplicationConfig } from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";
import { provideServerRendering } from "@angular/ssr";
import { provideRouterLinkSupport } from "./router-link-support";

/**
 * Server-only providers for `main.server.ts`'s own standalone bootstrap
 * (not merged with `main.ts`'s client config). No routing/app-shell
 * features (`withRoutes()`/`withAppShell()`): this harness has exactly one
 * page and no router-driven navigation. `provideRouterLinkSupport()` is
 * still required here for the same reason as the client bootstrap (see
 * `main.ts`/`router-link-support.ts`) — `UMenu` imports `RouterModule`,
 * whose `RouterLink` directive injects `Router`/`ActivatedRoute` in its
 * constructor regardless of whether it's ever bound to a real destination.
 *
 * `provideClientHydration()` must also be present here: this harness's
 * `server.ts` uses `@angular/ssr/node`'s `CommonEngine` (see `server.ts`'s
 * own doc comment for why — no `Router`-based route tree exists to drive
 * the newer `AngularAppEngine`/hybrid-rendering pipeline). `CommonEngine`
 * calls `@angular/platform-server`'s `renderApplication()` directly, which
 * only annotates the rendered HTML for hydration
 * (`ɵIS_HYDRATION_DOM_REUSE_ENABLED`) when the *server*-bootstrapped app's
 * own environment injector has hydration enabled — confirmed against
 * `renderApplication`'s real source (`prepareForHydration()` reads that
 * token off `applicationRef.injector`). Without this, the client bootstrap
 * finds no hydration markers in the SSR HTML and falls back to destroying
 * and re-rendering the whole tree from scratch on the client.
 */
export const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), ...provideRouterLinkSupport(), provideClientHydration()],
};
