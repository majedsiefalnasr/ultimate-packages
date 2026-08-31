import { classNames } from "@ultimate/uix-utils";
import type { ComponentOptions } from "vue";

export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface BaseComponentOptions {
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

// An Options-API mixin object factory — NOT a class, NOT a composable/hook.
// Each Ultimate component's own Base*.ts file calls this once and `extends:`
// the result, matching verified BaseComponent.vue's own extends: mechanism
// exactly (spec §7) — informed by, not copied from, PrimeVue's real source.
export function createBaseComponent(options: BaseComponentOptions): ComponentOptions {
  const { componentName, styleModule } = options;

  return {
    methods: {
      cx(key: string, params?: Record<string, unknown>) {
        return resolveClassValue(styleModule.classes[key], params);
      },
    },
    mounted() {
      // Style registration wiring lands in Task 14 (styling) — this task's
      // scope is cx() resolution only, matching react-core's Task 3
      // precedent where useComponentBase and useComponentStyle were also
      // split across two tasks.
    },
  };
}
