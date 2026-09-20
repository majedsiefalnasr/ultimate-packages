import { afterEach, beforeAll, afterAll, describe, it, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import { dialogEventBus } from "@ultimate/vue-core";
import { UDynamicDialog } from "./index";

// UDynamicDialog renders one real UDialog per open instance (see
// DynamicDialog.vue). @vue/test-utils stubs <transition> by default, which
// skips UDialog's real @leave/@after-leave JS hooks — and it's onAfterLeave
// that resets UDialog's own `containerVisible` to false, which is what
// actually removes `.u-dialog` from the DOM on close. Under the stub, a
// closed dialog's instance is correctly removed from UDynamicDialog's
// `instances` array (unmounting the UDialog component entirely), but a
// still-open sibling dialog can otherwise mask this — same real finding
// already documented and handled in ../dialog/dialog.spec.ts.
beforeAll(() => {
  config.global.stubs.transition = false;
});
afterAll(() => {
  config.global.stubs.transition = true;
});

const DynamicContent = {
  props: { label: { type: String, default: "default" } },
  template: `<p class="dynamic-content">{{ label }}</p>`,
};

/**
 * Dispatches the same `open`/`close` events `UDialogService`'s own
 * `open()`/`close()` methods emit onto `dialogEventBus` (see
 * `dialog-service.ts`'s own doc comment: "open()/close() only emit") —
 * exercising `UDynamicDialog`'s real subscription/render contract directly,
 * without needing a full Vue app + `app.use()`/`inject()` harness.
 */
function openDialog(component: unknown, options: Record<string, unknown> = {}) {
  const ref = {
    content: component,
    options,
    data: options.data,
    close(params?: unknown) {
      dialogEventBus.emit("close", { ref, params });
    },
  };
  dialogEventBus.emit("open", { ref });
  return ref;
}

describe("UDynamicDialog", () => {
  afterEach(() => {
    dialogEventBus.clear();
    document.querySelectorAll(".u-dialog").forEach((el) => el.remove());
  });

  it("renders nothing until open() is called", () => {
    mount(UDynamicDialog);
    expect(document.querySelector(".u-dialog")).toBeNull();
  });

  it("renders the dialog with the loaded component and header when open() is called", async () => {
    const wrapper = mount(UDynamicDialog, { attachTo: document.body });

    openDialog(DynamicContent, { header: "Details", inputValues: { label: "hello" } });
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".u-dialog")).not.toBeNull();
    expect(document.querySelector(".u-dialog-title")?.textContent).toBe("Details");
    expect(document.querySelector(".dynamic-content")?.textContent).toBe("hello");

    wrapper.unmount();
  });

  it("closes the dialog when ref.close() is called", async () => {
    const wrapper = mount(UDynamicDialog, { attachTo: document.body });

    const ref = openDialog(DynamicContent);
    await wrapper.vm.$nextTick();
    expect(document.querySelector(".u-dialog")).not.toBeNull();

    ref.close("result-value");
    await wrapper.vm.$nextTick();
    // Removing the instance unmounts UDialog via v-for, which plays UDialog's
    // own internal <transition> leave animation (real @ultimate/uix-motion,
    // now that the stub is disabled above) before the node actually leaves
    // the DOM — same real async-completion wait as dialog.spec.ts's own
    // close-related assertions.
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector(".u-dialog")).toBeNull();

    wrapper.unmount();
  });

  it("supports multiple simultaneously-open dialogs", async () => {
    const wrapper = mount(UDynamicDialog, { attachTo: document.body });

    openDialog(DynamicContent, { header: "First", inputValues: { label: "one" } });
    openDialog(DynamicContent, { header: "Second", inputValues: { label: "two" } });
    await wrapper.vm.$nextTick();

    expect(document.querySelectorAll(".u-dialog").length).toBe(2);
    expect(document.querySelectorAll(".dynamic-content").length).toBe(2);

    wrapper.unmount();
  });

  it("closes the dialog when the dialog's own close button is clicked", async () => {
    const wrapper = mount(UDynamicDialog, { attachTo: document.body });

    openDialog(DynamicContent, { header: "Details" });
    await wrapper.vm.$nextTick();

    const closeButton = document.querySelector(".u-dialog-close-button") as HTMLButtonElement;
    closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    // Same real transition-completion wait as above: the close button emits
    // update:visible(false) on UDialog, whose own onAfterLeave hook (fired
    // only once the real leave transition's motion promise resolves) is
    // what UDynamicDialog's onDialogVisibleChange listens for to close the
    // instance and unmount UDialog via v-for.
    await new Promise((r) => setTimeout(r, 0));

    expect(document.querySelector(".u-dialog")).toBeNull();

    wrapper.unmount();
  });
});
