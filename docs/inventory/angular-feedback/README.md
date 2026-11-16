# Angular feedback and interaction utilities inventory (#140)

This bounded inventory covers progress-bar, progress-spinner, meter-group, skeleton, terminal, inplace, scroll-top, ripple, autofocus, fluid, key-filter, style-class and animate-on-scroll at source revision `c531e881dfa14e18449553ecfe45b0ab17d3210a`. It records current source and executed evidence for spec #98; it does not repair product behavior or assign Prime parity judgments.

Start with the [generated index](index.md), [scoped validation](validation.md) and [captured product run](product-run.json). The authored source is `scripts/inventory/angular-feedback.json`; the shared generator and schema are unchanged. Regenerate only this scope:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-feedback.json --out docs/inventory/angular-feedback
```

## Accounting and availability

Thirteen family records own 33 source files: 13 implementations, 13 named barrels and seven local style modules. Twenty-six spec/story files have explicit supporting-file exclusions, reconciling all 59 discovered files without equating folders with components. `UMeterItem`, `UInplaceContentContext` and `UKeyFilterPattern` are public type members attributed to their owning record. `TerminalCommand`, `DEFAULT_MASKS`, class maps, CSS strings, observer/listener state and other local helpers remain owned implementation details. There are no additional scoped public factories or independently exported composition components. Inplace composition uses projected `[displayContent]` and a `#content` template with `closeCallback`, rather than separate marker components.

There are 31 entry-qualified exports: 16 through `@ultimate/ng`, plus 15 through 12 secondary entries. `UScrollTop` is root-only: the root barrel reexports its local barrel, while the manifest has no `./scroll-top` entry. The mapped named barrels, root reexports and manifest entries are checked independently. Styles are source-only exports, not public barrel exports. The pilot has only a pending ripple relationship, so there is no scoped pilot record to duplicate or replace.

Seven components extend `UBaseComponent`, inheriting `dt` and `unstyled`. Six use base initialization and Aura keys `progressbar`, `progressspinner`, `metergroup`, `skeleton`, `terminal` and `inplace`. ScrollTop overrides `ngOnInit` without calling its base, and its `scroll-top` name has no Aura key. All seven styles are local adapters, with no `@ultimate/uix-styles` import. Fluid and the five behavior directives have no base style adapter or dedicated Aura key. No scoped family appears in the current `ALL_COMPONENTS` metadata registry. These absences are source observations, not inferred metadata or styling guarantees.

Reconciled pending relationships identify basecomponent/config/base-input/terminal-service (#148), DOM/ZIndex utilities (#144), theme presets (#151) and Button (#107). Their source relationship is described here; their owning tickets remain outside this change. Fluid provides `U_FLUID_ANCESTOR` for participating controls. Terminal delegates command/response communication to `UTerminalService`; that service is not counted again as a scoped component.

## Executed checks and limits

The product run passed locally in this ticket's isolated worktree under Node 24.15.0, with `NODE_OPTIONS=--max-old-space-size=1024`: 13 spec files and 62 tests. Counts were ProgressBar 5, ProgressSpinner 4, MeterGroup 5, Skeleton 7, Terminal 5, Inplace 6, ScrollTop 4, Ripple 1, AutoFocus 1, Fluid 2, KeyFilter 8, StyleClass 9 and AnimateOnScroll 5. The run evidence records the exact command, source revision, output summary, warnings, preparation and initial unavailable attempt.

An initial test invocation stopped during compilation because workspace dependency `dist` artifacts were absent (`TS2307` for `@ultimate/ng-core` and other dependencies); no tests executed in that attempt. `pnpm install --frozen-lockfile` and explicit builds of uix-utils, uix-styled, uix-data, uix-motion, uix-styles, ng-core and themes then succeeded within this worktree, and the identical scoped test command passed. Installation warned about cyclic react/themes dependencies and `DEP0169` for `url.parse`; no product files were changed to prepare or run checks.

The passing run still emitted `NG8113` for unused `UStepList`/`UStepPanels` in `VerticalStepperHost`, `NG8102` for InputNumber's `step() ?? 1`, and `NG0912` for a `SsrHostComponent`/`HostComponent` ID collision in the StyleClass toggle test. These remain disclosed without repair. Angular's test tsconfig includes all package specs during compilation, even though the include argument selects only these 13 files for execution.

This is one jsdom unit run, with a mocked `IntersectionObserver` in AnimateOnScroll. Ripple's sole spec asserts ink-span presence after mousedown, not visual animation or config toggling. Fluid checks its host class and manually appended DOM content; it does not exercise a child control's fluid-context behavior. Imported foundations and Button appear in the coverage report; aggregate coverage is not a scope-only measurement. Browser, visual, accessibility, Storybook, full-platform/full-build, installed-package and publication checks were not run, and the full authored interface must not be read as verified by these 62 assertions.

The configured non-docs CI Test step in `.github/workflows/ci.yml` runs root `pnpm run test`, recursively including Angular tests. That is configuration evidence only: no remote CI execution or branch-protection setting was observed. Inventory tests are outside the provenance-only `test:scripts` glob. Local inventory validation checks ownership, exports, source anchors and reference consistency; it does not prove every semantic interpretation or platform-wide completeness.

The focused inventory check `node --test scripts/inventory/pilot.test.mjs scripts/inventory/packages.test.mjs scripts/inventory/angular-feedback.test.mjs` passed 27 tests under Node 24.15.0. The ticket-specific checks reconcile tracked files and actual manifest availability, require source exports (including public types and source-only styles) to have an owning explanation, and compare deterministic reading views without modifying authored material. The CLI validation reported no problems, 59 files and 31 entry-qualified exports. Scoped success leaves global completeness unasserted and external owning records pending.

## Source observations retained without product repair

KeyFilter's `validateOnly` bypasses keypress blocking but not paste filtering and supplies no form-validation result. AutoFocus and AnimateOnScroll defer work without explicitly cancelling the timer on destruction. StyleClass caches its resolved target and does not invoke its stored enter/leave animation-listener cleanup functions during destroy.

AnimateOnScroll uses `threshold() || 0.5`, making a supplied zero fall back to 0.5. Its first intersecting callback may enter without a positive top; subsequent entry/exit callbacks and reset logic check `boundingClientRect.top > 0`. Ripple is actually gated by `UltimateConfig.ripple()` despite a conflicting source comment; its source has no CSS import establishing ink animation delivery. Its coordinate math adds body scrollTop to X and scrollLeft to Y. These are source observations with narrower unit-test evidence, not unobserved visual failure claims.

Inplace retains an internal active-state override after first interaction; `preventClick` gates click/callback paths while Enter can activate. ScrollTop starts hidden and checks its threshold after scroll events rather than during initialization. ProgressSpinner CSS requests both `progressspinner.colorOne` and dotted color tokens. MeterGroup normalizes the sum of item values for `aria-valuenow` while retaining raw min/max attributes. The detailed records cite the owning sources so these limits remain inspectable.
