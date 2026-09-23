import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UPickList } from "./pick-list";

function setup(dragdrop = false) {
  const onSourceChange = vi.fn();
  const onTargetChange = vi.fn();
  const result = render(
    <UPickList
      source={["A", "B", "C", "D"]}
      target={["X", "Y", "Z", "W"]}
      onSourceChange={onSourceChange}
      onTargetChange={onTargetChange}
      itemTemplate={(item) => <span>{item}</span>}
      dragdrop={dragdrop}
    />
  );
  return { ...result, onSourceChange, onTargetChange };
}

describe("UPickList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("reorders source %s", (direction, expected) => {
    const { container, onSourceChange } = setup();
    const source = within(container.querySelector('[data-pc-section="sourcelist"]') as HTMLElement);
    fireEvent.click(source.getByRole("option", { name: "B" }));
    fireEvent.click(source.getByRole("button", { name: `Move ${direction}` }));
    expect(onSourceChange).toHaveBeenLastCalledWith(expected);
  });

  it.each([
    ["up", ["Y", "X", "Z", "W"]],
    ["top", ["Y", "X", "Z", "W"]],
    ["down", ["X", "Z", "Y", "W"]],
    ["bottom", ["X", "Z", "W", "Y"]],
  ])("reorders target %s", (direction, expected) => {
    const { container, onTargetChange } = setup();
    const target = within(container.querySelector('[data-pc-section="targetlist"]') as HTMLElement);
    fireEvent.click(target.getByRole("option", { name: "Y" }));
    fireEvent.click(target.getByRole("button", { name: `Move ${direction}` }));
    expect(onTargetChange).toHaveBeenLastCalledWith(expected);
  });

  it.each([
    ["A", "To Target", ["B", "C", "D"], ["X", "Y", "Z", "W", "A"]],
    ["X", "To Source", ["A", "B", "C", "D", "X"], ["Y", "Z", "W"]],
  ])("transfers selected %s", (selection, button, source, target) => {
    const { onSourceChange, onTargetChange } = setup();
    fireEvent.click(screen.getByRole("option", { name: selection }));
    fireEvent.click(screen.getByRole("button", { name: button }));
    expect(onSourceChange).toHaveBeenLastCalledWith(source);
    expect(onTargetChange).toHaveBeenLastCalledWith(target);
  });

  it.each([
    ["All To Target", [], ["X", "Y", "Z", "W", "A", "B", "C", "D"]],
    ["All To Source", ["A", "B", "C", "D", "X", "Y", "Z", "W"], []],
  ])("transfers %s", (button, source, target) => {
    const { onSourceChange, onTargetChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: button }));
    expect(onSourceChange).toHaveBeenLastCalledWith(source);
    expect(onTargetChange).toHaveBeenLastCalledWith(target);
  });

  it("keeps side filters independent and searches configured fields", () => {
    render(
      <UPickList
        source={[
          { id: 1, name: "Apple" },
          { id: 2, name: "Banana" },
        ]}
        target={[
          { id: 3, name: "Apricot" },
          { id: 4, name: "Berry" },
        ]}
        onSourceChange={vi.fn()}
        onTargetChange={vi.fn()}
        itemTemplate={(item) => item.name}
        dataKey="id"
        filter
        filterBy="name"
        filterMatchMode="startsWith"
      />
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter source" }), {
      target: { value: "App" },
    });
    expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
    expect(screen.getByRole("option", { name: "Berry" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter target" }), {
      target: { value: "Apr" },
    });
    expect(screen.queryByRole("option", { name: "Berry" })).toBeNull();
    fireEvent.keyDown(screen.getByRole("option", { name: "Apple" }), { key: "Enter" });
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
  });

  it("honors filter and controls gates, headers, styles, and breakpoint", () => {
    const { container } = render(
      <UPickList
        source={["A"]}
        target={["X"]}
        onSourceChange={vi.fn()}
        onTargetChange={vi.fn()}
        itemTemplate={(item) => item}
        sourceHeader="Available"
        targetHeader="Chosen"
        sourceStyle={{ maxHeight: 120 }}
        targetStyle={{ maxHeight: 180 }}
        showSourceFilter={false}
        showTargetControls={false}
        filter
        breakpoint="600px"
      />
    );
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Chosen")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox", { name: "Filter source" })).toBeNull();
    expect(screen.getByRole("searchbox", { name: "Filter target" })).toBeInTheDocument();
    const source = container.querySelector('[data-pc-section="sourcelist"]') as HTMLElement;
    const target = container.querySelector('[data-pc-section="targetlist"]') as HTMLElement;
    expect(source).toHaveStyle({ maxHeight: "120px" });
    expect(target).toHaveStyle({ maxHeight: "180px" });
    expect(within(target).queryByRole("button", { name: "Move up" })).toBeNull();
    expect(container.querySelector("style")?.textContent).toContain("600px");
  });

  it("requires a modifier for additive selection when metaKeySelection is enabled", () => {
    render(
      <UPickList
        source={["A", "B", "C"]}
        target={[]}
        onSourceChange={vi.fn()}
        onTargetChange={vi.fn()}
        itemTemplate={(item) => item}
        metaKeySelection
      />
    );
    fireEvent.click(screen.getByRole("option", { name: "A" }));
    fireEvent.click(screen.getByRole("option", { name: "B" }));
    expect(screen.getByRole("option", { name: "A" })).toHaveAttribute("aria-selected", "false");
    fireEvent.click(screen.getByRole("option", { name: "C" }), { ctrlKey: true });
    expect(screen.getByRole("option", { name: "B" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "C" })).toHaveAttribute("aria-selected", "true");
  });

  it("deselects a selected item on a plain click with metaKeySelection", () => {
    render(
      <UPickList
        source={["A"]}
        target={[]}
        onSourceChange={vi.fn()}
        onTargetChange={vi.fn()}
        itemTemplate={(item) => item}
        metaKeySelection
      />
    );
    const option = screen.getByRole("option", { name: "A" });
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-selected", "true");
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-selected", "false");
  });

  it("does not expose native drag handlers or filters without opt-in", () => {
    const { container } = setup();
    expect(container.querySelector("[draggable]")).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("reorders with native drag events", () => {
    const { onSourceChange } = setup(true);
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(screen.getByRole("option", { name: "B" }), { dataTransfer });
    expect(fireEvent.dragOver(screen.getByRole("option", { name: "A" }), { dataTransfer })).toBe(
      false
    );
    fireEvent.drop(screen.getByRole("option", { name: "A" }), { dataTransfer });
    expect(onSourceChange).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });

  it.each([
    ["A", "X", ["B", "C", "D"], ["A", "X", "Y", "Z", "W"]],
    ["X", "A", ["X", "A", "B", "C", "D"], ["Y", "Z", "W"]],
  ])("moves %s before %s by native cross-list drop", (from, to, source, target) => {
    const { onSourceChange, onTargetChange } = setup(true);
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(screen.getByRole("option", { name: from }), { dataTransfer });
    fireEvent.dragOver(screen.getByRole("option", { name: to }), { dataTransfer });
    fireEvent.drop(screen.getByRole("option", { name: to }), { dataTransfer });
    expect(onSourceChange).toHaveBeenLastCalledWith(source);
    expect(onTargetChange).toHaveBeenLastCalledWith(target);
  });
});
