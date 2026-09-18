import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { URating } from "./rating";

describe("URating", () => {
  it("renders one option per star with role=group on the root", () => {
    render(<URating value={null} onChange={() => {}} stars={5} />);
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getAllByRole("radio").length).toBe(5);
  });

  it("clicking a star calls onChange with that star's value", () => {
    const onChange = vi.fn();
    render(<URating value={null} onChange={onChange} stars={5} />);
    fireEvent.click(screen.getAllByRole("radio")[2]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 3 }));
  });

  it("clicking the already-selected star clears it", () => {
    const onChange = vi.fn();
    render(<URating value={3} onChange={onChange} stars={5} />);
    fireEvent.click(screen.getAllByRole("radio")[2]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("ArrowRight/ArrowDown steps to the next star, wrapping past the max", () => {
    const onChange = vi.fn();
    render(<URating value={3} onChange={onChange} stars={3} />);
    fireEvent.keyDown(screen.getAllByRole("radio")[2], { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 1 }));
  });

  it("ArrowLeft/ArrowUp steps to the previous star", () => {
    const onChange = vi.fn();
    render(<URating value={3} onChange={onChange} stars={5} />);
    fireEvent.keyDown(screen.getAllByRole("radio")[2], { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 2 }));
  });

  it("readOnly prevents value changes", () => {
    const onChange = vi.fn();
    render(<URating value={2} onChange={onChange} stars={5} readOnly />);
    fireEvent.click(screen.getAllByRole("radio")[4]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled prevents value changes and sets tabIndex -1", () => {
    const onChange = vi.fn();
    render(<URating value={2} onChange={onChange} stars={5} disabled />);
    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[4]);
    expect(onChange).not.toHaveBeenCalled();
    expect(radios[0]).toHaveAttribute("tabindex", "-1");
  });

  it("is fully controlled — reflects the value prop via aria-checked", () => {
    const { rerender } = render(<URating value={2} onChange={() => {}} stars={3} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");

    rerender(<URating value={3} onChange={() => {}} stars={3} />);
    const radiosAfter = screen.getAllByRole("radio");
    expect(radiosAfter[1]).toHaveAttribute("aria-checked", "false");
    expect(radiosAfter[2]).toHaveAttribute("aria-checked", "true");
  });
});
