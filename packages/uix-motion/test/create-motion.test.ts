import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { createMotion, DEFAULT_MOTION_OPTIONS } from "../src/config";

describe("createMotion", () => {
  it("throws when called without an element", () => {
    // @ts-expect-error - testing runtime guard against missing element
    expect(() => createMotion(undefined)).toThrow();
  });

  it("returns a motion instance for a valid element", () => {
    const el = document.createElement("div");
    const instance = createMotion(el, { disabled: true });
    expect(instance).toBeDefined();
    expect(instance.enter).toBeTypeOf("function");
    expect(instance.leave).toBeTypeOf("function");
    expect(instance.cancel).toBeTypeOf("function");
    expect(instance.update).toBeTypeOf("function");
  });
});

describe("default motion name", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is the Ultimate prefix `u`, not Prime's `p`", () => {
    expect(DEFAULT_MOTION_OPTIONS.name).toBe("u");
  });

  it("generates `u-*` classes when no name is given", () => {
    const el = document.createElement("div");
    const instance = createMotion(el, { safe: false, duration: 1000 });

    void instance.enter();
    expect(el.classList.contains("u-enter-active")).toBe(true);
    expect(el.classList.contains("u-enter-to")).toBe(true);
    expect([...el.classList].some((name) => name.startsWith("p-"))).toBe(false);
    instance.cancel();

    void instance.leave();
    expect(el.classList.contains("u-leave-active")).toBe(true);
    expect(el.classList.contains("u-leave-to")).toBe(true);
    instance.cancel();
  });

  it("keeps an explicit name over the default", () => {
    const el = document.createElement("div");
    const instance = createMotion(el, { name: "u-dialog", safe: false, duration: 1000 });

    void instance.enter();
    expect(el.classList.contains("u-dialog-enter-active")).toBe(true);
    expect(el.classList.contains("u-enter-active")).toBe(false);
    instance.cancel();
  });
});
