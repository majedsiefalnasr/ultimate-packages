import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UAutoComplete } from "./autocomplete";

describe("UAutoComplete", () => {
  it("renders a native combobox input", () => {
    render(<UAutoComplete value={null} onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls completeMethod after the debounce delay once minLength is met", async () => {
    const completeMethod = vi.fn();
    render(<UAutoComplete value={null} onChange={() => {}} delay={10} completeMethod={completeMethod} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ab" } });
    await waitFor(() => expect(completeMethod).toHaveBeenCalledWith(expect.objectContaining({ query: "ab" })), {
      timeout: 500,
    });
  });

  it("opens the suggestion overlay and lists provided suggestions", async () => {
    function Harness() {
      const [suggestions, setSuggestions] = React.useState<string[]>([]);
      return (
        <UAutoComplete
          value={null}
          onChange={() => {}}
          delay={1}
          suggestions={suggestions}
          completeMethod={() => setSuggestions(["Apple", "Banana"])}
        />
      );
    }
    render(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    await waitFor(() => expect(screen.getAllByRole("option").length).toBe(2), { timeout: 500 });
    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
  });

  it("navigates suggestions with ArrowDown/ArrowUp and selects with Enter", async () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    render(
      <UAutoComplete
        value={null}
        onChange={onChange}
        delay={1}
        suggestions={["Apple", "Banana"]}
        completeMethod={() => {}}
        onSelect={onSelect}
      />
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    await waitFor(() => expect(screen.queryAllByRole("option").length).toBe(2), { timeout: 500 });

    fireEvent.keyDown(input, { code: "ArrowDown" });
    fireEvent.keyDown(input, { code: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "Apple" }));
    expect(onChange).toHaveBeenCalledWith("Apple");
  });

  it("closes the overlay on Escape", async () => {
    render(
      <UAutoComplete value={null} onChange={() => {}} delay={1} suggestions={["Apple"]} completeMethod={() => {}} />
    );
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeNull(), { timeout: 500 });

    fireEvent.keyDown(input, { code: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("is fully controlled — the value prop drives the displayed input text", () => {
    const { rerender } = render(<UAutoComplete value="Apple" onChange={() => {}} />);
    expect(screen.getByDisplayValue("Apple")).toBeInTheDocument();
    rerender(<UAutoComplete value="Banana" onChange={() => {}} />);
    expect(screen.getByDisplayValue("Banana")).toBeInTheDocument();
  });
});
