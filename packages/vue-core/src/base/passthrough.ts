import { defineComponent, mergeProps as mergeVueProps } from "vue";
import {
  getKeyValue,
  isArray,
  isFunction,
  isNotEmpty,
  isString,
  toFlatCase,
} from "@ultimate/uix-utils/object";

export type PassThroughAttributes = Record<string, unknown>;

/**
 * The `pt` prop: section name to attributes, a class string or array, or a
 * function of the params. Section names match without regard to case, dashes
 * or underscores, and `a.b` reaches nested sections. `pt:section:attribute`
 * attributes on the component add to it.
 */
export type PassThrough<Sections = Record<string, unknown>> = Sections;

export interface PassThroughOptions {
  /** Merge the global section value with the instance value (default `true`). */
  mergeSections?: boolean;
  /** `true` merges with Vue's `mergeProps` (classes normalized, styles merged, handlers chained); a function replaces the merger. */
  mergeProps?:
    | boolean
    | ((...attributes: (PassThroughAttributes | undefined)[]) => PassThroughAttributes | undefined);
}

export interface PassThroughContext {
  /** Component name, flat-cased into the root `data-pc-name`. */
  name: string;
  options?: PassThroughOptions;
  /** Section value already resolved from a global source, merged under the instance value. */
  global?: PassThroughAttributes;
  /** The `pt:section:attribute` attributes of the instance, as a nested object. */
  attrsPt?: Record<string, unknown>;
}

const DATASET_PREFIX = "data-pc-";

function getPassThroughClassValue(
  options: unknown,
  key: string,
  params: Record<string, unknown>
): PassThroughAttributes | undefined {
  const value = getKeyValue(options as Record<string, unknown> | undefined, key, params);

  return (isString(value) || isArray(value) ? { class: value } : value) as
    PassThroughAttributes | undefined;
}

function getPassThroughDatasets(key: string, pt: unknown, name: string): PassThroughAttributes {
  if (key === "transition") return {};

  const section = (pt as PassThroughAttributes | undefined)?.["data-pc-section"];
  const isExtended = key === "root" && isNotEmpty(section);

  return {
    ...(key === "root" && {
      [`${DATASET_PREFIX}name`]: toFlatCase(isExtended ? (section as string) : name),
      ...(isExtended && { [`${DATASET_PREFIX}extend`]: toFlatCase(name) }),
    }),
    [`${DATASET_PREFIX}section`]: toFlatCase(key),
  };
}

function mergeAttributes(
  merger: NonNullable<PassThroughOptions["mergeProps"]>,
  ...attributes: (PassThroughAttributes | undefined)[]
): PassThroughAttributes | undefined {
  return isFunction(merger)
    ? (merger as (...args: unknown[]) => PassThroughAttributes | undefined)(...attributes)
    : (mergeVueProps(...(attributes as Record<string, unknown>[])) as PassThroughAttributes);
}

/**
 * Resolves the attributes for one passthrough section. Mirrors PrimeVue 4.5.5
 * `BaseComponent._getPTValue`, minus the global and default `pt` sources and
 * the `_usept` wrapper, which depend on the config surface ADR-056 leaves out.
 * `context.global` stands in for the global source.
 */
export function getPassThroughValue(
  pt: unknown,
  key: string,
  params: Record<string, unknown>,
  context: PassThroughContext
): PassThroughAttributes {
  const searchOut = key.length > 0 && !!params[key.split(".")[0]];
  const { mergeSections = true, mergeProps: useMergeProps = false } = context.options ?? {};
  const global = context.global;
  const selfParams = { ...params, global: global ?? {} };
  const self = searchOut
    ? undefined
    : (mergeVueProps(
        (getPassThroughClassValue(pt, key, selfParams) ?? {}) as Record<string, unknown>,
        (getPassThroughClassValue(context.attrsPt, key, selfParams) ?? {}) as Record<
          string,
          unknown
        >
      ) as PassThroughAttributes);
  const datasets = getPassThroughDatasets(key, pt, context.name);

  if (!mergeSections && !self) return datasets;

  return useMergeProps
    ? (mergeAttributes(useMergeProps, global, self, datasets) as PassThroughAttributes)
    : { ...global, ...self, ...datasets };
}

