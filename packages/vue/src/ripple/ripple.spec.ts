import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { rippleDirective } from "./ripple";

describe("v-ripple", () => {
  it("creates an ink element on mount", () => {
    const wrapper = mount(
      { template: `<div class="card" v-ripple>Default</div>` },
      { global: { directives: { ripple: rippleDirective } } }
    );
    expect(wrapper.find(".u-ink").exists()).toBe(true);
  });

  it("activates the ink element on mousedown", async () => {
    const wrapper = mount(
      { template: `<div class="card" v-ripple>Default</div>` },
      { global: { directives: { ripple: rippleDirective } } }
    );
    await wrapper.find(".card").trigger("mousedown");
    expect(wrapper.find(".u-ink").classes()).toContain("u-ink-active");
  });

  it("removes the ink element on unmount", () => {
    const wrapper = mount(
      { template: `<div class="card" v-ripple>Default</div>` },
      { global: { directives: { ripple: rippleDirective } } }
    );
    wrapper.unmount();
    expect(document.querySelector(".u-ink")).toBeNull();
  });
});
