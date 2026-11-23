import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./index";
import { avatarGroupStyleModule } from "./avatar-group-style";

describe("UAvatarGroup", () => {
  it("renders projected UAvatar children", () => {
    const wrapper = mount({
      components: { UAvatarGroup, UAvatar },
      template: `
          <UAvatarGroup>
            <UAvatar label="A" />
            <UAvatar label="B" />
            <UAvatar label="C" />
          </UAvatarGroup>
        `,
    });
    expect(wrapper.findAll(".u-avatar")).toHaveLength(3);
  });

  it("applies the root class for overlap layout styling", () => {
    const wrapper = mount(UAvatarGroup);
    expect(wrapper.classes()).toContain("u-avatar-group");
  });

  it("overlaps with logical, tokenized, size-specific offsets", () => {
    const { css } = avatarGroupStyleModule;
    expect(css).toContain("margin-inline-start: dt('avatar.group.offset')");
    expect(css).toContain("margin-inline-start: dt('avatar.lg.group.offset')");
    expect(css).toContain("margin-inline-start: dt('avatar.xl.group.offset')");
    expect(css).not.toContain("margin-left");
  });

  describe("pass-through and unstyled", () => {
    it("applies root pt attributes, fall-through attributes and keeps the root class", () => {
      const wrapper = mount(UAvatarGroup, {
        props: { pt: { root: { id: "group-root", class: "extra-root" } } },
        attrs: { "data-x": "1" },
      });
      expect(wrapper.attributes("id")).toBe("group-root");
      expect(wrapper.attributes("data-x")).toBe("1");
      expect(wrapper.attributes("data-pc-name")).toBe("avatargroup");
      expect(wrapper.classes()).toContain("u-avatar-group");
      expect(wrapper.classes()).toContain("extra-root");
    });

    it("unstyled drops the Ultimate classes", () => {
      const wrapper = mount(UAvatarGroup, {
        props: { unstyled: true, pt: { root: { class: "extra-root" } } },
      });
      expect(wrapper.classes()).not.toContain("u-avatar-group");
      expect(wrapper.classes()).toContain("extra-root");
    });
  });
});
