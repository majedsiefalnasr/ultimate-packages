import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UChip } from "./index";

describe("UChip", () => {
  it("renders the label text", () => {
    const wrapper = mount(UChip, { props: { label: "Apple" } });
    expect(wrapper.find(".u-chip-label").text()).toBe("Apple");
  });

  it("renders an icon class when icon is provided and no image", () => {
    const wrapper = mount(UChip, { props: { icon: "pi pi-apple" } });
    expect(wrapper.find(".pi-apple").exists()).toBe(true);
  });

  it("renders an image and prefers it over icon", () => {
    const wrapper = mount(UChip, { props: { image: "a.png", icon: "pi pi-apple", alt: "fruit" } });
    const img = wrapper.find("img.u-chip-image");
    expect(img.exists()).toBe(true);
    expect(img.attributes("alt")).toBe("fruit");
    expect(wrapper.find(".pi-apple").exists()).toBe(false);
  });

  it("does not render a remove control by default", () => {
    const wrapper = mount(UChip, { props: { label: "Apple" } });
    expect(wrapper.find(".u-chip-remove-icon").exists()).toBe(false);
  });

  it("removes the chip and emits remove when the remove control is clicked", async () => {
    const wrapper = mount(UChip, { props: { label: "Apple", removable: true } });
    const removeEl = wrapper.find(".u-chip-remove-icon");
    expect(removeEl.exists()).toBe(true);
    await removeEl.trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
    expect(wrapper.find(".u-chip").exists()).toBe(false);
  });

  it("removes the chip on Enter and Backspace keydown on the remove control", async () => {
    const wrapper = mount(UChip, { props: { label: "Apple", removable: true } });
    await wrapper.find(".u-chip-remove-icon").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("remove")).toHaveLength(1);
  });

  it("does not remove when disabled", async () => {
    const wrapper = mount(UChip, { props: { label: "Apple", removable: true, disabled: true } });
    await wrapper.find(".u-chip-remove-icon").trigger("click");
    expect(wrapper.emitted("remove")).toBeUndefined();
    expect(wrapper.find(".u-chip").exists()).toBe(true);
  });

  it("sets tabindex -1 on the remove control when disabled", () => {
    const wrapper = mount(UChip, { props: { label: "Apple", removable: true, disabled: true } });
    expect(wrapper.find(".u-chip-remove-icon").attributes("tabindex")).toBe("-1");
  });

  it("emits imageError when the image fails to load", async () => {
    const wrapper = mount(UChip, { props: { image: "bad.png" } });
    await wrapper.find("img.u-chip-image").trigger("error");
    expect(wrapper.emitted("imageError")).toHaveLength(1);
  });
});
