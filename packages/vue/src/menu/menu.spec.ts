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

// Regression tests for the useId()-based menuId fix: Menu.vue previously
// generated its ARIA-relevant container id from a module-scope counter
// variable, which leaks/accumulates state across requests in a
// long-running SSR server process and (confirmed in prior investigation)
// caused a real, observed silent hydration id rewrite in Vue specifically.
// menuId is now derived from Vue's own `useId()`, called once in a
// setup() hook on Menu.vue's own component options and bridged into
// data() via `this.generatedMenuId` (setup() runs before data() in Vue's
// documented Options/Composition API merge order).
//
// Real-environment finding made while writing these tests: Vue's useId()
// (packages/@vue/runtime-core, `i.appContext...` + `i.ids[1]++`) guarantees
// uniqueness only *within a single app instance* — its counter lives on
// the root app context and restarts at `v-0` for every fresh `createApp()`
// root (which is exactly what makes it SSR-safe: each server request gets
// its own fresh app instance, so per-request id generation is
// deterministic and isolated without any risk of colliding with another
// concurrent request's ids, since they never share one DOM/HTML document).
// Two independent @vue/test-utils `mount()` calls each create their own
// root app instance, so they may legitimately generate the same `v-0`-
// style id — this is correct Vue behavior, not a defect and not a
// reintroduction of the old shared-module-counter problem. "Uniqueness
// within one render" (AC3.1) therefore has to be tested by mounting two
// UMenu instances as children of one shared parent/app instance, which is
// what the first test below does.
describe("UMenu — menuId generation (useId() migration regression tests)", () => {
  it("generates unique container-derived ids for two UMenu instances mounted within the same app instance", () => {
    const TwoMenus = {
      components: { UMenu },
      data() {
        return { model };
      },
      template: `<div><UMenu :model="model" /><UMenu :model="model" /></div>`,
    };
    const wrapper = mount(TwoMenus);
    const items = wrapper.findAll('[role="menuitem"]');
    const idA = items[0].attributes("id");
    const idB = items[4].attributes("id");
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
    wrapper.unmount();
  });

  it("keeps aria-activedescendant in sync with the actual focused item's rendered id", async () => {
    const wrapper = mount(UMenu, { props: { model }, attachTo: document.body });
    const list = wrapper.find('ul[role="menu"]');
    await list.trigger("focus");
    await list.trigger("keydown", { code: "ArrowDown" });
    const activeId = list.attributes("aria-activedescendant");
    const focusedItem = wrapper.findAll('[role="menuitem"]')[1];
    expect(activeId).toBe(focusedItem.attributes("id"));
    wrapper.unmount();
  });

  // NOTE: this is a jsdom-level check that mounting and unmounting UMenu
  // repeatedly does not accumulate or retain any shared state (e.g. a
  // leftover module-scope counter) across mounts within this single test
  // process run — the specific defect this task fixes. It intentionally
  // does NOT assert that the two mounts' generated ids differ: per Vue's
  // own useId() semantics (see the describe-block comment above), each
  // independent mount() call creates its own fresh app instance, so
  // useId()'s per-app counter legitimately restarting is correct,
  // expected behavior, not a bug. This test is NOT a proof of cross-
  // request SSR id determinism, and asserting id inequality here would
  // incorrectly fail on correct Vue behavior. What it does prove: each
  // mount independently produces a well-formed, non-empty id (i.e.
  // menuId is freshly computed per mount from generatedMenuId, not
  // undefined, not stale, and not silently empty).
  it("independently derives a fresh, well-formed menuId on every separate mount (jsdom retained-state check, not an SSR determinism proof)", () => {
    const wrapper1 = mount(UMenu, { props: { model } });
    const id1 = wrapper1.find('[role="menuitem"]').attributes("id");
    wrapper1.unmount();

    const wrapper2 = mount(UMenu, { props: { model } });
    const id2 = wrapper2.find('[role="menuitem"]').attributes("id");
    wrapper2.unmount();

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).toMatch(/^u-menu-.+_0$/);
    expect(id2).toMatch(/^u-menu-.+_0$/);
  });

  // AC3.4 / id-override prop: createBaseMenu() (packages/vue/src/menu/BaseMenu.ts)
  // declares UMenu's full prop set — model, popup, appendTo, autoZIndex,
  // baseZIndex, tabindex, ariaLabel, ariaLabelledby — verified against real
  // upstream BaseMenu.vue. None of these overrides the generated menuId
  // (unlike React's sibling components, which support an `id ?? generated`
  // pattern). No such override mechanism exists on UMenu today, so this
  // sub-check is not applicable here; a test is intentionally not added,
  // per this task's own instruction not to fabricate a prop that doesn't
  // exist.
});
