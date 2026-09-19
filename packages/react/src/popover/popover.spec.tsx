import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UPopover, type UPopoverHandle } from "./popover";

function TestHarness(props: { dismissable?: boolean }) {
  const ref = React.useRef<UPopoverHandle>(null);
  return (
    <div>
      <button onClick={(e) => ref.current?.toggle(e)}>Toggle</button>
      <UPopover ref={ref} dismissable={props.dismissable}>
        <div data-testid="content">Popover content</div>
      </UPopover>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe("UPopover", () => {
  it("is hidden until toggled", () => {
    render(<TestHarness />);
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("shows the overlay on toggle and hides on second toggle", async () => {
    render(<TestHarness />);
    const button = screen.getByText("Toggle");

    fireEvent.click(button);
    expect(await screen.findByTestId("content")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("hides on outside click", async () => {
    render(<TestHarness />);
    const button = screen.getByText("Toggle");
    fireEvent.click(button);
    expect(await screen.findByTestId("content")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("hides on Escape", async () => {
    render(<TestHarness />);
    const button = screen.getByText("Toggle");
    fireEvent.click(button);
    expect(await screen.findByTestId("content")).toBeInTheDocument();

    fireEvent.keyDown(document, { code: "Escape" });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("does not hide on outside click when dismissable is false", async () => {
    render(<TestHarness dismissable={false} />);
    const button = screen.getByText("Toggle");
    fireEvent.click(button);
    expect(await screen.findByTestId("content")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("outside"));
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("invokes onShow/onHide", async () => {
    let shown = false;
    let hidden = false;
    function Harness() {
      const ref = React.useRef<UPopoverHandle>(null);
      return (
        <div>
          <button onClick={(e) => ref.current?.toggle(e)}>Toggle</button>
          <UPopover ref={ref} onShow={() => (shown = true)} onHide={() => (hidden = true)}>
            <div data-testid="content">content</div>
          </UPopover>
        </div>
      );
    }
    render(<Harness />);
    const button = screen.getByText("Toggle");
    fireEvent.click(button);
    await screen.findByTestId("content");
    expect(shown).toBe(true);

    fireEvent.click(button);
    expect(hidden).toBe(true);
  });
});
