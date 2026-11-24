import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UMultiStateCheckbox, type UMultiStateCheckboxHandle } from "./multi-state-checkbox";

const STATES = ["todo", "in-progress", "done"];

describe("UMultiStateCheckbox", () => {
  it("renders a focusable role=checkbox", () => {
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("tabindex", "0");
  });

  it("cycles to the next option on click", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "in-progress" }));
  });

  it("starts at the first option when nothing is selected", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value={null} options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "todo" }));
  });

  it("cycles to null after the last option when empty=true (default)", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="done" options={STATES} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("wraps to the first option after the last when empty=false", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="done" options={STATES} onChange={onChange} empty={false} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "todo" }));
  });

  it("cycles on Space keydown", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " ", code: "Space" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "in-progress" }));
  });

  it("does not cycle when disabled", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("checkbox"));
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
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: "b" }));
  });
});

describe("UMultiStateCheckbox gap rows", () => {
  it("does not cycle on click or Space when readOnly", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value="todo" options={STATES} onChange={onChange} readOnly />);
    const box = screen.getByRole("checkbox");
    fireEvent.click(box);
    fireEvent.keyDown(box, { key: " ", code: "Space" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("passes name, id, value and event helpers on change", () => {
    const onChange = vi.fn();
    render(
      <UMultiStateCheckbox
        id="ms"
        name="status"
        value="todo"
        options={STATES}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    const event = onChange.mock.calls[0]?.[0];
    expect(event.target).toEqual({ name: "status", id: "ms", value: "in-progress" });
    expect(typeof event.stopPropagation).toBe("function");
    expect(typeof event.preventDefault).toBe("function");
  });

  it("reports aria-checked and the selected label as the accessible name and live text", () => {
    const { rerender } = render(
      <UMultiStateCheckbox value="done" options={STATES} onChange={() => {}} />
    );
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-checked", "true");
    expect(box).toHaveAttribute("aria-label", "done");
    expect(document.querySelector("[aria-live='polite']")).toHaveTextContent("done");

    rerender(<UMultiStateCheckbox value={null} options={STATES} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-label", "Not Selected");
  });

  it("lets the consumer set aria-label and nullLabel", () => {
    const { rerender } = render(
      <UMultiStateCheckbox
        value="todo"
        options={STATES}
        onChange={() => {}}
        aria-label="Task status"
      />
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-label", "Task status");

    rerender(
      <UMultiStateCheckbox value={null} options={STATES} onChange={() => {}} nullLabel="None" />
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-label", "None");
  });

  it("renders the option icon for the selected option", () => {
    render(
      <UMultiStateCheckbox
        value="done"
        options={STATES}
        onChange={() => {}}
        optionIcon={(option) => <i data-testid="icon">{option}</i>}
      />
    );
    expect(screen.getByTestId("icon")).toHaveTextContent("done");
  });

  it("marks invalid and filled variants", () => {
    const { container } = render(
      <UMultiStateCheckbox
        value="todo"
        options={STATES}
        onChange={() => {}}
        invalid
        variant="filled"
      />
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(container.firstElementChild).toHaveClass(
      "u-multi-state-checkbox-invalid",
      "p-variant-filled"
    );
  });

  it("focuses the box on autoFocus and through the ref handle", () => {
    const ref = React.createRef<UMultiStateCheckboxHandle>();
    render(<UMultiStateCheckbox ref={ref} autoFocus value="todo" options={STATES} />);
    expect(screen.getByRole("checkbox")).toHaveFocus();
    (document.activeElement as HTMLElement).blur();
    ref.current?.focus();
    expect(screen.getByRole("checkbox")).toHaveFocus();
    expect(ref.current?.getElement()).toBe(document.querySelector(".u-multi-state-checkbox"));
  });

  it("applies style and passes rest attributes to the root", () => {
    const { container } = render(
      <UMultiStateCheckbox
        value="todo"
        options={STATES}
        onChange={() => {}}
        style={{ marginTop: 4 }}
        data-extra="x"
      />
    );
    expect(container.firstElementChild).toHaveStyle({ marginTop: "4px" });
    expect(container.firstElementChild).toHaveAttribute("data-extra", "x");
  });

  it("supports pt and unstyled", () => {
    const { container, rerender } = render(
      <UMultiStateCheckbox
        value="done"
        options={STATES}
        onChange={() => {}}
        pt={{ root: { "data-pt": "root" }, box: { "data-pt": "box" } }}
      />
    );
    expect(container.firstElementChild).toHaveAttribute("data-pt", "root");
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-pt", "box");

    rerender(<UMultiStateCheckbox value="done" options={STATES} onChange={() => {}} unstyled />);
    expect(container.firstElementChild).not.toHaveClass("u-multi-state-checkbox");
  });

  it("does not emit onChange on mount when empty=false and value is null (ADR-099)", () => {
    const onChange = vi.fn();
    render(<UMultiStateCheckbox value={null} options={STATES} onChange={onChange} empty={false} />);
    expect(onChange).not.toHaveBeenCalled();
  });
});
