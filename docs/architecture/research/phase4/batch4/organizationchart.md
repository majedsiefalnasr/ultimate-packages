# OrganizationChart — Phase 4 report

Pinned revision 91a8472547e34c6e92456f2b98270a1555e3a2db. Source-read only: no tests, browser, AT or visual checks. Order: complete/partial/missing/intentional/n-a/unresolved. Oracles: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5 (pinned source wins over docs).
Note: condensed by lead from the agent's final inline report (full row matrices were delivered in-session).

## Distribution (25 rows)

- Angular 0/0/24/0/1/0 ; React 8/6/7/0/4/0 ; Vue 8/6/10/0/1/0 (mandatory rows split 2026-11-19)

## Key findings

- ADR-054 (docs/architecture/DECISIONS.md:427-445) makes Angular eligible → absent component = missing.
- Existing GAP-127 (connector layout) and GAP-128 (toggler) linked, not re-registered.
- React single-root array mapping complete; multi-root = extension. Vue per-node collapsible:false missing.

## User rulings / reference defects

- Vue selectable:false: PrimeVue source emits node-click despite flag (OrganizationChartNode.vue:110-117) → N/A; Ultimate stricter = extra; docs/source defect.
- React expanded:false: PrimeReact suppresses children (OrganizationChartNode.js:70-73,117-120); Ultimate allows toggling → partial + PrimeReact reference defect.

---

## Reviewed capability matrix

The ledger incorporates the lead’s source review and the four mandatory styling and pass-through rows.

## Basis and verification limits

- Ultimate revision: 91a8472547e34c6e92456f2b98270a1555e3a2db.
- Oracles: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5.
- Method: phase4-gap-analysis/the phase 4 closeout record.
- All classifications are SOURCE-READ ONLY. No tests, browser or visual checks were run. No product changes, tickets, fixes or prioritisation.

## Mapping (by function)

| Framework | Ultimate                                                                          | Prime                      | Basis                                           |
| --------- | --------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------- |
| Angular   | none — no implementation or export under packages/ng/src (name and path searches) | OrganizationChart (PN)     | —                                               |
| React     | UOrganizationChart (UR); export packages/react/src/index.ts:26                    | OrganizationChart (PR/PRN) | recursive hierarchy with selection and collapse |
| Vue       | UOrganizationChart (UV + UVB); export packages/vue/src/index.ts:80                | OrganizationChart (PV/PVN) | same                                            |

Angular status: accepted ADR-054 (docs/architecture/DECISIONS.md:427-445) makes Angular OrganizationChart implementation-eligible with framework-local types. Older DECISION-D exclusion text is context only. Its absence is therefore classified missing, not intentional or n/a. No shared TreeNode contract is implied.

Using flex/div markup instead of Prime's tables is not counted as a gap by itself. Its layout consequences are assessed in row 03.

## Evidence key (repository-relative paths)

- UR = packages/react/src/organization-chart/organization-chart.tsx
- URS = packages/react/src/organization-chart/organization-chart-style.ts
- UV = packages/vue/src/organization-chart/OrganizationChart.vue
- UVB = packages/vue/src/organization-chart/BaseOrganizationChart.ts
- UVS = packages/vue/src/organization-chart/organization-chart-style.ts
- PN = .vendor-cache/extracted/primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src/organizationchart/organizationchart.ts
- PR = .vendor-cache/extracted/primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib/organizationchart/OrganizationChart.js
- PRN = same directory as PR, OrganizationChartNode.js
- PRB = same directory as PR, OrganizationChartBase.js
- PV = .vendor-cache/extracted/primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src/organizationchart/OrganizationChart.vue
- PVN = same directory as PV, OrganizationChartNode.vue
- PVB = same directory as PV, BaseOrganizationChart.vue
- PS = .vendor-cache/extracted/@primeuix\_\_styles-2.0.3/package/dist/organizationchart/index.mjs:1

Every Angular M row has the same Ultimate evidence: the bounded absence search above, qualified by ADR-054. Only the Prime anchor is given per row. No Angular runtime defect is claimed, because there is no component to exercise.

Classes: C complete, P partial, M missing, I intentional architectural difference, N not applicable, U unresolved.

## Capability ledger (25 rows)

