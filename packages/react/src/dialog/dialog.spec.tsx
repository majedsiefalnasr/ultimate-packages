import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { UDialog } from "./dialog";

// Regression coverage for the Portal/ref-timing defect (final whole-branch review,
// Finding 1): Portal defers its first real DOM commit by one render pass, so a
// UDialog rendered with visible=true on its very first render must not silently skip
// the enter motion / z-index / scroll-lock effects that depend on the portalled ref
// actually being attached. Mock @ultimate/uix-motion so createMotion(...).enter() can
// be observed directly, the same module useMotion (packages/react-core) imports. The
// mock still invokes the real onAfterEnter/onAfterLeave hooks synchronously (mirroring
// the real createMotion's eventual callback) so existing tests that depend on
// onAfterLeave-driven teardown (z-index clear, scroll unlock, focus restore) keep
// passing unchanged.
const enterSpy = vi.fn();
const leaveSpy = vi.fn();
vi.mock("@ultimate/uix-motion", () => ({
  createMotion: vi.fn((_element: Element, options?: Record<string, unknown>) => ({
    enter: vi.fn(() => {
      enterSpy();
      (options?.onAfterEnter as (() => void) | undefined)?.();
      return Promise.resolve();
    }),
    leave: vi.fn(() => {
      leaveSpy();
      (options?.onAfterLeave as (() => void) | undefined)?.();
      return Promise.resolve();
    }),
    cancel: vi.fn(),
    update: vi.fn(),
  })),
}));

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
    const _typeCheck: import("./dialog").UDialogProps = {
      visible: true,
      onHide: () => {},
      // @ts-expect-error - draggable must not exist on UDialogProps (resizable/maximizable
      // covered by the same absent-props contract; a single representative prop keeps this
      // directive attached to exactly the line TypeScript reports the excess-property error on)
      draggable: true,
    };
    expect(_typeCheck).toBeDefined();
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

  describe("mount-time-visible (Portal/ref-timing regression, Finding 1)", () => {
    it("invokes the enter motion when visible=true on the very first render", async () => {
      enterSpy.mockClear();
      render(
        <UDialog visible onHide={() => {}} header="Title">
          Content
        </UDialog>
      );
      await waitFor(() => screen.getByRole("dialog"));
      await waitFor(() => expect(enterSpy).toHaveBeenCalled());
    });

    it("sets a non-empty inline z-index on the mask when visible=true on the very first render", async () => {
      render(
        <UDialog visible onHide={() => {}} header="Title">
          Content
        </UDialog>
      );
      await waitFor(() => screen.getByRole("dialog"));
      await waitFor(() => {
        // FocusTrap renders a fragment (no wrapping element), so the dialog's real DOM
        // parent is the mask div (maskRef in dialog.tsx) that setZIndex targets.
        const maskEl = screen.getByRole("dialog").parentElement as HTMLElement;
        expect(maskEl.style.zIndex).not.toBe("");
      });
    });

    it("locks the body scroll when visible=true with blockScroll on the very first render", async () => {
      document.body.classList.remove("u-overflow-hidden");
      render(
        <UDialog visible onHide={() => {}} header="Title" blockScroll>
          Content
        </UDialog>
      );
      await waitFor(() => screen.getByRole("dialog"));
      await waitFor(() => expect(document.body.classList.contains("u-overflow-hidden")).toBe(true));
      document.body.classList.remove("u-overflow-hidden");
    });
  });

  describe("id generation (useId migration regression coverage)", () => {
    it("generates different ids for two instances rendered in the same tree", async () => {
      render(
        <>
          <UDialog visible onHide={() => {}} header="Title A">
            Content A
          </UDialog>
          <UDialog visible onHide={() => {}} header="Title B">
            Content B
          </UDialog>
        </>
      );
      await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(2));
      const [first, second] = screen.getAllByRole("dialog");
      expect(first.id).toBeTruthy();
      expect(second.id).toBeTruthy();
      expect(first.id).not.toBe(second.id);
    });

    it("keeps aria-labelledby/aria-describedby in agreement with the header/content elements' actual ids", async () => {
      render(
        <UDialog visible onHide={() => {}} header="Title">
          Content
        </UDialog>
      );
      const dialog = await screen.findByRole("dialog");
      const labelledBy = dialog.getAttribute("aria-labelledby");
      const describedBy = dialog.getAttribute("aria-describedby");
      expect(labelledBy).toBeTruthy();
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(labelledBy!)?.textContent).toBe("Title");
      expect(document.getElementById(describedBy!)?.textContent).toBe("Content");
    });

    // jsdom-level check only: this proves a single test run's two separate render() calls
    // don't retain and reuse a prior render's id (the actual defect module-scope counters
    // had). It is NOT proof of cross-request SSR determinism — that is Track E's own Task 8.
    it("does not reuse the same generated id across separate renders", async () => {
      const first = render(
        <UDialog visible onHide={() => {}} header="Title">
          Content
        </UDialog>
      );
      const firstId = (await screen.findByRole("dialog")).id;
      cleanup();

      render(
        <UDialog visible onHide={() => {}} header="Title">
          Content
        </UDialog>
      );
      const secondId = (await screen.findByRole("dialog")).id;

      expect(secondId).not.toBe(firstId);
      first.unmount();
    });

    it("uses an explicit id prop verbatim instead of a generated one", async () => {
      render(
        <UDialog visible onHide={() => {}} header="Title" id="custom-dialog-id">
          Content
        </UDialog>
      );
      const dialog = await screen.findByRole("dialog");
      expect(dialog.id).toBe("custom-dialog-id");
    });
  });
});
