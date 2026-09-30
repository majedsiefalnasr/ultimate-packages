import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { UTabView } from "./tab-view";
import { UTabPanel } from "./tab-panel";
import { UTabMenu } from "./tab-menu";
import type { UMenuItem } from "../menu";

describe("UTabView", () => {
  function renderTabView() {
    return render(
      <UTabView>
        <UTabPanel header="Header 1">Content 1</UTabPanel>
        <UTabPanel header="Header 2">Content 2</UTabPanel>
        <UTabPanel header="Header 3" disabled>
          Content 3
        </UTabPanel>
      </UTabView>
    );
  }

  it("renders all headers and panels, only the active panel visible", () => {
    const { container } = renderTabView();
    expect(container.querySelectorAll('[role="tab"]').length).toBe(3);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[0] as HTMLElement).hidden).toBe(false);
    expect((panels[1] as HTMLElement).hidden).toBe(true);
  });

  it("marks the active header with aria-selected", () => {
    const { container } = renderTabView();
    const headers = container.querySelectorAll('[role="tab"]');
    expect(headers[0].getAttribute("aria-selected")).toBe("true");
    expect(headers[1].getAttribute("aria-selected")).toBe("false");
  });

  it("clicking a header activates it and its matching panel", () => {
    const { container } = renderTabView();
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[1] as HTMLElement).hidden).toBe(false);
    expect((panels[0] as HTMLElement).hidden).toBe(true);
  });

  it("ArrowRight/ArrowLeft move focus between headers", () => {
    const { container } = renderTabView();
    const buttons = container.querySelectorAll("button");
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(buttons[1], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("Home/End move focus to first/last eligible (non-disabled) header", () => {
    const { container } = renderTabView();
    const buttons = container.querySelectorAll("button");
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "End" });
    // header 3 is disabled, so End lands on header 2 (index 1)
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(buttons[1], { key: "Home" });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("disabled headers cannot be activated by click", () => {
    const { container } = renderTabView();
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[2]);
    expect(buttons[2].getAttribute("disabled")).not.toBeNull();
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[0] as HTMLElement).hidden).toBe(false);
  });
});

describe("UTabMenu", () => {
  const model: UMenuItem[] = [{ label: "One" }, { label: "Two" }, { label: "Three", disabled: true }];

  it("renders one tab item per model entry", () => {
    const { container } = render(<UTabMenu model={model} />);
    expect(container.querySelectorAll('[role="tab"]').length).toBe(3);
  });

  it("marks the active item with aria-selected", () => {
    const { container } = render(<UTabMenu model={model} activeIndex={0} />);
    const items = container.querySelectorAll('[role="tab"]');
    expect(items[0].getAttribute("aria-selected")).toBe("true");
  });

  it("clicking an item (uncontrolled) switches the active index", () => {
    const { container } = render(<UTabMenu model={model} />);
    const links = container.querySelectorAll("a");
    fireEvent.click(links[1]);
    const items = container.querySelectorAll('[role="tab"]');
    expect(items[1].getAttribute("aria-selected")).toBe("true");
  });

  it("invokes item.command and onTabChange on click", () => {
    const command = vi.fn();
    const onTabChange = vi.fn();
    const items: UMenuItem[] = [{ label: "One", command }, { label: "Two" }];
    const { container } = render(<UTabMenu model={items} activeIndex={0} onTabChange={onTabChange} />);
    const links = container.querySelectorAll("a");
    fireEvent.click(links[0]);
    expect(command).toHaveBeenCalled();
    expect(onTabChange).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  });

  it("disabled items cannot be activated by click", () => {
    const { container } = render(<UTabMenu model={model} />);
    const links = container.querySelectorAll("a");
    fireEvent.click(links[2]);
    const items = container.querySelectorAll('[role="tab"]');
    expect(items[2].getAttribute("aria-selected")).toBe("false");
  });
});

describe("UTabView scrollable overflow (Spec §5.7, GAP-057)", () => {
  const dims = { scrollWidth: 0, clientWidth: 0, scrollLeft: 0 };
  const originals = new Map<string, PropertyDescriptor | undefined>();

  // jsdom has no layout: stub the scroll metrics on HTMLElement.prototype.
  beforeEach(() => {
    for (const key of Object.keys(dims) as (keyof typeof dims)[]) {
      originals.set(key, Object.getOwnPropertyDescriptor(HTMLElement.prototype, key));
      Object.defineProperty(HTMLElement.prototype, key, {
        configurable: true,
        get() {
          return dims[key];
        },
        set(v: number) {
          dims[key] = v;
        },
      });
    }
  });

  afterEach(() => {
    for (const [key, desc] of originals) {
      if (desc) Object.defineProperty(HTMLElement.prototype, key, desc);
      else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key];
    }
    originals.clear();
  });

  function setDims(scrollWidth: number, clientWidth: number, scrollLeft: number) {
    Object.assign(dims, { scrollWidth, clientWidth, scrollLeft });
  }

  function renderTabs(scrollable?: boolean) {
    return render(
      <UTabView scrollable={scrollable}>
        <UTabPanel header="One">A</UTabPanel>
        <UTabPanel header="Two">B</UTabPanel>
        <UTabPanel header="Three">C</UTabPanel>
      </UTabView>
    );
  }

  const prev = (c: HTMLElement) => c.querySelector('button[aria-label="Previous Page"]');
  const next = (c: HTMLElement) => c.querySelector('button[aria-label="Next Page"]');

  it("renders no navigators by default, even when overflowing", () => {
    setDims(1000, 200, 0);
    const { container } = renderTabs();
    expect(prev(container)).toBeNull();
    expect(next(container)).toBeNull();
    expect(container.querySelector(".u-tabview-nav-content")).toBeNull();
  });

  it("shows only next when scrollable, overflowing, at the start", () => {
    setDims(1000, 200, 0);
    const { container } = renderTabs(true);
    expect(prev(container)).toBeNull();
    expect(next(container)).not.toBeNull();
  });

  it("shows no navigators when scrollable and tabs fit", () => {
    setDims(200, 200, 0);
    const { container } = renderTabs(true);
    expect(prev(container)).toBeNull();
    expect(next(container)).toBeNull();
  });

  it("shows both navigators when scrolled to the middle", () => {
    setDims(1000, 200, 300);
    const { container } = renderTabs(true);
    expect(prev(container)).not.toBeNull();
    expect(next(container)).not.toBeNull();
  });

  it("shows only prev when scrolled to the end", () => {
    setDims(1000, 200, 800);
    const { container } = renderTabs(true);
    expect(prev(container)).not.toBeNull();
    expect(next(container)).toBeNull();
  });

  it("updates navigators on the strip's scroll event", () => {
    setDims(1000, 200, 0);
    const { container } = renderTabs(true);
    expect(prev(container)).toBeNull();
    dims.scrollLeft = 800;
    fireEvent.scroll(container.querySelector(".u-tabview-nav-content") as HTMLElement);
    expect(prev(container)).not.toBeNull();
    expect(next(container)).toBeNull();
  });

  it("clicking next scrolls the strip forward by the visible width", () => {
    setDims(1000, 200, 0);
    const { container } = renderTabs(true);
    fireEvent.click(next(container) as HTMLElement);
    expect(dims.scrollLeft).toBe(200);
  });

  it("clicking prev scrolls the strip back, clamped at 0", () => {
    setDims(1000, 200, 100);
    const { container } = renderTabs(true);
    fireEvent.click(prev(container) as HTMLElement);
    expect(dims.scrollLeft).toBe(0);
  });
});
