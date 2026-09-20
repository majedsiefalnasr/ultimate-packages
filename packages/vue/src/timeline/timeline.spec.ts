import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { UTimeline } from "./index";

describe("UTimeline", () => {
  it("renders one event row per value entry", () => {
    const wrapper = mount(UTimeline, {
      props: { value: ["Ordered", "Shipped", "Delivered"] },
      slots: { content: (slotProps: { item: string }) => h("span", slotProps.item) },
    });
    const rows = wrapper.findAll(".u-timeline-event");
    expect(rows.length).toBe(3);
    expect(rows[0].text()).toContain("Ordered");
    expect(rows[2].text()).toContain("Delivered");
  });

  it("renders a connector between events but not after the last one", () => {
    const wrapper = mount(UTimeline, { props: { value: ["A", "B"] } });
    expect(wrapper.findAll(".u-timeline-event-connector").length).toBe(1);
  });

  it("applies horizontal layout class", () => {
    const wrapper = mount(UTimeline, { props: { value: ["A"], layout: "horizontal" } });
    expect(wrapper.find(".u-timeline").classes()).toContain("u-timeline-horizontal");
  });

  it("renders a default marker when no marker slot is provided", () => {
    const wrapper = mount(UTimeline, { props: { value: ["A"] } });
    expect(wrapper.find(".u-timeline-event-marker").exists()).toBe(true);
  });

  it("renders a custom marker slot when provided", () => {
    const wrapper = mount(UTimeline, {
      props: { value: ["A"] },
      slots: {
        marker: (slotProps: { item: string }) =>
          h("span", { class: "custom-marker" }, slotProps.item),
      },
    });
    expect(wrapper.find(".custom-marker").text()).toBe("A");
    expect(wrapper.find(".u-timeline-event-marker").exists()).toBe(false);
  });
});
