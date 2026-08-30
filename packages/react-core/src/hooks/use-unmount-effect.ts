import { useEffect } from "react";

export function useUnmountEffect(cleanup: () => void): void {
  useEffect(() => cleanup, []);
}
