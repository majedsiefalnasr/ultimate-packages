# Phase C Batch 2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build React `UDataScroller` and Vue `UInlineMessage` — the two canonical capability/framework realizations the Phase C Parity Reconciliation pass confirmed eligible — as original, framework-native, zero-Prime-runtime-dependency components matching Ultimate's established architecture.

**Architecture:** Both are bare display/data components with no CVA/model-holder participation. `UDataScroller` (React) composes `useComponentBase` and manages its own incremental-load state independently of `UScroller` (confirmed no composition dependency in the Spec). `UInlineMessage` (Vue) extends `createBaseComponent` directly, following the exact structural precedent already established by the sibling `UMessage` component, simplified to InlineMessage's smaller, corrected (always-visible, no-timer) real surface.

**Tech Stack:** React 18 (`react-core`'s `useComponentBase`), Vue 3 Options API (`vue-core`'s `createBaseComponent`), Vitest + Testing Library (React) / Vue Test Utils (Vue), Storybook.

## Global Constraints

- **No Prime runtime dependency** (ADR-004) — both components are original reimplementations; `node scripts/provenance/validate-dependency-ceiling.mjs` must report zero violations after each task.
- **No passthrough (`pt`/`ptOptions`) surface** on either component (Spec §7, §10).
- **`UDataScroller` must not compose or depend on `UScroller`** — confirmed architecturally unrelated in the Spec (§3.1); build the incremental-load mechanism independently.
- **`UInlineMessage` must implement the corrected real behavior**: always-visible, no auto-dismiss timer, no `sticky`/`life` props. Real PrimeVue source's `sticky`/`life` references in `mounted()` are dead code (never-declared props, template never gates on `visible`) — this is binding, not optional (Spec §3.2, §4 item 9).
- **No new foundation-tier work** — both components reuse only already-Built, already-proven tiers (`useComponentBase` for React; `createBaseComponent` for Vue). No new base-class tier or shared package export is authorized.
- **Real source citation required** in each component's own doc comment, matching every existing Ultimate component's convention (see `UTag`/`UMessage` for the expected style).
- **File patterns** — React: `{name}.tsx`, `{name}-style.ts`, `{name}.spec.tsx`, `{name}.stories.tsx`, `index.ts`. Vue: `{Name}.vue`, `Base{Name}.ts`, `{name}-style.ts`, `{name}.spec.ts`, `{name}.stories.ts`, `index.ts`.
- **Branch:** `feature/phase-c-batch-2-migration` (already created, spec committed there).

---

## Task 1: React `UDataScroller`

**Files:**
- Create: `packages/react/src/data-scroller/data-scroller.tsx`
- Create: `packages/react/src/data-scroller/data-scroller-style.ts`
- Create: `packages/react/src/data-scroller/data-scroller.spec.tsx`
- Create: `packages/react/src/data-scroller/data-scroller.stories.tsx`
- Create: `packages/react/src/data-scroller/index.ts`
- Modify: `packages/react/src/index.ts` — add `export * from "./data-scroller";`. **This file's export order is not strictly alphabetical** (it groups related capabilities) — read the actual current file before choosing an insertion point (Step 1).
- Modify: `packages/react/package.json` — add a `"./data-scroller"` subpath entry to `exports`, matching the `"./date-picker"`/`"./deferred-content"` entries' exact shape

**Interfaces:**
- Produces: `UDataScroller` (React function component, `React.forwardRef<HTMLDivElement, UDataScrollerProps<T>>`), `UDataScrollerProps<T>` (exported interface), an imperative handle exposing `load(): void` and `reset(): void` via `React.useImperativeHandle`.
- Consumes: `useComponentBase` from `@ultimate/react-core` (already Built — no new interface).

- [ ] **Step 1: Read the whole barrel file to find the correct insertion point**

Run: `cat -n packages/react/src/index.ts`

This file's export order is **not alphabetical** — it groups related/adjacent capabilities (confirmed by direct inspection: `date-picker`, `dialog`, `drawer`, `dock`, `divider`, `deferred-content` appear in that non-alphabetical sequence). Do not assume alphabetical order. Since DataScroller is a Data-family capability with no direct sibling grouping in this file, insert its export line in a locally sensible spot near other single-entry/ungrouped capabilities (read the full file to judge this), or simply at the end of the export list if no clear grouping fits — correctness of the barrel does not depend on position, only on the line being present exactly once.

