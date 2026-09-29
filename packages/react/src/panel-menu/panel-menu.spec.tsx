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

  describe("keyboard navigation (GAP-054)", () => {
    it("moves focus to the next root item on ArrowDown", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }, { label: "C" }];
      const { container } = render(<UPanelMenu model={model} />);
      const links = Array.from(container.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a')) as HTMLAnchorElement[];
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[1]);
    });

    it("moves focus to the previous root item on ArrowUp, wrapping at the start", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }, { label: "C" }];
      const { container } = render(<UPanelMenu model={model} />);
      const links = Array.from(container.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a')) as HTMLAnchorElement[];
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowUp" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("wraps focus from the last root item to the first on ArrowDown", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B" }, { label: "C" }];
      const { container } = render(<UPanelMenu model={model} />);
      const links = Array.from(container.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a')) as HTMLAnchorElement[];
      links[2].focus();
      fireEvent.keyDown(links[2], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[0]);
    });

    it("skips a disabled item when moving focus with ArrowDown", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }];
      const { container } = render(<UPanelMenu model={model} />);
      const links = Array.from(container.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a')) as HTMLAnchorElement[];
      links[0].focus();
      fireEvent.keyDown(links[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(links[2]);
    });

    it("skips a disabled item when moving focus with ArrowUp", () => {
      const model: UMenuItem[] = [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }];
      const { container } = render(<UPanelMenu model={model} />);
      const links = Array.from(container.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a')) as HTMLAnchorElement[];
      links[2].focus();
      fireEvent.keyDown(links[2], { code: "ArrowUp" });
      expect(document.activeElement).toBe(links[0]);
    });

    it("toggles expand/collapse on Enter for a group item, leaving focus on the header", () => {
      const model: UMenuItem[] = [{ label: "Files", items: [{ label: "Doc" }] }];
      const { container } = render(<UPanelMenu model={model} />);
      const header = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
      header.focus();
      fireEvent.keyDown(header, { code: "Enter" });
      const item = container.querySelector('[role="treeitem"]') as HTMLElement;
      expect(item.getAttribute("data-u-expanded")).toBe("true");
      expect(document.activeElement).toBe(header);
    });

    it("toggles expand/collapse on Space for a group item, leaving focus on the header", () => {
      const model: UMenuItem[] = [{ label: "Files", items: [{ label: "Doc" }] }];
      const { container } = render(<UPanelMenu model={model} />);
      const header = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
      header.focus();
      fireEvent.keyDown(header, { code: "Space" });
      const item = container.querySelector('[role="treeitem"]') as HTMLElement;
      expect(item.getAttribute("data-u-expanded")).toBe("true");
      expect(document.activeElement).toBe(header);

      fireEvent.keyDown(header, { code: "Space" });
      expect(item.getAttribute("data-u-expanded")).toBe("false");
      expect(document.activeElement).toBe(header);
    });

    it("does not toggle a disabled group item on Enter", () => {
      const command = vi.fn();
      const model: UMenuItem[] = [{ label: "Disabled", disabled: true, items: [{ label: "Hidden" }], command }];
      const { container } = render(<UPanelMenu model={model} />);
      const header = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
      fireEvent.keyDown(header, { code: "Enter" });
      expect(container.querySelector('[role="treeitem"]')?.getAttribute("data-u-expanded")).toBe("false");
    });

    it("moves focus among a genuinely-expanded nested level's own items, independent of the root level", () => {
      const model: UMenuItem[] = [
        { label: "Files", items: [{ label: "Documents" }, { label: "Photos" }] },
        { label: "Settings" },
      ];
      const { container } = render(<UPanelMenu model={model} />);
      const rootHeader = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
      // Real click-driven expansion, not manual DOM manipulation.
      fireEvent.click(rootHeader);

      const nestedList = container.querySelector('[role="tree"] [role="tree"]') as HTMLElement;
      const nestedLinks = Array.from(
        nestedList.querySelectorAll(':scope > [role="treeitem"] > .u-panelmenu-header-content > a')
      ) as HTMLAnchorElement[];
      expect(nestedLinks.length).toBe(2);

      nestedLinks[0].focus();
      fireEvent.keyDown(nestedLinks[0], { code: "ArrowDown" });
      expect(document.activeElement).toBe(nestedLinks[1]);

      // Root level's own roving focus is unaffected by the nested level's move.
      fireEvent.keyDown(nestedLinks[1], { code: "ArrowDown" });
      expect(document.activeElement).toBe(nestedLinks[0]);
    });

    it("does not throw or close anything on Escape (no overlay to escape from)", () => {
      const model: UMenuItem[] = [{ label: "Files", items: [{ label: "Doc" }] }];
      const { container } = render(<UPanelMenu model={model} />);
      const header = container.querySelector('[role="treeitem"] a') as HTMLAnchorElement;
      fireEvent.click(header);
      const item = container.querySelector('[role="treeitem"]') as HTMLElement;
      expect(item.getAttribute("data-u-expanded")).toBe("true");
      fireEvent.keyDown(header, { code: "Escape" });
      expect(item.getAttribute("data-u-expanded")).toBe("true");
    });
  });
});
