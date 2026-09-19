import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { confirmPopup } from "@ultimate/react-core";
import { UConfirmPopup } from "./confirm-popup";

function Harness(props: { group?: string }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={ref} data-testid="trigger">
        Delete
      </button>
      <UConfirmPopup group={props.group} />
    </div>
  );
}

describe("UConfirmPopup", () => {
  it("renders nothing until a matching confirmation is requested", () => {
    render(<Harness />);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("shows the popup positioned against the target", async () => {
    render(<Harness />);
    const button = screen.getByTestId("trigger");
    act(() => confirmPopup({ message: "Delete?", target: button }));

    expect(await screen.findByText("Delete?")).toBeInTheDocument();
  });

  it("invokes accept() and hides when the accept button is clicked", async () => {
    render(<Harness />);
    const button = screen.getByTestId("trigger");
    let accepted = false;
    act(() => confirmPopup({ message: "Delete?", target: button, accept: () => (accepted = true) }));
    await screen.findByText("Delete?");

    const buttons = document.querySelectorAll(".u-confirmpopup-footer button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(accepted).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("invokes reject() and hides when the reject button is clicked", async () => {
    render(<Harness />);
    const button = screen.getByTestId("trigger");
    let rejected = false;
    act(() => confirmPopup({ message: "Delete?", target: button, reject: () => (rejected = true) }));
    await screen.findByText("Delete?");

    const rejectButton = document.querySelector(".u-confirmpopup-footer button") as HTMLButtonElement;
    fireEvent.click(rejectButton);

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("hides when clicking outside the popup and target", async () => {
    render(
      <div>
        <Harness />
        <div data-testid="outside">Outside</div>
      </div>
    );
    const button = screen.getByTestId("trigger");
    act(() => confirmPopup({ message: "Delete?", target: button }));
    await screen.findByText("Delete?");

    fireEvent.click(screen.getByTestId("outside"));
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("rejects and hides on Escape", async () => {
    render(<Harness />);
    const button = screen.getByTestId("trigger");
    let rejected = false;
    act(() => confirmPopup({ message: "Delete?", target: button, reject: () => (rejected = true) }));
    await screen.findByText("Delete?");

    fireEvent.keyDown(document, { code: "Escape" });

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("only responds to confirmPopup() calls matching its own group", () => {
    render(<Harness group="secondary" />);
    const button = screen.getByTestId("trigger");

    act(() => confirmPopup({ message: "Wrong group", target: button, group: "other" }));
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });
});
