import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UAvatar } from "./index";

describe("UAvatar", () => {
  it("renders a label when no image or icon is provided", () => {
    const wrapper = mount(UAvatar, { props: { label: "AB" } });
    expect(wrapper.find(".u-avatar-text").text()).toBe("AB");
  });

  it("renders an icon when no image is provided", () => {
    const wrapper = mount(UAvatar, { props: { icon: "pi pi-user" } });
    expect(wrapper.find(".pi-user").exists()).toBe(true);
  });

  it("renders an image when provided", () => {
    const wrapper = mount(UAvatar, { props: { image: "avatar.png" } });
    expect(wrapper.find("img").attributes("src")).toBe("avatar.png");
  });

  it("falls back to the label after an image load error", async () => {
    const wrapper = mount(UAvatar, { props: { image: "broken.png", label: "AB" } });
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find(".u-avatar-text").text()).toBe("AB");
  });

  it("emits error when the image fails to load", async () => {
    const wrapper = mount(UAvatar, { props: { image: "broken.png" } });
    await wrapper.find("img").trigger("error");
    expect(wrapper.emitted("error")).toHaveLength(1);
  });

  it("applies the circle shape class", () => {
    const wrapper = mount(UAvatar, { props: { label: "A", shape: "circle" } });
    expect(wrapper.classes()).toContain("u-avatar-circle");
  });

  it("applies the large size class", () => {
    const wrapper = mount(UAvatar, { props: { label: "A", size: "large" } });
    expect(wrapper.classes()).toContain("u-avatar-lg");
  });
});
