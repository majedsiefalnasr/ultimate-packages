import { describe, expect, it } from "vitest";
import { NG_CORE_STYLE_KEY_ATTR, ngCoreStyleSheet, ngCoreStyleSheetFor } from "./style-sheet";

function newDoc(): Document {
  return document.implementation.createHTMLDocument("t");
}
const keyed = (doc: Document, key: string) =>
  Array.from(doc.head.querySelectorAll("style")).filter(
    (s) => s.getAttribute(NG_CORE_STYLE_KEY_ATTR) === key
  );

describe("ngCoreStyleSheetFor (GAP-078)", () => {
  it("writes a keyed <style> into the given document, not the global one", () => {
    const doc = newDoc();
    const before = document.head.querySelectorAll("style").length;
    ngCoreStyleSheetFor(doc).add("probe-a", ".a{color:red}");
    expect(keyed(doc, "probe-a")).toHaveLength(1);
    expect(keyed(doc, "probe-a")[0].textContent).toBe(".a{color:red}");
    expect(document.head.querySelectorAll("style").length).toBe(before);
  });

  it("returns one registry per document and keeps documents separate", () => {
    const a = newDoc();
    const b = newDoc();
    expect(ngCoreStyleSheetFor(a)).toBe(ngCoreStyleSheetFor(a));
    expect(ngCoreStyleSheetFor(a)).not.toBe(ngCoreStyleSheetFor(b));
    ngCoreStyleSheetFor(a).add("probe-b", ".b{}");
    expect(keyed(a, "probe-b")).toHaveLength(1);
    expect(keyed(b, "probe-b")).toHaveLength(0);
  });

  it("creates one element when the same key is added twice to a document", () => {
    const doc = newDoc();
    const sheet = ngCoreStyleSheetFor(doc);
    sheet.add("probe-c", ".c{}");
    if (!sheet.has("probe-c")) sheet.add("probe-c", ".c{}");
    sheet.add("probe-c", ".c{}");
    expect(keyed(doc, "probe-c")).toHaveLength(1);
  });

  it("adopts an existing server-rendered keyed <style> instead of duplicating it", () => {
    const doc = newDoc();
    const server = doc.createElement("style");
    server.setAttribute(NG_CORE_STYLE_KEY_ATTR, "probe-d");
    server.textContent = ".d{}";
    doc.head.appendChild(server);
    const sheet = ngCoreStyleSheetFor(doc);
    sheet.add("probe-d", ".d{}");
    expect(keyed(doc, "probe-d")).toHaveLength(1);
    expect(sheet.get("probe-d")?.element).toBe(server);
  });

  it("adopts existing keys and creates only the missing ones (partial server output)", () => {
    const doc = newDoc();
    const server = doc.createElement("style");
    server.setAttribute(NG_CORE_STYLE_KEY_ATTR, "probe-e1");
    doc.head.appendChild(server);
    const sheet = ngCoreStyleSheetFor(doc);
    sheet.add("probe-e1", ".e1{}");
    sheet.add("probe-e2", ".e2{}");
    expect(keyed(doc, "probe-e1")).toHaveLength(1);
    expect(keyed(doc, "probe-e2")).toHaveLength(1);
  });

  it("finds a key with CSS-selector-special characters", () => {
    const doc = newDoc();
    const odd = 'probe"f]:x';
    const server = doc.createElement("style");
    server.setAttribute(NG_CORE_STYLE_KEY_ATTR, odd);
    doc.head.appendChild(server);
    ngCoreStyleSheetFor(doc).add(odd, ".f{}");
    expect(keyed(doc, odd)).toHaveLength(1);
  });

  it("is inert without a document", () => {
    const sheet = ngCoreStyleSheetFor(undefined);
    expect(() => sheet.add("probe-g", ".g{}")).not.toThrow();
    expect(sheet.get("probe-g")?.element).toBeUndefined();
  });

  it("keeps ngCoreStyleSheet as the global document's registry", () => {
    expect(ngCoreStyleSheet).toBe(ngCoreStyleSheetFor(document));
  });
});
