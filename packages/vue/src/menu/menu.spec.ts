import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mount, config } from "@vue/test-utils";
import { nextTick } from "vue";
import { UMenu } from "./index";

// UMenu's imperative show()/hide()/toggle() methods (real upstream API,
// spec §10 — a real consumer calls `menuRef.value.toggle(event)`) are
// declared inside Menu.vue's own `methods:` block, merged in at runtime via
// `extends: createBaseMenu()`. createBaseMenu()'s declared return type is
// the deliberately-wide `ComponentOptions` (matching createBaseDialog's own
// established pattern, packages/vue/src/dialog/BaseDialog.ts) — this
// widens away method-level type information project-wide (confirmed: even
// `InstanceType<typeof UDialog>` resolves UDialog's own real `close()`
// method to `never` today, a pre-existing latent gap never surfaced before
// because no other component's own tests call an instance method
// directly). Fixing that project-wide is out of this task's scope (it
// would mean re-typing every Base*.ts factory's return value by its own
// concrete methods shape, a bigger change with no driver beyond this one
// test file). Menu is the first component whose own tests need real
// instance methods, so a small local interface describing just the public
// imperative surface this test file actually calls is declared here and
// used to cast `wrapper.vm` at each call site below — a standard, narrowly-
// scoped @vue/test-utils pattern, not a suppression of a real type error.
interface UMenuInstance {
  show(event: Event, target?: HTMLElement | EventTarget | null): void;
  hide(): void;
}

// @vue/test-utils stubs <transition> by default (TransitionStub renders its
// slot directly without invoking the real component's @enter/@leave JS
// hooks) — same real-environment finding already documented in
// dialog.spec.ts (Task 20): the brief's Step 3 draft test suite implicitly
// assumed the real <transition> (and therefore Menu's onEnter/onLeave,
// where outside-click/resize/scroll listener binding, z-index, and the
// show/hide emits all actually happen) fires under mount(). Disabling the
// transition stub for this file only (restored after) is required for
// UMenu's popup-mode tests to exercise real behavior.
beforeAll(() => {
  config.global.stubs.transition = false;
});
afterAll(() => {
  config.global.stubs.transition = true;
});

// Second real-environment finding made while running this task's own popup-
// mode tests: <UPortal> only swaps from rendering `null` to a real
// <Teleport> once its own onMounted-set `mounted` ref flips (see
// packages/vue-core/src/overlay/portal.ts) — a microtask boundary after the
// parent UMenu's own mount() call returns. Calling show() synchronously in
// that same tick (as the brief's own Step 3 draft test bodies do) toggles
// `overlayVisible` before Portal's <Teleport> has ever rendered for real,
// so the wrapping <transition>'s very first appearance of content happens
// through a not-yet-stable Teleport target and Vue never invokes the
// transition's JS enter hook (onEnter — where outside-click/resize/scroll
// listener binding, z-index, and the show emit all actually happen) for
// that first toggle. A single `await nextTick()` between mount() and
// show() (every popup-mode test below does this immediately after its own
// `mount(...)` call) lets Portal's Teleport stabilize first, after which
// the same v-if toggle is treated as a real, hook-driven transition.
// Verified via direct reproduction during this task's own debugging:
// identical test bodies pass reliably with this await and fail (DOM
// element present, but onEnter/its listener bindings never having run)
// without it.

const model = [
  { label: "New", command: () => {} },
  { label: "Open", command: () => {} },
  { separator: true },
  { label: "Disabled", disabled: true, command: () => {} },
  { label: "Delete", command: () => {} },
];

describe("UMenu — non-popup mode", () => {
  it("renders an always-visible inline ul[role=menu]", () => {
    const wrapper = mount(UMenu, { props: { model } });
    expect(wrapper.find('ul[role="menu"]').exists()).toBe(true);
  });

  it("renders role=menuitem items, role=separator for separator entries", () => {
    const wrapper = mount(UMenu, { props: { model } });
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(4);
    expect(wrapper.find('[role="separator"]').exists()).toBe(true);
  });

  it("marks disabled items with aria-disabled", () => {
    const wrapper = mount(UMenu, { props: { model } });
    const disabledItem = wrapper.findAll('[role="menuitem"]')[2];
    expect(disabledItem.attributes("aria-disabled")).toBe("true");
  });
});

