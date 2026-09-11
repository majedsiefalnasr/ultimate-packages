import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { applyUltimateTheme } from "@ultimate/themes";
import { App } from "./App";

/**
 * Applies the real Ultimate Aura preset once, before first render — the
 * same call every `.storybook/preview.*` file in this repo already makes
 * (see `packages/react/.storybook/preview.tsx`) — and executed here on the
 * client, matching the server entry's identical call before its render.
 */
applyUltimateTheme();

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element with id "root" not found for hydration.');
}

hydrateRoot(container, <App />);
