import * as React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UOrderList } from "./order-list";

function setup(dragdrop = false) {
  const change = vi.fn();
  const result = render(
    <UOrderList
      value={["A", "B", "C", "D"]}
      onChange={change}
      itemTemplate={(item) => <span>{item}</span>}
      dragdrop={dragdrop}
    />
  );
  return { ...result, change };
}

describe("UOrderList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", (direction, expected) => {
    const { container, change } = setup();
    const root = within(container.querySelector('[data-pc-section="sourcelist"]') as HTMLElement);
    fireEvent.click(root.getByRole("option", { name: "B" }));
    fireEvent.click(root.getByRole("button", { name: "Move " + direction }));
    expect(change).toHaveBeenLastCalledWith(expected);
  });

  it("does not add native DnD or a filter without opt-in", () => {
    const { container } = setup();
    expect(container.querySelector("[draggable]")).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("uses actual native dragstart, dragover, and drop events for reorder", () => {
    const { change } = setup(true);
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(screen.getByRole("option", { name: "B" }), { dataTransfer });
    expect(fireEvent.dragOver(screen.getByRole("option", { name: "A" }), { dataTransfer })).toBe(
      false
    );
    fireEvent.drop(screen.getByRole("option", { name: "A" }), { dataTransfer });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });

  it("uses target-index semantics for forward drag moves and leaves self drops unchanged", () => {
    const change = vi.fn();
    render(
      <UOrderList
        value={["A", "B", "C"]}
        onChange={change}
        itemTemplate={(item) => <span>{item}</span>}
        dragdrop
      />
    );
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };

    fireEvent.dragStart(screen.getByRole("option", { name: "A" }), { dataTransfer });
    fireEvent.drop(screen.getByRole("option", { name: "B" }), { dataTransfer });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C"]);

    fireEvent.dragStart(screen.getByRole("option", { name: "B" }), { dataTransfer });
    fireEvent.drop(screen.getByRole("option", { name: "B" }), { dataTransfer });
    expect(change).toHaveBeenLastCalledWith(["A", "B", "C"]);
  });

  it("filters configured fields and supports keyboard selection", () => {
    const change = vi.fn();
    render(
      <UOrderList
        value={[{ name: "Apple" }, { name: "Banana" }]}
        onChange={change}
        itemTemplate={(item) => <span>{item.name}</span>}
        dataKey="name"
        filter
        filterBy="name"
        filterMatchMode="startsWith"
      />
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter source" }), {
      target: { value: "App" },
    });
    expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
    fireEvent.keyDown(screen.getByRole("option", { name: "Apple" }), { key: "Enter" });
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
  });

  it("applies listStyle to the scrollable list and keeps options programmatically focusable", () => {
    const { rerender } = render(
      <UOrderList
        value={["A", "B"]}
        onChange={() => {}}
        itemTemplate={(item) => <span>{item}</span>}
        tabIndex={-1}
        focusOnHover
        listStyle={{ maxHeight: "12rem" }}
      />
    );
    const list = screen.getByRole("listbox");
    const options = screen.getAllByRole("option");

    expect(list).toHaveStyle({ maxHeight: "12rem" });
    expect(list).toHaveAttribute("tabindex", "-1");
    expect(options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tabIndex: -1 }),
        expect.objectContaining({ tabIndex: -1 }),
      ])
    );

    list.focus();
    expect(document.activeElement).toBe(options[0]);
    fireEvent.keyDown(options[0], { key: "ArrowDown" });
    expect(document.activeElement).toBe(options[1]);
    fireEvent.keyDown(options[1], { key: "Enter" });
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    fireEvent.mouseEnter(options[0]);
    expect(document.activeElement).toBe(options[0]);

    rerender(
      <UOrderList
        value={["A", "B"]}
        onChange={() => {}}
        itemTemplate={(item) => <span>{item}</span>}
        tabIndex={3}
      />
    );
    expect(screen.getByRole("listbox")).toHaveAttribute("tabindex", "3");
    expect(screen.getAllByRole("option")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tabIndex: -1 }),
        expect.objectContaining({ tabIndex: -1 }),
      ])
    );
  });

  it("keeps dataKey selection after an equivalent-object rerender", () => {
    const { rerender } = render(
      <UOrderList
        value={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ]}
        onChange={() => {}}
        dataKey="id"
        itemTemplate={(item) => <span>{item.label}</span>}
      />
    );
    fireEvent.click(screen.getByRole("option", { name: "Apple" }));

    rerender(
      <UOrderList
        value={[
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ]}
        onChange={() => {}}
        dataKey="id"
        itemTemplate={(item) => <span>{item.label}</span>}
      />
    );
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
  });
});
