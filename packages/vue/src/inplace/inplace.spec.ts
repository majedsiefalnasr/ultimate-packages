import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInplace } from "./index";

describe("UInplace", () => {
  it("renders the display slot when inactive", () => {
    const wrapper = mount(UInplace, {
      slots: { display: "Click to edit", content: '<input class="editor" />' },
    });
    expect(wrapper.find(".u-inplace-display").text()).toBe("Click to edit");
    expect(wrapper.find(".editor").exists()).toBe(false);
  });

  it("activates and shows the content slot on click", async () => {
    const wrapper = mount(UInplace, {
      slots: { display: "Click to edit", content: '<input class="editor" />' },
    });
    await wrapper.find(".u-inplace-display").trigger("click");
    expect(wrapper.find(".editor").exists()).toBe(true);
  });

  it("activates on Enter keydown", async () => {
    const wrapper = mount(UInplace, {
      slots: { display: "Click to edit", content: '<input class="editor" />' },
    });
    await wrapper.find(".u-inplace-display").trigger("keydown.enter");
    expect(wrapper.find(".editor").exists()).toBe(true);
  });

  it("invokes closeCallback from the content slot to deactivate", async () => {
    const wrapper = mount(UInplace, {
      props: { active: true },
      slots: {
        display: "Click to edit",
        content: `<template #content="{ closeCallback }"><button class="close" @click="closeCallback">Close</button></template>`,
      },
    });
    expect(wrapper.find(".close").exists()).toBe(true);
    await wrapper.find(".close").trigger("click");
    expect(wrapper.find(".u-inplace-display").exists()).toBe(true);
  });

  it("does not activate when disabled", async () => {
    const wrapper = mount(UInplace, {
      props: { disabled: true },
      slots: { display: "Click to edit", content: '<input class="editor" />' },
    });
    await wrapper.find(".u-inplace-display").trigger("click");
    expect(wrapper.find(".editor").exists()).toBe(false);
  });

  it("emits open, close, and update:active", async () => {
    const wrapper = mount(UInplace, {
      slots: {
        display: "Click to edit",
        content: `<template #content="{ closeCallback }"><button class="close" @click="closeCallback">Close</button></template>`,
      },
    });
    await wrapper.find(".u-inplace-display").trigger("click");
    expect(wrapper.emitted("open")).toHaveLength(1);
    expect(wrapper.emitted("update:active")?.[0]).toEqual([true]);
    await wrapper.find(".close").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
    expect(wrapper.emitted("update:active")?.[1]).toEqual([false]);
  });
});
