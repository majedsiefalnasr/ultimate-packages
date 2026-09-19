import * as React from "react";

export interface UseStyleClassOptions {
  /** Selector to define the target element: '@next', '@prev', '@parent', '@grandparent', or a CSS selector. */
  selector?: string;
  /** Style class to add when item begins to get displayed. */
  enterFromClass?: string;
  /** Style class to add during enter animation. */
  enterActiveClass?: string;
  /** Style class to add when item finishes entering. */
  enterToClass?: string;
  /** Style class to add when item begins to get hidden. */
  leaveFromClass?: string;
  /** Style class to add during leave animation. */
  leaveActiveClass?: string;
  /** Style class to add when leave animation is completed. */
  leaveToClass?: string;
  /** Adds or removes a class when no enter-leave animation is required. */
  toggleClass?: string;
  /** Whether to trigger leave animation when outside of the element is clicked. */
  hideOnOutsideClick?: boolean;
  /** Whether to trigger leave animation when Escape is pressed. */
  hideOnEscape?: boolean;
  /** Whether to trigger leave animation when the window is resized. */
  hideOnResize?: boolean;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `StyleClass` (real source:
 * `components/lib/styleclass/StyleClass.js`, extracted this session via
 * `scripts/provenance/extract-primereact-source.mjs`). Confirmed against
 * real source: PrimeReact's own `StyleClass` is a `React.forwardRef`
 * component that renders `props.children` unchanged and attaches a click
 * listener imperatively to its resolved child DOM element via
 * `ObjectUtils.getRefElement(props.nodeRef)` — a click-driven class-toggle/
 * enter-leave-animation *behavior*, not a component that renders any markup
 * of its own.
 *
 * Per this task's brief to verify StyleClass's real shape rather than
 * assume a standard component pattern, and matching React's own established
 * "behavior as a hook" translation this project already used for
 * `useKeyFilter` (`packages/react/src/key-filter/key-filter.ts`) — a small
 * hook, `useStyleClass(triggerRef, options)`, is the idiomatic React
 * attachment mechanism for a DOM-event-driven behavior with no UI of its
 * own, rather than a `forwardRef`-wrapping-children component (which would
 * still require the same imperative-ref plumbing this hook already
 * provides, just behind an extra unnecessary wrapper element/layer — a
 * mismatch with this project's no-unnecessary-layer/YAGNI posture) or a
 * static-utility-object export (unusable without manual event wiring, the
 * same mismatch `useKeyFilter`'s own precedent already rejected for
 * PrimeReact's KeyFilter).
 *
 * Ports the same core algorithm as `UStyleClass` (Angular,
 * `packages/ng/src/style-class/style-class.ts`) and Vue's `StyleClass`
 * directive: resolve the target once on first click, then either toggle a
 * single `toggleClass` or run an enter/leave class-sequence gated on the
 * target's `animationend` event, plus optional outside-click/Escape/resize
 * dismissal — one shared, source-verified behavior, three framework-native
 * attachment mechanisms.
 */
export function useStyleClass(
  triggerRef: React.RefObject<HTMLElement | null>,
  {
    selector,
    enterFromClass,
    enterActiveClass,
    enterToClass,
    leaveFromClass,
    leaveActiveClass,
    leaveToClass,
    toggleClass,
    hideOnOutsideClick = false,
    hideOnEscape = false,
    hideOnResize = false,
  }: UseStyleClassOptions
): void {
  const targetRef = React.useRef<HTMLElement | null>(null);
  const animatingRef = React.useRef(false);

  React.useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const resolveTarget = (): HTMLElement | null => {
      switch (selector) {
        case "@next":
          return trigger.nextElementSibling as HTMLElement | null;
        case "@prev":
          return trigger.previousElementSibling as HTMLElement | null;
        case "@parent":
          return trigger.parentElement;
        case "@grandparent":
          return trigger.parentElement?.parentElement ?? null;
        default:
          return selector ? document.querySelector<HTMLElement>(selector) : null;
      }
    };

    const isVisible = () => targetRef.current?.offsetParent !== null;

    const isOutsideClick = (event: Event) => {
      const eventTarget = event.target as Node;
      return (
        !trigger.isSameNode(eventTarget) &&
        !trigger.contains(eventTarget) &&
        !targetRef.current?.contains(eventTarget)
      );
    };

    let documentClickListener: ((event: MouseEvent) => void) | null = null;
    let documentKeydownListener: ((event: KeyboardEvent) => void) | null = null;
    let windowResizeListener: (() => void) | null = null;

    const unbindDocumentClickListener = () => {
      if (documentClickListener) {
        document.removeEventListener("click", documentClickListener);
        documentClickListener = null;
      }
    };
    const bindDocumentClickListener = () => {
      if (documentClickListener) return;
      documentClickListener = (event: MouseEvent) => {
        if (!isVisible()) unbindDocumentClickListener();
        else if (isOutsideClick(event)) leave();
      };
      document.addEventListener("click", documentClickListener);
    };

    const unbindDocumentKeydownListener = () => {
      if (documentKeydownListener) {
        document.removeEventListener("keydown", documentKeydownListener);
        documentKeydownListener = null;
      }
    };
    const bindDocumentKeydownListener = () => {
      if (documentKeydownListener) return;
      documentKeydownListener = (event: KeyboardEvent) => {
        if (!isVisible()) unbindDocumentKeydownListener();
        else if (event.key === "Escape") leave();
      };
      document.addEventListener("keydown", documentKeydownListener);
    };

    const unbindWindowResizeListener = () => {
      if (windowResizeListener) {
        window.removeEventListener("resize", windowResizeListener);
        windowResizeListener = null;
      }
    };
    const bindWindowResizeListener = () => {
      if (windowResizeListener) return;
      windowResizeListener = () => {
        if (!isVisible()) unbindWindowResizeListener();
        else leave();
      };
      window.addEventListener("resize", windowResizeListener);
    };

    function enter(): void {
      const target = targetRef.current;
      if (!target) return;
      if (enterActiveClass) {
        if (!animatingRef.current) {
          animatingRef.current = true;
          target.classList.add(enterActiveClass);
          if (enterFromClass) target.classList.remove(enterFromClass);
          const onAnimationEnd = () => {
            target.classList.remove(enterActiveClass);
            if (enterToClass) target.classList.add(enterToClass);
            target.removeEventListener("animationend", onAnimationEnd);
            animatingRef.current = false;
          };
          target.addEventListener("animationend", onAnimationEnd);
        }
      } else {
        if (enterFromClass) target.classList.remove(enterFromClass);
        if (enterToClass) target.classList.add(enterToClass);
      }
      if (hideOnOutsideClick) bindDocumentClickListener();
      if (hideOnEscape) bindDocumentKeydownListener();
      if (hideOnResize) bindWindowResizeListener();
    }

    function leave(): void {
      const target = targetRef.current;
      if (!target) return;
      if (leaveActiveClass) {
        if (!animatingRef.current) {
          animatingRef.current = true;
          target.classList.add(leaveActiveClass);
          if (leaveFromClass) target.classList.remove(leaveFromClass);
          const onAnimationEnd = () => {
            target.classList.remove(leaveActiveClass);
            if (leaveToClass) target.classList.add(leaveToClass);
            target.removeEventListener("animationend", onAnimationEnd);
            animatingRef.current = false;
          };
          target.addEventListener("animationend", onAnimationEnd);
        }
      } else {
        if (leaveFromClass) target.classList.remove(leaveFromClass);
        if (leaveToClass) target.classList.add(leaveToClass);
      }
      if (hideOnOutsideClick) unbindDocumentClickListener();
      if (hideOnEscape) unbindDocumentKeydownListener();
      if (hideOnResize) unbindWindowResizeListener();
    }

    const onClick = () => {
      targetRef.current ??= resolveTarget();
      const target = targetRef.current;
      if (!target) return;

      if (toggleClass) {
        target.classList.contains(toggleClass)
          ? target.classList.remove(toggleClass)
          : target.classList.add(toggleClass);
      } else if (target.offsetParent === null) {
        enter();
      } else {
        leave();
      }
    };

    trigger.addEventListener("click", onClick);
    return () => {
      trigger.removeEventListener("click", onClick);
      unbindDocumentClickListener();
      unbindDocumentKeydownListener();
      unbindWindowResizeListener();
      targetRef.current = null;
    };
  }, [
    triggerRef,
    selector,
    enterFromClass,
    enterActiveClass,
    enterToClass,
    leaveFromClass,
    leaveActiveClass,
    leaveToClass,
    toggleClass,
    hideOnOutsideClick,
    hideOnEscape,
    hideOnResize,
  ]);
}
