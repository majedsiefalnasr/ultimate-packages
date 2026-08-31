import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { SpinnerIcon, TimesIcon, WindowMaximizeIcon, WindowMinimizeIcon, CheckIcon } from "./index";

describe.each([
  ["SpinnerIcon", SpinnerIcon],
  ["TimesIcon", TimesIcon],
  ["WindowMaximizeIcon", WindowMaximizeIcon],
  ["WindowMinimizeIcon", WindowMinimizeIcon],
  ["CheckIcon", CheckIcon],
])("%s", (_name, Icon) => {
  it("renders an svg with role=img", () => {
    const wrapper = mount(Icon);
    expect(wrapper.find("svg").attributes("role")).toBe("img");
  });

  it("applies aria-label from the label prop", () => {
    const wrapper = mount(Icon, { props: { label: "test label" } });
    expect(wrapper.find("svg").attributes("aria-label")).toBe("test label");
  });

  it("applies the class prop to the root svg", () => {
    const wrapper = mount(Icon, { props: { class: "u-custom-icon-class" } });
    expect(wrapper.find("svg").classes()).toContain("u-custom-icon-class");
  });
});
