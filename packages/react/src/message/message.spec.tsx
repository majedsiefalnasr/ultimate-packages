import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UMessage } from "./message";

describe("UMessage", () => {
  it("renders children with default info severity", () => {
    render(<UMessage>Hello</UMessage>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByRole("alert").className).toContain("u-message-info");
  });

  it("applies the severity class", () => {
    render(<UMessage severity="error">Oops</UMessage>);
    expect(screen.getByRole("alert").className).toContain("u-message-error");
  });

  it("does not render a close button when closable is false", () => {
    const { container } = render(<UMessage>Hi</UMessage>);
    expect(container.querySelector(".u-message-close-button")).not.toBeInTheDocument();
  });

  it("closes and calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <UMessage closable onClose={onClose}>
        Hi
      </UMessage>
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("auto-closes after the life delay elapses", () => {
    vi.useFakeTimers();
    render(<UMessage life={1000}>Bye</UMessage>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders a default severity icon when no icon is provided", () => {
    const { container } = render(<UMessage severity="success">Done</UMessage>);
    expect(container.querySelector(".pi-check")).toBeInTheDocument();
  });

  it("renders a custom icon node instead of the default", () => {
    render(<UMessage icon={<span data-testid="custom-icon" />}>Done</UMessage>);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
