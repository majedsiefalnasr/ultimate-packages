# Prime reference study

**Status:** in progress (Phase 2). Coverage table added when the study closes.

A description of the Prime baseline (ADR-048) for Angular, React and Vue. It is an upstream reference: it records what Prime ships, not what Ultimate implements, and sits outside Ultimate's source-of-truth hierarchy (`AGENTS.md` §2). Use it to compare Ultimate against Prime; use `@ultimate/component-metadata` and component source for Ultimate's own facts.

## Sources

The pinned archives in `.vendor-cache/` are the only input, each verified against `docs/architecture/checksums.json`:

| Package            | Version  | Archive                           |
| ------------------ | -------- | --------------------------------- |
| PrimeNG            | `21.1.9` | `primeng-21.1.9.tar.gz`           |
| PrimeVue           | `4.5.5`  | `primevue-4.5.5.tar.gz`           |
| PrimeReact         | `10.9.9` | `primereact-10.9.9.tar.gz`        |
| `@primeuix/styles` | `2.0.3`  | `@primeuix__styles-2.0.3.tar.gz`  |
| `@primeuix/themes` | `2.0.3`  | `@primeuix__themes-2.0.3.tar.gz`  |
| `@primeuix/styled` | `0.7.4`  | `@primeuix__styled-0.7.4.tar.gz`  |
| `@primeuix/utils`  | `0.7.2`  | `@primeuix__utils-0.7.2.tar.gz`   |
| `@primeuix/motion` | `0.0.10` | `@primeuix__motion-0.0.10.tar.gz` |

Existing Ultimate status documents, the earlier parity audit and live Prime websites are not inputs.

## Layout

- `catalog/` — the **Prime catalog**: generated JSON, one file per framework, built by `scripts/prime-reference/generate-catalog.mjs` from each archive's `apidoc/index.json`. Facts only (names, signatures, types, defaults); no upstream prose. Regenerate rather than edit.
- `foundations/` — hand-written notes per framework and for `@primeuix/*`: installation, configuration, architecture, packages, helpers, theming, unstyled mode, pass-through, icons, guides, and PrimeReact hooks.
- `components/` — one **component record** per component, covering all three frameworks.

## Component records

File name is the **canonical component name** in lower case (`select.md`, `datepicker.md`). Legacy aliases are listed inside the record, never used as file names. Category follows the PrimeVue showcase menu; a component present only in PrimeReact takes its PrimeReact category.

Every record has these twelve sections, in this order. A section with nothing to say reads `N/A`; none is omitted.

1. **Summary**
2. **Names & status** — canonical name, legacy aliases, deprecations.
3. **Per framework** — import or selector, package, source path.
4. **Anatomy** — sub-components and parts.
5. **API highlights** — key props, events, slots; the Prime catalog holds the full API.
6. **Usage guidance** — from the showcase doc sections, each point sourced.
7. **Accessibility** — roles, ARIA, keyboard.
8. **Theming** — style classes, design tokens, pass-through sections.
9. **Relationships** — what it uses, what uses it, related components.
10. **Dependencies** — internal modules and external npm packages.
11. **Framework differences** — table.
12. **Sources** — archive paths.

## Writing rules

- API facts (names, signatures, types, defaults) are recorded exactly.
- Explanations are written in our own words, never copied from upstream prose.
- Every claim cites its archive path as `<package>-<version>:<path>`, for example `primevue-4.5.5:apps/showcase/doc/select/BasicDoc.vue`.

## Out of scope

Figma UI Kit, Theme Designer, Support, Discover and Migration sections; showcase application code (layout, templates); Prime's own tests and CI. `mcp` and `metadata` packages get a short summary only.
