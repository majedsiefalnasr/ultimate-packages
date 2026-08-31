import { describe, it, expect, beforeEach } from "vitest";
import { scrollLockRegistry } from "../src/scroll-lock";

describe("scrollLockRegistry", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  it("registering the first id blocks body scroll", () => {
    scrollLockRegistry.register("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    scrollLockRegistry.unregister("dialog-1");
  });

  it("registering a second id while one is already blocking does not re-toggle", () => {
    scrollLockRegistry.register("dialog-1");
    scrollLockRegistry.register("dialog-2");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    scrollLockRegistry.unregister("dialog-1");
    scrollLockRegistry.unregister("dialog-2");
  });

  it("unregistering one of two blocking ids keeps scroll blocked", () => {
    scrollLockRegistry.register("dialog-1");
    scrollLockRegistry.register("dialog-2");
    scrollLockRegistry.unregister("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    scrollLockRegistry.unregister("dialog-2");
  });

  it("unregistering the last blocking id unblocks scroll", () => {
    scrollLockRegistry.register("dialog-1");
    scrollLockRegistry.unregister("dialog-1");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregistering an id that was never registered is a no-op", () => {
    scrollLockRegistry.unregister("never-registered");
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});
