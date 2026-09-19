import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { confirmDialog } from "@ultimate/react-core";
import { UConfirmDialog } from "./confirm-dialog";

describe("UConfirmDialog", () => {
  it("renders nothing until a matching confirmation is requested", () => {
    render(<UConfirmDialog />);
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("shows the dialog with message/header when confirmDialog() is called with no group", async () => {
    render(<UConfirmDialog />);
    act(() => confirmDialog({ message: "Delete this item?", header: "Confirm" }));

    expect(await screen.findByText("Delete this item?")).toBeInTheDocument();
    expect(document.querySelector(".u-dialog-header-title")?.textContent).toBe("Confirm");
  });

  it("invokes accept() and hides when the accept button is clicked", async () => {
    render(<UConfirmDialog />);
    let accepted = false;
    act(() => confirmDialog({ message: "Proceed?", accept: () => (accepted = true) }));
    await screen.findByText("Proceed?");

    const buttons = document.querySelectorAll(".u-confirmdialog-footer button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(accepted).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("invokes reject() and hides when the reject button is clicked", async () => {
    render(<UConfirmDialog />);
    let rejected = false;
    act(() => confirmDialog({ message: "Proceed?", reject: () => (rejected = true) }));
    await screen.findByText("Proceed?");

    const rejectButton = document.querySelector(".u-confirmdialog-footer button") as HTMLButtonElement;
    fireEvent.click(rejectButton);

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("only responds to confirmDialog() calls matching its own group", async () => {
    render(<UConfirmDialog group="secondary" />);

    act(() => confirmDialog({ message: "For a different dialog", group: "other" }));
    expect(document.querySelector(".u-dialog")).toBeNull();

    act(() => confirmDialog({ message: "For this dialog", group: "secondary" }));
    expect(await screen.findByText("For this dialog")).toBeInTheDocument();
  });

  it("hides when visible: false is dispatched", async () => {
    render(<UConfirmDialog />);
    act(() => confirmDialog({ message: "Proceed?" }));
    await screen.findByText("Proceed?");

    act(() => confirmDialog({ visible: false }));
    expect(document.querySelector(".u-dialog")).toBeNull();
  });
});
