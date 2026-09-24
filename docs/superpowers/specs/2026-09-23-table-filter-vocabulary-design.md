# Specification — Table Filter Vocabulary Remainder (DECISION-C)

**Status:** Spec Review passed 2026-09-23 (amendment applied: Angular `custom` binding consumer-facing contract fixed at Spec level, §3.4.1). Evidence correction applied 2026-09-23 (§3.3, §7, §9: Vue's real `notEquals` absent/empty-filter default corrected from a misreported "matches React" to its actual verified source value, matching Angular — no architectural conclusion changed). Implemented, all 7 Plan tasks complete and reviewed. Second evidence correction applied during final whole-branch review, 2026-09-24 (§3.2: `notIn`'s "17 shared mode names" claim overstated the shared set — `notIn` exists only in real PrimeReact source, absent from PrimeNG/PrimeVue; corrected to 16 genuinely shared names — no architectural or implementation conclusion changed).
**Date:** 2026-09-23
**Branch:** none yet — this specification is authored on `main`, prior to any feature-branch creation, matching the Phase C precedent of committing an approved specification before an implementation branch exists.

**Origin:** the Phase C ordinary-migration next-step assessment (this conversation) that established Phase C's shipped/blocked state after Batch 3's merge, followed by a dedicated DECISION-C architecture-eligibility pass (this conversation) that concluded the remaining Table filter-vocabulary scope requires no new shared foundation, and a subsequent evidence-closure pass (this conversation) that independently re-verified PrimeReact's and PrimeVue's real comparator source directly (the one gap the architecture-eligibility pass had left open) and resolved `custom`'s per-framework treatment. Every scope boundary below traces to one of these three passes or to `docs/architecture/BLUEPRINT_GAPS.md`'s DECISION-C entry itself.

**Required sequence (this document is the Specification step):** Phase C Batch 3 (complete, merged) → Phase C ordinary-migration next-step assessment (complete, this conversation) → DECISION-C architecture-eligibility pass (complete, this conversation — concluded: no new shared foundation required) → Evidence closure (complete, this conversation — PrimeReact/PrimeVue comparator source re-verified, `custom` resolved per framework) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout → merge, per the same gated sequence Batch 3 followed.

**This specification does not implement anything.** It defines the exact, bounded scope, per-framework requirements, and acceptance criteria that a future, separately-gated Implementation Plan must satisfy. No code is written by this document.

---

## 1. Purpose and scope

**Purpose:** Close DECISION-C's one remaining live item — Table's fuller filter-operator vocabulary beyond the string match modes (`contains`, `startsWith`, `equals`) already shipped by the 2026-09-02 Table implementation (Tasks 5/13/19) — as an **ordinary, framework-local extension of the existing Table filter dispatch**, not a new architectural decision.

**In scope, per framework, inside each Table's own existing filter-dispatch function:**

1. **Angular** (`packages/ng/src/table/table.ts`, private `matchesFilter` method) — add the remaining verified comparator cases.
2. **React** (`packages/react/src/table/table.tsx`, module-level `matchesFilter` function) — add the remaining verified comparator cases.
3. **Vue** (`packages/vue/src/table/Table.vue`, module-level `matchesFilter` function) — add the remaining verified comparator cases.

**Exact match-mode vocabulary in scope: 15 remaining modes total — 14 comparator modes plus 1 extension mode (`custom`)** — all 15 already named by `@ultimate/uix-data`'s existing `FilterMatchMode` type (`packages/uix-data/src/filter/index.ts`) and not yet dispatched by any framework's `matchesFilter`:

- **14 comparator modes:**
  - **String (remainder, 3):** `notContains`, `endsWith`, `notEquals`.
  - **Numeric/generic comparison (5):** `lt`, `lte`, `gt`, `gte`, `between`.
  - **Set membership (2):** `in`, `notIn`.
  - **Date (4):** `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`.
- **1 extension mode:** `custom` — see §3.4 for its binding per-framework contract. It is an extension point (an application-supplied predicate resolved at runtime), not a fixed comparator, so it is scoped and specified separately from the 14 comparator modes.

**Out of scope, entirely, for this specification and its eventual Implementation Plan:**