- [ ] **Step 2: Write the failing style module**

Create `packages/react/src/data-scroller/data-scroller-style.ts`:

```typescript
/**
 * Ultimate-owned adaptation of PrimeReact's `DataScroller` style (real
 * source: `components/lib/datascroller/DataScrollerBase.js`), shaped to
 * match `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/datascroller` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tagStyleModule`).
 */
const css = /*css*/ `
.u-data-scroller { display: block; }
.u-data-scroller-inline { overflow-y: auto; }
.u-data-scroller-content { display: flex; flex-direction: column; }
.u-data-scroller-empty-message { padding: 0.75rem; text-align: center; color: var(--u-data-scroller-empty-color, #6b7280); }
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    ["u-data-scroller u-component", params?.["inline"] ? "u-data-scroller-inline" : ""].filter(Boolean).join(" "),
  content: "u-data-scroller-content",
  emptyMessage: "u-data-scroller-empty-message",
};

/** `useComponentBase`-shaped style module for `UDataScroller`. */
export const dataScrollerStyleModule = { css, classes };
```

- [ ] **Step 3: Write the failing test**

Create `packages/react/src/data-scroller/data-scroller.spec.tsx`:

```tsx
import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UDataScroller, type UDataScrollerRef } from "./data-scroller";

const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

describe("UDataScroller", () => {
  it("renders only the first `rows` items initially", () => {
    render(<UDataScroller value={items} rows={5} itemTemplate={(item) => <div key={item as string}>{item as string}</div>} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
  });

  it("renders the empty message when value is empty", () => {
    render(<UDataScroller value={[]} rows={5} itemTemplate={(item) => <div key={item as string}>{item as string}</div>} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("loads the next window when the internal content container scrolls near the bottom (inline mode)", () => {
    const { container } = render(
      <UDataScroller value={items} rows={5} inline scrollHeight="200px" itemTemplate={(item) => <div key={item as string}>{item as string}</div>} />
    );
    const root = container.querySelector(".u-data-scroller") as HTMLElement;
    Object.defineProperty(root, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(root, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(root, "scrollTop", { value: 850, configurable: true });
    fireEvent.scroll(root);
    expect(screen.getByText("Item 10")).toBeInTheDocument();
  });

  it("does not bind a scroll listener when loader is true, and load() can be called imperatively", () => {
    const ref = React.createRef<UDataScrollerRef>();
    render(
      <UDataScroller
        ref={ref}
        value={items}
        rows={5}
        loader
        itemTemplate={(item) => <div key={item as string}>{item as string}</div>}
      />
    );
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
    act(() => {
      ref.current?.load();
    });
    expect(screen.getByText("Item 6")).toBeInTheDocument();
  });

  it("calls onLazyLoad instead of internal slicing when lazy is true", () => {
    const onLazyLoad = vi.fn();
    render(
      <UDataScroller
        value={items.slice(0, 5)}
        rows={5}
        lazy
        onLazyLoad={onLazyLoad}
        itemTemplate={(item) => <div key={item as string}>{item as string}</div>}
      />
    );
    expect(onLazyLoad).toHaveBeenCalledWith({ first: 0, rows: 5 });
  });

  it("reset() clears accumulated state and reloads from the start", () => {
    const ref = React.createRef<UDataScrollerRef>();
    render(
      <UDataScroller
        ref={ref}
        value={items}
        rows={5}
        loader
        itemTemplate={(item) => <div key={item as string}>{item as string}</div>}
      />
    );
    act(() => {
      ref.current?.load();
    });
    expect(screen.getByText("Item 6")).toBeInTheDocument();
    act(() => {
      ref.current?.reset();
    });
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `cd packages/react && npx vitest run data-scroller`
Expected: FAIL — `data-scroller.tsx` does not exist yet (module not found).

- [ ] **Step 5: Write the implementation**

Create `packages/react/src/data-scroller/data-scroller.tsx`:

```tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { dataScrollerStyleModule } from "./data-scroller-style";

export interface UDataScrollerLazyLoadEvent {
  first: number;
  rows: number;
}

export interface UDataScrollerRef {
  load: () => void;
  reset: () => void;
}

