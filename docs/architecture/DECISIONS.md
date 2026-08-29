# Architecture Decision Records

## ADR-001 — Ultimate is a company-owned platform

Status: Accepted (Blueprint §1). Ultimate owns the resulting source, public API, package architecture, roadmap, maintenance, tooling, metadata, and AI integration. Prime is a historical technical foundation only.

## ADR-002 — Monorepo architecture

Status: Accepted (Blueprint §4). One monorepo is the source of truth for platform source, shared infrastructure, framework packages, themes, metadata, tooling, documentation, tests, and release configuration. Packages remain independently publishable.

## ADR-003 — Independent package versioning

Status: Accepted (Blueprint §21). No shared version number across packages; a compatibility matrix (`COMPATIBILITY.md`) provides the platform-level relationship.

## ADR-004 — No Prime runtime dependency

Status: Accepted (Blueprint §2.1). Ultimate must ultimately own the runtime implementation of its UI framework packages. No required runtime dependency on PrimeNG, PrimeVue, PrimeReact, or current PrimeUIX packages. Enforced by CI (see `scripts/provenance/validate-dependency-ceiling.mjs`).

## ADR-005 — MIT baseline/provenance strategy

Status: Accepted (Blueprint §2.3, refined by Phase 0 spec). Only MIT-licensed source revisions may be incorporated. Phase 0 verified PrimeNG 21.1.9, PrimeVue 4.5.5, PrimeReact 10.9.9, and 4 `@primeuix/*` packages as MIT via direct primary-source inspection (LICENSE.md at exact commit, or extracted npm tarball content where no commit SHA is publicly resolvable). See `docs/architecture/PROVENANCE.md`.

## ADR-006 — Framework-native implementations

Status: Accepted (Blueprint §2.4). Angular, React, and Vue implementations remain native to their respective frameworks; no forced single rendering implementation across frameworks.

## ADR-007 — Independent theme layer

Status: Accepted (Blueprint §2.5). Themes/presets are a separate layer from component implementations, deferred to Phase 5.

## ADR-008 — CLI as orchestrator

Status: Accepted (Blueprint §19). `@ultimate/cli` orchestrates but must not replace Angular CLI, Vite, or equivalent official framework tooling. Reserved as scaffolding only in Phase 0 (`packages/cli`).

## ADR-009 — Component metadata as source-of-truth

Status: Accepted (Blueprint §17/§18). Component metadata is a first-class, versioned platform artifact. Reserved as scaffolding only in Phase 0 (`packages/component-schema`, `packages/component-metadata`).

## ADR-010 — MCP as optional tooling

Status: Accepted (Blueprint §2.6/§23). MCP must remain optional and never a runtime dependency. Reserved as scaffolding only in Phase 0 (`packages/mcp`).

## ADR-011 — Skills as AI-operational knowledge

Status: Accepted (Blueprint §24). Skills are operational AI guidance, not merely documentation, versioned and tied to compatible component metadata versions. Deferred to Phase 9.

## ADR-012 — LLM context generated from platform knowledge

Status: Accepted (Blueprint §25/§26). Generated outputs (llms.txt etc.) should not become the primary source of truth. Deferred to Phase 9.

## ADR-013 — Security tracking without continuous Prime sync

Status: Accepted (Blueprint §12/§13, confirmed applicable by Phase 0 findings). No automatic Prime synchronization. Security advisories tracked and evaluated case-by-case. Ultimate has no ongoing access to Prime's non-MIT patch stream (PrimeNG `-lts`, PrimeReact 11+) — advisories affecting frozen MIT baselines must be manually evaluated and back-ported.

## ADR-014 — PrimeReact 11 reclassified from "alpha" to "architectural reference, commercially licensed"

