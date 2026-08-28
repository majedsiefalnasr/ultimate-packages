import { describe, it, expect } from "vitest";
import { hasClass, addClass, removeClass } from "../src/dom";

describe("dom classList helpers", () => {
  it("addClass adds a class that hasClass then detects", () => {
    const el = document.createElement("div");

    expect(hasClass(el, "active")).toBe(false);

    addClass(el, "active");

    expect(hasClass(el, "active")).toBe(true);
  });

  it("removeClass removes a class that hasClass then no longer detects", () => {
    const el = document.createElement("div");

    addClass(el, "active");
    expect(hasClass(el, "active")).toBe(true);

    removeClass(el, "active");

    expect(hasClass(el, "active")).toBe(false);
  });

  it("addClass supports multiple space-separated classes and array input", () => {
    const el = document.createElement("div");

    addClass(el, "a b");
    addClass(el, ["c", "d"]);

    expect(hasClass(el, "a")).toBe(true);
    expect(hasClass(el, "b")).toBe(true);
    expect(hasClass(el, "c")).toBe(true);
    expect(hasClass(el, "d")).toBe(true);
  });
});
