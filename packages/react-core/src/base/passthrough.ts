import { classNames } from "@ultimate/uix-utils";
import { mergeProps } from "@ultimate/uix-utils/mergeprops";
import {
  getKeyValue,
  isArray,
  isFunction,
  isNotEmpty,
  isObject,
  isString,
  toFlatCase,
} from "@ultimate/uix-utils/object";

export type PassThroughAttributes = Record<string, unknown>;

export interface PassThroughMetadata {
  props?: { pt?: unknown; ptOptions?: PassThroughOptions };
  state?: unknown;
  /** Host component name; flat-cased into the root `data-pc-name`. */
  hostName?: string;
  /** Metadata of the component that renders this one, passed on to `pt` functions. */
  parent?: PassThroughMetadata;
  [key: string]: unknown;
}

/**
 * The `pt` prop: section name to attributes, a `className` string or array, or
 * a function of the params. Section names match without regard to case,
 * dashes or underscores, and `a.b` reaches nested sections.
 */
export type PassThrough<Sections = Record<string, unknown>> = Sections;

export interface PassThroughOptions {
  /** Merge the global section value with the instance value (default `true`). */
  mergeSections?: boolean;
  /** `true` merges with `mergeProps` (classNames joined, styles merged, handlers chained); a function replaces the merger. */
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
  params: Record<string, unknown>
): PassThroughAttributes | undefined {
  const value = getKeyValue(options as Record<string, unknown> | undefined, key, params);

  if (isArray(value)) return { className: classNames(...(value as unknown[])) };
  if (isString(value)) return { className: value };
  if (isObject(value) && isArray((value as PassThroughAttributes)["className"])) {
    return {
      className: classNames(...((value as PassThroughAttributes)["className"] as unknown[])),
    };
  }

  return value as PassThroughAttributes | undefined;
}

/**
 * Resolves the attributes for one passthrough section. Mirrors PrimeReact
 * 10.9.9 `ComponentBase.extend().getPTValue`, minus the provider and global
 * `pt` sources, which depend on the config surface ADR-056 leaves out.
 * `context.global` stands in for the global source.
 */
export function getPassThroughValue(
  pt: unknown,
  key: string,
  params: Record<string, unknown>,
  context: PassThroughContext
): PassThroughAttributes {
  const source =
    isObject(pt) &&
    Object.prototype.hasOwnProperty.call(pt, "pt") &&
    (pt as { pt?: unknown }).pt !== undefined
      ? (pt as { pt: unknown }).pt
      : pt;
  const isNestedParam = key.length > 0 && !!params[key.split(".")[0]];
  const fkey = isNestedParam ? toFlatCase(key.split(".")[1]) : toFlatCase(key);
  const hostName = isNotEmpty(params["hostName"])
    ? toFlatCase(params["hostName"] as string)
    : undefined;
  const name = hostName ?? toFlatCase(context.name);
  const { mergeSections = true, mergeProps: useMergeProps = false } = context.options ?? {};
  const global = context.global;
  const self = isNestedParam ? undefined : getPassThroughClassValue(source, key, params);
  const datasets: PassThroughAttributes =
    fkey === "transition"
      ? {}
      : {
          ...(fkey === "root" && { [`${DATASET_PREFIX}name`]: name }),
          [`${DATASET_PREFIX}section`]: fkey,
        };

  if (!mergeSections && !self) return datasets;

  if (useMergeProps) {
    return (
      isFunction(useMergeProps)
        ? (useMergeProps as (...args: unknown[]) => PassThroughAttributes | undefined)(
            global,
            self,
            datasets
          )
        : mergeProps(global, self, datasets)
    ) as PassThroughAttributes;
  }

  return { ...global, ...self, ...datasets };
}

/**
 * Builds `ptm` and `ptmo` for one component render. `ptm(key, params)` reads
 * `metadata.props.pt`; spread its result onto the element it names, merged with
 * the component's own props through `useMergeProps`.
 */
export function createPassThrough(componentName: string, metadata: PassThroughMetadata) {
  const options = metadata.props?.ptOptions;
  const context: PassThroughContext = { name: componentName, options };

  const ptm = (key = "", params: Record<string, unknown> = {}): PassThroughAttributes =>
    getPassThroughValue(metadata.props?.pt, key, { ...metadata, ...params }, context);

  const ptmo = (
    obj: unknown = {},
    key = "",
    params: Record<string, unknown> = {}
  ): PassThroughAttributes => getPassThroughValue(obj, key, params, context);

  return { ptm, ptmo };
}
