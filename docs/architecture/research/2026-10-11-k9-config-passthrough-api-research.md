# K-9 — `config`, `passthrough` and `api` surfaces needed by the approved scope: limited research (2026-10-11)

**Status:** research record, **uncommitted draft** for user review. Authorized by the user on 2026-10-11 (assessment revision 3, ruling K-9). The YAGNI decisions (GAP-021; ADR-018, ADR-024, ADR-032) remain in force; nothing here changes them. Recommendations are marked **[Rec]**.

**Labels:** [R] repository evidence · [U] pinned upstream source (`.vendor-cache/`) · [D] decision record · [A] assumption · [Rec] recommendation.

**Baseline:** `main` == `99364dc`.

---

## 1. Question

Which specific `config`, `passthrough` and `api` surfaces, if any, does the approved component scope (S-2) need?

The S-2 areas still to build are Tree, TreeTable, TreeSelect, Angular OrganizationChart, Chart, Editor, the remaining icons, and the Paginator rows-per-page dropdown (GAP-040) (assessment §1.6). Everything else in scope already ships without these surfaces.

## 2. Recorded position

- **GAP-021 (DEFERRED):** the `config` full surface and `passthrough` are "revisit only on real duplicate-pattern pressure". The exclusion was confirmed independently for all three frameworks (ADR-018, ADR-024, ADR-032) [D].
- **`api` (remaining surface):** NEEDS ARCHITECTURE DECISION in `COMPONENT_INVENTORY.md`, without a separate GAP [R].
- **Ultimate's current config:** `UltimateConfig` (Angular, `ng-core`) has two signals only, `unstyled` and `ripple`, described as covering "only what the Phase 2 proof set uses" [R].

## 3. Findings

### F-1 — What the in-scope upstream components use

| Component                 | PrimeNG `config.*` [U]                          | PrimeReact context / locale [U]                                                                                       | PrimeVue `$primevue.config.*` [U]                                  | PrimeNG `primeng/api` imports [U]                                                                                             | PrimeNG `pt` references [U] |
| ------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Tree                      | `getTranslation`, `inputStyle`, `inputVariant`  | `localeOption('emptyMessage')`                                                                                        | —                                                                  | `TreeNode`, `TreeDragDropService`, `TranslationKeys`, `ScrollerOptions`, `BlockableUI`, `PrimeTemplate`, `SharedModule`       | 28                          |
| TreeTable                 | `translation` (3)                               | `locale`, `filterMatchModeOptions`, `nullSortOrder`, `emptyMessage`, aria labels                                      | —                                                                  | `TreeNode`, `TreeTableNode`, `FilterService`, `FilterMetadata`, `SortMeta`, `ScrollerOptions`, `BlockableUI`, `PrimeTemplate` | 77                          |
| TreeSelect                | `inputStyle`, `inputVariant`, `overlayAppendTo` | `appendTo`, `zIndex`, `autoZIndex`, `inputStyle`, `ripple`, `hideOverlaysOnDocumentScrolling`, `clear`/`close` labels | `locale.emptyMessage`, `locale.selectionMessage`, `zIndex.overlay` | `TreeNode`, `OverlayOptions`, `ScrollerOptions`, `PrimeTemplate`                                                              | 29                          |
| OrganizationChart (ng)    | —                                               | —                                                                                                                     | —                                                                  | `TreeNode`, `PrimeTemplate`                                                                                                   | 37                          |
| Chart                     | —                                               | —                                                                                                                     | —                                                                  | `SharedModule`                                                                                                                | 2                           |
| Editor                    | —                                               | —                                                                                                                     | —                                                                  | `Header`, `PrimeTemplate`                                                                                                     | 59                          |
| Paginator (rows-per-page) | `overlayAppendTo`, `translation.aria` (4)       | (not counted)                                                                                                         | (not counted)                                                      | `SelectItem`, `Aria`                                                                                                          | 20                          |

### F-2 — Each need already has a shipped Ultimate precedent without a global surface

