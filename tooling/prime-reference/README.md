# Prime reference harness

Private, never-published tooling for rendered Prime-parity verification (`docs/architecture/PARITY_PLAYBOOK.md` §6). It renders the ADR-048 pinned Prime libraries as the oracle and compares them with the Ultimate Storybooks.

| Part               | Path                           | Role                                                                                     |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------------------------- |
| Case definitions   | `cases.ts`                     | Canonical cases, Ultimate story ids, part map (Prime ↔ Ultimate selectors per framework) |
| PrimeVue reference | `vue/` (port 6021)             | Oracle for `@ultimate/vue`: PrimeVue 4.5.5 + Aura (`@primeuix/themes` 2.0.3)             |
| PrimeNG reference  | `ng/` (port 6022)              | Oracle for `@ultimate/ng`: PrimeNG 21.1.9 + Aura (`@primeuix/themes` 2.0.3)              |
| Runner             | `playwright.config.ts`, `e2e/` | Environment probe, part probe, captures, review images, report                           |

Each reference app renders `#/<component>/<case>` with the same content and wiring as the matching Ultimate story, under default Prime setup (base style and Aura theme as a Prime app loads them). The page mirrors the Storybook canvas: `body` margin 0, padding 1rem, `box-sizing: border-box` on `body` only.

Only the cases of components being verified exist. The root Playwright config is not used. No CI job runs this harness.

## Run

From the repository root (Node 24, as in CI):

```sh
npx playwright test -c tooling/prime-reference/playwright.config.ts
```

The config starts both reference apps and both Storybooks, or reuses running ones. Authoritative runs use the Docker image `mcr.microsoft.com/playwright:v1.63.0-jammy`.

## Output

`test-results/prime-parity/` (git-ignored; captures are never committed, Playbook §4):

- `report.json` — resolved Prime versions and one row per comparison;
- `summary.md` — the same as a table;
- `<case>.<fw>.png` — review image: Prime | Ultimate | diff;
- `<case>.primeng-vs-primevue.png` — diagnostic PrimeNG vs PrimeVue image.

Verdicts follow the Playbook: geometry within ±1 px and equal material values is a match; `box-sizing` is reported as explanatory only. Test failures mean a harness problem (environment mismatch, unpinned Prime version, a page that does not render), never a parity difference.
