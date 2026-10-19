# K-7 — Tree-family limited architecture research (2026-10-11)

**Status:** research record, **uncommitted draft** for user review. Authorized by the user on 2026-10-11 (Final Project Completion Assessment, revision 3, ruling K-7). This record does not authorize implementation, does not amend or reinterpret ADR-043, and does not reopen DECISION-D. Recommendations are marked **[Rec]** and need approval.

**Status note (2026-10-19):** committed, no longer an uncommitted draft; the proposals it left pending were decided as ADR-054; see `docs/architecture/DECISIONS.md`, the ADR-054 heading (line 420 as of `94807833`). The text below is the point-in-time record.

**Labels:** [R] repository evidence · [U] pinned upstream source (`.vendor-cache/` tarballs: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5, extracted read-only to a scratch directory) · [D] decision record · [A] assumption or inference · [Rec] recommendation.

**Baseline:** `main` == `99364dc`.

---

## 1. Question

Under ruling S-2, Tree, TreeTable, TreeSelect and OrganizationChart are in the target scope. Can they be built without changing ADR-043 or the protected DECISION-D, and if not, what is the smallest decision that would allow it?

## 2. Recorded decisions that govern the question

| Record                                                                | Tier                                               | What it says                                                                                                                                                                                                                                                                                                                                                                               | Source                       |
| --------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| ADR-043                                                               | DECISIONS                                          | Tree-family identity/selection/expansion was "verified structurally incompatible across frameworks — PrimeNG mutates `TreeNode` object references in place, while PrimeReact and PrimeVue both use external `{[key]: boolean}` key-maps — and is explicitly excluded from any shared contract, **remaining framework-native** unless future evidence establishes genuine shared semantics" | `DECISIONS.md` ADR-043 [D]   |
| DECISION-D                                                            | BLUEPRINT_GAPS §5 (protected marker, AGENTS.md §5) | Question: "should Tree/TreeTable/TreeSelect/OrganizationChart ever get a **shared cross-framework contract**?" Answer for current evidence: no. "Do not open this decision without new repository evidence."                                                                                                                                                                               | `BLUEPRINT_GAPS.md` §5 [D]   |
| DECISION-D OrganizationChart clarification (user-approved 2026-09-21) | BLUEPRINT_GAPS §5                                  | Angular's PrimeNG OrganizationChart imports `TreeNode` and mutates `node.expanded`, so "**Angular OrganizationChart remains excluded, unchanged**"; React and Vue OrganizationChart are outside the protection. "No Angular redesign is authorized or implied."                                                                                                                            | `BLUEPRINT_GAPS.md` §5 [D]   |
| GAP-013                                                               | BLUEPRINT_GAPS §3                                  | ARCHITECTURAL-GAP, HIGH. "What it blocks: Tree, TreeTable, TreeSelect, OrganizationChart **implementation start**." "Revisit only when a real Tree implementation (any one framework) surfaces genuine shared semantics"                                                                                                                                                                   | `BLUEPRINT_GAPS.md` [D]      |
| COMPONENT_INVENTORY                                                   | tracking                                           | Tree, TreeTable: NEEDS ARCHITECTURE DECISION. TreeSelect: ADAPT, Later Phase. OrganizationChart: ADAPT, DECISION-D exception                                                                                                                                                                                                                                                               | `COMPONENT_INVENTORY.md` [R] |
| DECISION-C                                                            | BLUEPRINT_GAPS §5                                  | "TreeTable's real blocker is Tree/DECISION-D (protected, do-not-reopen), not this decision"                                                                                                                                                                                                                                                                                                | `BLUEPRINT_GAPS.md` §5 [D]   |

## 3. Findings

### F-1 — ADR-043 already prescribes the framework-native path

ADR-043 excludes the Tree family from a _shared contract_ and states the components remain _framework-native_. Building each framework's Tree family on its own upstream state model is what ADR-043 describes. It needs no new evidence and no change to ADR-043 [D].

### F-2 — The blocking text sits in the tracking layer, and it is broader than ADR-043

ADR-043 does not say implementation is blocked. GAP-013 ("blocks … implementation start") and the DECISION-D clarification ("Angular OrganizationChart remains excluded") do. In context, "excluded" refers to migration eligibility: the same clarification says React and Vue OrganizationChart "are **not thereby declared migration-eligible**". These entries pair the shared-contract question (protected) with implementation eligibility (not argued separately) [D][A].

**Exact conflict (K7-C1):** S-2 requires the four components; GAP-013 and DECISION-D's clarification record them, or Angular OrganizationChart, as blocked or excluded from implementation. Proceeding without a recorded decision would silently reinterpret a protected entry, which AGENTS.md §5 and §7.5 forbid.

### F-3 — Upstream state models are as ADR-043 recorded (re-verified)

| Component | PrimeNG 21.1.9                                                                           | PrimeReact 10.9.9                                   | PrimeVue 4.5.5                                      |
| --------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Tree      | Node mutation: 10 `node.expanded` references, 11 `partialSelected`, 0 `expandedKeys` [U] | Key-maps: 18 `expandedKeys`, 41 `selectionKeys` [U] | Key-maps: 21 `expandedKeys`, 51 `selectionKeys` [U] |
| TreeTable | Node mutation: 6 `node.expanded` [U]                                                     | 21 `expandedKeys` [U]                               | 18 `expandedKeys` [U]                               |

