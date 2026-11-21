import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UBaseComponent } from "./base-component";
import { U_PARENT_INSTANCE } from "./parent-instance.token";
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

  it("flat-cases the component name in the root dataset", () => {
    expect(getPassThroughValue({}, "root", {}, { name: "Input-Text" })["data-pc-name"]).toBe(
      "inputtext"
    );
  });

  it("turns string and array section values into class attributes", () => {
    expect(getPassThroughValue({ header: "a b" }, "header", {}, context)["class"]).toBe("a b");
    expect(getPassThroughValue({ header: ["a", "b"] }, "header", {}, context)["class"]).toEqual([
      "a",
      "b",
    ]);
  });

  it("keeps object section values as attributes", () => {
    const value = getPassThroughValue({ header: { id: "h", class: "c" } }, "header", {}, context);
    expect(value).toMatchObject({ id: "h", class: "c", "data-pc-section": "header" });
  });

  it("calls function section values with the params", () => {
    const header = vi.fn(() => ({ id: "from-fn" }));
    const params = { instance: "self", parent: { instance: undefined } };
    expect(getPassThroughValue({ header }, "header", params, context)["id"]).toBe("from-fn");
    expect(header).toHaveBeenCalledWith(expect.objectContaining(params));
  });

  it("matches section keys regardless of case, dashes and underscores", () => {
    expect(getPassThroughValue({ Menu_Item: { id: "m" } }, "menuitem", {}, context)["id"]).toBe(
      "m"
    );
    expect(getPassThroughValue({ menuitem: { id: "m" } }, "menu-item", {}, context)["id"]).toBe(
      "m"
    );
  });

  it("resolves nested keys and uses the last segment as the section dataset", () => {
    const value = getPassThroughValue({ item: { icon: { id: "i" } } }, "item.icon", {}, context);
    expect(value).toMatchObject({ id: "i", "data-pc-section": "icon" });
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

  it("still merges the global value when mergeSections is false and the instance has the section (PrimeNG 21.1.9 behavior)", () => {
    const value = getPassThroughValue(
      { root: { id: "own" } },
      "root",
      {},
      { ...context, global: { title: "t" }, options: { mergeSections: false } }
    );
    expect(value).toMatchObject({ id: "own", title: "t" });
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
    expect(custom).toHaveBeenCalledTimes(1);
  });
});

@Component({
  standalone: true,
  selector: "u-pt-host",
  template: "<ng-content />",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: PtHostComponent }],
})
class PtHostComponent extends UBaseComponent {
  protected override readonly componentName = "pthost";
  protected override readonly styleModule = { css: "", classes: {} };
}

@Component({
  standalone: true,
  selector: "u-pt-child",
  template: "<div></div>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PtChildComponent extends UBaseComponent {
  protected override readonly componentName = "ptchild";
  protected override readonly styleModule = { css: "", classes: {} };
}

const childRoot = vi.fn(() => ({ id: "child-root" }));

@Component({
  standalone: true,
  imports: [PtHostComponent, PtChildComponent],
  template: `<u-pt-host><u-pt-child [pt]="childPt" /></u-pt-host>`,
})
class NestedFixtureComponent {
  childPt = { root: childRoot };
}

describe("UBaseComponent passthrough", () => {
  it("declares pt and ptOptions inputs that default to undefined", () => {
    const instance = TestBed.createComponent(PtHostComponent).componentInstance;
    expect(instance.pt()).toBeUndefined();
    expect(instance.ptOptions()).toBeUndefined();
  });

  it("ptm returns the pt section plus datasets", () => {
    const fixture = TestBed.createComponent(PtHostComponent);
    fixture.componentRef.setInput("pt", { root: { id: "r", class: "x" }, header: "h" });
    fixture.detectChanges();
    expect(fixture.componentInstance.ptm("root")).toEqual({
      id: "r",
      class: "x",
      "data-pc-name": "pthost",
      "data-pc-section": "root",
    });
    expect(fixture.componentInstance.ptm("header")).toEqual({
      class: "h",
      "data-pc-section": "header",
    });
  });

  it("ptm reflects a changed pt input", () => {
    const fixture = TestBed.createComponent(PtHostComponent);
    fixture.componentRef.setInput("pt", { header: { id: "a" } });
    fixture.detectChanges();
    expect(fixture.componentInstance.ptm("header")["id"]).toBe("a");
    fixture.componentRef.setInput("pt", { header: { id: "b" } });
    fixture.detectChanges();
    expect(fixture.componentInstance.ptm("header")["id"]).toBe("b");
  });

  it("accepts a function pt that receives the instance and parent params", () => {
    const fixture = TestBed.createComponent(PtHostComponent);
    const pt = vi.fn(() => ({ header: { id: "fn" } }));
    fixture.componentRef.setInput("pt", pt);
    fixture.detectChanges();
    expect(fixture.componentInstance.ptm("header")["id"]).toBe("fn");
    expect(pt).toHaveBeenCalledWith(
      expect.objectContaining({
        instance: fixture.componentInstance,
        parent: { instance: undefined },
      })
    );
  });

  it("passes extra params to function section values", () => {
    const fixture = TestBed.createComponent(PtHostComponent);
    const item = vi.fn(({ context: itemContext }: { context: { index: number } }) => ({
      id: `item-${itemContext.index}`,
    }));
    fixture.componentRef.setInput("pt", { item });
    fixture.detectChanges();
    expect(fixture.componentInstance.ptm("item", { context: { index: 2 } })["id"]).toBe("item-2");
  });

  it("ptms merges several sections and joins their classes", () => {
    const fixture = TestBed.createComponent(PtHostComponent);
    fixture.componentRef.setInput("pt", { host: { class: "a", id: "h" }, root: { class: "b" } });
    fixture.detectChanges();
    const merged = fixture.componentInstance.ptms(["host", "root"]);
    expect(merged["class"]).toBe("a b");
    expect(merged["id"]).toBe("h");
    expect(merged["data-pc-section"]).toBe("root");
  });

  it("ptmo resolves from an explicit object and ignores the pt input", () => {
    const fixture = TestBed.createComponent(PtHostComponent);
    fixture.componentRef.setInput("pt", { header: { id: "ignored" } });
    fixture.detectChanges();
    const value = fixture.componentInstance.ptmo({ header: { id: "explicit" } }, "header");
    expect(value["id"]).toBe("explicit");
  });

  it("exposes the nearest providing ancestor as parent.instance", () => {
    const fixture = TestBed.createComponent(NestedFixtureComponent);
    fixture.detectChanges();
    const hostDebug = fixture.debugElement.children[0];
    const host = hostDebug.componentInstance as PtHostComponent;
    const child = hostDebug.children[0].componentInstance as PtChildComponent;
    expect(child.$params.parent.instance).toBe(host);
    expect(host.$params.parent.instance).toBeUndefined();
  });

  it("passes the ancestor instance to function pt values", () => {
    const fixture = TestBed.createComponent(NestedFixtureComponent);
    fixture.detectChanges();
    const hostDebug = fixture.debugElement.children[0];
    const host = hostDebug.componentInstance as PtHostComponent;
    const child = hostDebug.children[0].componentInstance as PtChildComponent;
    expect(child.ptm("root")["id"]).toBe("child-root");
    expect(childRoot).toHaveBeenCalledWith(
      expect.objectContaining({ parent: { instance: host }, instance: child })
    );
  });
});
