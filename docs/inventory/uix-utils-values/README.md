# UIX value and event utilities — ticket #144

This is a bounded, source-backed inventory of the eight UIX utility families assigned to #144. It describes the current source and documented package configuration. It does not make framework parity claims or assert platform-wide completeness. Source facts were inspected at `7a06beb32487f04ccd84a765f7722ac606825c74`; the structured input and generated views account for 55 source files, 64 named public symbols, and 128 root/subpath export identities. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/uix-utils-values.json).

## Package availability and scope

`packages/uix-utils/src/index.ts:1-9` re-exports each family, and `packages/uix-utils/package.json:11-21` declares the package root plus a `./*` wildcard. `packages/uix-utils/tsup.config.ts:8-19` declares a root entry and entries for each immediate source submodule index. The generated input explicitly maps each family barrel to its root contribution and its matching subpath. This is evidence from source and build configuration; an installed or published package resolution check was not run.

This batch owns `classnames`, `object`, `mergeprops`, `eventbus`, `escape`, `uuid`, `scroll-lock`, and `zindex`. The DOM helpers used by `scroll-lock` are separately cataloged by #143. The scoped pilot validates references within one input, so it carries this cross-scope link in its pending-reference ledger rather than resolving it against another inventory. The root package also exports DOM utilities, which are outside this batch.

## Classname utilities

Source: `packages/uix-utils/src/classnames/index.ts:1-38`.

- `cn(...args: any[]): string | undefined` — recursively includes truthy strings, numbers and arrays; for objects, includes keys whose values are truthy. It joins included values with spaces and trims the result.
- `classNames(...args: any[]): string | undefined` — deprecated forwarding alias to `cn`.

Observed imports include `packages/ng-core/src/basecomponent/base-component.ts:3`, `packages/ng-core/src/bind/bind.ts:2`, `packages/ng/src/input-text/input-text.ts:13`, and `packages/uix-styled/src/stylesheet/box-model.ts:1`. React and Vue core also import the package-root alias. These are examples found in source, not a complete consumer inventory.

## Object methods

The barrel at `packages/uix-utils/src/object/index.ts:1-43` re-exports one default from each of the 43 corresponding files in `packages/uix-utils/src/object/methods/`. The independent file/export reconciliation found no extra unexported method files. Each method below includes its declared public signature and a concise description of source behavior.