export interface UDataScrollerProps<T = unknown> {
  value?: T[] | null;
  rows?: number;
  inline?: boolean;
  lazy?: boolean;
  loader?: boolean;
  buffer?: number;
  scrollHeight?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  onLazyLoad?: (event: UDataScrollerLazyLoadEvent) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `DataScroller` component (real
 * source: `components/lib/datascroller/DataScroller.js`/
 * `DataScrollerBase.js`). Confirmed against real source: extends the bare
 * `ComponentBase` tier (no CVA) — a data-display component, never a form
 * control. Real source's own mechanism is plain incremental array-slicing
 * plus a scroll-position listener — **deliberately independent of
 * `UScroller`**, whose real windowed-virtualization approach
 * (`itemSize`/`numToleratedItems`-based) is architecturally unrelated (Spec
 * §3.1's explicit finding). Loaded items accumulate and remain rendered —
 * no virtualization, no item recycling — matching real upstream
 * DataScroller's actual behavior, not a scope cut.
 *
 * `loader: true` disables the internal scroll listener; real source has no
 * built-in "Load More" button UI for this mode, only the hook — this port
 * matches that exactly, exposing `load()`/`reset()` via a ref for the host
 * application to wire to its own control.
 *
 * Deliberately excludes real source's `pt`/`ptOptions` passthrough system —
 * same "smaller surface than upstream" precedent as every sibling
 * component.
 */
export const UDataScroller = React.forwardRef<UDataScrollerRef, UDataScrollerProps>(function UDataScroller(
  { value, rows = 0, inline = false, lazy = false, loader = false, buffer = 0.9, scrollHeight, header, footer, itemTemplate, emptyMessage, onLazyLoad, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "data-scroller", styleModule: dataScrollerStyleModule });
  const [windowEnd, setWindowEnd] = React.useState(0);
  const hasLoadedInitial = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isLazy = lazy;
  const total = value?.length ?? 0;
  const dataToRender = isLazy ? (value ?? []) : (value ?? []).slice(0, windowEnd);

  // `load()` advances the render window by `rows` each call. The first call
  // (from the mount effect below, matching real source's own
  // `useMountEffect(() => load())`) fills the initial window (0..rows)
  // rather than skipping past it — subsequent calls (from scroll or the
  // exposed imperative `load()`) advance further, matching real source's
  // own single-`load()`-does-both-jobs shape.
  const load = React.useCallback(() => {
    const first = hasLoadedInitial.current ? windowEnd : 0;
    const nextWindowEnd = first + rows;
    hasLoadedInitial.current = true;
    if (isLazy) {
      onLazyLoad?.({ first, rows });
      setWindowEnd(nextWindowEnd);
    } else {
      if (first < total) setWindowEnd(Math.min(nextWindowEnd, total));
    }
  }, [windowEnd, rows, isLazy, onLazyLoad, total]);

  const reset = React.useCallback(() => {
    setWindowEnd(0);
    hasLoadedInitial.current = false;
    load();
  }, [load]);

  React.useImperativeHandle(ref, () => ({ load, reset }), [load, reset]);

  // Mount-time load, matching real source's own `useMountEffect(() => load())`
  // — reuses the same `load()` used everywhere else, rather than duplicating
  // the lazy-mode branch separately.
  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (loader) return;
    const target: HTMLElement | Window = inline ? (containerRef.current ?? window) : window;
    const handleScroll = () => {
      // Matches real source's own threshold formula
      // (`scrollTop >= scrollHeight * buffer - viewportHeight`), not a
      // rescaled fraction-of-total formula — kept algebraically identical
      // to real `DataScroller.js` so `buffer`'s meaning matches upstream
      // exactly.
      if (inline && containerRef.current) {
        const el = containerRef.current;
        if (el.scrollTop >= el.scrollHeight * buffer - el.clientHeight) load();
      } else {
        const doc = document.documentElement;
        if (window.scrollY >= doc.scrollHeight * buffer - window.innerHeight) load();
      }
    };
    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, [loader, inline, buffer, load]);

  const isEmpty = total === 0;

  return (
    <div
      ref={containerRef}
      className={[cx("root", { inline }), className].filter(Boolean).join(" ")}
      style={inline && scrollHeight ? { maxHeight: scrollHeight, overflowY: "auto" } : undefined}
    >
      {header}
      {isEmpty ? (
        <div className={cx("emptyMessage")}>{emptyMessage ?? "No records found"}</div>
      ) : (
        <div className={cx("content")}>{dataToRender.map((item, index) => itemTemplate(item, index))}</div>
      )}
      {footer}
    </div>
  );
});
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd packages/react && npx vitest run data-scroller`
Expected: PASS, 6/6 tests.

- [ ] **Step 7: Write the barrel and stories files**

Create `packages/react/src/data-scroller/index.ts`:

```typescript
export { UDataScroller } from "./data-scroller";
export type { UDataScrollerProps, UDataScrollerRef, UDataScrollerLazyLoadEvent } from "./data-scroller";
```

Create `packages/react/src/data-scroller/data-scroller.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDataScroller } from "./data-scroller";

