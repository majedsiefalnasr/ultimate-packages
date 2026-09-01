import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createDisplayOrderMixin } from "./create-display-order-mixin";

// Options-API-mixin-shaped sibling to useDisplayOrder (Composition-API-shaped,
// use-display-order.ts) — mirrors createGlobalEscapeKeyMixin's own spec
// pattern (mount a plain Options-API component with `mixins: [...]`, assert
// on real mounted/beforeUnmount lifecycle behavior, no setup()/Composition
// API anywhere in the test components either).
describe("createDisplayOrderMixin", () => {
  it("assigns increasing order to successively mounted visible instances in the same group", () => {
    const first = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-a", isVisible: () => true })],
      template: `<div />`,
    });
    const second = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-a", isVisible: () => true })],
      template: `<div />`,
    });

    expect((second.vm as unknown as { displayOrder?: number }).displayOrder ?? 0).toBeGreaterThan(
      (first.vm as unknown as { displayOrder?: number }).displayOrder ?? 0
    );

    first.unmount();
    second.unmount();
  });

  it("does not register an order for an instance that is not visible on mount", () => {
    const wrapper = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-b", isVisible: () => false })],
      template: `<div />`,
    });

    expect((wrapper.vm as unknown as { displayOrder?: number }).displayOrder).toBeUndefined();

    wrapper.unmount();
  });

  it("clears the order on unmount and lets a newly mounted instance reuse the freed slot", () => {
    const first = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-c", isVisible: () => true })],
      template: `<div />`,
    });
    const firstOrder = (first.vm as unknown as { displayOrder?: number }).displayOrder;
    expect(firstOrder).toBeDefined();

    first.unmount();

    const second = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-c", isVisible: () => true })],
      template: `<div />`,
    });
    expect((second.vm as unknown as { displayOrder?: number }).displayOrder).toBe(firstOrder);
    second.unmount();
  });

  it("does not re-register on updated() — mounted() registers once and stays registered until unmount", async () => {
    const wrapper = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-d", isVisible: () => true })],
      data() {
        return { tick: 0 };
      },
      template: `<div>{{ tick }}</div>`,
    });
    const orderAfterMount = (wrapper.vm as unknown as { displayOrder?: number }).displayOrder;

    (wrapper.vm as unknown as { tick: number }).tick = 1;
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as unknown as { displayOrder?: number }).displayOrder).toBe(orderAfterMount);

    wrapper.unmount();
  });

  it("does not reassign displayOrder for an already-visible instance when a SIBLING instance in the same group updates", async () => {
    const first = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-f", isVisible: () => true })],
      data() {
        return { tick: 0 };
      },
      template: `<div>{{ tick }}</div>`,
    });
    const second = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-f", isVisible: () => true })],
      template: `<div />`,
    });
    const firstOrderBefore = (first.vm as unknown as { displayOrder?: number }).displayOrder;
    const secondOrder = (second.vm as unknown as { displayOrder?: number }).displayOrder;
    expect(secondOrder ?? 0).toBeGreaterThan(firstOrderBefore ?? 0);

    // An unrelated reactive update on the FIRST (older, non-topmost)
    // instance must not reassign its displayOrder to a new, larger value —
    // doing so would silently make it appear "topmost" ahead of `second`.
    (first.vm as unknown as { tick: number }).tick = 1;
    await first.vm.$nextTick();

    expect((first.vm as unknown as { displayOrder?: number }).displayOrder).toBe(firstOrderBefore);
    expect((second.vm as unknown as { displayOrder?: number }).displayOrder).toBeGreaterThan(
      (first.vm as unknown as { displayOrder?: number }).displayOrder ?? 0
    );

    first.unmount();
    second.unmount();
  });

  it("registers on updated() when mounted invisible, then becomes visible later (v-model:visible pattern)", async () => {
    let visible = false;
    const wrapper = mount({
      mixins: [createDisplayOrderMixin({ group: "test-group-vue-mixin-e", isVisible: () => visible })],
      data() {
        return { tick: 0 };
      },
      template: `<div>{{ tick }}</div>`,
    });

    expect((wrapper.vm as unknown as { displayOrder?: number }).displayOrder).toBeUndefined();

    visible = true;
    (wrapper.vm as unknown as { tick: number }).tick = 1;
    await wrapper.vm.$nextTick();

    expect((wrapper.vm as unknown as { displayOrder?: number }).displayOrder).toBeDefined();

    wrapper.unmount();
  });
});