function getAttrsPassThrough(attrs: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(attrs)
    .filter(([key]) => key.startsWith("pt:"))
    .reduce<Record<string, unknown>>((result, [key, value]) => {
      const [, ...rest] = key.split(":");

      rest.reduce<Record<string, unknown>>((current, nestedKey, index, all) => {
        if (!current[nestedKey]) current[nestedKey] = index === all.length - 1 ? value : {};

        return current[nestedKey] as Record<string, unknown>;
      }, result);

      return result;
    }, {});
}

function getAttrsWithoutPassThrough(attrs: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(attrs).filter(([key]) => !key.startsWith("pt:")));
}

interface PassThroughInstance {
  pt?: unknown;
  ptOptions?: PassThroughOptions;
  $props: Record<string, unknown>;
  $data: Record<string, unknown>;
  $attrs: Record<string, unknown>;
  $parent?: PassThroughInstance | null;
  $parentInstance?: PassThroughInstance;
  _ptName: () => string;
  _ptHostName: () => string | undefined;
}

function getHostInstance(
  self: PassThroughInstance,
  instance: PassThroughInstance | undefined
): PassThroughInstance | undefined {
  if (!instance) return undefined;

  const hostName = self._ptHostName();

  if (!hostName) return instance.$parentInstance;

  return instance._ptName?.() === hostName
    ? instance
    : getHostInstance(self, instance.$parentInstance);
}

function getParams(self: PassThroughInstance) {
  const parentInstance = getHostInstance(self, self) ?? self.$parent ?? undefined;

  return {
    instance: self,
    props: self.$props,
    state: self.$data,
    attrs: self.$attrs,
    parent: {
      instance: parentInstance,
      props: parentInstance?.$props,
      state: parentInstance?.$data,
      attrs: parentInstance?.$attrs,
    },
  };
}

function getContext(self: PassThroughInstance, name: string): PassThroughContext {
  const host = getHostInstance(self, self);

  return {
    name,
    options: self.ptOptions || host?.ptOptions,
    attrsPt: getAttrsPassThrough(self.$attrs),
  };
}

/**
 * Options-API mixin that gives a component `pt` and `ptOptions` props and
 * `ptm`, `ptmi` and `ptmo`. `hostName` names the ancestor whose instance
 * becomes `parent.instance` for a sub-component. Every instance provides itself
 * as `$parentInstance` to its descendants.
 */
export function createPassThroughMixin(componentName: string, hostName?: string) {
  return defineComponent({
    props: {
      pt: { type: Object, default: undefined },
      ptOptions: { type: Object, default: undefined },
    },
    inject: {
      $parentInstance: { default: undefined },
    },
    provide() {
      return { $parentInstance: this };
    },
    methods: {
      _ptName(): string {
        return componentName;
      },
      _ptHostName(): string | undefined {
        return hostName;
      },
      ptm(key = "", params: Record<string, unknown> = {}): PassThroughAttributes {
        const self = this as unknown as PassThroughInstance;

        return getPassThroughValue(
          this.pt,
          key,
          { ...getParams(self), ...params },
          getContext(self, componentName)
        );
      },
      ptmi(key = "", params: Record<string, unknown> = {}): PassThroughAttributes {
        return mergeVueProps(
          getAttrsWithoutPassThrough(this.$attrs),
          this.ptm(key, params)
        ) as PassThroughAttributes;
      },
      ptmo(
        obj: unknown = {},
        key = "",
        params: Record<string, unknown> = {}
      ): PassThroughAttributes {
        const self = this as unknown as PassThroughInstance;

        return getPassThroughValue(
          obj,
          key,
          { instance: this, ...params },
          { ...getContext(self, componentName), attrsPt: undefined }
        );
      },
    },
  });
}
