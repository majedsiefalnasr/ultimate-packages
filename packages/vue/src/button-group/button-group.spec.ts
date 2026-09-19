import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UButton } from "../button";
import { UButtonGroup } from "./index";

describe("UButtonGroup", () => {
  it("renders projected UButton children", () => {
    const wrapper = mount({
      components: { UButtonGroup, UButton },
      template: `
        <UButtonGroup>
          <UButton label="One" />
          <UButton label="Two" />
          <UButton label="Three" />
        </UButtonGroup>
      `,
    });
    expect(wrapper.findAll(".u-button")).toHaveLength(3);
  });

  it("renders as a group role element with the root class", () => {
    const wrapper = mount(UButtonGroup);
    expect(wrapper.attributes("role")).toBe("group");
    expect(wrapper.classes()).toContain("u-button-group");
  });
});
