import * as React from "react";
import { renderToPipeableStream } from "react-dom/server";
import type { PipeableStream } from "react-dom/server";
import { applyUltimateTheme } from "@ultimate/themes";
import { App } from "./App";

/**
 * Applies the real Ultimate Aura preset once, before first render — the
 * same call the client entry makes (see entry-client.tsx) — so server-
 * rendered markup and client-hydrated markup are produced against the same
 * applied theme.
 */
applyUltimateTheme();

export interface RenderOptions {
  onShellReady: () => void;
  onError: (error: unknown) => void;
}

/**
 * Renders the app to a Node pipeable stream, per
 * react.dev/reference/react-dom/server/renderToPipeableStream —
 * `renderToString` is not used (binding architectural decision). Fixtures
 * are entirely static (no data-fetching Suspense boundary), so
 * `onShellReady` fires immediately once the synchronous render completes.
 */
export function render(options: RenderOptions): PipeableStream {
  return renderToPipeableStream(<App />, {
    onShellReady: options.onShellReady,
    onError: options.onError,
  });
}
