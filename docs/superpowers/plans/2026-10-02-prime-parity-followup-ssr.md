# F4 SSR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Angular `UScroller` reaches no browser-only API during server rendering (GAP-080). The CI SSR job's build order is reproduced on a clean checkout/worktree and, if broken, fixed with the smallest correct `ci.yml` change.

**Architecture:** GAP-080 adds PrimeNG 21.1.9's `isPlatformBrowser` guard around `UScroller`'s view-init work and pins it with a spy-based server test (the GAP-065 pattern). The CI item is operational: reproduce `track-e-ssr-hydration`'s exact steps in a clean worktree with no `dist`, inspect the real pnpm workspace graph, then make one minimal workflow change and re-verify it the same way.

**Tech Stack:** Angular 21 + Vitest/TestBed, pnpm 9.6.0 workspaces, GitHub Actions YAML, Node 24.15.0 (the SSR job's version) and Node 20.

**Spec:** `docs/superpowers/specs/2026-10-02-prime-parity-followup-ssr-design.md`

## Global Constraints

- Parity baseline: PrimeNG 21.1.9 (ADR-048).
- CI Node versions as recorded in the Spec: the main `ci` job uses Node 20; the Storybook (`track-a-browser-visual-a11y`) and SSR (`track-e-ssr-hydration`) jobs use Node 24.15.0.
- The CI reproduction uses a clean checkout/worktree with no existing `dist`; there is no remote, so nothing is cloned from one.
- The CI remediation (Spec §12, decision (b)) is chosen only after inspecting the actual workspace dependency graph, uses the smallest correct dependency-build step, builds no package twice, and touches `.github/workflows/ci.yml` only.
- No new GAP for the build-order issue. Making CI fail on prerender errors is out of scope.
- Tests: `pnpm --filter @ultimate/ng test`. Stage explicit files only; never push.

## Review Focus

1. Destroying a server-rendered `UScroller` must not throw (no observer was created). Covered by a Task 1 test.
2. The browser behavior (initial `offsetHeight` measurement and re-measure on resize) must be unchanged. The existing Scroller tests cover it; Task 1 requires them to pass unmodified.
3. The CI fix must not build React/Vue packages for the Angular matrix entry, or the reverse, unless the graph shows they are real dependencies. Checked in Task 2 Step 3.
4. The fixed CI step must still work when a playground has no workspace dependencies needing a build (packages without a `build` script). Checked in Task 2 by the re-run.
5. The reproduction must start with no `dist` directories anywhere. Checked in Task 2 Step 1.

---

### Task 1: GAP-080 — guard `UScroller`'s view-init work for the browser

**Files:**

- Modify: `packages/ng/src/scroller/scroller.ts:1` (import) and `:134-145` (`ngAfterViewInit`)
- Test: `packages/ng/src/scroller/scroller.spec.ts`

**Interfaces:**

- Consumes: `UBaseComponent`'s `protected readonly platformId: object` (`UScroller extends UBaseComponent`, `scroller.ts:92`).
- Produces: no API change.

- [ ] **Step 1: Write the failing test**

Append to `packages/ng/src/scroller/scroller.spec.ts` (add `PLATFORM_ID` to the `@angular/core` import):

```ts
describe("UScroller SSR safety (GAP-080)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reaches no ResizeObserver or layout measurement on the server platform", async () => {
    const constructed = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor() {
          constructed();
        }
        observe() {}
        disconnect() {}
      }
    );
    const offsetHeight = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get");
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });

    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput(
      "items",
      Array.from({ length: 10 }, (_, i) => i)
    );
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(() => fixture.destroy()).not.toThrow();

    expect(constructed).not.toHaveBeenCalled();
    expect(offsetHeight).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @ultimate/ng test`
Expected: FAIL — `constructed` and `offsetHeight` were called.

- [ ] **Step 3: Implement**

In `packages/ng/src/scroller/scroller.ts`, change line 1 to `import { NgTemplateOutlet, isPlatformBrowser } from "@angular/common";` and make `ngAfterViewInit` return early outside the browser:

```ts
  ngAfterViewInit(): void {
    // PrimeNG 21.1.9 scroller.ts:679-680 runs all view-init work only under
    // isPlatformBrowser; ngAfterViewInit also runs during server rendering,
    // where ResizeObserver and layout do not exist (GAP-080).
    if (!isPlatformBrowser(this.platformId)) return;
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeNG's elementViewChild.nativeElement.offsetHeight measurement
    // exactly (scroller.ts:854, pinned commit
    // c493b1c6d9f7cdffbe1c4dc195493dd73d733593), not the inner content
    // wrapper and not clientHeight.
    this._contentSize.set(this.elementRef.nativeElement.offsetHeight);
    this.resizeObserver = new ResizeObserver(() => {
      this._contentSize.set(this.elementRef.nativeElement.offsetHeight);
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }
```

`ngOnDestroy` already uses `this.resizeObserver?.disconnect()` and needs no change.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test`
Expected: the GAP-080 test PASSES; every pre-existing `UScroller` test PASSES unmodified. Table tests that render `UScroller` also pass.

- [ ] **Step 5: Verify the prerender log**

Run (Node 20, from the repo root): `pnpm --filter "@ultimate/ng..." run build`, then `pnpm --filter playground-angular run build 2>&1 | tee /tmp/claude-501/f4-prerender.log`
Expected: the build succeeds and `grep -c "ResizeObserver is not defined" /tmp/claude-501/f4-prerender.log` prints `0`. (Before the fix this log contains `ERROR ReferenceError: ResizeObserver is not defined at ngAfterViewInit`.)

Run: `TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`
Expected: PASS.

- [ ] **Step 6: Typecheck and commit**

Run: `pnpm --filter @ultimate/ng run typecheck` — Expected: no errors.

```bash
git add packages/ng/src/scroller/scroller.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "fix(ng): keep UScroller's view-init work browser-only (GAP-080)"
```

---

### Task 2: CI SSR build-order verification and minimal fix

**Files:**

- Modify (only if the reproduction fails): `.github/workflows/ci.yml` — the `Build harness (${{ matrix.dir }})` step in `track-e-ssr-hydration` (currently `run: pnpm --filter ${{ matrix.dir }} run build`, lines 211-212)
- Record: the Plan ledger (`.superpowers/sdd/2026-10-02-prime-parity-followup-ssr/progress.md`)

**Interfaces:**

- Consumes: Task 1's commit (so the reproduction runs on the fixed Scroller).
- Produces: a recorded per-entry result and, if needed, one changed workflow step.

- [ ] **Step 1: Reproduce the job's current build step, one clean worktree per matrix entry**

A CI matrix entry starts on a clean runner, so each entry gets its own fresh worktree with no `dist`. Use the job's Node version and exact commands (`ci.yml:205-212`). Run the block below once per entry, replacing `ENTRY` everywhere with `playground-angular`, then `playground-react`, then `playground-vue`. Use literal paths; this repository's command hook blocks redirects to variable paths.

```bash
export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"
git worktree add --detach /tmp/claude-501/f4-repro-ENTRY HEAD
cd /tmp/claude-501/f4-repro-ENTRY
find . -name dist -type d -not -path "*/node_modules/*" | wc -l
pnpm install --frozen-lockfile
pnpm --filter ENTRY run build 2>&1 | tee /tmp/claude-501/f4-ENTRY.log
grep -m3 -iE "error|cannot find|could not resolve|failed to resolve|ELIFECYCLE" /tmp/claude-501/f4-ENTRY.log
```

Expected for the `find`: `0`. If it is not 0, stop and report. Record each entry's result (pass/fail from the log's final lines) and first error in the ledger.

If all three entries pass, record that, skip Steps 2-5, and go to Step 6 without changing `ci.yml`.

- [ ] **Step 2: Inspect the actual workspace dependency graph**

Do not assume any selector is correct before this step (Plan Review constraint). Work in one of the Step 1 worktrees.

1. **Confirm the real package names and paths.** List every workspace package with its name and directory:

```bash
pnpm ls -r --depth -1 --json | node -e "const a=JSON.parse(require('fs').readFileSync(0,'utf8'));for(const p of a)console.log(p.name, p.path)"
```

Record the name of each matrix entry's package (the job filters by `${{ matrix.dir }}`, i.e. `playground-angular`, `playground-react`, `playground-vue`). At planning time each name equalled its directory name under `apps/`. Re-confirm it here, and use the confirmed name, not the directory, in every selector below.

2. **Confirm what a selector actually selects.** For each confirmed name `NAME`, list the packages that the dependency-inclusive selector `NAME...` picks (the package plus all of its workspace dependencies):

```bash
pnpm --filter "NAME..." exec -- node -e "console.log(require('./package.json').name)"
```

3. **Cross-check against the declared graph.** Compare each list with the `dependencies` of the playground's `package.json` and of every `@ultimate/*` package it reaches. Record the three lists in the ledger. If a list contains packages the playground does not reach through declared dependencies (e.g. React or Vue packages in the Angular list), find and record the edge that pulls them in, or record that the selector over-selects. Either way, do not use that selector unchanged.

- [ ] **Step 3: Choose and apply the minimal step**

Derive the command from the Step 2 graph. It must build exactly the playground plus the workspace packages it really depends on, each exactly once, in dependency order. One candidate is a dependency-inclusive filter on the confirmed package name (`--filter "NAME..."`), which runs `build` in topological order and skips packages without a `build` script. Use it only if Step 2 confirmed that:

- it selects no package outside the real graph;
- no package `build` script in the graph itself builds another package (which would build it twice).

If either check fails, build the exact package set from Step 2 instead (for example, explicit `--filter` arguments naming each required package plus the playground), and record why. If the per-entry package sets differ, the command must still be expressible as one `run:` line parameterized by `${{ matrix.dir }}` or a per-entry matrix value; record how. Edit only the `Build harness` step's `run:` line in `track-e-ssr-hydration` in the main working tree, and update its step name if it no longer describes what runs. Record the chosen command and the reasoning in the ledger.

- [ ] **Step 4: Commit the workflow change**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: build SSR playground workspace dependencies before the harness"
```

- [ ] **Step 5: Re-verify with the same reproduction**

Repeat Step 1 at the new HEAD for each entry, using worktree path `/tmp/claude-501/f4-verify-ENTRY`, log `/tmp/claude-501/f4-verify-ENTRY.log`, and the new `Build harness` command in place of `pnpm --filter ENTRY run build`. Expected: all three entries succeed. In each log, confirm no `@ultimate/*` package's build ran twice (its `build$` header line appears at most once). Record the results in the ledger. If an entry still fails, correct the step in a new commit (do not amend) and repeat this step.

- [ ] **Step 6: Clean up**

Remove every scratch worktree created in Steps 1 and 5 with `git worktree remove --force` on each literal path (for example `/tmp/claude-501/f4-repro-playground-angular`). Then confirm with `git worktree list` that only the main tree and the pre-existing `.claude/worktrees/feature+blueprint-completion` remain. Do not push; the real CI run happens whenever the user pushes the branch.
