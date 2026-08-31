import { createMotion, type MotionOptions } from "@ultimate/uix-motion";

interface MotionByElement {
  cancel: () => void;
}

const motionByElement = new WeakMap<Element, MotionByElement>();

// Returns the exact hook-callback shape Vue's native <transition> element
// expects — NOT a useEffect-shaped call site the way react-core's useMotion
// is (spec §17). No react-transition-group-equivalent dependency; calls the
// same already-framework-agnostic @ultimate/uix-motion createMotion Angular
// and React already use.
export function createMotionTransitionHooks(getOptions: () => MotionOptions): {
  onEnter: (el: Element, done: () => void) => void;
  onLeave: (el: Element, done: () => void) => void;
  onEnterCancelled: (el: Element) => void;
  onLeaveCancelled: (el: Element) => void;
} {
  function run(el: Element, action: "enter" | "leave", done: () => void) {
    const motion = createMotion(el as HTMLElement, getOptions());
    motionByElement.set(el, motion);
    motion[action]().then(done);
  }

  return {
    onEnter(el, done) {
      run(el, "enter", done);
    },
    onLeave(el, done) {
      run(el, "leave", done);
    },
    onEnterCancelled(el) {
      motionByElement.get(el)?.cancel();
    },
    onLeaveCancelled(el) {
      motionByElement.get(el)?.cancel();
    },
  };
}
