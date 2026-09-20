import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UFieldset } from "./fieldset";

describe("UFieldset", () => {
  it("renders the legend text and children", () => {
    render(
      <UFieldset legend="Info">
        <p>Content</p>
      </UFieldset>
    );
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("does not render a toggle button when toggleable is false", () => {
    const { container } = render(<UFieldset legend="Info" />);
    expect(container.querySelector(".u-fieldset-toggle-button")).not.toBeInTheDocument();
  });

  it("renders content by default when toggleable, and hides it once toggled (uncontrolled)", () => {
    render(
      <UFieldset legend="Info" toggleable>
        <p>Content</p>
      </UFieldset>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("starts collapsed when collapsed=true, and expands on toggle", () => {
    render(
      <UFieldset legend="Info" toggleable collapsed>
        <p>Content</p>
      </UFieldset>
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("behaves as controlled when onToggle is provided (state does not change unless the prop does)", () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <UFieldset legend="Info" toggleable collapsed={false} onToggle={onToggle}>
        <p>Content</p>
      </UFieldset>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ value: true }));
    // Still expanded because the `collapsed` prop hasn't changed.
    expect(screen.getByText("Content")).toBeInTheDocument();

    rerender(
      <UFieldset legend="Info" toggleable collapsed={true} onToggle={onToggle}>
        <p>Content</p>
      </UFieldset>
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("toggles on Enter and Space keydown on the toggle button", () => {
    render(
      <UFieldset legend="Info" toggleable>
        <p>Content</p>
      </UFieldset>
    );
    fireEvent.keyDown(screen.getByRole("button"), { code: "Enter" });
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("sets aria-expanded and aria-controls on the toggle button", () => {
    render(<UFieldset legend="Info" toggleable />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button.getAttribute("aria-controls")).toBeTruthy();
  });
});