Status: Accepted (Phase 0 spec Finding 2, deviation from Blueprint §4's original framing). The Blueprint described PrimeReact 11 as "alpha" and a candidate for architectural reference. Phase 0 investigation found PrimeReact 11 is GA (`11.1.0`, published 2026-08-05) and commercially licensed (PrimeUI License, not MIT) — not merely immature. Confirmed and recorded per the Architectural Deviation Protocol (Blueprint §37): treated as architectural reference only (package-split pattern), never as incorporable source, and the reason is licensing, not maturity.

## ADR-015 — Build orchestration: plain pnpm scripts (no Turborepo/Nx) for Phase 0

Status: Accepted (plan-level decision; spec left this open). Phase 0 has no packages with real cross-package build dependencies yet, so `pnpm -r run <script>` is sufficient. Revisit once Phase 1+ packages create real build-caching needs.

## ADR-016 — Sourcemap extraction as the Phase 1 vendoring mechanism

Status: Accepted (Phase 1 spec, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`). The four pinned `@primeuix/*` npm tarballs ship only compiled dist output (`.mjs`/`.d.mts`), no `src/` directory, and the upstream `primefaces/primeuix` GitHub repository's history never reached these exact pinned versions (confirmed gap, Phase 0 Finding 3). Investigation found that every pinned tarball's published `.mjs.map` sourcemaps embed a complete `sourcesContent` array — the original per-file TypeScript source at the exact pinned MIT baseline. `scripts/provenance/extract-source.mjs` recovers this source deterministically from the same checksummed tarballs Phase 0 already pinned (`docs/architecture/checksums.json`), with no network access required at extraction time. This is the official Phase 1+ vendoring mechanism for these four packages.

## ADR-017 — `uix-styles` Phase 1 scope is the `base` module only

Status: Accepted (Phase 1 spec). `@primeuix/styles@2.0.3` ships a `base` module (global/framework-level CSS: box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation) alongside ~90 per-component style modules (button, dialog, datatable, etc.). Phase 1 incorporates only `base` — the ~90 per-component modules are component styles, not shared infrastructure, and Phase 1's explicit non-goal is "do not migrate framework components." Each per-component module migrates alongside its owning component during Phase 2 (Angular), Phase 3 (React), or Phase 4 (Vue). A scope-guard test (`packages/uix-styles/test/scope-guard.test.ts`) enforces this boundary in CI.

## ADR-018 — Option B: Ultimate-owned Angular base-class architecture

Status: Accepted (Phase 2 spec, confirmed by implementation). `ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy is independently authored, informed by but not copied from PrimeNG's `BaseComponent`/`BaseEditableHolder` — notably, PrimeNG's full passthrough (`pt`/`ptOptions`/`ptm`/`ptms`/`ptmo`) system, its `$parentInstance` DI-token lookup, and its full global-config surface are excluded from Phase 2's `UBaseComponent`/`UltimateConfig`, which cover only DI wiring (document/platformId/el/renderer/config), lifecycle, the `dt`/`unstyled` input pair, a `cx()` class-name-slot resolver, and `@ultimate/uix-styled`-backed style registration. This scoping held up across all 5 built components: each component's own provenance entry (`docs/architecture/provenance/ng.json`) documents deliberately excluding passthrough/DI-token-lookup call sites it would otherwise need to port (e.g. Button's badge/Fluid ancestor-detection wiring, Dialog's breakpoint passthrough). Revisit passthrough support only if a later-phase component creates real duplicate-pattern pressure (spec: DEFER, Needs Architecture Decision).

## ADR-019 — Standalone-only, no NgModule support

Status: Accepted (Phase 2 spec, confirmed by implementation). No `NgModule` authored in `ng-core` or `ng` across any built module (5 components — Button, Checkbox, Dialog, Menu, Tooltip — plus the Ripple/AutoFocus/Fluid/Badge primitives and the BaseComponent/BaseEditableHolder/Overlay/FocusTrap/Bind foundation tier; see `docs/architecture/COMPONENT_INVENTORY.md`). Ultimate has no pre-existing external consumer base requiring NgModule backward compatibility. Every component uses `standalone: true` plus signal-based `input()`/`output()`/`contentChild()`, consistent with the direction PrimeNG's own source is visibly moving.

## ADR-020 — Homegrown overlay/focus-trap retained over `@angular/cdk` Overlay

Status: Accepted (Phase 2 spec, confirmed by implementation). `@angular/cdk` is confirmed unused across the entire 5-component proof-set's dependency closure (Button, Checkbox, Dialog, Menu, Tooltip) — not declared as a peer dependency of either `ng-core` or `ng`. PrimeNG's own homegrown overlay/focus-trap system, adapted into `ng-core`'s `UOverlay`/`UFocusTrap`, has no found defect motivating a CDK migration. `UDialog` (the only overlay component built this phase) wires `UOverlay` + `UFocusTrap` + `@ultimate/uix-motion`'s `createMotion` together directly in its own class/template rather than through a shared "overlay orchestration service" abstraction, per YAGNI — there is exactly one consumer this phase. A real limitation surfaced during implementation: `UOverlay` hardcodes its z-index registry key to a single `"overlay"` bucket for every instance, so there is no working multi-dialog stacking order; `UDialog`'s Escape-key handling was implemented as a plain, unconditional `keydown.escape` host listener (guarded only by `closeOnEscape()`/`visible()`) rather than porting PrimeNG's topmost-z-index stacking check, since there is no real multi-dialog scenario yet to guard. Revisit the registry design if/when Popover/Drawer/ConfirmDialog migrate in a later phase and nested overlays become a real scenario.

## ADR-021 — `ng-packagr` build tooling for Angular packages

Status: Accepted (Phase 2 spec, confirmed by implementation). `tsup` (used elsewhere in the monorepo) does not understand Angular decorators/templates/partial-compilation metadata; `ng-packagr` (which PrimeNG itself uses) produces correct Angular Package Format output without reimplementing that tooling. Both `packages/ng-core` and `packages/ng` build via `ng-packagr -p ng-package.json`. During implementation, both packages' `package.json` were verified to declare `"sideEffects": true` (not `false`) — an earlier premature `sideEffects: false` on `ng` was found and reverted (Task 16/17 finding) because Ultimate components register their style module with `@ultimate/uix-styled`'s `StyleSheet` service as an import-time/`ngOnInit` side effect; marking either package side-effect-free would let bundlers tree-shake away style registration for components that are imported only for their type or re-exported through a barrel, silently dropping component styles. `sideEffects: true` was determined and verified correct on both packages, not merely left at its default.

## ADR-022 — Angular CLI Vitest builder + TestBed for Angular package tests

Status: Accepted (Phase 2 spec, confirmed by implementation). Keeps Vitest-everywhere consistency with Phase 0/1 while still exercising real Angular DI/compiler/template integration via `TestBed`, over Karma/Jasmine (PrimeNG's own stack). All 5 components' and all foundation modules' spec files run under `ng test --project=ng`/`--project=ng-core` (Angular CLI's Vitest builder), using a zoneless `TestBed` throughout. Implementation surfaced a real zoneless-specific test-mechanics issue, not a defect in the components themselves: a test performing two plain-property mutations on a zoneless host fixture in sequence (e.g. `UDialog`'s focus-return-on-close test flipping `visible` twice) can trigger `NG0100` (`ExpressionChangedAfterItHasBeenCheckedError`) on the second `detectChanges()` call; the established fix, applied identically in `packages/ng-core/src/overlay/overlay.spec.ts`, `packages/ng-core/src/bind/bind.spec.ts`, and `packages/ng/src/dialog/dialog.spec.ts`, is `fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(false); await fixture.whenStable();` in place of a second bare `detectChanges()` call.
