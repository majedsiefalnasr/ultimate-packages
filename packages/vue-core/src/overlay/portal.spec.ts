import { describe, it, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { Portal } from "./portal";

describe("Portal", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("teleports its slot content to document.body by default", async () => {
    mount({
      components: { Portal },
      template: `<Portal><div id="portal-content">hi</div></Portal>`,
    }, { attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.body.querySelector("#portal-content")).not.toBeNull();
  });

  it("renders inline instead of teleporting when disabled", async () => {
    const wrapper = mount({
      components: { Portal },
      template: `<div id="host"><Portal disabled><div id="portal-content">hi</div></Portal></div>`,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("#host #portal-content").exists()).toBe(true);
  });

  it("renders inline when appendTo is 'self'", async () => {
    const wrapper = mount({
      components: { Portal },
      template: `<div id="host"><Portal appendTo="self"><div id="portal-content">hi</div></Portal></div>`,
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("#host #portal-content").exists()).toBe(true);
  });
});
