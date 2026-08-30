import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Portal } from "./portal";

describe("Portal", () => {
  it("renders nothing when visible is false", () => {
    render(<Portal element={<div>content</div>} visible={false} />);
    expect(screen.queryByText("content")).toBeNull();
  });

  it("renders into document.body by default when visible", async () => {
    render(<Portal element={<div data-testid="portal-content">content</div>} visible />);
    const node = await screen.findByTestId("portal-content");
    expect(document.body.contains(node)).toBe(true);
  });

  it("renders inline (not portaled) when appendTo is 'self'", async () => {
    const { container } = render(
      <Portal element={<div data-testid="inline-content">content</div>} appendTo="self" visible />
    );
    const node = await screen.findByTestId("inline-content");
    expect(container.contains(node)).toBe(true);
  });
});