- TreeTable, Tree, TreeSelect, Angular OrganizationChart — DECISION-D, protected, not touched or reopened.
- Chart, Editor — DECISION-B, not touched or reopened.
- Any other Phase C capability, batch, or migration candidate — this specification is scoped exclusively to Table's own filter-dispatch functions in the 3 files named above.
- A new shared comparator service, match-mode registry, or any `@ultimate/uix-data` runtime addition — the eligibility pass concluded, and this specification confirms, that none is required (§4).
- The `{operator, constraints}` group-combination mechanism (AND/OR across multiple `FilterMetadata` entries) — already implemented and tested for all 3 frameworks by the original Table work; this specification adds comparator cases consumed by that existing mechanism, it does not change the mechanism itself.
- Any change to `FilterMatchMode` or `FilterMetadata`'s existing shape in `packages/uix-data/src/filter/index.ts` — the type already names all 18 modes correctly; no addition or edit is authorized.
- DECISION-C itself as an architectural question — this specification implements its already-concluded resolution (§4), it does not reopen or re-derive it.

---

## 2. Human decisions this specification implements (binding, not reopened here)

1. **No new shared foundation is required for the remaining filter vocabulary** — the DECISION-C eligibility pass's own conclusion, accepted as binding evidence, not re-derived here.
2. **The existing `@ultimate/uix-data` 18-mode `FilterMatchMode` taxonomy remains the shared vocabulary** — unchanged, not extended, not narrowed.
3. **Comparator behavior remains framework-local** — each framework's own `matchesFilter` gains its own comparator cases; no cross-framework comparator function or shared dispatch is introduced.
4. **`custom` is resolved independently per framework** (§3.4) based on direct, this-conversation source verification of PrimeNG's, PrimeReact's, and PrimeVue's real `FilterService`-equivalent `register()` mechanism — not assumed from naming parity.
5. **DECISION-D remains untouched** — no task this specification authorizes reads, tests, or reasons about Tree/TreeTable/TreeSelect/Angular OrganizationChart source.

None of these decisions is reopened by this specification.

---

## 3. Filter-vocabulary scope — exact, no more

### 3.1 Evidence: current Ultimate Table filter architecture (all 3 frameworks, verified this conversation)

| Framework | File | Mechanism | Currently dispatched |
|---|---|---|---|
| Angular | `packages/ng/src/table/table.ts:195-210` | Private class method `matchesFilter(row, field, filter)`, `switch (filter.matchMode)` | `contains`, `startsWith`, `equals` |
| React | `packages/react/src/table/table.tsx:97-108` | Module-level function `matchesFilter<T>(row, field, filter)`, `switch (filter.matchMode)` | `contains` only |
| Vue | `packages/vue/src/table/Table.vue:126-137` | Module-level function `matchesFilter(row, field, filter)`, `switch (filter.matchMode)` | `contains` only |

Every unhandled mode in all 3 frameworks currently falls to a `default: return true` (pass-through, not silently wrong-filtering) — a `// NEEDS IMPLEMENTATION-TIME VERIFICATION: ...` comment lists exactly the modes this specification now resolves. All 3 already wire this function into the existing `{operator, constraints}` group-combination mechanism (React/Vue: object-with-constraints-array shape; Angular: array-of-alternatives shape) — that mechanism is unchanged by this specification.

Both React and Vue's `matchesFilter` are standalone module-level functions (not component methods); Angular's is a private class method. This existing structural difference is unaffected by this specification and is not a target for harmonization (§4 item 3, no forced API-shape parity).

`equals` for row/value identity comparison is already available cross-framework via `equals` re-exported from `@ultimate/uix-utils/object` (`packages/uix-data/src/identity/index.ts:1`) — already imported and used by Table for other purposes; §3.2's `in`/`notIn` cases reuse this same existing utility, introducing no new import surface.

### 3.2 Evidence: pinned Prime source, all 3 frameworks, comparator bodies (re-verified this conversation, direct extraction)

