// @vitest-environment node
import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useComponentStyle } from "./use-component-style";
import { reactCoreStyleSheet } from "./react-style-sheet";

function Probe() {
  useComponentStyle("ssr-contract-probe", { css: ".ssr-contract-probe{color:red}", classes: {} });
  return <span className="ssr-contract-probe">x</span>;
}

describe("React styling server contract (GAP-078)", () => {
  it("server render emits no <style> and registers nothing (client-only injection)", () => {
    expect(typeof document).toBe("undefined");
    const html = renderToString(<Probe />);
    expect(html).not.toContain("<style");
    expect(reactCoreStyleSheet.has("ssr-contract-probe")).toBe(false);
  });
});
