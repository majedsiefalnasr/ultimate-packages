import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { UPanelMenu } from "./panel-menu";
import type { UMenuItem } from "../menu";

describe("UPanelMenu", () => {
  const items: UMenuItem[] = [
    { label: "Files", items: [{ label: "Documents", items: [{ label: "Work" }] }, { label: "Photos" }] },
    { label: "Settings" },
  ];

  it("renders a tree of root items, collapsed by default", () => {
    const { container } = render(<UPanelMenu model={items} />);
    const rootItems = container.querySelectorAll('[role="tree"] > [role="treeitem"]');
    expect(rootItems.length).toBe(2);
    expect(rootItems[0].getAttribute("data-u-expanded")).toBe("false");
  });

  it("expands a group item in-place on header click", () => {
    const { container } = render(<UPanelMenu model={items} />);
    const firstHeader = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
    fireEvent.click(firstHeader);
    const firstItem = container.querySelector('[role="treeitem"]') as HTMLElement;
    expect(firstItem.getAttribute("data-u-expanded")).toBe("true");
    expect(firstItem.getAttribute("aria-expanded")).toBe("true");
    expect(firstItem.querySelector('[role="tree"]')).not.toBeNull();
  });

  it("collapses an expanded group on a second header click", () => {
    const { container } = render(<UPanelMenu model={items} />);
    const firstHeader = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
    fireEvent.click(firstHeader);
    fireEvent.click(firstHeader);
    const firstItem = container.querySelector('[role="treeitem"]') as HTMLElement;
    expect(firstItem.getAttribute("data-u-expanded")).toBe("false");
  });

  it("collapses sibling panels when multiple is false (accordion behavior)", () => {
    const model: UMenuItem[] = [
      { label: "A", items: [{ label: "A1" }] },
      { label: "B", items: [{ label: "B1" }] },
    ];
    const { container } = render(<UPanelMenu model={model} />);
    const rootItems = container.querySelectorAll('[role="tree"] > [role="treeitem"]');
    fireEvent.click(rootItems[0].querySelector("a") as HTMLAnchorElement);
    fireEvent.click(rootItems[1].querySelector("a") as HTMLAnchorElement);
    expect(rootItems[0].getAttribute("data-u-expanded")).toBe("false");
    expect(rootItems[1].getAttribute("data-u-expanded")).toBe("true");
  });

  it("allows multiple concurrently-expanded panels when multiple is true", () => {
    const model: UMenuItem[] = [
      { label: "A", items: [{ label: "A1" }] },
      { label: "B", items: [{ label: "B1" }] },
    ];
    const { container } = render(<UPanelMenu model={model} multiple />);
    const rootItems = container.querySelectorAll('[role="tree"] > [role="treeitem"]');
    fireEvent.click(rootItems[0].querySelector("a") as HTMLAnchorElement);
    fireEvent.click(rootItems[1].querySelector("a") as HTMLAnchorElement);
    expect(rootItems[0].getAttribute("data-u-expanded")).toBe("true");
    expect(rootItems[1].getAttribute("data-u-expanded")).toBe("true");
  });

  it("supports drill-down to a doubly-nested group", () => {
    const { container } = render(<UPanelMenu model={items} />);
    const firstHeader = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
    fireEvent.click(firstHeader);
    const nestedHeader = container.querySelector(
      '[role="tree"] [role="tree"] [role="treeitem"] a'
    ) as HTMLAnchorElement;
    expect(nestedHeader).not.toBeNull();
    fireEvent.click(nestedHeader);
    const deepList = container.querySelector('[role="tree"] [role="tree"] [role="tree"]');
    expect(deepList).not.toBeNull();
  });

  it("invokes onItemSelect and item.command for a leaf item", () => {
    const onItemSelect = vi.fn();
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Leaf", command }];
    const { container } = render(<UPanelMenu model={model} onItemSelect={onItemSelect} />);
    fireEvent.click(container.querySelector("a") as HTMLAnchorElement);
    expect(command).toHaveBeenCalled();
    expect(onItemSelect).toHaveBeenCalled();
  });

  it("does not expand or invoke command for a disabled group item", () => {
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Disabled", disabled: true, items: [{ label: "Hidden" }], command }];
    const { container } = render(<UPanelMenu model={model} />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(link);
    expect(command).not.toHaveBeenCalled();
    expect(container.querySelector('[role="treeitem"]')?.getAttribute("data-u-expanded")).toBe("false");
  });
});
