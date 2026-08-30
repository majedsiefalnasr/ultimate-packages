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
});
