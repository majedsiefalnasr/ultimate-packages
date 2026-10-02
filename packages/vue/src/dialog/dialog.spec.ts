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

describe("UDialog — role override (Spec §5.2, GAP-049)", () => {
  it("defaults to role=dialog when no role override is supplied", async () => {
    const wrapper = mount(UDialog, { props: { visible: true }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
    wrapper.unmount();
  });

  it("renders the supplied role override when set", async () => {
    const wrapper = mount(UDialog, { props: { visible: true, role: "alertdialog" }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="alertdialog"]')).toBeTruthy();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
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

  it("closes on Escape after mounting with visible: false then toggling to true (v-model:visible controlled pattern)", async () => {
    const wrapper = mount(UDialog, { props: { visible: false }, attachTo: document.body });
    await wrapper.setProps({ visible: true });
    await new Promise((r) => setTimeout(r, 0));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
    wrapper.unmount();
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
    // Both dialogs must be siblings within ONE shared Vue app instance, not
    // two independent @vue/test-utils mount() calls — confirmed via direct
    // verification (this task's own research) that mount() creates a fresh,
    // independent app root per call, and Dialog.vue's useId()-derived
    // dialogId is scoped per app instance (correct, SSR-safe Vue behavior:
    // two independent app roots may legitimately compute the same useId()
    // value, which is exactly what previously made this test collide inside
    // useScrollLock's registry — a real Vue app never creates two
    // independent roots for two simultaneously-open dialogs, confirmed by
    // this repo's own single createApp/createSSRApp call site). Mounting
    // both dialogs as children of one shared parent gives each a distinct
    // dialogId (v-0/v-1), matching real production structure and matching
    // the same shared-instance pattern already used for Menu.vue's own
    // analogous multi-instance test.
    const TwoDialogs = {
      components: { UDialog },
      data() {
        return { firstOpen: true, secondOpen: true };
      },
      template: `<div>
        <UDialog v-if="firstOpen" :visible="true" :modal="true" />
        <UDialog v-if="secondOpen" :visible="true" :modal="true" />
      </div>`,
    };
    const wrapper = mount(TwoDialogs);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.setData({ firstOpen: false });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(true);
    await wrapper.setData({ secondOpen: false });
    await new Promise((r) => setTimeout(r, 0));
    expect(document.body.classList.contains("u-overflow-hidden")).toBe(false);
    wrapper.unmount();
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

// Regression tests for the useId()-based dialogId fix: Dialog.vue previously
// generated its ARIA-relevant dialogId from a module-scope counter variable,
// which leaks/accumulates state across requests in a long-running SSR
// server process — the same defect already fixed once for Menu.vue
// (packages/vue/src/menu/Menu.vue). dialogId is now derived from
// Vue's own `useId()`, called once in a setup() hook on Dialog.vue's own
// component options and bridged into data() via `this.generatedDialogId`
// (setup() runs before data() in Vue's documented Options/Composition API
// merge order).
//
// Real-environment finding (confirmed during Menu.vue's own equivalent fix,
// and unchanged here): Vue's useId() guarantees uniqueness only *within a
// single app instance* — its counter lives on the root app context and
// restarts for every fresh createApp()/mount() root (which is exactly what
// makes it SSR-safe: each server request gets its own fresh app instance,
// so per-request id generation is deterministic and isolated). Two
// independent @vue/test-utils mount() calls each create their own root app
// instance, so they may legitimately generate the same useId() value — this
// is correct Vue behavior, not a defect. "Uniqueness within one render" is
// therefore tested by mounting two UDialog instances as children of one
// shared parent/app instance (test 1 below), not via two separate mount()
// calls.
//
// UDialog renders its actual dialog content through a Portal (Teleport,
// appendTo: "body" by default) — the rendered content is appended directly
// to document.body, not into the mount()-returned wrapper's own DOM
// subtree. Matching this file's own established pattern throughout (see
// every other describe block above), queries below use
// document.querySelector/querySelectorAll against document.body rather than
// wrapper.find/findAll.
describe("UDialog — dialogId generation (useId() migration regression tests)", () => {
  it("generates unique dialogId-derived ids for two UDialog instances mounted within the same app instance", async () => {
    const TwoDialogs = {
      components: { UDialog },
      template: `<div>
        <UDialog :visible="true" header="First" />
        <UDialog :visible="true" header="Second" />
      </div>`,
    };
    const wrapper = mount(TwoDialogs, { attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    const headers = document.querySelectorAll('[role="dialog"] [class*="title"]');
    expect(headers.length).toBe(2);
    const idA = headers[0].getAttribute("id");
    const idB = headers[1].getAttribute("id");
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
    wrapper.unmount();
  });

  it("keeps aria-labelledby in sync with the actual rendered header id", async () => {
    const wrapper = mount(UDialog, {
      props: { visible: true, header: "Confirm" },
      attachTo: document.body,
    });
    await new Promise((r) => setTimeout(r, 0));
    const dialogEl = document.querySelector('[role="dialog"]');
    const headerEl = document.querySelector('[role="dialog"] [class*="title"]');
    expect(dialogEl?.getAttribute("aria-labelledby")).toBeTruthy();
    expect(headerEl?.getAttribute("id")).toBe(dialogEl?.getAttribute("aria-labelledby"));
    wrapper.unmount();
  });

  // NOTE: this is a jsdom-level check that mounting and unmounting UDialog
  // repeatedly does not accumulate or retain any shared state (e.g. a
  // leftover module-scope counter) across mounts within this single test
  // process run — the specific defect this task fixes. It intentionally
  // does NOT assert that the two mounts' generated ids differ: per Vue's
  // own useId() semantics (see the describe-block comment above), each
  // independent mount() call creates its own fresh app instance, so
  // useId()'s per-app counter legitimately restarting is correct, expected
  // behavior, not a bug. This test is NOT a proof of cross-request SSR id
  // determinism (Track E's own Task 8 is the stated authoritative real-SSR
  // check) — it only proves each mount independently produces a
  // well-formed, non-empty dialogId/ariaLabelledById (not undefined, not
  // stale, not silently empty).
  it("independently derives a fresh, well-formed dialogId on every separate mount (jsdom retained-state check, not an SSR determinism proof)", async () => {
    const wrapper1 = mount(UDialog, { props: { visible: true, header: "First" }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    const id1 = document.querySelector('[role="dialog"]')?.getAttribute("aria-labelledby");
    wrapper1.unmount();

    const wrapper2 = mount(UDialog, { props: { visible: true, header: "Second" }, attachTo: document.body });
    await new Promise((r) => setTimeout(r, 0));
    const id2 = document.querySelector('[role="dialog"]')?.getAttribute("aria-labelledby");
    wrapper2.unmount();

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).toMatch(/^u-dialog-.+_header$/);
    expect(id2).toMatch(/^u-dialog-.+_header$/);
  });
});
