import { describe, it, expect } from "vitest";
import { classNames } from "../src/classnames";

describe("classNames", () => {
  it("joins truthy string arguments with a space", () => {
    expect(classNames("a", "b", "c")).toBe("a b c");
  });

  it("skips falsy arguments", () => {
    expect(classNames("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string for no truthy arguments", () => {
    expect(classNames(false, null, undefined)).toBe("");
  });
});
