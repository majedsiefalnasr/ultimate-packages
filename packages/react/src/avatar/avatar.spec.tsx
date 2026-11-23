import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UAvatar } from "./avatar";

describe("UAvatar", () => {
  it("renders a label when no image or icon is provided", () => {
    render(<UAvatar label="AB" />);
    expect(screen.getByText("AB")).toHaveClass("u-avatar-text");
  });

  it("renders an icon when no image or label is provided", () => {
    render(<UAvatar icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon").parentElement).toHaveClass("u-avatar-icon");
  });

  it("treats a string icon as a CSS class, like PrimeReact", () => {
    const { container } = render(<UAvatar icon="pi pi-user" />);
    const icon = container.querySelector(".u-avatar-icon");
    expect(icon).toHaveClass("pi", "pi-user");
    expect(icon).toBeEmptyDOMElement();
  });

  it("renders an image with the default alt text", () => {
    render(<UAvatar image="avatar.png" />);
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("avatar.png");
    expect(img).toHaveAttribute("alt", "avatar");
  });

  it("uses imageAlt for the image alt text", () => {
    render(<UAvatar image="avatar.png" imageAlt="User photo" />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "User photo");
  });

  it("shows the image before the label, as PrimeReact does", () => {
    render(<UAvatar image="avatar.png" label="AB" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.queryByText("AB")).not.toBeInTheDocument();
  });

  it("replaces the content with children", () => {
    render(
      <UAvatar label="AB" image="avatar.png">
        <b data-testid="custom">X</b>
      </UAvatar>
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("AB")).not.toBeInTheDocument();
  });

  it("drops the failed image and shows the label with the default fallback", () => {
    render(<UAvatar image="broken.png" label="AB" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("loads the fallback image URL instead of dropping the image", () => {
    render(<UAvatar image="broken.png" label="AB" imageFallback="fallback.png" />);
    fireEvent.error(screen.getByRole("img"));
    expect((screen.getByRole("img") as HTMLImageElement).src).toContain("fallback.png");
    expect(screen.queryByText("AB")).not.toBeInTheDocument();
  });

  it("calls onImageError and still falls back", () => {
    const onImageError = vi.fn();
    render(<UAvatar image="broken.png" label="AB" onImageError={onImageError} />);
    fireEvent.error(screen.getByRole("img"));
    expect(onImageError).toHaveBeenCalledOnce();
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("tries the image again when the image prop changes", () => {
    const { rerender } = render(<UAvatar image="broken.png" label="AB" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    rerender(<UAvatar image="good.png" label="AB" />);
    expect((screen.getByRole("img") as HTMLImageElement).src).toContain("good.png");
  });

  it("applies the shape and size classes", () => {
    const { container, rerender } = render(<UAvatar label="A" shape="circle" size="large" />);
    expect(container.firstChild).toHaveClass("u-avatar-circle", "u-avatar-lg");
    rerender(<UAvatar label="A" size="xlarge" />);
    expect(container.firstChild).toHaveClass("u-avatar-xl");
  });

  it("adds the clickable class and calls onClick", () => {
    const onClick = vi.fn();
    const { container } = render(<UAvatar label="A" onClick={onClick} />);
    expect(container.firstChild).toHaveClass("u-avatar-clickable");
    fireEvent.click(container.firstChild as Element);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("has no clickable class without onClick", () => {
    const { container } = render(<UAvatar label="A" />);
    expect(container.firstChild).not.toHaveClass("u-avatar-clickable");
  });

  it("passes aria-label and rest attributes to the root", () => {
    const { container } = render(<UAvatar label="A" ariaLabel="User" data-testid="root" />);
    expect(container.firstChild).toHaveAttribute("aria-label", "User");
    expect(screen.getByTestId("root")).toBe(container.firstChild);
  });

  it("applies pt attributes to the root, label, icon and image", () => {
    const { container, rerender } = render(
      <UAvatar label="A" pt={{ root: { "data-r": "1" }, label: { "data-l": "1" } }} />
    );
    expect(container.firstChild).toHaveAttribute("data-r", "1");
    expect(screen.getByText("A")).toHaveAttribute("data-l", "1");
    rerender(<UAvatar icon={<i data-testid="i" />} pt={{ icon: { "data-i": "1" } }} />);
    expect(screen.getByTestId("i").parentElement).toHaveAttribute("data-i", "1");
    rerender(<UAvatar image="a.png" pt={{ image: { "data-img": "1" } }} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-img", "1");
  });

  it("renders without Ultimate classes when unstyled", () => {
    const { container } = render(<UAvatar label="A" unstyled />);
    expect(container.firstChild).not.toHaveClass("u-avatar");
  });
});
