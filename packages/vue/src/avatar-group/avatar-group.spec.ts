import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./index";

describe("UAvatarGroup", () => {
  it("renders projected UAvatar children", () => {
    const wrapper = mount(
      {
        components: { UAvatarGroup, UAvatar },
        template: `
          <UAvatarGroup>
            <UAvatar label="A" />
            <UAvatar label="B" />
            <UAvatar label="C" />
          </UAvatarGroup>
        `,
      }
    );
    expect(wrapper.findAll(".u-avatar")).toHaveLength(3);
  });

  it("applies the root class for overlap layout styling", () => {
    const wrapper = mount(UAvatarGroup);
    expect(wrapper.classes()).toContain("u-avatar-group");
  });
});
