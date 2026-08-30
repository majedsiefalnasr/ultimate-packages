import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDisplayOrder } from "./use-display-order";
import { useGlobalEscapeKey } from "./use-global-escape-key";
import { ESCAPE_PRIORITIES } from "./priorities";

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
}

describe("useDisplayOrder", () => {
  it("assigns increasing order to successively mounted instances in the same group", () => {
    const { result: first } = renderHook(() => useDisplayOrder("test-group-a", true));
    const { result: second } = renderHook(() => useDisplayOrder("test-group-a", true));
    expect(second.current).toBeGreaterThan(first.current ?? 0);
  });
});

describe("useGlobalEscapeKey", () => {
  afterEach(() => {
    document.removeEventListener("keydown", () => {});
  });

  it("calls the callback on Escape when when is true", () => {
    const callback = vi.fn();
    renderHook(() => useGlobalEscapeKey({ callback, when: true, priority: [ESCAPE_PRIORITIES.DIALOG, 1] }));
    fireEscape();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not call the callback when when is false", () => {
    const callback = vi.fn();
    renderHook(() => useGlobalEscapeKey({ callback, when: false, priority: [ESCAPE_PRIORITIES.DIALOG, 1] }));
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
  });

  it("only the highest-priority-tuple listener fires when two are registered", () => {
    const dialogCallback = vi.fn();
    const menuCallback = vi.fn();
    renderHook(() =>
      useGlobalEscapeKey({ callback: dialogCallback, when: true, priority: [ESCAPE_PRIORITIES.DIALOG, 1] })
    );
    renderHook(() =>
      useGlobalEscapeKey({ callback: menuCallback, when: true, priority: [ESCAPE_PRIORITIES.MENU, 1] })
    );
    fireEscape();
    // MENU (500) > DIALOG (300) — MENU's tuple wins.
    expect(menuCallback).toHaveBeenCalledOnce();
    expect(dialogCallback).not.toHaveBeenCalled();
  });

  it("deregisters on unmount, so a later Escape does not call a stale callback", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useGlobalEscapeKey({ callback, when: true, priority: [ESCAPE_PRIORITIES.TOOLTIP, 1] })
    );
    unmount();
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
  });
});
