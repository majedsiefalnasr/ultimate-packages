import { describe, it, expect, afterEach } from "vitest";
import { useScrollLock } from "./use-scroll-lock";

describe("useScrollLock", () => {
  afterEach(() => {
    const { unregister } = useScrollLock();
    unregister("dialog-1");
    unregister("dialog-2");
    document.body.className = "";
  });

  it("registering the first dialog blocks body scroll", () => {
    const { register } = useScrollLock();
    register("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("unregistering the last blocking dialog unblocks scroll", () => {
    const { register, unregister } = useScrollLock();
    register("dialog-1");
    unregister("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregistering an id that was never registered is a no-op", () => {
    const { unregister } = useScrollLock();
    expect(() => unregister("never-registered")).not.toThrow();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});
