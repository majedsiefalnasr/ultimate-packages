import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UPanel } from "./panel";

describe("UPanel", () => {
  it("renders the header text and children", () => {
    render(
      <UPanel header="Info">
        <p>Content</p>
      </UPanel>
    );
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("does not render a toggle button when toggleable is false", () => {
    render(<UPanel header="Info" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("toggles content visibility when the toggle button is clicked (uncontrolled)", () => {
    render(
      <UPanel header="Info" toggleable>
        <p>Content</p>
      </UPanel>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("starts collapsed when collapsed=true, and expands on toggle", () => {
    render(
      <UPanel header="Info" toggleable collapsed>
        <p>Content</p>
      </UPanel>
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("calls onToggle with the next value and behaves as controlled", () => {
    const onToggle = vi.fn();
    render(<UPanel header="Info" toggleable collapsed={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledWith(
      expect.objectContaining({ value: true })
    );
  });

  it("hides the header entirely when showHeader is false", () => {
    const { container } = render(<UPanel header="Info" showHeader={false} />);
    expect(container.querySelector(".u-panel-header")).not.toBeInTheDocument();
  });

  it("renders a footer when provided", () => {
    render(<UPanel header="Info" footer={<span>Footer text</span>} />);
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });
});
