type PropSet = Record<string, unknown> | undefined;

function isEventHandlerKey(key: string): boolean {
  return key.length > 2 && key.startsWith("on") && key[2] === key[2].toUpperCase();
}

export function useMergeProps(): (...propSets: PropSet[]) => Record<string, unknown> {
  return (...propSets: PropSet[]) => {
    const result: Record<string, unknown> = {};
    for (const props of propSets) {
      if (!props) continue;
      for (const [key, value] of Object.entries(props)) {
        if (key === "className") {
          result.className = [result.className, value].filter(Boolean).join(" ");
        } else if (isEventHandlerKey(key) && typeof value === "function") {
          const existing = result[key] as ((...args: unknown[]) => void) | undefined;
          result[key] = existing
            ? (...args: unknown[]) => {
                existing(...args);
                (value as (...args: unknown[]) => void)(...args);
              }
            : value;
        } else {
          result[key] = value;
        }
      }
    }
    return result;
  };
}
