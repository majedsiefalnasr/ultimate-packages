# React compound disclosure and step navigation inventory (#129)

## Read and maintain

Start with the [generated index](index.md) and [scoped reconciliation](validation.md). Four family records (accordion, tabs, stepper, steps) account for all 23 scoped files: 15 owned implementation, barrel and style files; 8 supporting specs and stories explicitly excluded with reasons. A family folder is not treated as a component count; tabs owns two public components (UTabView, UTabMenu) plus the UTabPanel composition marker.

Authored input: `scripts/inventory/react-disclosure-steps.json`. The existing pilot schema, generator and coverage/reference checks are reused unchanged. Edit authored input, not generated detail pages. Root and secondary entries expose the same named barrel surface; root links are verified against direct root-barrel anchors. Declared dist exports do not prove npm publication or built artifact availability. No pilot record covers these families, so no duplicate pilot identity was introduced.

UAccordionPanel, UAccordionTabEvent, UTabPanelProps, UStepperPanelProps and UStepperPanelRenderProps are public types. UTabPanel and UStepperPanel are public marker components that render nothing; their props are read by the parent. AccordionClassesParams and the four `*StyleModule` constants are source-only, not barrel exports. UMenuItem is reused through type-only imports from `../menu` (UTabMenu, USteps) without composing UMenu. No separate base classes, factories, hooks, directives or provider/context sources exist in these roots.

Foundation links follow actual imports: react-core base/styling for all four. Aura preset registration (accordion, stepper, steps, tabs) is recorded separately from rendered theme behavior. No component-metadata record exists for these families, so no metadata relationship is claimed. External foundation and theme identities remain pending under #149 and #151. No UIX source dependency is invented. Prime mentions are source-comment provenance only; this inventory makes no parity or gap judgment.

## Executed inventory verification

Source baseline: `87100121a16fd637290078679faf1bc47fcb1190`. Product sources were not changed. Commands used Node v24.15.0 and pnpm.

- `node --test --test-concurrency=1 scripts/inventory/react-disclosure-steps.test.mjs` passed (4 tests): every scoped file, declarations, public entries, source anchors, composition interpretation, local aliases, invalid deferrals, dangling references and deterministic generation.
- `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-disclosure-steps.json --out docs/inventory/react-disclosure-steps` passed without problems and preserves authored JSON and this README.
- These checks validate the inventory, not React rendering. No TypeScript source was touched, so no package typecheck applies to the added JavaScript test and JSON/Markdown.

## Product execution and CI configuration

The default bounded product command was first blocked before assertions because Vitest discovered the host ancestor `/Users/majedsiefalnasr/postcss.config.mjs`, which requires unavailable `postcss-import`. Product execution then passed with a temporary config outside the repository that sets `css.postcss.plugins=[]`:

```sh
NODE_OPTIONS=--max-old-space-size=1024 pnpm --filter @ultimate/react exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --config /tmp/vitest-react129.config.mjs --maxWorkers=1 --no-file-parallelism
```

Vitest 2.1.9, Node v24.15.0: 4 files and 65 tests passed at source revision `ac4fc25447d81612681a7a7a075ce569e0490498`. Because the temporary override disables PostCSS plugins for this run, it does not verify CSS PostCSS processing. Accordion tests emitted React `act(...)` warnings; assertions passed. No repository product code or host configuration was changed.

The existing `.github/workflows/ci.yml` Test step invokes root `pnpm run test`, recursively including React's `vitest run`. This is workflow configuration only; no successful remote CI run was observed. The `test:scripts` glob covers provenance tests only, not this inventory suite. No CI configuration was changed.

## Source observations, not repaired

Accordion renders panel content only while active (unmounted otherwise), and controls value only when `value` is defined. UTabView is controlled only when `onTabChange` is supplied; closed tabs are hidden in internal state and not synced to props. Tab ink-bar classes (`tabViewInkbar`, `tabMenuInkbar`) exist in style but are never rendered. UTabMenu has no keyboard handler and ignores visible, separator and nested items. UStepper renders every panel's content (hidden) on each render, programmatic `activeStep` bypasses linear gating, and the separator class is never rendered. USteps never fires `onSelect` while `readonly` (default true), even for the active item, and does not render item icons. These are source observations, not executed defect assertions.
