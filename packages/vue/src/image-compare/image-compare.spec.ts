import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UImageCompare } from "./index";

describe("UImageCompare", () => {
  it("renders left and right slot content", () => {
    const wrapper = mount(UImageCompare, {
      slots: {
        left: '<img alt="left" src="left.png" />',
        right: '<img alt="right" src="right.png" />',
      },
    });
    const images = wrapper.findAll("img");
    expect(images).toHaveLength(2);
    expect(images[0].attributes("alt")).toBe("left");
    expect(images[1].attributes("alt")).toBe("right");
  });

  it("renders a range slider defaulting to 50", () => {
    const wrapper = mount(UImageCompare);
    const slider = wrapper.find("input[type='range']");
    expect(slider.exists()).toBe(true);
    expect((slider.element as HTMLInputElement).value).toBe("50");
  });

  it("updates the right wrapper's clip-path when the slider moves", async () => {
    const wrapper = mount(UImageCompare, {
      slots: {
        left: '<img src="left.png" />',
        right: '<img src="right.png" />',
      },
    });
    const slider = wrapper.find("input[type='range']");
    (slider.element as HTMLInputElement).value = "30";
    await slider.trigger("input");
    const rightWrapper = wrapper.find("span");
    expect(rightWrapper.attributes("style")).toContain(
      "clip-path: polygon(0 0, 30% 0, 30% 100%, 0 100%)"
    );
  });

  it("sets aria attributes from props", () => {
    const wrapper = mount(UImageCompare, { props: { ariaLabel: "Compare", tabindex: 0 } });
    const root = wrapper.find(".u-image-compare");
    expect(root.attributes("aria-label")).toBe("Compare");
    expect(root.attributes("tabindex")).toBe("0");
  });
});
