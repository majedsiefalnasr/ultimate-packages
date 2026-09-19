import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UOverlayBadge } from "./index";

describe("UOverlayBadge", () => {
  it("renders the projected content and a composed badge", () => {
    const wrapper = mount(UOverlayBadge, {
      props: { value: "2", severity: "danger" },
      slots: { default: '<i class="pi pi-bell"></i>' },
    });

    expect(wrapper.find(".u-overlaybadge").exists()).toBe(true);
    expect(wrapper.find(".pi-bell").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "UBadge" }).exists()).toBe(true);
    expect(wrapper.text()).toBe("2");
  });

  it("forwards value/severity/size to the composed badge", () => {
    const wrapper = mount(UOverlayBadge, {
      props: { value: "9", severity: "success", size: "large" },
      slots: { default: "<span>Icon</span>" },
    });

    const badge = wrapper.findComponent({ name: "UBadge" });
    expect(badge.props("value")).toBe("9");
    expect(badge.props("severity")).toBe("success");
    expect(badge.props("size")).toBe("large");
  });

  it("renders without a value (empty badge, matching plain dot-badge usage)", () => {
    const wrapper = mount(UOverlayBadge, {
      props: { severity: "success" },
      slots: { default: "<span>Icon</span>" },
    });

    const badge = wrapper.findComponent({ name: "UBadge" });
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe("");
  });
});
