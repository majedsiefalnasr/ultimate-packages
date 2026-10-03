import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { reactCoreStyleSheet } from "./react-style-sheet";
import { useComponentStyle } from "./use-component-style";

function Probe() {
  useComponentStyle("hidden-accessible-probe", { css: ".hap {}", classes: {} });
  return <span className="hap">x</span>;
}

describe("shared u-hidden-accessible rule (GAP-074)", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers the shared u-hidden-accessible rule on first mount, once, without a theme", () => {
    render(<Probe />);
    render(<Probe />);
    expect(reactCoreStyleSheet.has("u-hidden-accessible")).toBe(true);
    expect(
      Array.from(document.head.querySelectorAll("style")).filter((s) =>
        (s.textContent ?? "").includes(".u-hidden-accessible {")
      )
    ).toHaveLength(1);
  });
});
