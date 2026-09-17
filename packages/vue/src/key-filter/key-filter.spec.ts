import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UKeyFilter } from "./key-filter";

function keypress(input: HTMLInputElement, key: string): boolean {
  const event = new KeyboardEvent("keypress", { key, cancelable: true });
  input.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("UKeyFilter", () => {
  it("blocks a non-matching keypress for the 'int' preset", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="'int'" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(keypress(input, "a")).toBe(true);
  });

  it("allows a matching keypress for the 'int' preset", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="'int'" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(keypress(input, "5")).toBe(false);
  });

  it("allows the leading '-' for the 'int' preset", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="'int'" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(keypress(input, "-")).toBe(false);
  });

  it("blocks a non-numeric character for the 'pint' preset", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="'pint'" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(keypress(input, "-")).toBe(true);
    expect(keypress(input, "3")).toBe(false);
  });

  it("accepts a custom RegExp pattern", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="pattern" />`, data: () => ({ pattern: /^[a-c]*$/ }) },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(keypress(input, "a")).toBe(false);
    expect(keypress(input, "z")).toBe(true);
  });

  it("blocks pasting text containing an invalid character", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="'int'" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    const event = new Event("paste", { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, "clipboardData", { value: { getData: () => "12a3" } });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("allows pasting text that fully matches the pattern", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="'int'" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    const event = new Event("paste", { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(event, "clipboardData", { value: { getData: () => "123" } });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not block keys when validateOnly is enabled", () => {
    const wrapper = mount(
      { template: `<input v-key-filter="{ pattern: 'int', validateOnly: true }" />` },
      { global: { directives: { "key-filter": UKeyFilter } } }
    );
    const input = wrapper.find("input").element as HTMLInputElement;
    expect(keypress(input, "a")).toBe(false);
  });
});
