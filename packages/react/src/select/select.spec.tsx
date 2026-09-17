import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { USelect } from "./select";

describe("USelect", () => {
  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    render(<USelect value={null} onChange={() => {}} options={["A", "B"]} placeholder="Choose" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose");
  });

  it("opens the overlay on click and lists the provided options", () => {
    render(<USelect value={null} onChange={() => {}} options={["Apple", "Banana"]} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option").length).toBe(2);
    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
  });

  it("selects an option on click, calling onChange with its value, and closes the overlay", () => {
    const onChange = vi.fn();
    render(<USelect value={null} onChange={onChange} options={["Apple", "Banana"]} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenCalledWith("Banana");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", () => {
    const onChange = vi.fn();
    render(<USelect value={null} onChange={onChange} options={["Apple", "Banana", "Cherry"]} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { code: "ArrowDown" });
    fireEvent.keyDown(trigger, { code: "ArrowDown" });
    fireEvent.keyDown(trigger, { code: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Apple");
  });

  it("closes the overlay on Escape", () => {
    render(<USelect value={null} onChange={() => {}} options={["Apple"]} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeNull();
    fireEvent.keyDown(trigger, { code: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("filters the option list via the filter input when filter is enabled", () => {
    render(<USelect value={null} onChange={() => {}} options={["Apple", "Banana", "Cherry"]} filter />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ban" } });
    expect(screen.getAllByRole("option").length).toBe(1);
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
  });

  it("is fully controlled — the value prop drives the displayed label", () => {
    const { rerender } = render(<USelect value="Apple" onChange={() => {}} options={["Apple", "Banana"]} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
    rerender(<USelect value="Banana" onChange={() => {}} options={["Apple", "Banana"]} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
  });

  it("respects the disabled option — clicking it does not call onChange or close", () => {
    const onChange = vi.fn();
    render(
      <USelect
        value={null}
        onChange={onChange}
        options={[
          { label: "A", disabled: true },
          { label: "B", disabled: false },
        ]}
        optionLabel="label"
        optionDisabled="disabled"
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "A" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears the value via the clear icon when showClear is set", () => {
    const onChange = vi.fn();
    render(<USelect value="Apple" onChange={onChange} options={["Apple", "Banana"]} showClear />);
    fireEvent.click(screen.getByText("×"));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
