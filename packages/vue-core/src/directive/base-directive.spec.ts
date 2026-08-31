import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createDirective } from "./base-directive";

describe("createDirective", () => {
  it("calls the mounted hook with the bound element and binding value", () => {
    const mounted = vi.fn();
    const directive = createDirective({ name: "test-directive", hooks: { mounted } });
    mount(
      { template: `<div v-test-directive="'hello'" />` },
      { global: { directives: { "test-directive": directive } } }
    );
    expect(mounted).toHaveBeenCalledOnce();
    const [el, binding] = mounted.mock.calls[0];
    expect(el).toBeInstanceOf(HTMLElement);
    expect(binding.value).toBe("hello");
  });

  it("calls the unmounted hook when the host element is removed", () => {
    const unmounted = vi.fn();
    const directive = createDirective({ name: "test-directive-2", hooks: { unmounted } });
    const wrapper = mount(
      { template: `<div v-if="show" v-test-directive-2 />`, data: () => ({ show: true }) },
      { global: { directives: { "test-directive-2": directive } } }
    );
    return wrapper.setData({ show: false }).then(() => {
      expect(unmounted).toHaveBeenCalledOnce();
    });
  });

  it("calls the updated hook with the new binding value when the binding changes", () => {
    const updated = vi.fn();
    const directive = createDirective({ name: "test-directive-3", hooks: { updated } });
    const wrapper = mount(
      { template: `<div v-test-directive-3="value" />`, data: () => ({ value: "a" }) },
      { global: { directives: { "test-directive-3": directive } } }
    );
    return wrapper.setData({ value: "b" }).then(() => {
      expect(updated).toHaveBeenCalledOnce();
      const [, binding] = updated.mock.calls[0];
      expect(binding.value).toBe("b");
    });
  });
});
