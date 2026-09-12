# playground-angular

A minimal Angular SSR/hydration **verification harness** for Phase 10 Track E.

This is **not** a playground, showcase, or demo application. Its only purpose
is to render `@ultimate/ng` components through Angular's own raw SSR
primitives (`provideServerRendering` / `provideClientHydration`) and prove,
via an automated Playwright spec, that server-rendered markup is present
before hydration and that the client hydrates cleanly without console errors
or mismatches.

It resolves GAP-034 (SSR/hydration verification) — it does **not** close
GAP-008 in full. GAP-008's broader scope (a real consumer/demo application,
tree-shaking re-measurement via a real app build, and genuine
bundle-size/performance benchmarking) remains separately open backlog. See
`docs/architecture/BLUEPRINT_GAPS.md` (GAP-034, GAP-008) and
`docs/architecture/DECISIONS.md` (ADR-045) for the full scoping.

## Running locally

Build and start are two separate steps — run them as two separate commands,
never combined:

```bash
pnpm --filter playground-angular run build
pnpm --filter playground-angular run start
```

The server then listens on `http://localhost:6011/`.

## Verification

The Playwright spec at `e2e/ssr-hydration.spec.ts` builds and serves this
harness and asserts:

- server-rendered markup is present pre-hydration,
- no hydration-mismatch or unexpected console errors occur,
- two independent server responses for the same route are deterministic
  (double-fetch check).

It runs in CI via the `track-e-ssr-hydration` job in
`.github/workflows/ci.yml`.

## Known limitation (pre-existing, not a Track E regression)

Rendered styling may appear minimal or unstyled post-hydration. This is a
**pre-existing** gap, not something introduced by this harness or by Track E:
Angular's `ngCoreStyleSheet` never overrides `StyleSheet.createStyleElement`,
so Angular's style-registration path does not inject a real `<style>`
element into the DOM. This is already tracked separately — see ADR-023
follow-up 6 and ADR-029 in `docs/architecture/DECISIONS.md`.