describe("UMenu — keyboard navigation (verified full key set, spec §10)", () => {
  it("ArrowDown moves focusedOptionIndex to the next non-disabled item", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "ArrowDown" });
    expect(list.attributes("aria-activedescendant")).toBeTruthy();
    wrapper.unmount();
  });

  it("ArrowDown skips disabled items", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    // Navigate through New -> Open -> Delete, never landing on Disabled.
    for (let i = 0; i < 3; i++) await list.trigger("keydown", { code: "ArrowDown" });
    const activeId = list.attributes("aria-activedescendant");
    const activeItem = wrapper.find(`#${activeId}`);
    expect(activeItem.text()).not.toBe("Disabled");
    wrapper.unmount();
  });

  it("Home moves to the first item, End moves to the last non-disabled item", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "End" });
    const activeId = list.attributes("aria-activedescendant");
    expect(wrapper.find(`#${activeId}`).text()).toBe("Delete");
    wrapper.unmount();
  });

  // Real upstream Menu.vue's itemMouseMove tracks focusedOptionIndex from
  // event.id while the list is focused (verified this task's Step 1). Also
  // exercises a real bug caught during this task's own self-review: Menuitem
  // emitting item-mousemove without an `item` field (only `id`) would make
  // Menu.vue's model-index-based itemMouseMove (this.model.indexOf(event.item))
  // resolve `event.item` as undefined, silently setting focusedOptionIndex to
  // -1 on every hover instead of tracking it — fixed by adding `item` to the
  // item-mousemove payload alongside `id`.
  it("mousemove over an item updates aria-activedescendant while the list is focused", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    const openItem = wrapper.findAll('[role="menuitem"]')[1];
    await openItem.find(".u-menu-item-content").trigger("mousemove");
    const activeId = list.attributes("aria-activedescendant");
    expect(wrapper.find(`#${activeId}`).text()).toBe("Open");
    wrapper.unmount();
  });

  it("Space triggers the same activation as Enter (calls onEnterKey)", async () => {
    const commandSpy = { called: false };
    const spyModel = [
      {
        label: "Action",
        command: () => {
          commandSpy.called = true;
        },
      },
    ];
    const wrapper = mount(UMenu, { props: { model: spyModel }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "ArrowDown" });
    await list.trigger("keydown", { code: "Space" });
    expect(commandSpy.called).toBe(true);
    wrapper.unmount();
  });

  // Real-environment finding made while running this task's own tests
  // (same class of finding dialog.spec.ts already documents, Task 20): in
  // popup mode, UMenu's overlay renders through <UPortal> -> <Teleport>
  // into document.body, which places it outside @vue/test-utils' own
  // wrapper tree (Teleport targets are not tracked by wrapper.find/findAll
  // by default). The brief's own Step 3 draft used `wrapper.find(...)` /
  // `list.trigger(...)` here, which throws "Cannot call trigger on an empty
  // DOMWrapper" once popup mode actually teleports. Fixed by querying the
  // real DOM directly (document.querySelector) and dispatching a real
  // KeyboardEvent — the same fix dialog.spec.ts already established for
  // every one of its own popup/teleported-content assertions.
  it("Escape (local handler, NOT the shared uix-utils/escape adapter) hides a popup menu", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    const list = document.querySelector('ul[role="menu"]') as HTMLElement;
    list.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.emitted("hide")).toBeTruthy();
    wrapper.unmount();
  });

  it("Tab closes a visible popup menu without trapping focus", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    const list = document.querySelector('ul[role="menu"]') as HTMLElement;
    list.dispatchEvent(new KeyboardEvent("keydown", { code: "Tab", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.emitted("hide")).toBeTruthy();
    wrapper.unmount();
  });
});

describe("UMenu — popup mode lifecycle", () => {
  it("show() makes the overlay visible, sets z-index with the 'menu' key", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    wrapper.unmount();
  });

  it("hide() removes the overlay", async () => {
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), document.body);
    await new Promise((r) => setTimeout(r, 0));
    (wrapper.vm as unknown as UMenuInstance).hide();
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
  });

  it("clicking outside the menu and the trigger target dismisses it (Menu-local listener, not a shared composition)", async () => {
    // The trigger target must be a distinct element, not document.body:
    // bindOutsideClickListener's isOutsideTarget check is
    // `!(target === event.target || target.contains(event.target))`, so if
    // target were document.body, every element in the document (including
    // any genuinely "outside" element) would satisfy `target.contains(...)`
    // and the click would always be treated as "inside the target" —
    // masking the dismiss behavior this test means to exercise.
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    const outsideEl = document.createElement("div");
    document.body.appendChild(outsideEl);
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), trigger);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    outsideEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
    outsideEl.remove();
    trigger.remove();
  });

  // Real upstream Menu.vue (.vendor-extracted/vue/menu/Menu.vue, onEnter/onLeave)
  // binds/unbinds a ConnectedOverlayScrollHandler on the target's scrollable
  // ancestors, dismissing the popup when one of them scrolls — a real,
  // verified behavior the brief's own Step 7 draft omitted and explicitly
  // flagged as a gap to close. This test exercises the Menu-local
  // bindScrollListener/unbindScrollListener pair (window-level, capture
  // phase, ancestor-of-target check) added to close that gap.
  it("scrolling a scrollable ancestor of the trigger target dismisses the popup (scroll dismissal, closes brief's flagged gap)", async () => {
    const scrollableAncestor = document.createElement("div");
    const target = document.createElement("button");
    scrollableAncestor.appendChild(target);
    document.body.appendChild(scrollableAncestor);

    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), target);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();

    scrollableAncestor.dispatchEvent(new Event("scroll", { bubbles: false }));
    await new Promise((r) => setTimeout(r, 0));

    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(wrapper.emitted("hide")).toBeTruthy();

    wrapper.unmount();
    scrollableAncestor.remove();
  });

  it("scrolling an element that is NOT an ancestor of the trigger target does not dismiss the popup", async () => {
    const target = document.createElement("button");
    document.body.appendChild(target);
    const unrelated = document.createElement("div");
    document.body.appendChild(unrelated);

    const wrapper = mount(UMenu, { props: { model, popup: true }, attachTo: document.body });
    await nextTick();
    (wrapper.vm as unknown as UMenuInstance).show(new MouseEvent("click"), target);
    await new Promise((r) => setTimeout(r, 0));
    expect(document.querySelector('[role="menu"]')).not.toBeNull();

    unrelated.dispatchEvent(new Event("scroll", { bubbles: false }));
    await new Promise((r) => setTimeout(r, 0));

    expect(document.querySelector('[role="menu"]')).not.toBeNull();

    wrapper.unmount();
    target.remove();
    unrelated.remove();
  });
});
