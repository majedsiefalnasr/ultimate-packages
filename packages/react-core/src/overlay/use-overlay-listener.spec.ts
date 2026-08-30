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

  it("stops firing after unbind, even when bind and unbind are called from different renders (regression: a fresh inline listener function on every render must not make addEventListener/removeEventListener target different function objects)", () => {
    const target = { current: document.createElement("div") };
    const overlay = { current: document.createElement("div") };
    document.body.append(target.current, overlay.current);
    const listener = vi.fn();
    const outsideEl = document.createElement("div");
    document.body.appendChild(outsideEl);

    // Real consumers (e.g. UMenu) call bind() from one effect run and unbind() later
    // from a different render's closure (e.g. useMotion's onAfterLeave, or an
    // unmount-effect) — not necessarily in the same render pass. Capture bind from
    // render N, then re-render (forcing useOverlayListener's internals to run again,
    // as any real consumer's own re-render would) and capture unbind from render N+1,
    // reproducing that exact real-world timing.
    const { result, rerender } = renderHook(() =>
      useOverlayListener({ target, overlay, listener, when: true })
    );
    const [bind] = result.current;
    act(() => bind());

    rerender();
    const [, unbind] = result.current;

    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(listener).toHaveBeenCalledTimes(1);

    act(() => unbind());
    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // Listener must NOT have fired again — if unbind's removeEventListener silently
    // no-opped because it targeted a different function object than the one actually
    // passed to addEventListener, this would be called a second time here.
    expect(listener).toHaveBeenCalledTimes(1);

    document.body.removeChild(target.current);
    document.body.removeChild(overlay.current);
    document.body.removeChild(outsideEl);
  });
});
