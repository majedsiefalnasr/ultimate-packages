# G3-E E-1 — E1-V2 typography target and P1 human ruling

**Date:** 2026-10-08  
**Authority:** Explicit human ruling; documentation only. This records typography target resolution and P1 candidate approval, not P2/P3 or execution authorization.

## 1. Fixture-scoped typography ruling

> For the G3-E E1-V2 minimal PrimeNG reference fixture, the currently captured/default typography is accepted as the canonical comparison environment because parity is established cross-side. This does not assert that Times New Roman is PrimeNG's general/default application typography.

The [corrected Stage 2 measurements](2026-10-08-gap-064-g3e-e1-v2-stage2-corrected-investigation.md) are valid evidence under this fixture-scoped canonical environment. Their recorded computed typography is `16px "Times New Roman"`; this ruling does not establish physical font-file identity or a general PrimeNG typography policy.

Do not integrate Inter, change the current E1-V2 harness typography/font configuration, or rerun E1-V2 solely because of typography. The future Reproducible Prime Showcase Parity Corpus requirements in [Parity Playbook §13](../PARITY_PLAYBOOK.md#13-future-infrastructure-direction--reproducible-prime-showcase-parity-corpus) remain unchanged and separate; they are not retroactively applied to this fixture.

## 2. P1 — human-approved candidate

**P1 APPROVED: C1 — retained-span placement adaptation.**

The human selected C1 as the narrowest candidate direction addressing the measured containing-block/static-position relationship responsible for the second/right image's +3 px displacement. Its preservation constraints retain the existing DOM/template/runtime/public API and the span as the existing image/clipping wrapper. This mechanism selection does not establish that a specific CSS delta is safe; geometry, clipping and interaction preservation remain subject to the later approved gates.

C2 and C3 remain deferred alternatives. Neither may be implemented or experimentally tested unless C1 is later rejected or fails and a new explicit human ruling authorizes further work. There is no automatic fallback after failure.

This ruling supersedes the historical ungranted-P1/unselected-candidate statements in the [approved remediation plan](../../superpowers/plans/2026-10-08-gap-064-g3e-e1-v2-remediation.md) only as to P1. It does not choose any exact CSS property/value, selector delta, mapping entry or implementation packet, and does not enter P2 preparation.

## 3. Remaining gates and final state

- P2 exact-delta approval: **NOT GRANTED**.
- P3 execution-budget approval: **NOT GRANTED**.
- Remediation implementation and verification campaign: **UNAUTHORIZED**.
- E1-V2: **B / OPEN**; Task 6: **STOPPED / not complete**.
- E1-B1 remains **BLOCKED / B1-0 Preserve and Defer**; E1-B2 remains **CLOSED / VERIFIED**; E1-V1 remains **A / out of scope**; GAP-102/103/104/105 remain unchanged.

No code, harness, typography, test/assertion or baseline change, browser/diagnostic run, implementation or verification is authorized by recording this ruling. No baseline acceptance, parity/status promotion, Task 6 closure, commit, merge or push follows. Stop after recording and await the next explicit human authorization.
