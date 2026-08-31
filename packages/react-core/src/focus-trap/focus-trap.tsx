import * as React from "react";
import { getFirstFocusableElement, getLastFocusableElement } from "@ultimate/uix-utils";
import { useMountEffect } from "../hooks";

export interface FocusTrapProps {
  children: React.ReactNode;
  autoFocus?: boolean;
  disabled?: boolean;
  autoFocusSelector?: string;
  firstFocusableSelector?: string;
}

export function FocusTrap({
  children,
  autoFocus = false,
  disabled = false,
  autoFocusSelector = "",
  firstFocusableSelector = "",
}: FocusTrapProps): React.ReactElement {
  const firstRef = React.useRef<HTMLSpanElement>(null);
  const lastRef = React.useRef<HTMLSpanElement>(null);
  const targetRef = React.useRef<Element | null>(null);

  const computedSelector = (selector: string) =>
    `:not(.u-hidden-focusable):not([data-u-hidden-focusable="true"])${selector}`;

  const setAutoFocus = (target: Element) => {
    const autoFocusEl =
      getFirstFocusableElement(target, `[autofocus]${computedSelector(autoFocusSelector)}`) ??
      getFirstFocusableElement(
        target,
        `[data-u-autofocus='true']${computedSelector(autoFocusSelector)}`
      );
    let focusable: Element | null = autoFocusEl;
    if (autoFocus && !focusable) {
      focusable = getFirstFocusableElement(target, computedSelector(firstFocusableSelector));
    }
    (focusable as HTMLElement | null)?.focus?.();
  };

  useMountEffect(() => {
    if (disabled) return;
    targetRef.current = firstRef.current?.parentElement ?? null;
    if (targetRef.current) setAutoFocus(targetRef.current);
  });

  const onFirstHiddenFocus = () => {
    const target = firstRef.current?.parentElement;
    if (!target) return;
    const focusable = getLastFocusableElement(target, computedSelector(firstFocusableSelector));
    (focusable as HTMLElement | null)?.focus?.();
  };

  const onLastHiddenFocus = () => {
    const target = lastRef.current?.parentElement;
    if (!target) return;
    const focusable = getFirstFocusableElement(target, computedSelector(firstFocusableSelector));
    (focusable as HTMLElement | null)?.focus?.();
  };

  return (
    <>
      <span
        ref={firstRef}
        className="u-hidden-accessible u-hidden-focusable"
        tabIndex={0}
        role="presentation"
        aria-hidden
        data-u-hidden-focusable="true"
        onFocus={onFirstHiddenFocus}
      />
      {children}
      <span
        ref={lastRef}
        className="u-hidden-accessible u-hidden-focusable"
        tabIndex={0}
        role="presentation"
        aria-hidden
        data-u-hidden-focusable="true"
        onFocus={onLastHiddenFocus}
      />
    </>
  );
}
