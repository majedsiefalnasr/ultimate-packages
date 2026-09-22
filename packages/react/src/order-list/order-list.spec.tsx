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
});
