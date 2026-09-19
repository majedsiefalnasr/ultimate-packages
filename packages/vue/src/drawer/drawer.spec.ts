import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UDrawer } from "./index";

// UPortal (packages/vue-core/src/overlay/portal.ts) gates its <Teleport> on
// a `mounted` ref that is only flipped true inside its own onMounted() hook
// — that flip schedules a reactive re-render rather than applying
// synchronously within the parent's mount() call, so the mask/content are
// not yet in the DOM the instant mount() returns. Same real finding already
// documented and handled in ../dialog/dialog.spec.ts (see its own comment):
// a microtask-only `await nextTick()` is not enough here either, since a
// macrotask separates the Teleport's scheduled flush from mount() returning
// under jsdom — a macrotask flush (`setTimeout(resolve, 0)`) is required
// before querying the teleported DOM for any test that expects the drawer
// visible immediately on initial mount (as opposed to becoming visible via
// a later prop change, where the watcher's own $nextTick already covers it).
const flushPortal = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("UDrawer", () => {
  afterEach(() => {
    document.querySelectorAll(".u-drawer-mask").forEach((el) => el.remove());
  });

  it("renders nothing when visible is false", () => {
    mount(UDrawer, { props: { visible: false } });
    expect(document.querySelector(".u-drawer")).toBeNull();
  });

  it("renders with role=complementary and header when visible", async () => {
    mount(UDrawer, { props: { visible: true, header: "Menu" }, attachTo: document.body });
    await flushPortal();
    const root = document.querySelector(".u-drawer");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("complementary");
    expect(document.querySelector(".u-drawer-title")?.textContent).toBe("Menu");
  });

  it("applies the position class", async () => {
    mount(UDrawer, { props: { visible: true, position: "right" }, attachTo: document.body });
    await flushPortal();
    expect(document.querySelector(".u-drawer-position-right")).not.toBeNull();
  });

  it("emits update:visible(false) when the close button is clicked", async () => {
    const wrapper = mount(UDrawer, { props: { visible: true }, attachTo: document.body });
    await flushPortal();
    const closeButton = document.querySelector(".u-drawer-close-button") as HTMLButtonElement;
    closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
  });

  it("emits update:visible(false) on Escape when closeOnEscape is true", async () => {
    const wrapper = mount(UDrawer, { props: { visible: true }, attachTo: document.body });
    await flushPortal();
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
  });

  it("emits update:visible(false) on mask click when dismissible and modal", async () => {
    const wrapper = mount(UDrawer, { props: { visible: true }, attachTo: document.body });
    await flushPortal();
    const mask = document.querySelector(".u-drawer-mask") as HTMLElement;
    mask.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    mask.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
  });
});
