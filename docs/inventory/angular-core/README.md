# Angular core — ticket #148

This is a bounded, source-backed inventory of `@ultimate/ng-core`: the Angular foundation layer (base component, model and editable holders, base input, `uBind`, `UltimateConfig`, overlay and focus-trap directives, base icons, confirmation, dialog, terminal and toast services, and the component id generator). It describes current source and package configuration only, makes no framework parity claims and does not assert platform-wide completeness. Source facts were inspected at `5a49a62b07259a6033e13fb52a4bb39869a389ed`; the structured input and generated views account for 38 source files under `packages/ng-core/src`, 26 named root export identities and 16 records. Spec files (15) are explicit dispositions. See the [generated index](index.md), [scoped validation](validation.md), and [structured input](../../../scripts/inventory/angular-core.json).

## Package availability

The root `src/index.ts` star-re-exports 15 modules; the inventory tool follows them. `packages/ng-core/package.json` declares `main`, `module` and `types` pointing at `./dist/...` but has **no `exports` map**, so no subpath exports are declared. This is recorded as a source observation and is not repaired. The inventory tool treats the root `.` entry of a package without an `exports` map as the `main`/`module` entry (a tooling tolerance added in `scripts/inventory/pilot.mjs`; no product file was changed). Installed or published package resolution was not exercised.

`basecomponent/style-sheet.ts` exports `NG_CORE_STYLE_KEY_ATTR`, `ngCoreStyleSheetFor` and `ngCoreStyleSheet`, which the `basecomponent` barrel does not re-export: they are source-only helpers, owned by the base component record, and not part of the root surface. The barrel record `ngcore.root` owns no export identities and is `internal`.

## Interface summary

- Foundation classes: `UBaseComponent` (abstract directive with `dt`, `unstyled`, `pt` and `ptOptions` inputs, `cx()`, `ptm`/`ptms`/`ptmo`, a `U_PARENT_INSTANCE` host lookup, theme registration through `@ultimate/uix-styled`), `UModelHolder` (`modelValue` signal, `$filled`), `UBaseEditableHolder` (`ControlValueAccessor`, `disabled`), `UBaseInput` (`fluid`, `variant`, `size`, `inputSize` and native constraint inputs; `U_FLUID_ANCESTOR` token).
- Directives: `UBind` (`[uBind]`), `UOverlay` (`[uOverlay]`, `visible`, `appendTo`, `visibleChange`, z-index registration), `UFocusTrap` (`[uFocusTrap]`, `uFocusTrapDisabled`).
- Services: `UltimateConfig` (root, `unstyled` and `ripple` signals), `UConfirmationService`, `UDialogService` with `UDynamicDialogRef`, `UTerminalService`, `UToastService`; `ComponentIdGenerator` is `@Injectable()` without `providedIn`.
- Icons: `UBaseIcon` (abstract; `label`, `spin`), `USpinnerIcon`, `UTimesIcon`, `UWindowMaximizeIcon`, `UWindowMinimizeIcon`.
- Types: `UMenuItem`, `UTooltipOptions`, `UConfirmation`, `UDynamicDialogConfig`, `UDynamicDialogOpenRequest`, `UToastMessageOptions`.

## Source observations retained without repair

- `UBaseEditableHolder.writeControlValue` has an empty body in the base class; subclasses are expected to override it.
- `USpinnerIcon` derives its path id from `crypto.randomUUID()`, which requires a runtime providing it.
- No `exports` map in the package manifest (see above).

## Relationships

Cross-scope relationships (`uix-styled` stylesheet and service from #145, `uix-utils` DOM and z-index from #143/#144, theme presets from #146, and the Angular dialog and toast component consumers from #151+) are recorded in the pending ledger because the pilot resolves references within one input. Prime-related source comments, where present, are neutral references only.

## Verification and CI

- Regenerate with `node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-core.json --out docs/inventory/angular-core`.
- Product behavior and type tests were not run, per the documentation-only scope. Spec files exist beside the sources, but their presence is not a result. No product code was changed.
- The docs-only CI path runs lint and format checks; build, typecheck and product tests are skipped for docs-only changes. No remote CI result is claimed.
- Check outcomes are in [quality evidence](quality-run.json); regeneration evidence is in [pilot run evidence](pilot-run.json).
