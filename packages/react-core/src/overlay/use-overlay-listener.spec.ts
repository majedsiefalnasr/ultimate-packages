import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOverlayListener } from "./use-overlay-listener";

describe("useOverlayListener", () => {
  it("fires the listener with type 'outside' on a click outside both target and overlay", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listener = vi.fn();

    const { result } = renderHook(() =>
      useOverlayListener({ target, overlay, listener, when: true })
    );
    const [bind] = result.current;
    act(() => bind());

    const outsideEl = document.createElement("div");
    document.body.appendChild(outsideEl);
    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(listener).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: "outside", valid: true })
    );

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
    document.body.removeChild(outsideEl);
  });

  it("does not fire for a click on the target itself", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listener = vi.fn();

    const { result } = renderHook(() =>
      useOverlayListener({ target, overlay, listener, when: true })
    );
    const [bind] = result.current;
    act(() => bind());

    target.current.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(listener).not.toHaveBeenCalled();

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
  });

  it("stops firing after unbind, even when the caller's listener identity changes between bind and unbind (regression: unbind must remove the exact function addEventListener received, not re-derive it from a possibly-changed closure)", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    const outsideEl = document.createElement("div");
    document.body.appendChild(outsideEl);

    // Real consumers (e.g. UMenu) call bind() from one effect run and unbind() later
    // from a different render's closure whose derived listener callback has since
    // changed identity — e.g. menu.tsx's `hide` is useCallback(..., [visible]), and
    // `visible` is exactly the value that flips between the bind-time render
    // (visible=true) and the unbind-time render (visible=false, from useMotion's
    // onAfterLeave). Reproduce that exact failure mode: bind while the hook's
    // `listener` prop is listenerA, re-render with a genuinely different listenerB
    // (not the same reference held constant), then unbind from that later render.
    const { result, rerender } = renderHook(
      ({ listener }) => useOverlayListener({ target, overlay, listener, when: true }),
      { initialProps: { listener: listenerA } }
    );
    const [bind] = result.current;
    act(() => bind());

    rerender({ listener: listenerB });
    const [, unbind] = result.current;

    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // The listener actually attached to the DOM is still listenerA (bind() only ever
    // ran once, while the prop was listenerA) — listenerB must not have been invoked.
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).not.toHaveBeenCalled();

    act(() => unbind());
    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // Neither listener may fire again — if unbind's removeEventListener re-derived the
    // function to remove from the current-render closure (listenerB) instead of the
    // one actually attached (listenerA), removeEventListener would silently no-op and
    // listenerA would still be live here.
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).not.toHaveBeenCalled();

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
    document.body.removeChild(outsideEl);
  });

  it("stops firing resize events after unbind under the same changed-listener-identity scenario", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    const { result, rerender } = renderHook(
      ({ listener }) => useOverlayListener({ target, overlay, listener, when: true }),
      { initialProps: { listener: listenerA } }
    );
    const [bind] = result.current;
    act(() => bind());

    rerender({ listener: listenerB });
    const [, unbind] = result.current;

    act(() => unbind());
    window.dispatchEvent(new Event("resize"));
    // If unbind's removeEventListener targeted the wrong function object (derived
    // from the post-rerender listenerB closure instead of the actually-attached
    // listenerA-derived callback), the resize listener would still be live here.
    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).not.toHaveBeenCalled();

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
  });
});
