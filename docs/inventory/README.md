# Ultimate inventory pilot (#105)

This bounded pilot supersedes the earlier Phase 3 automation as an inventory method, not as a platform-wide inventory. Run under Node 24.15.0 after `pnpm install`:

- Test: `node --test scripts/inventory/pilot.test.mjs`
- Validate: `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/pilot-sample.json`
- Regenerate: `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/pilot-sample.json --out docs/inventory/pilot`

Start with [the generated index](pilot/index.md) and [validation](pilot/validation.md). The structured authored input is `scripts/inventory/pilot-sample.json`; its schema is `scripts/inventory/pilot-schema.json`. Edit that input, not generated Markdown. Output order is stable for fixed inputs. Generation never rewrites authored input. No parity or matching reports are produced.

## Why this sample

Button illustrates real contract differences: Angular signal inputs/output events and root-only export; React forwarded DOM ref and native props; Vue props factory plus SFC slots/dynamic root. Shared UIX button CSS is independently public. Angular and Vue import it, while React embeds separate CSS. Style adapters/render helpers belong to their component owner; Vue's exported base factory is explicitly public, not mislabeled internal. Test/story/doc files receive explicit exclusions from product accounting.

## Scope and limitations

Discovery recursively enumerates every file under four declared button roots. It checks explicitly mapped package entries against actual manifests and extracts named exports and declarations with TypeScript's parser. Angular's root export traverses a selected local barrel; evidence anchors verify the root link. Other root exports and package subpaths are outside this pilot, not absent products. Star/namespace exports at a mapped entry fail closed; a full package resolver is intentionally deferred. Authored entry mappings and semantic interpretations require human review; anchor presence cannot prove their meaning.

Record IDs are durable logical identities, independent of display names and paths. Pending relationships must name another batch and rationale; they do not establish that a target exists or that global coverage is complete. Scope reconciliation never asserts platform completeness.

Verification states are separate from implementation evidence. No CI enforcement is claimed. Angular/Vue behavioral tests and visual CSS checks remain unrun. React's existing button check was attempted but aborted because the host ancestor PostCSS configuration requires missing `postcss-import`; the captured failure is recorded, not repaired or reported as product success. Inventory tests do not verify rendered product behavior.

The earlier `scripts/inventory` automation and its reports remain historical and untrusted; this ticket does not run or repair their parity/matching pipeline. The historical component inventory is not authoritative for this pilot. Future coverage tickets must expand discovery, entry resolution and authored records rather than treating this sample as exhaustive.
