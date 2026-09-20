import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UProgressSpinner } from "./index";

describe("UProgressSpinner", () => {
  it("renders an svg with role=progressbar and aria-busy", () => {
    const wrapper = mount(UProgressSpinner);
    const root = wrapper.find(".u-progress-spinner");
    expect(root.attributes("role")).toBe("progressbar");
    expect(root.attributes("aria-busy")).toBe("true");
    expect(wrapper.find("svg.u-progress-spinner-spin").exists()).toBe(true);
  });

  it("applies a custom stroke width and fill to the circle", () => {
    const wrapper = mount(UProgressSpinner, { props: { strokeWidth: "4", fill: "red" } });
    const circle = wrapper.find("circle");
    expect(circle.attributes("stroke-width")).toBe("4");
    expect(circle.attributes("fill")).toBe("red");
  });

  it("applies a custom animation duration to the svg style", () => {
    const wrapper = mount(UProgressSpinner, { props: { animationDuration: "4s" } });
    expect(wrapper.find("svg").attributes("style")).toContain("animation-duration: 4s");
  });

  it("sets aria-label when ariaLabel is provided", () => {
    const wrapper = mount(UProgressSpinner, { props: { ariaLabel: "Loading" } });
    expect(wrapper.find(".u-progress-spinner").attributes("aria-label")).toBe("Loading");
  });
});
