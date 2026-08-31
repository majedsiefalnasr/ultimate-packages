import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createBaseInput } from "./base-input";

describe("createBaseInput", () => {
  it("resolvedFluid() reflects the fluid prop directly when set", () => {
    const Base = createBaseInput();
    const wrapper = mount(
      { extends: Base, template: `<div>{{ resolvedFluid }}</div>`, props: { fluid: { default: null } } },
      { props: { fluid: true } }
    );
    expect(wrapper.text()).toBe("true");
  });

  it("resolvedFluid() falls back to the injected pcFluid ambient context when unset", () => {
    const Base = createBaseInput();
    const wrapper = mount(
      { extends: Base, template: `<div>{{ resolvedFluid }}</div>` },
      { global: { provide: { pcFluid: true } } }
    );
    expect(wrapper.text()).toBe("true");
  });

  it("resolvedVariant() reflects the variant prop when set", () => {
    const Base = createBaseInput();
    const wrapper = mount(
      { extends: Base, template: `<div>{{ resolvedVariant }}</div>`, props: { variant: { default: null } } },
      { props: { variant: "filled" } }
    );
    expect(wrapper.text()).toBe("filled");
  });
});
