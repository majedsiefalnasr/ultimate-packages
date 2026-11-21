import { mergeProps } from "@ultimate/uix-utils/mergeprops";
import {
  getKeyValue,
  isArray,
  isFunction,
  isNotEmpty,
  isString,
  toFlatCase,
} from "@ultimate/uix-utils/object";

export type PassThroughAttributes = Record<string, unknown>;

export interface PassThroughParams {
  instance?: unknown;
  parent?: { instance?: unknown };
  [key: string]: unknown;
}

/**
 * The passthrough object a component accepts: section name to attributes, a
 * class string or array, or a function of the params. Section names match
 * without regard to case, dashes or underscores, and `a.b` reaches nested
 * sections.
 */
export type PassThrough<Sections = Record<string, unknown>> =
  Sections | ((params: PassThroughParams) => Sections);

export interface PassThroughOptions {
  /** Merge the global section value with the instance value (default `true`). */
  mergeSections?: boolean;
  /** `true` merges with `mergeProps` (classes joined, styles merged, handlers chained); a function replaces the merger. */
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
}

const DATASET_PREFIX = "data-pc-";

function getPassThroughClassValue(
  options: unknown,
  key: string,
  params: PassThroughParams
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
    [`${DATASET_PREFIX}section`]: toFlatCase(
      key.includes(".") ? (key.split(".").at(-1) ?? "") : key
    ),
  };
}

function mergeAttributes(
  merger: NonNullable<PassThroughOptions["mergeProps"]>,
  ...attributes: (PassThroughAttributes | undefined)[]
): PassThroughAttributes | undefined {
  return isFunction(merger)
    ? (merger as (...args: unknown[]) => PassThroughAttributes | undefined)(...attributes)
    : (mergeProps(...attributes) as PassThroughAttributes | undefined);
}

/**
 * Resolves the attributes for one passthrough section. Mirrors PrimeNG
 * 21.1.9 `BaseComponent._getPTValue`, minus the global and default `pt`
 * sources and the `_usept` wrapper, which depend on the config surface
 * ADR-056 leaves out. `context.global` stands in for the global source.
 */
export function getPassThroughValue(
  pt: unknown,
  key: string,
  params: PassThroughParams,
  context: PassThroughContext
): PassThroughAttributes {
  const searchOut = key.length > 0 && !!params[key.split(".")[0]];
  const { mergeSections = true, mergeProps: useMergeProps = false } = context.options ?? {};
  const global = context.global;
  const self = searchOut
    ? undefined
    : getPassThroughClassValue(pt, key, { ...params, global: global ?? {} });
  const datasets = getPassThroughDatasets(key, pt, context.name);

  if (!mergeSections && !self) return datasets;

  return useMergeProps
    ? (mergeAttributes(useMergeProps, global, self, datasets) as PassThroughAttributes)
    : { ...global, ...self, ...datasets };
}
