import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { USkeleton } from "./index";

describe("USkeleton", () => {
  it("renders with default rectangle shape and wave animation classes", () => {
    const wrapper = mount(USkeleton);
    const root = wrapper.find(".u-skeleton");
    expect(root.exists()).toBe(true);
    expect(root.classes()).not.toContain("u-skeleton-circle");
    expect(root.classes()).toContain("u-skeleton-wave");
  });

  it("applies circle shape class", () => {
    const wrapper = mount(USkeleton, { props: { shape: "circle" } });
    expect(wrapper.find(".u-skeleton").classes()).toContain("u-skeleton-circle");
  });

  it("defaults to 100% width and 1rem height", () => {
    const wrapper = mount(USkeleton);
    const root = wrapper.find(".u-skeleton");
    expect((root.element as HTMLElement).style.width).toBe("100%");
    expect((root.element as HTMLElement).style.height).toBe("1rem");
  });

  it("applies custom width/height", () => {
    const wrapper = mount(USkeleton, { props: { width: "10rem", height: "2rem" } });
    const root = wrapper.find(".u-skeleton");
    expect((root.element as HTMLElement).style.width).toBe("10rem");
    expect((root.element as HTMLElement).style.height).toBe("2rem");
  });

  it("size overrides width/height for a square/circle skeleton", () => {
    const wrapper = mount(USkeleton, { props: { shape: "circle", size: "4rem" } });
    const root = wrapper.find(".u-skeleton");
    expect((root.element as HTMLElement).style.width).toBe("4rem");
    expect((root.element as HTMLElement).style.height).toBe("4rem");
  });

  it("has no animation class when animation is none", () => {
    const wrapper = mount(USkeleton, { props: { animation: "none" } });
    expect(wrapper.find(".u-skeleton").classes()).not.toContain("u-skeleton-wave");
  });

  it("is aria-hidden", () => {
    const wrapper = mount(USkeleton);
    expect(wrapper.find(".u-skeleton").attributes("aria-hidden")).toBe("true");
  });
});