| Upstream need                                                           | Shipped Ultimate precedent                                                                                                                                                                                 | Evidence                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Translations, empty messages, aria labels                               | Per-component inputs with English defaults: Select `emptyMessage = input("No results found")`; DatePicker `dayNames`/`monthNames` inputs ("no `Intl`/full i18n"); Paginator aria labels written in English | `select.ts:151`, `date-picker.ts:68–69`, `paginator.ts:120` [R] |
| `inputStyle` / `inputVariant`                                           | Per-component `variant` input on `UBaseInput` (ADR-047 records the omitted config fallback as deliberate)                                                                                                  | `base-input.ts:50` [R][D]                                       |
| `overlayAppendTo`, `zIndex`                                             | Overlays use `appendTo="body"` in Select/MultiSelect; z-index handled by the existing overlay utilities                                                                                                    | `select.ts:77` [R]                                              |
| `FilterService`, `filterMatchModeOptions`, `SortMeta`, `FilterMetadata` | Table's framework-native filtering (all 18 `FilterMatchMode` values) plus `uix-data`'s `SortMeta`/`FilterMetadata` (ADR-043, DECISION-C)                                                                   | `BLUEPRINT_GAPS.md` DECISION-C [D]                              |
| `ScrollerOptions`, `OverlayOptions`                                     | Scroller and the overlay mechanism ship in all three frameworks                                                                                                                                            | [R]                                                             |
| `TreeNode`, `TreeTableNode`                                             | Framework-local node types, as React/Vue OrganizationChart already define (`OrganizationChartNodeData`); a shared type is excluded by ADR-043/DECISION-D (K-7)                                             | [R][D]                                                          |
| `TreeDragDropService` (Angular)                                         | Angular-only service for drag/drop between trees; OrderList/PickList precedent: drag/drop is framework-native or a disclosed scope cut (DECISION-C, 2026-09-21)                                            | [D]                                                             |
| `pt` (passthrough)                                                      | **Zero** `pt`/`ptm`/`passThrough` references in all shipped `ng`, `react` and `vue` component sources                                                                                                      | text search, 0 matches [R]                                      |
| `PrimeTemplate`, `SharedModule`, `Header`                               | Templating is per framework (content projection, slots, render props); about 90 components per framework ship this way [A: mechanism names vary by component]                                              | [R]                                                             |

### F-3 — No duplicate-pattern pressure appears

Every upstream use falls into a pattern Ultimate already solves per component. The new components add more instances of existing patterns: per-component labels, `variant`, overlays, filtering. None of them is a new kind of cross-component need. GAP-021's revisit condition ("real duplicate-pattern pressure") is therefore **not met** by the in-scope components [A, by inspection of F-1 and F-2].

### F-4 — Observation outside K-9's question (not a recommendation to act)

- **No i18n/translation surface exists anywhere.** User-visible strings are English defaults, overridable only per component where an input exists. Paginator's aria labels are not overridable at all [R]. No Blueprint section or GAP requires i18n; Blueprint §30 requires RTL behavior [D]. Whether a pre-1.0 publish needs consumer-overridable strings is a product question this research does not answer.
- **Icons:** `COMPONENT_INVENTORY.md` classifies the remaining ~85+ icons as ADAPT, "as each consuming component needs an icon" (need-driven), and Ultimate's `*-core/src/icons` directories hold only 7–8 tracked files each [R]. Under S-2, reading that row as "the icons the in-scope components need", rather than all 85+, matches the inventory's own wording. This is an interpretation the user should confirm (K9-D2).

## 4. Options

| Option | Description                                                                                                                                        | Assessment                                                                                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **N**  | **No new `config`, `passthrough` or `api` surface.** In-scope components follow the per-component precedents in F-2, and the YAGNI decisions stand | **[Rec]**: evidence shows no need (F-3)                                                                                                                                                        |
| T      | A minimal shared translation/locale surface (strings only)                                                                                         | Not required by any source or by the in-scope components; would need its own decision and Spec. Relevant only if the user decides consumer-overridable strings are a pre-1.0 requirement (F-4) |
| P      | Passthrough system                                                                                                                                 | Contradicts three ADRs; no evidence of need. Not recommended                                                                                                                                   |
| A      | Shared `api` types (TreeNode and others)                                                                                                           | `TreeNode` excluded by ADR-043/DECISION-D; the rest are already covered. Not recommended                                                                                                       |

## 5. Recommendation [Rec]

1. Record the K-9 outcome as: **no `config`, `passthrough` or `api` surface is necessary for the approved component scope.** GAP-021 and ADR-018, ADR-024, ADR-032 stay unchanged.
2. Implementation Specs for the in-scope components follow F-2's precedents: per-component English-default label inputs; `variant` through `UBaseInput`; framework-local node types; framework-native filtering and drag/drop (or a disclosed scope cut).
3. In the tracking layer, the three cross-cutting rows (`config`, `passthrough`, `api`) can then be marked "not needed for the approved scope" in `COMPONENT_INVENTORY.md` (as the DragDrop precedent was), with separate documentation authorization.

## 6. Unresolved decisions

- **K9-D1:** accept outcome N (no surface needed), or not.
- **K9-D2:** confirm the icons interpretation (need-driven, per F-4).
- **K9-D3 (product question, optional):** whether consumer-overridable strings (i18n) are required for the pre-1.0 publish. If yes, option T needs its own Research → Decision. No source requires it today.

## 7. Next required approval gate

**Decision** (user ruling) on K9-D1 and K9-D2. Because outcome N keeps the existing ADRs unchanged, no ADR amendment is needed. Recording "not needed" in `COMPONENT_INVENTORY.md` needs separate documentation authorization.
