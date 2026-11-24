import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UTriStateCheckbox, type UTriStateCheckboxHandle } from "./tri-state-checkbox";

describe("UTriStateCheckbox", () => {
  it("renders a role=checkbox element reflecting a null (mixed) state", () => {
    render(<UTriStateCheckbox value={null} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("cycles null -> true on click", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
  });

  it("cycles true -> false on click", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: false }));
  });

  it("cycles false -> null on click", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
  });

  it("cycles on Space/Enter keydown", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: " ", code: "Space" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
  });

  it("does not cycle when disabled", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reflects aria-checked=true/false for true/false values", () => {
    const { rerender } = render(<UTriStateCheckbox value={true} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");

    rerender(<UTriStateCheckbox value={false} onChange={() => {}} />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
  });
});

describe("UTriStateCheckbox gap rows", () => {
  it("passes name, id, value and event helpers on change (row 2)", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox id="tri" name="agree" value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    const event = onChange.mock.calls[0]![0];
    expect(event.target).toEqual({ name: "agree", id: "tri", value: true });
    expect(typeof event.stopPropagation).toBe("function");
    expect(typeof event.preventDefault).toBe("function");
  });

  it("cycles when a label for inputId is clicked (row 5)", () => {
    const onChange = vi.fn();
    render(
      <>
        <label htmlFor="tri-input">Agree</label>
        <UTriStateCheckbox inputId="tri-input" value={true} onChange={onChange} />
      </>
    );
    fireEvent.click(screen.getByText("Agree"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: false }));
  });

  it("does not cycle from the label when readOnly or disabled", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <>
        <label htmlFor="tri-input">Agree</label>
        <UTriStateCheckbox inputId="tri-input" value={null} onChange={onChange} readOnly />
      </>
    );
    fireEvent.click(screen.getByText("Agree"));
    rerender(
      <>
        <label htmlFor="tri-input">Agree</label>
        <UTriStateCheckbox inputId="tri-input" value={null} onChange={onChange} disabled />
      </>
    );
    fireEvent.click(screen.getByText("Agree"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("cycles on Enter and NumpadEnter keydown", () => {
    const onChange = vi.fn();
    render(<UTriStateCheckbox value={null} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: "Enter", code: "Enter" });
    fireEvent.keyDown(screen.getByRole("checkbox"), { key: "Enter", code: "NumpadEnter" });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("renders custom check and uncheck icons (row 7)", () => {
    const { rerender } = render(
      <UTriStateCheckbox
        value={true}
        checkIcon={<i data-testid="yes" />}
        uncheckIcon={<i data-testid="no" />}
      />
    );
    expect(screen.getByTestId("yes")).toBeInTheDocument();
    rerender(
      <UTriStateCheckbox
        value={false}
        checkIcon={<i data-testid="yes" />}
        uncheckIcon={<i data-testid="no" />}
      />
    );
    expect(screen.getByTestId("no")).toBeInTheDocument();
  });

  it("keeps aria-checked mixed for null and forwards ARIA to the box (rows 8, 9)", () => {
    render(<UTriStateCheckbox value={null} aria-labelledby="lbl" aria-label="Consent" />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-checked", "mixed");
    expect(box).toHaveAttribute("aria-labelledby", "lbl");
    expect(box).toHaveAttribute("aria-label", "Consent");
  });

  it("announces localizable labels in the live region (row 10)", () => {
    const { container, rerender } = render(<UTriStateCheckbox value={null} />);
    const live = () => container.querySelector("[aria-live]")!;
    expect(live()).toHaveTextContent("Not Selected");
    rerender(<UTriStateCheckbox value={true} trueLabel="Oui" />);
    expect(live()).toHaveTextContent("Oui");
    rerender(<UTriStateCheckbox value={false} falseLabel="Non" />);
    expect(live()).toHaveTextContent("Non");
    rerender(<UTriStateCheckbox value={null} nullLabel="Aucun" />);
    expect(live()).toHaveTextContent("Aucun");
  });

  it("puts aria-invalid on the focusable box (row 11)", () => {
    render(<UTriStateCheckbox value={null} invalid />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("adds the filled variant class (row 12)", () => {
    const { container } = render(<UTriStateCheckbox value={null} variant="filled" />);
    expect(container.firstElementChild).toHaveClass("p-variant-filled");
  });

  it("calls onFocus and onBlur and honours autoFocus (row 13)", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<UTriStateCheckbox value={null} autoFocus onFocus={onFocus} onBlur={onBlur} />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEvent.blur(box);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("exposes focus() and getElement() on the ref (row 14)", () => {
    const ref = React.createRef<UTriStateCheckboxHandle>();
    const { container } = render(<UTriStateCheckbox ref={ref} value={null} />);
    expect(ref.current!.getElement()).toBe(container.firstElementChild);
    ref.current!.focus();
    expect(screen.getByRole("checkbox")).toHaveFocus();
  });

  it("forwards native attributes, style and className to the root (row 16)", () => {
    const { container } = render(
      <UTriStateCheckbox value={null} className="mine" style={{ margin: 4 }} data-x="1" />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("mine");
    expect(root).toHaveStyle({ margin: "4px" });
    expect(root).toHaveAttribute("data-x", "1");
  });

  it("applies pt and ptOptions to its sections (rows 17, 21)", () => {
    const { container } = render(
      <UTriStateCheckbox
        value={true}
        pt={{ root: { "data-pt": "r" }, box: { "data-pt": "b" }, input: { "data-pt": "i" } }}
      />
    );
    expect(container.firstElementChild).toHaveAttribute("data-pt", "r");
    expect(screen.getByRole("checkbox")).toHaveAttribute("data-pt", "b");
    expect(container.querySelector("input")).toHaveAttribute("data-pt", "i");
  });

  it("renders no Ultimate classes when unstyled (row 18)", () => {
    const { container } = render(<UTriStateCheckbox value={true} unstyled />);
    expect(container.querySelector("[class*='u-tri-state-checkbox']")).toBeNull();
  });

  it("uses the icon class on the rendered icon (row 19)", () => {
    const { container } = render(<UTriStateCheckbox value={true} />);
    expect(container.querySelector(".u-tri-state-checkbox-icon")).not.toBeNull();
  });
});
