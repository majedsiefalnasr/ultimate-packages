# Phase 3 — UltimateReact Foundation

Status: Approved architecture, specification. Package structure/build tooling/base architecture/proof-set decisions were made after a mandatory Real-Source Verification Gate — every architectural decision below is backed by direct inspection of the pinned PrimeReact `10.9.9` tarball (commit `d0f574e39122668292fc7a740f081bae1b93b1e9`), not documentation, memory, or Angular-translated assumptions. See `docs/architecture/PROVENANCE.md` and `docs/architecture/checksums.json` for the pinned baseline.

## Context

Phase 0 (repository foundation, provenance), Phase 1 (`@ultimate/uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`), and Phase 2 (`@ultimate/ng-core`, `@ultimate/ng` — Button, Checkbox, Dialog, Menu, Tooltip, plus Ripple/AutoFocus/Fluid/Badge/Bind primitives) are complete and closed (ADR-023). Phase 3 builds UltimateReact on top of the same framework-neutral UIX foundation, using PrimeReact `10.9.9` (MIT, verified) as the primary implementation/behavior reference and PrimeReact `11.1.0` (commercial "PrimeUI License", not incorporated) as an architectural reference only, per Blueprint §7/§9 and ADR-005/ADR-014.

`packages/react` and `packages/react-core` exist today only as Phase 0 scaffolding (`.gitkeep` plus a `THIRD-PARTY-NOTICES.md` stub in `packages/react`) — no Phase 3 implementation exists yet.

### Deviation: Blueprint states PrimeReact `10.9.8`; verified repository baseline is `10.9.9`

The Blueprint's prose (§7) says "PrimeReact `10.9.8`". `docs/architecture/PROVENANCE.md`, `docs/architecture/COMPATIBILITY.md`, and `docs/architecture/checksums.json` (sha256-verified, machine-generated, dated 2026-08-28) all agree on `10.9.9`, and this is what is actually cached at `.vendor-cache/primereact-10.9.9.tar.gz`. Per ADR-005's "verified via direct primary-source inspection" methodology, `10.9.9` is authoritative. This is a one-line Blueprint prose staleness, not an architectural conflict — noted here, not blocking.

## Objective

Establish an Ultimate-owned, React-native component framework using PrimeReact 10.9.9 as the proven implementation/behavior reference. Not a port of PrimeReact to React — an Ultimate architecture informed by verified PrimeReact behavior, reusing Phase 1's framework-neutral UIX infrastructure wherever it already covers the need.

## Provenance discipline used throughout this document

Every architectural claim below is labeled as one of:

- **Verified source behavior** — read directly from PrimeReact 10.9.9's `components/lib/` source or its test files during the Real-Source Verification Gate.
- **PrimeReact-specific implementation detail** — real, but not something Ultimate should copy (an implementation choice, not a behavior contract).
- **Existing Ultimate/UIX capability** — already built in Phase 1/2, directly reusable.
- **UltimateReact architectural decision** — a genuine Ultimate-owned design choice, made after reviewing the evidence.
- **Intentional behavioral/API deviation** — a deliberate, documented departure from verified PrimeReact behavior.
- **Future/deferred concern** — real, but explicitly out of Phase 3 scope.

---

## 1. PrimeReact 10.9.9 Baseline (verified)

- **Source repository / commit**: `https://github.com/primefaces/primereact`, `d0f574e39122668292fc7a740f081bae1b93b1e9` — matches `docs/architecture/checksums.json`'s sha256-verified tarball.
- **License**: MIT (`LICENSE.md` at that commit, verified directly).
- **Library source path**: `components/lib/` only, **116** top-level directories (verified via `tar -tzf` listing, deduplicated and diffed). The repository root is a Next.js showcase application (`package.json` scripts: `next dev`/`next build`; `dependencies` include `next`, `chart.js`, `quill`, `xlsx`, `primeflex`, `jspdf`, `@docsearch/react`, `file-saver`) — its manifest and dependency tree must never be treated as library dependencies (per `docs/architecture/DEPENDENCIES.md`'s existing flagged-exclusion rule, now source-confirmed: zero of `components/lib/`'s own files import any of those packages — `chart/Chart.js` and `editor/Editor.js` reference `Chart`/`Quill` as bare globals with a try/catch existence check, not npm imports).
- **Source form**: plain `.js` files with hand-authored sibling `.d.ts` declaration files (not `.tsx`), built via a custom `rollup` + `gulp` pipeline into per-component subpackages (each with a build-generated `package.json` — `main`/`module`/`unpkg`/`types` fields only, not a hand-authored manifest).
- **React peer range (10.9.9 specifically, version-scoped npm query, not the `latest` dist-tag which now resolves to the commercial 11.x line)**: `react` / `react-dom` / `@types/react` all `^17.0.0 || ^18.0.0 || ^19.0.0`.
- **Runtime dependency**: `react-transition-group` only (confirmed — no other non-framework runtime import found anywhere in `components/lib/`).
- **Test tooling**: Jest 29.7 wrapped by `next/jest`, `jest-environment-jsdom`, `@testing-library/react` 14.1.2, `@testing-library/user-event` 14.5.2. Test coverage is **uneven across the proof set** — verified by direct file listing: Button and Tooltip have real `.spec.js` files; **Checkbox, Dialog, Menu, and FocusTrap have zero PrimeReact-authored tests**. This is direct evidence for §23 (Testing Strategy) below.

### PrimeReact 11 boundary

PrimeReact `11.1.0` is confirmed commercial ("SEE LICENSE IN LICENSE.md" per `npm view primereact@11.1.0 license`, not MIT) and is **not cached, not incorporated, and must never be read as source**. Its only permitted use is as an architectural reference via public npm package metadata (package names, `@primereact/{core,headless}` split pattern) — confirming that PrimeTek itself moved toward a core-plus-components package split, which is weak corroborating evidence (not a requirement) for this spec's own package-split decision in §2.

---

## 2. Package Architecture

**UltimateReact architectural decision**, approved after evaluating three real candidates (single package with subpath exports; per-component packages; core+components split) against React ecosystem convention, Phase 2's proven precedent, and Blueprint's provisional proposal:

```text
packages/
├── react-core/     @ultimate/react-core
└── react/          @ultimate/react
```

This mirrors `ng-core`/`ng`'s proven Phase 2 shape (**not** copied mechanically — independently justified: it gives a clean foundation/components boundary, matches the Blueprint's provisional proposal at `docs/architecture/BLUEPRINT.md` line 174-175, and keeps direct cross-framework comparability for the shared UIX dependency graph). Per `docs/architecture/PACKAGE_ARCHITECTURE.md` line 26, package names remain provisional until npm availability and long-term clarity are validated — not finalized by this spec.

### `@ultimate/react-core`

React-specific foundation. No rendered public components.

- Ultimate-owned base component architecture (props/state composition, `cx()` class resolution, style registration — see §7)
- Shared hooks: overlay listener composition, resize/scroll/click-outside primitives (React-native reimplementations of the *behavior* verified in PrimeReact's `hooks/useOverlayListener.js`, `useResizeListener.js`, `useEventListener.js`, `useMountEffect.js`, `useUnmountEffect.js`, `useUpdateEffect.js`, `usePrevious.js` — not ported code)
- Priority-aware Escape-key handling (§11)
- FocusTrap (§14)
- Multi-dialog scroll-blocking coordination (§16)
- Required icon components: `USpinnerIcon`, `UTimesIcon`, `UWindowMaximizeIcon`, `UWindowMinimizeIcon`, `UCheckIcon` — **verified minimum set**: direct import inspection of Button.js (`SpinnerIcon`), Dialog.js (`TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`), Checkbox.js (`CheckIcon`) confirms exactly these five are consumed by the proof set. Matches Angular's already-built icon set (`ng-core/src/icons`) for four of five; `CheckIcon` is new (Angular's `UCheckbox` styles the native input directly, no icon).
- Config/context primitive (React `Context`, not Angular DI — see §7)
- React `StyleSheet` adapter (§8)
- `@ultimate/uix-utils/zindex` consumption wrapper (§12)

### `@ultimate/react`

Public rendered components — the Phase 3 proof set:

- `UButton`
- `UCheckbox`
- `UDialog`
- `UMenu`
- `UTooltip`

Dependency direction (enforced, see §28): `@ultimate/react` → `@ultimate/react-core` → `@ultimate/uix-*`. No reverse or circular imports.

---

## 3. Build Tooling

**UltimateReact architectural decision**: `tsup` for both packages.

