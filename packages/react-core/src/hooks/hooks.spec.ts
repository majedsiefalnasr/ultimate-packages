import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMergeProps } from "./use-merge-props";
import { useMountEffect } from "./use-mount-effect";
import { useUnmountEffect } from "./use-unmount-effect";
import { useUpdateEffect } from "./use-update-effect";
import { usePrevious } from "./use-previous";
import { useEventListener } from "./use-event-listener";
import { useResizeListener } from "./use-resize-listener";

describe("useMergeProps", () => {
  it("concatenates className across prop sets", () => {
    const { result } = renderHook(() => useMergeProps());
    const merged = result.current({ className: "a" }, { className: "b" });
    expect(merged.className).toBe("a b");
  });

  it("composes event handlers instead of overwriting", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() => useMergeProps());
    const merged = result.current({ onClick: first }, { onClick: second });
    (merged.onClick as (e: unknown) => void)({});
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("later prop sets win for non-className, non-handler keys", () => {
    const { result } = renderHook(() => useMergeProps());
    const merged = result.current({ id: "a" }, { id: "b" });
    expect(merged.id).toBe("b");
  });
});

describe("useMountEffect", () => {
  it("runs the effect exactly once on mount, not on re-render", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(() => useMountEffect(effect));
    rerender();
    rerender();
    expect(effect).toHaveBeenCalledOnce();
  });
});

describe("useUnmountEffect", () => {
  it("runs the cleanup exactly once on unmount, not on re-render", () => {
    const cleanup = vi.fn();
    const { rerender, unmount } = renderHook(() => useUnmountEffect(cleanup));
    rerender();
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
  });
});

describe("useUpdateEffect", () => {
  it("skips the first (mount) run and fires on subsequent dep changes", () => {
    const effect = vi.fn();
    let dep = 0;
    const { rerender } = renderHook(() => useUpdateEffect(effect, [dep]));
    expect(effect).not.toHaveBeenCalled();
    dep = 1;
    rerender();
    expect(effect).toHaveBeenCalledOnce();
  });
});

describe("usePrevious", () => {
  it("returns undefined on first render, then the prior value on subsequent renders", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });
    expect(result.current).toBeUndefined();
    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });
});

describe("useEventListener", () => {
  it("bind attaches the listener, unbind removes it", () => {
    const listener = vi.fn();
    const target = document.createElement("div");
    const { result } = renderHook(() => useEventListener({ target, type: "click", listener }));
    const [bind, unbind] = result.current;
    act(() => bind());
    target.dispatchEvent(new Event("click"));
    expect(listener).toHaveBeenCalledOnce();
    act(() => unbind());
    target.dispatchEvent(new Event("click"));
    expect(listener).toHaveBeenCalledOnce();
  });
});

describe("useResizeListener", () => {
  it("bind attaches a window resize listener, unbind removes it", () => {
    const listener = vi.fn();
    const { result } = renderHook(() => useResizeListener({ listener }));
    const [bind, unbind] = result.current;
    act(() => bind());
    window.dispatchEvent(new Event("resize"));
    expect(listener).toHaveBeenCalledOnce();
    act(() => unbind());
    window.dispatchEvent(new Event("resize"));
    expect(listener).toHaveBeenCalledOnce();
  });
});
