import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputOtp } from "./input-otp";

describe("UInputOtp", () => {
  it("renders `length` segmented native inputs", () => {
    render(<UInputOtp value="" length={4} onChange={() => {}} />);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("distributes the value's characters across segments", () => {
    render(<UInputOtp value="12" length={4} onChange={() => {}} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs[0].value).toBe("1");
    expect(inputs[1].value).toBe("2");
    expect(inputs[2].value).toBe("");
  });

  it("emits onChange with the joined value on segment input", () => {
    const onChange = vi.fn();
    render(<UInputOtp value="" length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.input(inputs[0], { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "5" }));
  });

  it("moves focus to the previous segment on Backspace in an empty segment", () => {
    render(<UInputOtp value="12" length={4} onChange={() => {}} />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[2].focus();
    fireEvent.keyDown(inputs[2], { key: "Backspace", code: "Backspace" });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it("distributes a pasted code across all segments", () => {
    const onChange = vi.fn();
    render(<UInputOtp value="" length={4} onChange={onChange} />);
    const inputs = screen.getAllByRole("textbox");
    const clipboardData = { getData: () => "1234" };
    fireEvent.paste(inputs[0], { clipboardData });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "1234" }));
  });

  it("blocks non-numeric keys when integerOnly is set", () => {
    render(<UInputOtp value="" length={4} integerOnly onChange={() => {}} />);
    const inputs = screen.getAllByRole("textbox");
    const event = fireEvent.keyDown(inputs[0], { key: "a", code: "KeyA" });
    expect(event).toBe(false);
  });

  it("uses type=password on each segment when mask is set", () => {
    const { container } = render(<UInputOtp value="" length={4} mask onChange={() => {}} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs[0]).toHaveAttribute("type", "password");
  });

  it("applies disabled to every segment", () => {
    render(<UInputOtp value="" length={4} onChange={() => {}} disabled />);
    screen.getAllByRole("textbox").forEach((input) => expect(input).toBeDisabled());
  });
});
