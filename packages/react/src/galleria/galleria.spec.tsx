import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UGalleria } from "./galleria";

const items = ["a.png", "b.png", "c.png"];
const itemTemplate = (item: string) => <img className="active-item" src={item} />;

function getActiveItemImage(container: HTMLElement): HTMLImageElement {
  return container.querySelector(".u-galleria-item-container img") as HTMLImageElement;
}

describe("UGalleria", () => {
  it("renders the active item via itemTemplate", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    expect(getActiveItemImage(container).src).toContain("a.png");
  });

  it("renders a thumbnail per item", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    expect(container.querySelectorAll(".u-galleria-thumbnail-item")).toHaveLength(3);
  });

  it("navigates forward and backward via the nav buttons", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    fireEvent.click(screen.getByLabelText("Next"));
    expect(getActiveItemImage(container).src).toContain("b.png");
    fireEvent.click(screen.getByLabelText("Previous"));
    expect(getActiveItemImage(container).src).toContain("a.png");
  });

  it("disables prev at the first item and next at the last item when not circular", () => {
    render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    expect(screen.getByLabelText("Previous")).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Next"));
    fireEvent.click(screen.getByLabelText("Next"));
    expect(screen.getByLabelText("Next")).toBeDisabled();
  });

  it("wraps around when circular", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} circular />);
    fireEvent.click(screen.getByLabelText("Previous"));
    expect(getActiveItemImage(container).src).toContain("c.png");
  });

  it("jumps to an item when its thumbnail is clicked", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    const thumbnails = container.querySelectorAll(".u-galleria-thumbnail-item");
    fireEvent.click(thumbnails[2]);
    expect(getActiveItemImage(container).src).toContain("c.png");
  });

  it("calls onActiveIndexChange when navigating (uncontrolled)", () => {
    const onActiveIndexChange = vi.fn();
    render(
      <UGalleria value={items} itemTemplate={itemTemplate} onActiveIndexChange={onActiveIndexChange} />
    );
    fireEvent.click(screen.getByLabelText("Next"));
    expect(onActiveIndexChange).toHaveBeenCalledWith(1);
  });

  it("behaves as controlled when activeIndex+onActiveIndexChange are both provided", () => {
    const onActiveIndexChange = vi.fn();
    const { rerender, container } = render(
      <UGalleria
        value={items}
        itemTemplate={itemTemplate}
        activeIndex={0}
        onActiveIndexChange={onActiveIndexChange}
      />
    );
    fireEvent.click(screen.getByLabelText("Next"));
    expect(onActiveIndexChange).toHaveBeenCalledWith(1);
    expect(getActiveItemImage(container).src).toContain("a.png");

    rerender(
      <UGalleria
        value={items}
        itemTemplate={itemTemplate}
        activeIndex={1}
        onActiveIndexChange={onActiveIndexChange}
      />
    );
    expect(getActiveItemImage(container).src).toContain("b.png");
  });

  it("autoplays through items on an interval", () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <UGalleria value={items} itemTemplate={itemTemplate} autoplayInterval={1000} />
      );
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(getActiveItemImage(container).src).toContain("b.png");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not render a fullscreen mask by default", () => {
    render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    expect(document.querySelector(".u-galleria-mask")).not.toBeInTheDocument();
  });

  it("opens and closes the fullscreen overlay when controlled", () => {
    const onFullScreenActiveChange = vi.fn();
    const { rerender } = render(
      <UGalleria
        value={items}
        itemTemplate={itemTemplate}
        fullScreen
        fullScreenActive={false}
        onFullScreenActiveChange={onFullScreenActiveChange}
      />
    );
    expect(document.querySelector(".u-galleria-mask")).not.toBeInTheDocument();

    rerender(
      <UGalleria
        value={items}
        itemTemplate={itemTemplate}
        fullScreen
        fullScreenActive
        onFullScreenActiveChange={onFullScreenActiveChange}
      />
    );
    expect(document.querySelector(".u-galleria-mask")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close"));
    expect(onFullScreenActiveChange).toHaveBeenCalledWith(false);
  });
});

describe("keyboard navigation, Escape, role=region (Spec §5.1, GAP-050)", () => {
  it("has role=region on the root element", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    expect(container.querySelector("[role=region]")).toBeTruthy();
  });

  it("ArrowRight advances to the next item", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    const content = container.querySelector("[data-u-galleria-content]") as HTMLElement;
    fireEvent.keyDown(content, { code: "ArrowRight" });
    expect(getActiveItemImage(container).src).toContain("b.png");
  });

  it("ArrowLeft goes to the previous item", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    const content = container.querySelector("[data-u-galleria-content]") as HTMLElement;
    fireEvent.keyDown(content, { code: "ArrowRight" });
    expect(getActiveItemImage(container).src).toContain("b.png");
    fireEvent.keyDown(content, { code: "ArrowLeft" });
    expect(getActiveItemImage(container).src).toContain("a.png");
  });

  it("Home jumps to the first item, End jumps to the last", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    const content = container.querySelector("[data-u-galleria-content]") as HTMLElement;
    fireEvent.keyDown(content, { code: "End" });
    expect(getActiveItemImage(container).src).toContain("c.png");
    fireEvent.keyDown(content, { code: "Home" });
    expect(getActiveItemImage(container).src).toContain("a.png");
  });

  it("Escape closes fullscreen mode when active", () => {
    const onFullScreenActiveChange = vi.fn();
    render(
      <UGalleria
        value={items}
        itemTemplate={itemTemplate}
        fullScreen
        fullScreenActive
        onFullScreenActiveChange={onFullScreenActiveChange}
      />
    );
    const content = document.querySelector("[data-u-galleria-content]") as HTMLElement;
    fireEvent.keyDown(content, { code: "Escape" });
    expect(onFullScreenActiveChange).toHaveBeenCalledWith(false);
  });

  it("Escape does nothing when fullscreen mode is not active", () => {
    const { container } = render(<UGalleria value={items} itemTemplate={itemTemplate} />);
    const content = container.querySelector("[data-u-galleria-content]") as HTMLElement;
    expect(() => fireEvent.keyDown(content, { code: "Escape" })).not.toThrow();
    expect(document.querySelector(".u-galleria-mask")).not.toBeInTheDocument();
  });

  it("does not navigate when ArrowLeft/ArrowRight are pressed while a focused input inside a custom item template has focus", () => {
    const onActiveIndexChange = vi.fn();
    const inputItemTemplate = (item: string) => <input className="item-input" defaultValue={item} />;
    const { container } = render(
      <UGalleria value={items} itemTemplate={inputItemTemplate} onActiveIndexChange={onActiveIndexChange} />
    );
    const input = container.querySelector(".item-input") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "typed" } });
    fireEvent.keyDown(input, { code: "ArrowRight" });
    expect(onActiveIndexChange).not.toHaveBeenCalled();
    expect(input.value).toBe("typed");
  });
});
