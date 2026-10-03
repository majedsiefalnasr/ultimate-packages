import { StyleSheet, type StyleMeta } from "@ultimate/uix-styled";

/** Attribute that identifies a registered `<style>` element by its style key. */
export const NG_CORE_STYLE_KEY_ATTR = "data-u-style";

/**
 * `ng-core`'s `StyleSheet<HTMLStyleElement>` for ONE document (GAP-078).
 * Writes into that document's `<head>` (the injected Angular `DOCUMENT`,
 * per request under SSR) instead of the global `document`, and adopts an
 * existing `<style>` with the same key (server-rendered HTML being
 * hydrated) instead of creating a duplicate. PrimeNG 21.1.9's `UseStyle`
 * likewise writes into the injected `DOCUMENT`.
 */
class NgCoreStyleSheet extends StyleSheet<HTMLStyleElement> {
  constructor(private readonly doc: Document | undefined) {
    super();
  }

  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    const head = this.doc?.head;
    if (!head) return undefined;
    const key = meta.name ?? "";
    // Compare attribute values instead of building a CSS selector, so keys
    // with selector-special characters are still found.
    const existing = Array.from(head.querySelectorAll("style")).find(
      (el) => el.getAttribute(NG_CORE_STYLE_KEY_ATTR) === key
    );
    if (existing) return existing;
    const el = this.doc!.createElement("style");
    el.setAttribute(NG_CORE_STYLE_KEY_ATTR, key);
    el.textContent = meta.css ?? "";
    head.appendChild(el);
    return el;
  }
}

const sheets = new WeakMap<Document, NgCoreStyleSheet>();

/** The style registry for `doc`: one per document, inert when `doc` is undefined. */
export function ngCoreStyleSheetFor(doc: Document | undefined): StyleSheet<HTMLStyleElement> {
  if (!doc) return new NgCoreStyleSheet(undefined);
  let sheet = sheets.get(doc);
  if (!sheet) {
    sheet = new NgCoreStyleSheet(doc);
    sheets.set(doc, sheet);
  }
  return sheet;
}

/**
 * The registry for the global `document` (inert when there is none, e.g.
 * on the server). Kept for existing callers and tests; components use
 * `ngCoreStyleSheetFor(this.document)`.
 */
export const ngCoreStyleSheet = ngCoreStyleSheetFor(
  typeof document === "undefined" ? undefined : document
);
