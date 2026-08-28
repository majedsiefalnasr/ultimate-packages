# @ultimate/uix-utils

Framework-neutral utility functions for the Ultimate Platform UI foundation: DOM helpers, class-name composition, an event bus, prop merging, object helpers, UUID generation, and z-index management.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Provenance

Adapted from `@primeuix/utils@0.7.2` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-utils.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Modules

- `classnames` — conditional class-name string composition
- `dom` — browser DOM helper functions (focus management, scroll/viewport measurement, RTL detection, reduced-motion detection, style-tag injection)
- `eventbus` — a minimal typed event bus
- `mergeprops` — merges prop objects, combining `class`/`className` keys instead of overwriting
- `object` — pure object/array/string helper functions (deep merge, comparators, case conversion, etc.)
- `uuid` — unique identifier generation
- `zindex` — sequential z-index value management

## Usage

```typescript
import { classNames } from "@ultimate/uix-utils/classnames";
import { hasClass } from "@ultimate/uix-utils/dom";
```

Or import everything from the barrel:

```typescript
import { classNames, hasClass } from "@ultimate/uix-utils";
```
