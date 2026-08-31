import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createBaseEditableHolder } from "./base-editable-holder";

describe("createBaseEditableHolder", () => {
  it("controlled mode: reflects the modelValue prop, does not manage its own state", async () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount(
      {
        extends: Base,
        template: `<div>{{ dValue }}</div>`,
        props: { modelValue: { type: null, default: undefined } },
      },
      { props: { modelValue: "a" } }
    );
    expect(wrapper.text()).toBe("a");
    expect(wrapper.vm.controlled).toBe(true);
    await wrapper.setProps({ modelValue: "b" });
    expect(wrapper.text()).toBe("b");
  });

  it("uncontrolled mode: initializes from defaultValue when modelValue is absent", () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount(
      {
        extends: Base,
        template: `<div>{{ dValue }}</div>`,
        props: { defaultValue: { type: null, default: undefined } },
      },
      { props: { defaultValue: "initial" } }
    );
    expect(wrapper.text()).toBe("initial");
    expect(wrapper.vm.controlled).toBe(false);
  });

  it("writeValue emits update:modelValue and value-change when controlled", () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount(
      {
        extends: Base,
        template: `<div />`,
        props: { modelValue: { type: null, default: undefined } },
      },
      { props: { modelValue: "a" } }
    );
    (wrapper.vm as unknown as { writeValue: (v: unknown) => void }).writeValue("b");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    expect(wrapper.emitted("value-change")?.[0]).toEqual(["b"]);
  });

  it("writeValue emits only value-change (not update:modelValue) when uncontrolled", () => {
    const Base = createBaseEditableHolder();
    const wrapper = mount(
      {
        extends: Base,
        template: `<div />`,
        props: { defaultValue: { type: null, default: undefined } },
      },
      { props: { defaultValue: "a" } }
    );
    (wrapper.vm as unknown as { writeValue: (v: unknown) => void }).writeValue("b");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("value-change")?.[0]).toEqual(["b"]);
  });
});
