import { useEffect, useRef } from "react";
import { createMotion, type MotionOptions, type MotionInstance } from "@ultimate/uix-motion";

// React lifecycle integration for @ultimate/uix-motion's imperative, Promise-based
// createMotion — no react-transition-group dependency (spec §17, intentional
// deviation from verified PrimeReact CSSTransition.js, which wraps the real npm
// react-transition-group package).
export function useMotion(
  elementRef: React.RefObject<HTMLElement>,
  visible: boolean,
  options?: MotionOptions
): void {
  const motionRef = useRef<MotionInstance | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    motionRef.current = createMotion(element, options);
    if (visible) {
      motionRef.current.enter();
    } else {
      motionRef.current.leave();
    }

    return () => {
      motionRef.current?.cancel();
    };
  }, [visible]);
}
