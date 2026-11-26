import getScrollableParents from "../methods/getScrollableParents";

/**
 * Calls `listener` when any scrollable ancestor of `element` scrolls, so a
 * connected overlay can hide or realign while its anchor moves. Port of the
 * identical PrimeNG 21.1.9 `dom/connectedoverlayscrollhandler.ts` and
 * PrimeVue 4.5.5 `core/utils/ConnectedOverlayScrollHandler.js` classes.
 */
export default class ConnectedOverlayScrollHandler {
  element: Element | null;

  listener: ((event: Event) => void) | null;

  scrollableParents: Element[] | null = null;

  constructor(element: Element, listener: (event: Event) => void = () => {}) {
    this.element = element;
    this.listener = listener;
  }

  bindScrollListener(): void {
    if (!this.element || !this.listener) return;
    this.scrollableParents = getScrollableParents(this.element);
    for (let i = 0; i < this.scrollableParents.length; i++) {
      this.scrollableParents[i].addEventListener("scroll", this.listener);
    }
  }

  unbindScrollListener(): void {
    if (this.scrollableParents && this.listener) {
      for (let i = 0; i < this.scrollableParents.length; i++) {
        this.scrollableParents[i].removeEventListener("scroll", this.listener);
      }
    }
  }

  destroy(): void {
    this.unbindScrollListener();
    this.element = null;
    this.listener = null;
    this.scrollableParents = null;
  }
}
