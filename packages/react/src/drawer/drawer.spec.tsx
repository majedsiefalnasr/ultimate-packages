import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UDrawer } from "./drawer";

describe("UDrawer", () => {
  it("renders nothing when visible is false", () => {
    const { container } = render(
      <UDrawer visible={false} onHide={() => {}}>
        Content
      </UDrawer>
    );
    expect(container.querySelector(".u-drawer")).toBeNull();
  });

  it("renders with role=complementary and header when visible", () => {
    render(
      <UDrawer visible header="Menu" onHide={() => {}}>
        Content
      </UDrawer>
    );
    const root = document.querySelector(".u-drawer");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("complementary");
    expect(document.querySelector(".u-drawer-title")?.textContent).toBe("Menu");
  });

  it("applies the position class", () => {
    render(
      <UDrawer visible position="right" onHide={() => {}}>
        Content
      </UDrawer>
    );
    expect(document.querySelector(".u-drawer-position-right")).not.toBeNull();
  });

  it("calls onHide when the close button is clicked", () => {
    const onHide = vi.fn();
    render(
      <UDrawer visible onHide={onHide}>
        Content
      </UDrawer>
    );
    const closeButton = document.querySelector(".u-drawer-close-button") as HTMLButtonElement;
    closeButton.click();
    expect(onHide).toHaveBeenCalled();
  });

  it("calls onHide on Escape when closeOnEscape is true", () => {
    const onHide = vi.fn();
    render(
      <UDrawer visible onHide={onHide}>
        Content
      </UDrawer>
    );
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(onHide).toHaveBeenCalled();
  });

  it("calls onHide on mask click when dismissible and modal", () => {
    const onHide = vi.fn();
    render(
      <UDrawer visible onHide={onHide}>
        Content
      </UDrawer>
    );
    const mask = document.querySelector(".u-drawer-mask") as HTMLElement;
    mask.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    mask.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    expect(onHide).toHaveBeenCalled();
  });

  it("does not call onHide on mask click when dismissible is false", () => {
    const onHide = vi.fn();
    render(
      <UDrawer visible dismissible={false} onHide={onHide}>
        Content
      </UDrawer>
    );
    const mask = document.querySelector(".u-drawer-mask") as HTMLElement;
    mask.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    mask.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    expect(onHide).not.toHaveBeenCalled();
  });
});
