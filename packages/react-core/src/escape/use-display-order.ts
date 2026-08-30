import { useEffect, useState } from "react";

let uidCounter = 0;
const groupToDisplayedElements: Record<string, (number | undefined)[]> = {};

export function useDisplayOrder(group: string, isVisible = true): number | undefined {
  const [uid] = useState(() => ++uidCounter);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) return;

    if (!groupToDisplayedElements[group]) groupToDisplayedElements[group] = [];
    const newOrder = groupToDisplayedElements[group].push(uid);
    setDisplayOrder(newOrder);

    return () => {
      delete groupToDisplayedElements[group][newOrder - 1];
      const list = groupToDisplayedElements[group];
      let lastIndex = list.length - 1;
      while (lastIndex >= 0 && list[lastIndex] === undefined) lastIndex--;
      list.length = lastIndex + 1;
      setDisplayOrder(undefined);
    };
  }, [group, uid, isVisible]);

  return displayOrder;
}
