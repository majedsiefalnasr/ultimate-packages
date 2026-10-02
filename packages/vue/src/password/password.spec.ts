import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UPassword } from "./index";
import { passwordStyleModule } from "./password-style";

describe("UPassword", () => {
  // UPortal teleports the strength-meter overlay directly to document.body
  // (same pattern documented in dialog.spec.ts) — clean up between tests.
  afterEach(() => {
    document.querySelectorAll(".u-password-overlay").forEach((el) => el.remove());
  });
  it("renders a native password input", () => {
    const wrapper = mount(UPassword, { props: { modelValue: "" } });
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("password");
  });

  it("v-model — emits update:modelValue on input", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "" } });
    await wrapper.find("input").setValue("secret1");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["secret1"]);
  });

  it("toggles unmasked state via the mask icon, switching input type to text", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "secret", toggleMask: true } });
    expect(wrapper.find("input").attributes("type")).toBe("password");
    await wrapper.find('[aria-label="Show Password"]').trigger("click");
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  it("shows the strength-meter overlay on focus when feedback is enabled", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "" } });
    await wrapper.find("input").trigger("focus");
    expect(document.querySelector(".u-password-overlay")).not.toBeNull();
    await wrapper.find("input").trigger("blur");
    expect(document.querySelector(".u-password-overlay")).toBeNull();
  });

  it("classifies a strong password and updates the meter width/label", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "Str0ngPass!" } });
    await wrapper.find("input").trigger("focus");
    const label = document.querySelector(".u-password-meter-label") as HTMLElement | null;
    expect(label?.style.width).toBe("100%");
    expect(document.querySelector(".u-password-meter-text")?.textContent).toBe("Strong");
  });

  it("classifies a weak password", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "abc" } });
    await wrapper.find("input").trigger("focus");
    expect(document.querySelector(".u-password-meter-text")?.textContent).toBe("Weak");
  });

  it("hides the overlay on Escape keyup", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "" } });
    await wrapper.find("input").trigger("focus");
    expect(document.querySelector(".u-password-overlay")).not.toBeNull();
    await wrapper.find("input").trigger("keyup", { code: "Escape" });
    expect(document.querySelector(".u-password-overlay")).toBeNull();
  });

  it("does not show the overlay when feedback is disabled", async () => {
    const wrapper = mount(UPassword, { props: { modelValue: "", feedback: false } });
    await wrapper.find("input").trigger("focus");
    expect(document.querySelector(".u-password-overlay")).toBeNull();
  });
  describe("disclosure ARIA (GAP-061)", () => {
    const overlay = () => document.querySelector(".u-password-overlay") as HTMLElement | null;

    it("binds aria-haspopup to feedback and starts collapsed", () => {
      const on = mount(UPassword, { props: { modelValue: "" } });
      expect(on.find("input").attributes("aria-haspopup")).toBe("true");
      expect(on.find("input").attributes("aria-expanded")).toBe("false");
      expect(on.find("input").attributes("aria-controls")).toBeUndefined();
      const off = mount(UPassword, { props: { modelValue: "", feedback: false } });
      expect(off.find("input").attributes("aria-haspopup")).toBe("false");
      expect(off.find("input").attributes("aria-expanded")).toBe("false");
    });

    it("exposes the overlay id via aria-controls while open and drops it on blur", async () => {
      const wrapper = mount(UPassword, { props: { modelValue: "" } });
      const input = wrapper.find("input");
      await input.trigger("focus");
      expect(input.attributes("aria-expanded")).toBe("true");
      const el = overlay();
      expect(el?.id).toBeTruthy();
      expect(input.attributes("aria-controls")).toBe(el?.id);
      expect(el?.getAttribute("role")).toBe("dialog");
      expect(el?.getAttribute("aria-live")).toBe("polite");
      await input.trigger("blur");
      expect(input.attributes("aria-expanded")).toBe("false");
      expect(input.attributes("aria-controls")).toBeUndefined();
    });

    it("gives each instance a distinct overlay id", async () => {
      // useId() is unique per app; separate mount() calls are separate apps, so host both in one.
      const wrapper = mount(
        { components: { UPassword }, template: "<div><UPassword /><UPassword /></div>" },
        { attachTo: document.body }
      );
      const inputs = wrapper.findAll("input");
      await inputs[0].trigger("focus");
      await inputs[1].trigger("focus");
      const [a, b] = inputs.map((i) => i.attributes("aria-controls"));
      expect(a).toBeTruthy();
      expect(a).not.toBe(b);
      wrapper.unmount();
    });

    it("renders an always-present hidden live span tracking infoText", async () => {
      const wrapper = mount(UPassword, { props: { modelValue: "" } });
      const span = wrapper.find("span.u-password-hidden-accessible");
      expect(span.exists()).toBe(true);
      expect(span.attributes("aria-live")).toBe("polite");
      expect(span.text()).toBe("Enter a password");
      await wrapper.find("input").trigger("focus");
      await wrapper.find("input").setValue("abc");
      expect(wrapper.find("span.u-password-hidden-accessible").text()).toBe("Weak");
    });

    it("keeps disclosure ARIA off the mask toggle icons", () => {
      const wrapper = mount(UPassword, { props: { modelValue: "", toggleMask: true } });
      const icon = wrapper.find('[aria-label="Show Password"]');
      for (const attr of ["aria-expanded", "aria-controls", "aria-haspopup"]) {
        expect(icon.attributes(attr)).toBeUndefined();
      }
    });

    it("defines the visually-hidden rule in the Password style module", () => {
      const css = passwordStyleModule.css.replace(/\s+/g, " ");
      expect(css).toContain(".u-password-hidden-accessible {");
      for (const decl of [
        "clip: rect(0 0 0 0)",
        "height: 1px",
        "width: 1px",
        "margin: -1px",
        "overflow: hidden",
        "position: absolute",
      ]) {
        expect(css).toContain(decl);
      }
    });
  });
  describe("ariaLabelledby (GAP-076)", () => {
    it("binds ariaLabelledby to the input's aria-labelledby", () => {
      const wrapper = mount(UPassword, { props: { modelValue: "", ariaLabelledby: "pw-label" } });
      expect(wrapper.find("input").attributes("aria-labelledby")).toBe("pw-label");
    });

    it("renders no aria-labelledby attribute when the prop is not set", () => {
      const wrapper = mount(UPassword, { props: { modelValue: "" } });
      expect(wrapper.find("input").attributes()).not.toHaveProperty("aria-labelledby");
    });

    it("keeps aria-label working alongside aria-labelledby", () => {
      const wrapper = mount(UPassword, {
        props: { modelValue: "", ariaLabel: "Password", ariaLabelledby: "pw-label" },
      });
      const input = wrapper.find("input");
      expect(input.attributes("aria-label")).toBe("Password");
      expect(input.attributes("aria-labelledby")).toBe("pw-label");
    });
  });
});
