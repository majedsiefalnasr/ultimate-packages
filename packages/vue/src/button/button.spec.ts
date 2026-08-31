import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UButton } from "./index";

describe("UButton", () => {
  it("renders a native button element with the label", () => {
    const wrapper = mount(UButton, { props: { label: "Submit" } });
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.text()).toContain("Submit");
  });

  it("renders an icon when the icon prop is set", () => {
    const wrapper = mount(UButton, { props: { icon: "pi pi-check" } });
    expect(wrapper.find(".pi-check").exists()).toBe(true);
  });

  it("shows a spinner icon and hides the label icon when loading", () => {
    const wrapper = mount(UButton, { props: { loading: true, icon: "pi pi-check" } });
    expect(wrapper.findComponent({ name: "USpinnerIcon" }).exists()).toBe(true);
    expect(wrapper.find(".pi-check").exists()).toBe(false);
  });

  it("computes a default aria-label from label + badge when unset", () => {
    const wrapper = mount(UButton, { props: { label: "Save", badge: "5" } });
    expect(wrapper.attributes("aria-label")).toBe("Save 5");
  });

  it("does not override an explicitly supplied aria-label", () => {
    const wrapper = mount(UButton, { props: { label: "Save", ariaLabel: "Custom label" } });
    expect(wrapper.attributes("aria-label")).toBe("Custom label");
  });

  it("applies boolean-modifier classes for severity/raised/rounded/text/outlined", () => {
    const wrapper = mount(UButton, { props: { severity: "danger", raised: true, rounded: true } });
    expect(wrapper.classes().join(" ")).toMatch(/danger|raised|rounded/);
  });

  it("renders as a different root element via the `as` prop", () => {
    const wrapper = mount(UButton, { props: { as: "a", label: "Link Button" } });
    expect(wrapper.element.tagName).toBe("A");
  });

  it("has the v-ripple directive applied to the root element", () => {
    const wrapper = mount(UButton, { props: { label: "Ripple Test" } });
    expect(wrapper.find(".u-ink").exists()).toBe(true);
  });

  it("renders a tooltip on hover when the tooltip prop is set (sugar over v-tooltip)", async () => {
    const wrapper = mount(UButton, { props: { label: "Save", tooltip: "Save changes" }, attachTo: document.body });
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel?.textContent).toBe("Save changes");
    wrapper.unmount();
  });
});
