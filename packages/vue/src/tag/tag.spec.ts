import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UTag } from "./index";

describe("UTag", () => {
  it("renders default slot content", () => {
    const wrapper = mount(UTag, { slots: { default: "New" } });
    expect(wrapper.find(".u-tag-label").text()).toBe("New");
  });

  it("falls back to the value prop when no slot content is provided", () => {
    const wrapper = mount(UTag, { props: { value: "Hot" } });
    expect(wrapper.find(".u-tag-label").text()).toBe("Hot");
  });

  it("applies severity class", () => {
    const wrapper = mount(UTag, { props: { severity: "danger" }, slots: { default: "Alert" } });
    expect(wrapper.find(".u-tag").classes()).toContain("u-tag-danger");
  });

  it("applies rounded class", () => {
    const wrapper = mount(UTag, { props: { rounded: true }, slots: { default: "Round" } });
    expect(wrapper.find(".u-tag").classes()).toContain("u-tag-rounded");
  });

  it("renders an icon when provided", () => {
    const wrapper = mount(UTag, { props: { icon: "pi pi-check" }, slots: { default: "Done" } });
    expect(wrapper.find(".pi-check").exists()).toBe(true);
  });
});
