import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UDataScroller, type UDataScrollerRef } from "./data-scroller";

const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

describe("UDataScroller", () => {
  it("renders only the first `rows` items initially", () => {
    render(<UDataScroller value={items} rows={5} itemTemplate={(item) => <div key={item as string}>{item as string}</div>} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
  });

  it("renders the empty message when value is empty", () => {
    render(<UDataScroller value={[]} rows={5} itemTemplate={(item) => <div key={item as string}>{item as string}</div>} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("loads the next window when the internal content container scrolls near the bottom (inline mode)", () => {
    const { container } = render(
      <UDataScroller value={items} rows={5} inline scrollHeight="200px" itemTemplate={(item) => <div key={item as string}>{item as string}</div>} />
    );
    const root = container.querySelector(".u-data-scroller") as HTMLElement;
    Object.defineProperty(root, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(root, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(root, "scrollTop", { value: 850, configurable: true });
    fireEvent.scroll(root);
    expect(screen.getByText("Item 10")).toBeInTheDocument();
  });

  it("does not bind a scroll listener when loader is true, and load() can be called imperatively", () => {
    const ref = React.createRef<UDataScrollerRef>();
    render(
      <UDataScroller
        ref={ref}
        value={items}
        rows={5}
        loader
        itemTemplate={(item) => <div key={item as string}>{item as string}</div>}
      />
    );
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
    act(() => {
      ref.current?.load();
    });
    expect(screen.getByText("Item 6")).toBeInTheDocument();
  });

  it("calls onLazyLoad instead of internal slicing when lazy is true", () => {
    const onLazyLoad = vi.fn();
    render(
      <UDataScroller
        value={items.slice(0, 5)}
        rows={5}
        lazy
        onLazyLoad={onLazyLoad}
        itemTemplate={(item) => <div key={item as string}>{item as string}</div>}
      />
    );
    expect(onLazyLoad).toHaveBeenCalledWith({ first: 0, rows: 5 });
  });

  it("reset() clears accumulated state and reloads from the start", () => {
    const ref = React.createRef<UDataScrollerRef>();
    render(
      <UDataScroller
        ref={ref}
        value={items}
        rows={5}
        loader
        itemTemplate={(item) => <div key={item as string}>{item as string}</div>}
      />
    );
    act(() => {
      ref.current?.load();
    });
    expect(screen.getByText("Item 6")).toBeInTheDocument();
    act(() => {
      ref.current?.reset();
    });
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
