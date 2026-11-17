# Ultimate inventory pilot (#105)

This bounded pilot supersedes the earlier Phase 3 automation as an inventory method, not as a platform-wide inventory. Run under Node 24.15.0 after `pnpm install`:

- Test: `node --test scripts/inventory/pilot.test.mjs`
- Validate: `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/pilot-sample.json`
- Regenerate: `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/pilot-sample.json --out docs/inventory/pilot`

Start with [the generated index](pilot/index.md) and [validation](pilot/validation.md). The structured authored input is `scripts/inventory/pilot-sample.json`; its schema is `scripts/inventory/pilot-schema.json`. Edit that input, not generated Markdown. Output order is stable for fixed inputs. Generation never rewrites authored input. No parity or matching reports are produced.

## Angular menu and command navigation (#125)

Read the [scoped index](angular-menu-navigation/index.md), [validation](angular-menu-navigation/validation.md) and [authored verification notes](angular-menu-navigation/README.md). The authored input is `scripts/inventory/angular-menu-navigation.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-menu-navigation.json --out docs/inventory/angular-menu-navigation`.

Read the React menu and command navigation [scoped index](react-menu-navigation/index.md), [validation](react-menu-navigation/validation.md) and [authored verification notes](react-menu-navigation/README.md) (#126); authored input: `scripts/inventory/react-menu-navigation.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-menu-navigation.json --out docs/inventory/react-menu-navigation`.

Read the Vue menu and command navigation [scoped index](vue-menu-navigation/index.md), [validation](vue-menu-navigation/validation.md) and [authored verification notes](vue-menu-navigation/README.md) (#127); authored input: `scripts/inventory/vue-menu-navigation.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-menu-navigation.json --out docs/inventory/vue-menu-navigation`.

Read the Angular compound disclosure and step navigation [scoped index](angular-disclosure-steps/index.md), [validation](angular-disclosure-steps/validation.md) and [authored verification notes](angular-disclosure-steps/README.md) (#128); authored input: `scripts/inventory/angular-disclosure-steps.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-disclosure-steps.json --out docs/inventory/angular-disclosure-steps`.

Read the React compound disclosure and step navigation [scoped index](react-disclosure-steps/index.md), [validation](react-disclosure-steps/validation.md) and [authored verification notes](react-disclosure-steps/README.md) (#129); authored input: `scripts/inventory/react-disclosure-steps.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-disclosure-steps.json --out docs/inventory/react-disclosure-steps`.

Read the React table and viewport data [scoped index](react-table-viewport/index.md), [validation](react-table-viewport/validation.md) and [authored verification notes](react-table-viewport/README.md) (#132); authored input: `scripts/inventory/react-table-viewport.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-table-viewport.json --out docs/inventory/react-table-viewport`.

Read the Vue table and viewport data [scoped index](vue-table-viewport/index.md), [validation](vue-table-viewport/validation.md) and [authored verification notes](vue-table-viewport/README.md) (#133); authored input: `scripts/inventory/vue-table-viewport.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-table-viewport.json --out docs/inventory/vue-table-viewport`.

Read the Vue compound disclosure and step navigation [scoped index](vue-disclosure-steps/index.md), [validation](vue-disclosure-steps/validation.md) and [authored verification notes](vue-disclosure-steps/README.md) (#130); authored input: `scripts/inventory/vue-disclosure-steps.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-disclosure-steps.json --out docs/inventory/vue-disclosure-steps`.

Read the Angular table and viewport data [scoped index](angular-table-viewport/index.md), [validation](angular-table-viewport/validation.md) and [authored verification notes](angular-table-viewport/README.md) (#131); authored input: `scripts/inventory/angular-table-viewport.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-table-viewport.json --out docs/inventory/angular-table-viewport`.

Read the Angular collection presentation and transfer [scoped index](angular-collection-presentation/index.md), [validation](angular-collection-presentation/validation.md) and [authored verification notes](angular-collection-presentation/README.md) (#134); authored input: `scripts/inventory/angular-collection-presentation.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-collection-presentation.json --out docs/inventory/angular-collection-presentation`.
Read the React collection presentation and transfer [scoped index](react-collection-presentation/index.md), [validation](react-collection-presentation/validation.md) and [authored verification notes](react-collection-presentation/README.md) (#135); authored input: `scripts/inventory/react-collection-presentation.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-collection-presentation.json --out docs/inventory/react-collection-presentation`.

Read the Vue collection presentation and transfer [scoped index](vue-collection-presentation/index.md), [validation](vue-collection-presentation/validation.md) and [authored verification notes](vue-collection-presentation/README.md) (#136); authored input: `scripts/inventory/vue-collection-presentation.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-collection-presentation.json --out docs/inventory/vue-collection-presentation`.

Read the Angular media and containers [scoped index](angular-media-containers/index.md), [validation](angular-media-containers/validation.md) and [authored verification notes](angular-media-containers/README.md) (#137); authored input: `scripts/inventory/angular-media-containers.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-media-containers.json --out docs/inventory/angular-media-containers`.

Read the React media and containers [scoped index](react-media-containers/index.md), [validation](react-media-containers/validation.md) and [authored verification notes](react-media-containers/README.md) (#138); authored input: `scripts/inventory/react-media-containers.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-media-containers.json --out docs/inventory/react-media-containers`.

Read the Vue media and containers [scoped index](vue-media-containers/index.md), [validation](vue-media-containers/validation.md) and [authored verification notes](vue-media-containers/README.md) (#139); authored input: `scripts/inventory/vue-media-containers.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-media-containers.json --out docs/inventory/vue-media-containers`.

Read the Angular feedback and interaction utilities [scoped index](angular-feedback/index.md), [validation](angular-feedback/validation.md) and [authored verification notes](angular-feedback/README.md) (#140); authored input: `scripts/inventory/angular-feedback.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-feedback.json --out docs/inventory/angular-feedback`.

Read the React feedback and interaction utilities [scoped index](react-feedback/index.md), [validation](react-feedback/validation.md) and [authored verification notes](react-feedback/README.md) (#141); authored input: `scripts/inventory/react-feedback.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-feedback.json --out docs/inventory/react-feedback`.

Read the Vue feedback and interaction utilities [scoped index](vue-feedback/index.md), [validation](vue-feedback/validation.md) and [authored verification notes](vue-feedback/README.md) (#142); authored input: `scripts/inventory/vue-feedback.json`; regenerate only this scope with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-feedback.json --out docs/inventory/vue-feedback`.

## UIX utilities

Read the [DOM utilities inventory](uix-utils-dom/index.md), [generated record](uix-utils-dom/uixutils.dom.md), [authored signatures and interpretation](uix-utils-dom/README.md), and [scoped validation](uix-utils-dom/validation.md) for ticket #143. Its structured input is `scripts/inventory/uix-utils-dom.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/uix-utils-dom.json --out docs/inventory/uix-utils-dom`.

Read the [value and event utilities inventory](uix-utils-values/index.md), [authored signatures and interpretation](uix-utils-values/README.md), and [scoped validation](uix-utils-values/validation.md) for ticket #144. Its structured input is `scripts/inventory/uix-utils-values.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/uix-utils-values.json --out docs/inventory/uix-utils-values`.

Read the [styled runtime inventory](styled-runtime/index.md), [authored signatures and interpretation](styled-runtime/README.md), and [scoped validation](styled-runtime/validation.md) for ticket #145. Its structured input is `scripts/inventory/styled-runtime.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/styled-runtime.json --out docs/inventory/styled-runtime`.

Read the [shared component styles inventory](shared-component-styles/index.md), [authored signatures and interpretation](shared-component-styles/README.md), and [scoped validation](shared-component-styles/validation.md) for ticket #146. Its structured input is `scripts/inventory/shared-component-styles.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/shared-component-styles.json --out docs/inventory/shared-component-styles`.

Read the [data and motion primitives inventory](data-motion-primitives/index.md), [authored signatures and interpretation](data-motion-primitives/README.md), and [scoped validation](data-motion-primitives/validation.md) for ticket #147. Its structured input is `scripts/inventory/data-motion-primitives.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/data-motion-primitives.json --out docs/inventory/data-motion-primitives`.

Read the [Angular core inventory](angular-core/index.md), [authored signatures and interpretation](angular-core/README.md), and [scoped validation](angular-core/validation.md) for ticket #148. Its structured input is `scripts/inventory/angular-core.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-core.json --out docs/inventory/angular-core`.

Read the [React core inventory](react-core/index.md), [authored signatures and interpretation](react-core/README.md), and [scoped validation](react-core/validation.md) for ticket #149. Its structured input is `scripts/inventory/react-core.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-core.json --out docs/inventory/react-core`.

Read the [Vue core inventory](vue-core/index.md), [authored signatures and interpretation](vue-core/README.md), and [scoped validation](vue-core/validation.md) for ticket #150. Its structured input is `scripts/inventory/vue-core.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/vue-core.json --out docs/inventory/vue-core`.

Read the [theme contract and Aura inventory](theme-contract/index.md), [authored signatures and interpretation](theme-contract/README.md), and [scoped validation](theme-contract/validation.md) for ticket #151. Its structured input is `scripts/inventory/theme-contract.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/theme-contract.json --out docs/inventory/theme-contract`.

Read the [component schema inventory](component-schema/index.md), [authored signatures and interpretation](component-schema/README.md), and [scoped validation](component-schema/validation.md) for ticket #152. Its structured input is `scripts/inventory/component-schema.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/component-schema.json --out docs/inventory/component-schema`.

Read the [metadata registry inventory](metadata-registry/index.md), [authored signatures and interpretation](metadata-registry/README.md), and [scoped validation](metadata-registry/validation.md) for ticket #153. Its structured input is `scripts/inventory/metadata-registry.json`; regenerate it with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/metadata-registry.json --out docs/inventory/metadata-registry`.

## Why this sample

Button illustrates real contract differences: Angular signal inputs/output events and root-only export; React forwarded DOM ref and native props; Vue props factory plus SFC slots/dynamic root. Shared UIX button CSS is independently public. Angular and Vue import it, while React embeds separate CSS. Style adapters/render helpers belong to their component owner; Vue's exported base factory is explicitly public, not mislabeled internal. Test/story/doc files receive explicit exclusions from product accounting.

## Scope and limitations

Discovery recursively enumerates every file under four declared button roots. It checks explicitly mapped package entries against actual manifests and extracts named exports and declarations with TypeScript's parser. Angular's root export traverses a selected local barrel; evidence anchors verify the root link. Other root exports and package subpaths are outside this pilot, not absent products. Mapped entry keys may use an exact manifest export key or a matching single-wildcard subpath key; the inventory still relies on an authored source mapping and does not verify built artifacts or implement full Node package resolution. Star/namespace exports at a mapped entry fail closed. Authored entry mappings and semantic interpretations require human review; anchor presence cannot prove their meaning.

Record IDs are durable logical identities, independent of display names and paths. Pending relationships must name another batch and rationale; they do not establish that a target exists or that global coverage is complete. Scope reconciliation never asserts platform completeness.

Verification states are separate from implementation evidence. No CI enforcement is claimed. Angular/Vue behavioral tests and visual CSS checks remain unrun. React's existing button check was attempted but aborted because the host ancestor PostCSS configuration requires missing `postcss-import`; the captured failure is recorded, not repaired or reported as product success. Inventory tests do not verify rendered product behavior.

The earlier single-line hashbang automation, fixtures and schema were removed because they did not execute their apparent checks. Its integration report is explicitly superseded. The original component inventory from 6c0358ca is preserved verbatim below a historical notice; the incorrect generated Phase 3 additions were removed. Git history retains the withdrawn additions. Future coverage tickets must expand discovery, entry resolution and authored records rather than treating this sample as exhaustive.

Verified claims must reference a repository-relative `run` JSON evidence file containing matching nonblank `command`, `revision`, `outcome` and `output`; the outcome must be `passed` and revision must match the scoped input. Missing evidence and contradictory command, revision, outcome or output are rejected. This consistency check is not cryptographic authentication, nor does the specification require that. Human review must still assess whether the captured run actually supports the behavior. No real pilot product claim is promoted to verified.

Generated verification blocks use plain-text fences so formatting cannot reinterpret captured output. Run regeneration directly, then `git diff --exit-code -- docs/inventory/pilot` after committing; no separate formatting pass should be needed. Owner review remains required for overall inventory closeout.
