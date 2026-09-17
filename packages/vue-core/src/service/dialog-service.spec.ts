import { describe, it, expect, vi } from "vitest";
import { createApp, inject, defineComponent, h } from "vue";
import { UDialogService, UDialogServiceKey, dialogEventBus } from "./dialog-service";
import type { DialogServiceApi } from "./dialog-service";

const DummyContent = defineComponent({ render: () => h("div", "content") });

function mountWithService() {
  let api: DialogServiceApi | undefined;
  const Component = defineComponent({
    setup() {
      api = inject(UDialogServiceKey);
      return () => h("div");
    },
  });
  const app = createApp(Component);
  app.use(UDialogService);
  const el = document.createElement("div");
  app.mount(el);
  return { app, get api() {
    return api!;
  } };
}

describe("UDialogService", () => {
  it("installs as a Vue plugin and provides the service via UDialogServiceKey", () => {
    const { app, api } = mountWithService();
    expect(api).toBeDefined();
    expect(typeof api.open).toBe("function");
    expect(typeof api.close).toBe("function");
    app.unmount();
  });

  it("open() emits an 'open' event on the dialog event bus and returns a ref handle", () => {
    const handler = vi.fn();
    dialogEventBus.on("open", handler);

    const { app, api } = mountWithService();
    const ref = api.open(DummyContent, { data: { id: 1 } });

    expect(handler).toHaveBeenCalledWith({ ref });
    expect(ref.content).toBe(DummyContent);
    expect(ref.data).toEqual({ id: 1 });
    expect(typeof ref.close).toBe("function");

    dialogEventBus.off("open", handler);
    app.unmount();
  });

  it("ref.close() emits a 'close' event scoped to that specific ref", () => {
    const handler = vi.fn();
    dialogEventBus.on("close", handler);

    const { app, api } = mountWithService();
    const ref = api.open(DummyContent);
    ref.close({ confirmed: true });

    expect(handler).toHaveBeenCalledWith({ ref, params: { confirmed: true } });

    dialogEventBus.off("close", handler);
    app.unmount();
  });

  it("close(ref) delegates to ref.close()", () => {
    const handler = vi.fn();
    dialogEventBus.on("close", handler);

    const { app, api } = mountWithService();
    const ref = api.open(DummyContent);
    api.close(ref);

    expect(handler).toHaveBeenCalledWith({ ref, params: undefined });

    dialogEventBus.off("close", handler);
    app.unmount();
  });
});