const items = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);

const meta: Meta<typeof UDataScroller> = {
  title: "React/DataScroller",
  component: UDataScroller,
};

export default meta;
type Story = StoryObj<typeof UDataScroller>;

export const Default: Story = {
  args: {
    value: items,
    rows: 5,
    itemTemplate: (item) => <div key={item as string} style={{ padding: "0.5rem" }}>{item as string}</div>,
  },
};

export const Inline: Story = {
  args: {
    value: items,
    rows: 5,
    inline: true,
    scrollHeight: "250px",
    itemTemplate: (item) => <div key={item as string} style={{ padding: "0.5rem" }}>{item as string}</div>,
  },
};
```

- [ ] **Step 8: Wire the barrel export — read exact neighbors first**

Run: `grep -n "^export \* from \"\.\/da" packages/react/src/index.ts`

Add the line `export * from "./data-scroller";` at the insertion point chosen from Step 1's full-file read — do not guess a position from partial context.

- [ ] **Step 9: Wire package.json — read exact neighbor entry first**

Run: `grep -n -A3 "\"./date-picker\"" packages/react/package.json`

Add, immediately before that block:

```json
    "./data-scroller": {
      "types": "./dist/data-scroller/index.d.mts",
      "import": "./dist/data-scroller/index.mjs",
      "default": "./dist/data-scroller/index.mjs"
    },
```

- [ ] **Step 10: Run the full React suite to confirm no regression**

Run: `cd packages/react && npx vitest run`
Expected: all tests pass, including the 6 new `data-scroller` tests, with no failures anywhere else.

- [ ] **Step 11: Typecheck**

Run: `cd packages/react && npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 12: Commit**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
git add packages/react/src/data-scroller packages/react/src/index.ts packages/react/package.json
git commit -m "feat(react): add DataScroller (Phase C Batch 2)"
```

---

## Task 2: Vue `UInlineMessage`

**Files:**
- Create: `packages/vue/src/inline-message/InlineMessage.vue`
- Create: `packages/vue/src/inline-message/BaseInlineMessage.ts`
- Create: `packages/vue/src/inline-message/inline-message-style.ts`
- Create: `packages/vue/src/inline-message/inline-message.spec.ts`
- Create: `packages/vue/src/inline-message/inline-message.stories.ts`
- Create: `packages/vue/src/inline-message/index.ts`
- Modify: `packages/vue/src/index.ts` — add `export * from "./inline-message";`. **This file's export order is not strictly alphabetical** (it groups related capabilities, matching React's own barrel convention) — read the actual current file before choosing an insertion point (Step 1).
- Modify: `packages/vue/package.json` — add a `"./inline-message"` subpath entry to `exports`, matching the `"./inplace"`/`"./input-chips"` entries' exact shape

**Interfaces:**
- Produces: `UInlineMessage` (Vue component, default export from `InlineMessage.vue`), `createBaseInlineMessage` (factory function, default export... actually named export, matching `createBaseMessage`'s own convention) from `BaseInlineMessage.ts`.
- Consumes: `createBaseComponent` from `@ultimate/vue-core` (already Built — no new interface).

- [ ] **Step 1: Read the whole barrel file to find the correct insertion point**

Run: `cat -n packages/vue/src/index.ts`

Vue's barrel follows the same non-alphabetical, grouping-based convention as React's — do not assume alphabetical order. Insert InlineMessage's export line in a locally sensible spot (near `message` if that grouping exists, or at the end of the export list if no clear grouping fits) — correctness depends only on the line being present exactly once, not its position.

- [ ] **Step 2: Write the failing base factory**

Create `packages/vue/src/inline-message/BaseInlineMessage.ts`:

```typescript
import { createBaseComponent } from "@ultimate/vue-core";
import { inlineMessageStyleModule } from "./inline-message-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — InlineMessage is a
// status/display component, not a form control, matching real extracted
// PrimeVue's own BaseInlineMessage.vue's `extends: BaseComponent`. Props
// verified against real source: only `severity`/`icon` are declared.
//
// Real source's `InlineMessage.vue` `mounted()` hook references
// `this.sticky`/`this.life`, but NEITHER is declared as a prop or data
// field anywhere in real `BaseInlineMessage.vue` or `InlineMessage.vue` —
// both are always `undefined` at runtime, and the real template never
// gates on `visible` at all (unlike `Message.vue`'s own `v-if="visible"`).
// This is confirmed dead code with no observable effect in the actual
// shipped PrimeVue component, not a working feature — this port
// deliberately does NOT implement a `sticky`/`life`/auto-dismiss
// mechanism, since doing so would port behavior real InlineMessage does
// not actually have.
export function createBaseInlineMessage(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "inline-message", styleModule: inlineMessageStyleModule }),
    props: {
      severity: { type: String, default: "error" },
      icon: { type: String, default: undefined },
    },
  };
}
```

- [ ] **Step 3: Write the failing style module**

Create `packages/vue/src/inline-message/inline-message-style.ts`:

```typescript
/**
 * Ultimate-owned adaptation of PrimeVue's `InlineMessageStyle` (see
 * `.vendor-extracted/vue/inlinemessage/style/InlineMessageStyle.js`),
 * shaped to match `vue-core`'s `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/inlinemessage` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-inline-message { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 6px; }
.u-inline-message-icon { flex-shrink: 0; }
.u-inline-message-text { font-size: 0.875rem; }
.u-inline-message-info { background: var(--u-inline-message-info-bg, #dbeafe); color: var(--u-inline-message-info-color, #1e3a8a); }
.u-inline-message-success { background: var(--u-inline-message-success-bg, #dcfce7); color: var(--u-inline-message-success-color, #14532d); }
.u-inline-message-warn { background: var(--u-inline-message-warn-bg, #fef9c3); color: var(--u-inline-message-warn-color, #713f12); }
.u-inline-message-error { background: var(--u-inline-message-error-bg, #fee2e2); color: var(--u-inline-message-error-color, #7f1d1d); }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-inline-message u-component",
    `u-inline-message-${(params?.["severity"] as string) ?? "error"}`,
  ],
  icon: "u-inline-message-icon",
  text: "u-inline-message-text",
};

/** `createBaseComponent`-shaped style module for `UInlineMessage`. */
export const inlineMessageStyleModule = { css, classes };
```

- [ ] **Step 4: Write the failing test**

Create `packages/vue/src/inline-message/inline-message.spec.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UInlineMessage } from "./index";

