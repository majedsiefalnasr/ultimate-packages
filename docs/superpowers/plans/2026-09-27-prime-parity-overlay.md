# Prime Parity: Overlay Implementation Plan (GAP-048–GAP-049)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task. Both gaps are small, independent, low-risk fixes with already-proven mechanisms — a lighter review cadence than Table's own plan is unnecessary; the standard per-task cycle applies.

**Goal:** Wire Angular `UDialog` to the existing `scrollLockRegistry` (GAP-048), and give Angular `UConfirmDialog`/Vue `ConfirmDialog.vue` the correct `role="alertdialog"` (GAP-049).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-overlay-design.md`.

**GAP → Task mapping:**

| GAP | Task(s) |
|---|---|
| GAP-048 | Task 1 |
| GAP-049 | Task 2 (Angular), Task 3 (Vue) |

## Global Constraints

- **React's `ConfirmDialog`/`Dialog` role is not touched.** Confirmed already matching its own real upstream (Spec §2.2) — no task in this plan reads, tests, or modifies any React file.
- **`UDialog`'s and `Dialog.vue`'s own default (non-confirm) role remains `role="dialog"`.** Only `ConfirmDialog`'s own rendered role changes; the underlying `UDialog`/`Dialog.vue` component is not switched to `role="alertdialog"` by default.
- **`scrollLockRegistry`'s existing multi-consumer reference-counting behavior is reused as-is.** No task modifies `packages/uix-utils/src/scroll-lock/registry.ts`.

## Review Focus

- **Two `UDialog` instances open simultaneously** — `scrollLockRegistry`'s own reference-counting (confirmed via `BlockUI`'s existing `register(lockId)`/`unregister(lockId)` pairing) should keep scroll locked until the last one closes, not unlock as soon as the first one does; Task 1's own test must open two dialogs and close only one, asserting scroll remains locked.
- **`UDialog` unmounted while still open (not explicitly closed first)** — a reasonable person expects `ngOnDestroy` to call `scrollLockRegistry.unregister` regardless of how the component leaves the DOM, matching `BlockUI`'s own cleanup precedent, not leaving a dangling registration that never unlocks scroll for a future dialog.

---

### Task 1: Angular — GAP-048 Dialog scroll-lock

**Files:**
- Modify: `packages/ng/src/dialog/dialog.ts`
- Test: `packages/ng/src/dialog/dialog.spec.ts`

**Interfaces:**
- Consumes: `scrollLockRegistry` from `@ultimate/uix-utils/scroll-lock` (`register(lockId)`/`unregister(lockId)`), already proven via `packages/ng/src/block-ui/block-ui.ts`.

- [ ] **Step 1: Write the failing tests**

```typescript
describe("scroll-lock (Spec §5.1, GAP-048)", () => {
  it("locks background scroll while the dialog is visible", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores background scroll when the dialog closes", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    fixture.componentRef.setInput("visible", false);
    fixture.detectChanges();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("keeps scroll locked while a second dialog remains open after the first closes", () => {
    const a = TestBed.createComponent(UDialog);
    const b = TestBed.createComponent(UDialog);
    a.componentRef.setInput("visible", true);
    a.detectChanges();
    b.componentRef.setInput("visible", true);
    b.detectChanges();
    a.componentRef.setInput("visible", false);
    a.detectChanges();
    expect(document.body.style.overflow).toBe("hidden");
    b.componentRef.setInput("visible", false);
    b.detectChanges();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("unregisters the scroll lock on destroy even if the dialog was never explicitly closed", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    fixture.destroy();
    const next = TestBed.createComponent(UDialog);
    next.componentRef.setInput("visible", true);
    next.detectChanges();
    next.componentRef.setInput("visible", false);
    next.detectChanges();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
```

- [ ] **Step 2: Implement**

In `packages/ng/src/dialog/dialog.ts`:

1. Import `scrollLockRegistry` from `@ultimate/uix-utils/scroll-lock`.
2. Add a private, unique `lockId` (matching `BlockUI`'s own pattern — e.g. a class-level instance counter, or reuse the existing `dialogDisplayOrderUid`-style module counter already present in this file for a different purpose; use a separate counter, do not repurpose `dialogDisplayOrderUid`, which already serves the display-order registry).
3. In the existing `effect()` that already reacts to `visible()` transitions (confirmed present per the file's own doc comment about focus-return-on-close, lines 131-141) — extend it: on transition to `true`, call `scrollLockRegistry.register(this.lockId)`; on transition to `false`, call `scrollLockRegistry.unregister(this.lockId)`.
4. In `ngOnDestroy` (add one if none exists; check first — `DestroyRef` is already injected per this file's imports), call `scrollLockRegistry.unregister(this.lockId)` unconditionally (idempotent per the registry's own reference-counting contract — confirmed safe to call unregister on an already-unregistered id, matching `BlockUI`'s own unconditional destroy-time unregister call).

- [ ] **Step 3: Run tests, verify green**

`pnpm --filter @ultimate/ng test -- dialog.spec.ts`.

- [ ] **Step 4: Full suite + dependency ceiling**

`pnpm test`, `pnpm run ceiling:validate`.

---

### Task 2: Angular — GAP-049 ConfirmDialog `role="alertdialog"`

**Files:**
- Modify: `packages/ng/src/dialog/dialog.ts`, `packages/ng/src/confirm-dialog/confirm-dialog.ts`
- Test: `packages/ng/src/confirm-dialog/confirm-dialog.spec.ts`

**Depends on:** none (independent of Task 1).

- [ ] **Step 1: Write the failing tests**

```typescript
describe("role=alertdialog (Spec §5.2, GAP-049)", () => {
  it("renders role=alertdialog on the composed UDialog's root element", () => {
    const fixture = TestBed.createComponent(UConfirmDialog);
    fixture.detectChanges();
    // Fire a confirmation via UConfirmationService the same way
    // confirm-dialog.spec.ts's existing tests already do — copy that
    // file's own established setup pattern here, do not invent a new one.
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=alertdialog]")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("[role=dialog]")).toBeFalsy();
  });
});

// (In packages/ng/src/dialog/dialog.spec.ts, additively:)
describe("role override (Spec §5.2, GAP-049)", () => {
  it("defaults to role=dialog when no role override is supplied", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=dialog]")).toBeTruthy();
  });

  it("renders the supplied role override when set", () => {
    const fixture = TestBed.createComponent(UDialog);
    fixture.componentRef.setInput("visible", true);
    fixture.componentRef.setInput("role", "alertdialog");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=alertdialog]")).toBeTruthy();
    expect(fixture.nativeElement.querySelector("[role=dialog]")).toBeFalsy();
  });
});
```

(The first test block's exact confirmation-triggering setup must match `packages/ng/src/confirm-dialog/confirm-dialog.spec.ts`'s own existing pattern for firing a confirmation via `UConfirmationService` — copy that file's existing setup, do not invent a new one.)

- [ ] **Step 2: Implement**

1. In `packages/ng/src/dialog/dialog.ts`: add `role = input<"dialog" | "alertdialog">("dialog");` and change the template's hardcoded `role="dialog"` (line 153) to `[attr.role]="role()"`.
2. In `packages/ng/src/confirm-dialog/confirm-dialog.ts`: pass `[role]="'alertdialog'"` on the composed `<u-dialog>` element.
3. Remove the doc comment's own "known, disclosed gap" paragraph (lines 42-47) — replace with a short note that the role is now correctly forwarded, since the gap it described no longer exists.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 3: Vue — GAP-049 ConfirmDialog `role="alertdialog"`

**Files:**
- Modify: `packages/vue/src/dialog/Dialog.vue`, `packages/vue/src/confirm-dialog/ConfirmDialog.vue`
- Test: `packages/vue/src/confirm-dialog/confirm-dialog.spec.ts`

**Depends on:** none.

- [ ] **Step 1: Write the failing tests**

Equivalent to Task 2's tests, using `@vue/test-utils` (`mount`, `wrapper.find("[role=alertdialog]")`), firing a confirmation via Vue's own `confirmationEventBus` the same way `packages/vue/src/confirm-dialog/confirm-dialog.spec.ts`'s existing tests already do.

- [ ] **Step 2: Implement**

1. In `packages/vue/src/dialog/Dialog.vue`: add a `role` prop, default `"dialog"`, and bind the template's `role="dialog"` attribute (line 24) to `:role="role"`.
2. In `packages/vue/src/confirm-dialog/ConfirmDialog.vue`: pass `role="alertdialog"` on the `<UDialog>` element (line 2-9's existing prop-binding block).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

## Completion Criteria

- Tasks 1-3 all pass their own tests.
- `pnpm test` and `pnpm run ceiling:validate` pass after each task.
- React's `ConfirmDialog`/`Dialog` files are unmodified (verify via `git status` showing no React file touched).
- `UDialog`'s/`Dialog.vue`'s default role remains `"dialog"` when no override is supplied (covered by Task 2/3's own first test).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-048/GAP-049 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
