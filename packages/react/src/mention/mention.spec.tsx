import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UMention } from "./mention";

// UMention debounces its search via setTimeout(..., delay) — matching real
// source's own timeout-based search debounce. Fake timers make the
// debounce deterministic, same pattern as the DatePicker min/max test fix
// referenced in this repo's own recent commit history.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UMention", () => {
  it("renders a textarea with role=combobox", () => {
    render(<UMention value="" onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onSearch with the query text after the '@' trigger", () => {
    const onSearch = vi.fn();
    render(<UMention value="" onChange={() => {}} onSearch={onSearch} delay={0} />);
    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "@jo", selectionStart: 3 } });
    act(() => { vi.runAllTimers(); });
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ trigger: "@", query: "jo" }));
  });

  it("does not trigger search without the trigger character", () => {
    const onSearch = vi.fn();
    render(<UMention value="" onChange={() => {}} onSearch={onSearch} />);
    const textarea = screen.getByRole("combobox");
    fireEvent.change(textarea, { target: { value: "hello", selectionStart: 5 } });
    act(() => { vi.runAllTimers(); });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("shows the suggestion overlay once suggestions are provided after a search", () => {
    const { rerender } = render(
      <UMention value="@j" onChange={() => {}} suggestions={[]} onSearch={() => {}} delay={0} />
    );
    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "@jo", selectionStart: 3 } });
    act(() => { vi.runAllTimers(); });

    rerender(
      <UMention
        value="@jo"
        onChange={() => {}}
        suggestions={["john", "joanna"]}
        onSearch={() => {}}
        delay={0}
      />
    );

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("selects a suggestion on click and replaces the trigger query with the selected text", () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const { rerender } = render(
      <UMention value="@j" onChange={onChange} suggestions={[]} onSelect={onSelect} delay={0} />
    );
    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "@jo", selectionStart: 3 } });
    act(() => { vi.runAllTimers(); });

    rerender(
      <UMention value="@jo" onChange={onChange} suggestions={["john"]} onSelect={onSelect} delay={0} />
    );

    fireEvent.click(screen.getByRole("option", { name: "john" }));
    expect(onChange).toHaveBeenCalledWith("@john ");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ suggestion: "john" }));
  });

  it("closes the overlay on Escape", () => {
    const { rerender } = render(
      <UMention value="@j" onChange={() => {}} suggestions={[]} delay={0} />
    );
    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "@jo", selectionStart: 3 } });
    act(() => { vi.runAllTimers(); });
    rerender(<UMention value="@jo" onChange={() => {}} suggestions={["john"]} delay={0} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("navigates suggestions with ArrowDown and selects the highlighted one on Enter", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <UMention value="@j" onChange={onChange} suggestions={[]} delay={0} />
    );
    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "@jo", selectionStart: 3 } });
    act(() => { vi.runAllTimers(); });
    rerender(<UMention value="@jo" onChange={onChange} suggestions={["john", "joanna"]} delay={0} />);

    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("@joanna ");
  });
});
