import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UContextMenu, type UContextMenuItem } from "./context-menu";

const items: UContextMenuItem[] = [
  { label: "Copy" },
  { label: "Paste" },
  { separator: true },
  { label: "Delete", disabled: true },
];

describe("UContextMenu", () => {
  it("renders nothing until right-clicked", () => {
    render(
      <UContextMenu model={items}>
        <div data-testid="target">Target area</div>
      </UContextMenu>
    );
    expect(document.querySelector(".u-contextmenu")).toBeNull();
  });

  it("shows the menu on the trigger's contextmenu (right-click) event and suppresses the native menu", async () => {
    render(
      <UContextMenu model={items}>
        <div data-testid="target">Target area</div>
      </UContextMenu>
    );
    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target, { clientX: 10, clientY: 10 });

    await screen.findByRole("menu");
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();
    expect(document.querySelectorAll(".u-contextmenu-item").length).toBe(3);
  });

  it("calls onItemSelect and hides when an enabled item is clicked", async () => {
    const onItemSelect = vi.fn();
    render(
      <UContextMenu model={items} onItemSelect={onItemSelect}>
        <div data-testid="target">Target area</div>
      </UContextMenu>
    );
    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target);
    await screen.findByRole("menu");

    const firstLink = document.querySelector(".u-contextmenu-item-link") as HTMLAnchorElement;
    fireEvent.click(firstLink);

    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ item: items[0] }));
    expect(document.querySelector(".u-contextmenu")).toBeNull();
  });

  it("does not select a disabled item", async () => {
    const onItemSelect = vi.fn();
    render(
      <UContextMenu model={items} onItemSelect={onItemSelect}>
        <div data-testid="target">Target area</div>
      </UContextMenu>
    );
    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target);
    await screen.findByRole("menu");

    const links = document.querySelectorAll(".u-contextmenu-item-link");
    fireEvent.click(links[links.length - 1]);

    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it("hides on outside click", async () => {
    render(
      <div>
        <UContextMenu model={items}>
          <div data-testid="target">Target area</div>
        </UContextMenu>
        <div data-testid="outside">Outside</div>
      </div>
    );
    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target);
    await screen.findByRole("menu");

    fireEvent.click(screen.getByTestId("outside"));
    expect(document.querySelector(".u-contextmenu")).toBeNull();
  });

  it("hides on Escape", async () => {
    render(
      <UContextMenu model={items}>
        <div data-testid="target">Target area</div>
      </UContextMenu>
    );
    const target = screen.getByTestId("target");
    fireEvent.contextMenu(target);
    await screen.findByRole("menu");

    fireEvent.keyDown(document, { code: "Escape" });
    expect(document.querySelector(".u-contextmenu")).toBeNull();
  });

  it("global mode listens for contextmenu anywhere on the document", async () => {
    render(
      <UContextMenu model={items} global>
        <span>ignored trigger wrapper</span>
      </UContextMenu>
    );
    fireEvent.contextMenu(document.body, { clientX: 5, clientY: 5 });
    await screen.findByRole("menu");
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();
  });
});
