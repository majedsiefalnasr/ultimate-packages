import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInputChips } from "./input-chips";

describe("UInputChips", () => {
  it("renders one token per value entry plus the text input", () => {
    render(<UInputChips value={["a", "b"]} onChange={() => {}} />);
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("adds a tag on Enter and clears the input", () => {
    const onChange = vi.fn();
    render(<UInputChips value={[]} onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "tag1" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["tag1"]);
  });

  it("does not add an empty/whitespace-only tag", () => {
    const onChange = vi.fn();
    render(<UInputChips value={[]} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes the last tag on Backspace when the input is empty", () => {
    const onChange = vi.fn();
    render(<UInputChips value={["a", "b"]} onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("removes a specific tag via its remove button", () => {
    const onChange = vi.fn();
    render(<UInputChips value={["a", "b", "c"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove b" }));
    expect(onChange).toHaveBeenCalledWith(["a", "c"]);
  });

  it("respects allowDuplicate=false by not calling onAdd for a duplicate value", () => {
    const onAdd = vi.fn();
    const onChange = vi.fn();
    render(<UInputChips value={["a"]} onChange={onChange} onAdd={onAdd} allowDuplicate={false} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("disables the input once max tags are reached", () => {
    render(<UInputChips value={["a", "b"]} onChange={() => {}} max={2} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("does not render remove buttons when disabled", () => {
    render(<UInputChips value={["a"]} onChange={() => {}} disabled />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("adds a tag on blur when addOnBlur is set", () => {
    const onChange = vi.fn();
    render(<UInputChips value={[]} onChange={onChange} addOnBlur />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "tag1" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(["tag1"]);
  });
});
