import { describe, it, expect, vi } from "vitest";
import { createApp, inject, defineComponent, h } from "vue";
import { UToastService, UToastServiceKey, toastEventBus } from "./toast-service";
import type { ToastServiceApi } from "./toast-service";

function mountWithService() {
  let api: ToastServiceApi | undefined;
  const Component = defineComponent({
    setup() {
      api = inject(UToastServiceKey);
      return () => h("div");
    },
  });
  const app = createApp(Component);
  app.use(UToastService);
  const el = document.createElement("div");
  app.mount(el);
  return { app, get api() {
    return api!;
  } };
}

describe("UToastService", () => {
  it("installs as a Vue plugin and provides the service via UToastServiceKey", () => {
    const { app, api } = mountWithService();
    expect(api).toBeDefined();
    expect(typeof api.add).toBe("function");
    expect(typeof api.remove).toBe("function");
    expect(typeof api.removeAll).toBe("function");
    app.unmount();
  });

  it("add() emits an 'add' event per call, supporting a queued/stacked set of notifications", () => {
    const handler = vi.fn();
    toastEventBus.on("add", handler);

    const { app, api } = mountWithService();
    api.add({ summary: "First" });
    api.add({ summary: "Second" });

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, { summary: "First" });
    expect(handler).toHaveBeenNthCalledWith(2, { summary: "Second" });

    toastEventBus.off("add", handler);
    app.unmount();
  });

  it("remove() emits a 'remove' event with the given message", () => {
    const handler = vi.fn();
    toastEventBus.on("remove", handler);

    const { app, api } = mountWithService();
    const message = { summary: "Bye" };
    api.remove(message);

    expect(handler).toHaveBeenCalledWith(message);

    toastEventBus.off("remove", handler);
    app.unmount();
  });

  it("removeAll() emits a 'remove-all' event", () => {
    const handler = vi.fn();
    toastEventBus.on("remove-all", handler);

    const { app, api } = mountWithService();
    api.removeAll();

    expect(handler).toHaveBeenCalledOnce();

    toastEventBus.off("remove-all", handler);
    app.unmount();
  });
});
