import { describe, expect, it, vi } from "vitest";
import { mount as mountComponent, type VueWrapper } from "@vue/test-utils";
import { createBaseComponent } from "./base-component";
import { getPassThroughValue } from "./passthrough";

const context = { name: "card" };

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
    expect(getPassThroughValue({ transition: { name: "x" } }, "transition", {}, context)).toEqual({
      name: "x",
    });
  });

  it("turns string and array section values into a normalized class", () => {
    expect(getPassThroughValue({ header: "a b" }, "header", {}, context)["class"]).toBe("a b");
    expect(
      getPassThroughValue({ header: ["a", { b: true }] }, "header", {}, context)["class"]
    ).toBe("a b");
  });

  it("keeps object section values as attributes", () => {
    const value = getPassThroughValue({ header: { id: "h" } }, "header", {}, context);
    expect(value).toMatchObject({ id: "h", "data-pc-section": "header" });
  });

  it("calls function section values with the params", () => {
    const header = vi.fn(() => ({ id: "from-fn" }));
    const params = { instance: "self", props: { title: "t" } };
    expect(getPassThroughValue({ header }, "header", params, context)["id"]).toBe("from-fn");
    expect(header).toHaveBeenCalledWith(expect.objectContaining(params));
  });

  it("matches section keys regardless of case, dashes and underscores", () => {
    expect(getPassThroughValue({ Menu_Item: { id: "m" } }, "menuitem", {}, context)["id"]).toBe(
      "m"
    );
  });

  it("resolves nested keys and flat-cases the whole key into the section dataset", () => {
    const value = getPassThroughValue({ item: { icon: { id: "i" } } }, "item.icon", {}, context);
    expect(value).toMatchObject({ id: "i", "data-pc-section": "item.icon" });
  });

  it("skips the instance pt when the first key segment names a param", () => {
    const value = getPassThroughValue(
      { option: { id: "own" } },
      "option.label",
      { option: { value: 1 } },
      context
    );
    expect(value["id"]).toBeUndefined();
  });

  it("renames the root dataset and adds data-pc-extend when pt sets data-pc-section", () => {
    const value = getPassThroughValue({ "data-pc-section": "Custom" }, "root", {}, context);
    expect(value).toMatchObject({ "data-pc-name": "custom", "data-pc-extend": "card" });
  });

  it("merges the pt: attribute sections into the pt section", () => {
    const value = getPassThroughValue(
      { root: { id: "own", class: "a" } },
      "root",
      {},
      { ...context, attrsPt: { root: { class: "b", title: "t" } } }
    );
    expect(value).toMatchObject({ id: "own", class: "a b", title: "t" });
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

  it("still merges the global value when mergeSections is false (PrimeVue 4.5.5 behavior: the merged self value is always an object)", () => {
    const value = getPassThroughValue(
      {},
      "root",
      {},
      { ...context, global: { title: "t" }, options: { mergeSections: false } }
    );
    expect(value).toMatchObject({ title: "t" });
  });

  it("merges class values with mergeProps and lets a function replace the merger", () => {
    const merged = getPassThroughValue(
      { root: { class: "own" } },
      "root",
      {},
      { ...context, global: { class: "g" }, options: { mergeProps: true } }
    );
    expect(merged["class"]).toBe("g own");

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

interface CapturedParams {
  state: unknown;
  props: { pt: unknown };
  attrs: Record<string, unknown>;
  parent: { instance: unknown; props: unknown };
}

const mount = mountComponent as unknown as (
  component: unknown,
  options?: Record<string, unknown>
) => VueWrapper;

function baseFor(componentName: string, hostName?: string) {
  return createBaseComponent({
    componentName,
    hostName,
    styleModule: { css: "", classes: {} },
  });
}

describe("createBaseComponent passthrough", () => {
  it("declares pt and ptOptions props that default to undefined", () => {
    const wrapper = mount({ extends: baseFor("pt-props"), template: "<div />" });
    expect((wrapper.vm.$props as Record<string, unknown>).pt).toBeUndefined();
    expect((wrapper.vm.$props as Record<string, unknown>).ptOptions).toBeUndefined();
  });

  it("ptm applies pt attributes and datasets through v-bind", () => {
    const wrapper = mount(
      {
        extends: baseFor("ptcard"),
        template: `<div v-bind="ptm('root')"><p v-bind="ptm('header')" /></div>`,
      },
      { props: { pt: { root: { id: "r", class: "x" }, header: "h" } } }
    );
    expect(wrapper.attributes("id")).toBe("r");
    expect(wrapper.classes()).toContain("x");
    expect(wrapper.attributes("data-pc-name")).toBe("ptcard");
    expect(wrapper.attributes("data-pc-section")).toBe("root");
    const header = wrapper.find("p");
    expect(header.classes()).toContain("h");
    expect(header.attributes("data-pc-section")).toBe("header");
  });

  it("ptm reflects a changed pt prop", async () => {
    const wrapper = mount(
      { extends: baseFor("ptchange"), template: `<div v-bind="ptm('root')" />` },
      { props: { pt: { root: { id: "a" } } } }
    );
    expect(wrapper.attributes("id")).toBe("a");
    await wrapper.setProps({ pt: { root: { id: "b" } } });
    expect(wrapper.attributes("id")).toBe("b");
  });

  it("ptm accepts pt:section:attribute attributes", () => {
    const wrapper = mount(
      {
        extends: baseFor("ptattrs"),
        inheritAttrs: false,
        template: `<div v-bind="ptm('root')" />`,
      },
      { attrs: { "pt:root:id": "from-attr", "pt:root:class": "attr-class" } }
    );
    expect(wrapper.attributes("id")).toBe("from-attr");
    expect(wrapper.classes()).toContain("attr-class");
  });

  it("ptmi merges the non-pt attributes with the root section", () => {
    const wrapper = mount(
      { extends: baseFor("ptmi"), inheritAttrs: false, template: `<div v-bind="ptmi('root')" />` },
      {
        props: { pt: { root: { title: "from-pt" } } },
        attrs: { id: "from-attrs", "pt:root:class": "attr-class" },
      }
    );
    expect(wrapper.attributes("id")).toBe("from-attrs");
    expect(wrapper.attributes("title")).toBe("from-pt");
    expect(wrapper.attributes()).not.toHaveProperty("pt:root:class");
    expect(wrapper.classes()).toContain("attr-class");
  });

  it("passes instance, props, state, attrs and parent to function pt values", () => {
    const root = vi.fn(() => ({ id: "fn" }));
    const wrapper = mount(
      {
        extends: baseFor("ptparams"),
        data: () => ({ open: true }),
        template: `<div v-bind="ptm('root')" />`,
      },
      { props: { pt: { root } }, attrs: { title: "t" } }
    );
    expect(wrapper.attributes("id")).toBe("fn");
    const params = (root.mock.calls[0] as unknown[])[0] as CapturedParams;
    expect(params.state).toMatchObject({ open: true });
    expect(params.props.pt).toBeDefined();
    expect(params.attrs.title).toBe("t");
    expect(params.parent.instance).toBe(wrapper.vm.$parent);
  });

  it("ptmo resolves from an explicit object and ignores the pt prop", () => {
    const wrapper = mount(
      {
        extends: baseFor("ptmo"),
        template: `<div v-bind="ptmo({ root: { id: 'explicit' } }, 'root')" />`,
      },
      { props: { pt: { root: { id: "ignored" } } } }
    );
    expect(wrapper.attributes("id")).toBe("explicit");
  });

  it("exposes the nearest ancestor with the base as parent.instance", () => {
    const childRoot = vi.fn(() => ({ id: "child" }));
    const Child = {
      extends: baseFor("ptchild"),
      template: `<span v-bind="ptm('root')" />`,
    };
    const wrapper = mount({
      extends: baseFor("pthost"),
      components: { Child },
      data: () => ({ childPt: { root: childRoot } }),
      template: `<div><Child :pt="childPt" /></div>`,
    });
    expect(wrapper.find("span").attributes("id")).toBe("child");
    const params = (childRoot.mock.calls[0] as unknown[])[0] as CapturedParams;
    expect(params.parent.instance).toBe(wrapper.vm.$.proxy);
    expect(params.parent.props).toBe(wrapper.vm.$props);
  });

  it("uses the host instance as parent.instance for a component with a hostName", () => {
    const subRoot = vi.fn(() => ({}));
    const Sub = {
      extends: baseFor("ptsub", "pthost"),
      template: `<i v-bind="ptm('root')" />`,
    };
    const Middle = {
      extends: baseFor("ptmiddle"),
      components: { Sub },
      data: () => ({ subPt: { root: subRoot } }),
      template: `<b><Sub :pt="subPt" /></b>`,
    };
    const wrapper = mount({
      extends: baseFor("pthost"),
      components: { Middle },
      template: `<div><Middle /></div>`,
    });
    expect(wrapper.find("i").exists()).toBe(true);
    const params = (subRoot.mock.calls[0] as unknown[])[0] as CapturedParams;
    expect(params.parent.instance).toBe(wrapper.vm.$.proxy);
  });
});
