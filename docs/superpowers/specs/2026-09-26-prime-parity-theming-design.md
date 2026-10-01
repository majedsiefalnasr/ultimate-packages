# Specification — Theming: Aura Per-Component Preset Coverage Expansion (GAP-064)

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit's residual-Unverified verification "Aura Preset Token Completeness" (`aura-token-verification.md`), the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-064.

**Required sequence:** Research → Verification (residual-Unverified closure) → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for expanding Aura per-component preset token coverage beyond the original Phase 5 5-component proof set, now INCLUDE by human decision.

**In scope:** GAP-064 — `packages/themes/src/presets/aura/`, plus every component's own style module (`packages/{ng,react,vue}/src/*/[component]-style.ts`) that currently uses hardcoded CSS-variable fallbacks instead of `dt()`-based token resolution.

**Out of scope, entirely, for this specification and its eventual Implementation Plan:** Material/Lara/Nora built-in preset catalog breadth — DEFERRED by separate human decision (see §2.2), explicitly not part of this Spec. Aura's `base`-tier foundation tokens — already Parity Confirmed (exact, verbatim match to real Prime), not touched or reopened.

---

## 2. Human Decisions This Specification Implements

1. **GAP-064 is INCLUDE, framework-neutral (Angular/React/Vue all consume the shared `@ultimate/themes` package).**
2. **Material/Lara/Nora built-in preset catalog breadth is explicitly DEFERRED and is a separate decision from this Spec's own scope.** This specification does not add, reference, or imply any work toward those three families. The Final Scope Ledger's own instruction is explicit: "keep Aura per-component preset coverage separate from Material/Lara/Nora catalog breadth — do not merge them." This Spec honors that separation by scoping exclusively to Aura's own per-component coverage.
3. **The `base`-tier foundation tokens (color ramps, semantic tiers) are Parity Confirmed and out of scope** — confirmed exact, verbatim match to real Prime's own `base` module in the residual verification; nothing in this Spec touches `base.ts`.

---

## 3. Framework Applicability

Framework-neutral. `@ultimate/themes` is consumed identically by Angular, React, and Vue via `applyUltimateTheme()`. This gap's scope is the shared preset-module layer, not any one framework's own component source (though the *consumers* of the new preset modules — each framework's own component style files — will need their own follow-up work once this gap's own Spec/Plan defines the sequencing; see §7).

---

## 4. Existing Behavior

Real Prime's shared `@primeuix/themes` package has 88 per-component preset modules. Ultimate has 5 (`checkbox`/`button`/`menu`/`tooltip`/`dialog` — the original Phase 5 proof set). The other ~83 components have real, working, but hardcoded (non-themeable) CSS instead of `dt()`-based token resolution — confirmed via Accordion as a representative sample, self-disclosed in-code, recurring in 54 of Vue's own style-module files. The original 5-component scope boundary (Phase 5 Spec §108/§203/§245) was fully, explicitly disclosed at the time it was written — this gap concerns only the fact that boundary was never revisited as Phase C's real component count grew roughly 15x beyond the original proof set, not the original (still-valid) boundary itself.

---

## 5. Required Behavior

**Externally observable requirement:** for each component in this gap's own eventual scope (exact sequencing determined by the Implementation Plan or a narrower follow-up Spec — see §7), a consumer must be able to override that component's Aura-preset token values via the same `dt()`-based, `applyUltimateTheme({preset})`-consumed mechanism the original 5-component proof set already supports — not merely via CSS custom-property fallback overrides.

**Unresolved, marked explicitly rather than filled by assumption:** the exact component sequencing (which of the ~83 components get a preset module first, in what order, in what batching) is genuinely open — this is a substantial body of work (~83 components' worth of token authoring), not a simple mechanical extension, and this specification does not resolve that sequencing question. **This must be resolved by a dedicated follow-up Spec or by the Implementation Plan's own scoping work**, per GAP-064's own recommended resolution direction.

---

## 6. API Requirements

Each new per-component preset module follows the exact same shape as the original 5-component proof set's own existing modules (`checkbox.ts`/`button.ts`/`menu.ts`/`tooltip.ts`/`dialog.ts`) — a `dt()`-resolvable token object, exported and consumed by `applyUltimateTheme()` the same way the existing 5 already are. No new mechanism, prop, or API surface is introduced by this requirement; only additional preset-module content, following the existing pattern.

---

## 7. Dependency Relationships

None upstream. This gap does not depend on any other GAP in this audit's scope. **A sequencing question remains open** (§5) — resolving it is a prerequisite to writing a concrete Implementation Plan, but is not a hard dependency on any other named GAP.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Material/Lara/Nora's own absence as built-in preset families — DEFERRED, explicitly separate from this Spec, not touched (§2.2).
- The `base`-tier foundation tokens — Parity Confirmed, exact match, not touched (§2.3).
- Components not yet included in this gap's own eventual scope retain their current hardcoded-CSS-variable-fallback mechanism unchanged until/unless they are individually brought into scope by a future sequencing decision.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| Each component brought into this gap's scope gains a `dt()`-resolvable Aura preset module, consumable via `applyUltimateTheme({preset})`, matching the original 5-component proof set's own existing pattern | GAP-064 |
| Components not yet brought into scope remain unaffected (their existing hardcoded-CSS-variable-fallback mechanism is unchanged) | GAP-064 (non-regression) |
| Material/Lara/Nora catalog breadth is not touched by any work under this Spec | GAP-064 (non-regression, per §2.2) |
| `base`-tier foundation tokens are not touched by any work under this Spec | GAP-064 (non-regression, per §2.3) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-064; Aura token-completeness residual verification (`aura-token-verification.md`); Theme catalog residual verification (`theme-catalog-verification.md` — cited only to disclaim scope overlap with the separately-deferred Material/Lara/Nora decision); Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

Material/Lara/Nora built-in preset catalog (DEFERRED, separate decision). `base`-tier foundation tokens (Parity Confirmed). The exact component sequencing/batching plan (unresolved, deferred to a follow-up Spec or the Implementation Plan itself).

---

## 12. Implementation-Stage Corrections (2026-10-01)

A pre-dispatch check of the Plan against real `@primeuix/themes` 2.0.3 and the repository found the following; the user ruled on each before any module was written.

- **No `inputmask` module upstream.** PrimeVue v4 InputMask uses `inputtext` tokens. User decision: drop `input-mask.ts`; InputMask is covered by the ported `inputtext` tokens, as upstream.
- **`tabs` vs `tabview`/`tabmenu`.** All three modules exist upstream. User decision: port `tabs` only for now; `tabview`/`tabmenu` are carried forward for React's `UTabView`/`UTabMenu`.
- **Registration.** The existing five modules are registered in `auraPreset.components`, which is how `applyUltimateTheme` consumes them (§6, §9). User decision: register every new module the same way and record the bundle/emitted-CSS size change.
- **Provenance.** CI's manifest check requires a `themes.json` entry for each new file; entries follow the existing aura ones.
