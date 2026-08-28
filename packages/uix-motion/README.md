# @ultimate/uix-motion

Class-based enter/leave transition orchestration for the Ultimate Platform UI foundation. Respects `prefers-reduced-motion` by default.

**Status:** unstable (pre-1.0). No semver guarantee yet.

CSS keyframe/transition definitions live in each component's own style module (deferred to Phase 2+, alongside the owning component) — this package only orchestrates *when* those classes are applied, not what they animate.

## Provenance

Adapted from `@primeuix/motion@0.0.10` (MIT, PrimeTek). See `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/uix-motion.json` for exact file-level lineage. See `THIRD-PARTY-NOTICES.md` for the full upstream license text.

## Dependencies

Depends on `@ultimate/uix-utils` (workspace).

## Usage

```typescript
import { createMotion } from "@ultimate/uix-motion";

const motion = createMotion(element, { safe: true });
```

By default (`safe: true`), motion is automatically skipped when the user's system has `prefers-reduced-motion` enabled.
