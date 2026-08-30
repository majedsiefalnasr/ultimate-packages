import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UDialog } from "./dialog";

describe("UDialog", () => {
  it("renders nothing when visible is false", () => {
    render(
      <UDialog visible={false} onHide={() => {}} header="Title">
        Content
      </UDialog>
    );
    expect(screen.queryByText("Content")).toBeNull();
  });

  it("renders header/content/footer when visible is true", async () => {
    render(
      <UDialog visible onHide={() => {}} header="Title" footer={<button>OK</button>}>
        Content
      </UDialog>
    );
    await waitFor(() => {
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("OK")).toBeInTheDocument();
    });
  });

  it("has role='dialog', aria-modal, aria-labelledby, aria-describedby", async () => {
    render(
      <UDialog visible onHide={() => {}} header="Title">
        Content
      </UDialog>
    );
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
      expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    });
  });

  it("calls onHide when the close icon is clicked", async () => {
    const onHide = vi.fn();
    render(
      <UDialog visible onHide={onHide} header="Title">
        Content
      </UDialog>
    );
    await waitFor(() => screen.getByLabelText(/close/i));
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onHide).toHaveBeenCalledOnce();
  });

  it("exposes no draggable, resizable, or maximizable props or UI", async () => {
    render(
      <UDialog visible onHide={() => {}} header="Title">
        Content
      </UDialog>
    );
    await waitFor(() => screen.getByRole("dialog"));
    expect(screen.queryByLabelText(/maximize/i)).toBeNull();
    expect(document.querySelector(".u-resizable-handle")).toBeNull();
    // @ts-expect-error - draggable/resizable/maximizable must not exist on UDialogProps
    const _typeCheck: import("./dialog").UDialogProps = { visible: true, onHide: () => {}, draggable: true };
  });

  it("returns focus to the previously-focused element after closing", async () => {
    function Harness() {
      const [visible, setVisible] = React.useState(false);
      return (
        <>
          <button onClick={() => setVisible(true)}>Open</button>
          <UDialog visible={visible} onHide={() => setVisible(false)} header="Title" focusOnShow>
            <button>Inside</button>
          </UDialog>
        </>
      );
    }
    render(<Harness />);
    const openButton = screen.getByText("Open");
    openButton.focus();
    fireEvent.click(openButton);
    await waitFor(() => screen.getByText("Inside"));
    fireEvent.click(screen.getByLabelText(/close/i));
    await waitFor(() => expect(document.activeElement).toBe(openButton));
  });
});
