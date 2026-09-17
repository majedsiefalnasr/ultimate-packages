import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useKeyFilter, type UKeyFilterPattern } from "./key-filter";

function TestInput({
  pattern,
  validateOnly,
}: {
  pattern?: RegExp | UKeyFilterPattern;
  validateOnly?: boolean;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  useKeyFilter(ref, { pattern, validateOnly });
  return <input ref={ref} aria-label="filtered" />;
}

function keypress(input: HTMLInputElement, key: string): boolean {
  const event = new KeyboardEvent("keypress", { key, cancelable: true, bubbles: true });
  input.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("useKeyFilter", () => {
  it("blocks a non-matching keypress for the 'int' preset", () => {
    render(<TestInput pattern="int" />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    expect(keypress(input, "a")).toBe(true);
  });

  it("allows a matching keypress for the 'int' preset", () => {
    render(<TestInput pattern="int" />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    expect(keypress(input, "5")).toBe(false);
  });

  it("allows the leading '-' for the 'int' preset", () => {
    render(<TestInput pattern="int" />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    expect(keypress(input, "-")).toBe(false);
  });

  it("blocks a non-numeric character for the 'pint' preset", () => {
    render(<TestInput pattern="pint" />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    expect(keypress(input, "-")).toBe(true);
    expect(keypress(input, "3")).toBe(false);
  });

  it("accepts a custom RegExp pattern", () => {
    render(<TestInput pattern={/^[a-c]*$/} />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    expect(keypress(input, "a")).toBe(false);
    expect(keypress(input, "z")).toBe(true);
  });

  it("blocks pasting text containing an invalid character", () => {
    render(<TestInput pattern="int" />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    const event = new Event("paste", { cancelable: true, bubbles: true }) as ClipboardEvent;
    Object.defineProperty(event, "clipboardData", { value: { getData: () => "12a3" } });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows pasting text that fully matches the pattern", () => {
    render(<TestInput pattern="int" />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    const event = new Event("paste", { cancelable: true, bubbles: true }) as ClipboardEvent;
    Object.defineProperty(event, "clipboardData", { value: { getData: () => "123" } });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not block keys when validateOnly is enabled", () => {
    render(<TestInput pattern="int" validateOnly />);
    const input = screen.getByLabelText("filtered") as HTMLInputElement;
    expect(keypress(input, "a")).toBe(false);
  });
});
