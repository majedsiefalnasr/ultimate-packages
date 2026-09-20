import * as React from "react";
import { render, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UToast, type UToastHandle } from "./toast";

describe("UToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a message queued via the ref's show()", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show({ severity: "info", summary: "Saved", detail: "Your changes were saved." });
    });

    expect(container.querySelector(".u-toast-summary")?.textContent).toBe("Saved");
    expect(container.querySelector(".u-toast-detail")?.textContent).toBe(
      "Your changes were saved."
    );
  });

  it("applies the severity class", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show({ severity: "error", summary: "Failed" });
    });

    expect(container.querySelector(".u-toast-message")?.className).toContain(
      "u-toast-message-error"
    );
  });

  it("auto-dismisses after the default life elapses", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show({ summary: "Bye" });
    });
    expect(container.querySelector(".u-toast-message")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(container.querySelector(".u-toast-message")).toBeFalsy();
  });

  it("does not auto-dismiss a sticky message", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show({ summary: "Persistent", sticky: true });
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(container.querySelector(".u-toast-message")).toBeTruthy();
  });

  it("dismisses manually via the close button, removing only that message (queue-identity)", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show([
        { summary: "First", sticky: true },
        { summary: "Second", sticky: true },
      ]);
    });

    const buttons = container.querySelectorAll<HTMLButtonElement>(".u-toast-close-button");
    expect(buttons.length).toBe(2);
    act(() => {
      buttons[0].click();
    });

    const summaries = container.querySelectorAll(".u-toast-summary");
    expect(summaries.length).toBe(1);
    expect(summaries[0].textContent).toBe("Second");
  });

  it("stacks multiple queued messages in order", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show({ summary: "One", sticky: true });
    });
    act(() => {
      ref.current?.show({ summary: "Two", sticky: true });
    });
    act(() => {
      ref.current?.show({ summary: "Three", sticky: true });
    });

    const summaries = container.querySelectorAll(".u-toast-summary");
    expect(Array.from(summaries).map((el) => el.textContent)).toEqual(["One", "Two", "Three"]);
  });

  it("clears all messages when clear() is called", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show([
        { summary: "A", sticky: true },
        { summary: "B", sticky: true },
      ]);
    });
    expect(container.querySelectorAll(".u-toast-message").length).toBe(2);

    act(() => {
      ref.current?.clear();
    });
    expect(container.querySelectorAll(".u-toast-message").length).toBe(0);
  });

  it("applies the position class", () => {
    const { container } = render(<UToast position="bottom-left" />);
    expect(container.querySelector(".u-toast")?.className).toContain("u-toast-bottom-left");
  });

  it("does not render a close button when closable is false", () => {
    const ref = React.createRef<UToastHandle>();
    const { container } = render(<UToast ref={ref} />);

    act(() => {
      ref.current?.show({ summary: "No close", closable: false, sticky: true });
    });

    expect(container.querySelector(".u-toast-close-button")).toBeFalsy();
  });
});
