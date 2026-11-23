import { h } from "vue";
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Theme } from "@ultimate/uix-styled";
import { UAvatar } from "./index";

describe("UAvatar", () => {
  it("renders a label when no image or icon is provided", () => {
    const wrapper = mount(UAvatar, { props: { label: "AB" } });
    expect(wrapper.find(".u-avatar-text").text()).toBe("AB");
  });

  it("renders an icon when no image is provided", () => {
    const wrapper = mount(UAvatar, { props: { icon: "pi pi-user" } });
    const icon = wrapper.find(".pi-user");
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain("u-avatar-icon");
  });

  it("renders an image when provided", () => {
    const wrapper = mount(UAvatar, { props: { image: "avatar.png", ariaLabel: "User" } });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("avatar.png");
    expect(img.attributes("alt")).toBe("User");
    expect(wrapper.classes()).toContain("u-avatar-image");
  });

  describe("content priority", () => {
    it("shows the label before the icon and the image, as PrimeVue does", () => {
      const wrapper = mount(UAvatar, {
        props: { label: "AB", icon: "pi pi-user", image: "a.png" },
      });
      expect(wrapper.find(".u-avatar-text").text()).toBe("AB");
      expect(wrapper.find(".pi-user").exists()).toBe(false);
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("shows the icon class before the image", () => {
      const wrapper = mount(UAvatar, { props: { icon: "pi pi-user", image: "a.png" } });
      expect(wrapper.find(".pi-user").exists()).toBe(true);
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("renders the icon slot before the icon class and the image", () => {
      const wrapper = mount(UAvatar, {
        props: { icon: "pi pi-user", image: "a.png" },
        slots: { icon: () => h("i", { class: "custom-icon" }) },
      });
      const icon = wrapper.find(".custom-icon");
      expect(icon.exists()).toBe(true);
      expect(icon.element.parentElement?.classList.contains("u-avatar-icon")).toBe(true);
      expect(wrapper.find(".pi-user").exists()).toBe(false);
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("keeps the label ahead of the icon slot", () => {
      const wrapper = mount(UAvatar, {
        props: { label: "AB" },
        slots: { icon: () => h("i", { class: "custom-icon" }) },
      });
      expect(wrapper.find(".u-avatar-text").exists()).toBe(true);
      expect(wrapper.find(".custom-icon").exists()).toBe(false);
    });

    it("lets the default slot replace the whole content", () => {
      const wrapper = mount(UAvatar, {
        props: { label: "AB", image: "a.png" },
        slots: { default: '<b class="custom">!</b>' },
      });
      expect(wrapper.find(".custom").exists()).toBe(true);
      expect(wrapper.find(".u-avatar-text").exists()).toBe(false);
      expect(wrapper.find("img").exists()).toBe(false);
    });
  });

  describe("image errors", () => {
    it("emits error and keeps the image, with no fallback to the label", async () => {
      const wrapper = mount(UAvatar, { props: { image: "broken.png" } });
      await wrapper.find("img").trigger("error");
      expect(wrapper.emitted("error")).toHaveLength(1);
      expect(wrapper.find("img").exists()).toBe(true);
      expect(wrapper.classes()).toContain("u-avatar-image");
    });

    it("keeps emitting for a new image after an earlier failure", async () => {
      const wrapper = mount(UAvatar, { props: { image: "broken.png" } });
      await wrapper.find("img").trigger("error");
      await wrapper.setProps({ image: "other.png" });
      expect(wrapper.find("img").attributes("src")).toBe("other.png");
      await wrapper.find("img").trigger("error");
      expect(wrapper.emitted("error")).toHaveLength(2);
    });
  });

  it("applies the circle shape class", () => {
    const wrapper = mount(UAvatar, { props: { label: "A", shape: "circle" } });
    expect(wrapper.classes()).toContain("u-avatar-circle");
  });

  it("applies the large size class", () => {
    const wrapper = mount(UAvatar, { props: { label: "A", size: "large" } });
    expect(wrapper.classes()).toContain("u-avatar-lg");
  });

  describe("pass-through, unstyled and dt", () => {
    it("passes native attributes and class through to the root", () => {
      const wrapper = mount(UAvatar, {
        props: { label: "A" },
        attrs: { id: "a", class: "mine", "data-x": "1" },
      });
      expect(wrapper.attributes("id")).toBe("a");
      expect(wrapper.attributes("data-x")).toBe("1");
      expect(wrapper.classes()).toContain("mine");
      expect(wrapper.classes()).toContain("u-avatar");
    });

    it("applies root, label, icon and image pt attributes", () => {
      const root = mount(UAvatar, {
        props: {
          label: "AB",
          pt: { root: { id: "avatar-root", class: "extra-root" }, label: { "data-label": "l" } },
        },
      });
      expect(root.attributes("id")).toBe("avatar-root");
      expect(root.classes()).toContain("extra-root");
      expect(root.classes()).toContain("u-avatar");
      expect(root.attributes("data-pc-name")).toBe("avatar");
      expect(root.find(".u-avatar-text").attributes("data-label")).toBe("l");

      const icon = mount(UAvatar, {
        props: { icon: "pi pi-user", pt: { icon: { "data-icon": "i" } } },
      });
      expect(icon.find(".pi-user").attributes("data-icon")).toBe("i");

      const image = mount(UAvatar, {
        props: { image: "a.png", pt: { image: { "data-image": "m" } } },
      });
      expect(image.find("img").attributes("data-image")).toBe("m");
    });

    it("unstyled drops the Ultimate classes", () => {
      const wrapper = mount(UAvatar, {
        props: { label: "A", unstyled: true, pt: { root: { class: "extra-root" } } },
      });
      expect(wrapper.classes()).not.toContain("u-avatar");
      expect(wrapper.classes()).toContain("extra-root");
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { avatar: { root: { width: "2rem" } } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      const wrapper = mount(UAvatar, { props: { label: "A", dt: { width: "5rem" } } });
      const [attr] = wrapper.element
        .getAttributeNames()
        .filter((name: string) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-style="${attr}-avatar"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-avatar-width:5rem;}`);
    });
  });
});
