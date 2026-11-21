import { describe, expect, it, vi } from "vitest";
import { createPassThrough, getPassThroughValue } from "./passthrough";

const context = { name: "Card" };

describe("getPassThroughValue", () => {
  it("adds name and section datasets to the root section", () => {
    expect(getPassThroughValue({}, "root", {}, context)).toEqual({
      "data-pc-name": "card",
      "data-pc-section": "root",
    });
  });

  it("adds only the section dataset to other sections", () => {
    expect(getPassThroughValue({}, "header", {}, context)).toEqual({
      "data-pc-section": "header",
    });
  });

  it("adds no datasets to the transition section", () => {
    expect(getPassThroughValue({ transition: { timeout: 1 } }, "transition", {}, context)).toEqual({
      timeout: 1,
    });
  });

  it("uses the flat-cased hostName param for the root data-pc-name", () => {
    expect(getPassThroughValue({}, "root", { hostName: "Tree" }, context)["data-pc-name"]).toBe(
      "tree"
    );
  });

  it("turns string and array section values into className attributes", () => {
    expect(getPassThroughValue({ header: "a b" }, "header", {}, context)["className"]).toBe("a b");
    expect(
      getPassThroughValue({ header: ["a", { b: true, c: false }] }, "header", {}, context)
    ).toMatchObject({
      className: "a b",
    });
  });

  it("joins a className array inside an object section and keeps only className (PrimeReact 10.9.9 behavior)", () => {
    const value = getPassThroughValue(
      { header: { className: ["a", "b"], id: "h" } },
      "header",
      {},
      context
    );
    expect(value).toEqual({ className: "a b", "data-pc-section": "header" });
  });

  it("keeps object section values as attributes", () => {
    const value = getPassThroughValue({ header: { id: "h" } }, "header", {}, context);
    expect(value).toMatchObject({ id: "h", "data-pc-section": "header" });
  });

  it("calls function section values with the params", () => {
    const header = vi.fn(() => ({ id: "from-fn" }));
    const props = { title: "t" };
    expect(getPassThroughValue({ header }, "header", { props }, context)["id"]).toBe("from-fn");
    expect(header).toHaveBeenCalledWith(expect.objectContaining({ props }));
  });

  it("matches section keys regardless of case, dashes and underscores", () => {
    expect(getPassThroughValue({ Sub_Title: { id: "s" } }, "subTitle", {}, context)["id"]).toBe(
      "s"
    );
  });

  it("unwraps a props object that carries pt", () => {
    expect(getPassThroughValue({ pt: { root: { id: "r" } } }, "root", {}, context)["id"]).toBe("r");
  });

  it("skips the instance pt when the first key segment names a param and uses the second segment as the section", () => {
    const value = getPassThroughValue(
      { item: { id: "own" } },
      "item.icon",
      { item: { id: 1 } },
      context
    );
    expect(value).toEqual({ "data-pc-section": "icon" });
  });

  it("merges the global value with the instance value by default", () => {
    const value = getPassThroughValue(
      { root: { id: "own" } },
      "root",
      {},
      { ...context, global: { id: "g", title: "t" } }
    );
    expect(value).toMatchObject({ id: "own", title: "t" });
  });

  it("drops the global value when mergeSections is false and the instance has no section", () => {
    const value = getPassThroughValue(
      {},
      "root",
      {},
      { ...context, global: { title: "t" }, options: { mergeSections: false } }
    );
    expect(value).toEqual({ "data-pc-name": "card", "data-pc-section": "root" });
  });

  it("merges className values with mergeProps and lets a function replace the merger", () => {
    const merged = getPassThroughValue(
      { root: { className: "own" } },
      "root",
      {},
      { ...context, global: { className: "g" }, options: { mergeProps: true } }
    );
    expect(merged["className"]).toBe("g own");

    const custom = vi.fn(() => ({ id: "custom" }));
    const result = getPassThroughValue(
      { root: { id: "own" } },
      "root",
      {},
      { ...context, global: { id: "g" }, options: { mergeProps: custom } }
    );
    expect(result).toEqual({ id: "custom" });
  });
});

describe("createPassThrough", () => {
  it("ptm reads pt and ptOptions from props and passes props and state to functions", () => {
    const root = vi.fn(({ state }: { state: { open: boolean } }) => ({
      "data-open": String(state.open),
    }));
    const props = { pt: { root }, ptOptions: { mergeSections: true } };
    const { ptm } = createPassThrough("Card", { props, state: { open: true } });
    expect(ptm("root")).toMatchObject({ "data-open": "true", "data-pc-section": "root" });
    expect(root).toHaveBeenCalledWith(expect.objectContaining({ props, state: { open: true } }));
  });

  it("ptm merges call params over the metadata", () => {
    const item = vi.fn(({ context: itemContext }: { context: { index: number } }) => ({
      id: `item-${itemContext.index}`,
    }));
    const { ptm } = createPassThrough("Menu", { props: { pt: { item } } });
    expect(ptm("item", { context: { index: 3 } })["id"]).toBe("item-3");
  });

  it("ptm returns datasets when pt is absent", () => {
    const { ptm } = createPassThrough("Card", { props: {} });
    expect(ptm("root")).toEqual({ "data-pc-name": "card", "data-pc-section": "root" });
  });

  it("ptm passes the parent metadata supplied by the caller to functions", () => {
    const parent = { props: { pt: {} }, state: {} };
    const root = vi.fn(() => ({}));
    const { ptm } = createPassThrough("TreeNode", { props: { pt: { root } }, parent });
    ptm("root");
    expect(root).toHaveBeenCalledWith(expect.objectContaining({ parent }));
  });

  it("ptmo resolves from an explicit object and ignores the metadata", () => {
    const { ptmo } = createPassThrough("Card", { props: { pt: { header: { id: "ignored" } } } });
    expect(ptmo({ header: { id: "explicit" } }, "header")["id"]).toBe("explicit");
  });
});
