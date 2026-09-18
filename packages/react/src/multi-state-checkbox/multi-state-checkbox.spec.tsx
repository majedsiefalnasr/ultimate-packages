import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UMultiStateCheckbox } from "./multi-state-checkbox";

const STATES = ["todo", "in-progress", "done"];

describe("UMultiStateCheckbox", () => {
  it("renders a clickable root with role=button", () => {
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("cycles to the next option on click", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "in-progress" }));
  });

  it("cycles to null after the last option when empty=true (default)", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="done" options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("wraps to the first option after the last when empty=false", () => {
    const onChange = vi.fn();
    render(
      <UMultiStateCheckbox value="done" options={STATES} onChange={onChange} empty={false} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "todo" }));
  });

  it("cycles on Space keydown", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: " ", code: "Space" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "in-progress" }));
  });

  it("does not cycle when disabled", () => {
    const onChange = vi.fn();
    render(
      <UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} disabled />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports object options via optionValue/optionLabel", () => {
    const objectOptions = [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
    ];
    const onChange = vi.fn();
    render(
      <UMultiStateCheckbox
        value="a"
        options={objectOptions}
        optionValue="key"
        optionLabel="label"
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "b" }));
  });
});