Extracted directly from `.vendor-cache/` tarballs this conversation (not inferred from documentation, naming, or a prior pass's partial read):

| Framework | Pinned source file | Commit |
|---|---|---|
| Angular | `packages/primeng/src/api/filterservice.ts` | `c493b1c6d9f7cdffbe1c4dc195493dd73d733593` (PrimeNG 21.1.9) |
| React | `components/lib/api/FilterService.js` | `d0f574e39122668292fc7a740f081bae1b93b1e9` (PrimeReact 10.9.9) |
| Vue | `packages/core/src/api/FilterService.js` | `66dde6788220fc9e6822342919d1ceb0e3460ece` (PrimeVue 4.5.5) |

**Finding: all 3 frameworks' real `FilterService`-equivalent objects carry a near-identical `filters` map**, keyed by 16 shared non-`custom` mode names (`startsWith`, `contains`, `notContains`, `endsWith`, `equals`, `notEquals`, `in`, `between`, `lt`, `lte`, `gt`, `gte`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`; Angular additionally aliases `is`/`isNot`/`before`/`after` to `equals`/`notEquals`/`lt`/`gt`, not separate semantics). **Evidence correction (post-Implementation, source re-verified directly):** an earlier version of this finding claimed 17 shared names including `notIn` — that overstated the shared set. Direct re-extraction confirms `notIn` exists only in real PrimeReact source (`components/lib/api/FilterService.js`); it is genuinely absent from both PrimeNG's `filterservice.ts` and PrimeVue's `FilterService.js` (`grep -c "notIn"` returns 0 for both). This does not change any architectural conclusion — `notIn` remains correctly listed in `@ultimate/uix-data`'s `FilterMatchMode` type (§1) as the straightforward negation of `in`, and Angular's/Vue's real, shipped `notIn` implementations are ordinary, reasonable comparator logic, not a port of nonexistent upstream source; only this finding's own "17 shared names" citation was inaccurate. Comparator bodies are functionally identical across the 16 genuinely shared modes — numeric/date comparisons use `.getTime()` when both operands expose it, otherwise plain `<`/`<=`/`>`/`>=`/`===`; `between` checks an inclusive `[low, high]` two-element array; `in`/`notIn` iterate a filter array using the framework's own `equals` utility. Vue's date comparators additionally coerce string-typed operands via `new Date(...)` before comparing (React's and Angular's do not — see §3.3's edge-case note).

This confirms the comparator **semantics** (what "numeric between" or "date before" means) are genuinely shared across the 3 Prime frameworks — but this is evaluated here as **Prime-side API-naming and behavior coincidence**, not as evidence that Ultimate needs a shared implementation: each comparator body is a trivial, self-contained pure function (one boolean expression) that is exactly as easy to write once per framework as to share, and Table's own filter-dispatch structure is already framework-local by design (§3.1, unchanged since the original Table implementation). No comparator body in this specification's scope crosses 10 lines or references any framework-specific API — none requires porting logic that only exists once.

### 3.3 Edge cases actually verified (binding on the Implementation Plan's own test cases)

