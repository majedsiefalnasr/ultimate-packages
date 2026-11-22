import { defineComponent, type ComponentInternalInstance, type PropType } from "vue";
import { classNames, uuid } from "@ultimate/uix-utils";
import { createScopedTheme, type ScopedTheme } from "@ultimate/uix-styled";
import {
  registerBaseStyle,
  registerComponentStyle,
  vueCoreStyleSheet,
} from "../styling/vue-style-sheet";
import { createPassThroughMixin } from "./passthrough";

export type ClassValue = string | Record<string, boolean> | (string | Record<string, boolean>)[];

export interface StyleModule {
  css: string;
  classes: Record<string, ((params?: Record<string, unknown>) => ClassValue) | string>;
}

export interface BaseComponentOptions {
  componentName: string;
  styleModule: StyleModule;
  hostName?: string;
}

function resolveClassValue(
  resolver: ((params?: Record<string, unknown>) => ClassValue) | string | undefined,
  params?: Record<string, unknown>
): string | undefined {
  if (resolver === undefined) return undefined;
  const value = typeof resolver === "function" ? resolver(params) : resolver;
  return Array.isArray(value) ? classNames(...value) : classNames(value);
}

// Per-instance `dt` (F15). Each instance gets an attribute selector (`pc…`,
// like PrimeVue's `useAttrSelector`) that its scoped variables target. It
// comes from a counter, not Vue's `useId`, because `useId` restarts in every
// app and two apps on one page would then share scoped styles. The state
// lives outside the reactive instance so the scoped theme is never proxied.
interface ScopedState {
  attrSelector: string;
  theme?: ScopedTheme;
}

const scopedStates = new WeakMap<ComponentInternalInstance, ScopedState>();

interface ScopedHost {
  $: ComponentInternalInstance;
  $el: unknown;
  dt?: Record<string, unknown>;
}

function applyScopedTheme(host: ScopedHost, componentName: string): void {
  const state = scopedStates.get(host.$);
  if (!state) return;

  const root = host.$el as Partial<Element> | null | undefined;
  const hasDt = Boolean(host.dt) && Object.keys(host.dt as object).length > 0;

  if (hasDt) {
    state.theme ??= createScopedTheme(vueCoreStyleSheet, componentName, state.attrSelector);
    state.theme.update(host.dt);
    if (typeof root?.setAttribute === "function" && !root.hasAttribute?.(state.attrSelector)) {
      root.setAttribute(state.attrSelector, "");
    }
  } else {
    state.theme?.update(undefined);
    if (typeof root?.removeAttribute === "function") root.removeAttribute(state.attrSelector);
  }
}

// An Options-API mixin object factory — NOT a class, NOT a composable/hook.
// Each Ultimate component's own Base*.ts file calls this once and `extends:`
// the result, matching verified BaseComponent.vue's own extends: mechanism
// exactly (spec §7) — informed by, not copied from, PrimeVue's real source.
export function createBaseComponent(options: BaseComponentOptions) {
  const { componentName, styleModule, hostName } = options;

  return defineComponent({
    mixins: [createPassThroughMixin(componentName, hostName)],
    props: {
      // `default: undefined` keeps an absent prop `undefined` instead of
      // Vue's Boolean cast to `false`, like PrimeVue's BaseComponent.
      unstyled: { type: Boolean, default: undefined },
      dt: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    },
    beforeCreate() {
      scopedStates.set(this.$, {
        attrSelector: uuid("pc"),
      });
    },
    computed: {
      isUnstyled(): boolean {
        return this.unstyled === true;
      },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>) {
        return this.isUnstyled ? undefined : resolveClassValue(styleModule.classes[key], params);
      },
    },
    watch: {
      isUnstyled(unstyled: boolean) {
        if (!unstyled) registerComponentStyle(componentName, styleModule);
      },
      dt() {
        applyScopedTheme(this, componentName);
      },
    },
    mounted() {
      if (this.isUnstyled) registerBaseStyle();
      else registerComponentStyle(componentName, styleModule);
      applyScopedTheme(this, componentName);
    },
    updated() {
      applyScopedTheme(this, componentName);
    },
    beforeUnmount() {
      scopedStates.get(this.$)?.theme?.dispose();
    },
  });
}
