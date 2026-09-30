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

  describe("roving tabindex (GAP-059)", () => {
    const inputsOf = () => screen.getAllByRole("checkbox", { hidden: true }) as HTMLInputElement[];
    const tabIndexes = () => inputsOf().map((i) => i.getAttribute("tabindex"));
    const press = (code: string) => fireEvent.keyDown(document.activeElement as Element, { code });

    it("gives tabindex 0 only to the first enabled option initially", () => {
      render(
        <USelectButton
          value={null}
          onChange={() => {}}
          options={[{ label: "A", disabled: true }, "B", "C"]}
          optionLabel="label"
          optionDisabled="disabled"
        />
      );
      expect(tabIndexes()).toEqual(["-1", "0", "-1"]);
    });

    it("ArrowRight and ArrowDown move focus and the tab stop to the next option", () => {
      render(<USelectButton value={null} onChange={() => {}} options={["A", "B", "C"]} />);
      inputsOf()[0].focus();
      press("ArrowRight");
      expect(document.activeElement).toBe(inputsOf()[1]);
      expect(tabIndexes()).toEqual(["-1", "0", "-1"]);
      press("ArrowDown");
      expect(document.activeElement).toBe(inputsOf()[2]);
      expect(tabIndexes()).toEqual(["-1", "-1", "0"]);
    });

    it("ArrowLeft and ArrowUp move to the previous option", () => {
      render(<USelectButton value={null} onChange={() => {}} options={["A", "B", "C"]} />);
      inputsOf()[2].focus();
      press("ArrowLeft");
      expect(document.activeElement).toBe(inputsOf()[1]);
      press("ArrowUp");
      expect(document.activeElement).toBe(inputsOf()[0]);
    });

    it("wraps at both ends", () => {
      render(<USelectButton value={null} onChange={() => {}} options={["A", "B", "C"]} />);
      inputsOf()[2].focus();
      press("ArrowRight");
      expect(document.activeElement).toBe(inputsOf()[0]);
      press("ArrowLeft");
      expect(document.activeElement).toBe(inputsOf()[2]);
    });

    it("skips disabled options", () => {
      render(
        <USelectButton
          value={null}
          onChange={() => {}}
          options={["A", { label: "B", disabled: true }, "C"]}
          optionLabel="label"
          optionDisabled="disabled"
        />
      );
      inputsOf()[0].focus();
      press("ArrowRight");
      expect(document.activeElement).toBe(inputsOf()[2]);
      press("ArrowLeft");
      expect(document.activeElement).toBe(inputsOf()[0]);
    });

    it("calls preventDefault on arrow keys", () => {
      render(<USelectButton value={null} onChange={() => {}} options={["A", "B"]} />);
      inputsOf()[0].focus();
      const notPrevented = fireEvent.keyDown(inputsOf()[0], { code: "ArrowRight" });
      expect(notPrevented).toBe(false);
    });

    it("arrow keys never change the selected value", () => {
      const onChange = vi.fn();
      render(<USelectButton value="A" onChange={onChange} options={["A", "B", "C"]} />);
      inputsOf()[0].focus();
      press("ArrowRight");
      press("ArrowLeft");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("component disabled: every option has tabindex -1 and arrows do not throw", () => {
      render(<USelectButton value={null} onChange={() => {}} options={["A", "B"]} disabled />);
      expect(tabIndexes()).toEqual(["-1", "-1"]);
      expect(() => fireEvent.keyDown(inputsOf()[0], { code: "ArrowRight" })).not.toThrow();
      expect(tabIndexes()).toEqual(["-1", "-1"]);
    });

    it("all options disabled: no throw, no tab stop", () => {
      render(
        <USelectButton
          value={null}
          onChange={() => {}}
          options={[
            { label: "A", disabled: true },
            { label: "B", disabled: true },
          ]}
          optionLabel="label"
          optionDisabled="disabled"
        />
      );
      expect(tabIndexes()).toEqual(["-1", "-1"]);
      expect(() => fireEvent.keyDown(inputsOf()[0], { code: "ArrowRight" })).not.toThrow();
      expect(tabIndexes()).toEqual(["-1", "-1"]);
    });

    it("falls back to the first enabled option when the focused option becomes disabled", () => {
      const opts = (bDisabled: boolean) => ["A", { label: "B", disabled: bDisabled }, "C"];
      const ui = (bDisabled: boolean) => (
        <USelectButton
          value={null}
          onChange={() => {}}
          options={opts(bDisabled)}
          optionLabel="label"
          optionDisabled="disabled"
        />
      );
      const { rerender } = render(ui(false));
      inputsOf()[0].focus();
      press("ArrowRight");
      expect(tabIndexes()).toEqual(["-1", "0", "-1"]);
      rerender(ui(true));
      expect(tabIndexes()).toEqual(["0", "-1", "-1"]);
    });

    it("falls back to the first enabled option when the focused option is removed", () => {
      const { rerender } = render(<USelectButton value={null} onChange={() => {}} options={["A", "B", "C"]} />);
      inputsOf()[2].focus();
      fireEvent.click(inputsOf()[2]);
      expect(tabIndexes()).toEqual(["-1", "-1", "0"]);
      rerender(<USelectButton value={null} onChange={() => {}} options={["A", "B"]} />);
      expect(tabIndexes()).toEqual(["0", "-1"]);
    });

    it("Space still selects exactly once", () => {
      const onChange = vi.fn();
      render(<USelectButton value={null} onChange={onChange} options={["A", "B"]} />);
      inputsOf()[0].focus();
      fireEvent.keyDown(inputsOf()[0], { key: " ", code: "Space" });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
