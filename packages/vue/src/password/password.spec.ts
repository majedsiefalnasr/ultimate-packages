import { afterEach, describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UPassword } from "./index";

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
});
