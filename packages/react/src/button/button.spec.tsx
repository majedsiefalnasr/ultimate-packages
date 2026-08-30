/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UButton } from "./button";

describe("UButton", () => {
  it("renders the label prop as visible text", () => {
    render(<UButton label="Save" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("fires onClick when clicked and not disabled", () => {
    const onClick = vi.fn();
    render(<UButton label="Save" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled (native disabled attribute prevents it)", () => {
    const onClick = vi.fn();
    render(<UButton label="Save" onClick={onClick} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders u-button-loading class and a spinner icon when loading is true", () => {
    render(<UButton label="Save" loading />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("u-button-loading");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("applies the disabled attribute to the native <button> when disabled is true", () => {
    render(<UButton label="Save" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("computes a default aria-label from label + badge when no explicit aria-label is given", () => {
    render(<UButton label="Save" badge="3" />);
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe("Save 3");
  });

  it("forwards the ref to the underlying <button> DOM element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<UButton label="Save" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("applies severity/size/outlined boolean-modifier classes", () => {
    render(<UButton label="Save" severity="danger" size="large" outlined />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("u-button-danger");
    expect(button.className).toContain("u-button-lg");
    expect(button.className).toContain("u-button-outlined");
  });
});
