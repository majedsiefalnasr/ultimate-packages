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

  it("gives the remove control an English default accessible label that can be replaced", () => {
    const wrapper = mount(UChip, { props: { label: "Apple", removable: true } });
    expect(wrapper.find(".u-chip-remove-icon").attributes("aria-label")).toBe("Remove");
    const custom = mount(UChip, {
      props: { label: "Apple", removable: true, removeAriaLabel: "Delete" },
    });
    expect(custom.find(".u-chip-remove-icon").attributes("aria-label")).toBe("Delete");
  });

  it("replaces the remove glyph with a font class", () => {
    const wrapper = mount(UChip, {
      props: { label: "Apple", removable: true, removeIcon: "pi pi-times-circle" },
    });
    const removeEl = wrapper.find(".u-chip-remove-icon");
    expect(removeEl.classes()).toContain("pi-times-circle");
    expect(removeEl.find("svg").exists()).toBe(false);
  });

  it("renders the default slot instead of the image, icon and label", () => {
    const wrapper = mount(UChip, {
      props: { label: "Apple" },
      slots: { default: '<span data-testid="custom">Custom</span>' },
    });
    expect(wrapper.find("[data-testid='custom']").exists()).toBe(true);
    expect(wrapper.find(".u-chip-label").exists()).toBe(false);
  });

  it("renders the icon slot inside the icon part", () => {
    const wrapper = mount(UChip, {
      props: { label: "Apple" },
      slots: { icon: '<i data-testid="slot-icon" />' },
    });
    const slotIcon = wrapper.find(".u-chip-icon [data-testid='slot-icon']");
    expect(slotIcon.exists()).toBe(true);
  });

  it("replaces the remove control with the removeicon slot and passes its callbacks", async () => {
    const wrapper = mount(UChip, {
      props: { label: "Apple", removable: true },
      slots: {
        removeicon: `<template #removeicon="{ removeCallback }"><button data-testid="own" @click="removeCallback">x</button></template>`,
      },
    });
    expect(wrapper.find(".u-chip-remove-icon").exists()).toBe(false);
    await wrapper.find("[data-testid='own']").trigger("click");
    expect(wrapper.emitted("remove")).toHaveLength(1);
    expect(wrapper.find(".u-chip").exists()).toBe(false);
  });

  it("passes consumer class, style and aria attributes to the root", () => {
    const wrapper = mount(UChip, {
      props: { label: "Apple" },
      attrs: { class: "mine", style: "margin: 1px", "aria-describedby": "hint" },
    });
    const root = wrapper.find(".u-chip");
    expect(root.classes()).toContain("mine");
    expect(root.attributes("style")).toContain("margin");
    expect(root.attributes("aria-describedby")).toBe("hint");
  });

  it("sets data-p to removable only when removable", () => {
    expect(
      mount(UChip, { props: { label: "Apple" } })
        .find(".u-chip")
        .attributes("data-p")
    ).toBe(undefined);
    expect(
      mount(UChip, { props: { label: "Apple", removable: true } })
        .find(".u-chip")
        .attributes("data-p")
    ).toBe("removable");
  });

  it("adds p-disabled to the root when disabled", () => {
    const wrapper = mount(UChip, { props: { label: "Apple", disabled: true } });
    expect(wrapper.find(".u-chip").classes()).toContain("p-disabled");
  });

  it("applies pt sections to the root and each part", () => {
    const wrapper = mount(UChip, {
      props: {
        label: "Apple",
        icon: "pi pi-apple",
        removable: true,
        pt: {
          root: { "data-pt": "root" },
          icon: { "data-pt": "icon" },
          label: { "data-pt": "label" },
          removeIcon: { "data-pt": "remove" },
        },
      },
    });
    expect(wrapper.find(".u-chip").attributes("data-pt")).toBe("root");
    expect(wrapper.find(".u-chip-icon").attributes("data-pt")).toBe("icon");
    expect(wrapper.find(".u-chip-label").attributes("data-pt")).toBe("label");
    expect(wrapper.find(".u-chip-remove-icon").attributes("data-pt")).toBe("remove");
  });

  it("emits no Ultimate classes when unstyled", () => {
    const wrapper = mount(UChip, { props: { label: "Apple", removable: true, unstyled: true } });
    expect(wrapper.find(".u-chip").exists()).toBe(false);
    expect(wrapper.find(".u-chip-label").exists()).toBe(false);
  });
});
