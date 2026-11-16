# UIX object utilities

ID: uixutils.object

Framework: shared; availability: public

## Authored interpretation

Provide comparison, inspection, field resolution, object merge/filter and string conversion helpers.

## Framework surface

See [authored signatures and interpretation](README.md). The object barrel exports 43 named utilities; each signature, source file, and source-supported behavior is listed in the authored README. The barrel maps to package root exports and the ./object wildcard subpath. These utilities have no direct browser or DOM dependency in the inspected implementations. The exact methods are owned individually in this record's export list.

## Public exports

@ultimate/uix-utils#compare
@ultimate/uix-utils#contains
@ultimate/uix-utils#deepEquals
@ultimate/uix-utils#deepMerge
@ultimate/uix-utils#equals
@ultimate/uix-utils#filter
@ultimate/uix-utils#findIndexInList
@ultimate/uix-utils#findLast
@ultimate/uix-utils#findLastIndex
@ultimate/uix-utils#getKeyValue
@ultimate/uix-utils#insertIntoOrderedArray
@ultimate/uix-utils#isArray
@ultimate/uix-utils#isDate
@ultimate/uix-utils#isEmpty
@ultimate/uix-utils#isFunction
@ultimate/uix-utils#isLetter
@ultimate/uix-utils#isNotEmpty
@ultimate/uix-utils#isNumber
@ultimate/uix-utils#isObject
@ultimate/uix-utils#isPrintableCharacter
@ultimate/uix-utils#isScalar
@ultimate/uix-utils#isString
@ultimate/uix-utils#localeComparator
@ultimate/uix-utils#matchRegex
@ultimate/uix-utils#mergeKeys
@ultimate/uix-utils#minifyCSS
@ultimate/uix-utils#nestedKeys
@ultimate/uix-utils#omit
@ultimate/uix-utils#removeAccents
@ultimate/uix-utils#reorderArray
@ultimate/uix-utils#resolve
@ultimate/uix-utils#resolveFieldData
@ultimate/uix-utils#shallowEqualProps
@ultimate/uix-utils#shallowEquals
@ultimate/uix-utils#sort
@ultimate/uix-utils#stringify
@ultimate/uix-utils#toCamelCase
@ultimate/uix-utils#toCapitalCase
@ultimate/uix-utils#toFlatCase
@ultimate/uix-utils#toKebabCase
@ultimate/uix-utils#toMs
@ultimate/uix-utils#toTokenKey
@ultimate/uix-utils#toValue
@ultimate/uix-utils/object#compare
@ultimate/uix-utils/object#contains
@ultimate/uix-utils/object#deepEquals
@ultimate/uix-utils/object#deepMerge
@ultimate/uix-utils/object#equals
@ultimate/uix-utils/object#filter
@ultimate/uix-utils/object#findIndexInList
@ultimate/uix-utils/object#findLast
@ultimate/uix-utils/object#findLastIndex
@ultimate/uix-utils/object#getKeyValue
@ultimate/uix-utils/object#insertIntoOrderedArray
@ultimate/uix-utils/object#isArray
@ultimate/uix-utils/object#isDate
@ultimate/uix-utils/object#isEmpty
@ultimate/uix-utils/object#isFunction
@ultimate/uix-utils/object#isLetter
@ultimate/uix-utils/object#isNotEmpty
@ultimate/uix-utils/object#isNumber
@ultimate/uix-utils/object#isObject
@ultimate/uix-utils/object#isPrintableCharacter
@ultimate/uix-utils/object#isScalar
@ultimate/uix-utils/object#isString
@ultimate/uix-utils/object#localeComparator
@ultimate/uix-utils/object#matchRegex
@ultimate/uix-utils/object#mergeKeys
@ultimate/uix-utils/object#minifyCSS
@ultimate/uix-utils/object#nestedKeys
@ultimate/uix-utils/object#omit
@ultimate/uix-utils/object#removeAccents
@ultimate/uix-utils/object#reorderArray
@ultimate/uix-utils/object#resolve
@ultimate/uix-utils/object#resolveFieldData
@ultimate/uix-utils/object#shallowEqualProps
@ultimate/uix-utils/object#shallowEquals
@ultimate/uix-utils/object#sort
@ultimate/uix-utils/object#stringify
@ultimate/uix-utils/object#toCamelCase
@ultimate/uix-utils/object#toCapitalCase
@ultimate/uix-utils/object#toFlatCase
@ultimate/uix-utils/object#toKebabCase
@ultimate/uix-utils/object#toMs
@ultimate/uix-utils/object#toTokenKey
@ultimate/uix-utils/object#toValue

## Owned source and evidence

