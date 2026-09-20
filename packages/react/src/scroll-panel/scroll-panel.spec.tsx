import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { UScrollPanel, type UScrollPanelHandle } from "./scroll-panel";

describe("UScrollPanel", () => {
  it("renders children inside the scroll container", () => {
    render(
      <UScrollPanel>
        <p>Content</p>
      </UScrollPanel>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders both an x and a y scrollbar thumb with role=scrollbar", () => {
    render(<UScrollPanel />);
    expect(screen.getAllByRole("scrollbar").length).toBe(2);
  });

  it("updates aria-valuenow on scroll and does not throw", () => {
    const { container } = render(
      <UScrollPanel>
        <div style={{ height: 500 }}>tall</div>
      </UScrollPanel>
    );
    const content = container.querySelector(".u-scroll-panel-content") as HTMLElement;
    Object.defineProperty(content, "scrollTop", { value: 50, writable: true });
    expect(() =>
      act(() => {
        content.dispatchEvent(new Event("scroll", { bubbles: true }));
      })
    ).not.toThrow();
  });

  it("steps scroll position on ArrowDown keydown while a bar has focus", () => {
    render(
      <UScrollPanel>
        <div style={{ height: 500 }}>tall</div>
      </UScrollPanel>
    );
    const yBar = screen.getAllByRole("scrollbar")[1];
    const keydownEvent = new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true, cancelable: true });
    yBar.dispatchEvent(keydownEvent);
    expect(keydownEvent.defaultPrevented).toBe(true);
  });

  it("exposes refresh() and scrollTop() via the imperative handle", () => {
    const ref = React.createRef<UScrollPanelHandle>();
    render(
      <UScrollPanel ref={ref}>
        <div style={{ height: 500 }}>tall</div>
      </UScrollPanel>
    );
    expect(() => ref.current?.refresh()).not.toThrow();
    expect(() => ref.current?.scrollTop(-100)).not.toThrow();
    expect(() => ref.current?.scrollTop(999999)).not.toThrow();
  });

  it("drags the y-bar thumb to scroll content vertically", () => {
    render(
      <UScrollPanel>
        <div style={{ height: 500 }}>tall</div>
      </UScrollPanel>
    );
    const yBar = screen.getAllByRole("scrollbar")[1];
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(mouseDownEvent, "pageY", { value: 100 });
    yBar.dispatchEvent(mouseDownEvent);
    expect(yBar.classList.contains("u-scroll-panel-bar-grabbed")).toBe(true);

    document.dispatchEvent(new MouseEvent("mouseup"));
    expect(yBar.classList.contains("u-scroll-panel-bar-grabbed")).toBe(false);
  });
});
