import { useEffect, useRef } from "react";

export function useUpdateEffect(effect: () => void, deps: unknown[]): void {
  const isMounted = useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      effect();
    } else {
      isMounted.current = true;
    }
  }, deps);
}
