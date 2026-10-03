import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UToggleButton } from "./toggle-button";

describe("UToggleButton", () => {
  it("renders a native checkbox input reflecting the checked prop", () => {
    render(<UToggleButton checked={true} onChange={() => {}} />);
    expect(screen.getByRole("checkbox", { hidden: true })).toBeChecked();
  });

  it("does not manage its own internal checked state — stays checked=false until the prop changes", () => {
    const onChange = vi.fn();
    render(<UToggleButton checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { hidden: true }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("checkbox", { hidden: true })).not.toBeChecked();
  });

  it("onChange receives a custom event shape with the toggled value", () => {
    const onChange = vi.fn();
    render(<UToggleButton checked={false} onChange={onChange} name="feature" />);
    fireEvent.click(screen.getByRole("checkbox", { hidden: true }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: true, target: expect.objectContaining({ name: "feature", value: true }) })
    );
  });

  it("applies disabled to the native input and prevents onChange", () => {
    const onChange = vi.fn();
    render(<UToggleButton checked={false} onChange={onChange} disabled />);
    const input = screen.getByRole("checkbox", { hidden: true });
    expect(input).toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders onLabel/offLabel reflecting the checked state", () => {
    const { rerender } = render(
      <UToggleButton checked={false} onChange={() => {}} onLabel="On" offLabel="Off" />
    );
    expect(screen.getByText("Off")).toBeInTheDocument();
    rerender(<UToggleButton checked={true} onChange={() => {}} onLabel="On" offLabel="Off" />);
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<UToggleButton checked={false} onChange={() => {}} invalid />);
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveAttribute("aria-invalid", "true");
  });

  it("toggles on Space keydown", () => {
    const onChange = vi.fn();
    render(<UToggleButton checked={false} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("checkbox", { hidden: true }), { key: " " });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
  });

  it("prevents the default action of a Space keydown so the native activation cannot toggle again (GAP-075)", () => {
    const onChange = vi.fn();
    render(<UToggleButton checked={false} onChange={onChange} />);
    const notPrevented = fireEvent.keyDown(screen.getByRole("checkbox", { hidden: true }), {
      key: " ",
    });
    expect(notPrevented).toBe(false);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("does not toggle on Space when disabled", () => {
    const onChange = vi.fn();
    render(<UToggleButton checked={false} onChange={onChange} disabled />);
    fireEvent.keyDown(screen.getByRole("checkbox", { hidden: true }), { key: " " });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards tabIndex to the input", () => {
    render(<UToggleButton checked={false} onChange={() => {}} tabIndex={-1} />);
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveAttribute("tabindex", "-1");
  });

  it("omits tabindex from the input when tabIndex is not given", () => {
    render(<UToggleButton checked={false} onChange={() => {}} />);
    expect(screen.getByRole("checkbox", { hidden: true })).not.toHaveAttribute("tabindex");
  });
});
