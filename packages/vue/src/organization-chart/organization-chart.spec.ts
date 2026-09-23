import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import UOrganizationChart from "./OrganizationChart.vue";

const value = {
  label: "CEO",
  key: "0",
  children: [
    { label: "CTO", key: "0_0" },
    { label: "CFO", key: "0_1" },
  ],
};

describe("UOrganizationChart", () => {
  it("renders a single root object and expanded children without a collapse affordance by default", () => {
    const wrapper = mount(UOrganizationChart, { props: { value } });
    expect(wrapper.text()).toContain("CEO");
    expect(wrapper.text()).toContain("CTO");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("collapses and expands by key and responds to external map changes", async () => {
    const wrapper = mount(UOrganizationChart, { props: { value, collapsible: true } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).not.toContain("CTO");
    expect(wrapper.emitted("update:collapsedKeys")?.[0]?.[0]).toEqual({ "0": true });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).toContain("CTO");
    await wrapper.setProps({ collapsedKeys: { "0": true } });
    expect(wrapper.text()).not.toContain("CTO");
    expect(value).not.toHaveProperty("expanded");
  });

  it("does not bubble nested toggler keyboard input into node selection", async () => {
    const wrapper = mount(UOrganizationChart, {
      props: { value, collapsible: true, selectionMode: "single", selectionKeys: {} },
    });
    await wrapper.find("button").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:selectionKeys")).toBeUndefined();
  });

  it("emits a single selection key and removes it when selected again", async () => {
    const wrapper = mount(UOrganizationChart, {
      props: { value, selectionMode: "single", selectionKeys: {} },
    });
    await wrapper.find(".u-organization-chart-node-content").trigger("click");
    expect(wrapper.emitted("update:selectionKeys")?.[0]?.[0]).toEqual({ "0": true });
    await wrapper.setProps({ selectionKeys: { "0": true } });
    await wrapper.find(".u-organization-chart-node-content").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:selectionKeys")?.[1]?.[0]).toEqual({});
  });

  it("adds and removes keys in multiple mode without discarding unrelated selections", async () => {
    const wrapper = mount(UOrganizationChart, {
      props: { value, selectionMode: "multiple", selectionKeys: { "0_0": true } },
    });
    await wrapper.find(".u-organization-chart-node-content").trigger("click");
    expect(wrapper.emitted("update:selectionKeys")?.[0]?.[0]).toEqual({ "0": true, "0_0": true });
    await wrapper.setProps({ selectionKeys: { "0": true, "0_0": true } });
    await wrapper.find(".u-organization-chart-node-content").trigger("click");
    expect(wrapper.emitted("update:selectionKeys")?.[1]?.[0]).toEqual({ "0_0": true });
    expect(wrapper.find('[role="tree"]').attributes("aria-multiselectable")).toBe("true");
  });
});
