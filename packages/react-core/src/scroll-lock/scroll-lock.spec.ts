import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollLock } from "./use-scroll-lock";

describe("useScrollLock", () => {
  beforeEach(() => {
    document.body.className = "";
  });

  // useScrollLock's registry is an intentionally private, module-scoped Set (not
  // exported, not a document property — see use-scroll-lock.ts). Real consumers
  // (UDialog instances) always call unregister on unmount, so the registry
  // self-cleans in production. Tests must do the same explicitly, since nothing
  // resets the module singleton between test runs. Draining every id any test in
  // this file might have registered is safe: unregistering an id that isn't
  // present is a documented no-op (see the last test below).
  afterEach(() => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.unregister("dialog-1");
      result.current.unregister("dialog-2");
      result.current.unregister("never-registered");
    });
  });

  it("registering the first dialog blocks body scroll", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => result.current.register("dialog-1"));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("registering a second dialog while one is already blocking does not re-toggle", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.register("dialog-1");
      result.current.register("dialog-2");
    });
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("unregistering one of two blocking dialogs keeps scroll blocked", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.register("dialog-1");
      result.current.register("dialog-2");
      result.current.unregister("dialog-1");
    });
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
  });

  it("unregistering the last blocking dialog unblocks scroll", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => {
      result.current.register("dialog-1");
      result.current.unregister("dialog-1");
    });
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });

  it("unregistering an id that was never registered is a no-op", () => {
    const { result } = renderHook(() => useScrollLock());
    act(() => result.current.unregister("never-registered"));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});
