import { bootstrapApplication, provideClientHydration } from "@angular/platform-browser";
import { applyUltimateTheme } from "@ultimate/themes";
import { ProofPageComponent } from "./app/proof-page.component";
import { provideRouterLinkSupport } from "./app/router-link-support";

/**
 * Applies the real Ultimate Aura preset once, before first render — the
 * same `applyUltimateTheme()` call every `.storybook/preview.ts` file in
 * this repo already uses (see `packages/ng/.storybook/preview.ts`).
 */
applyUltimateTheme();

bootstrapApplication(ProofPageComponent, {
  providers: [provideClientHydration(), ...provideRouterLinkSupport()],
})
  .then(() => {
    // A later Playwright test polls for this attribute on the document's
    // root element to know hydration finished — set only from this
    // post-bootstrap callback, never earlier.
    document.documentElement.setAttribute("data-hydrated", "true");
  })
  .catch((err) => console.error(err));