- `compare<T = unknown>(value1: T, value2: T, comparator: (val1: T, val2: T) => number, order: number = 1): number` — compares values, using the comparator for strings and `order` for empty values. `packages/uix-utils/src/object/methods/compare.ts:3-20`
- `contains<T = unknown>(value: T, list: T[]): boolean` — checks for a value using `equals`. `packages/uix-utils/src/object/methods/contains.ts:3-11`
- `deepEquals(obj1: unknown, obj2: unknown): boolean` — compares nested arrays/objects, dates and regular expressions; repeated or circular references compare unequal. `packages/uix-utils/src/object/methods/deepEquals.ts:1-70`
- `deepMerge(...args: Record<string, unknown>[]): Record<string, unknown>` — recursively merges objects. `packages/uix-utils/src/object/methods/deepMerge.ts:3-32`
- `equals(obj1: any, obj2: any, field?: string): boolean` — deep comparison, or comparison of resolved field values when `field` is supplied. `packages/uix-utils/src/object/methods/equals.ts:4-6`
- `filter<T = any>(value: T[], fields: string[], filterValue: string): T[]` — keeps items whose named field includes a case-insensitive substring. `packages/uix-utils/src/object/methods/filter.ts:3-21`
- `findIndexInList<T = any>(value: T, list: T[]): number` — returns the first strictly equal item index, or `-1`. `packages/uix-utils/src/object/methods/findIndexInList.ts:1-14`
- `findLast<T = any>(arr: T[], callback: (value: T, index: number, array: T[]) => boolean): T | undefined` — returns the last callback-matching item; includes a fallback implementation. `packages/uix-utils/src/object/methods/findLast.ts:7-22`
- `findLastIndex<T = any>(arr: T[], callback: (value: T, index: number, array: T[]) => boolean): number` — returns the last callback-matching index; includes a fallback implementation. `packages/uix-utils/src/object/methods/findLastIndex.ts:7-22`
- `getKeyValue<T extends Record<string, unknown>>(obj: T | undefined, key: string = "", params: unknown = {}): unknown` — resolves a dotted key path case-insensitively after flat-case normalization and resolves functions with `params`. `packages/uix-utils/src/object/methods/getKeyValue.ts:5-28`
- `insertIntoOrderedArray<T>(item: T, index: number, arr: T[], sourceArr: any[]): void` — inserts an item according to its position in `sourceArr`. `packages/uix-utils/src/object/methods/insertIntoOrderedArray.ts:3-28`
- `isArray(value: any, empty: boolean = true): boolean` — checks for an array, optionally requiring a nonempty array. `packages/uix-utils/src/object/methods/isArray.ts:1-3`
- `isDate(value: unknown): value is Date` — Date type guard. `packages/uix-utils/src/object/methods/isDate.ts:1-3`
- `isEmpty(value: any): boolean` — true for null/undefined/empty string, empty array, or empty non-Date object. `packages/uix-utils/src/object/methods/isEmpty.ts:1-9`
- `isFunction(value: unknown): value is (...args: unknown[]) => unknown` — function type guard. `packages/uix-utils/src/object/methods/isFunction.ts:1-3`
- `isLetter(char: string): boolean` — tests Latin/basic or Latin Extended-A letters. `packages/uix-utils/src/object/methods/isLetter.ts:1-3`
- `isNotEmpty(value: any): boolean` — negates `isEmpty`. `packages/uix-utils/src/object/methods/isNotEmpty.ts:3-5`
- `isNumber(value: unknown): boolean` — tests nonempty values using `isNaN` coercion. `packages/uix-utils/src/object/methods/isNumber.ts:3-5`
- `isObject(value: unknown, empty: boolean = true): value is object` — plain-object type guard, optionally requiring a nonempty object. `packages/uix-utils/src/object/methods/isObject.ts:1-7`
- `isPrintableCharacter(char: string = ""): boolean` — checks nonempty, single-character printable input, including space. `packages/uix-utils/src/object/methods/isPrintableCharacter.ts:3-5`
- `isScalar(value: any): boolean` — accepts non-null string, number, bigint or boolean. `packages/uix-utils/src/object/methods/isScalar.ts:1-9`
- `isString(value: unknown, empty: boolean = true): value is string` — string type guard, optionally rejecting the empty string. `packages/uix-utils/src/object/methods/isString.ts:1-3`
- `localeComparator(): (val1: string, val2: string) => number` — creates a numeric-aware `Intl.Collator` comparator. `packages/uix-utils/src/object/methods/localeComparator.ts:1-4`
- `matchRegex(str: string, regex?: RegExp): boolean` — tests the optional expression, resets its `lastIndex`, and returns false when no expression is given. `packages/uix-utils/src/object/methods/matchRegex.ts:1-11`
- `mergeKeys(...args: Record<string, unknown>[]): Record<string, unknown>` — deprecated alias delegating to `deepMerge`. `packages/uix-utils/src/object/methods/mergeKeys.ts:3-12`
- `minifyCSS(css?: string): string | undefined` — strips CSS comments and whitespace patterns; preserves undefined/falsy input. `packages/uix-utils/src/object/methods/minifyCSS.ts:1-12`
- `nestedKeys(obj: Record<string, any> = {}, parentKey: string = ""): string[]` — lists leaf paths using dot-separated object keys. `packages/uix-utils/src/object/methods/nestedKeys.ts:3-14`
- `omit(obj: unknown, ...keys: string[]): unknown` — shallow-copies plain objects without listed keys; returns non-plain-object input as-is. `packages/uix-utils/src/object/methods/omit.ts:3-11`
- `removeAccents(str: string): string` — replaces listed Latin accented characters with mapped ASCII letter sequences. `packages/uix-utils/src/object/methods/removeAccents.ts:1-60`
- `reorderArray<T>(value: T[], from: number, to: number): void` — moves an array element in place. `packages/uix-utils/src/object/methods/reorderArray.ts:1-10`
- `resolve<T, P extends unknown[], R>(obj: T | ((...params: P) => R), ...params: P): T | R` — invokes function inputs with params; otherwise returns the input. `packages/uix-utils/src/object/methods/resolve.ts:3-8`
- `resolveFieldData(data: any, field: any): any` — resolves direct, function or dotted nested field data; returns null for a missing/invalid path. `packages/uix-utils/src/object/methods/resolveFieldData.ts:4-41`
- `shallowEqualProps(propsA: Record<string, unknown>, propsB: Record<string, unknown>): boolean` — shallow prop comparison; source skips comparing a pair when both values are functions. `packages/uix-utils/src/object/methods/shallowEqualProps.ts:5-31`
- `shallowEquals(objA: unknown, objB: unknown): boolean` — shallow value/object/array comparison including first-level own properties. `packages/uix-utils/src/object/methods/shallowEquals.ts:18-81`
- `sort<T>(value1: T, value2: T, order: number = 1, comparator: (val1: T, val2: T) => number, nullSortOrder: number = 1): number` — compares values with direction and configurable empty-value ordering. `packages/uix-utils/src/object/methods/sort.ts:4-20`
- `stringify(value: unknown, indent: number = 2, currentIndent: number = 0): string` — serializes arrays, dates, functions and objects with custom indentation; JSON-stringifies other values. `packages/uix-utils/src/object/methods/stringify.ts:6-38`
- `toCamelCase(str: string): string` — converts hyphen/underscore-delimited words to camel case. `packages/uix-utils/src/object/methods/toCamelCase.ts:3-6`
- `toCapitalCase(str: string): string` — uppercases the first character of a nonempty string. `packages/uix-utils/src/object/methods/toCapitalCase.ts:3-5`
- `toFlatCase(str: string): string` — removes hyphens/underscores and lowercases. `packages/uix-utils/src/object/methods/toFlatCase.ts:3-6`
- `toKebabCase(str: string): string` — converts underscores and lower-to-upper boundaries to lowercase hyphenated form. `packages/uix-utils/src/object/methods/toKebabCase.ts:3-11`
- `toMs(value: string | number): number` — returns numeric input unchanged, `auto` as zero, otherwise parses the numeric portion and multiplies by 1000. `packages/uix-utils/src/object/methods/toMs.ts:1-7`
- `toTokenKey(str: string): string` — inserts dots before noninitial uppercase letters and lowercases. `packages/uix-utils/src/object/methods/toTokenKey.ts:3-7`
- `toValue(value: unknown): unknown` — unwraps an object `current` or `value` property, otherwise resolves the direct or function value. `packages/uix-utils/src/object/methods/toValue.ts:3-23`

