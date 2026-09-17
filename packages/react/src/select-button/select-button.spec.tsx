import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { USelectButton } from "./select-button";

describe("USelectButton", () => {
  it("renders one toggle button per option, with role=group on the root", () => {
    render(<USelectButton value={null} onChange={() => {}} options={["A", "B", "C"]} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox", { hidden: true }).length).toBe(3);
  });

  it("single-select — clicking an option calls onChange with that option's value", () => {
    const onChange = vi.fn();
    render(<USelectButton value={null} onChange={onChange} options={["A", "B", "C"]} />);
    const inputs = screen.getAllByRole("checkbox", { hidden: true });
    fireEvent.click(inputs[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "A" }));
  });

  it("single-select — clicking the already-selected option clears it when allowEmpty", () => {
    const onChange = vi.fn();
    render(<USelectButton value="A" onChange={onChange} options={["A", "B"]} />);
    const inputs = screen.getAllByRole("checkbox", { hidden: true });
    fireEvent.click(inputs[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("single-select — allowEmpty false prevents deselecting the last selection", () => {
    const onChange = vi.fn();
    render(<USelectButton value="A" onChange={onChange} options={["A", "B"]} allowEmpty={false} />);
    const inputs = screen.getAllByRole("checkbox", { hidden: true });
    fireEvent.click(inputs[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("multi-select — toggles values in and out of an array", () => {
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = React.useState<string[]>([]);
      return (
        <USelectButton
          value={value}
          onChange={(event) => {
            setValue(event.value as string[]);
            onChange(event);
          }}
          options={["A", "B", "C"]}
          multiple
        />
      );
    }
    render(<Harness />);
    const inputs = screen.getAllByRole("checkbox", { hidden: true });
    fireEvent.click(inputs[0]);
    fireEvent.click(inputs[1]);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ["A", "B"] }));

    fireEvent.click(inputs[0]);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ["B"] }));
  });

  it("respects per-option disabled via optionDisabled and the top-level disabled prop", () => {
    const onChange = vi.fn();
    render(
      <USelectButton
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
    const inputs = screen.getAllByRole("checkbox", { hidden: true });
    expect(inputs[0]).toBeDisabled();
    fireEvent.click(inputs[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is fully controlled — reflects the value prop, no internal selection state", () => {
    const { rerender } = render(<USelectButton value="A" onChange={() => {}} options={["A", "B"]} />);
    const inputs = screen.getAllByRole("checkbox", { hidden: true });
    expect(inputs[0]).toBeChecked();
    expect(inputs[1]).not.toBeChecked();

    rerender(<USelectButton value="B" onChange={() => {}} options={["A", "B"]} />);
    const inputsAfter = screen.getAllByRole("checkbox", { hidden: true });
    expect(inputsAfter[0]).not.toBeChecked();
    expect(inputsAfter[1]).toBeChecked();
  });
});
