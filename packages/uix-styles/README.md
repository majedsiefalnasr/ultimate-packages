# @ultimate/uix-styles

Global/base CSS infrastructure for the Ultimate Platform UI foundation.

**Status:** unstable (pre-1.0). No semver guarantee yet.

**Phase 1 scope:** shipped the `base` module (global box-sizing reset, disabled-state opacity, icon sizing, overlay-mask positioning, collapsible-panel animation keyframes) — the shared, framework-level CSS every component depends on. CSS class selectors in `base` (`.p-disabled`, `.p-icon`, etc.) are kept exactly as upstream — no renaming in Phase 1.

**Phase 2 scope:** added the `button`, `checkbox`, `dialog`, `menu`, and `tooltip` per-component style modules, each exporting a `style` string only (matching upstream `@primeuix/styles@2.0.3`'s own shape — there is no `classes` export in this package). Remaining per-component style modules (datatable, etc. — ~90 modules in the upstream `@primeuix/styles` package) are deferred: each migrates alongside its owning component when that component is built, not speculatively now. Component-specific `.p-<name>*` selectors are renamed to `.u-<name>*` to match Phase 2's Ultimate namespace decision; shared framework-level selectors (`.p-disabled`, `.p-focus`, `.p-invalid`, etc.) are left as upstream, consistent with `base`.

## Provenance

Adapted from `@primeuix/styles@2.0.3` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-styles.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Usage

```typescript
import { base } from "@ultimate/uix-styles/base";
import { style as buttonStyle } from "@ultimate/uix-styles/button";
import { style as checkboxStyle } from "@ultimate/uix-styles/checkbox";
import { style as dialogStyle } from "@ultimate/uix-styles/dialog";
import { style as menuStyle } from "@ultimate/uix-styles/menu";
import { style as tooltipStyle } from "@ultimate/uix-styles/tooltip";
```
