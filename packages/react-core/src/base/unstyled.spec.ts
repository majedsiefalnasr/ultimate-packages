import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useComponentBase, type StyleModule } from "./component-base";
import { reactCoreStyleSheet } from "../styling/react-style-sheet";

/**
 * F15: per-instance `unstyled`. Oracle: PrimeReact 10.9.9 `ComponentBase`
 * (`isUnstyled`, `cx`, `useHandleStyle`). PrimeReact has no per-instance
 * `dt`, so there is none here (D-SHARED #5).
 */
const styleModule: StyleModule = {
  css: ".u-unstyled-demo { color: red; }",
  classes: { root: () => "u-unstyled-demo" },
};

function setup(unstyled?: boolean, name = "unstyled-demo") {
  return renderHook(
    (props: { unstyled?: boolean }) =>
      useComponentBase({ componentName: name, styleModule, unstyled: props.unstyled }),
    { initialProps: { unstyled } }
  );
}

afterEach(() => {
  reactCoreStyleSheet.clear();
  document.head.querySelectorAll("style").forEach((el) => el.remove());
});

describe("useComponentBase — unstyled", () => {
  it("resolves classes and reports isUnstyled=false by default", () => {
    const { result } = setup();
    expect(result.current.isUnstyled).toBe(false);
    expect(result.current.cx("root")).toBe("u-unstyled-demo");
  });

  it("keeps the classes for unstyled=false", () => {
    const { result } = setup(false);
    expect(result.current.isUnstyled).toBe(false);
    expect(result.current.cx("root")).toBe("u-unstyled-demo");
  });

  it("makes cx() return undefined when unstyled", () => {
    const { result } = setup(true);
    expect(result.current.isUnstyled).toBe(true);
    expect(result.current.cx("root")).toBeUndefined();
  });

  it("registers no component css, theme variables or box-model rule when unstyled", () => {
    setup(true);
    expect(reactCoreStyleSheet.has("unstyled-demo")).toBe(false);
    expect(reactCoreStyleSheet.has("unstyled-demo-variables")).toBe(false);
    expect(reactCoreStyleSheet.has("u-box-model:unstyled-demo")).toBe(false);
  });

  it("still registers the shared hidden-accessible rule when unstyled", () => {
    setup(true);
    expect(reactCoreStyleSheet.has("u-hidden-accessible")).toBe(true);
  });

  it("registers the component css when styled", () => {
    setup();
    expect(reactCoreStyleSheet.has("unstyled-demo")).toBe(true);
  });

  it("registers the component css and restores the classes when unstyled turns off", () => {
    const { result, rerender } = setup(true);
    expect(reactCoreStyleSheet.has("unstyled-demo")).toBe(false);

    rerender({ unstyled: false });

    expect(reactCoreStyleSheet.has("unstyled-demo")).toBe(true);
    expect(result.current.cx("root")).toBe("u-unstyled-demo");
  });

  it("drops the classes when unstyled turns on", () => {
    const { result, rerender } = setup();
    rerender({ unstyled: true });
    expect(result.current.cx("root")).toBeUndefined();
  });
});
