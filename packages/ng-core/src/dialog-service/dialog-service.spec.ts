import { Component } from "@angular/core";
import { describe, expect, it, vi } from "vitest";
import { UDialogService } from "./dialog-service";
import type { UDynamicDialogOpenRequest } from "./dialog-service";

@Component({ standalone: true, template: `<p>dynamic content</p>` })
class DynamicContentComponent {}

describe("UDialogService", () => {
  it("emits an open request with the component, config, and a ref when open() is called", () => {
    const service = new UDialogService();
    let received: UDynamicDialogOpenRequest | undefined;
    service.open$.subscribe((request) => (received = request));

    const ref = service.open(DynamicContentComponent, { header: "Title", data: { id: 1 } });

    expect(received?.component).toBe(DynamicContentComponent);
    expect(received?.config).toEqual({ header: "Title", data: { id: 1 } });
    expect(received?.ref).toBe(ref);
  });

  it("returns a ref whose close() emits on onClose with the given result", () => {
    const service = new UDialogService();
    const ref = service.open(DynamicContentComponent);
    const onClose = vi.fn();
    ref.onClose.subscribe(onClose);

    ref.close("accepted");

    expect(onClose).toHaveBeenCalledWith("accepted");
  });

  it("returns a ref whose close() emits on requestClose$ (for the companion component to unmount it)", () => {
    const service = new UDialogService();
    const ref = service.open(DynamicContentComponent);
    const onRequestClose = vi.fn();
    ref.requestClose$.subscribe(onRequestClose);

    ref.close();

    expect(onRequestClose).toHaveBeenCalled();
  });

  it("service.close(ref) is a convenience alias for ref.close()", () => {
    const service = new UDialogService();
    const ref = service.open(DynamicContentComponent);
    const onClose = vi.fn();
    ref.onClose.subscribe(onClose);

    service.close(ref, "done");

    expect(onClose).toHaveBeenCalledWith("done");
  });

  it("dispatches a distinct ref per open() call", () => {
    const service = new UDialogService();
    const ref1 = service.open(DynamicContentComponent);
    const ref2 = service.open(DynamicContentComponent);

    expect(ref1).not.toBe(ref2);
  });
});
