import { classNames } from "@ultimate/uix-utils";

export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface ComponentBaseOptions {
  componentName: string;
  styleModule: StyleModule;
}

function resolveClassValue(
  resolver: ((params?: Record<string, unknown>) => ClassValue) | string | undefined,
  params?: Record<string, unknown>
): string | undefined {
  if (resolver === undefined) return undefined;
  const value = typeof resolver === "function" ? resolver(params) : resolver;
  return Array.isArray(value) ? classNames(...value) : classNames(value);
}

// `componentName` is retained on the options contract for forward compatibility with
// Tasks 13-17 (style registration via useComponentStyle); not yet consumed by this
// task's cx()-only resolver.
export function useComponentBase(options: ComponentBaseOptions): {
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
} {
  const { styleModule } = options;

  const cx = (key: string, params?: Record<string, unknown>) =>
    resolveClassValue(styleModule.classes[key], params);

  return { cx };
}
