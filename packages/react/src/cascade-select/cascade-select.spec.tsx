import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UCascadeSelect } from "./cascade-select";

const COUNTRIES = [
  {
    name: "Germany",
    items: [
      { name: "Berlin" },
      { name: "Hamburg" },
    ],
  },
  {
    name: "USA",
    items: [{ name: "New York" }],
  },
];

describe("UCascadeSelect", () => {
  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    render(
      <UCascadeSelect
        value={null}
        onChange={() => {}}
        options={COUNTRIES}
        optionLabel="name"
        placeholder="Select a city"
      />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a city");
  });

  it("opens the overlay showing only the top-level (root) options", () => {
    render(<UCascadeSelect value={null} onChange={() => {}} options={COUNTRIES} optionLabel="name" />);
    fireEvent.click(screen.getByRole("combobox"));
    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBe(2);
    expect(items[0]).toHaveTextContent("Germany");
    expect(items[1]).toHaveTextContent("USA");
  });

  it("drills down through nested groups on click, revealing the next level", () => {
    render(<UCascadeSelect value={null} onChange={() => {}} options={COUNTRIES} optionLabel="name" />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Germany"));

    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBe(4);
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Hamburg")).toBeInTheDocument();
  });

  it("drills down through a group and selects a leaf, calling onChange and closing the overlay", () => {
    const onChange = vi.fn();
    render(<UCascadeSelect value={null} onChange={onChange} options={COUNTRIES} optionLabel="name" optionValue="name" />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Germany"));
    fireEvent.click(screen.getByText("Berlin"));

    expect(onChange).toHaveBeenCalledWith("Berlin");
    expect(screen.queryByRole("tree")).toBeNull();
  });

  it("closes the overlay on Escape", () => {
    render(<UCascadeSelect value={null} onChange={() => {}} options={COUNTRIES} optionLabel="name" />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.queryByRole("tree")).not.toBeNull();
    fireEvent.keyDown(trigger, { code: "Escape" });
    expect(screen.queryByRole("tree")).toBeNull();
  });

  it("is fully controlled — the value prop drives the displayed label (matched against leaf options)", () => {
    const { rerender } = render(
      <UCascadeSelect value="Berlin" onChange={() => {}} options={COUNTRIES} optionLabel="name" optionValue="name" />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Berlin");
    rerender(
      <UCascadeSelect value="New York" onChange={() => {}} options={COUNTRIES} optionLabel="name" optionValue="name" />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("New York");
  });

  it("respects the disabled option — clicking a disabled leaf does not call onChange", () => {
    const onChange = vi.fn();
    const options = [
      { name: "Group", items: [{ name: "Leaf", disabled: true }] },
    ];
    render(
      <UCascadeSelect
        value={null}
        onChange={onChange}
        options={options}
        optionLabel="name"
        optionValue="name"
        optionDisabled="disabled"
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Group"));
    fireEvent.click(screen.getByText("Leaf"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