packages/uix-utils/src/object/index.ts
packages/uix-utils/src/object/methods/compare.ts
packages/uix-utils/src/object/methods/contains.ts
packages/uix-utils/src/object/methods/deepEquals.ts
packages/uix-utils/src/object/methods/deepMerge.ts
packages/uix-utils/src/object/methods/equals.ts
packages/uix-utils/src/object/methods/filter.ts
packages/uix-utils/src/object/methods/findIndexInList.ts
packages/uix-utils/src/object/methods/findLast.ts
packages/uix-utils/src/object/methods/findLastIndex.ts
packages/uix-utils/src/object/methods/getKeyValue.ts
packages/uix-utils/src/object/methods/insertIntoOrderedArray.ts
packages/uix-utils/src/object/methods/isArray.ts
packages/uix-utils/src/object/methods/isDate.ts
packages/uix-utils/src/object/methods/isEmpty.ts
packages/uix-utils/src/object/methods/isFunction.ts
packages/uix-utils/src/object/methods/isLetter.ts
packages/uix-utils/src/object/methods/isNotEmpty.ts
packages/uix-utils/src/object/methods/isNumber.ts
packages/uix-utils/src/object/methods/isObject.ts
packages/uix-utils/src/object/methods/isPrintableCharacter.ts
packages/uix-utils/src/object/methods/isScalar.ts
packages/uix-utils/src/object/methods/isString.ts
packages/uix-utils/src/object/methods/localeComparator.ts
packages/uix-utils/src/object/methods/matchRegex.ts
packages/uix-utils/src/object/methods/mergeKeys.ts
packages/uix-utils/src/object/methods/minifyCSS.ts
packages/uix-utils/src/object/methods/nestedKeys.ts
packages/uix-utils/src/object/methods/omit.ts
packages/uix-utils/src/object/methods/removeAccents.ts
packages/uix-utils/src/object/methods/reorderArray.ts
packages/uix-utils/src/object/methods/resolve.ts
packages/uix-utils/src/object/methods/resolveFieldData.ts
packages/uix-utils/src/object/methods/shallowEqualProps.ts
packages/uix-utils/src/object/methods/shallowEquals.ts
packages/uix-utils/src/object/methods/sort.ts
packages/uix-utils/src/object/methods/stringify.ts
packages/uix-utils/src/object/methods/toCamelCase.ts
packages/uix-utils/src/object/methods/toCapitalCase.ts
packages/uix-utils/src/object/methods/toFlatCase.ts
packages/uix-utils/src/object/methods/toKebabCase.ts
packages/uix-utils/src/object/methods/toMs.ts
packages/uix-utils/src/object/methods/toTokenKey.ts
packages/uix-utils/src/object/methods/toValue.ts

```text
packages/uix-utils/src/object/index.ts: export { default as compare } from "./methods/compare";
packages/uix-utils/src/index.ts: export * from "./object";
packages/uix-utils/package.json: "./*": {
packages/uix-utils/tsup.config.ts: ...Object.fromEntries(submodules.map((name) => [`${name}/index`, `src/${name}/index.ts`]))
packages/uix-data/src/identity/index.ts: export { equals } from "@ultimate/uix-utils/object";
packages/ng-core/src/bind/bind.ts: import { equals } from "@ultimate/uix-utils/object";
```

## Relationships

None recorded.

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Source implementation for UIX object utilities is present; this record describes the current source without asserting framework parity."
  },
  {
    "state": "not-run",
    "behavior": "Product runtime behavior tests were not run for this documentation-only inventory; no product source was changed."
  },
  {
    "state": "ci-enforced",
    "behavior": "The documentation-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes.",
    "workflow": ".github/workflows/ci.yml"
  },
  {
    "state": "verified",
    "command": "node scripts/inventory/pilot.mjs --root . --input scripts/inventory/uix-utils-values.json --out docs/inventory/uix-utils-values (run twice; authored README SHA-256 checked before and after)",
    "revision": "7a06beb32487f04ccd84a765f7722ac606825c74",
    "outcome": "passed",
    "output": "Scoped reconciliation passed twice with identical generated views: 55 source files, 64 named symbols, 128 root/subpath export identities, 8 records, no problems; the authored README SHA-256 was unchanged. The #143 DOM relationship remains in the pending cross-scope ledger because the pilot resolves references within one input. Global completeness, installed package resolution, and product behavior are not asserted.",
    "limitations": "Scoped source, export, ownership, evidence and in-scope reference reconciliation only; the #143 cross-scope relationship remains pending in the pilot, and global completeness, installed package resolution and product behavior are not asserted.",
    "run": "docs/inventory/uix-utils-values/pilot-run.json",
    "behavior": "The scoped inventory reconciles owned source files, named exports, source evidence, ownership, aliases and in-scope references; repeated generation is stable and preserves the authored README hash. The cross-scope #143 relationship is transparently retained in the pending ledger."
  }
]
```
