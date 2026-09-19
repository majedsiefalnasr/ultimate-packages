import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UBlockUI } from "./block-ui";

describe("UBlockUI", () => {
  it("renders its children and no mask when not blocked", () => {
    render(
      <UBlockUI>
        <p>content</p>
      </UBlockUI>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(document.querySelector(".u-blockui-mask")).toBeNull();
  });

  it("renders a mask when blocked is true", () => {
    render(
      <UBlockUI blocked>
        <p>content</p>
      </UBlockUI>
    );
    expect(document.querySelector(".u-blockui-mask")).not.toBeNull();
  });

  it("toggles the mask visibility when blocked changes", () => {
    const { rerender } = render(<UBlockUI blocked={false} />);
    expect(document.querySelector(".u-blockui-mask")).toBeNull();

    rerender(<UBlockUI blocked={true} />);
    expect(document.querySelector(".u-blockui-mask")).not.toBeNull();

    rerender(<UBlockUI blocked={false} />);
    expect(document.querySelector(".u-blockui-mask")).toBeNull();
  });

  it("sets aria-busy reflecting blocked", () => {
    render(<UBlockUI blocked />);
    expect(document.querySelector(".u-blockui-container")?.getAttribute("aria-busy")).toBe(
      "true"
    );
  });

  it("applies the fullScreen document mask class", () => {
    render(<UBlockUI blocked fullScreen />);
    expect(document.querySelector(".u-blockui-mask-document")).not.toBeNull();
  });

  it("calls onBlocked and onUnblocked as blocked toggles", () => {
    const onBlocked = vi.fn();
    const onUnblocked = vi.fn();
    const { rerender } = render(
      <UBlockUI blocked={false} onBlocked={onBlocked} onUnblocked={onUnblocked} />
    );

    rerender(<UBlockUI blocked={true} onBlocked={onBlocked} onUnblocked={onUnblocked} />);
    expect(onBlocked).toHaveBeenCalledOnce();

    rerender(<UBlockUI blocked={false} onBlocked={onBlocked} onUnblocked={onUnblocked} />);
    expect(onUnblocked).toHaveBeenCalledOnce();
  });
});