- **`between`** treats `filter == null || filter[0] == null || filter[1] == null` as pass-through (`true`), and is otherwise inclusive on both bounds (`low <= value && value <= high`).
- **`lt`/`lte`/`gt`/`gte`** treat an `undefined`/`null` filter value as pass-through (`true`); a `null`/`undefined` row value fails the comparison (`false`) once a real filter value is present.
- **`in`/`notIn`** treat an empty or absent filter array as pass-through (`true`); membership is tested with `equals`, already imported from `@ultimate/uix-utils/object` (§3.1), not `===`, so it matches the same identity semantics Table already uses elsewhere.
- **`notEquals`**: Angular and Vue's real bodies return `false` for an absent or empty-string filter value (does not match); React's real body returns `true` for the same condition (matches). **Evidence correction (post-Spec-Review, source re-verified directly):** an earlier draft of this Spec stated "Vue matches React" — that was a misreport of this same source, not a re-derivation; the real `packages/core/src/api/FilterService.js` (PrimeVue 4.5.5, commit `66dde6788220fc9e6822342919d1ceb0e3460ece`) reads `if (filter === undefined || filter === null || filter === '') { return false; }`, identical in outcome to Angular's real `filterservice.ts` (`if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) { return false; }`), and the opposite of React's real `FilterService.js` (`if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) { return true; }`). All 3 frameworks additionally check for an explicit empty string, not only `undefined`/`null` — the earlier "absent filter" framing undercounted the condition; the correct condition is "absent, `null`, or empty/whitespace-only string." **This is a genuine, real, verified cross-framework Prime-source divergence in one specific edge case (Angular+Vue: `false`; React: `true`)**, not a porting error — the Implementation Plan's own task for each framework must follow that framework's own verified real default, not force one shared choice.
- **Date comparators** (`dateIs`/`dateIsNot`/`dateBefore`/`dateAfter`) compare via `.toDateString()` (day-level equality, ignoring time-of-day) for `dateIs`/`dateIsNot`, and `.getTime()` for `dateBefore`/`dateAfter`. Vue's real source additionally accepts a string-typed `value`/`filter` and coerces via `new Date(...)` before comparing; Angular's and React's real sources assume both operands are already `Date` instances (no string coercion). **The Implementation Plan's own per-framework task must follow each framework's own verified real behavior** — Vue's string-coercion is not a bug to "fix" into matching Angular/React, and Angular/React are not missing behavior by not coercing.
- Ultimate's existing `contains`/`startsWith`/`equals` cases (already shipped) resolve cell values through `String(...)` coercion first (`resolveCell(row, field) ?? ""`, then `.toLowerCase()`) — this pre-existing pattern is string-only and does not extend to numeric/date comparison; the new comparator cases in this specification's scope must accept the row's actual typed value (number, `Date`, etc.) as `FilterMetadata.value` already allows (`unknown`), not force a string coercion that would break numeric/date comparison.

### 3.4 `custom` — binding consumer-facing contract per framework, resolved this conversation

**Real Prime mechanism, verified identical in shape across all 3 frameworks:** each framework's real `FilterService`-equivalent exposes `register(rule: string, fn: Function): void`, which mutates the shared `filters` map so that a subsequently-used `matchMode` value (conventionally `'custom'`, but not restricted to that literal string) resolves to the newly-registered predicate. `FilterMatchMode.CUSTOM = 'custom'` (PrimeReact's `FilterMatchMode.js`) is a recognized name, not a dispatched case — `custom` is never itself present as a `case` inside any of the 3 frameworks' own `filters` maps; it only resolves once a consuming application has called `register('custom', someFn)`.

**Finding: `register()` is not Angular-specific.** All 3 frameworks' real `FilterService`-equivalents expose the identical mechanism — a mutable `filters` dictionary plus a `register` setter — as plain object mutation. Angular wraps its instance in `@Injectable({ providedIn: 'root' })` for DI-container convenience; React's and Vue's are plain exported module objects (`FilterService.filters[rule] = fn`). The *mechanism* itself (mutate a dispatch table, then reference the new key by name) requires no framework-specific runtime feature in any of the 3 — it is exactly as buildable as a plain exported mutable object or a small registration function in React/Vue as it is as an Angular injectable.

**Resolution, per framework, for this specification's scope: Angular supports `custom`; React and Vue do not.** For Angular, this is a public consumer-facing API decision, and per Spec Review, that contract is fixed here — not deferred to the Implementation Plan. The Plan chooses the internal implementation mechanism (a service, a registry object, an injection token, or another existing framework-native mechanism); it does not invent or alter any element of the contract below.

#### 3.4.1 Angular `custom` — binding contract (consumer-facing; internal mechanism is Plan-level)

