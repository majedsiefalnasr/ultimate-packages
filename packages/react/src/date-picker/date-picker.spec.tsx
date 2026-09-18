import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UDatePicker } from "./date-picker";

describe("UDatePicker", () => {
  it("renders a readonly text input with an empty value when nothing is selected", () => {
    render(<UDatePicker value={null} onChange={() => {}} placeholder="Select a date" />);
    const input = screen.getByPlaceholderText("Select a date") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe("");
  });

  it("opens the overlay on click and renders a day grid", () => {
    render(<UDatePicker value={null} onChange={() => {}} placeholder="Select a date" />);
    expect(screen.queryByRole("grid")).toBeNull();
    fireEvent.click(screen.getByPlaceholderText("Select a date"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell").length).toBeGreaterThan(27);
  });

  it("selecting a date calls onChange with a Date object and closes the overlay", () => {
    const onChange = vi.fn();
    render(<UDatePicker value={new Date(2026, 8, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("textbox"));

    const day15 = screen.getAllByRole("gridcell").find((el) => el.textContent === "15");
    fireEvent.click(day15!);

    expect(onChange).toHaveBeenCalledTimes(1);
    const selected = onChange.mock.calls[0][0] as Date;
    expect(selected.getDate()).toBe(15);
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("navigates months with the header prev/next buttons", () => {
    render(<UDatePicker value={new Date(2026, 8, 1)} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("textbox"));
    expect(screen.getByText("September")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("October")).toBeInTheDocument();
  });

  it("supports arrow-key grid navigation and Enter selection", () => {
    const onChange = vi.fn();
    render(<UDatePicker value={new Date(2026, 8, 15)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("textbox"));

    let focused = screen.getAllByRole("gridcell").find((el) => el.getAttribute("tabindex") === "0")!;
    expect(focused.textContent).toBe("15");

    fireEvent.keyDown(focused, { code: "ArrowRight" });
    focused = screen.getAllByRole("gridcell").find((el) => el.getAttribute("tabindex") === "0")!;
    expect(focused.textContent).toBe("16");

    fireEvent.keyDown(focused, { code: "ArrowDown" });
    focused = screen.getAllByRole("gridcell").find((el) => el.getAttribute("tabindex") === "0")!;
    expect(focused.textContent).toBe("23");

    fireEvent.keyDown(focused, { code: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(23);
  });

  it("closes the overlay on Escape", () => {
    render(<UDatePicker value={null} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    fireEvent.click(input);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    fireEvent.keyDown(input, { code: "Escape" });
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("respects minDate/maxDate — out-of-range cells are aria-disabled and unselectable", () => {
    const onChange = vi.fn();
    render(
      <UDatePicker
        value={new Date(2026, 8, 15)}
        onChange={onChange}
        minDate={new Date(2026, 8, 10)}
        maxDate={new Date(2026, 8, 20)}
      />
    );
    fireEvent.click(screen.getByRole("textbox"));
    // `value` pins the view to September 2026, so day "5" (outside the
    // min/max range) is guaranteed present and unambiguous.
    const day5 = screen
      .getAllByRole("gridcell")
      .find((el) => el.textContent === "5" && el.className.indexOf("other-month") === -1);
    expect(day5).toBeDefined();
    expect(day5!.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(day5!);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is fully controlled — the value prop drives the input's displayed text", () => {
    const { rerender } = render(<UDatePicker value={new Date(2026, 8, 5)} onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toMatch(/09\/05\/2026/);
    rerender(<UDatePicker value={new Date(2026, 8, 20)} onChange={() => {}} />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toMatch(/09\/20\/2026/);
  });

  it("clears the value via the clear icon when showClear is set", () => {
    const onChange = vi.fn();
    render(<UDatePicker value={new Date(2026, 8, 5)} onChange={onChange} showClear />);
    fireEvent.click(screen.getByText("×"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("disabled state prevents opening the overlay", () => {
    render(<UDatePicker value={null} onChange={() => {}} disabled />);
    fireEvent.click(screen.getByRole("textbox"));
    expect(screen.queryByRole("grid")).toBeNull();
  });
});