Observed object consumers include `packages/ng-core/src/bind/bind.ts:3`, `packages/ng-core/src/model-holder/model-holder.ts:2`, `packages/uix-data/src/identity/index.ts:1`, and `packages/uix-styled/src/helpers/dt.ts:1`. Angular, React, Vue and shared packages also import object helpers. These examples do not claim exhaustive consumer coverage.

## Prop merging

Source: `packages/uix-utils/src/mergeprops/index.ts:1-39`.

- `mergeProps(...props: any[]): object | undefined` — shallow, left-to-right prop merge. `style` is shallow-merged; `class` and `className` use `cn`; function-valued properties chain the earlier function before the later one.
- `mergeDefaultProps(...props: any[]): object | undefined` — same composition but skips a later `undefined` value.

The implementation imports `cn` from `classnames` and `isFunction` from `object`. A repository source scan under `packages/` found no production imports; `packages/uix-utils/test/mergeprops.test.ts:2-5` is the observed consumer. This records observed usage only; absence from that scan is not a product defect or a completeness claim.

## Event bus

Source: `packages/uix-utils/src/eventbus/index.ts:1-46`.

- `Handler = (evt: unknown) => void`
- `EventBusOptions.on(type: string, handler: Handler): void`
- `EventBusOptions.off(type: string, handler: Handler): void`
- `EventBusOptions.emit(type: string, evt?: unknown): void`
- `EventBusOptions.clear(): void`
- `EventBus(): EventBusOptions`

Each instance stores listeners in its own `Map<string, Handler[]>`; `emit` invokes the current listeners synchronously. Runtime `on`/`off` return `this`, while their declared interface return is `void`. Consumers observed include `packages/uix-styled/src/service/index.ts:1`, `packages/vue-core/src/service/toast-service.ts:1`, and `packages/react-core/src/confirmation/confirmation-event-bus.ts:2`.

## Escape and display-order registries

Source: `packages/uix-utils/src/escape/index.ts:1-5` and the implementation files under `packages/uix-utils/src/escape/`.

- `ESCAPE_PRIORITIES` is the frozen-as-const object: `SIDEBAR: 100`, `DIALOG: 300`, `IMAGE: 400`, `MENU: 500`, `OVERLAY_PANEL: 600`, `TOOLTIP: 1200` (`packages/uix-utils/src/escape/priorities.ts:22-29`).
- `EscapeListener = (event: KeyboardEvent) => void`
- `EscapeRegistry.register(primary: number, secondary: number, callback: EscapeListener): void`
- `EscapeRegistry.unregister(primary: number, secondary: number): void`
- `createEscapeRegistry(): EscapeRegistry`; `escapeRegistry: EscapeRegistry`
- `DisplayOrderRegistry.register(group: string, id: number): number`
- `DisplayOrderRegistry.unregister(group: string, id: number): void`
- `createDisplayOrderRegistry(): DisplayOrderRegistry`; `displayOrderRegistry: DisplayOrderRegistry`

