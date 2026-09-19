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
});
