import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { USplitButton } from "./split-button";
import type { UMenuItem } from "../menu";

describe("USplitButton", () => {
  const items: UMenuItem[] = [{ label: "Delete" }, { label: "Rename" }];

  it("renders two buttons — the default command button and the dropdown toggle", () => {
    const { container } = render(<USplitButton label="Save" model={items} />);
    expect(container.querySelectorAll("button").length).toBe(2);
  });

  it("does not render the popup menu until the dropdown button is clicked", () => {
    render(<USplitButton label="Save" model={items} />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens the popup menu on dropdown button click", async () => {
    const { container } = render(<USplitButton label="Save" model={items} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem").length).toBe(2);
  });

  it("closes the popup menu on a second dropdown button click", async () => {
    const { container } = render(<USplitButton label="Save" model={items} />);
    const dropdown = container.querySelectorAll("button")[1];
    fireEvent.click(dropdown);
    await screen.findByRole("menu");
    fireEvent.click(dropdown);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("invokes onClick and closes the menu when the default button is clicked", async () => {
    const onClick = vi.fn();
    const { container } = render(<USplitButton label="Save" model={items} onClick={onClick} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    await screen.findByRole("menu");
    fireEvent.click(buttons[0]);
    expect(onClick).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("invokes the item's command when a menu item is selected and closes the popup", async () => {
    const command = vi.fn();
    const model: UMenuItem[] = [{ label: "Delete", command }];
    const { container } = render(<USplitButton label="Save" model={model} />);
    const dropdown = container.querySelectorAll("button")[1];
    fireEvent.click(dropdown);
    await screen.findByRole("menu");
    const menuItemLink = screen.getByRole("menuitem").querySelector("a") as HTMLAnchorElement;
    fireEvent.click(menuItemLink);
    expect(command).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("marks the dropdown button with aria-haspopup=menu", () => {
    const { container } = render(<USplitButton label="Save" model={items} />);
    const dropdown = container.querySelectorAll("button")[1];
    expect(dropdown.getAttribute("aria-haspopup")).toBe("menu");
  });
});
