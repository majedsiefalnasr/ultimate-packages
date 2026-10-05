/**
 * Blueprint Phase 5 exit criterion (spec §10): "validate cross-framework
 * theme consistency" — proving the same preset produces matching resolved
 * CSS whether registered through Angular, React, or Vue.
 *
 * Approach: render the same proof-set component (`UButton`) via each
 * framework's OWN real public-surface mounting mechanism (not an internal
 * `*-core` StyleSheet singleton import — `ng-core`/`react-core`/`vue-core`
 * do not re-export those from their package root, so reaching into them
 * across a package boundary isn't structurally supported), then read the
 * resolved CSS text from the DOM `<style>` element each framework's own
 * registration path produced.
 *
 * Angular is NOT rendered in this file. `UButton`'s Angular implementation
 * is a real `@Component` that only runs inside Angular's own test
 * environment (`TestBed`, driven by the `@angular/build:unit-test` builder
 * via `ng test`) — a completely different runner/major-vitest-version from
 * this package's plain `vitest run`, and `@angular/core` is not installed
 * here (pnpm's non-hoisting workspace linking; it's a peerDependency of
 * `@ultimate/ng`/`@ultimate/ng-core` only). Angular's proof of the same
 * `button.primary.background` -> `var(--u-button-primary-background, ...)`
 * resolution lives instead in `packages/ng/src/button/button.spec.ts`
 * ("resolves the same button.primary.background token as the React/Vue
 * cross-framework consistency test"), run via Angular's own `ng test`.
 * Together, the two files prove the guarantee across all three frameworks
 * without forcing incompatible test environments into one process.
 *
 * NOTE ON A REAL GAP FOUND WHILE WRITING THIS TEST: as of this commit,
 * `packages/react/src/button/button-style.ts` does not source its CSS from
 * `@ultimate/uix-styles/button` the way `packages/vue/src/button/button-style.ts`
 * and `packages/ng/src/button/button-style.ts` both do — it is a small,
 * hand-written static CSS block with no `dt()` calls at all, and this is
 * true of every component under `packages/react/src/`, not just Button.
 * React's `UButton` therefore does not currently register any `dt()`-token
 * CSS to compare against Vue's. That's a pre-existing content gap in the
 * React package (out of this test task's file list to fix), not a defect
 * in the theme-resolution pipeline itself: `packages/react-core/src/styling/
 * styling.spec.ts` already proves `dt()` resolution works correctly for any
 * CSS registered through React's real `useComponentStyle`/`reactCoreStyleSheet`
 * path. This file's second test therefore asserts what is honestly true
 * today — Vue's real `UButton` resolves the token, and the SAME resolved
 * text is what `dt()` (the shared, framework-agnostic resolution the first
 * test covers) produces directly — rather than asserting something false
 * about React's current button CSS content.
 *
 * A SECOND GAP, FIXED IN THIS COMMIT: `ng-core`'s `ngCoreStyleSheet` was
 * constructed as a plain base `StyleSheet` (`packages/uix-styled/src/
 * stylesheet/index.ts`), whose own `createStyleElement` is a no-op stub —
 * unlike `react-core`'s `ReactStyleSheet` and `vue-core`'s `VueStyleSheet`,
 * which both subclass `StyleSheet` to actually append a `<style>` element
 * to `document.head`. This meant `ng-core`'s registered CSS was tracked
 * in-memory only and never reached the DOM at all, in any environment, not
 * just this test. Fixed in `packages/ng-core/src/basecomponent/style-sheet.ts`
 * by adding the same `createStyleElement` override the two sibling
 * implementations already use (see that file's own comment for detail).
 * `packages/ng/src/button/button.spec.ts`'s new test needed this fix to be
 * able to observe Angular's registered CSS via the DOM at all.
 *
 * BUILD-FRESHNESS NOTE: this file imports `@ultimate/vue/button` and
 * `@ultimate/react/button`, both of which resolve through their package's
 * `exports` map to prebuilt `dist/` output, not `src/`. The workspace root
 * `test` script (`pnpm -r --if-present run test`) does not enforce a build
 * step first — on a cold checkout, or after editing `vue`'s/`react`'s
 * `src/`, this file will silently test stale `dist/` output unless those
 * packages are rebuilt first (`pnpm --filter @ultimate/vue --filter
 * @ultimate/react build`). This cost real debugging time while writing this
 * test; flagging it here so the next person doesn't repeat that.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { mount } from "@vue/test-utils";
import * as React from "react";
import { applyUltimateTheme } from "../src/apply-theme";
import { dt } from "@ultimate/uix-styled";

describe("cross-framework theme consistency", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("dt() resolves the button.primary.background token to a var(--u-button-primary-background, ...) reference, framework-independently", () => {
    // The Theme singleton is shared process-wide (module-level default
    // export) — dt()'s resolution does not depend on which *-core
    // package's StyleSheet instance registers a style. ng-core/react-core/
    // vue-core each own a SEPARATE StyleSheet singleton instance, but all
    // three read from the SAME uix-styled Theme singleton for dt(), which
    // is what the rest of this file's assertions rely on.
    const resolved = dt("button.primary.background");
    expect(resolved).toContain("var(--u-button-primary-background");
  });

  describe("React and Vue's real UButton renders resolve the same token to the same text", () => {
    afterEach(() => {
      cleanup(); // unmount React trees between tests. Both reactCoreStyleSheet
      // and vueCoreStyleSheet guard registration with has(componentName), so
      // it only ever runs once per process regardless of mount/unmount
      // cycles — DOM style elements from earlier renders simply persist,
      // which is harmless here since each test locates its own element.
    });

    it("Vue's real UButton registers CSS containing the resolved button.primary.background var(...) text, matching dt()'s own resolution", async () => {
      const { UButton } = await import("@ultimate/vue/button");

      const wrapper = mount(UButton, { props: { label: "Save" } });
      expect(wrapper.text()).toContain("Save"); // sanity: real component rendered

      const styleEl = document.head.querySelector('style[data-u-style="button"]');
      expect(styleEl).not.toBeNull();
      const vueCss = styleEl!.textContent ?? "";

      expect(vueCss).toContain("var(--u-button-primary-background");
      expect(vueCss).not.toContain("dt("); // no unresolved dt() calls leaked through

      // Same token, resolved through the framework-agnostic dt() helper,
      // must appear verbatim inside Vue's registered CSS — this is the
      // actual cross-framework consistency guarantee: whichever *-core
      // StyleSheet registers a dt()-bearing style, the resolved var(...)
      // text for a given token is identical, because both dt() and every
      // StyleSheet.add() call site route through the same Theme singleton.
      const resolvedToken = dt("button.primary.background");
      expect(vueCss).toContain(resolvedToken);

      wrapper.unmount();
    });

    it("React's real UButton render exercises the same dt()-resolution pipeline (react-core's StyleSheet.add) without leaving unresolved dt() calls", async () => {
      const { UButton } = await import("@ultimate/react/button");

      render(React.createElement(UButton, { label: "Save" }));

      // reactCoreStyleSheet's <style> elements carry no identifying
      // attribute (its StyleSheet instance is constructed with no `attrs`
      // option, unlike vue-core's explicit `data-u-style`). Vue's element
      // ALSO contains `.u-button {` and `.u-button-vertical` (both
      // frameworks style the same class names — React's static CSS happens
      // to duplicate several selectors from the real uix-styles/button CSS
      // Vue imports), so content alone cannot distinguish them: the
      // `:not([data-u-style])` attribute exclusion below is what actually
      // keeps Vue's element out of the candidate pool. The `.u-button-vertical`
      // content check is kept only as a sanity check that the found element
      // is really button CSS, not as the distinguishing mechanism — do not
      // remove the attribute exclusion in favor of content matching alone.
      const vueStyleEl = document.head.querySelector('style[data-u-style="button"]');
      const styleEl = Array.from(document.head.querySelectorAll("style:not([data-u-style])")).find(
        (el) => (el.textContent ?? "").includes(".u-button-vertical")
      );
      expect(styleEl).not.toBeUndefined();
      expect(styleEl).not.toBe(vueStyleEl); // guards against this lookup silently re-matching Vue's element
      const reactCss = styleEl!.textContent ?? "";

      // React's button-style.ts does not currently source dt()-bearing CSS
      // from @ultimate/uix-styles/button (see file header) — so this does
      // not assert the button.primary.background token appears (it would
      // be a false assertion against React's real current output). What IS
      // true, and what this proves: react-core's registration call site
      // resolves dt() correctly for whatever CSS a component registers
      // (styling.spec.ts covers the mechanism directly), so nothing here
      // is silently broken or bypassed for React specifically.
      expect(reactCss).not.toContain("dt(");
    });
  });

  describe("React and Vue's real UScroller renders resolve the same virtualscroller.loader.mask.background token", () => {
    // CORRECTION vs. this suite's original task brief: the resolved CSS
    // variable name for a dt() token is derived from the token's FULL dotted
    // path (uix-styled's dt() helper dot-to-dash's every segment, prefixed
    // `--u-`) — for "virtualscroller.loader.mask.background" that is
    // `--u-virtualscroller-loader-mask-background`, not
    // `--u-scroller-loader-mask-background` (the brief's assumed string, by
    // analogy with the `.u-scroller-*` CSS *class* names, which are a
    // separate, differently-derived naming scheme). Verified empirically:
    // Vue's real registered CSS (and dt() itself) produce the
    // `virtualscroller`-prefixed variable name identically, and so does
    // React's and Angular's once rebuilt — confirming this is a consistent,
    // correct token-name derivation across all three frameworks, not a bug
    // in any framework's Task 3/8/12 implementation.
    //
    // Unlike UButton/UPaginator, UScroller's mount effect (React's
    // useEffect/Vue's mounted()) unconditionally constructs a real
    // ResizeObserver to measure the viewport — every real per-framework
    // scroller.spec file (packages/react/src/scroller/scroller.spec.tsx,
    // packages/vue/src/scroller/scroller.spec.ts) stubs this global before
    // mounting for the same reason: jsdom (this file's own test
    // environment, packages/themes/vitest.config.ts) does not implement
    // ResizeObserver at all. This is a test-harness requirement, not a
    // production code path — the stub only needs to exist and have an
    // observe()/disconnect() no-op; its callback is never invoked because
    // this test doesn't need real measurement results.
    beforeEach(() => {
      vi.stubGlobal(
        "ResizeObserver",
        class {
          observe() {}
          disconnect() {}
        }
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      cleanup();
    });

    it("Vue's real UScroller registers CSS containing the resolved virtualscroller.loader.mask.background var(...) text, matching dt()'s own resolution", async () => {
      const { UScroller } = await import("@ultimate/vue/scroller");

      const wrapper = mount(UScroller, { props: { items: [], itemSize: 20, loading: true } });

      const styleEl = document.head.querySelector('style[data-u-style="scroller"]');
      expect(styleEl).not.toBeNull();
      const vueCss = styleEl!.textContent ?? "";

      expect(vueCss).toContain("var(--u-virtualscroller-loader-mask-background");
      expect(vueCss).not.toContain("dt("); // no unresolved dt() calls leaked through

      const resolvedToken = dt("virtualscroller.loader.mask.background");
      expect(vueCss).toContain(resolvedToken);

      wrapper.unmount();
    });

    it("React's real UScroller registers CSS containing the resolved virtualscroller.loader.mask.background var(...) text, matching dt()'s own resolution", async () => {
      const { UScroller } = await import("@ultimate/react/scroller");

      render(React.createElement(UScroller, { items: [], itemSize: 20, loading: true }));

      // reactCoreStyleSheet's <style> elements carry no identifying attribute
      // (same as UButton's/UPaginator's real established pattern, per this
      // file's own header comment) — Vue's element is excluded by its own
      // data-u-style attribute, and the element is then located by its known,
      // unique .u-scroller-loader selector, matching the exact lookup
      // mechanism already established for UButton's/UPaginator's React halves.
      // The .not.toBe(vueStyleEl) guard is the actual distinguishing check;
      // the content match alone is only a sanity check that the found element
      // is really scroller CSS.
      const vueStyleEl = document.head.querySelector('style[data-u-style="scroller"]');
      const styleEl = Array.from(document.head.querySelectorAll("style:not([data-u-style])")).find((el) =>
        (el.textContent ?? "").includes(".u-scroller-loader {")
      );
      expect(styleEl).not.toBeUndefined();
      expect(styleEl).not.toBe(vueStyleEl);
      const reactCss = styleEl!.textContent ?? "";

      expect(reactCss).toContain("var(--u-virtualscroller-loader-mask-background");
      expect(reactCss).not.toContain("dt(");

      const resolvedToken = dt("virtualscroller.loader.mask.background");
      expect(reactCss).toContain(resolvedToken);
    });
  });

  describe("React and Vue's real UPaginator renders resolve the same paginator.background token", () => {
    afterEach(() => {
      cleanup();
    });

    it("Vue's real UPaginator registers CSS containing the resolved paginator.background var(...) text, matching dt()'s own resolution", async () => {
      const { UPaginator } = await import("@ultimate/vue/paginator");

      const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });

      const styleEl = document.head.querySelector('style[data-u-style="paginator"]');
      expect(styleEl).not.toBeNull();
      const vueCss = styleEl!.textContent ?? "";

      expect(vueCss).toContain("var(--u-paginator-background");
      expect(vueCss).not.toContain("dt("); // no unresolved dt() calls leaked through

      const resolvedToken = dt("paginator.background");
      expect(vueCss).toContain(resolvedToken);

      wrapper.unmount();
    });

    it("React's real UPaginator registers CSS containing the resolved paginator.background var(...) text, matching dt()'s own resolution", async () => {
      const { UPaginator } = await import("@ultimate/react/paginator");

      render(
        React.createElement(UPaginator, {
          first: 0,
          rows: 10,
          totalRecords: 95,
          onPageChange: () => {},
        })
      );

      // react-core's StyleSheet, like ng-core's (see the Angular half of this
      // guarantee in packages/ng/src/paginator/paginator.spec.ts), registers
      // <style> elements with no identifying attribute — Vue's element is
      // excluded by its own data-u-style attribute, and the element is then
      // located by its known, unique .u-paginator selector, matching the
      // lookup approach already established for UButton's React half.
      const vueStyleEl = document.head.querySelector('style[data-u-style="paginator"]');
      const styleEl = Array.from(document.head.querySelectorAll("style:not([data-u-style])")).find(
        (el) => (el.textContent ?? "").includes(".u-paginator {")
      );
      expect(styleEl).not.toBeUndefined();
      expect(styleEl).not.toBe(vueStyleEl);
      const reactCss = styleEl!.textContent ?? "";

      expect(reactCss).toContain("var(--u-paginator-background");
      expect(reactCss).not.toContain("dt(");

      const resolvedToken = dt("paginator.background");
      expect(reactCss).toContain(resolvedToken);
    });

    it("React's real UPaginator has its paginator variables defined (GAP-064 D3)", async () => {
      const { UPaginator } = await import("@ultimate/react/paginator");

      render(
        React.createElement(UPaginator, {
          first: 0,
          rows: 10,
          totalRecords: 95,
          onPageChange: () => {},
        })
      );

      // react-core's <style> elements carry no key attribute; Vue's carry
      // data-u-style, so excluding those leaves React's registrations.
      const reactCss = Array.from(document.head.querySelectorAll("style:not([data-u-style])"))
        .map((el) => el.textContent ?? "")
        .join("\n");
      expect(reactCss).toContain("--u-paginator-background:");
      expect(reactCss).toContain("--u-paginator-nav-button-selected-background:");
    });
  });

  describe("React and Vue's real UTable renders resolve the same datatable.* tokens", () => {
    // Token names verified directly from packages/uix-styles/src/table/index.ts
    // (Task 1's ported file): all `dt()` calls there use a `datatable.*`
    // dotted path (the PrimeUix-inherited token namespace), never a
    // `table.*` one, even though the CSS *class* names are `.u-table-*`.
    // Per this file's own UScroller correction above, the resolved CSS
    // variable name is derived from the token's full dotted path, not the
    // class-name scheme — so these resolve to `--u-datatable-*`, not
    // `--u-table-*`. Three representative tokens, chosen for coverage
    // parity with the brief's background/border/row-selected suggestion:
    //   - datatable.header.background   (background)
    //   - datatable.header.border.color (border)
    //   - datatable.row.selected.background (row-selected)
    afterEach(() => {
      cleanup();
    });

    it("Vue's real UTable registers CSS containing the resolved datatable.* var(...) text, matching dt()'s own resolution", async () => {
      const { UTable } = await import("@ultimate/vue/table");

      const wrapper = mount(UTable, { props: { value: [], columns: [] } });

      const styleEl = document.head.querySelector('style[data-u-style="table"]');
      expect(styleEl).not.toBeNull();
      const vueCss = styleEl!.textContent ?? "";

      expect(vueCss).not.toContain("dt("); // no unresolved dt() calls leaked through

      for (const token of ["datatable.header.background", "datatable.header.border.color", "datatable.row.selected.background"]) {
        const resolvedToken = dt(token);
        expect(vueCss).toContain(resolvedToken);
      }

      wrapper.unmount();
    });

    it("React's real UTable registers CSS containing the resolved datatable.* var(...) text, matching dt()'s own resolution", async () => {
      const { UTable } = await import("@ultimate/react/table");

      render(React.createElement(UTable, { value: [], columns: [] }));

      // Same lookup mechanism established for UButton's/UScroller's/
      // UPaginator's React halves: react-core's <style> elements carry no
      // identifying attribute, so Vue's element is excluded via its own
      // data-u-style attribute, and the element is then located by its
      // known, unique .u-table-table selector (the outer .u-table class
      // alone would also match Vue's root div class list on some other
      // component, so the more specific nested selector is used).
      const vueStyleEl = document.head.querySelector('style[data-u-style="table"]');
      const styleEl = Array.from(document.head.querySelectorAll("style:not([data-u-style])")).find((el) =>
        (el.textContent ?? "").includes(".u-table-table {")
      );
      expect(styleEl).not.toBeUndefined();
      expect(styleEl).not.toBe(vueStyleEl);
      const reactCss = styleEl!.textContent ?? "";

      expect(reactCss).not.toContain("dt(");

      for (const token of ["datatable.header.background", "datatable.header.border.color", "datatable.row.selected.background"]) {
        const resolvedToken = dt(token);
        expect(reactCss).toContain(resolvedToken);
      }
    });
  });
});
