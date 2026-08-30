import * as React from "react";
import { createPortal } from "react-dom";
import { useMountEffect } from "../hooks";

export interface PortalProps {
  element: React.ReactNode;
  appendTo?: HTMLElement | "self" | (() => HTMLElement) | undefined;
  visible?: boolean;
}

function isClient(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function Portal({ element, appendTo, visible = false }: PortalProps): React.ReactNode {
  const [mounted, setMounted] = React.useState(false);

  useMountEffect(() => {
    if (isClient()) setMounted(true);
  });

  if (!visible || !mounted) return null;

  let target = appendTo;
  if (typeof target === "function") target = target();
  if (!target) target = document.body;

  return target === "self" ? element : createPortal(element, target);
}