Counts are reference counts from text search, not a semantic analysis [A]. They confirm the divergence ADR-043 recorded; nothing suggests new shared semantics.

### F-4 — Framework-native hierarchical components already ship (precedent)

React and Vue OrganizationChart shipped in G3-E (`packages/react/src/organization-chart`, `packages/vue/src/organization-chart`, `dd4c963`). Each defines its own local node type (for example React `OrganizationChartNodeData`) and no shared hierarchical contract [R]. This is the framework-native pattern ADR-043 describes, already accepted in practice.

> **Erratum to the assessment (revision 3, §1.6):** it states OrganizationChart is "Not shipped in any framework". That is wrong: React and Vue ship it; only Angular is absent (DECISION-D). The error came from a directory check using `organizationchart` instead of `organization-chart`. The assessment draft is not edited by this research; the correction is recorded here for review.

### F-5 — Size and dependency structure (upstream, non-test source lines)

| Component         | ng   | react | vue  | Upstream component dependencies [U]                                                                                           |
| ----------------- | ---- | ----- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| Tree              | 2073 | 1859  | 1622 | Checkbox, InputText, IconField/InputIcon (filter), Scroller (ng virtual scroll), Ripple, drag/drop (native events, all three) |
| TreeTable         | 4854 | 3708  | 2279 | Paginator, Scroller (ng), Checkbox, Badge (ng, vue), FilterService/SortMeta/FilterMetadata (ng); Column/Row/Tooltip (react)   |
| TreeSelect        | 1226 | 1198  | 766  | **Tree**, Chip, Overlay/Portal, BaseEditableHolder/BaseInput (ng, vue)                                                        |
| OrganizationChart | 480  | 537   | 466  | `TreeNode` type only (ng); none (react, vue)                                                                                  |

- TreeSelect composes Tree in all three frameworks [U], so Tree must come first.
- TreeTable does not import Tree, but shares the node model and expansion approach of its framework [U].
- Ultimate already ships Checkbox, InputText, IconField, Scroller, Paginator, Chip and Tooltip in all three frameworks, and Badge in ng and vue [R]. An `InputIcon` component was not found under that name in any framework, although `COMPONENT_INVENTORY.md` records InputIcon as built [R][A]; verify at Spec time.
- Ultimate's shipped Table already implements framework-native sort/filter and composes Paginator and Scroller (DECISION-C) [D], which TreeTable can follow.

## 4. Options

| Option | Description                                                                                                                                                                                                                                                                | ADR-043                                                                                                                            | DECISION-D                                                                                             | Evidence fit           | Assessment                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------- |
| **A**  | **Framework-native per framework:** each framework mirrors its own upstream state model (Angular: `TreeNode` mutation; React/Vue: key-maps), with framework-local node types, as React/Vue OrganizationChart already do. No shared contract or type in any `uix-*` package | Consistent (its stated path)                                                                                                       | Shared-contract question untouched; needs a decision on the implementation-eligibility wording (K7-C1) | Strong (F-1, F-3, F-4) | **[Rec]**                                         |
| B      | Shared hierarchical contract (identity/selection/expansion) in `uix-data`                                                                                                                                                                                                  | Needs amendment                                                                                                                    | Reopens the protected question; no new evidence exists                                                 | Contradicted (F-3)     | Not recommended                                   |
| C      | Shared type-only `TreeNode` shape in a `uix-*` package, state kept framework-native                                                                                                                                                                                        | Borderline: Angular's node carries state fields (`expanded`, `partialSelected`), so a shared shape carries the contested mechanism | Likely reopens                                                                                         | Weak                   | Not recommended                                   |
| D      | Exclude the Tree family from the target                                                                                                                                                                                                                                    | Consistent                                                                                                                         | Consistent                                                                                             | —                      | Contradicts ruling S-2; only by a new user ruling |

## 5. Recommendation [Rec]

1. **Option A.** Record a new decision, not an amendment: "Tree, TreeTable, TreeSelect and Angular OrganizationChart are implementation-eligible as framework-native components, each following its framework's upstream state model with framework-local types. ADR-043's exclusion of a shared hierarchical contract and DECISION-D's protection of that question are unchanged."
2. **Sequence:** Tree, then TreeSelect (depends on Tree), then TreeTable, then Angular OrganizationChart (needs only the Angular `TreeNode` type that the Angular Tree introduces). Each family goes through its own Spec and Plan.
3. **Evidence check during implementation:** if implementation in any framework surfaces genuine shared semantics, record it as new evidence for DECISION-D. Do not act on it inside the implementation (ADR-043's revisit condition).

## 6. Unresolved decisions

- **K7-D1:** adopt Option A (and the decision wording above), or choose otherwise.
- **K7-D2:** where the decision is recorded. The smallest gate is a **Decision** (an ADR in `DECISIONS.md`) plus an authorized tracking-document update to GAP-013, DECISION-D's clarification and `COMPONENT_INVENTORY.md`. This assessment changes none of them, and DECISION-D's protected question is not reopened.
- **K7-D3:** whether to authorize correcting the assessment draft's OrganizationChart erratum (F-4).

## 7. Next required approval gate

**Architecture Discussion / Decision** on K7-D1 and K7-D2 (AGENTS.md §3). After that, a Spec for Tree (first family), then Spec Review, Plan and Plan Review. No implementation before then.
