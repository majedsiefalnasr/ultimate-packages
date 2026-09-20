import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UMeterGroup } from "./index";

describe("UMeterGroup", () => {
  it("renders one meter segment per non-zero value item", () => {
    const wrapper = mount(UMeterGroup, {
      props: {
        value: [
          { label: "A", value: 30, color: "red" },
          { label: "B", value: 20, color: "blue" },
          { label: "C", value: 0, color: "green" },
        ],
      },
    });
    expect(wrapper.findAll(".u-meter-group-meter").length).toBe(2);
  });

  it("computes segment widths proportional to min/max range", () => {
    const wrapper = mount(UMeterGroup, {
      props: { value: [{ label: "A", value: 100, color: "red" }], min: 0, max: 200 },
    });
    const meter = wrapper.find(".u-meter-group-meter");
    expect(meter.attributes("style")).toContain("width: 50%");
  });

  it("renders a legend list with label and percentage text", () => {
    const wrapper = mount(UMeterGroup, {
      props: { value: [{ label: "Storage", value: 25, color: "red" }] },
    });
    expect(wrapper.find(".u-meter-group-label-text").text()).toBe("Storage (25%)");
  });

  it("switches to vertical orientation classes", () => {
    const wrapper = mount(UMeterGroup, {
      props: { value: [{ value: 10 }], orientation: "vertical" },
    });
    expect(wrapper.find(".u-meter-group").classes()).toContain("u-meter-group-vertical");
  });

  it("sets aria-valuenow to the total percentage across all items", () => {
    const wrapper = mount(UMeterGroup, {
      props: { value: [{ value: 20 }, { value: 30 }] },
    });
    expect(wrapper.find(".u-meter-group").attributes("aria-valuenow")).toBe("50");
  });
});