describe("UInlineMessage", () => {
  it("renders default slot content with default error severity", () => {
    const wrapper = mount(UInlineMessage, { slots: { default: "Something went wrong" } });
    expect(wrapper.find(".u-inline-message").text()).toContain("Something went wrong");
    expect(wrapper.find(".u-inline-message").classes()).toContain("u-inline-message-error");
  });

  it("applies the severity class", () => {
    const wrapper = mount(UInlineMessage, { props: { severity: "success" }, slots: { default: "Saved" } });
    expect(wrapper.find(".u-inline-message").classes()).toContain("u-inline-message-success");
  });

  it("renders a default severity icon when no icon is provided", () => {
    const wrapper = mount(UInlineMessage, { props: { severity: "warn" }, slots: { default: "Careful" } });
    expect(wrapper.find(".pi-exclamation-triangle").exists()).toBe(true);
  });

  it("renders a custom icon override when provided", () => {
    const wrapper = mount(UInlineMessage, { props: { icon: "pi pi-star" }, slots: { default: "Custom" } });
    expect(wrapper.find(".pi-star").exists()).toBe(true);
  });

  it("has no close button — InlineMessage has no dismiss mechanism", () => {
    const wrapper = mount(UInlineMessage, { slots: { default: "Hi" } });
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("remains rendered indefinitely — real source's sticky/life mechanism is dead code and is not ported", async () => {
    vi.useFakeTimers();
    const wrapper = mount(UInlineMessage, { slots: { default: "Still here" } });
    expect(wrapper.find(".u-inline-message").exists()).toBe(true);
    vi.advanceTimersByTime(10000);
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".u-inline-message").exists()).toBe(true);
    vi.useRealTimers();
  });

  it("has role=alert for accessibility", () => {
    const wrapper = mount(UInlineMessage, { slots: { default: "Alert text" } });
    expect(wrapper.find(".u-inline-message").attributes("role")).toBe("alert");
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `cd packages/vue && npx vitest run inline-message`
Expected: FAIL — `InlineMessage.vue`/`index.ts` do not exist yet.

- [ ] **Step 6: Write the component implementation**

Create `packages/vue/src/inline-message/InlineMessage.vue`:

```vue
<template>
  <div :class="cx('root', { severity })" role="alert" aria-live="polite" :data-severity="severity">
    <span v-if="resolvedIcon" :class="cx('icon')">
      <i :class="resolvedIcon" aria-hidden="true"></i>
    </span>
    <span :class="cx('text')">
      <slot></slot>
    </span>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `InlineMessage` component (see
// .vendor-extracted/vue/inlinemessage/InlineMessage.vue). Confirmed
// against real source: extends the bare `BaseComponent` tier (no
// v-model/writeValue) — a status/display component (severity-colored
// inline alert), never a form control.
//
// Genuinely distinct from Ultimate's own already-Built `UMessage`: real
// `Message` has `closable`/`life`/`closeIcon`/`closeButtonProps`/`size`/
// `variant` props, a working `v-if="visible"` gate, a real close button,
// and a `<transition>` wrapper. Real `InlineMessage` has none of this —
// only `severity`/`icon`, always-visible, no dismiss mechanism of any kind
// (real or intended). Real source's own `mounted()` hook references
// `this.sticky`/`this.life`, but neither is declared as a prop/data field
// anywhere, and the template never gates on `visible` — this is dead code
// in the actual shipped component, not a working feature, and is
// deliberately NOT ported here (see BaseInlineMessage.ts's own doc
// comment for the full evidence).
import { createBaseInlineMessage } from "./BaseInlineMessage";

const DEFAULT_ICON_CLASS = {
  info: "pi pi-info-circle",
  success: "pi pi-check",
  warn: "pi pi-exclamation-triangle",
  error: "pi pi-times-circle",
};

export default {
  name: "UInlineMessage",
  extends: createBaseInlineMessage(),
  inheritAttrs: false,
  computed: {
    resolvedIcon() {
      return this.icon ?? DEFAULT_ICON_CLASS[this.severity] ?? null;
    },
  },
};
</script>
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd packages/vue && npx vitest run inline-message`
Expected: PASS, 7/7 tests.

- [ ] **Step 8: Write the barrel and stories files**

Create `packages/vue/src/inline-message/index.ts`:

```typescript
export { default as UInlineMessage } from "./InlineMessage.vue";
export { createBaseInlineMessage } from "./BaseInlineMessage";
```

Create `packages/vue/src/inline-message/inline-message.stories.ts`:

```typescript
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInlineMessage } from "./index";

const meta: Meta<typeof UInlineMessage> = {
  title: "Vue/InlineMessage",
  component: UInlineMessage,
};

export default meta;
type Story = StoryObj<typeof UInlineMessage>;

export const Default: Story = {
  args: { severity: "error" },
  render: (args) => ({
    components: { UInlineMessage },
    setup: () => ({ args }),
    template: `<UInlineMessage v-bind="args">Something went wrong.</UInlineMessage>`,
  }),
};

export const Success: Story = {
  args: { severity: "success" },
  render: (args) => ({
    components: { UInlineMessage },
    setup: () => ({ args }),
    template: `<UInlineMessage v-bind="args">Saved successfully.</UInlineMessage>`,
  }),
};
```

- [ ] **Step 9: Wire the barrel export — read exact neighbors first**

Run: `grep -n "^export \* from \"\.\/in" packages/vue/src/index.ts`

Add the line `export * from "./inline-message";` at the insertion point chosen from Step 1's full-file read — do not guess a position from partial context.

- [ ] **Step 10: Wire package.json — read exact neighbor entry first**

Run: `grep -n -A3 "\"./inplace\"" packages/vue/package.json`

This file's `exports` map is also not alphabetically ordered. Add the new entry immediately adjacent to the `"./inplace"` block found above (before or after, whichever reads more naturally against the surrounding entries):

```json
    "./inline-message": {
      "types": "./dist/inline-message/index.d.mts",
      "import": "./dist/inline-message/index.mjs",
      "default": "./dist/inline-message/index.mjs"
    },
```

- [ ] **Step 11: Run the full Vue suite to confirm no regression**

Run: `cd packages/vue && npx vitest run`
Expected: all tests pass, including the 7 new `inline-message` tests, with no failures anywhere else.

- [ ] **Step 12: Typecheck**

Run: `cd packages/vue && npx vue-tsc --noEmit`
Expected: zero errors.

- [ ] **Step 13: Commit**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
git add packages/vue/src/inline-message packages/vue/src/index.ts packages/vue/package.json
git commit -m "feat(vue): add InlineMessage (Phase C Batch 2)"
```

---

## Task 3: Batch 2 closeout — verification, documentation, and status update

**Files:**
- Modify: `docs/architecture/REACT_COMPONENT_STATUS.md` — move DataScroller's entry from "Eligible candidate"/"Batch 2 Specification created" to "Built"
- Modify: `docs/architecture/VUE_COMPONENT_STATUS.md` — move InlineMessage's entry from "Eligible candidate"/"Batch 2 Specification created" to "Built"
- Modify: `docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md` — update both §4.1b rows from "Eligible — Batch 2 Specification created" to "Built"

**Interfaces:** none — this task only runs verification and updates documentation, no code interfaces produced or consumed.

- [ ] **Step 1: Run the full dependency-ceiling gate**

Run: `cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate && node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: `OK: scanned N package.json file(s), zero violations`.

- [ ] **Step 2: Run the full React and Vue suites one more time together, from repo root context, to confirm the whole-branch state**

Run:
```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/packages/react && npx vitest run
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/packages/vue && npx vitest run
```
Expected: both fully green, exact counts noted for the closeout report.

- [ ] **Step 3: Read the exact current React DataScroller status-doc entry before editing**

Run: `grep -n -B2 -A2 "DataScroller" /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/docs/architecture/REACT_COMPONENT_STATUS.md`

Update the "Confirmed genuinely present — Batch 2 Specification created" line to instead read "Built (Phase C Batch 2)" — follow the exact row-table format already used for every other Built entry in that file's own capability tables (read one existing Built row first to match column count/order exactly).

- [ ] **Step 4: Read the exact current Vue InlineMessage status-doc entry before editing**

Run: `grep -n -B2 -A2 "InlineMessage" /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/docs/architecture/VUE_COMPONENT_STATUS.md`

Update the corresponding line to "Built (Phase C Batch 2)", matching the same row format as an existing Built entry in that file.

- [ ] **Step 5: Update the Parity Matrix's §4.1b rows**

Run: `grep -n "Batch 2 Specification created" /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate/docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md`

Change both matched lines' "Eligible — Batch 2 Specification created... not yet implemented" to "Built — Phase C Batch 2, merged `<commit-hash>`" (fill in the actual merge commit hash once known at merge time; if merge hasn't happened yet at this task's execution time, state "implemented on `feature/phase-c-batch-2-migration`, pending merge" instead — do not fabricate a commit hash).

- [ ] **Step 6: Commit the documentation updates**

```bash
cd /Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate
git add docs/architecture/REACT_COMPONENT_STATUS.md docs/architecture/VUE_COMPONENT_STATUS.md docs/architecture/research/2026-09-17-phase-c-cross-framework-functional-parity-matrix.md
git commit -m "docs: mark React DataScroller and Vue InlineMessage Built (Phase C Batch 2)"
```

---

## Verification checklist (whole-batch, run once at the end)

1. Full React suite passes (`npx vitest run` from `packages/react`) — includes the 6 new DataScroller tests.
2. Full Vue suite passes (`npx vitest run` from `packages/vue`) — includes the 7 new InlineMessage tests.
3. Both typechecks clean (`tsc --noEmit` React; `vue-tsc --noEmit` Vue).
4. `validate-dependency-ceiling.mjs` reports zero violations.
5. `git diff --name-only main feature/phase-c-batch-2-migration` shows only: the 2 new component directories, 2 barrel `index.ts` files, 2 `package.json` files, the 3 documentation files from Task 3, and the spec/plan documents themselves — nothing else.
6. DataScroller's implementation does not import or compose `UScroller`'s virtualization component (`grep -rn "from \"\.\./scroller\"\|from \"@ultimate/react\".*Scroller\|UScroller" packages/react/src/data-scroller/` should return no match — the component's own name/CSS classes legitimately contain "scroller" and are not what this check targets).
7. InlineMessage's implementation has no `sticky`/`life` prop, no close button, no timer (`grep -n "sticky\|life\|setTimeout\|closable" packages/vue/src/inline-message/*.ts packages/vue/src/inline-message/*.vue` should return no match).
