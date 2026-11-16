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

## Why this sample

Button illustrates real contract differences: Angular signal inputs/output events and root-only export; React forwarded DOM ref and native props; Vue props factory plus SFC slots/dynamic root. Shared UIX button CSS is independently public. Angular and Vue import it, while React embeds separate CSS. Style adapters/render helpers belong to their component owner; Vue's exported base factory is explicitly public, not mislabeled internal. Test/story/doc files receive explicit exclusions from product accounting.

## Scope and limitations

Discovery recursively enumerates every file under four declared button roots. It checks explicitly mapped package entries against actual manifests and extracts named exports and declarations with TypeScript's parser. Angular's root export traverses a selected local barrel; evidence anchors verify the root link. Other root exports and package subpaths are outside this pilot, not absent products. Star/namespace exports at a mapped entry fail closed; a full package resolver is intentionally deferred. Authored entry mappings and semantic interpretations require human review; anchor presence cannot prove their meaning.

Record IDs are durable logical identities, independent of display names and paths. Pending relationships must name another batch and rationale; they do not establish that a target exists or that global coverage is complete. Scope reconciliation never asserts platform completeness.

Verification states are separate from implementation evidence. No CI enforcement is claimed. Angular/Vue behavioral tests and visual CSS checks remain unrun. React's existing button check was attempted but aborted because the host ancestor PostCSS configuration requires missing `postcss-import`; the captured failure is recorded, not repaired or reported as product success. Inventory tests do not verify rendered product behavior.

The earlier single-line hashbang automation, fixtures and schema were removed because they did not execute their apparent checks. Its integration report is explicitly superseded. The original component inventory from 6c0358ca is preserved verbatim below a historical notice; the incorrect generated Phase 3 additions were removed. Git history retains the withdrawn additions. Future coverage tickets must expand discovery, entry resolution and authored records rather than treating this sample as exhaustive.

Verified claims must reference a repository-relative `run` JSON evidence file containing matching nonblank `command`, `revision`, `outcome` and `output`; the outcome must be `passed` and revision must match the scoped input. Missing evidence and contradictory command, revision, outcome or output are rejected. This consistency check is not cryptographic authentication, nor does the specification require that. Human review must still assess whether the captured run actually supports the behavior. No real pilot product claim is promoted to verified.

Generated verification blocks use plain-text fences so formatting cannot reinterpret captured output. Run regeneration directly, then `git diff --exit-code -- docs/inventory/pilot` after committing; no separate formatting pass should be needed. Owner review remains required for overall inventory closeout.