- **Ownership of registration:** the Ultimate Angular `UTable` component itself owns the registered-predicate table for its own instance. Ultimate does not introduce an application-wide singleton registry as a Spec-level requirement — Prime's real `providedIn: 'root'` shape is DI-container plumbing internal to that mechanism, not a consumer-facing requirement this contract inherits.
- **Registration scope: Table-scoped, not global/shared.** Each `UTable` instance resolves `custom` predicates only from registrations made against that same instance (directly, or via an Angular DI scope no wider than that Table's own injector hierarchy, at the Plan's choice). A predicate registered on one `UTable` instance must not be reachable from a different, unrelated `UTable` instance elsewhere in the same application. This is narrower than Prime's real root-singleton shape by design — a global mutable registry shared across unrelated Table instances is explicitly not required and not authorized as this contract's default.
- **Registration key / rule-name contract:** a registration key is a non-empty `string`. The reserved name `'custom'` is the conventional key a `FilterMetadata.matchMode` value of `'custom'` resolves against by default, matching Prime's own convention (this section's own opening paragraph). The contract does not require support for arbitrary non-`'custom'` key names beyond this reserved one — that generalization (Prime's own `register(rule, fn)` accepting any `rule` string) is not part of this specification's bound scope; the Plan may implement the general form, but only supporting the reserved `'custom'` key satisfies this contract.
- **Predicate callback contract — input:** `(value: unknown, filter: unknown, filterLocale?: string) => boolean`, matching the real Prime signature and the shape every other comparator in §3.2/§3.3 already follows (row's resolved field value, the `FilterMetadata.value`, and an optional locale string). **Output:** a `boolean` — `true` if the row value matches the filter, `false` otherwise. The predicate must be a pure function with respect to Table state: it receives only these two/three arguments and must not depend on hidden mutable Table internals to produce its result.
- **Resolution — how a `filter.matchMode` value resolves to a registered predicate:** when `matchesFilter` dispatches a `FilterMetadata` whose `matchMode` is `'custom'`, the Table looks up a predicate previously registered under the key `'custom'` for that same Table instance (Table-scoped, per the registration-scope contract above) and invokes it with the row's resolved field value and the `FilterMetadata.value` (and `filterLocale` if the Table's own locale-aware comparators already carry one — matching the existing `contains`/`startsWith`/`equals` cases' own signature, §3.1). If no predicate is registered under `'custom'` for that instance at filter time, the row does not match (`false`) — an unregistered `custom` mode must not silently pass every row through (`default: return true` is the existing pass-through for genuinely *unhandled* mode names in §3.1; `custom` with no registration is a *handled* mode with a defined empty-registry outcome, and that outcome is "matches nothing," not "matches everything").
- **Duplicate-registration behavior:** registering a second predicate under the same key (`'custom'`) for the same Table instance **replaces** the previously registered predicate — matching Prime's own real `register()` behavior (`this.filters[rule] = fn`, unconditional assignment, no duplicate-detection or rejection). Ultimate's Angular contract does not require throwing, warning, or otherwise rejecting a re-registration; the last registration for a given instance and key wins.
- **Lifecycle / scope expectations relevant to consumers:** a registration is expected to remain valid for the lifetime of the `UTable` instance it was registered against (or the DI scope the Plan chooses, provided that scope does not outlive or leak across unrelated Table instances, per the Table-scoping requirement above). Registration timing relative to Table initialization, and whether re-registration triggers an immediate re-filter of already-rendered rows, are Plan/task-level detail (§12) — this contract does not require synchronous re-filtering on registration, only that the most recently registered predicate is used for any filter evaluation that occurs after registration completes.

#### 3.4.2 React and Vue `custom` — behavioral requirement (explicit scope cut, not an open question)

- **No application-supplied custom predicate is executable through `custom` under this specification's scope**, for either React or Vue Table. This is a settled behavioral requirement, not an unresolved architectural question — the real Prime mechanism (§ above) proves React/Vue could support it, but this specification does not authorize building that support.
- **No React or Vue registration API is introduced** — no new prop, no new exported function, no new module-level mutable object, and no other public surface that would let a consuming application register a `custom` predicate for either framework's Table.
- **The exact internal handling of an unregistered `custom` `matchMode` value remains Plan-level implementation detail** (§12), **provided it cannot accidentally become working custom-predicate support** — i.e., whatever the Plan chooses (falling through to the existing `default: return true` pass-through, or an explicit `case 'custom': return false`, or another deterministic outcome) must not, now or by incidental future refactor, read from or invoke any application-supplied function. The binding requirement is the absence of an executable registration path, not which specific inert value `custom` resolves to.

This asymmetry (Angular: supported per §3.4.1's binding contract; React/Vue: no executable path per §3.4.2) is **not** a claim that React/Vue cannot architecturally support `custom` — the real Prime mechanism proves they could. It is a scope decision: this specification closes DECISION-C's *named* remainder (the comparator vocabulary), and extending an executable `custom` mechanism to React/Vue is new API-surface design that was never itself the subject of DECISION-C's own text (`BLUEPRINT_GAPS.md`'s DECISION-C entry lists "the fuller filter-operator vocabulary beyond string match modes" — a registration mechanism is not a comparator). A future specification may extend `custom` to React/Vue if a concrete consumer need surfaces; this specification does not pre-authorize or preclude that.

---

## 4. Architectural conclusion (binding — the eligibility question this specification closes)

**Conclusion, reached by the DECISION-C eligibility pass and confirmed by this specification's own re-verified evidence (§3.2, §3.4): the remaining Table filter-vocabulary scope is resolvable entirely within Ultimate's current architecture. No new shared foundation, no new `@ultimate/uix-data` runtime addition, and no ADR is required.**

Basis:

1. The shared vocabulary already exists correctly, as a type only (`packages/uix-data/src/filter/index.ts`) — nothing to add or change there.
2. Each framework's filter dispatch is already framework-local by design, already in place, already tested for 3 modes — the remaining 14 comparator modes are the same shape of addition as the 3 already shipped, inside the same existing `switch` statements.
3. Comparator bodies are trivial pure functions with no framework-specific API dependency — genuinely portable *as independently-written code*, not requiring a shared implementation to avoid duplication that would be architecturally meaningful.
4. `custom`'s real mechanism (§3.4) is confirmed framework-agnostic in principle. Angular's own contract is now fixed at Spec level (§3.4.1); extending an executable path to React/Vue is new API-surface design outside this specification's bounded scope, not a blocked architectural question — no protected decision gates it, no new foundation is required if a later specification takes it up.
5. This directly matches the already-established Batch 3/DECISION-C precedent (`BLUEPRINT_GAPS.md` DECISION-C entry, OrderList/PickList/DataView resolution): "this asymmetry does not require a new shared foundation; where it exists, it already routes through the existing mechanism."

---

## 5. Implementation model (binding on the eventual Plan)

1. **Framework-local extension only** — every task the Implementation Plan creates adds comparator cases to an existing `switch` statement in one of the 3 files named in §1; no task creates a new file, new package, or new shared export.
2. **No `@ultimate/uix-data` change** — `FilterMatchMode`/`FilterMetadata` are already correct and complete; no task edits `packages/uix-data/src/filter/index.ts`.
3. **No forced API-shape parity across frameworks** (consistent with every prior Ultimate component and Batch 3's own §4 item 6) — Angular's `custom` support, bound by §3.4.1's exact consumer-facing contract, and React's/Vue's `custom` cut (§3.4.2) is the clearest instance of this rule in this specification; it must not be flattened to one shared choice across frameworks. **The Plan may choose Angular's internal implementation mechanism freely (service, registry object, injection token, or another existing framework-native mechanism) but must satisfy every element of §3.4.1's contract — ownership, scope, key contract, callback signature, resolution behavior, duplicate-registration behavior, and lifecycle expectations — without inventing or narrowing any of them.**
4. **Each framework's own verified real edge-case behavior governs its own implementation** (§3.3) — `notEquals`'s absent-filter default and date-comparator string-coercion are not to be harmonized across frameworks where real Prime source itself diverges.
5. **Proof-by-exception applies** — if implementation reveals a genuinely new architectural pattern, an unresolved dependency, or a real-source finding that contradicts §3's evidence, implementation halts on that specific case and escalates; it does not silently reinterpret this specification's scope.
6. **This specification does not authorize touching TreeTable** — TreeTable's blocker is DECISION-D (Tree-mechanism protection), not this filter-vocabulary remainder; closing this specification's scope does not make TreeTable eligible for anything.

---

## 6. Reuse of existing Ultimate foundations (binding — no new foundation work)

| Framework | Foundation reused | Evidence |
|---|---|---|
| Angular, React, Vue | Existing `matchesFilter` dispatch function/method | §3.1 |
| Angular, React, Vue | Existing `FilterMatchMode`/`FilterMetadata` types | `packages/uix-data/src/filter/index.ts` |
| Angular, React, Vue | Existing `equals` utility (row/value identity, reused for `in`/`notIn`) | `packages/uix-data/src/identity/index.ts:1`, re-exported from `@ultimate/uix-utils/object` |
| Angular, React, Vue | Existing `{operator, constraints}` group-combination mechanism | Already implemented and tested by the original Table work; unchanged by this specification |

No new base-class tier, no new shared package export, and no new architectural pattern is authorized by this specification.

---

## 7. Framework-specific requirements where evidence requires them

- **All 3 frameworks — comparator bodies are written independently per framework**, not shared, per §4/§5 item 3's own conclusion that no genuine architectural duplication problem exists.
- **All 3 frameworks — `notEquals`'s absent/empty-filter default follows each framework's own verified real value** (§3.3): Angular `false`, Vue `false`, React `true`. This is a real, source-confirmed divergence, not an inconsistency to fix.
- **Vue only — date comparators accept string-typed operands via internal `new Date(...)` coercion**, matching real PrimeVue source; Angular/React do not add equivalent coercion, matching their own real source (§3.3).
- **Angular only — `custom` gains a Table-scoped registration surface satisfying §3.4.1's exact binding contract** (internal implementation mechanism: Implementation Plan/task-level choice; the contract itself — ownership, scope, key, callback signature, resolution, duplicate behavior, lifecycle — is fixed at Spec level, not Plan-level); **React and Vue do not** — explicit, settled scope cut, not an open question (§3.4.2).

---

## 8. Exclusions and deferred items — reasons restated for traceability

| Item | Reason | Source |
|---|---|---|
| Tree, TreeTable, TreeSelect, Angular OrganizationChart | DECISION-D, protected, not reopened | `BLUEPRINT_GAPS.md` DECISION-D entry |
| Chart, Editor | DECISION-B, not reopened | `BLUEPRINT_GAPS.md` DECISION-B entry |
| Any new shared comparator service, registry, or `uix-data` runtime addition | Eligibility pass's own conclusion: not required | §4 |
| `custom` for React and Vue | Explicit scope cut — new API-surface design outside this specification's bounded remainder | §3.4 |
| `{operator, constraints}` group-combination mechanism itself | Already implemented and tested; unchanged by this specification | §1, §5 item 6 |
| Any other Phase C capability or future batch | Not this specification's scope | §1 |

---

## 9. Testing / verification expectations

For each framework, for each of the 14 comparator modes in scope (§1) plus the 1 extension mode (`custom`, §3.4):

1. **Unit tests covering each comparator's own verified real behavior**, including the specific edge cases named in §3.3 — `between`'s inclusive-bounds and null-passthrough behavior, `lt`/`lte`/`gt`/`gte`'s null-passthrough and type-comparison behavior, `in`/`notIn`'s empty-array passthrough and `equals`-based membership, `notEquals`'s per-framework absent/empty-filter default (Angular `false`, Vue `false`, React `true` — the divergence itself must be asserted, not incidentally passed), and date comparators' day-level (`dateIs`/`dateIsNot`) vs. time-precise (`dateBefore`/`dateAfter`) semantics, including Vue's string-coercion behavior specifically (a test asserting Vue accepts a string date operand; no equivalent test asserts this for Angular/React, since their real source does not support it).
2. **Angular's `custom` registration surface** requires tests proving every element of §3.4.1's contract: a predicate registered under `'custom'` is dispatched when a row is filtered with `matchMode: 'custom'`; a second registration under the same key replaces the first (duplicate-registration behavior); an unregistered `custom` mode matches no rows (`false`, not pass-through `true`); and a predicate registered against one `UTable` instance is not reachable from a second, unrelated `UTable` instance (Table-scoping).
3. **React's and Vue's `custom` mode name** requires a test proving the negative behavioral requirement in §3.4.2: no mechanism in the public API allows an application-supplied predicate to be registered or invoked for `custom`, and whatever inert value `custom` resolves to (pass-through or explicit non-match) is deterministic and covered by a test — not merely untested by omission.
4. **No regression** to the already-shipped `contains`/`startsWith`/`equals` cases or to the existing `{operator, constraints}` group-combination mechanism — the full existing Table test suite passes after each task, not just the new comparator tests.
5. **No regression** to any other already-Built component or foundation tier — the full monorepo test suite passes after each task.
6. **Dependency-ceiling gate** (`validate-dependency-ceiling.mjs`) passes after every task — this specification introduces no new dependency, so this is a regression check, not an anticipated change.
7. **Documentation update at closeout**: `COMPONENT_INVENTORY.md`'s Table row and `BLUEPRINT_GAPS.md`'s DECISION-C entry, updated to reflect this remainder's resolution — the exact wording is Implementation Plan/closeout-task detail, not fixed here.
8. **Single Verification pass and single Final Review/Closeout** for the whole of this scope — not per-framework, matching Batch 3's own precedent.

---

## 10. Compatibility and architectural constraints

- **MIT-only baseline** (ADR-005) — unaffected; no new dependency of any kind is introduced by this specification.
- **No forced API-shape parity across frameworks** (ADR-006) — confirmed consistent with §5 item 3, most visibly in `custom`'s Angular-only support under §3.4.1's binding contract (§7) and `notEquals`'s per-framework default (§3.3, §7).
- **No passthrough (`pt`/`ptOptions`) surface** — unaffected, this specification adds comparator logic only, no new prop surface beyond Angular's `custom` registration surface, whose consumer-facing contract is fixed at §3.4.1 (internal mechanism only is an Implementation Plan decision) and which is not a passthrough escape hatch.
- **Package versioning** — this specification does not touch DECISION-E; no package rename or version-scheme change is in scope.

---

## 11. Acceptance criteria (sufficient to support a subsequent Implementation Plan)

This scope is complete when, for all 3 frameworks:

1. All 14 comparator modes named in §1 are dispatched by each framework's existing `matchesFilter` function/method, each following that framework's own verified real edge-case behavior (§3.3), not a forced shared choice.
2. Angular's `custom` mode (the 1 extension mode) is dispatched through a registration surface satisfying every element of §3.4.1's binding contract, tested per §9 item 2; React's and Vue's `custom` mode has no executable registration path, satisfying §3.4.2, tested per §9 item 3 — not silently absent or accidentally functional.
3. §9's testing/verification bar is met for all of the above, including the specific divergence assertions named in §9 item 1 (`notEquals` default, Vue date-string coercion).
4. No change was made to `packages/uix-data/src/filter/index.ts`'s existing `FilterMatchMode`/`FilterMetadata` types.
5. No new shared comparator service, registry, package, or file was introduced anywhere in the monorepo.
6. TreeTable's status is unchanged — still gated on DECISION-D alone, not on this scope.
7. `COMPONENT_INVENTORY.md` and `BLUEPRINT_GAPS.md`'s DECISION-C entry are updated to reflect this remainder's resolution.
8. A single Final Review/Closeout confirms all of the above.

---

## 12. Downstream clarifications — non-blocking, explicitly not Spec-level uncertainties

1. **Angular's internal `custom`-registration implementation mechanism** (a public method on an injectable service, a constructor-injected token, a Table input accepting a predicate map, or another existing framework-native mechanism) is Implementation Plan/task-level detail by design — §3.4.1 fixes the full consumer-facing contract (ownership, scope, key, callback signature, resolution, duplicate behavior, lifecycle) at Spec level; only the internal mechanism satisfying that contract is left to the Plan, matching Batch 3's own precedent for React OrderList's/PickList's `UListbox`-reuse outcome (that specification's own §12 item 2) in kind, though narrower in scope here since the contract itself is no longer open.
2. **The exact inert value an unregistered `custom` mode resolves to in React/Vue** (falling through to the existing `default: return true` pass-through, or an explicit `case 'custom': return false`, or another deterministic outcome) is Implementation Plan/task-level detail — §3.4.2/§9 item 3 require it be deliberate, tested, and incapable of becoming an executable registration path, not that it resolve to one specific value.

Neither item blocks Spec Review or requires any further Spec-level decision.

---

## Status

Spec Review passed 2026-09-23. Awaiting human approval for Implementation Plan authorship.
