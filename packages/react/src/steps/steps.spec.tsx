import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { USteps } from "./steps";
import type { UMenuItem } from "../menu";

describe("USteps", () => {
  const items: UMenuItem[] = [{ label: "Personal" }, { label: "Payment" }, { label: "Confirmation" }];

  it("renders one list item per model entry, in order", () => {
    const { container } = render(<USteps model={items} />);
    const labels = Array.from(container.querySelectorAll(".u-steps-item-label")).map((el) => el.textContent);
    expect(labels).toEqual(["Personal", "Payment", "Confirmation"]);
  });

  it('marks the item at activeIndex aria-current="step"', () => {
    const { container } = render(<USteps model={items} activeIndex={1} />);
    const listItems = container.querySelectorAll("li");
    expect(listItems[0].getAttribute("aria-current")).toBeNull();
    expect(listItems[1].getAttribute("aria-current")).toBe("step");
  });

  it("renders 1-based step numbers", () => {
    const { container } = render(<USteps model={items} />);
    const numbers = Array.from(container.querySelectorAll(".u-steps-item-number")).map((el) => el.textContent);
    expect(numbers).toEqual(["1", "2", "3"]);
  });

  it("when readonly, non-active items are disabled and clicking them does not call onSelect", () => {
    const onSelect = vi.fn();
    const { container } = render(<USteps model={items} onSelect={onSelect} />);
    const secondLink = container.querySelectorAll("a")[1];
    expect(secondLink.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(secondLink);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("when not readonly, clicking a non-active item calls onSelect with the item and index", () => {
    const onSelect = vi.fn();
    const { container } = render(<USteps model={items} readonly={false} onSelect={onSelect} />);
    const secondLink = container.querySelectorAll("a")[1];
    fireEvent.click(secondLink);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ index: 1, item: items[1] }));
  });

  it("invokes item.command on click when not readonly", () => {
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "One" }, { label: "Two", command }];
    const { container } = render(<USteps model={model} readonly={false} />);
    const secondLink = container.querySelectorAll("a")[1];
    fireEvent.click(secondLink);
    expect(command).toHaveBeenCalled();
  });

  it("skips items with visible: false", () => {
    const model: UMenuItem[] = [{ label: "One" }, { label: "Hidden", visible: false }, { label: "Three" }];
    const { container } = render(<USteps model={model} />);
    const labels = Array.from(container.querySelectorAll(".u-steps-item-label")).map((el) => el.textContent);
    expect(labels).toEqual(["One", "Three"]);
  });
});
