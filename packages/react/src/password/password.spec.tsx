import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UPassword } from "./password";

describe("UPassword", () => {
  it("renders a native password input", () => {
    render(<UPassword value="" onChange={() => {}} />);
    const input = screen.getByDisplayValue("") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("is fully controlled — value prop drives the input", () => {
    const { rerender } = render(<UPassword value="abc" onChange={() => {}} />);
    expect(screen.getByDisplayValue("abc")).toBeInTheDocument();
    rerender(<UPassword value="xyz" onChange={() => {}} />);
    expect(screen.getByDisplayValue("xyz")).toBeInTheDocument();
  });

  it("calls onChange on input, without managing its own value state", () => {
    const onChange = vi.fn();
    render(<UPassword value="" onChange={onChange} />);
    const input = screen.getByDisplayValue("") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "secret" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("toggles unmasked state via the mask icon, switching input type to text", () => {
    render(<UPassword value="secret" onChange={() => {}} toggleMask />);
    const input = screen.getByDisplayValue("secret") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show Password" }));
    expect(input.type).toBe("text");
  });

  it("shows the strength-meter overlay on focus when feedback is enabled", () => {
    render(<UPassword value="" onChange={() => {}} />);
    const input = screen.getByDisplayValue("") as HTMLInputElement;
    fireEvent.focus(input);
    expect(document.querySelector(".u-password-overlay")).not.toBeNull();
    fireEvent.blur(input);
    expect(document.querySelector(".u-password-overlay")).toBeNull();
  });

  it("classifies a strong password and updates the meter width/label", () => {
    render(<UPassword value="Str0ngPass!" onChange={() => {}} />);
    const input = screen.getByDisplayValue("Str0ngPass!") as HTMLInputElement;
    fireEvent.focus(input);
    const label = document.querySelector(".u-password-meter-label") as HTMLElement;
    expect(label.style.width).toBe("100%");
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("classifies a weak password", () => {
    render(<UPassword value="abc" onChange={() => {}} />);
    const input = screen.getByDisplayValue("abc") as HTMLInputElement;
    fireEvent.focus(input);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("hides the overlay on Escape keyup", () => {
    render(<UPassword value="" onChange={() => {}} />);
    const input = screen.getByDisplayValue("") as HTMLInputElement;
    fireEvent.focus(input);
    expect(document.querySelector(".u-password-overlay")).not.toBeNull();
    fireEvent.keyUp(input, { code: "Escape" });
    expect(document.querySelector(".u-password-overlay")).toBeNull();
  });

  it("does not show the overlay when feedback is disabled", () => {
    render(<UPassword value="" onChange={() => {}} feedback={false} />);
    const input = screen.getByDisplayValue("") as HTMLInputElement;
    fireEvent.focus(input);
    expect(document.querySelector(".u-password-overlay")).toBeNull();
  });
});
