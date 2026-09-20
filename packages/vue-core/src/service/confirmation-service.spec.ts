import { describe, it, expect, vi } from "vitest";
import { createApp, inject, defineComponent, h } from "vue";
import {
  UConfirmationService,
  UConfirmationServiceKey,
  confirmationEventBus,
} from "./confirmation-service";
import type { ConfirmationServiceApi } from "./confirmation-service";

describe("UConfirmationService", () => {
  it("installs as a Vue plugin and provides the service via UConfirmationServiceKey", () => {
    let injected: unknown;
    const Component = defineComponent({
      setup() {
        injected = inject(UConfirmationServiceKey);
        return () => h("div");
      },
    });
    const app = createApp(Component);
    app.use(UConfirmationService);
    const el = document.createElement("div");
    app.mount(el);

    expect(injected).toBeDefined();
    expect(typeof (injected as { require: unknown }).require).toBe("function");
    expect(typeof (injected as { close: unknown }).close).toBe("function");

    app.unmount();
  });

  it("require() emits a 'confirm' event on the confirmation event bus with the given options", () => {
    const handler = vi.fn();
    confirmationEventBus.on("confirm", handler);

    let api: ConfirmationServiceApi | undefined;
    const Component = defineComponent({
      setup() {
        api = inject(UConfirmationServiceKey);
        return () => h("div");
      },
    });
    const app = createApp(Component);
    app.use(UConfirmationService);
    const el = document.createElement("div");
    app.mount(el);

    const options = { message: "Are you sure?" };
    api!.require(options);

    expect(handler).toHaveBeenCalledWith(options);

    confirmationEventBus.off("confirm", handler);
    app.unmount();
  });

  it("close() emits a 'close' event on the confirmation event bus", () => {
    const handler = vi.fn();
    confirmationEventBus.on("close", handler);

    let api: ConfirmationServiceApi | undefined;
    const Component = defineComponent({
      setup() {
        api = inject(UConfirmationServiceKey);
        return () => h("div");
      },
    });
    const app = createApp(Component);
    app.use(UConfirmationService);
    const el = document.createElement("div");
    app.mount(el);

    api!.close();

    expect(handler).toHaveBeenCalledOnce();

    confirmationEventBus.off("close", handler);
    app.unmount();
  });

  it("emits correctly even before any listener is registered (no throw)", () => {
    expect(() => confirmationEventBus.emit("confirm", { message: "x" })).not.toThrow();
  });
});
