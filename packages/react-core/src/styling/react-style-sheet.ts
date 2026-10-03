import { StyleSheet, type StyleMeta } from "@ultimate/uix-styled";
import { createStyleElement } from "@ultimate/uix-utils";

class ReactStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined; // SSR guard
    return createStyleElement(meta.css ?? "", meta.attrs, document.head);
  }
}

// Single module-level instance — every Ultimate React component registers
// against this one instance. (Angular keeps one registry per document;
// ngCoreStyleSheet is the browser document's registry.)
export const reactCoreStyleSheet = new ReactStyleSheet();
