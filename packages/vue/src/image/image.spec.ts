import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UImage } from "./index";

function flushMacrotask() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("UImage", () => {
  it("renders the img element with src/alt", () => {
    const wrapper = mount(UImage, { props: { src: "a.png", alt: "A" } });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("a.png");
    expect(img.attributes("alt")).toBe("A");
  });

  it("does not render a preview button when preview is false", () => {
    const wrapper = mount(UImage, { props: { src: "a.png" } });
    expect(wrapper.find(".u-image-preview-mask").exists()).toBe(false);
  });

  it("opens the fullscreen preview mask when the preview button is clicked", async () => {
    const wrapper = mount(UImage, { props: { src: "a.png", preview: true }, attachTo: document.body });
    await wrapper.find(".u-image-preview-mask").trigger("click");
    await flushMacrotask();
    expect(document.querySelector(".u-image-mask")).toBeTruthy();
    wrapper.unmount();
  });

  it("closes the preview when the close button is clicked", async () => {
    const wrapper = mount(UImage, { props: { src: "a.png", preview: true }, attachTo: document.body });
    await wrapper.find(".u-image-preview-mask").trigger("click");
    await flushMacrotask();
    const closeBtn = document.querySelector(".u-image-close-button") as HTMLElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    await wrapper.vm.$nextTick();
    await flushMacrotask();
    expect(document.querySelector(".u-image-mask")).toBeFalsy();
    wrapper.unmount();
  });

  it("closes the preview on Escape keydown", async () => {
    const wrapper = mount(UImage, { props: { src: "a.png", preview: true }, attachTo: document.body });
    await wrapper.find(".u-image-preview-mask").trigger("click");
    await flushMacrotask();
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    await flushMacrotask();
    expect(document.querySelector(".u-image-mask")).toBeFalsy();
    wrapper.unmount();
  });

  it("toggles zoom in within the max bound", async () => {
    const wrapper = mount(UImage, { props: { src: "a.png", preview: true }, attachTo: document.body });
    await wrapper.find(".u-image-preview-mask").trigger("click");
    await flushMacrotask();
    (document.querySelector(".u-image-zoom-in-button") as HTMLElement).click();
    await wrapper.vm.$nextTick();
    const original = document.querySelector(".u-image-original") as HTMLElement;
    expect(original.style.transform).toContain("scale(1.1)");
    wrapper.unmount();
  });

  it("emits imageError when the base image fails to load", async () => {
    const wrapper = mount(UImage, { props: { src: "bad.png" } });
    await wrapper.find("img").trigger("error");
    expect(wrapper.emitted("imageError")).toHaveLength(1);
  });

  it("emits show and hide", async () => {
    const wrapper = mount(UImage, { props: { src: "a.png", preview: true }, attachTo: document.body });
    await wrapper.find(".u-image-preview-mask").trigger("click");
    await flushMacrotask();
    expect(wrapper.emitted("show")).toHaveLength(1);
    (document.querySelector(".u-image-close-button") as HTMLElement).click();
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("hide")).toHaveLength(1);
    wrapper.unmount();
  });
});
