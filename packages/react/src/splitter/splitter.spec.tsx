import * as React from "react";
import { render, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { USplitter } from "./splitter";

function mockOffset(el: HTMLElement, width: number): void {
  Object.defineProperty(el, "offsetWidth", { value: width, configurable: true });
}

/** jsdom's `MouseEvent` doesn't accept `pageX`/`pageY` via its constructor init dict — set them directly (real, readonly-in-spec but writable-in-jsdom properties). */
function mouseEventAt(type: string, pageX: number): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true });
  Object.defineProperty(event, "pageX", { value: pageX, configurable: true });
  Object.defineProperty(event, "pageY", { value: 0, configurable: true });
  return event;
}

describe("USplitter", () => {
  it("renders one panel wrapper per panels entry, with gutters between them", () => {
    const { container } = render(
      <USplitter panels={[{ content: "Left" }, { content: "Right" }]} />
    );
    const panels = container.querySelectorAll(".u-splitter-panel");
    const gutters = container.querySelectorAll(".u-splitter-gutter");
    expect(panels.length).toBe(2);
    expect(gutters.length).toBe(1);
    expect(panels[0].textContent).toBe("Left");
    expect(panels[1].textContent).toBe("Right");
  });

  it("distributes initial panel sizes evenly", () => {
    const { container } = render(
      <USplitter panels={[{ content: "A" }, { content: "B" }]} />
    );
    const panels = container.querySelectorAll<HTMLElement>(".u-splitter-panel");
    expect(panels[0].style.flexBasis).toContain("50%");
    expect(panels[1].style.flexBasis).toContain("50%");
  });

  it("resizes panels on a mousedown/mousemove/mouseup drag sequence", () => {
    const { container } = render(
      <USplitter panels={[{ content: "A" }, { content: "B" }]} />
    );
    const root = container.querySelector(".u-splitter") as HTMLElement;
    mockOffset(root, 400);
    const gutter = container.querySelector(".u-splitter-gutter") as HTMLElement;

    act(() => {
      gutter.dispatchEvent(mouseEventAt("mousedown", 200));
      document.dispatchEvent(mouseEventAt("mousemove", 240));
      document.dispatchEvent(mouseEventAt("mouseup", 240));
    });

    const panels = container.querySelectorAll<HTMLElement>(".u-splitter-panel");
    expect(panels[0].style.flexBasis).toContain("60%");
  });

  it("clamps resize against each panel's minSize", () => {
    const { container } = render(
      <USplitter panels={[{ content: "A", minSize: 45 }, { content: "B" }]} />
    );
    const root = container.querySelector(".u-splitter") as HTMLElement;
    mockOffset(root, 400);
    const gutter = container.querySelector(".u-splitter-gutter") as HTMLElement;

    act(() => {
      gutter.dispatchEvent(mouseEventAt("mousedown", 200));
      document.dispatchEvent(mouseEventAt("mousemove", 0));
      document.dispatchEvent(mouseEventAt("mouseup", 0));
    });

    const panels = container.querySelectorAll<HTMLElement>(".u-splitter-panel");
    expect(panels[0].style.flexBasis).toContain("45%");
  });

  it("resizes on ArrowRight keydown for a horizontal layout, by step", () => {
    const { container } = render(
      <USplitter panels={[{ content: "A" }, { content: "B" }]} step={10} />
    );
    const root = container.querySelector(".u-splitter") as HTMLElement;
    mockOffset(root, 400);
    const handle = container.querySelector(".u-splitter-gutter-handle") as HTMLElement;

    act(() => {
      handle.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: "ArrowRight" }));
      handle.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    });

    const panels = container.querySelectorAll<HTMLElement>(".u-splitter-panel");
    expect(panels[0].style.flexBasis).not.toContain("50%");
  });

  it("calls onResizeStart and onResizeEnd around a drag", () => {
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();
    const { container } = render(
      <USplitter
        panels={[{ content: "A" }, { content: "B" }]}
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
      />
    );
    const root = container.querySelector(".u-splitter") as HTMLElement;
    mockOffset(root, 400);
    const gutter = container.querySelector(".u-splitter-gutter") as HTMLElement;

    act(() => {
      gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    });
    expect(onResizeStart).toHaveBeenCalledTimes(1);
    act(() => {
      document.dispatchEvent(mouseEventAt("mouseup", 200));
    });
    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it("applies vertical layout class", () => {
    const { container } = render(
      <USplitter panels={[{ content: "A" }, { content: "B" }]} layout="vertical" />
    );
    expect(container.querySelector(".u-splitter")?.className).toContain("u-splitter-vertical");
  });
});
