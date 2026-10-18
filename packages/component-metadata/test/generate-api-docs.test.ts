import { afterEach, describe, it, expect, vi } from "vitest";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REPO_ROOT } from "../scripts/check-api-drift.mjs";
import { plannedPages, syncApiPages } from "../scripts/generate-api-docs.mjs";
import sourceMap from "../scripts/source-map.json";
import { ALL_COMPONENTS } from "../src/index";

afterEach(() => vi.restoreAllMocks());

describe("plannedPages", () => {
  it("plans one page per record per framework at packages/<fw>/src/<dir>/<dir>.api.mdx", () => {
    const pages = plannedPages(ALL_COMPONENTS, sourceMap);
    expect(pages).toHaveLength(24);
    expect(pages[0].path).toBe(join(REPO_ROOT, "packages/ng/src/button/button.api.mdx"));
    expect(pages[0].contents).toContain('<Meta title="API/Button" />');
  });
});

describe("syncApiPages", () => {
  it("--check returns 0 for the committed API pages", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(syncApiPages(plannedPages(ALL_COMPONENTS, sourceMap), true)).toBe(0);
    expect(log).toHaveBeenCalledWith("[docs] OK: 24 API page(s) up to date");
  });

  it("--check returns 1, names stale and absent pages, and writes nothing", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = mkdtempSync(join(tmpdir(), "api-docs-"));
    writeFileSync(join(root, "stale.api.mdx"), "old");
    const pages = [
      { path: join(root, "stale.api.mdx"), contents: "new" },
      { path: join(root, "absent.api.mdx"), contents: "new" },
    ];
    expect(syncApiPages(pages, true, root)).toBe(1);
    expect(error.mock.calls.map(([line]) => line)).toEqual([
      "[docs] out of date: stale.api.mdx",
      "[docs] out of date: absent.api.mdx",
      "[docs] FAILED: run pnpm --filter @ultimate/component-metadata run docs:generate",
    ]);
    expect(readFileSync(join(root, "stale.api.mdx"), "utf8")).toBe("old");
    expect(existsSync(join(root, "absent.api.mdx"))).toBe(false);
  });

  it("without --check writes out-of-date pages and returns 0", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const root = mkdtempSync(join(tmpdir(), "api-docs-"));
    const path = join(root, "page.api.mdx");
    expect(syncApiPages([{ path, contents: "new" }], false, root)).toBe(0);
    expect(readFileSync(path, "utf8")).toBe("new");
  });
});
