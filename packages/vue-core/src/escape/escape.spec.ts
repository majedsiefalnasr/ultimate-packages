import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref, type Ref } from "vue";
import { createGlobalEscapeKeyMixin } from "./use-global-escape-key";
import { useDisplayOrder } from "./use-display-order";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
}

describe("createGlobalEscapeKeyMixin", () => {
  it("calls the callback on Escape when `when` returns true", () => {
    const callback = vi.fn();
    const Component = {
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => 1],
        }),
      ],
      template: `<div />`,
    };
    const wrapper = mount(Component);
    fireEscape();
    expect(callback).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it("does not call the callback when `when` returns false", () => {
    const callback = vi.fn();
    const wrapper = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => false,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => 1],
        }),
      ],
      template: `<div />`,
    });
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("only the highest-priority-tuple listener fires when two are registered", () => {
    const dialogCallback = vi.fn();
    const menuCallback = vi.fn();
    const dialogWrapper = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback: dialogCallback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => 1],
        }),
      ],
      template: `<div />`,
    });
    const menuWrapper = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback: menuCallback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.MENU, () => 1],
        }),
      ],
      template: `<div />`,
    });
    fireEscape();
    // MENU (500) > DIALOG (300) — MENU's tuple wins.
    expect(menuCallback).toHaveBeenCalledOnce();
    expect(dialogCallback).not.toHaveBeenCalled();
    dialogWrapper.unmount();
    menuWrapper.unmount();
  });

  it("deregisters on unmount, so a later Escape does not call a stale callback", () => {
    const callback = vi.fn();
    const wrapper = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.TOOLTIP, () => 1],
        }),
      ],
      template: `<div />`,
    });
    wrapper.unmount();
    fireEscape();
    expect(callback).not.toHaveBeenCalled();
  });

  it("re-registers under the new (lower) secondary on update, so the OLD (higher) tuple no longer wins — a leaked stale entry would incorrectly keep winning here", async () => {
    const secondary = ref(5);
    const callback = vi.fn();
    const otherCallback = vi.fn();

    // Component starts at secondary=5 (highest, so it wins initially). Once
    // it updates down to secondary=1, a competitor at secondary=2 should win
    // instead. If updated() failed to unregister the OLD tuple (DIALOG, 5)
    // before registering the NEW one (DIALOG, 1) — e.g. by re-reading the
    // getter a second time and unregistering the wrong (already-new) value —
    // the stale (DIALOG, 5) entry would linger and incorrectly keep winning
    // forever, even after the component's real priority dropped below the
    // competitor's.
    const Component = defineComponent({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => secondary.value],
        }),
      ],
      // Rendering secondary.value ties it into this component's reactive
      // dependency tracking, so changing it schedules a real re-render and
      // fires the mixin's updated() hook — not just a bare closure mutation.
      setup() {
        return { secondary };
      },
      template: `<div>{{ secondary }}</div>`,
    });
    const wrapper = mount(Component);

    const competitor = mount({
      mixins: [
        createGlobalEscapeKeyMixin({
          callback: otherCallback,
          when: () => true,
          priority: [ESCAPE_PRIORITIES.DIALOG, () => 2],
        }),
      ],
      template: `<div />`,
    });

    fireEscape();
    // secondary=5 > competitor's 2 — component wins.
    expect(callback).toHaveBeenCalledOnce();
    expect(otherCallback).not.toHaveBeenCalled();

    secondary.value = 1;
    await wrapper.vm.$nextTick();

    fireEscape();
    // secondary=1 < competitor's 2 — competitor should now win. If the OLD
    // (DIALOG, 5) entry leaked, `callback` would fire a second time instead.
    expect(callback).toHaveBeenCalledOnce();
    expect(otherCallback).toHaveBeenCalledOnce();

    wrapper.unmount();
    competitor.unmount();
  });
});

describe("useDisplayOrder", () => {
  // useDisplayOrder calls onMounted/onUnmounted, which require an active Vue
  // component instance — so each instance under test is mounted via
  // @vue/test-utils rather than invoked bare in the test body.
  function makeDisplayOrderComponent(group: string, isVisible: Ref<boolean>) {
    let order!: Ref<number | undefined>;
    const Component = defineComponent({
      setup() {
        order = useDisplayOrder(group, isVisible);
        return {};
      },
      template: `<div />`,
    });
    const wrapper = mount(Component);
    return { wrapper, order: order! };
  }

  it("assigns increasing order to successively mounted visible instances in the same group", () => {
    const isVisible = ref(true);
    const first = makeDisplayOrderComponent("test-group-vue-a", isVisible);
    const second = makeDisplayOrderComponent("test-group-vue-a", isVisible);

    expect(second.order.value ?? 0).toBeGreaterThan(first.order.value ?? 0);

    first.wrapper.unmount();
    second.wrapper.unmount();
  });

  it("does not register an order for an instance that is not visible on mount", () => {
    const isVisible = ref(false);
    const { wrapper, order } = makeDisplayOrderComponent("test-group-vue-b", isVisible);

    expect(order.value).toBeUndefined();

    wrapper.unmount();
  });

  it("clears the order on unmount and lets a newly mounted instance reuse the freed slot", () => {
    const isVisible = ref(true);
    const first = makeDisplayOrderComponent("test-group-vue-c", isVisible);
    const firstOrder = first.order.value;
    expect(firstOrder).toBeDefined();

    first.wrapper.unmount();
    expect(first.order.value).toBeUndefined();

    // A newly mounted instance in the same (now-empty) group re-registers at
    // the same slot `first` used, proving unregister() actually shrank the
    // group's list rather than leaving a permanent hole.
    const second = makeDisplayOrderComponent("test-group-vue-c", isVisible);
    expect(second.order.value).toBe(firstOrder);
    second.wrapper.unmount();
  });
});
