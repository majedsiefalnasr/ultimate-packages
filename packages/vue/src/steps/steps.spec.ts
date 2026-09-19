import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { USteps } from "./index";

const items = [{ label: "Personal" }, { label: "Payment" }, { label: "Confirmation" }];

describe("USteps", () => {
  it("renders one list item per model entry, in order", () => {
    const wrapper = mount(USteps, { props: { model: items } });
    const labels = wrapper.findAll(".u-steps-item-label").map((el) => el.text());
    expect(labels).toEqual(["Personal", "Payment", "Confirmation"]);
  });

  it('marks the item at activeStep aria-current="step"', () => {
    const wrapper = mount(USteps, { props: { model: items, activeStep: 1 } });
    const listItems = wrapper.findAll("li");
    expect(listItems[0].attributes("aria-current")).toBeUndefined();
    expect(listItems[1].attributes("aria-current")).toBe("step");
  });

  it("renders 1-based step numbers", () => {
    const wrapper = mount(USteps, { props: { model: items } });
    const numbers = wrapper.findAll(".u-steps-item-number").map((el) => el.text());
    expect(numbers).toEqual(["1", "2", "3"]);
  });

  it("when readonly, non-active items are disabled and clicking them does not emit select", async () => {
    const wrapper = mount(USteps, { props: { model: items } });
    const secondLink = wrapper.findAll("a")[1];
    expect(secondLink.attributes("aria-disabled")).toBe("true");
    await secondLink.trigger("click");
    expect(wrapper.emitted("select")).toBeUndefined();
  });

  it("when not readonly, clicking a non-active item emits select with the item and index", async () => {
    const wrapper = mount(USteps, { props: { model: items, readonly: false } });
    const secondLink = wrapper.findAll("a")[1];
    await secondLink.trigger("click");
    const emitted = wrapper.emitted<[{ index: number }]>("select");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0].index).toBe(1);
  });

  it("invokes item.command on click when not readonly", async () => {
    let called = false;
    const model = [{ label: "One" }, { label: "Two", command: () => (called = true) }];
    const wrapper = mount(USteps, { props: { model, readonly: false } });
    const secondLink = wrapper.findAll("a")[1];
    await secondLink.trigger("click");
    expect(called).toBe(true);
  });

  it("skips items with visible: false", () => {
    const model = [{ label: "One" }, { label: "Hidden", visible: false }, { label: "Three" }];
    const wrapper = mount(USteps, { props: { model } });
    const labels = wrapper.findAll(".u-steps-item-label").map((el) => el.text());
    expect(labels).toEqual(["One", "Three"]);
  });
});
