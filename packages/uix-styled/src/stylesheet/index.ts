import { createStyleMarkup, isNotEmpty } from "@ultimate/uix-utils";

export interface StyleSheetProps {
  attrs?: Record<string, unknown>;
}

export interface StyleMeta<E = HTMLStyleElement> {
  name?: string;
  css?: string;
  attrs?: Record<string, unknown>;
  markup?: string;
  element?: E;
  /** The entry belongs before every other entry (see `StyleAddOptions`). */
  first?: boolean;
}

export interface StyleAddOptions {
  /**
   * Places the entry before every other entry in registry order and tells
   * `createStyleElement` to put the element at the start of its container,
   * as PrimeNG and PrimeVue load their `layer-order` style with `first: true`.
   */
  first?: boolean;
}

class StyleSheet<E = HTMLStyleElement> {
  _styles: Map<string, StyleMeta<E>>;
  _attrs: Record<string, unknown>;
  constructor({ attrs }: StyleSheetProps = {}) {
    this._styles = new Map();
    this._attrs = attrs || {};
  }
  get(key: string) {
    return this._styles.get(key);
  }
  has(key: string) {
    return this._styles.has(key);
  }
  delete(key: string) {
    this._styles.delete(key);
  }
  clear() {
    this._styles.clear();
  }
  add(key: string, css?: string, options: StyleAddOptions = {}) {
    if (isNotEmpty(css)) {
      const meta = {
        name: key,
        css,
        attrs: this._attrs,
        markup: createStyleMarkup(css, this._attrs),
        ...(options.first ? { first: true } : {}),
      } satisfies StyleMeta<E>;

      const entry = {
        ...meta,
        element: this.createStyleElement(meta),
      };

      if (options.first) {
        const rest = [...this._styles].filter(([name]) => name !== key);
        this._styles.clear();
        this._styles.set(key, entry);
        for (const [name, other] of rest) this._styles.set(name, other);
      } else {
        this._styles.set(key, entry);
      }
    }
  }
  update(key: string, css = "", options: StyleAddOptions = {}) {
    const current = this._styles.get(key);

    if (!current) {
      this.add(key, css, options);
      return;
    }

    const meta = {
      ...current,
      css,
      markup: isNotEmpty(css) ? createStyleMarkup(css, this._attrs) : "",
    } satisfies StyleMeta<E>;

    this._styles.set(key, meta);

    if (meta.element) this.updateStyleElement(meta.element, meta);
  }
  getStyles() {
    return this._styles;
  }
  getAllCSS() {
    return [...this._styles.values()].map((style) => style.css).filter(String);
  }
  getAllMarkup() {
    return [...this._styles.values()].map((style) => style.markup).filter(String);
  }
  getAllElements() {
    return [...this._styles.values()].map((style) => style.element);
  }
  /**
   * Used to create a style element.
   *
   * @param {StyleMeta} meta
   * @returns {HTMLStyleElement | undefined}
   */
  createStyleElement(meta: StyleMeta = {}): E | undefined {
    return undefined;
  }
  /**
   * Used to write new css into an element previously returned by
   * `createStyleElement`.
   *
   * @param {E} element
   * @param {StyleMeta} meta
   */
  updateStyleElement(element: E, meta: StyleMeta<E> = {}): void {}
}

export default StyleSheet;
