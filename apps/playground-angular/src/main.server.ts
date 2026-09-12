import type { BootstrapContext } from "@angular/platform-browser";
import { bootstrapApplication } from "@angular/platform-browser";
import { applyUltimateTheme } from "@ultimate/themes";
import { ProofPageComponent } from "./app/proof-page.component";
import { serverConfig } from "./app/app.config.server";

/**
 * Applies the real Ultimate Aura preset once, before first render — same
 * call/placement rule as `main.ts` (the client entry), so SSR-rendered
 * markup reflects the same tokens the client will hydrate against.
 */
applyUltimateTheme();

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(ProofPageComponent, serverConfig, context);

export default bootstrap;
