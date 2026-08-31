import { describe, it, expect, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { tooltipDirective } from "./tooltip";

describe("v-tooltip", () => {
  afterEach(() => {
    document.querySelectorAll('[role="tooltip"]').forEach((el) => el.remove());
  });

  function mountTarget(bindingExpr: string) {
    return mount(
      { template: `<button ${bindingExpr}>Target</button>` },
      { global: { directives: { tooltip: tooltipDirective } }, attachTo: document.body }
    );
  }

  it("renders a role=tooltip panel with the content on show", async () => {
    const wrapper = mountTarget(`v-tooltip="'Save changes'"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toBe("Save changes");
  });

  it("uses textContent (createTextNode), never innerHTML, by default (security regression, spec §25)", async () => {
    const wrapper = mountTarget(`v-tooltip="'<img src=x onerror=alert(1)>'"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel?.querySelector("img")).toBeNull();
    expect(panel?.textContent).toBe("<img src=x onerror=alert(1)>");
  });

  it("only renders raw HTML when the caller explicitly opts in via escape: false", async () => {
    const wrapper = mountTarget(`v-tooltip="{ value: '<b>bold</b>', escape: false }"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    const panel = document.querySelector('[role="tooltip"]');
    expect(panel?.querySelector("b")).not.toBeNull();
  });

  it("adds aria-describedby on the target while visible (intentional deviation, spec §9)", async () => {
    const wrapper = mountTarget(`v-tooltip="'Save changes'"`);
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("button").attributes("aria-describedby")).toBeTruthy();
  });

  it("removes only the owned aria-describedby id on hide, preserving pre-existing values", async () => {
    const wrapper = mount(
      { template: `<button aria-describedby="other-id" v-tooltip="'Save changes'">Target</button>` },
      { global: { directives: { tooltip: tooltipDirective } }, attachTo: document.body }
    );
    await wrapper.find("button").trigger("mouseenter");
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("button").attributes("aria-describedby")).toContain("other-id");
    await wrapper.find("button").trigger("mouseleave");
    await new Promise((r) => setTimeout(r, 300)); // hideDelay default
    expect(wrapper.find("button").attributes("aria-describedby")).toBe("other-id");
  });
});
