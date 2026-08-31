export interface DisplayOrderRegistry {
  register(group: string, id: number): number;
  unregister(group: string, id: number): void;
}

// Extracted from react-core/src/escape/use-display-order.ts's
// groupToDisplayedElements registry during Phase 4's prerequisite work (spec
// §11) — framework-neutral by construction. The React/Vue-specific reactive
// wrapper (useState vs ref()) stays in each *-core package, NOT here.
export function createDisplayOrderRegistry(): DisplayOrderRegistry {
  const groupToIds: Record<string, (number | undefined)[]> = {};

  return {
    register(group, id) {
      if (!groupToIds[group]) groupToIds[group] = [];
      return groupToIds[group].push(id);
    },
    unregister(group, id) {
      const list = groupToIds[group];
      if (!list) return;
      const index = list.indexOf(id);
      if (index === -1) return;
      delete list[index];
      let lastIndex = list.length - 1;
      while (lastIndex >= 0 && list[lastIndex] === undefined) lastIndex--;
      list.length = lastIndex + 1;
    },
  };
}

export const displayOrderRegistry: DisplayOrderRegistry = createDisplayOrderRegistry();
