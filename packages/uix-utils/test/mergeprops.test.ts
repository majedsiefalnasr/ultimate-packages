import { describe, it, expect } from "vitest";
import { mergeProps, mergeDefaultProps } from "../src/mergeprops";

describe("mergeProps", () => {
  it("later arguments override earlier ones for plain keys", () => {
    const result = mergeProps({ id: "a", tabIndex: 1 }, { id: "b" });

    expect(result).toEqual({ id: "b", tabIndex: 1 });
  });

  it("merges class keys via classNames instead of overwriting", () => {
    const result = mergeProps({ class: "foo" }, { class: "bar" });

    expect(result).toEqual({ class: "foo bar" });
  });

  it("merges className keys via classNames instead of overwriting", () => {
    const result = mergeProps({ className: "foo" }, { className: "bar" });

    expect(result).toEqual({ className: "foo bar" });
  });

  it("merges style objects instead of overwriting", () => {
    const result = mergeProps(
      { style: { color: "red" } },
      { style: { background: "blue" } }
    ) as Record<string, unknown>;

    expect(result.style).toEqual({ color: "red", background: "blue" });
  });
});

describe("mergeDefaultProps", () => {
  it("skips undefined values from later arguments, unlike mergeProps", () => {
    const result = mergeDefaultProps({ id: "a" }, { id: undefined });

    expect(result).toEqual({ id: "a" });
  });
});
