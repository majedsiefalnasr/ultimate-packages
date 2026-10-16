# GAP-094 backfill batch 1: evidence record

**Date:** 2026-10-16
**Base:** `main` `c174504069a00f9a8397c4a2268bb098d8222cc3`. Its CI run [38815159004](https://github.com/majedsiefalnasr/ultimate-packages/actions/runs/38815159004) fails only "Provenance validation", with 696 manifest problems.
**Authority:** the [GAP-094 Specification](../../superpowers/specs/2026-10-15-gap-094-production-provenance-scope-design.md) §3.4 and the [batch 1 Plan](../../superpowers/plans/2026-10-16-gap-094-backfill-batch-1.md).

## Inventory at the base

`node scripts/provenance/validate-provenance.mjs` reports 696 missing production files: ng 172, react 228, vue 277, ng-core 11, vue-core 4, react-core 2, uix-styles 2.

Batch 1 covers the 19 files in ng-core, vue-core, react-core and uix-styles.

## Method

- **Upstream archives.** Fetched with `pnpm run vendor:fetch -- primeng primevue primereact @primeuix/styles`, which verifies the SHA-256 values in `checksums.json`:
  - PrimeNG 21.1.9 at `c493b1c6`;
  - PrimeVue 4.5.5 at `66dde678`;
  - PrimeReact 10.9.9 at `d0f574e3`;
  - `@primeuix/styles` 2.0.3, with sources recovered from `dist/<module>/index.mjs.map` `sourcesContent`.
- **Lineage.** `git log --follow` for each file. The only later commits are:
  - `ecdbf793` (GAP-092 lint/format), which only re-wraps lines in `ng-core/.../dialog-service.ts` and `vue-core/.../confirmation-service.ts`;
  - `3da383df`, which rewrote `uix-styles/src/inputtext/index.ts` into a faithful copy of upstream.
- **Status vocabulary.** These are the existing terms, applied as follows:
  - `adapted`: upstream's code structure is kept, meaning the same members, control flow and emitted events, with renames, subsetting or small API changes.
  - `reimplemented-with-reference`: upstream was the API or behavior reference, but the mechanism differs.
  - `authored`: no upstream counterpart file exists.
- **Barrels.** Each `index.ts` barrel was checked for a same-named upstream directory (Spec §3.4). None exists in PrimeNG, PrimeVue or PrimeReact for `confirmation`, `dialog-service`, `terminal-service` or `toast-service`. For `service`, PrimeVue's `packages/core/src/service/` exists, but its only module (`PrimeVueService.js`) exports one global `EventBus()`; nothing in vue-core's barrel derives from it (see the vue-core table). Other `service/` directories upstream are showcase demo data. All six are `authored`, following the existing convention for ng-core, react-core and vue-core sub-barrels.

## Evidence table

### ng-core

| File                                   | Added (later)                  | Governing Spec/Plan                                                                                                   | Upstream counterpart and comparison                                                                                                                                                                                                                              | Classification                 |
| -------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `confirmation/confirmation-service.ts` | `b8e89232`                     | Phase C Batch 1 Plan §6, ConfirmDialog/ConfirmPopup rows                                                              | `primeng/src/api/confirmationservice.ts`: the same `requireConfirmationSource` `Subject`, `requireConfirmation$`, and `confirm`/`close` returning `this`. The accept stream and `onAccept` are dropped.                                                          | `adapted`                      |
| `confirmation/confirmation.ts`         | `b8e89232`                     | same                                                                                                                  | `api/confirmation.ts`: a 13-field subset with upstream's field descriptions; callbacks are typed `() => void`.                                                                                                                                                   | `adapted`                      |
| `confirmation/index.ts`                | `b8e89232`                     | same                                                                                                                  | No upstream `confirmation/` directory.                                                                                                                                                                                                                           | `authored`                     |
| `dialog-service/dialog-service.ts`     | `b8e89232` (`ecdbf793` format) | Phase C Batch 1 Plan §6, DynamicDialog row                                                                            | `dynamicdialog/dialogservice.ts`: `open()` returns a ref, but dispatches an `open$` request instead of `createComponent`/`attachView`/body append. There is no duplicate check, `getInstance` or `appendTo`; a `close(ref, result)` convenience method is added. | `reimplemented-with-reference` |
| `dialog-service/dynamic-dialog-ref.ts` | `b8e89232`                     | same                                                                                                                  | `dynamicdialog/dynamicdialog-ref.ts`: only `close`/`onClose`, completing immediately (upstream waits 1000 ms), plus an internal `requestClose$`. Drag, resize, maximize and destroy are dropped.                                                                 | `reimplemented-with-reference` |
| `dialog-service/index.ts`              | `b8e89232`                     | same                                                                                                                  | No `dialog-service/` directory; upstream exports from `dynamicdialog/` together with the component.                                                                                                                                                              | `authored`                     |
| `id/component-id-generator.ts`         | `68d00a98`                     | SSR-safe component id Spec and Plan (2026-09-12; both files still read "Draft for review"; implemented by `68d00a98`) | No counterpart class: PrimeNG's `dialog.ts` uses `uuid('pn_id_')` from `@primeuix/utils`. A DI-scoped counter for SSR isolation.                                                                                                                                 | `authored`                     |
| `terminal-service/terminal-service.ts` | `be9f35e4`                     | Phase C Batch 1 Plan §7, Terminal row                                                                                 | `terminal/terminalservice.ts`: the same two `Subject`s, observables and guarded `sendCommand`/`sendResponse`. Renamed, `providedIn: "root"`.                                                                                                                     | `adapted`                      |
| `terminal-service/index.ts`            | `be9f35e4`                     | same                                                                                                                  | No `terminal-service/` directory.                                                                                                                                                                                                                                | `authored`                     |
| `toast-service/toast-service.ts`       | `be9f35e4`                     | Phase C Batch 1 Plan §7, Toast row                                                                                    | `api/messageservice.ts`: the same `Subject`s, observers and `add`/`addAll`/`clear`, with `key ?? null` where upstream uses `key \|\| null`. The options type is a subset of `api/toastmessage.ts`.                                                               | `adapted`                      |
| `toast-service/index.ts`               | `be9f35e4`                     | same                                                                                                                  | No `toast-service/` directory.                                                                                                                                                                                                                                   | `authored`                     |

### react-core

| File                                                   | Added (later) | Governing Spec/Plan                                      | Upstream counterpart and comparison                                                                                                                                                              | Classification                 |
| ------------------------------------------------------ | ------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| `confirmation/confirmation-event-bus.ts` (two entries) | `b8e89232`    | Phase C Batch 1 Plan §6, ConfirmDialog/ConfirmPopup rows | `confirmdialog/ConfirmDialog.js` and `confirmpopup/ConfirmPopup.js` `confirmDialog`/`confirmPopup`: the same event names with `visible` defaulted to true. The differences are below this table. | `reimplemented-with-reference` |
| `confirmation/index.ts`                                | `b8e89232`    | same                                                     | No `confirmation/` directory.                                                                                                                                                                    | `authored`                     |

How `confirmation-event-bus.ts` differs from upstream:

- It emits through a `@ultimate/uix-utils` `EventBus` instead of `OverlayService`.
- It emits even when `visible` is false.
- It returns `void` instead of `{show, hide}`.

### vue-core

| File                              | Added (later)                  | Governing Spec/Plan                   | Upstream counterpart and comparison                                                                                                                                                                                                                                                                    | Classification |
| --------------------------------- | ------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `service/confirmation-service.ts` | `13faa040` (`ecdbf793` format) | Phase C Batch 1 Plan §1.2 and Group A | `primevue/src/confirmationservice/ConfirmationService.js` and `confirmationeventbus/ConfirmationEventBus.js`: the same `require`/`close` emits and `app.provide` install; the bus is created in this file. `$confirm` is dropped and `PrimeVueConfirmSymbol` is replaced by `UConfirmationServiceKey`. | `adapted`      |
| `service/dialog-service.ts`       | `13faa040`                     | same                                  | `dialogservice/DialogService.js` and `dynamicdialogeventbus/DynamicDialogEventBus.js`: the same `{content: markRaw, options, data, close}` handle and `open`/`close` events. The payload field is `ref` (upstream: `instance`), `close(ref)` is added, and `$dialog` is dropped.                       | `adapted`      |
| `service/toast-service.ts`        | `13faa040`                     | same                                  | `toastservice/ToastService.js` and `toasteventbus/ToastEventBus.js`: the same `add`/`remove`. `removeGroup`/`removeAllGroups` become `removeAll` (Plan §1.2), and `$toast` is dropped.                                                                                                                 | `adapted`      |
| `service/index.ts`                | `13faa040`                     | same                                  | Same-named `packages/core/src/service/` exists: `PrimeVueService.js` exports one global `EventBus()`. The barrel re-exports three service plugins, their keys and per-service buses, so it is not a counterpart. Each upstream service is its own package directory.                                   | `authored`     |

### uix-styles

| File                   | Added (later)                   | Governing Spec/Plan                       | Upstream counterpart and comparison                                                                                                                           | Classification |
| ---------------------- | ------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `inputnumber/index.ts` | `d3048a46`                      | Angular base-input Plan (2026-09-16)      | `@primeuix/styles` 2.0.3 `src/inputnumber/index.ts`: applying `.p-inputnumber` → `.u-inputnumber` to upstream yields this file byte for byte (`diff` exit 0). | `adapted`      |
| `inputtext/index.ts`   | `541238d7` (`3da383df` rewrite) | Angular form-foundation Plan (2026-09-16) | `src/inputtext/index.ts`: applying `.p-inputtext` → `.u-inputtext` yields this file byte for byte.                                                            | `adapted`      |

## Result

- **Classification.** All 19 files have conclusive evidence, and no file is left for a user decision. The batch adds 20 entries, because `confirmation-event-bus.ts` carries two upstream references.
- **Count.** The missing count goes from 696 to 677. Per-package production and excluded counts are unchanged.
- **Remaining.** ng 172, react 228 and vue 277.
