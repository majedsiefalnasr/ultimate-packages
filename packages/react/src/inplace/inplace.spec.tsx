import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UInplace } from "./inplace";

describe("UInplace", () => {
  it("renders the display content when inactive", () => {
    render(
      <UInplace display={<span>Click to edit</span>}>
        {() => <input aria-label="editor" />}
      </UInplace>
    );
    expect(screen.getByText("Click to edit")).toBeInTheDocument();
    expect(screen.queryByLabelText("editor")).not.toBeInTheDocument();
  });

  it("activates and shows the content on click", () => {
    render(
      <UInplace display={<span>Click to edit</span>}>
        {() => <input aria-label="editor" />}
      </UInplace>
    );
    fireEvent.click(screen.getByText("Click to edit"));
    expect(screen.getByLabelText("editor")).toBeInTheDocument();
  });

  it("activates on Enter keydown", () => {
    render(
      <UInplace display={<span>Click to edit</span>}>
        {() => <input aria-label="editor" />}
      </UInplace>
    );
    fireEvent.keyDown(screen.getByRole("button"), { code: "Enter" });
    expect(screen.getByLabelText("editor")).toBeInTheDocument();
  });

  it("invokes closeCallback from children to deactivate", () => {
    render(
      <UInplace active display={<span>Click to edit</span>}>
        {(closeCallback) => (
          <button onClick={(e) => closeCallback(e)}>Close</button>
        )}
      </UInplace>
    );
    fireEvent.click(screen.getByText("Close"));
    expect(screen.getByText("Click to edit")).toBeInTheDocument();
  });

  it("does not activate when disabled", () => {
    render(
      <UInplace disabled display={<span>Click to edit</span>}>
        {() => <input aria-label="editor" />}
      </UInplace>
    );
    fireEvent.click(screen.getByText("Click to edit"));
    expect(screen.queryByLabelText("editor")).not.toBeInTheDocument();
  });

  it("calls onOpen and onClose", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    render(
      <UInplace display={<span>Click to edit</span>} onOpen={onOpen} onClose={onClose}>
        {(closeCallback) => <button onClick={(e) => closeCallback(e)}>Close</button>}
      </UInplace>
    );
    fireEvent.click(screen.getByText("Click to edit"));
    expect(onOpen).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("behaves as controlled when onToggle is provided", () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <UInplace active={false} display={<span>Click to edit</span>} onToggle={onToggle}>
        {() => <input aria-label="editor" />}
      </UInplace>
    );
    fireEvent.click(screen.getByText("Click to edit"));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
    expect(screen.queryByLabelText("editor")).not.toBeInTheDocument();

    rerender(
      <UInplace active={true} display={<span>Click to edit</span>} onToggle={onToggle}>
        {() => <input aria-label="editor" />}
      </UInplace>
    );
    expect(screen.getByLabelText("editor")).toBeInTheDocument();
  });
});
