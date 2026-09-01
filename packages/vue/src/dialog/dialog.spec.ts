import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mount, config } from "@vue/test-utils";
import { UDialog } from "./index";

// @vue/test-utils stubs <transition> by default (TransitionStub renders its
// slot directly without invoking the real component's @enter/@leave JS
// hooks) — real-environment finding made while running this task's own
// tests: the brief's draft test suite implicitly assumed the real
// <transition> (and therefore this component's onEnter/onLeave, where
// scroll-lock/z-index/show/hide/mask-dismiss all actually happen) fires
// under mount(). Disabling the transition stub for this file only (restored
// after) is required for UDialog's tests to exercise real behavior — same
// class of fix as every prior task's real-signature-verification findings.
beforeAll(() => {
  config.global.stubs.transition = false;
});
afterAll(() => {
  config.global.stubs.transition = true;
});

describe("UDialog — controlled contract (v-model:visible)", () => {
  it("renders nothing when visible is false", () => {
    const wrapper = mount(UDialog, { props: { visible: false } });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    wrapper.unmount();
  });

  it("renders when visible is true, with role=dialog/aria-modal/aria-labelledby", async () => {
    const wrapper = mount(UDialog, {
      props: { visible: true, header: "Confirm" },
      attachTo: document.body,
    });
    await new Promise((r) => setTimeout(r, 0));
    const dialogEl = document.querySelector('[role="dialog"]');
    expect(dialogEl).not.toBeNull();
    expect(dialogEl?.getAttribute("aria-modal")).toBe("true");
    expect(dialogEl?.getAttribute("aria-labelledby")).toBeTruthy();
    wrapper.unmount();
  });

  it("emits update:visible(false) when the close button is clicked", async () => {
    const wrapper = mount(UDialog, { props: { visible: true, closable: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    const closeButton = document.querySelector('[role="dialog"] button');
    (closeButton as HTMLElement)?.click();
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
  });
});

describe("UDialog — feature boundary (spec §15, regression against silent scope creep)", () => {
  it("exposes no draggable prop, renders no drag handle", () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    expect(wrapper.props()).not.toHaveProperty("draggable");
    wrapper.unmount();
  });

  it("exposes no maximizable prop, renders no maximize-toggle UI", async () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.props()).not.toHaveProperty("maximizable");
    expect(document.querySelector('[role="dialog"] [class*="maximize"]')).toBeNull();
    wrapper.unmount();
  });
});

describe("UDialog — Escape (via the shared uix-utils/escape adapter, spec §11)", () => {
  it("closes on Escape when closeOnEscape is true (default)", async () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
  });

  it("the topmost of two simultaneously-open dialogs closes first on Escape (priority stacking)", async () => {
    const first = mount(UDialog, { props: { visible: true } });
    const second = mount(UDialog, { props: { visible: true } });
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(second.emitted("update:visible")?.[0]).toEqual([false]);
    expect(first.emitted("update:visible")).toBeUndefined();
    first.unmount();
    second.unmount();
  });
});

describe("UDialog — scroll locking (spec §16)", () => {
  it("blocks body scroll when a modal dialog is visible", async () => {
    const wrapper = mount(UDialog, { props: { visible: true, modal: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    wrapper.unmount();
  });

  it("two simultaneously-open modal dialogs: scroll stays blocked until both close", async () => {
    const first = mount(UDialog, { props: { visible: true, modal: true } });
    const second = mount(UDialog, { props: { visible: true, modal: true } });
    await new Promise((r) => setTimeout(r, 0));
    first.unmount();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    second.unmount();
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
  });
});

describe("UDialog — focus", () => {
  it("captures the previously-focused element and restores focus to it on close", async () => {
    const trigger = document.createElement("button");
    trigger.id = "trigger";
    document.body.appendChild(trigger);
    trigger.focus();

    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.setProps({ visible: false });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.activeElement?.id).toBe("trigger");

    wrapper.unmount();
    trigger.remove();
  });
});

describe("UDialog — mask click", () => {
  it("dismisses on a mask click when dismissableMask and modal are both true", async () => {
    const wrapper = mount(UDialog, {
      props: { visible: true, modal: true, dismissableMask: true },
      attachTo: document.body,
    });
    await new Promise((r) => setTimeout(r, 0));
    const mask = document.querySelector(".u-dialog-mask");
    mask?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    mask?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
  });
});
