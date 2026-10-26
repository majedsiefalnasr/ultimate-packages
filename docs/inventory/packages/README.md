# Package reconciliation (#106)

Run under Node 24.15.0 after `pnpm install`:

- `node --test scripts/inventory/*.test.mjs`
- `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/package-coverage.json --out docs/inventory/packages`

The existing pilot `inventory({ root, input })` and CLI remain the public seam. The existing schema now includes a package-reconciliation input contract; detailed records continue to use the original pilot contract. Authored ownership is never rewritten by generation. Tests compare committed generated views byte-for-byte.

`package-coverage.json` records ticket numbers/titles fetched read-only from the live #107–#156 graph under #98. Reservations allocate future interpretation work; they do not mark those tickets implemented or verified. Logical package identities derive from manifest names; source-family identities qualify package identity with a source family. Families delimit workload, not independent components. Root barrels allocate to relevant package coverage tickets rather than inventing an extra product.

Discovery walks actual package roots, including Angular root secondary-entry configurations and unconventional source layouts. Package manifests, tsup entry declarations, generated UIX style entries, wildcard utility subpaths and ng-packagr entry files supply public/build entry evidence. Build-only entries remain explicitly distinct from manifest public entries. Source files not exposed through entries remain in their family's file list. Supporting files receive explicit context/evidence dispositions. `packages/uix/.gitkeep` is reserved; placeholder files in implemented packages do not make those packages reserved.

Scoped reconciliation permits ticket-owned reservations. Setting `closeout: true` rejects unresolved coverage; the original detailed-record seam also rejects pending relationship targets at closeout. This index is not platform inventory closeout.

## Verification limits

This is package/source-family topology and entry-source reconciliation, not product behavior verification, export-symbol expansion, parity analysis or component counting. No new CI gate is claimed. Dynamic build configuration is supported for the repository's observed entry patterns, not arbitrary executable build logic. Fine-grained meaning, internal attribution and actual API descriptions remain owning-ticket work. The ticket snapshot proves ownership provenance at retrieval time, not perpetual live GitHub synchronization.