The escape registry invokes only the handler at the greatest primary priority and then greatest secondary priority. It checks `typeof document` and attaches a keydown listener only while handlers exist. Display order stores arrays of numeric IDs per group. React/Vue core and Angular overlay consumers were observed, including `packages/react-core/src/escape/use-global-escape-key.ts:2`, `packages/vue-core/src/escape/use-display-order.ts:2`, and `packages/ng/src/dialog/dialog.ts:30`. Safe module initialization does not establish blanket SSR safety for invocation paths.

## UUID

Source: `packages/uix-utils/src/uuid/index.ts:1-11`.

- `uuid(prefix: string = "pui_id_"): string` increments a module-local counter per prefix. It is deterministic, not random or cryptographic, and has no direct DOM dependency.

Observed consumers include `packages/ng/src/fieldset/fieldset.ts:12`, `packages/ng/src/panel/panel.ts:12`, and `packages/vue/src/tooltip/tooltip.ts:2`.

## Scroll-lock registry

Source: `packages/uix-utils/src/scroll-lock/index.ts:1-2` and `packages/uix-utils/src/scroll-lock/registry.ts:1-34`.

- `ScrollLockRegistry.register(id: string): void`
- `ScrollLockRegistry.unregister(id: string): void`
- `createScrollLockRegistry(): ScrollLockRegistry`
- `scrollLockRegistry: ScrollLockRegistry`

Each factory instance owns a `Set<string>`. The first ID blocks body scrolling with `{ className: "u-overflow-hidden", variableName: "--u-scrollbar-width" }`; removing the last existing ID unblocks it. The singleton is module-scoped. It imports `blockBodyScroll` and `unblockBodyScroll` from the #143 DOM family, so first registration requires browser body access; no blanket SSR guard is present. Observed consumers include `packages/ng/src/dialog/dialog.ts:31`, `packages/ng/src/block-ui/block-ui.ts:14`, and `packages/react-core/src/scroll-lock/use-scroll-lock.ts:2`.

## Z-index manager

Source: `packages/uix-utils/src/zindex/index.ts:1-58`.

- `ZIndexOptions.get(element?: HTMLElement): number`
- `ZIndexOptions.set(key: string, element: HTMLElement, baseZIndex?: number): void`
- `ZIndexOptions.clear(element: HTMLElement): void`
- `ZIndexOptions.getCurrent(key: string): number`
- `ZIndex: ZIndexOptions`

The singleton keeps a module-local stack, uses default base index `999`, and reads/writes `HTMLElement.style.zIndex`. The declared interface requires `element` for `set` and `clear`, while the implementation accepts it as optional and does nothing when omitted. This current type/runtime discrepancy is documented without repair. Consumers observed include `packages/ng-core/src/overlay/overlay.ts:12`, `packages/ng/src/confirm-popup/confirm-popup.ts:22`, and `packages/vue-core/src/zindex/use-z-index.ts:1`. Its HTMLElement access means SSR safety is not inferred from the package being framework-neutral.

## Relationships and runtime boundary

`mergeprops` composes class names using `classnames` and detects callbacks with `object.isFunction`. `scroll-lock` delegates to the DOM body-scroll helpers owned by #143. Escape and display-order registries are used by multiple framework packages; this inventory records representative source imports without asserting one-to-one framework parity. `classnames`, the object methods, `mergeprops`, `eventbus`, `uuid`, and display-order registry implementations have no direct DOM access in the inspected code. Escape module initialization is safe, but listener registration uses `document` behind a guard. Scroll-lock invokes body helpers; z-index reads and writes `HTMLElement.style`. No package-wide SSR guarantee is claimed.

Comments in the source mention prior project phases or historical extraction context. They are retained as source comments only; this inventory makes no Prime parity, equivalence, or behavior judgment.

## Verification and CI

- Structured input: `scripts/inventory/uix-utils-values.json`; generated index, eight generated records, and scoped validation are under this directory. Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/uix-utils-values.json --out docs/inventory/uix-utils-values`.
- The scoped pilot validates files, named exports, package root and wildcard-subpath mappings, source evidence, ownership and in-scope references. The #143 DOM dependency is documented in a pending cross-scope reference because the pilot resolves references within one input only. It does not claim global coverage or test built Node/package resolution.
- Product runtime tests were not run, per the documentation-only scope. No product code was changed.
- The repository docs-only CI path runs lint and format checks; its conditions skip build, typecheck, and product tests for docs-only changes. No remote CI result is claimed here.
- Lint, typecheck, formatting, repository validation, and product-test scope are captured in [quality evidence](quality-run.json); scoped regeneration evidence is in [pilot run evidence](pilot-run.json).
