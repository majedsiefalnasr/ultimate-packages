import { describe, it, expect, vi, afterEach } from "vitest";
import { confirmationEventBus, confirmDialog, confirmPopup } from "./confirmation-event-bus";

describe("confirmationEventBus / confirmDialog / confirmPopup", () => {
  afterEach(() => {
    confirmationEventBus.clear();
  });

  it("confirmDialog() emits 'confirm-dialog' with visible defaulted to true", () => {
    const handler = vi.fn();
    confirmationEventBus.on("confirm-dialog", handler);

    confirmDialog({ message: "Are you sure?" });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ message: "Are you sure?", visible: true }));
  });

  it("confirmPopup() emits 'confirm-popup' with visible defaulted to true", () => {
    const handler = vi.fn();
    confirmationEventBus.on("confirm-popup", handler);

    confirmPopup({ message: "Delete?" });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ message: "Delete?", visible: true }));
  });

  it("confirmDialog() respects an explicit visible: false", () => {
    const handler = vi.fn();
    confirmationEventBus.on("confirm-dialog", handler);

    confirmDialog({ visible: false });

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ visible: false }));
  });

  it("does not cross-dispatch between confirm-dialog and confirm-popup channels", () => {
    const dialogHandler = vi.fn();
    const popupHandler = vi.fn();
    confirmationEventBus.on("confirm-dialog", dialogHandler);
    confirmationEventBus.on("confirm-popup", popupHandler);

    confirmDialog({ message: "dialog only" });

    expect(dialogHandler).toHaveBeenCalledTimes(1);
    expect(popupHandler).not.toHaveBeenCalled();
  });
});
