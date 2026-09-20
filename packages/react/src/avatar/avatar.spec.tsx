import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UAvatar } from "./avatar";

describe("UAvatar", () => {
  it("renders a label when no image or icon is provided", () => {
    render(<UAvatar label="AB" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders an icon when no image is provided", () => {
    render(<UAvatar icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders an image when provided", () => {
    render(<UAvatar image="avatar.png" ariaLabel="User" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("avatar.png");
  });

  it("falls back to the label after an image load error", () => {
    render(<UAvatar image="broken.png" label="AB" ariaLabel="User" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("calls onImageError when the image fails to load", () => {
    const onImageError = vi.fn();
    render(<UAvatar image="broken.png" onImageError={onImageError} ariaLabel="User" />);
    fireEvent.error(screen.getByRole("img"));
    expect(onImageError).toHaveBeenCalledOnce();
  });

  it("applies the circle shape class", () => {
    render(<UAvatar label="A" shape="circle" />);
    expect(screen.getByText("A").closest(".u-avatar")).toHaveClass("u-avatar-circle");
  });

  it("applies the large size class", () => {
    render(<UAvatar label="A" size="large" />);
    expect(screen.getByText("A").closest(".u-avatar")).toHaveClass("u-avatar-lg");
  });
});
