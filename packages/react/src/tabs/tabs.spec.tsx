import * as React from "react";
import { describe, expect, it, vi } from "vitest";
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