- Matches Phase 1's proven precedent (`uix-utils`, `uix-styled`, `uix-styles`, `uix-motion` — all `tsup`, confirmed via each package's `package.json` `build` script and `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md` line 244's stated rationale).
- Handles JSX/TSX natively via esbuild — no additional compiler plugin needed, unlike Angular's `ng-packagr` requirement (ADR-021's rationale for choosing framework-specific tooling does not apply here: plain TSX has no decorator/template/partial-compilation metadata requiring a dedicated Angular-only tool).
- Rejected alternatives: Vite library mode (no existing repo precedent, no demonstrated gap tsup doesn't cover) and Rollup directly (what PrimeReact itself uses upstream, but more manual configuration than tsup for no proven benefit — tsup wraps esbuild, which already handles this shape).

### Build output requirements

- **Module format**: ESM only (matches `uix-utils`/`uix-styled` precedent — no dual CJS/ESM requirement demonstrated).
- **Declarations**: via tsup's built-in `dts` option, one build step, `.d.mts` output — matching Phase 1's established pattern (`docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md` line 248).
- **Package exports**: `react-core`'s Phase 3 shape is a **single public entry point** (`.`) — deterministic, not conditional. `react-core` does **not** add a `./icons` subpath in Phase 3. This is a firm architectural decision, not deferred: a speculative public subpath API is not added on the possibility that a future bundle measurement might justify it. If a later, real bundle measurement (requiring the real consumer app explicitly out of scope per §24) demonstrates a meaningful need for icon isolation, that is evaluated then as its own later optimization/architecture decision, through the same evidence-based process this spec used — not pre-authorized here. `react` uses subpath exports per component (`@ultimate/react/button`, `@ultimate/react/checkbox`, `@ultimate/react/dialog`, `@ultimate/react/menu`, `@ultimate/react/tooltip`) plus a barrel — this directly avoids the tree-shaking failure Phase 2 documented (ROADMAP.md follow-up #5: `ng-packagr`'s single-barrel `entryFile` caused `UButton` to pull in `UDialog`; `tsup`/esbuild's real `@__PURE__`-annotated ESM output plus genuine subpath exports does not share that failure mode) — this per-component subpath decision for `react` is unaffected by the `react-core` icon-subpath decision above; they are separate packages with separate export-shape reasoning.
- **`sideEffects`**: `false` for both packages initially (unlike Angular's `ng`/`ng-core`, which require `true` per ADR-021 because style registration happens as an import-time/`ngOnInit` side effect against a `StyleSheet` singleton). React's style registration happens inside a hook invoked at component render/mount time, not at module-import time — so `sideEffects: false` is a reasoned **package metadata decision**, not yet a **measured bundler behavior**. These are distinct claims and must not be conflated: the metadata decision is made now, on the reasoning above; whether a real bundler actually honors it correctly for this specific package shape is unmeasured until the validation below runs.

  **Required build-level validation before this decision is treated as confirmed** (see §33 exit criteria — this is a hard gate, not an optional nice-to-have):
  - A production build (`tsup` build output, not dev/watch mode) of both `react-core` and `react`.
  - A consumer-like import against that production build output — i.e. importing from the built `dist/` artifacts the way an external package consumer would, not from `src/` directly.
  - Actual component rendering from that consumer-like import (via Vitest + RTL, jsdom environment) — not merely importing the module and checking it doesn't throw.
  - Explicit verification that the required style registration/injection (the `ReactStyleSheet` adapter's `createStyleElement` call, §8) still occurs under that consumer-like import — i.e. a real `<style>` element is present after the imported component mounts.
  - Explicit verification that no component code required for that registration is eliminated by dead-code elimination under `sideEffects: false` — the specific failure mode this flag risks is a bundler treating the style-registration hook's module as unused and dropping it.
  - Both **direct component/subpath import** (`import { UButton } from "@ultimate/react/button"`) and **barrel import** (`import { UButton } from "@ultimate/react"`) must each be exercised by this validation, since a subpath-import-only pass would not catch a barrel-specific tree-shaking regression and vice versa.

  If this validation reveals that `sideEffects: false` silently drops style registration under either import path, the resolution is to correct the flag to `true` (matching Angular's ADR-021 precedent) or to mark the specific style-registration module `sideEffects: true` via the package.json array-of-paths form — not to weaken the validation. This spec does not pre-decide which outcome will occur; it only commits to running the check.
- **Package boundary rules**: see §28.
- **Consumer expectations**: `@ultimate/react` peers on `react`/`react-dom` `^17.0.0 || ^18.0.0 || ^19.0.0` (matches PrimeReact 10.9.9's verified peer range — §27 covers whether Ultimate ties its own policy to this range going forward).

---

## 4. Ultimate Ownership Model

```text
PrimeReact 10.9.9 verified behavior
          ↓
Ultimate behavioral contract
          ↓
Ultimate-owned React implementation
          ↓
Existing framework-neutral UIX infrastructure where reusable
```

This is not a thin wrapper. Concretely, per the Real-Source Verification Gate:

- Where PrimeReact's behavior is verified-good and framework-neutral-reusable (z-index, motion, scroll-blocking primitive, style registry, focus-lookup DOM helpers), Ultimate reuses the **already-built** Phase 1 UIX primitive directly.
- Where PrimeReact's behavior is verified-good but the mechanism is React-specific (FocusTrap sentinel spans, Escape priority queue, Dialog scroll coordination), Ultimate reimplements the **behavior**, independently authored, not copied code — same treatment Angular's Option B (ADR-018) gave `UBaseComponent`.
- Where PrimeReact's implementation detail conflicts with Ultimate architecture (full `pt`/`ptm`/`ptmo` passthrough, `data-pr-*` attribute config channel, `document.primeDialogParams` global mutation), Ultimate excludes or replaces it.
- Where PrimeReact's behavior has a verified gap (Tooltip's missing `aria-describedby`), Ultimate improves it, documented as an intentional deviation.

---

## 5. Proof-Set Scope

Phase 3 implements exactly five components: **Button, Checkbox, Dialog, Menu, Tooltip**. This mirrors Phase 2's Angular proof set — chosen because each exercises a distinct architecture path (primitive rendering; controlled form input; portal/overlay/focus-trap/motion; keyboard navigation/virtual focus; ref-target overlay primitive) and because real PrimeReact dependency-graph inspection (not category-only reasoning) confirmed the actual import closures involved (see §6, Foundation Dependencies).

### Non-goals for Phase 3

- The remaining ~111 PrimeReact component/infrastructure areas (§30).
- A visual baseline / Storybook-equivalent tool (Phase 2 precedent: explicitly deferred, ADR-023).
- A real consumer application proving tree-shaking in practice (`apps/playground-react` remains a stub — see §24, §29).
- Full `pt`/`ptm`/`ptmo` passthrough support.
- Any Angular-style forms abstraction (CVA-equivalent).
- Fixing the parallel Angular styling gap found during this Phase's research (tracked separately, see §8).
- Data-grid-class component architecture (Table/Tree/etc. — Phase 2's inventory already classified these `NEEDS ARCHITECTURE DECISION`, same posture applies here once React reaches them in a later phase).
- `UDialog` draggable, resizable, and maximizable behavior. **`UDialog` does not expose or implement draggable, resizable, or maximizable behavior in Phase 3 unless a separately approved scope decision explicitly adds one of those features.** Verified present in real PrimeReact 10.9.9 Dialog source (§15) — not automatically inherited. See §15 for the full boundary statement.

---

## 6. Foundation Dependencies (verified import closure)

Direct import inspection (not category assumption) of each proof-set component's real `.js` source:

| Component | Direct imports (verified) |
|---|---|
| Button | `ComponentBase`, `Hooks` (`useMergeProps`, `useMountEffect`, `useUnmountEffect`, `useUpdateEffect`), `Ripple`, `Tooltip`, `SpinnerIcon`, `IconUtils`/`ObjectUtils`/`classNames` |
| Checkbox | `ComponentBase`, `Hooks` (`useMountEffect`, `useUpdateEffect`), `Tooltip`, `CheckIcon`, `DomHandler`/`IconUtils`/`ObjectUtils` |
| Dialog | `ComponentBase`, `CSSTransition`, `FocusTrap`, `Hooks` (`useDisplayOrder`, `useEventListener`, `useGlobalOnEscapeKey`, `useMergeProps`, `useMountEffect`, `useUnmountEffect`, `useUpdateEffect`), `TimesIcon`, `WindowMaximizeIcon`, `WindowMinimizeIcon`, `Portal`, `Ripple`, `DomHandler`/`IconUtils`/`ObjectUtils`/`UniqueComponentId`/`ZIndexUtils`/`classNames` |
| Menu | `ComponentBase`, `CSSTransition`, `Hooks` (`useDisplayOrder`, `useGlobalOnEscapeKey`, `useMergeProps`, `useMountEffect`, `useOverlayListener`, `useUnmountEffect`), `OverlayService`, `Portal`, `Ripple`, `DomHandler`/`IconUtils`/`ObjectUtils`/`UniqueComponentId`/`ZIndexUtils`/`classNames` |
| Tooltip | `ComponentBase`, `Hooks` (`useDisplayOrder`, `useGlobalOnEscapeKey`, `useMergeProps`, `useMountEffect`, `useOverlayScrollListener`, `useResizeListener`, `useUnmountEffect`, `useUpdateEffect`), `Portal`, `DomHandler`/`ObjectUtils`/`ZIndexUtils`/`classNames` |

**Verified negative finding**: Menu does **not** import Tooltip in PrimeReact's React source (contrary to an initial, since-withdrawn assumption drawn from an unrelated Angular/PrimeNG lesson). Button and Checkbox each conditionally render a `Tooltip` themselves (prop-sugar pattern, §9) — Menu has no such wiring.

**Ultimate reuse map for this closure**:

| PrimeReact area | Classification |
|---|---|
| `ComponentBase` | Reference only — react-core authors its own scoped-down base (§7) |
| `Ripple` | **Not a Phase 3 proof-set component.** Button/Dialog/Menu use it upstream (verified: direct import in all three), and that verified upstream behavior may be used as *source evidence* for how a future `URipple` should behave when it is eventually built — but Phase 3 does not build it, does not fold an ad-hoc ripple implementation into `UButton`/`UDialog`/`UMenu`, and does not duplicate ripple-effect infrastructure inside any individual component. This matches Angular's own precedent exactly: `URipple` was built as its own standalone Phase 2 primitive (`packages/ng/src/ripple`), not embedded per-component. `UButton`/`UDialog`/`UMenu` render without a ripple effect in Phase 3, deferred until a later, separately-scoped phase or follow-up decision adds `URipple` for React — with its own scope, provenance manifest entries, and test coverage at that time, not inherited from this spec. |
| `Portal` | React-native implementation — thin wrapper around `ReactDOM.createPortal` + `DomHandler.isClient()`-equivalent SSR guard, authored in react-core |
| `CSSTransition` | **Not reused** — replaced by `@ultimate/uix-motion/createMotion` (§17) |
| `FocusTrap` | React-specific implementation, sentinel-span mechanism (§14) |
| `OverlayService` | Direct reuse — `@ultimate/uix-utils`'s existing `eventbus` module already covers this (PrimeReact's own `OverlayService` is literally `EventBus()` from its `utils/Utils`) |
| `ZIndexUtils` | Direct reuse — `@ultimate/uix-utils/zindex` (§12) |
| `useDisplayOrder`, `useGlobalOnEscapeKey` | React-specific implementation, behavior ported (§11) |
| `useOverlayListener`, `useOverlayScrollListener`, `useResizeListener`, `useMergeProps`, `useMountEffect`, `useUnmountEffect`, `useUpdateEffect` | React-specific implementation — genuinely reusable hook primitives, authored fresh in react-core (thin, no PrimeReact-specific coupling found in any of these) |
| `UniqueComponentId` | React-specific implementation — trivial, or reuse `@ultimate/uix-utils/uuid` if its shape fits (implementation-time check) |
| `IconUtils`, `DomHandler`, `ObjectUtils`, `classNames` | Reference only where already covered by `@ultimate/uix-utils` (`classnames`, `dom`, `object` modules); author fresh only for the gap, if any, found at implementation time |

---

## 7. React Core Base Architecture

**UltimateReact architectural decision**, directly modeled on ADR-018's proven Option-B pattern for Angular:

React core provides only:

1. **Props/state composition** — a `useMergeProps`-equivalent hook (verified from PrimeReact's `hooks/useMergeProps.js` behavior: shallow-merges class names and event handlers rather than blindly overwriting; authored fresh, not ported).
2. **`cx()` class-name-slot resolution** — a per-component style-module contract shaped like `{ css: string, classes: Record<string, (params) => ClassValue> }`, matching the pattern already proven by Angular's `UBaseComponent.cx(key, params)` (verified: `packages/ng-core/src/basecomponent/base-component.ts`) and PrimeReact's own `ComponentBase`'s `cx()` (verified: `componentbase/ComponentBase.js` lines 511-513) — minus the passthrough (`ptm`) layer both of those wrap it in.
3. **Style registration** — via the React `StyleSheet` adapter (§8), invoked once per component name from a `useEffect`-shaped hook.
4. **React lifecycle integration** — `React.forwardRef` + `React.memo` as the standard component wrapper shape (verified: every proof-set component in PrimeReact uses exactly this pattern — `Button`, `Checkbox`, `Dialog` — Dialog uses `forwardRef` without `memo`, verified directly — `Menu`, `Tooltip` all confirmed).
5. **Shared hooks/context where justified by real, demonstrated multi-component need** — the overlay/Escape/scroll-listener/focus-trap infrastructure in §6, not a speculative general-purpose hook library.

### Explicitly excluded

**Intentional behavioral/API deviation**: the full PrimeReact `pt`/`ptm`/`ptmo` passthrough system (verified: `componentbase/ComponentBase.js`, ~150 lines of nested-key resolution, `getPTValue`/`_getPT`/`_usePT`/`_useGlobalPT`/`_useDefaultPT`) is excluded entirely. Same YAGNI justification that held across all 5 Angular components (ADR-018) — no demonstrated Ultimate consumer need, revisit only on real duplicate-pattern pressure from a later component.

**Intentional behavioral/API deviation**: no Angular/CVA-style forms abstraction. Verified from source: PrimeReact itself has no shared form-value-accessor abstraction — each form component (Checkbox verified directly) independently implements its own fully-controlled `checked`/`onChange` contract. Angular's `UBaseEditableHolder` exists because Angular's `ControlValueAccessor` is a *framework requirement* — React has no equivalent requirement, so building one would be forcing an Angular pattern onto React without source evidence it is needed (§20).

---

## 8. Styling Architecture

**Verified source behavior** (PrimeReact `hooks/useStyle.js`, full read): creates a real `<style data-primereact-style-id="{name}">` element, dedupes by querying for an existing tag with that data-attribute, appends to `context?.styleContainer || document.head`, sets `textContent`, SSR-safe (`document` defaults to `undefined` server-side via a `DomHandler.isClient()`-equivalent guard), supports a CSP nonce via `DomHandler.addNonce`.

**Existing Ultimate/UIX capability**: `@ultimate/uix-styled`'s `StyleSheet` class (verified: `packages/uix-styled/src/stylesheet/index.ts`) is a `Map<string, StyleMeta>` registry with `add()`/`has()`/`get()`/`getAllCSS()` etc. Its `createStyleElement(meta)` method is an intentionally-overridable hook that the **base class itself returns `undefined`** from — confirmed by an existing test asserting exactly this (`packages/uix-styled/test/stylesheet-service.test.ts`: `"base createStyleElement is a no-op hook (no DOM element created)"`).

**Verified real gap**: `@ultimate/ng-core`'s `ngCoreStyleSheet = new StyleSheet()` (verified: `packages/ng-core/src/basecomponent/style-sheet.ts`) never subclasses or overrides `createStyleElement` — meaning Angular's current styling path registers metadata for dedup purposes only and **never injects a real `<style>` element**. This is a genuine, previously-undocumented functional gap discovered during this Phase's research.

**Existing Ultimate/UIX capability, the fix**: `@ultimate/uix-utils/dom`'s `createStyleElement(css, attributes, container)` (verified: `packages/uix-utils/src/dom/methods/createStyleElement.ts`) is a complete, working, framework-neutral implementation — creates the `<style>` element, sets its content, appends it to a container. This is exactly the missing piece `StyleSheet`'s hook was designed to receive.

### React StyleSheet adapter — UltimateReact architectural decision

React core defines a small subclass:

```text
class ReactStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined; // SSR guard
    return createStyleElement(meta.css ?? "", meta.attrs, document.head);
  }
}
```

- Reuses `StyleSheet`'s registry/dedup semantics as-is — no reimplementation.
- Delegates actual DOM creation to the already-built `@ultimate/uix-utils/dom` `createStyleElement` — no PrimeReact styling code is ported.
- SSR-conscious: guards on `typeof document === "undefined"`, mirroring PrimeReact's own `DomHandler.isClient()` pattern (verified behavior, independently reimplemented).
- A single module-level `reactCoreStyleSheet` instance (matching Angular's `ngCoreStyleSheet` singleton pattern), registered against by a `useEffect`-shaped hook invoked once per component name on mount — not per-render.

**Explicit scope decision**: PrimeReact's CSP-nonce (`DomHandler.addNonce`) and `context.styleContainer`/`id`/`media` configurability are real, verified features but have no demonstrated Phase 3 proof-set need — excluded for now (YAGNI), can be added if a real requirement surfaces.

**This spec does NOT reopen the Angular-side gap.** Per explicit decision during the Real-Source Verification Gate: React gets its own working adapter as part of Phase 3's in-scope work; the Angular gap is recorded as a **new Phase 2 follow-up** (alongside the five already listed in `docs/architecture/ROADMAP.md`), not fixed inline here.

> **New Phase 2 follow-up (recorded here, not fixed by Phase 3):** `ngCoreStyleSheet` never overrides `createStyleElement` — no `<style>` element is ever actually injected into the DOM by Angular's current style-registration path. `@ultimate/uix-utils/dom`'s `createStyleElement` already provides the fix. Discovered during Phase 3 research; distinct from the already-tracked Phase 2 visual-baseline and tree-shaking follow-ups.

---

## 9. Tooltip API

**Verified source behavior**: PrimeReact's `Tooltip` (verified: `Tooltip.js`, 571 lines, full read) is a `React.memo(React.forwardRef(...))` functional component (the `.d.ts`'s `extends React.Component` declaration is stale relative to the real implementation — a documentation-generation artifact, not evidence of an actual class component). Its `target` prop accepts `string | string[] | HTMLElement | React.RefObject<HTMLElement>`. It does not wrap or clone children as its primary mechanism — it imperatively `addEventListener`s on the resolved target DOM node(s) (`mouseenter`/`mouseleave`/`focus`/`blur`, configurable via an `event` prop), and portal-renders a floating `role="tooltip"` panel only while visible.

**Verified from tests** (`Tooltip.spec.js`, all 13 tests read): every test uses the `target`-based pattern — either via a `tooltip` convenience prop on `InputText` (which internally renders `<Tooltip target={ref} content={tooltip}>`) or directly via `<Tooltip target=".selector" />` alongside a sibling element carrying a `data-pr-tooltip` attribute. **Zero tests use child-wrapping or cloning.**

**Verified source behavior, direct confirmation of the sugar-prop pattern**: `Button.js` line 136 — `<Tooltip target={elementRef} content={props.tooltip} pt={ptm('tooltip')} {...props.tooltipOptions} />`; `Checkbox.js` line 175 — identical pattern. Both proof-set components that support a `tooltip` prop implement it as exactly this composition, not a separate mechanism.

### UltimateReact API — confirmed compatible with source, not reopened

```text
Core primitive (matches verified Tooltip.js exactly):

  const ref = useRef<HTMLElement>(null);
  <UTooltip target={ref} content="Save changes" />
  <button ref={ref}>Save</button>

Convenience layer (matches verified ButtonBase/CheckboxBase defaultProps):

  <UButton label="Save" tooltip="Save changes" />
  // internally: <UTooltip target={internalRef} content={tooltip} />
```

The ref-target primitive is the single underlying mechanism; the `tooltip` prop on `UButton`/`UCheckbox` is sugar over it, not a competing API. Wrapper-composition (`<UTooltip>{children}</UTooltip>`) is **not** the model — no source or test evidence supports it as PrimeReact's real behavior, and it was explicitly withdrawn as an initial incorrect assumption during the gate. A hook (`useTooltip`) is **not** the primary public API — no PrimeReact evidence demonstrates a real need for one; the component is the public surface.

**Prime-specific implementation detail, deliberately not copied**: the `data-pr-*` DOM-attribute-as-config-channel (e.g. `data-pr-tooltip`, `data-pr-position`) — a stringly-typed escape hatch that works for PrimeReact because its other components read those attributes internally. Ultimate has no such internal convention and will not invent one to mirror it; `content`/positional/event props are passed directly.

### Accessibility improvement — intentional deviation

**Verified source gap**: no `aria-describedby` link exists anywhere in `Tooltip.js` between the target element and the tooltip panel — only `role="tooltip"` and `aria-hidden={visibleState}` on the panel itself. Confirmed absent in both the Angular-side `UTooltip` (already tracked as ROADMAP.md follow-up #4) and PrimeReact's own real React source — the gap is upstream, not Ultimate-introduced.

**UltimateReact fixes this**: when `UTooltip` becomes visible, it sets `aria-describedby` on the resolved target element pointing at the tooltip panel's `id`, and removes it on hide/unmount. This is a small, well-understood, deliberate accessibility improvement over the verified upstream behavior — same category as `UDialog`'s already-shipped focus-return-on-close fix (Phase 2, `docs/architecture/COMPONENT_INVENTORY.md` row: "implemented — closes a gap PrimeNG's own source left unverified"). This decision (add `aria-describedby`) is not reopened by the tightening below — only its exact ownership mechanics are specified further.

**Exact ownership contract** (tightened, not reopened):

1. **Resolve the target element** — the same `target` resolution already used for event binding (§9's ref/selector/`HTMLElement` resolution), not a separate lookup.
2. **Generate or use a stable tooltip ID** — if the tooltip panel already has an `id` (caller-supplied via a passthrough-equivalent prop or otherwise), use it; otherwise generate one deterministically (e.g. via the same ID-generation approach used elsewhere in react-core, matching PrimeReact's own verified `UniqueComponentId`-equivalent pattern, §6) and assign it to the panel.
3. **Add that ID to `aria-describedby` only while the tooltip is visible** — set on show, per §9's existing show/hide lifecycle.
4. **Preserve any existing `aria-describedby` value on the target** — `UTooltip` must not blindly overwrite the attribute. If the target already carries an `aria-describedby` (from the caller, or from another accessibility relationship unrelated to this tooltip), the tooltip's ID is **appended** to the existing space-separated token list (the standard `aria-describedby` multi-ID format), not substituted for it.
5. **On cleanup (hide/unmount), remove only the tooltip-owned ID** — if the target's `aria-describedby` contains other IDs (either pre-existing before the tooltip mounted, or added by something else in the interim), those are preserved; only the specific token this `UTooltip` instance added is removed. If removing it leaves an empty token list, the attribute itself is removed (matching the pre-tooltip state when there was nothing to describe).
6. **Multiple Ultimate tooltips targeting the same element**: this is an explicit **non-goal** for Phase 3 — the implementation contract above (append-one-ID-on-show, remove-that-same-ID-on-cleanup) is correct for the single-tooltip-per-target case verified as PrimeReact's real usage pattern (§9's test evidence: every real test targets one tooltip per target element). Deterministic behavior for multiple simultaneous `UTooltip` instances targeting the same element is not specified or guaranteed by this spec; if a future need arises, it is evaluated and specified then, not assumed to already work correctly here.

Regression tests for this exact contract are required (§23).

---

## 10. Menu

**Verified source behavior** (`Menu.js`, 518 lines, full read; `MenuBase.js` full read): dual-mode component. `popup: false` renders an always-visible inline `<ul role="menu">`; `popup: true` toggles a `Portal`-rendered overlay via `show()`/`hide()`/`toggle()`. Data-driven from a `model` prop (array of item objects). Keyboard handling in `onListKeyDown`: `ArrowDown`/`ArrowUp`/`Home`/`End`/`Enter`/`NumpadEnter`/`Space`/`Escape`/`Tab`, verified line-by-line.

**Focus model — verified, `aria-activedescendant` confirmed**: the `<ul>` carries `aria-activedescendant={focused ? focusedOptionId() : undefined}` (line 476); no `.focus()` call is ever made on an individual `<li>`. This is virtual focus — the `<ul>` (or in popup mode, `listRef`) retains real DOM focus throughout keyboard navigation; `focusedOptionIndex` state tracks the "active" item by matching against `li[data-pc-section="menuitem"][data-p-disabled="false"]`.

**Intentional divergence from Angular's `UMenu`, confirmed and preserved**: `docs/architecture/COMPONENT_INVENTORY.md` documents Angular's `UMenu` as using "roving-tabindex via literal DOM focus movement (not PrimeNG's virtual `aria-activedescendant` pattern)". PrimeReact's real React Menu uses the opposite technique. UltimateReact's `UMenu` preserves the verified PrimeReact React behavior (`aria-activedescendant`) rather than mirroring Angular's already-shipped choice — per ADR-006 (frameworks are independently native) and the explicit principle that cross-framework consistency belongs at the behavior/contract level, not the mechanism level.

### Coverage (all verified from the full `Menu.js` read)

- **Disabled items**: filtered out of keyboard navigation via the `[data-p-disabled="false"]` selector clause; `onItemClick` no-ops (with `event.preventDefault()`) when `item.disabled`.
- **Home/End**: `onHomeKey` → index 0; `onEndKey` → last non-disabled item, via `DomHandler.find(...).length - 1`.
- **Arrow navigation**: `findNextOptionIndex`/`findPrevOptionIndex` walk the filtered disabled-excluded list; `Alt+ArrowUp` in popup mode additionally returns focus to the trigger and closes the menu.
- **Enter/Space**: both invoke `onEnterKey`, which locates the currently-focused `<li>`'s anchor (or the `<li>` itself) and calls `.click()` on it, plus returns focus to the trigger in popup mode.
- **Escape**: closes popup-mode menus via the shared priority mechanism (§11); also handled directly inside `onListKeyDown` when popup is true.
- **Tab**: closes a visible popup menu (does not trap Tab — Menu has no FocusTrap dependency, confirmed by import inspection).
- **Popup mode**: `useOverlayListener` composition (outside-click, resize, orientation-change, overlay-scroll) drives dismissal and repositioning.
- **Focus restoration**: `DomHandler.focus(targetRef.current)` called explicitly on Escape and on `Alt+ArrowUp`.
- **Outside-click**: via the shared `useOverlayListener` hook (§6), not a Menu-specific implementation.
- **Accessibility**: `role="menu"` on the list, `role="menuitem"`/`role="separator"` on items, `aria-label`/`aria-labelledby` pass-through, `aria-disabled`/`data-p-disabled` on individual items.

### Selector strategy — intentional deviation

**Prime-specific implementation detail, not ported**: PrimeReact's keyboard-navigation queries couple directly to `data-pc-*` attributes emitted by the passthrough system (`li[data-pc-section="menuitem"][data-p-disabled="false"]`). Since the full `pt` system is excluded (§7), this exact selector cannot be ported unmodified.

**UltimateReact architectural decision**: define a stable, Ultimate-owned data-attribute convention independent of any passthrough system — e.g. `data-u-menuitem` (presence) and `data-u-disabled="true"/"false"` — set directly by `UMenu`'s own rendering, not derived from a passthrough resolver. Exact attribute names are an implementation-time detail; the contract (a stable, queryable, non-passthrough-dependent marker) is fixed by this spec.

---

## 11. Escape Handling (`react-core`)

**Verified source behavior** (`hooks/useGlobalOnEscapeKey.js`, 114 lines, full read; `hooks/useDisplayOrder.js`, 37 lines, full read): a single shared `document` `keydown` listener, gated by a two-level priority system. `ESC_KEY_HANDLING_PRIORITIES` is a verified real enum (`SIDEBAR: 100, SLIDE_MENU: 200, DIALOG: 300, IMAGE: 400, MENU: 500, OVERLAY_PANEL: 600, PASSWORD: 700, CASCADE_SELECT: 800, SPLIT_BUTTON: 900, SPEED_DIAL: 1000, TOOLTIP: 1200`). `useDisplayOrder` assigns each mounted-and-visible instance within a named group an incrementing display-order index on mount, via a module-level registry (`groupToDisplayedElements`), cleaned up on unmount. Only the listener with the highest `[primaryPriority, secondaryPriority]` tuple fires on `Escape`.

**Verified as more correct than Ultimate's own existing Angular implementation**: ADR-020 documents Angular's `UDialog` Escape handling as "a plain, unconditional `keydown.escape` host listener", with "no working multi-dialog stacking order" as an accepted, known limitation. PrimeReact's real mechanism solves exactly this class of bug.

### UltimateReact architectural decision

React core provides a centralized hook, behavior-ported (not code-ported) from the verified source:

```text
useGlobalEscapeKey({
  callback: () => hide(),
  when: isOpen,
  priority: [PRIORITY.DIALOG, displayOrder],
});
```

- **Registration**: a `useEffect` registers the callback into a module-level priority map on mount, deregisters on unmount or when `when` becomes false — same shape as verified.
- **Priority**: an Ultimate-owned enum scoped to the Phase 3 proof set (`DIALOG`, `MENU`, `TOOLTIP` at minimum — extend only as later phases add overlay components, not speculatively for the full PrimeReact catalog).
- **Display order**: an Ultimate-owned `useDisplayOrder`-equivalent hook, same module-level per-group counter pattern, independently authored.
- **Cleanup**: verified pattern — the registration effect's cleanup function removes the listener entry and, if the priority tier becomes empty, deregisters the underlying `document` listener entirely (avoids leaking a listener when no overlay is open).
- **Nested overlays / multiple dialogs**: the two-level priority tuple is exactly what makes this deterministic — the topmost, most-recently-displayed instance within the highest-priority tier wins. No additional design needed beyond the verified pattern.
- **SSR**: registration happens inside `useEffect`, which does not run during server rendering — no SSR-specific guard needed beyond that default React behavior.

---

## 12. Z-Index

**Existing Ultimate/UIX capability, direct reuse, no redesign**: `@ultimate/uix-utils/zindex`'s `ZIndex` (verified: `packages/uix-utils/src/zindex/index.ts`) is algorithmically identical to PrimeReact's own `ZIndexUtils.js` (verified, full read and line-by-line compared) — same module-closure `zIndexes` array, same per-key `baseZIndex`-bucketed `generateZIndex` logic, same `set`/`clear`/`get`/`getCurrent` shape. Already used today by Angular's `UOverlay`.

**Verified source behavior — `autoZIndex` compatibility note**: PrimeReact's `PrimeReact.autoZIndex` defaults to `true` globally (verified: `api/PrimeReact.js`), overridable via `PrimeReactContext` or a per-instance `baseZIndex` prop; Dialog/Menu/Tooltip each read `(context && context.autoZIndex) || PrimeReact.autoZIndex` at call time. `@ultimate/uix-utils/zindex`'s `ZIndex.set()` hardcodes `autoZIndex: true` internally (verified) — there is currently no way to pass `false` through.

**UltimateReact architectural decision**: this is component-level configuration, not a `uix-utils/zindex` redesign question (per explicit scope constraint — the utility is not touched). React core exposes the existing `ZIndex.set(key, element, baseZIndex)` primitive via a small overlay hook; whether an individual component (`UDialog`/`UMenu`/`UTooltip`) threads its own `baseZIndex` prop through to that call is a per-component decision, matching how PrimeReact itself does it (each component reads its own prop, no shared config layer).

**Verified default z-index buckets** (from `PrimeReact.js`, real evidence, adoptable as Ultimate's own starting values): `modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100, toast: 1200`.

---

## 13. Overlay Architecture

React-native composition, no centralized overlay service, no Angular CDK:

- **Portal**: a thin react-core wrapper around `ReactDOM.createPortal`, gated by an `isClient()`-equivalent SSR guard (matching verified PrimeReact `Portal.js` behavior: `DomHandler.isClient()` check, `mountedState` via `useState`+`useMountEffect`, `appendTo === 'self'` escape hatch to render inline instead of portaling).
- **Overlay listeners**: the `useOverlayListener` composite hook (outside-click + resize + orientation-change + scroll dismissal), authored fresh per §6/§7, matching verified behavior from `hooks/useOverlayListener.js`.
- **Escape**: shared priority mechanism, §11.
- **Z-index**: `@ultimate/uix-utils/zindex`, §12.
- **Component-local orchestration**: each overlay component (`UDialog`, `UMenu` in popup mode, `UTooltip`) wires Portal + FocusTrap (where applicable) + motion + Escape + z-index directly in its own body — matching the verified pattern in both PrimeReact's real `Dialog.js`/`Menu.js` and Angular's already-shipped `UDialog` (ADR-020: "wires `UOverlay` + `UFocusTrap` + `createMotion` together directly... rather than through a shared 'overlay orchestration service' abstraction, per YAGNI"). No new shared orchestration service is introduced — none was demonstrated necessary by either the verified PrimeReact source or Angular's proven precedent.

Angular CDK is not used (matches ADR-020's rationale — no found defect motivating a dependency this heavy, and it remains unused by the Angular side too).

---

## 14. FocusTrap

**Verified source behavior** (`FocusTrap.js`, 128 lines, full read; `FocusTrapBase.js` full read): a hidden sentinel-`<span>` pair (`className="p-hidden-accessible p-hidden-focusable"`, `tabIndex={0}`, `role="presentation"`, `aria-hidden={true}`) rendered immediately before and after `props.children`. Each sentinel's `onFocus` handler redirects real DOM focus back into the trapped region — `onFirstHiddenElementFocus`/`onLastHiddenElementFocus` locate the first/last real focusable descendant (via `DomHandler.getFirstFocusableElement`/`getLastFocusableElement`) and call `.focus()` on it. No keydown interception anywhere in this file. `setAutoFocus` on mount looks for an `[autofocus]`/`[data-pc-autofocus='true']` element first, falling back to the first focusable element if `autoFocus` is set.

**No test file exists for FocusTrap** in PrimeReact 10.9.9 (verified — confirmed absent by direct file listing).

**Materially different mechanism than Angular's `UFocusTrap`**: Angular's is a `[uFocusTrap]` attribute directive performing keydown `Tab`/`Shift+Tab` interception plus `getFocusableElements` lookup (verified: `packages/ng-core/src/focus-trap/focus-trap.ts`). PrimeReact's sentinel-span technique exploits the browser's natural Tab order instead — arguably more robust (works regardless of dynamic content changes inside the trap, no keydown-preventDefault timing issues) and already React-idiomatic (plain refs and JSX, no imperative event wiring needed).

### UltimateReact architectural decision

Option 2 from the Real-Source Verification Gate: an Ultimate-owned React abstraction with the **same behavior** (sentinel-span mechanism), independently authored — not option 1 (mechanical port) or option 3 (reuse a framework-neutral primitive wholesale, since none exists at this level — only the DOM-lookup helpers underneath it do).

- **Sentinels**: two invisible, focusable `<span>` elements bracketing `children`, matching the verified accessibility attributes (`role="presentation"`, `aria-hidden`, hidden-but-focusable styling).
- **Focus redirection**: `onFocus` handlers on each sentinel, reusing **existing Ultimate/UIX capability** — `@ultimate/uix-utils/dom`'s `getFirstFocusableElement`/`getLastFocusableElement` (verified present: `packages/uix-utils/src/dom/methods/getFirstFocusableElement.ts`, `getLastFocusableElement.ts` — already consumed today by Angular's `UFocusTrap`/`UAutoFocus`).
- **Initial/autofocus**: mirrors verified behavior — `autoFocus` prop, selector-based override (`autoFocusSelector`), fallback to first focusable element.
- **Disabled state**: `disabled` prop skips the mount-time autofocus behavior (verified: `if (!props.disabled) { ... }`).
- **Focus restoration**: FocusTrap itself does not restore focus on unmount (verified — no such logic in `FocusTrap.js`); this responsibility belongs to the consuming component (`UDialog` already restores focus-on-close per its own verified source, §15).
- **Nested traps**: no nested-trap handling exists in verified source — single-level only, matching Dialog's own single-trap usage. Not a Phase 3 requirement (no proof-set component nests traps).
- **SSR**: no DOM access occurs during initial render — sentinel elements are plain JSX; `setAutoFocus`'s `DomHandler.focus` call happens inside a mount-effect, which does not run server-side.
- **Interaction with Dialog**: `UDialog` wraps its content in `<UFocusTrap autoFocus={props.focusOnShow}>`, matching verified `Dialog.js` line 705.
- **Accessibility**: sentinel spans are `aria-hidden` and use `role="presentation"` — they are implementation detail, not part of the trapped region's accessible tree.

---

## 15. Dialog

**Verified source behavior** (`Dialog.js`, 717 lines, full read): controlled entirely via `props.visible`/`props.onHide` — no internal open/close state ownership beyond mount/transition bookkeeping (`maskVisibleState`/`visibleState`). Already wires `aria-labelledby={headerId}`, `aria-describedby={contentId}`, `aria-modal={props.modal}`, `role="dialog"` correctly on the root element (verified: lines 668-671 — **this is not a gap**, unlike Tooltip). Composes `FocusTrap` + `CSSTransition`(→ replaced by `createMotion`, §17) + `Portal` directly in its own render body, matching the "no shared orchestration service" pattern already proven by Angular's `UDialog` (ADR-020).

### `UDialog` — controlled component contract

```text
visible: boolean
onHide: (event) => void
```

Same shape as verified PrimeReact `Dialog` and already-shipped Angular `UDialog`.

### Verified feature surface, scoped per proof-set requirements

PrimeReact's real Dialog additionally supports **draggable**, **resizable**, and **maximizable** behavior (verified: `onDragStart`/`onDrag`/`onDragEnd`, `onResizeStart`/`onResize`/`onResizeEnd`, `toggleMaximize` — all present in the full source read) — a materially larger feature surface than Angular's already-shipped `UDialog`, which has none of these.

> **`UDialog` does not expose or implement draggable, resizable, or maximizable behavior in Phase 3 unless a separately approved scope decision explicitly adds one of those features.**

This boundary is explicit and firm, not merely "deferred by omission": no `draggable`/`resizable`/`maximizable` props exist on Phase 3's `UDialog` public API, no drag/resize event handlers are wired, and no maximize-toggle UI is rendered. This is not included automatically merely because upstream has it. If a later phase or explicit follow-up decision adds one of these features, that is a separate, deliberately-scoped addition — its own evidence review, its own API design, its own tests — not inherited silently from this section. This decision is not reopened by this edit; it restates and tightens what was already decided.

### In scope for Phase 3's `UDialog`

- Portal-rendered mask + content (§13)
- FocusTrap wrapping content, `autoFocus={focusOnShow}` (§14)
- `createMotion`-driven enter/leave (§17), replacing verified `CSSTransition` usage
- Shared Escape handling via `useGlobalEscapeKey`, `PRIORITY.DIALOG` (§11)
- Z-index via `@ultimate/uix-utils/zindex`, `'modal'` key (§12)
- Body-scroll blocking coordination (§16)
- `aria-labelledby`/`aria-describedby`/`aria-modal`/`role="dialog"` (already correct per verified source, preserved)
- Focus-return-on-close (verified: `onExited` calls `DomHandler.focus(focusElementOnHide.current)`, restoring focus to the element that was active before the dialog opened — matches Angular's already-shipped `UDialog` behavior, both frameworks converged independently on this fix)
- Header/content/footer composition, close icon, dismissable-mask-click behavior

---

## 16. Dialog Scroll Blocking

**Verified source behavior**: `Dialog.js`'s `document.primeDialogParams` (verified: a plain array property mutated directly on the global `document` object) tracks `{id, hasBlockScroll}` per mounted-and-visible Dialog instance. `updateScrollBlocker()` checks whether `.some(i => i.hasBlockScroll)` is true across all registered instances, and calls `blockBodyScroll()`/`unblockBodyScroll()` accordingly on every registry change.

**Existing Ultimate/UIX capability, direct reuse**: `blockBodyScroll`/`unblockBodyScroll` (verified: `packages/uix-utils/src/dom/helpers/blockBodyScroll.ts`, `unblockBodyScroll.ts`) already exist in `@ultimate/uix-utils/dom`, already framework-neutral, already ported from Phase 1 — functionally matching the verified PrimeReact behavior (`--scrollbar-width` CSS variable + class toggle on `document.body`).

### UltimateReact architectural decision — private react-core registry, not a global mutation

**Intentional behavioral/API deviation**: do not reproduce `document.primeDialogParams`. Define a small, module-scoped coordination primitive private to `react-core`:

```text
a Set<string> of currently-blocking dialog instance IDs

register(id):    add id to the set; if set size becomes 1, call blockBodyScroll()
unregister(id):  remove id from the set; if set size becomes 0, call unblockBodyScroll()
```

- **Registration**: called from `UDialog`'s mount/visibility effect when `blockScroll` is true and the dialog is visible.
- **Unregistration**: called on hide/unmount (`useUnmountEffect`-equivalent cleanup).
- **Multiple blocking dialogs**: the Set naturally coalesces — scroll stays blocked as long as at least one dialog is registered, exactly matching verified PrimeReact behavior's `.some(...)` check, without exposing a public global.
- **0→1 / 1→0 transitions**: exactly where `blockBodyScroll()`/`unblockBodyScroll()` are called — only at the boundary transitions, matching verified behavior (not called redundantly on every registration).
- **Cleanup**: unregister must run even on abrupt unmount (not just `onHide`) to avoid a stuck-blocked-scroll state — same care already required by the Set's invariant.

This is React-idiomatic (a private module-scoped registry) rather than a public `document` property mutation, while preserving the exact coordination *behavior* PrimeReact's real source demonstrates is necessary for correctness with multiple simultaneous dialogs.

---

## 17. Motion

**Verified source behavior**: PrimeReact's `CSSTransition.js` (verified, full read) is a thin wrapper around the real npm `react-transition-group` package's `CSSTransition` component — confirmed by direct import (`import { CSSTransition as ReactCSSTransition } from 'react-transition-group'`). This is declarative/JSX-driven: `in`/`classNames`/`timeout` props, lifecycle callbacks, mounted/unmounted via React's render cycle.

**Existing Ultimate/UIX capability**: `@ultimate/uix-motion`'s `createMotion(element, options)` (verified: `packages/uix-motion/src/config/index.ts`, full read) is **imperative and Promise-based** — `.enter()`/`.leave()` return Promises, driven by CSS class toggling (`{name}-enter-from/active/to`) plus native `transitionend`/`animationend` detection (a Vue-Transition-ported `whenEnd` implementation, verified in source comments as a deliberate, documented port). Framework-agnostic by construction — no dependency on `react-transition-group` or any framework runtime. Already proven working from an `effect()`-shaped call site: Angular's already-shipped `UDialog` calls `createMotion` directly from an `effect()`.

### UltimateReact architectural decision — reuse `createMotion`, no new dependency

**Intentional behavioral/API deviation**: do not add `react-transition-group` as a new runtime dependency. `createMotion`'s Promise-based `.enter()`/`.leave()` API is directly callable from a React `useEffect` the same way Angular calls it from `effect()` — no functional gap was found during the Real-Source Verification Gate that would require the declarative wrapper PrimeReact needed.

React lifecycle integration:

```text
useEffect(() => {
  const motion = createMotion(elementRef.current, motionOptions);
  if (visible) {
    motion.enter();
  } else {
    motion.leave();
  }
  return () => motion.cancel();
}, [visible]);
```

- **Enter/leave**: driven by the component's own `visible`/`in`-equivalent state, calling `.enter()`/`.leave()` directly — matches verified `createMotion` public API exactly (`enter`, `leave`, `cancel`, `update`).
- **Cancellation**: `motion.cancel()` on effect cleanup (component unmount or `visible` change mid-transition) — already a first-class verified `createMotion` capability (`cancelCurrent`/`onCancelled` hook).
- **Cleanup**: `createMotion`'s own `run()` already removes transition classes and resolves/rejects appropriately on completion or cancellation — no additional cleanup logic needed in react-core beyond calling `.cancel()` on unmount.
- **Unmount timing**: `unmountOnExit`-equivalent behavior (only unmounting the portaled DOM after the leave transition completes) is achieved by awaiting the `.leave()` Promise before clearing visibility state that controls the Portal's render — a React-native pattern, not a `react-transition-group` feature being replicated.
- **Reduced-motion**: **existing Ultimate/UIX capability** — `createMotion`'s options already support a `safe` flag wired to `isPrefersReducedMotion()` (verified: `packages/uix-motion/src/utils/index.ts`'s `shouldSkipMotion`), inherited automatically, no new work required.

---

## 18. Button

**Verified source behavior** (`Button.js` full read, `button.d.ts` full read): real prop surface — `label`, `icon`+`iconPos` (`left`/`right`/`top`/`bottom`), `loading`+`loadingIcon`, `severity` (`secondary`/`success`/`info`/`warning`/`danger`/`help`/`contrast`), `size` (`small`/`large`, internally mapped to `sm`/`lg` CSS suffixes), `text`/`rounded`/`raised`/`outlined`/`link`/`plain` (independent booleans, **not** a single `variant` enum), `badge`+`badgeClassName`, `tooltip`+`tooltipOptions` (§9), `disabled`, `visible`, extending native `ButtonHTMLAttributes` via `Omit<..., 'disabled' | 'ref'>`.

**Ref behavior**: `React.forwardRef`, no `useImperativeHandle` (unlike Checkbox/Dialog/Menu/Tooltip) — the forwarded ref resolves to the raw `<button>` DOM element directly.

**Rendering order** (verified): icon → label → `props.children` → badge → `<Ripple />` → conditional `<Tooltip>`, all as `<button>` children plus the sibling Tooltip. Per §6, `Ripple` is not a Phase 3 component — `UButton` renders this slot's position without a ripple effect in Phase 3, not as an ad-hoc reimplementation.

**Accessibility**: default `aria-label` computed as `label + (badge ? ' ' + badge : '')` when no explicit `aria-label` is supplied (verified: line 113).

### Ultimate API comparison — convergent evidence, not blind copying

**Existing Ultimate/UIX capability**: Angular's `UButton` (verified: `packages/ng/src/button/button.ts`) already declares `severity`, `raised`, `rounded`, `text`, `outlined`, `size`, `fluid` as `input()`s — independently arriving at the same boolean-modifier design (no `variant` enum on the Angular side either). This is strong convergent, cross-framework evidence, not a case of one framework copying the other.

**UltimateReact architectural decision**: preserve PrimeReact's verified boolean-modifier prop set (`severity`/`size`/`text`/`raised`/`rounded`/`outlined`/`link`/`plain`) as `UButton`'s public API — supported by both the direct source evidence and the independent Angular convergence. No React-native redesign is needed here: the verified API is already React-idiomatic (plain props, native-element pass-through, no internal state requiring controlled/uncontrolled design). `tooltip`/`tooltipOptions` directly implements the already-approved Tooltip sugar pattern (§9). `fluid` remains Angular-specific for Phase 3 (via a separate `UFluid` primitive not yet built for React) — not a Button-level prop in this phase, since PrimeReact's own Button has no native Fluid coupling (verified: no `fluid` reference anywhere in `Button.js`/`ButtonBase.js`/`button.d.ts`).

---

## 19. Checkbox

**Verified source behavior** (`Checkbox.js` full read, both halves; `CheckboxBase.js` full read; `checkbox.d.ts` full read): `checked: boolean` is a **required** prop (not optional) — PrimeReact's Checkbox is fully controlled by design, with **no uncontrolled/`defaultChecked` mode at all**. `trueValue`/`falseValue` (default `true`/`false`) let `checked` represent non-boolean domain values. `onChange(event: CheckboxChangeEvent)` receives a custom event shape (`{originalEvent, value, checked, stopPropagation, preventDefault, target: {type, name, id, value, checked}}`), not a raw DOM `ChangeEvent`. A real hidden native `<input type="checkbox">` (wired to `checked`/`disabled`/`readOnly`/`required`/`name`/`tabIndex`/`aria-invalid`) carries all real semantics/keyboard/forms behavior; a separate decorative `<div>` box renders the check icon — a dual-element pattern.

**No `indeterminate` prop exists anywhere in verified source** — confirmed absent from both `checkbox.d.ts` and `Checkbox.js`, not an oversight in this spec.

**No test file exists for Checkbox** in PrimeReact 10.9.9 (verified — confirmed absent).

**`variant?: 'outlined' | 'filled'`** is a real, purely visual styling prop, unrelated to controlled/uncontrolled state.

Ref: `inputRef` prop targets the native `<input>` specifically, separate from the component's own forwarded `ref`, which resolves via `useImperativeHandle` to `{props, focus, getElement, getInput}`.

Tooltip integration identical to Button's pattern (§9, §18) — third independent confirmation of the approved Tooltip decision.

### UltimateReact forms contract — the minimum, not a framework

**Verified**: PrimeReact provides **no broader form abstraction** — confirmed by direct inspection: no CVA-equivalent, no shared form-context, no validation-message wiring beyond the single `invalid` boolean prop driving `aria-invalid` plus a CSS class.

**Component-specific behavior** (belongs to `UCheckbox` alone): the `checked`/`trueValue`/`falseValue`/`onChange` event shape.

**Reusable react-core contract candidates** (justified by recurrence, not invented speculatively): the `invalid` boolean → `aria-invalid` + class-wiring pattern (verified, likely to recur on future form components); the dual-native-input-plus-styled-decorative-wrapper composition shape.

**Premature abstraction, explicitly rejected**: an Ultimate-wide "controlled form field" hook or base class. Neither PrimeReact's own source nor a single-component (`Checkbox`-only) evidence base justifies one. §20 states this formally.

`UCheckbox` public contract for Phase 3:

```text
checked: boolean          // required — fully controlled, matches verified upstream
trueValue?: unknown        // default true
falseValue?: unknown        // default false
onChange?: (event: UCheckboxChangeEvent) => void
disabled?: boolean
readOnly?: boolean
invalid?: boolean          // → aria-invalid
name?: string
inputRef?: React.Ref<HTMLInputElement>
```

No `indeterminate`, no `defaultChecked` — neither is verified-present in the reference, and adding either without a demonstrated Phase 3 requirement would be speculative (YAGNI). If a later phase's component genuinely needs uncontrolled support, that is evaluated then, on its own evidence.

---

## 20. Forms Contract (formal statement)

Phase 3 does **not** create an Angular-style `ControlValueAccessor`-equivalent abstraction. The minimum, evidence-justified contract is:

```text
controlled props (e.g. checked)
+
callbacks (e.g. onChange)
+
optional uncontrolled/default state — only where a proof-set component demonstrates a real need
```

For this proof set, only `UCheckbox` has form-input semantics, and it is fully controlled (no uncontrolled mode exists in the verified reference). No behavior is promoted to `react-core` as a shared "forms" module unless a second proof-set or later-phase component demonstrates genuine duplication — the `invalid`→`aria-invalid` mapping is the only candidate identified so far, and even that stays component-local until a second consumer exists.

---

## 21. Cross-Framework Contracts (UltimateNG ↔ UltimateReact)

Shared **behavioral** contracts, explicitly not shared **mechanisms**:

| Contract | Shared behavior | Framework-native mechanism (not shared) |
|---|---|---|
| Z-index semantics | Same base bucket values per overlay family (`modal`/`overlay`/`menu`/`tooltip`), same `ZIndex.set/clear/get` algorithm | Angular applies via `UOverlay` directive; React applies via a hook calling the same `@ultimate/uix-utils/zindex` primitive |
| Escape priority | "Topmost, most-recently-shown wins" — a real behavioral contract | Angular's current implementation does not yet implement this (ADR-020 known gap); React's does (§11). Stating the contract here does not retroactively fix Angular — that remains its own follow-up. |
| `invalid` → `aria-invalid` | Same mapping concept | Angular: `UBaseEditableHolder`-derived; React: component-local per §19/§20 |
| Style registration | Both frameworks must eventually deliver real `<style>` injection as a mount/init-time effect, deduplicated by component name | Angular: currently a documented gap (§8); React: `ReactStyleSheet` adapter, from day one |
| Motion lifecycle | `createMotion(element, options)`'s `.enter()`/`.leave()` Promise contract — genuinely shared at the **mechanism** level too, not just behavior, since both frameworks call the same framework-neutral `@ultimate/uix-motion` function | Angular calls it from `effect()`; React calls it from `useEffect` — the call site differs, the primitive does not |
| Accessibility expectations | Same baseline: correct ARIA roles/states, keyboard operability, focus management, label association | Implementation differs per framework's idiomatic pattern (e.g. Menu's focus technique, §10) |

**Explicitly not shared** (verified divergent by design, not by oversight): FocusTrap mechanism (Angular keydown-directive vs React sentinel-span, §14); Menu focus technique (Angular literal DOM focus vs React `aria-activedescendant`, §10) — both intentional, evidence-backed, framework-native choices, not accidental inconsistency.

---

## 22. Provenance and Licensing

Reuses the established Phase 1/2 provenance model (per Blueprint §8, ADR-005) — no second provenance system introduced.

### Package-level (`docs/architecture/PROVENANCE.md`)

Update the existing `PrimeReact` entry's `Modification status` from "not yet incorporated (Phase 0 — baseline pinned only)" to reflect Phase 3 incorporation, following the exact field template already used by the `PrimeNG` entry (source repository, package, version, commit SHA, source path, license, copyright holder, third-party notices, Ultimate destination, modification status, modification description, date incorporated).

### File-level manifests

New `docs/architecture/provenance/react-core.json` and `docs/architecture/provenance/react.json`, matching the exact schema already established by `ng-core.json`/`ng.json`: an array of `{originalPath, ultimateDestination, modificationStatus, modificationDescription}` records per file. `modificationStatus` values follow the existing vocabulary (`reimplemented-with-reference`, `authored`, `adapted`, etc. — verified from `ng-core.json`'s real usage). Every file with real PrimeReact provenance (e.g. `react-core/src/focus-trap/*` ← `focustrap/FocusTrap.js`) records its `originalPath`; every Ultimate-authored file with no upstream equivalent (tests, the `ReactStyleSheet` adapter, the Escape priority-queue registry, the scroll-blocking Set) records `"n/a"` with a `modificationDescription` explaining why, matching `ng-core.json`'s established convention exactly.

### `THIRD-PARTY-NOTICES.md`

`packages/react/THIRD-PARTY-NOTICES.md` already exists (Phase 0 stub) with the correct MIT license text and the PrimeReact 11 non-incorporation note — verify it remains accurate at implementation time; `packages/react-core/THIRD-PARTY-NOTICES.md` does not yet exist and must be created following the same template.

### No PrimeReact runtime dependency

Enforced by the same CI mechanism already protecting Angular (`scripts/provenance/validate-dependency-ceiling.mjs`) — extend its scope to `packages/react`/`packages/react-core` if it is not already package-agnostic (implementation-time check, not asserted here).

### Traceability chain (strengthens, does not replace, the existing Phase 1/2 provenance model)

Every migrated component and every intentional deviation must preserve a traceable chain from verified source through to a passing test:

```text
Verified PrimeReact source
        ↓
Verified behavior/API/dependency
        ↓
Ultimate architectural decision
        ↓
Implementation file(s)
        ↓
Test proving the behavior
```

This is not a new provenance system — it is the existing `{originalPath, ultimateDestination, modificationStatus, modificationDescription}` file-level manifest schema (above), read end-to-end: `originalPath` anchors the chain's first link (verified source), `modificationDescription` should name the specific verified behavior/API/dependency and the Ultimate architectural decision made about it (not merely restate the file's purpose), `ultimateDestination` is the implementation file, and the corresponding Vitest spec file (co-located per the existing `ng`/`ng-core` convention) is the final link. Implementation-plan tasks for Phase 3 must preserve this same chain per task — citing the specific verified source file/line this spec already cites, not re-deriving from memory or generic React convention.

This traceability is **especially load-bearing** for the eight intentional deviations named throughout this spec, since each represents a point where implementation could silently drift back toward either a mechanical PrimeReact port or an Angular-translated shape if the chain is not kept explicit:

| Deviation | Verified source anchor | Ultimate decision | Spec section |
|---|---|---|---|
| Tooltip `aria-describedby` | `Tooltip.js` (no such wiring found) | Add it, additive/owned-ID-only-cleanup contract | §9 |
| Menu `aria-activedescendant` | `Menu.js:476` | Preserve, diverge from Angular's literal-focus `UMenu` | §10 |
| FocusTrap sentinel mechanism | `FocusTrap.js`, `FocusTrapBase.js` (full reads) | Preserve mechanism, Ultimate-owned implementation | §14 |
| Shared Escape priority handling | `useGlobalOnEscapeKey.js`, `useDisplayOrder.js` (full reads) | Preserve behavior, reimplement independently in react-core | §11 |
| Dialog scroll coordination | `Dialog.js` (`document.primeDialogParams`) | Private module-scoped `Set` registry, not a global mutation | §16 |
| UIX motion instead of `react-transition-group` | `CSSTransition.js` (confirms real upstream dependency) | Reuse `@ultimate/uix-motion/createMotion` instead | §17 |
| UIX styling adapter | `useStyle.js` (full read) | `StyleSheet` subclass + `@ultimate/uix-utils/dom`'s `createStyleElement` | §8 |
| Passthrough exclusion | `ComponentBase.js` (~150 lines of `pt`/`ptm`/`ptmo` resolution) | Excluded entirely, Option B posture | §7 |

Each row's "Verified source anchor" and "Ultimate decision" columns are what the corresponding `provenance/react-core.json`/`react.json` entry's `modificationDescription` must actually say (not a generic restatement) — this is the enforcement mechanism for the traceability chain, reusing the existing manifest schema rather than adding a parallel tracking document.

---

## 23. Testing Strategy

**Verified gap, directly informing this section**: PrimeReact's own test coverage across the proof set is uneven — only Button and Tooltip have real `.spec.js` files; Checkbox, Dialog, Menu, and FocusTrap have **zero** PrimeReact-authored tests. Ultimate cannot rely on upstream tests as a behavioral oracle for most of the proof set — Ultimate must author its own tests from scratch, the same posture Phase 2 already took for Angular.

### Tooling

Vitest + React Testing Library (`@testing-library/react`), matching the framework-neutral Phase 1 precedent (Vitest everywhere) while using the React ecosystem's standard testing library rather than PrimeReact's Jest+`next/jest` setup (no repo precedent for adopting Jest; Vitest already handles ESM/TSX natively per the existing monorepo TypeScript configuration).

### Minimum categories, mapped to verified behavior

- **Rendering**: each of the 5 components renders its verified DOM structure (e.g. Checkbox's dual native-input-plus-box, Button's icon/label/badge/children order).
- **Props**: every prop enumerated in §18/§19 (and the equivalent verified surfaces for Dialog/Menu/Tooltip) has at least one test.
- **Events**: `onChange` (Checkbox, verified custom event shape), `onHide`/`onShow` (Dialog, Menu), `onClick` (Menu items).
- **Controlled state**: Checkbox's fully-controlled `checked` contract (§19) — verify it does not manage internal state.
- **Uncontrolled state where applicable**: none identified in the proof set (§20) — no test category needed unless implementation reveals otherwise.
- **Keyboard behavior**: Menu's full verified key set (§10); Dialog's Escape; Tooltip's none (mouse/focus-driven only, per verified source).
- **Accessibility**: `role`/`aria-*` attributes per §26, including regression coverage for both intentional deviations (§9's `aria-describedby`, §15's already-correct `aria-labelledby`/`aria-describedby`/`aria-modal`).
- **Overlay lifecycle**: mount → show → hide → unmount for Dialog/Menu(popup)/Tooltip, including Portal presence/absence.
- **FocusTrap**: sentinel-span focus redirection, autofocus, disabled state (§14) — new tests, since no upstream tests exist to adapt.
- **Escape priority**: multi-instance stacking — the exact scenario ADR-020 documents as an unverified Angular gap; this is a genuinely new, higher-value test category for React specifically.
- **Z-index**: `ZIndex.set`/`.clear` invoked correctly per overlay open/close cycle.
- **Scroll blocking**: 0→1 and 1→0 transitions with multiple simultaneous dialogs (§16) — direct regression coverage for the registry replacing `document.primeDialogParams`.
- **Motion**: `createMotion` `.enter()`/`.leave()` invoked on visibility change, `.cancel()` on unmount (§17).
- **Style injection**: `ReactStyleSheet` adapter actually creates a `<style>` element (regression test for the verified real gap found in §8 — this is exactly the kind of test that would have caught Angular's silent no-op).
- **Cleanup**: every effect-based subscription (Escape listener, overlay listener, scroll-blocking registry) removes itself on unmount — leak regression coverage.
- **SSR-sensitive behavior**: Portal's `isClient()`-equivalent guard, `ReactStyleSheet`'s `typeof document` guard — at minimum a render-without-crash test under a simulated server environment (jsdom absence), not a full SSR framework integration (out of proof-set scope).
- **Tooltip `aria-describedby`**: explicit regression test for the intentional deviation (§9) — assert the attribute is present while visible and removed on hide/unmount, an existing unrelated `aria-describedby` value is preserved rather than overwritten, and the tooltip-owned ID (and only that ID) is removed on cleanup (§9's tightened contract).
- **Dialog feature boundary**: explicit negative test asserting `UDialog` exposes no `draggable`/`resizable`/`maximizable` props and renders no drag-handle/resize-handle/maximize-toggle UI in Phase 3 (§15) — a regression guard against silent scope creep during implementation, not merely a documentation statement.

---

## 24. Consumer/Build Validation

**Package build validation** (in scope, achievable this phase): `tsup` builds both packages without error; declared `package.json` `exports` resolve; a Vitest suite (matching Phase 1's precedent, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md` line 258) asserts every declared export subpath resolves and imports without throwing.

**Real application validation** (explicitly out of Phase 3 scope, documented rather than hidden): `apps/playground-react` remains a stub (`.gitkeep` only) through Phase 3, matching the exact posture ADR-023 already accepted for `apps/playground-angular`. **No claim about real-world tree-shaking, bundle isolation, or consumer ergonomics may be made without a real consuming application** — this spec explicitly does not claim tree-shaking success (§29). If Phase 3 wants to avoid repeating Phase 2's exact gap, building a minimal `apps/playground-react` is a candidate follow-up, but is not asserted as in-scope here without an explicit decision (this mirrors the brief's rule 4: Phase 2 follow-ups are not silently absorbed into Phase 3).

---

## 25. Security

**Verified from source**, security scan across all 116 `components/lib/` directories: exactly **2** `dangerouslySetInnerHTML` sites in the entire library (`button/Button.js`, `fileupload/FileUpload.js`), both static `&nbsp;` literals — no user-controlled content, negligible risk, and neither is in the Phase 3 proof set's actual render path beyond Button's (which is the static-literal case, not risky). **14** files use `.innerHTML =` directly; 13 are trivial clears or internal computed text. **One real finding, out of proof-set scope**: `editor/Editor.js:87` — `editorValue.innerHTML = props.value || ''`, writing the `value` prop unsanitized — Editor is not in the Phase 3 proof set, but this is recorded here as a known upstream risk for whichever future phase incorporates Editor. No `eval`, no `document.write` anywhere in `components/lib/`.

### Proof-set-specific considerations

- **Dynamic attributes/properties**: `mergeProps`/`cx`/`ptm`-style prop spreading (verified pattern across all 5 proof-set components) spreads caller-supplied props onto real DOM elements. Ultimate's scoped-down base (§7, no `pt` system) reduces this surface relative to verified PrimeReact, but `...props.tooltipOptions`-style spreads (Button/Checkbox, verified) still forward arbitrary caller-supplied objects onto `UTooltip`'s props — bounded by TypeScript's prop typing, not runtime sanitization; document this as an accepted, typed-API-bounded risk, matching Angular's `UBind` precedent (`docs/architecture/COMPONENT_INVENTORY.md`: "no sanitization performed... accepted, documented risk, not a defect").
- **DOM style injection**: the `ReactStyleSheet` adapter (§8) injects `css` strings that originate from Ultimate-authored style modules only (never from runtime user input) — same trust boundary as the existing `@ultimate/uix-utils/dom` `createStyleElement` primitive it reuses.
- **Target selectors/refs**: `UTooltip`'s `target` prop (§9) accepts a string selector, an `HTMLElement`, or a `RefObject` — a string-selector target performing a `document.querySelectorAll`-equivalent lookup is standard DOM API usage, not user-content injection; no `dangerouslySetInnerHTML` or `innerHTML` write occurs anywhere in the verified `Tooltip.js` render path (content is set via `textContent`/`appendChild(document.createTextNode(...))`, verified: `updateText`, line 139-140 — this is actually safer than a naive `dangerouslySetInnerHTML` approach and should be preserved as-is).
- **Portal rendering**: standard `ReactDOM.createPortal`, no custom DOM manipulation beyond React's own reconciliation.
- **User-supplied content**: `UTooltip`'s `content` prop is rendered via `textContent`, not HTML injection (verified, see above) — preserve this.
- **URL-like attributes**: not applicable to the Phase 3 proof set — no `href`/`src`-bearing proof-set component (Menu items may carry `item.url`, verified as a plain `href` pass-through with no protocol validation in source; document as an accepted, typed-API-bounded risk matching the `mergeProps` note above — not a new Ultimate-introduced risk, since it is unchanged from verified upstream behavior).

Tests: add regression coverage per §23's "Style injection" and "cleanup" categories, plus an explicit test asserting `UTooltip` never renders caller-supplied `content` via `innerHTML`/`dangerouslySetInnerHTML`.

---

## 26. Accessibility Baseline

Minimum baseline for all five proof-set components, source-confirmed and cross-checked against Angular's already-established `source-confirmed` / `runtime-tested` distinction (Phase 2 precedent — no automated scanning tool such as axe-core is wired in for this phase either; state this explicitly rather than claiming full compliance):

| Component | Verified roles/states | Keyboard | Focus | `aria-*` |
|---|---|---|---|---|
| Button | native `<button>` semantics | native | native | default computed `aria-label` (§18) |
| Checkbox | native `<input type="checkbox">` inside a styled wrapper | native (space-toggle via native input) | native | `aria-invalid` from `invalid` prop |
| Dialog | `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby` (already correct, verified) | Escape (priority-aware), FocusTrap-contained Tab cycling | FocusTrap + focus-return-on-close (verified, preserved) | as listed |
| Menu | `role="menu"`/`menuitem`/`separator`, `aria-activedescendant` (verified, preserved) | full verified key set (§10) | virtual focus (`aria-activedescendant`) | `aria-label`/`aria-labelledby`/`aria-disabled` |
| Tooltip | `role="tooltip"`, `aria-hidden` while not visible | n/a (pointer/focus-driven) | n/a | `aria-describedby` on target, additive/non-destructive per the tightened §9 contract (**intentional deviation**) |

**Verification tiers** (per Phase 2's established distinction, applied here identically):
- `source-confirmed`: verified directly from `.js`/`.d.ts` source during the Real-Source Verification Gate (all rows above).
- `runtime-tested`: to be established during implementation via the Vitest+RTL suite (§23) — not yet performed by this spec.
- `automatically scanned`: not performed this phase (no axe-core or equivalent wired in — explicitly not claimed).
- `manually validated`: not performed this phase.

**Intentional accessibility improvements over verified PrimeReact behavior** (both must ship with regression tests, §23): Tooltip's `aria-describedby` (§9); Dialog's focus-return-on-close was already correct upstream and is preserved, not newly added.

---

## 27. React Compatibility Policy

**UltimateReact architectural decision**: Ultimate owns its own React compatibility policy, not automatically tied to PrimeReact's release cadence (per Blueprint §18's "Ultimate owns its compatibility policy" and this spec's explicit instruction).

- **Initial supported range**: `react` / `react-dom` `^17.0.0 || ^18.0.0 || ^19.0.0`, matching PrimeReact 10.9.9's **verified** peer range — chosen as the starting point because it is real, tested-against evidence, not because Ultimate is bound to track PrimeReact going forward.
- **TypeScript**: match the monorepo's existing TypeScript version floor (same as `uix-*`/`ng-core`/`ng` — implementation-time confirmation against the root `package.json`/`tsconfig.json`, not re-derived here).
- **Future React majors**: evaluated independently by Ultimate when they ship, using the same evidence-based process this spec followed for React 17-19 — not automatically inherited from a future PrimeReact peer-range bump. Record the decision in `docs/architecture/COMPATIBILITY.md`'s existing table format when it happens.

---

## 28. Package Boundary Rules

Dependency direction, enforced:

```text
@ultimate/react
        ↓
@ultimate/react-core
        ↓
@ultimate/uix-*
```

Prevented, matching the existing CI posture already protecting `ng`/`ng-core` (`scripts/provenance/validate-boundaries.mjs`, `validate-dependency-ceiling.mjs` — extend scope to the new packages, do not fork a second validator):

- `react-core` importing from `react` (reverse dependency).
- Any runtime dependency on `primereact` or `@primeuix/*` (ADR-004, enforced identically to Angular).
- Circular package dependencies within the new packages or against existing ones.
- Framework-specific (React) logic leaking into `packages/uix-*` — the framework-neutral packages remain untouched by Phase 3 except where §8 explicitly names a *new* consumer of an *existing* export (`createStyleElement`), never a new export added *for* React's benefit alone without evaluating whether it belongs at the UIX layer instead.
- Component-specific logic unnecessarily promoted into `react-core` — the bar is "demonstrated by at least two proof-set components," matching the standard already applied throughout §7/§19/§20 (e.g. `invalid`→`aria-invalid` stays component-local until a second consumer exists).

---

## 29. Performance

**No claims are made about tree-shaking success, bundle size, or runtime overhead without real measurement** — per this spec's explicit instruction and Phase 2's own documented gap (ROADMAP.md follow-up #1: the `UButton`-pulls-in-`UDialog` failure could only be measured with a real consuming application, which did not exist).

### What can be validated this phase (package-level only)

- Build output shape: real ESM with genuine subpath exports (§3) — structurally avoids the specific failure mode Phase 2 documented (`ng-packagr`'s partial-Ivy output lacking `@__PURE__` annotations; `tsup`/esbuild's output does include them), but this is a structural argument, not a measured result.
- Style injection cost: the `ReactStyleSheet` adapter (§8) registers once per component name (dedup via `StyleSheet.has()`), not per-render or per-instance — verified by test (§23), not merely asserted.
- Overlay creation: Portal/FocusTrap/motion mount cost is bounded by React's own reconciliation — no additional Ultimate-introduced overhead beyond the verified PrimeReact shape being reimplemented.
- Repeated mount/unmount: covered by the cleanup test category (§23) — verifies no listener/registry leak accumulates, which is a correctness property with performance implications (unbounded leak growth), not a throughput benchmark.
- Multiple dialogs/tooltips: covered by §11's (Escape priority) and §16's (scroll-blocking) explicit multi-instance test categories.

### Explicitly deferred (requires a real consumer app, out of Phase 3 scope per §24)

- Actual bundle size measurement.
- Actual tree-shaking verification (does importing `UButton` alone actually exclude `UDialog` from a real app's bundle).
- Runtime performance profiling under realistic render load.

---

## 30. Inventory and Future Migration

Phase 3 implements exactly the five proof-set components (§5). The remaining PrimeReact 10.9.9 inventory (111 of the 116 verified `components/lib/` directories, after subtracting the 5 proof-set components plus their direct infrastructure already covered in §6) is **not** classified component-by-component in this spec — doing so would require the same evidence-backed, per-component real-source inspection this Phase applied to the proof set, and applying that rigor to 111 more directories is out of scope for a foundation-establishing phase.

**Explicitly rejected**: assigning every remaining component to an artificial "Phase 3.x" split. Future phases determine their own scope through the same research/brainstorm/Real-Source Verification Gate process this Phase used — not by this spec pre-allocating work it has not verified.

**What can be stated now, as a starting-point signal, not a commitment**: Angular's `COMPONENT_INVENTORY.md` classification (ADAPT / NOT NEEDED / NEEDS ARCHITECTURE DECISION per category) is PrimeNG-derived and **not directly valid evidence for PrimeReact's real structure** (confirmed during this Phase's research — real naming/dependency differences exist, e.g. PrimeReact 10 retaining legacy directory names like `dropdown`/`chips`/`inputswitch` that PrimeNG 21 has already renamed away from). A React-native component inventory, built the same evidence-based way this spec's proof-set sections were, is real future work — not pre-committed here.

---

## 31. Risk Register

| Risk | Likelihood | Impact | Mitigation | Detection | Owner/Phase |
|---|---|---|---|---|---|
| Divergence from verified PrimeReact behavior during implementation (spec says one thing, code drifts) | Medium | Medium | Every behavioral claim in this spec cites its exact source file/line; implementation tasks should re-cite the same evidence, not re-derive from memory | Code review against this spec; provenance manifest cross-check | Phase 3 implementation |
| Premature API design (a prop/shape added without proof-set justification) | Low | Low-Medium | §7/§19/§20's explicit "two-consumer" bar before promoting anything to `react-core` | Spec self-review (§35, this document); PR review | Phase 3 implementation |
| Insufficient upstream test coverage misread as "nothing to test" | Medium | High | §23 explicitly states Checkbox/Dialog/Menu/FocusTrap have zero upstream tests and requires Ultimate-authored coverage regardless | Test coverage review before Phase 3 exit | Phase 3 implementation |
| Overlay complexity creep (a shared orchestration service gets built speculatively) | Low | Medium | §13 explicitly follows the proven "component-local wiring" pattern from both verified PrimeReact and already-shipped Angular `UDialog` | Architecture review; package boundary check (§28) | Phase 3 implementation |
| Accessibility regression relative to verified upstream | Low | High | §26's per-component table is source-confirmed; §23 requires regression tests for both intentional deviations | Vitest+RTL accessibility assertions | Phase 3 implementation |
| Style injection/SSR issues (the `ReactStyleSheet` adapter's `typeof document` guard has an edge case) | Medium | Medium | §8's adapter design explicitly SSR-guards; §23 requires an explicit SSR-sensitive test category | Test suite; manual SSR smoke check if/when a real consumer app exists | Phase 3 implementation |
| Tree-shaking assumptions stated as fact without measurement | Medium (if not carefully worded) | Medium (credibility/spec-trust risk, not a runtime risk) | §29 explicitly refuses to claim success without a real consumer app; structural argument only | Spec self-review (§35) | Phase 3 (documentation discipline) |
| Dependency leakage (`react-transition-group`, PrimeReact runtime, Angular CDK) | Low | High (violates ADR-004) | §17 explicitly excludes `react-transition-group`; §28's CI boundary validator extended to new packages | `validate-dependency-ceiling.mjs` CI run | Phase 3 implementation |
| Future React compatibility (React 20+ ships with breaking changes) | Low (not yet applicable) | Medium | §27's evidence-based, independently-evaluated policy — not tied to PrimeReact's cadence | Re-run the same evidence process when it happens | Future phase |
| Provenance/licensing mistakes (PrimeReact 11 source accidentally referenced) | Low | High (licensing violation) | §1's explicit boundary — PrimeReact 11 confirmed non-MIT, never cached, never read as source, npm metadata only | Provenance manifest review; §22's file-level records | Phase 3 implementation |
| Over-abstraction in `react-core` (building a general hook library speculatively) | Medium | Medium | §7's explicit "only proven recurring requirements" scope, §6's per-hook justification table | Architecture review against §6's verified-necessity table | Phase 3 implementation |

---

## 32. Intentional Deviations Table

| Area | PrimeReact 10.9.9 verified reference | UltimateReact decision |
|---|---|---|
| Tooltip accessibility | No verified `aria-describedby` link from target to panel | Add it — additive to any existing `aria-describedby` value, owned-ID-only removal on cleanup, multi-tooltip-same-target explicitly a non-goal (§9) |
| Menu focus | `aria-activedescendant` (verified) | Preserve — diverges from Angular's literal-focus `UMenu` by design (§10) |
| Escape handling | Shared priority-queue mechanism (verified, `useGlobalOnEscapeKey`+`useDisplayOrder`) | Preserve behavior, reimplement independently in react-core (§11) |
| FocusTrap | Sentinel-span mechanism (verified) | Preserve mechanism, Ultimate-owned implementation reusing existing `getFirstFocusableElement`/`getLastFocusableElement` (§14) |
| Motion | `react-transition-group`'s `CSSTransition` (verified) | Use `@ultimate/uix-motion`'s `createMotion` instead — no new runtime dependency (§17) |
| Styling | PrimeReact's `useStyle` hook, direct DOM injection (verified) | `@ultimate/uix-styled`'s `StyleSheet` class + a new React-only subclass adapter delegating to `@ultimate/uix-utils/dom`'s `createStyleElement` (§8) |
| Passthrough | Full `pt`/`ptm`/`ptmo` system (verified, ~150 lines in `ComponentBase.js`) | Excluded entirely — Option B, same posture as Angular's ADR-018 (§7) |
| Dialog scroll registry | `document.primeDialogParams`, a global mutable array (verified) | Private, module-scoped `Set`-based registry in react-core (§16) |
| Forms | Per-component controlled patterns, no shared abstraction (verified — confirmed absent in PrimeReact itself) | No global form abstraction in UltimateReact either — matches verified upstream posture, not an Angular-CVA translation (§20) |
| Tooltip target config channel | `data-pr-*` DOM attributes (verified) | Not ported — props passed directly, no stringly-typed attribute channel (§9) |
| Menu keyboard-nav selectors | `data-pc-*` passthrough-dependent attributes (verified) | Ultimate-owned stable data-attribute convention, independent of any passthrough system (§10) |
| Angular styling gap found during this Phase's research | N/A (Angular-side, not PrimeReact) | Not fixed by Phase 3 — recorded as a new Phase 2 follow-up instead (§8) |

---

## 33. Exit Criteria

- [ ] `@ultimate/react-core` and `@ultimate/react` package structure exists, matching §2.
- [ ] `react-core` builds via `tsup` with no errors; ESM output, `.d.mts` declarations, exports map per §3.
- [ ] `react` builds via `tsup` with no errors; subpath exports per component (§3) resolve correctly (verified by an export-resolution Vitest suite, matching Phase 1's precedent).
- [ ] `sideEffects: false`'s package-metadata decision is confirmed by measured bundler behavior, not merely defaulted: the full validation sequence in §3 has run — production build, consumer-like import from built `dist/` output, actual component rendering, confirmed real `<style>` injection under that import, confirmed no required module is dead-code-eliminated, exercised via both direct component/subpath import and barrel import. Do not close this criterion on the metadata decision alone.
- [ ] All five proof-set components (`UButton`, `UCheckbox`, `UDialog`, `UMenu`, `UTooltip`) build and render.
- [ ] `UDialog` ships with no `draggable`/`resizable`/`maximizable` props or behavior (§15) — verified by the explicit negative test in §23, not merely by absence of a task that would have added them.
- [ ] Ultimate-authored test suite passes, covering every category in §23, including explicit regression tests for both intentional accessibility/behavior deviations (§9, §16, §11 vs. ADR-020's documented Angular gap).
- [ ] Accessibility baseline passes at the `source-confirmed` + `runtime-tested` tiers (§26) — `automatically scanned` and `manually validated` tiers are explicitly not required for this exit, matching Phase 2's precedent, and must not be claimed as complete.
- [ ] Styling works in an actual rendered (jsdom, via Vitest+RTL) environment — a real `<style>` element is confirmed present after component mount (§8, §23) — this is the specific regression test that would have caught Angular's silent gap; it must pass for React from day one.
- [ ] Provenance records complete: `docs/architecture/PROVENANCE.md`'s PrimeReact entry updated; `docs/architecture/provenance/react-core.json` and `react.json` created, matching the established schema (§22).
- [ ] No PrimeReact runtime dependency — verified by the extended `validate-dependency-ceiling.mjs` CI check (§22, §28).
- [ ] Package boundary validation passes — no `react-core → react` reverse dependency, no circular dependency (§28).
- [ ] Documentation complete: `packages/react-core/README.md` and `packages/react/README.md`, matching the descriptive depth of `ng-core`'s/`ng`'s existing READMEs (architecture summary, module list, usage example, dependency list).
- [ ] All approved intentional deviations (§32) are documented in the shipped README/provenance content, not only in this spec.
- [ ] Performance/build checks completed **to the degree actually available** per §29 — package-level checks only; no tree-shaking or bundle-size claim is made without a real consumer app, and this criterion is satisfied by that honest scoping, not by a fabricated measurement.
- [ ] The new Phase 2 follow-up recorded in §8 (Angular styling gap) is added to `docs/architecture/ROADMAP.md`'s existing follow-up list, not silently dropped.

**Explicitly not required for Phase 3 exit** (documented, not hidden, per §24/§29): a populated `apps/playground-react`; measured tree-shaking; measured bundle size; axe-core or equivalent automated accessibility scanning; manual accessibility validation.

---

## 34. Decision Record

| Decision | Resolution | Verified against |
|---|---|---|
| Package split | `@ultimate/react-core` + `@ultimate/react` | Blueprint provisional proposal, Phase 2 `ng-core`/`ng` precedent |
| Build tool | `tsup` | Phase 1 precedent (`uix-*`), PrimeReact's own build confirmed as a non-requirement (plain TSX, no Angular-style compiler need) |
| Base architecture | Ultimate-owned, scoped-down (Option B pattern) | `ComponentBase.js` full read; ADR-018 precedent |
| Passthrough exclusion | Full `pt`/`ptm`/`ptmo` excluded | `ComponentBase.js` full read (~150 lines of resolution logic) |
| Proof set | Button, Checkbox, Dialog, Menu, Tooltip | Real import-closure inspection (§6), not category assumption |
| Tooltip API | Ref-target primitive + `tooltip` prop sugar | `Tooltip.js`, `Button.js:136`, `Checkbox.js:175`, all 13 `Tooltip.spec.js` tests |
| Tooltip accessibility improvement | Add `aria-describedby`, additive/owned-ID-only-cleanup contract, multi-tooltip-same-target a non-goal | Verified gap in `Tooltip.js` (no such wiring found) |
| Menu focus model | `aria-activedescendant` | `Menu.js:476`, full keyboard-handler read |
| Escape mechanism | Shared priority-queue, reimplemented in react-core | `useGlobalOnEscapeKey.js`, `useDisplayOrder.js`, full reads; ADR-020's documented Angular gap |
| Z-index reuse | Direct reuse of `@ultimate/uix-utils/zindex`, no redesign | `ZIndexUtils.js` vs `uix-utils/zindex/index.ts`, line-by-line comparison |
| Scroll coordination | Private react-core `Set`-based registry, not `document.primeDialogParams` | `Dialog.js` full read; `uix-utils/dom`'s `blockBodyScroll`/`unblockBodyScroll` confirmed already built |
| FocusTrap | Sentinel-span mechanism, Ultimate-owned implementation | `FocusTrap.js`, `FocusTrapBase.js` full reads; `uix-utils/dom`'s focusable-element helpers confirmed present |
| Motion | `@ultimate/uix-motion/createMotion`, no `react-transition-group` | `CSSTransition.js` full read (confirms real `react-transition-group` dependency upstream); `uix-motion/config/index.ts` full read (confirms Promise-based, framework-agnostic alternative already exists) |
| Forms approach | No CVA-equivalent abstraction; per-component controlled contract | `Checkbox.js`/`checkbox.d.ts` full read confirms PrimeReact itself has none |
| Styling integration | `StyleSheet` reuse + new React-only `createStyleElement` adapter | `useStyle.js` full read; `StyleSheet`/`ngCoreStyleSheet` full read revealing the real Angular-side gap; `uix-utils/dom`'s `createStyleElement` confirmed as the existing fix |
| React compatibility ownership | Independent Ultimate policy, not tied to PrimeReact's cadence | `npm view primereact@10.9.9 peerDependencies`, version-scoped query |

---

## Non-Goals (consolidated)

- Full PrimeReact catalog migration (§30).
- Visual baseline / Storybook tooling (Phase 2 precedent, ADR-023).
- A populated `apps/playground-react` consumer app (§24) — candidate future work, not committed here.
- Full `pt`/`ptm`/`ptmo` passthrough support (§7).
- Any Angular-CVA-style forms abstraction (§20).
- Fixing Angular's parallel styling gap (§8) — tracked as a new, separate Phase 2 follow-up.
- Data-grid-class component architecture (Table/Tree/etc.).
- Measured tree-shaking or bundle-size validation (§29).
- Automated accessibility scanning (axe-core or equivalent) (§26).
- Draggable/resizable/maximizable Dialog features, despite verified upstream support (§15) — explicitly scoped out of the proof set.
- Ripple integration for Button/Dialog/Menu, despite verified upstream usage (§6) — deferred as a separate primitive, matching Angular's own Phase 2 precedent of building `URipple` independently.