| #   | Capability                                       | Angular                                                                                                                                                                                                                                        | React                                                                                                                                                                                                                                                                                                                    | Vue                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Component implementation/export                  | M — PN:188-200                                                                                                                                                                                                                                 | C — UR:108-138; PR:9-20                                                                                                                                                                                                                                                                                                  | C — UV:5-7,95-105; PV:22-25                                                                                                                                                                                                                                       |
| 02  | Root model                                       | M — PN:306-308                                                                                                                                                                                                                                 | C — array input like Prime; UR:126 renders every element, while Prime renders value[0] PR:20. Single-root input is equivalent; multi-root is an Ultimate extension. `value` is required and unguarded vs Prime default null PRB:86 (usage difference recorded)                                                           | C — single root UV:104, UVB:14; PV:4, PVB:9-12                                                                                                                                                                                                                    |
| 03  | Recursive layout and connectors                  | M — nested tables/connectors PN:69-91                                                                                                                                                                                                          | P — recursion UR:90-102 with flex connectors URS:5-10; Prime tables, connectors and 10-children-per-row chunking PRN:70-203,290-319; no chunking in Ultimate                                                                                                                                                             | P [known-defect] — flex/pseudo-element connectors UV:84-89, UVS:15-19 vs PVN:16-49; GAP-127 in docs/architecture/PARITY_PLAYBOOK.md:227                                                                                                                           |
| 04  | Single selection                                 | M — PN:344-351                                                                                                                                                                                                                                 | C — UR:38-46; PR:34-40,61-67                                                                                                                                                                                                                                                                                             | C — UV:25-33; PV:38-56                                                                                                                                                                                                                                            |
| 05  | Multiple selection                               | M — PN:352-362                                                                                                                                                                                                                                 | C — UR:48-51; PR:42-56                                                                                                                                                                                                                                                                                                   | C — UV:27-33; PV:42-56                                                                                                                                                                                                                                            |
| 06  | `selectable:false` exclusion                     | M — PN:337-339                                                                                                                                                                                                                                 | C — UR:44; PR:26-27                                                                                                                                                                                                                                                                                                      | N [reference-defect] — pinned PrimeVue does not block clicks on these nodes (PVN:110-117, PV:38-56); `selectable` only drives computed state (PVN:150-154). The guard at UV:26 is a stricter Ultimate extra                                                       |
| 07  | Selection-change notification                    | M — PN:247,362                                                                                                                                                                                                                                 | C — UR:18-20,43-51 returns the selection directly; Prime wraps {originalEvent,data} PR:52-56 (API-shape difference recorded)                                                                                                                                                                                             | C — update:selectionKeys UV:33, UVB:22; PV:56                                                                                                                                                                                                                     |
| 08  | node-select / node-unselect events               | M — PN:253,259,344-358                                                                                                                                                                                                                         | M — UR:14-22; PR:37-48                                                                                                                                                                                                                                                                                                   | M — UVB:22, UV:25-33; PV:26,46,53                                                                                                                                                                                                                                 |
| 09  | Initial expansion state                          | M — PN:138-140                                                                                                                                                                                                                                 | C — `node.expanded ?? false` UR:37; Prime `useState(node.expanded)` PRN:22; both falsy values start collapsed                                                                                                                                                                                                            | P — truthiness of key-map entries UV:9,38; Prime uses key presence (undefined = expanded) PVN:147-149; `{key:false}` differs                                                                                                                                      |
| 10  | Expand/collapse behaviour                        | M — mutates node.expanded PN:168-173                                                                                                                                                                                                           | P [reference-defect] — local toggle state UR:81-84,90. Prime toggles expandedState (PRN:58-60) but suppresses children whenever the original `node.expanded===false` (PRN:70-73,290-293). Behaviour therefore diverges for `expanded:false`; the cause is recorded as a PrimeReact defect. Classified partial per ruling | C — UV:17-23; PV:59-71 (key-map semantics counted in row 09)                                                                                                                                                                                                      |
| 11  | Global `collapsible` switch                      | M — PN:47-65,223                                                                                                                                                                                                                               | N — PrimeReact has no such prop PRB:83-97; non-leaf nodes get togglers PRN:206-245                                                                                                                                                                                                                                       | P — UV:18,38,66 couples toggle visibility to forced expansion; Prime keeps these separate PVN:147-157                                                                                                                                                             |
| 12  | Per-node `collapsible:false`                     | N — PrimeNG has no per-node opt-out PN:47-65                                                                                                                                                                                                   | N — none in PRN:206-245                                                                                                                                                                                                                                                                                                  | M — UV:66 ignores it; PVN:156-157                                                                                                                                                                                                                                 |
| 13  | Explicit `leaf:false`                            | M — PN:126-129                                                                                                                                                                                                                                 | M — child count only UR:75; PRN:23                                                                                                                                                                                                                                                                                       | M — child count only UV:66; PVN:136-138                                                                                                                                                                                                                           |
| 14  | node-expand / node-collapse events               | M — PN:170-171,265,271                                                                                                                                                                                                                         | N — not offered PRB:83-97                                                                                                                                                                                                                                                                                                | M — map update only UV:17-23; PV:64,67                                                                                                                                                                                                                            |
| 15  | Collapsed descendants: mounting / retained space | M — visibility handling PN:69-91,138-141; preserveSpace PN:229                                                                                                                                                                                 | P — unmounts UR:90; Prime uses visibility PRN:25,80-84                                                                                                                                                                                                                                                                   | P — unmounts UV:84; Prime retains rows hidden PVN:16-49,142-145                                                                                                                                                                                                   |
| 16  | Custom node content                              | M — PN:43-46,326-328                                                                                                                                                                                                                           | M — label only UR:74; nodeTemplate PRN:248-251                                                                                                                                                                                                                                                                           | M — label only UV:65; typed/default slots PVN:7, PV:5                                                                                                                                                                                                             |
| 17  | Toggle-icon customisation                        | M — PN:57-62,275                                                                                                                                                                                                                               | M — "+/-" text UR:86; togglerIcon PRN:215-223                                                                                                                                                                                                                                                                            | M — UV:79; toggleicon/togglericon PVN:9-11; GAP-128 PARITY_PLAYBOOK.md:227                                                                                                                                                                                        |
| 18  | Node style/class                                 | M — node.styleClass PN:42                                                                                                                                                                                                                      | P — className on the outer wrapper UR:57; no node.style; Prime applies class and style to node content PRB:64-72, PRN:268                                                                                                                                                                                                | P — reads node.className UV:43, while Prime reads node.styleClass PVN:6; Prime-format data is not consumed                                                                                                                                                        |
| 19  | Keyboard toggle                                  | M — Enter/Space PN:53-54                                                                                                                                                                                                                       | C — native button UR:76-87; PRN:63-67                                                                                                                                                                                                                                                                                    | C — native button UV:68-79; PVN:128-132                                                                                                                                                                                                                           |
| 20  | Root attrs / id / style / ref                    | M — PN:195-198                                                                                                                                                                                                                                 | P — className only UR:113,121; id/style/rest/getElement PR:77-90                                                                                                                                                                                                                                                         | C — attribute fallthrough not disabled; single root UV:95-105; PV:2. D-SHARED #2 not applicable; runtime forwarding not exercised                                                                                                                                 |
| 21  | `pt`                                             | M [D-PT] — PN:192,302-304                                                                                                                                                                                                                      | M [D-PT] — UR:14-22; PR:14-16,82-90, PRN:28-52                                                                                                                                                                                                                                                                           | M [D-PT] — UVB:13-22; PV:12, PVN:45                                                                                                                                                                                                                               |
| 22  | ptOptions                                        | M [D-PT] — PN organizationchart.ts:200; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions) <-> Ultimate packages/ng-core/src/basecomponent/base-component.ts:21 (no pt/ptOptions), 35-36 (dt/unstyled declared) | M [D-PT] — PR organizationchart/organizationchart.d.ts:239,244,249; PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt) <-> Ultimate packages/react-core/src/base/component-base.ts:12-35 (no pt/ptOptions/unstyled)                                                              | M [D-PT] — PV organizationchart/BaseOrganizationChart.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props)        |
| 23  | unstyled                                         | M — no component exists, so the Angular base "partial" ruling does not apply; PN:89,192                                                                                                                                                        | M [D-SHARED #5] — UR:14-22; PR:14-18                                                                                                                                                                                                                                                                                     | M [D-SHARED #5] — UVB:13-22; PV:13                                                                                                                                                                                                                                |
| 24  | per-instance dt                                  | M [D-SHARED #5] — no Ultimate Angular component (ADR-054), so the Angular base partial does not apply; PN organizationchart.ts:200; PN basecomponent/basecomponent.ts:54 (dt), 60 (unstyled), 66 (pt), 72 (ptOptions)                          | N/A — PR componentbase/ComponentBase.js:420-423 default props pt/ptOptions/unstyled only (no dt); PrimeReact has no per-instance dt, so N/A                                                                                                                                                                              | M [D-SHARED #5] — PV organizationchart/BaseOrganizationChart.vue:2,7; PV core basecomponent/BaseComponent.vue:14 (pt), 18 (ptOptions), 22 (unstyled), 26 (dt) <-> Ultimate packages/vue-core/src/base/base-component.ts:26-42 (no pt/ptOptions/unstyled/dt props) |
| 25  | Aura token consumption                           | M — PS                                                                                                                                                                                                                                         | P [architecture, ADR-067] — hard-coded URS:5-10, no dt(); key `organization-chart` (UR:116) vs preset key `organizationchart` (packages/themes/src/presets/aura/index.ts:154) with no key normalisation (packages/uix-styled/src/stylesheet/theme-variables.ts:47-58); docs/architecture/DECISIONS.md:787-803            | P — node/button tokens UVS:6-12 under key `organizationchart` (UVB:10); connector/gutter values hard-coded UVS:17-19 vs packages/themes/src/presets/aura/organization-chart.ts:22-24,54-57 and PS                                                                 |

## Row tally

| Class | Angular       | React                     | Vue                                   |
| ----- | ------------- | ------------------------- | ------------------------------------- |
| C     | —             | 1, 2, 4, 5, 6, 7, 9, 19   | 1, 2, 4, 5, 7, 10, 19, 20             |
| P     | —             | 3, 10, 15, 18, 20, 25     | 3, 9, 11, 15, 18, 25                  |
| M     | all except 12 | 8, 13, 16, 17, 21, 22, 23 | 8, 12, 13, 14, 16, 17, 21, 22, 23, 24 |
| N     | 12            | 11, 12, 14, 24            | 6                                     |
| U     | —             | —                         | —                                     |

## Distribution (25 rows; complete / partial / missing / intentional / n-a / unresolved)

- Angular: 0 / 0 / 24 / 0 / 1 / 0
- React: 8 / 6 / 7 / 0 / 4 / 0
- Vue: 8 / 6 / 10 / 0 / 1 / 0

No component-level verdict is given.

## Reference defects

1. **PrimeReact expansion (ruled: React row 10 = partial).** Visibility follows the live expandedState, but child creation checks the immutable `node.expanded===false` (PRN:22-25,58-60,70-73,290-293). A node that starts with `expanded:false` can toggle without its children ever appearing.
2. **PrimeVue `selectable:false` (ruled: Vue row 06 = N/A).** docs/prime-reference/components/organizationchart.md:74 says non-selectable nodes ignore selection, but the pinned click paths do not gate it (PVN:110-117, PV:38-56). Ultimate's guard at UV:26 is recorded as a stricter extra, not as a parity requirement.
3. **Unverified observation (affects no classification).** PrimeReact `createChildrenSection` maps chunks and calls helpers that themselves iterate (PRN:70-77,117-124,164-171,290-302). This may duplicate row groups beyond 10 children. No runtime claim is made.

## Stale records (not Prime defects)

- packages/themes/src/presets/aura/organization-chart.ts:12 says DECISION-D excludes Angular. ADR-054 supersedes this.
- docs/architecture/PARITY_PLAYBOOK.md:227 records Angular as "D (no component, DECISION-D)". This is stale against ADR-054. Its historical Vue visual acceptance is not carried over to individual capability rows.

## Prior evidence and its limits

Inventory runs at revision 3864a1d23b5ef0c5601ff740c104fdec4584d14d were not rerun. They are jsdom-only with PostCSS plugins disabled.

- React: 5 OrganizationChart tests; nodes are keyed by index (docs/inventory/react-collection-presentation/README.md:13,21-27,33).
- Vue: 5 OrganizationChart tests (docs/inventory/vue-collection-presentation/README.md:13-19).

## Unresolved evidence

None at row level.

Remaining verification limits (unexecuted):

- connector geometry with 1, 2 and 11 children;
- toggle activation;
- Vue root attribute fallthrough;
- state across collapse;
- key-map entries with `false` values.

```

[assistant]
cd34310084b3bd62

[assistant]
934829260a06c654

[assistant • session_event_search]
{"query":"Panel — Phase 4 gap analysis","event_types":["assistant_message"]}

[tool • session_event_search]
Session session-e1d7f01a-44d6-465d-9142-a9da44eb966c — تحديد منهج تحليل فجوات Ultimate

No prior event matches found.

[user]
Background subagent agent-8 finished and will do no further work unless you send it more.Its closing message:# Re-sent final reports: PanelMenu and OrderList (Phase 4)

**Historical OrderList excerpt (pre-split numbering and totals).** The current OrderList ledger contains 15 capabilities.

**Count correction:** Angular OrderList counts as **0 / 11 / 3 / 0 / 0 / 0**, not the 0 / 10 / 4 in your message. The difference comes from an addition error in my first delivery. I reported 0 / 9 / 4 / 0 / 0 / 1, but that table actually had 10 partial, 3 missing and 1 unresolved rows. Moving the keyboard row from unresolved to partial gives 11 partial. The 14 rows are listed below, so you can recount them. Every other count matches your message.

**Scope and evidence:** I only read source. I did not write any files, change the repo, run tests, or check anything in a browser or with a screen reader. A "complete" row means complete for the capability described, at source-read level only. These reports contain no fixes and no priorities.

**Baseline:**
- **Ultimate:** the repository root at `91a8472547e34c6e92456f2b98270a1555e3a2db`.
- **Reference implementations:** Angular is compared with PrimeNG 21.1.9, React with PrimeReact 10.9.9, and Vue with PrimeVue 4.5.5.
- **Archive roots:** under `.vendor-cache/extracted/`:
  - `primeng-21.1.9/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593/packages/primeng/src`
  - `primereact-10.9.9/primereact-d0f574e39122668292fc7a740f081bae1b93b1e9/components/lib`
  - `primevue-4.5.5/primevue-66dde6788220fc9e6822342919d1ceb0e3460ece/packages/primevue/src`
```
