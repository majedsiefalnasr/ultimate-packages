import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { UOrganizationChart, type UOrganizationChartProps } from "./organization-chart";

const child = { label: "CTO" };
const root = { label: "CEO", expanded: true, children: [child, { label: "CFO" }] };

describe("UOrganizationChart", () => {
  it("expands and collapses per node without mutating the input or selecting from the toggler", () => {
    const select = vi.fn();
    render(<UOrganizationChart value={[root]} selectionMode="single" onSelectionChange={select} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle CEO" }));
    expect(screen.queryByText("CTO")).toBeNull();
    expect(root.expanded).toBe(true);
    expect(select).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Toggle CEO" }));
    expect(screen.getByText("CTO")).toBeInTheDocument();
  });

  it("does not bubble nested toggler keyboard input into node selection", () => {
    const select = vi.fn();
    render(<UOrganizationChart value={[root]} selectionMode="single" onSelectionChange={select} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Toggle CEO" }), { key: "Enter" });
    expect(select).not.toHaveBeenCalled();
  });

  it("selects and unselects a single node", () => {
    const select = vi.fn();
    const { rerender } = render(
      <UOrganizationChart
        value={[root]}
        selectionMode="single"
        selection={null}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("CEO"));
    expect(select).toHaveBeenLastCalledWith(root);
    rerender(
      <UOrganizationChart
        value={[root]}
        selectionMode="single"
        selection={root}
        onSelectionChange={select}
      />
    );
    fireEvent.keyDown(screen.getByText("CEO"), { key: "Enter" });
    expect(select).toHaveBeenLastCalledWith(null);
  });

  it("adds and removes multiple selection while preserving other nodes", () => {
    const select = vi.fn();
    const { rerender } = render(
      <UOrganizationChart
        value={[root]}
        selectionMode="multiple"
        selection={[child]}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("CEO"));
    expect(select).toHaveBeenLastCalledWith([child, root]);
    rerender(
      <UOrganizationChart
        value={[root]}
        selectionMode="multiple"
        selection={[child, root]}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("CEO"));
    expect(select).toHaveBeenLastCalledWith([child]);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
  });

  it("respects nonselectable nodes and excludes togglerIcon", () => {
    expectTypeOf<Extract<keyof UOrganizationChartProps, "togglerIcon">>().toEqualTypeOf<never>();
    const select = vi.fn();
    render(
      <UOrganizationChart
        value={[{ label: "Locked", selectable: false }]}
        selectionMode="single"
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("Locked"));
    expect(select).not.toHaveBeenCalled();
  });
});
