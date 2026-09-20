import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UListbox } from "./listbox";

describe("UListbox", () => {
  it("renders an always-visible role=listbox with the provided options — no overlay", () => {
    render(<UListbox value={null} onChange={() => {}} options={["Apple", "Banana"]} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBe(2);
  });

  it("single-select — clicking an option calls onChange with that option's value", () => {
    const onChange = vi.fn();
    render(<UListbox value={null} onChange={onChange} options={["Apple", "Banana"]} />);
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenCalledWith("Banana");
  });

  it("multi-select — toggles values in and out of an array, renders checkboxes", () => {
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <UListbox
          value={value}
          onChange={(v) => {
            setValue(v as string[]);
            onChange(v);
          }}
          options={["Apple", "Banana", "Cherry"]}
          multiple
        />
      );
    }
    render(<Harness />);
    const options = screen.getAllByRole("option");
    expect(options[0].querySelector('input[type="checkbox"]')).not.toBeNull();

    fireEvent.click(options[0]);
    expect(onChange).toHaveBeenLastCalledWith(["Apple"]);

    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenLastCalledWith(["Apple", "Banana"]);
  });

  it("navigates options with ArrowDown/ArrowUp and selects with Enter", () => {
    const onChange = vi.fn();
    render(<UListbox value={null} onChange={onChange} options={["Apple", "Banana", "Cherry"]} />);
    const list = screen.getByRole("listbox");
    fireEvent.keyDown(list, { code: "ArrowDown" });
    fireEvent.keyDown(list, { code: "ArrowDown" });
    fireEvent.keyDown(list, { code: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Banana");
  });

  it("filters the option list via the filter input when filter is enabled", () => {
    render(<UListbox value={null} onChange={() => {}} options={["Apple", "Banana", "Cherry"]} filter />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ban" } });
    expect(screen.getAllByRole("option").length).toBe(1);
  });

  it("respects the disabled option — clicking it does not call onChange", () => {
    const onChange = vi.fn();
    render(
      <UListbox
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
    fireEvent.click(screen.getByRole("option", { name: "A" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is fully controlled — reflects the value prop via aria-selected", () => {
    const { rerender } = render(<UListbox value="Apple" onChange={() => {}} options={["Apple", "Banana"]} />);
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
    rerender(<UListbox value="Banana" onChange={() => {}} options={["Apple", "Banana"]} />);
    expect(screen.getByRole("option", { name: "Banana" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "false");
  });
});
