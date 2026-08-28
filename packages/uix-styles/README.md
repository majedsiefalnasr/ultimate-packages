# @ultimate/uix-styles

Global/base CSS infrastructure for the Ultimate Platform UI foundation.

**Status:** unstable (pre-1.0). No semver guarantee yet.

**Phase 1 scope:** this package currently ships only the `base` module (global box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation keyframes) — the shared, framework-level CSS every component depends on. Per-component style modules (button, dialog, datatable, etc. — ~90 modules in the upstream `@primeuix/styles` package) are deferred: each migrates alongside its owning component during Phase 2 (Angular), Phase 3 (React), or Phase 4 (Vue), not speculatively now.

CSS class selectors (`.p-disabled`, `.p-icon`, etc.) are kept exactly as upstream — no renaming in Phase 1.

## Provenance

Adapted from `@primeuix/styles@2.0.3` (MIT, PrimeTek), `base` module only. See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-styles.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Usage

```typescript
import { base } from "@ultimate/uix-styles/base";
```
