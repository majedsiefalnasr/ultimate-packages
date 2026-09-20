import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UInputChips } from "./index";

describe("UInputChips — controlled (v-model)", () => {
  it("renders one option per modelValue entry plus the text input", () => {
    const wrapper = mount(UInputChips, { props: { modelValue: ["a", "b"] } });
    expect(wrapper.findAll('[role="option"]')).toHaveLength(2);
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("adds a tag on Enter and emits update:modelValue", async () => {
    const wrapper = mount(UInputChips, { props: { modelValue: [] } });
    const input = wrapper.find("input");
    await input.setValue("tag1");
    await input.trigger("keydown", { code: "Enter" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["tag1"]]);
    expect(wrapper.emitted("add")).toBeTruthy();
  });

  it("does not add an empty/whitespace-only tag", async () => {
    const wrapper = mount(UInputChips, { props: { modelValue: [] } });
    const input = wrapper.find("input");
    await input.setValue("   ");
    await input.trigger("keydown", { code: "Enter" });
    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("removes the last tag on Backspace when the input is empty", async () => {
    const wrapper = mount(UInputChips, { props: { modelValue: ["a", "b"] } });
    const input = wrapper.find("input");
    await input.trigger("keydown", { code: "Backspace" });
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a"]]);
  });

  it("removes a specific tag via its remove button", async () => {
    const wrapper = mount(UInputChips, { props: { modelValue: ["a", "b", "c"] } });
    const removeButtons = wrapper.findAll("button");
    await removeButtons[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["a", "c"]]);
  });

  it("does not render remove buttons when disabled", () => {
    const wrapper = mount(UInputChips, { props: { modelValue: ["a"], disabled: true } });
    expect(wrapper.findAll("button")).toHaveLength(0);
  });

  it("disables the input once max tags are reached", () => {
    const wrapper = mount(UInputChips, { props: { modelValue: ["a", "b"], max: 2 } });
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  it("adds a tag on blur when addOnBlur is set", async () => {
    const wrapper = mount(UInputChips, { props: { modelValue: [], addOnBlur: true } });
    const input = wrapper.find("input");
    await input.setValue("tag1");
    await input.trigger("blur");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["tag1"]]);
  });

  it("applies the u-input-chips root class", () => {
    const wrapper = mount(UInputChips, { props: { modelValue: [] } });
    expect(wrapper.classes()).toContain("u-input-chips");
  });
});
