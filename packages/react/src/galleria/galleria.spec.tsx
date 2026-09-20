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
