import { afterEach, describe, it, expect, vi } from "vitest";
import { ConnectedOverlayScrollHandler } from "../src/dom";

function scrollableTree() {
  const outer = document.createElement("div");
  outer.style.overflow = "auto";
  const inner = document.createElement("div");
  inner.style.overflow = "scroll";
  const plain = document.createElement("div");
  const anchor = document.createElement("span");
  outer.appendChild(inner);
  inner.appendChild(plain);
  plain.appendChild(anchor);
  document.body.appendChild(outer);
  return { outer, inner, plain, anchor };
}

describe("ConnectedOverlayScrollHandler", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("calls the listener when a scrollable ancestor scrolls", () => {
    const { outer, inner, anchor } = scrollableTree();
    const listener = vi.fn();
    const handler = new ConnectedOverlayScrollHandler(anchor, listener);
    handler.bindScrollListener();

    inner.dispatchEvent(new Event("scroll"));
    outer.dispatchEvent(new Event("scroll"));

    expect(listener).toHaveBeenCalledTimes(2);
    expect(handler.scrollableParents).toEqual([inner, outer]);
  });

  it("ignores ancestors that do not scroll", () => {
    const { plain, anchor } = scrollableTree();
    const listener = vi.fn();
    const handler = new ConnectedOverlayScrollHandler(anchor, listener);
    handler.bindScrollListener();

    plain.dispatchEvent(new Event("scroll"));

    expect(listener).not.toHaveBeenCalled();
  });

  it("stops calling the listener after unbindScrollListener", () => {
    const { inner, anchor } = scrollableTree();
    const listener = vi.fn();
    const handler = new ConnectedOverlayScrollHandler(anchor, listener);
    handler.bindScrollListener();
    handler.unbindScrollListener();

    inner.dispatchEvent(new Event("scroll"));

    expect(listener).not.toHaveBeenCalled();
  });

  it("can bind again after unbinding", () => {
    const { inner, anchor } = scrollableTree();
    const listener = vi.fn();
    const handler = new ConnectedOverlayScrollHandler(anchor, listener);
    handler.bindScrollListener();
    handler.unbindScrollListener();
    handler.bindScrollListener();

    inner.dispatchEvent(new Event("scroll"));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("destroy removes the listeners and releases its references", () => {
    const { inner, anchor } = scrollableTree();
    const listener = vi.fn();
    const handler = new ConnectedOverlayScrollHandler(anchor, listener);
    handler.bindScrollListener();
    handler.destroy();

    inner.dispatchEvent(new Event("scroll"));

    expect(listener).not.toHaveBeenCalled();
    expect(handler.element).toBeNull();
    expect(handler.listener).toBeNull();
    expect(handler.scrollableParents).toBeNull();
    expect(() => handler.bindScrollListener()).not.toThrow();
  });

  it("defaults the listener to a no-op", () => {
    const { inner, anchor } = scrollableTree();
    const handler = new ConnectedOverlayScrollHandler(anchor);
    handler.bindScrollListener();

    expect(() => inner.dispatchEvent(new Event("scroll"))).not.toThrow();
    handler.destroy();
  });
});
