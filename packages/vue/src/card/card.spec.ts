import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UCard } from "./index";

describe("UCard", () => {
  it("renders content slot content", () => {
    const wrapper = mount(UCard, {
      slots: { content: '<div class="card-content">Custom Card Content</div>' },
    });
    expect(wrapper.find(".card-content").text()).toBe("Custom Card Content");
  });

  it("renders title and subtitle slots when provided", () => {
    const wrapper = mount(UCard, {
      slots: { title: "Title", subtitle: "Subtitle" },
    });
    expect(wrapper.find(".u-card-title").text()).toBe("Title");
    expect(wrapper.find(".u-card-subtitle").text()).toBe("Subtitle");
  });

  it("does not render caption/title/subtitle divs when unset", () => {
    const wrapper = mount(UCard);
    expect(wrapper.find(".u-card-caption").exists()).toBe(false);
    expect(wrapper.find(".u-card-title").exists()).toBe(false);
  });

  it("renders header and footer slots", () => {
    const wrapper = mount(UCard, {
      slots: {
        header: '<div class="custom-header">Custom Header</div>',
        footer: '<div class="custom-footer">Custom Footer</div>',
      },
    });
    expect(wrapper.find(".custom-header").text()).toBe("Custom Header");
    expect(wrapper.find(".custom-footer").text()).toBe("Custom Footer");
  });

  it("applies the root card class", () => {
    const wrapper = mount(UCard);
    expect(wrapper.classes()).toContain("u-card");
  });

  describe("pt", () => {
    const pt = {
      root: { id: "card-root", class: "extra-root" },
      header: { "data-test": "header" },
      body: "extra-body",
      caption: { "data-test": "caption" },
      title: { "data-test": "title" },
      subtitle: { "data-test": "subtitle" },
      content: { "data-test": "content" },
      footer: { "data-test": "footer" },
    };
    const slots = {
      header: "H",
      title: "T",
      subtitle: "S",
      content: "C",
      footer: "F",
    };

    it("applies root pt attributes, keeps the root class and the non-pt attributes", () => {
      const wrapper = mount(UCard, {
        props: { pt } as never,
        attrs: { "data-extra": "kept", class: "own" },
      });
      expect(wrapper.attributes("id")).toBe("card-root");
      expect(wrapper.classes()).toEqual(expect.arrayContaining(["u-card", "extra-root", "own"]));
      expect(wrapper.attributes("data-extra")).toBe("kept");
      expect(wrapper.attributes("data-pc-name")).toBe("card");
      expect(wrapper.attributes("data-pc-section")).toBe("root");
    });

    it("applies pt attributes and section datasets to each part", () => {
      const wrapper = mount(UCard, { props: { pt } as never, slots });
      for (const part of ["header", "caption", "title", "subtitle", "content", "footer"]) {
        const element = wrapper.find(`.u-card-${part}`);
        expect(element.attributes("data-test")).toBe(part);
        expect(element.attributes("data-pc-section")).toBe(part);
      }
      const body = wrapper.find(".u-card-body");
      expect(body.classes()).toContain("extra-body");
      expect(body.attributes("data-pc-section")).toBe("body");
    });

    it("accepts pt:section:attribute attributes", () => {
      const wrapper = mount(UCard, { attrs: { "pt:root:title": "from-attr" } });
      expect(wrapper.attributes("title")).toBe("from-attr");
    });
  });
});
