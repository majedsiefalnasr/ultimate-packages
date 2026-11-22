import { classNames } from "@ultimate/uix-utils";
import { useComponentStyle } from "../styling/use-component-style";

export type ClassValue =
  string | Record<string, boolean | undefined> | (string | Record<string, boolean | undefined>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface ComponentBaseOptions {
  componentName: string;
  styleModule: StyleModule;
  /** Renders the instance without Ultimate's classes and styles (F15). */
  unstyled?: boolean;
}

function resolveClassValue(
  resolver: ((params?: Record<string, unknown>) => ClassValue) | string | undefined,
  params?: Record<string, unknown>
): string | undefined {
  if (resolver === undefined) return undefined;
  const value = typeof resolver === "function" ? resolver(params) : resolver;
  return Array.isArray(value) ? classNames(...value) : classNames(value);
}

export function useComponentBase({ componentName, styleModule, unstyled }: ComponentBaseOptions): {
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  isUnstyled: boolean;
} {
  const isUnstyled = unstyled === true;
  useComponentStyle(componentName, styleModule, isUnstyled);

  const cx = (key: string, params?: Record<string, unknown>) =>
    isUnstyled ? undefined : resolveClassValue(styleModule.classes[key], params);

  return { cx, isUnstyled };
}
