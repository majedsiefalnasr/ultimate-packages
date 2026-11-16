# Vue compound disclosure and step navigation (#130)

Start with the [generated index](index.md) and [scoped validation](validation.md). Seven family records account for all 43 tracked scoped files: 35 owned source/barrel files and eight excluded supporting specs/stories. The family boundaries contain 16 public components, seven public factories and the public accordion style module: 24 named symbols exposed by both root and secondary entries, for 48 entry-qualified exports. Folder counts are not component counts.

## Authorship and boundaries

Edit `scripts/inventory/vue-disclosure-steps.json`, not the generated pages. Regenerate using the existing pilot:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-disclosure-steps.json --out docs/inventory/vue-disclosure-steps
```

The package root, manifest secondary exports and tsup entries are checked independently. Manifest entries are not evidence of publication. The accordion panel, header and content have their own public factories and entries but share the root accordion style. The accordion style module is public; the tabs, stepper and steps style modules and `UStepperSeparator` are owned source-only implementation. No family-specific named public types or extra part factories are declared. No existing pilot record owns these families. The seven package identities alias their local records; Vue core base/styling (#150) and theme presets (#151) remain pending external identities. Source imports, local `dt()` CSS, base style registration and Aura preset entries motivate those relationships. There are no direct UIX style imports or dedicated metadata records under these roots. Prime references are neutral provenance, not parity assessments.

## Product execution and limitations

The exact source baseline was `3864a1d23b5ef0c5601ff740c104fdec4584d14d` on branch `issue130`, using Node `v24.15.0`. The unmodified command `pnpm --filter @ultimate/vue exec vitest run src/accordion/ src/tabs/ src/stepper/ src/steps/ --maxWorkers=1 --minWorkers=1` failed before assertions: the ancestor `/Users/majedsiefalnasr/postcss.config.mjs` requires missing `postcss-import`. A second run with a temporary PostCSS override failed to collect four suites because the `@ultimate/vue-core` built entry was missing. These failures were not product assertions or product repairs.

The existing workspace prerequisites were built with `pnpm --filter '@ultimate/vue^...' -r --if-present run build` (exit 0). The temporary config outside the repository imported the existing `packages/vue/vitest.config.ts` and exported `{...original, css: {postcss: {plugins: []}}}`. With that override and `NODE_OPTIONS=--max-old-space-size=1024`, the [recorded command and run](product-run.json) passed: Vitest 2.1.9, four files and 63 tests (accordion 9, tabs 17, stepper 21, steps 16). Accordion tests compose the three separately exported accordion parts. This jsdom unit run does not exercise PostCSS processing and is not browser, accessibility, visual, Storybook, published-package, remote CI or exhaustive behavior verification.

The existing `.github/workflows/ci.yml` conditionally runs root `pnpm run test` for non-docs classifications, recursively including the Vue product suite. This is workflow configuration, not an observed remote CI run or branch-protection claim. Root `test:scripts` runs provenance tests only and does not enforce this inventory suite. No workflow configuration was changed.

## Source observations

Accordion event `index` is the selected value, and its header does not implement arrow navigation or select-on-focus behavior. Tabs accepts `lazy` and `scrollable`, but the panel remains mounted with `v-show` and the list does not consult `scrollable`. Stepper disables only non-active steps under `linear` or their own disabled prop, while its panel callback does not enforce linear gating. Steps mirrors the externally supplied `activeStep`; click emits and invokes the model command without updating that state. These are source observations, not product changes.

The inventory tests check file disposition, public entries, declaration ownership, selected interpretation terms, relationships and deterministic generated views. The first scoped test run passed three of four tests; the interpretation-term assertion expected `PageDown` while the record used `PageUp/Down`. After aligning the assertion with the authored wording, the scoped test passed 4/4 and the full `node --test scripts/inventory/*.test.mjs` suite passed 147/147. Prettier check and ESLint with `--max-warnings 0` passed on the applicable touched files. Two CLI regenerations reported no problems and preserved all generated and authored bytes. Source anchors and these checks cannot replace human semantic review. Global completeness remains deliberately unasserted.
