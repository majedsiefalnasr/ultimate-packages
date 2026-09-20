import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { URadioButton } from "./radio-button";

describe("URadioButton", () => {
  it("renders a native radio input reflecting the checked prop", () => {
    render(<URadioButton checked={true} onChange={() => {}} />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("does not manage its own internal checked state — stays checked=false until the prop changes", () => {
    const onChange = vi.fn();
    render(<URadioButton checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("radio")).not.toBeChecked();
  });

  it("onChange receives a custom event shape with checked/value/originalEvent", () => {
    const onChange = vi.fn();
    render(<URadioButton checked={false} onChange={onChange} name="option" value="a" />);
    fireEvent.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        checked: true,
        value: "a",
        target: expect.objectContaining({ name: "option", checked: true, value: "a" }),
      })
    );
  });

  it("applies disabled to the native input and prevents onChange", () => {
    const onChange = vi.fn();
    render(<URadioButton checked={false} onChange={onChange} disabled />);
    const input = screen.getByRole("radio");
    expect(input).toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sets aria-invalid from the invalid prop", () => {
    render(<URadioButton checked={false} onChange={() => {}} invalid />);
    expect(screen.getByRole("radio")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards inputRef to the native <input> element", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    render(<URadioButton checked={false} onChange={() => {}} inputRef={inputRef} />);
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current?.type).toBe("radio");
  });

  it("native name grouping: multiple controlled radios sharing a name render independently", () => {
    function Group() {
      const [selected, setSelected] = React.useState("a");
      return (
        <>
          <URadioButton
            name="group"
            value="a"
            checked={selected === "a"}
            onChange={(e) => setSelected(e.value as string)}
          />
          <URadioButton
            name="group"
            value="b"
            checked={selected === "b"}
            onChange={(e) => setSelected(e.value as string)}
          />
        </>
      );
    }
    render(<Group />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    fireEvent.click(radios[1]);
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
  });
});
