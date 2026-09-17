import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UMultiSelect } from "./multi-select";

describe("UMultiSelect", () => {
  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    render(<UMultiSelect value={[]} onChange={() => {}} options={["A", "B"]} placeholder="Choose" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Choose");
  });

  it("opens the overlay on click and lists options with checkboxes", () => {
    render(<UMultiSelect value={[]} onChange={() => {}} options={["Apple", "Banana"]} />);
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0].querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it("toggles options in and out of the array value, and does not close the overlay", () => {
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <UMultiSelect
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
          options={["Apple", "Banana", "Cherry"]}
        />
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Apple" }));
    expect(onChange).toHaveBeenLastCalledWith(["Apple"]);
    expect(screen.queryByRole("listbox")).not.toBeNull();

    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenLastCalledWith(["Apple", "Banana"]);

    fireEvent.click(screen.getByRole("option", { name: "Apple" }));
    expect(onChange).toHaveBeenLastCalledWith(["Banana"]);
  });

  it("select-all header checkbox selects/deselects every visible option", () => {
    const onChange = vi.fn();
    render(<UMultiSelect value={[]} onChange={onChange} options={["Apple", "Banana"]} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByLabelText("Select All"));
    expect(onChange).toHaveBeenCalledWith(["Apple", "Banana"]);
  });

  it("filters the option list via the filter input when filter is enabled", () => {
    render(<UMultiSelect value={[]} onChange={() => {}} options={["Apple", "Banana", "Cherry"]} filter />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ban" } });
    expect(screen.getAllByRole("option").length).toBe(1);
  });

  it("closes the overlay on Escape", () => {
    render(<UMultiSelect value={[]} onChange={() => {}} options={["Apple"]} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeNull();
    fireEvent.keyDown(trigger, { code: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("is fully controlled — the value array prop drives the displayed label", () => {
    const { rerender } = render(
      <UMultiSelect value={["Apple"]} onChange={() => {}} options={["Apple", "Banana"]} />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple");
    rerender(<UMultiSelect value={["Apple", "Banana"]} onChange={() => {}} options={["Apple", "Banana"]} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Apple, Banana");
  });

  it("summarizes the selection once past maxSelectedLabels", () => {
    render(
      <UMultiSelect
        value={["Apple", "Banana", "Cherry"]}
        onChange={() => {}}
        options={["Apple", "Banana", "Cherry"]}
        maxSelectedLabels={2}
      />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("3 items selected");
  });

  it("clears the value via the clear icon when showClear is set", () => {
    const onChange = vi.fn();
    render(<UMultiSelect value={["Apple"]} onChange={onChange} options={["Apple", "Banana"]} showClear />);
    fireEvent.click(screen.getByText("×"));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
