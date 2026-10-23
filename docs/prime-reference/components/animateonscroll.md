# AnimateOnScroll

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5

## 1. Summary

AnimateOnScroll is a directive that adds and removes CSS classes on its host element as the element enters or leaves the viewport during scrolling. It is built on the IntersectionObserver API. The consumer supplies the class names (`enterClass`, `leaveClass`); the directive applies them and clears them again when the animation finishes. It ships in PrimeNG as the attribute directive `pAnimateOnScroll` and in PrimeVue as the `v-animateonscroll` directive. It has no structural CSS and no design tokens of its own, so the visual effect comes entirely from the consumer's CSS animations (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`, `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`).

## 2. Names & status

- Canonical name: **AnimateOnScroll** (record file `animateonscroll.md`). The GLOSSARY has no entry for it; the name comes from the study issue.
- Legacy and framework names: PrimeNG selector `pAnimateOnScroll`, NgModule `AnimateOnScrollModule`. PrimeVue registers the directive as `v-animateonscroll` in templates; its runtime name is `animateonscroll` (the argument to `BaseDirective.extend`), and its style name is `animateonscroll-directive` (`primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`, `primevue-4.5.5:packages/primevue/src/animateonscroll/style/AnimateOnScrollStyle.js`).
- Deprecations: none. No `@deprecated` tag appears in either component folder (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`, `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.d.ts`).
- Showcase menu: **Misc**, listed first in that category, in PrimeNG (`primeng-21.1.9:apps/showcase/assets/data/menu.json`) and in PrimeVue (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`).
- PrimeReact: not shipped (see §3).
- Doc/source mismatch: the PrimeVue foundation note calls the global PT key `animate`; the runtime key is `animateonscroll` (see §8).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                                                           | PrimeVue                                                                                                                                                                                                                                         | PrimeReact                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Import         | `import { AnimateOnScrollModule } from 'primeng/animateonscroll'` (`primeng-21.1.9:apps/showcase/doc/animateonscroll/import-doc.ts`); the standalone directive `AnimateOnScroll` is also exported | `import AnimateOnScroll from 'primevue/animateonscroll'`, then `app.directive('animateonscroll', AnimateOnScroll)` (`primevue-4.5.5:apps/showcase/doc/animateonscroll/ImportDoc.vue`)                                                            | N/A — not shipped in primereact-10.9.9 (no `components/lib` or `components/doc` folder, no menu entry) |
| Selector / tag | `[pAnimateOnScroll]` attribute directive; no element tag                                                                                                                                          | `v-animateonscroll` directive; no element tag                                                                                                                                                                                                    | N/A                                                                                                    |
| Package entry  | `public_api.ts` re-exports `./animateonscroll`; `ng-package.json` entry file `public_api.ts` (`primeng-21.1.9:packages/primeng/src/animateonscroll/public_api.ts`)                                | `./animateonscroll` maps to `src/animateonscroll/AnimateOnScroll.js` and `./animateonscroll/style` to the style module (`primevue-4.5.5:packages/primevue/package.json`); folder `package.json` gives `main`/`types`                             | N/A                                                                                                    |
| Source         | `primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`                                                                                                                          | `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js` (base: `BaseAnimateOnScroll.js`)                                                                                                                                       | N/A                                                                                                    |
| Exports        | `AnimateOnScroll` (directive), `AnimateOnScrollModule` (imports and exports the directive); the `AnimateOnScrollOptions` interface is not exported                                                | default directive; `primevue/animateonscroll/style` default export `AnimateOnScrollStyle`; the barrel `primevue-4.5.5:packages/primevue/src/index.js` also exports `AnimateOnScroll` and `AnimateOnScrollStyle`; types in `AnimateOnScroll.d.ts` | N/A                                                                                                    |
| Base           | `BaseComponent` (`primeng/basecomponent`); no style service                                                                                                                                       | `BaseDirective.extend` from `@primevue/core/basedirective` with `style: AnimateOnScrollStyle`                                                                                                                                                    | N/A                                                                                                    |

Sources: `primeng-21.1.9:apps/showcase/doc/animateonscroll/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/animateonscroll/ImportDoc.vue`, `primereact-10.9.9:components/layout/menu.json`.

## 4. Anatomy

N/A — AnimateOnScroll is a single directive with no sub-components, templates or named parts. It changes only its host element: PrimeNG adds the class `p-animateonscroll` (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`), PrimeVue adds the attribute `data-pd-animateonscroll` (`primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`). In both, the host also receives the consumer's enter and leave classes and an inline `opacity` style. The directive has no PT section keys (see §8).

## 5. API highlights

| Input      | PrimeNG (`pAnimateOnScroll`, inputs)                                                                                                               | PrimeVue (`v-animateonscroll`, binding value and modifiers)                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enterClass | `string \| undefined`, no default. Applied on entry.                                                                                               | `enterClass?: string \| undefined`. Whitespace-separated class names are allowed.                                                                                                                                                       |
| leaveClass | `string \| undefined`, no default. Applied on exit.                                                                                                | `leaveClass?: string \| undefined`, same rules.                                                                                                                                                                                         |
| root       | `HTMLElement \| undefined \| null`, default `undefined`. IntersectionObserver `root`.                                                              | `root?: Element \| Document \| null`. IntersectionObserver `root`.                                                                                                                                                                      |
| rootMargin | `string \| undefined`. IntersectionObserver `rootMargin`.                                                                                          | `rootMargin?: string`. IntersectionObserver `rootMargin`.                                                                                                                                                                               |
| threshold  | `number \| undefined`, default `0.5` (`numberAttribute` transform). The options getter uses `this.threshold \|\| 0.5`, so `0` is coerced to `0.5`. | `threshold?: ReadonlyArray<number>` in the type. The runtime default is `0.5` through destructuring, which keeps `0`, and the value is passed to IntersectionObserver. The type is narrower than what the observer accepts (see below). |
| once       | `boolean`, default `false` (`booleanAttribute` transform). When `true`, the observer is removed after the first enter.                             | Modifier `.once` (`AnimateOnScrollDirectiveModifiers.once`). The `.d.ts` marks the default as `true`, but the runtime reads `$modifiers.once`, which is falsy when the modifier is absent.                                              |

- Events: none in either framework. PrimeNG declares no `@Output`; PrimeVue emits nothing.
- Methods and internals: PrimeNG exposes the public fields `observer`, `resetObserver`, `isObserverActive`, `animationState` and `animationEndListener`, and the methods `enter()`, `leave()`, `bindIntersectionObserver()`, `bindAnimationEvents()`, `unbindAnimationEvents()` and `unbindIntersectionObserver()`. PrimeVue keeps the same logic under `methods`. These are internal state, not documented API.
- Common inputs: PrimeNG inherits `pt`, `ptOptions`, `unstyled` and `dt` from `BaseComponent` (`primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`). PrimeVue reads `unstyled` and `dt` from the binding value through the BaseDirective helpers (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`).
- PrimeVue directive types: `AnimateOnScrollOptions`, `AnimateOnScrollDirectiveModifiers`, `AnimateOnScrollDirectivePassThroughOptions` (`hooks` only) and `AnimateOnScrollDirectiveBinding` (`primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.d.ts`).
- Deprecated members: none.
- Full API: catalog module `animateonscroll` in `docs/prime-reference/catalog/primeng.json`; modules `animateonscroll` and `animateonscrollstyle` in `docs/prime-reference/catalog/primevue.json`.
- Catalog vs source: the PrimeNG catalog types `root` as `HTMLElement` and `enterClass` as `string`, dropping the `| undefined \| null` in the source. The PrimeVue catalog shows `threshold` as `readonly number[]`, matching the `.d.ts`.

## 6. Usage guidance

- **Import / registration** — PrimeNG: add `AnimateOnScrollModule` (or the standalone directive) to the component's imports. PrimeVue: register the directive globally with `app.directive('animateonscroll', AnimateOnScroll)`. No service or provider is needed (`primeng-21.1.9:apps/showcase/doc/animateonscroll/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/animateonscroll/ImportDoc.vue`).
- **Basic** — set `enterClass` for the entrance and, optionally, `leaveClass` for the exit. The showcase uses tailwindcss-primeui utilities, but any valid CSS animation works. Its cards use both classes, while one card sets only `enterClass`, which is allowed (`primevue-4.5.5:apps/showcase/doc/animateonscroll/BasicDoc.vue`, `primeng-21.1.9:apps/showcase/doc/animateonscroll/basic-doc.ts`).
- **Animation must be a CSS animation.** Both sources clear the classes only on the `animationend` event (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts` `bindAnimationEvents`, `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js` `bindAnimationEvents`). Inference from that logic (not stated in either source): a rule that uses only CSS transitions would not fire `animationend`, so the classes would stay on the element and the reset observer would not be re-armed.
- **Hidden until first intersection** — when `enterClass` is set, the host starts with inline `opacity: 0` and the style is cleared on enter (PrimeNG in `onInit`, PrimeVue in `created`).
- **Re-animating on scroll back** — without `once`, the element animates out on leave; a reset observer clears the classes and the inline opacity once the element is again below the viewport edge (`boundingClientRect.top > 0`) and not intersecting, so the enter animation can replay. With `once`, the observer is removed after the first enter (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.spec.ts`, "Once Behavior").
- **Observer options** — `root`, `rootMargin` and `threshold` are passed to IntersectionObserver. The showcases do not demonstrate them; the PrimeNG spec checks the default threshold of `0.5` and a custom `rootMargin` (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.spec.ts`).
- **Object form (PrimeNG)** — the PrimeNG basic doc writes `pAnimateOnScroll="{ enterClass: '…' }"` on one card (`primeng-21.1.9:apps/showcase/doc/animateonscroll/basic-doc.ts`), but PrimeNG declares no input named `pAnimateOnScroll`, so that attribute does not configure the directive. Use the individual inputs. This is a doc/source mismatch.
- **Server rendering** — PrimeNG guards observer setup with `isPlatformBrowser`. The PrimeVue source has no platform guard; its `mounted` hook binds the observer directly (`primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`).

## 7. Accessibility

- Screen reader: the PrimeNG and PrimeVue accessibility docs say the directive needs no roles or attributes (`primeng-21.1.9:apps/showcase/doc/animateonscroll/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/animateonscroll/AccessibilityDoc.vue`). Neither source sets any ARIA attribute.
- Keyboard: none. Both docs state that the component has no interactive elements.
- Visibility: the enter-class setup sets inline opacity `0` (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`, `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`). Opacity hides content only visually; the element stays in the accessibility tree (general CSS behaviour, not stated in either source). Authors should not rely on the animation to reveal or hide content for assistive technology.
- Reduced motion: neither source checks `prefers-reduced-motion`. `@primeuix/utils-0.7.2:dist/dom/index.mjs` exports an `isPrefersReducedMotion` helper, but this directive does not call it. Authors should handle reduced motion in their own CSS.

## 8. Theming

- Style classes: none from the library. PrimeVue's `AnimateOnScrollClasses` enum is empty (`primevue-4.5.5:packages/primevue/src/animateonscroll/style/AnimateOnScrollStyle.d.ts`), and the catalog interface `AnimateOnScrollStyle` has no members (`docs/prime-reference/catalog/primevue.json`). PrimeNG has no style folder. The only markers are the PrimeNG host class `p-animateonscroll` and the PrimeVue attribute `data-pd-animateonscroll`.
- Consumer classes: `enterClass` and `leaveClass` are the author's own CSS classes. The showcase uses tailwindcss-primeui utilities such as `animate-enter`, `fade-in-10`, `slide-in-from-l-8`, `zoom-in-50`, `animate-duration-1000`, `animate-leave` and `fade-out-0` (`primevue-4.5.5:apps/showcase/doc/animateonscroll/BasicDoc.vue`).
- Structural CSS: none. `@primeuix/styles-2.0.3:dist/` has no `animateonscroll` folder. PrimeVue's `AnimateOnScrollStyle` is registered as `animateonscroll-directive` and loads no CSS (`primevue-4.5.5:packages/primevue/src/animateonscroll/style/AnimateOnScrollStyle.js`).
- Design tokens: none. Neither `@primeuix/themes-2.0.3:types/` nor `@primeuix/themes-2.0.3:dist/aura/` contains an animateonscroll entry.
- Pass-through: PrimeNG inherits `pt` and `ptOptions` from `BaseComponent`, but the directive has no template sections, makes no `ptm`/`cx` calls, and declares no `Bind` host directive, so PT has no section to target (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`). PrimeVue's `AnimateOnScrollDirectivePassThroughOptions` exposes only `hooks`. The global config types the key as `directives.animate` (`primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, line 299), but the runtime reads `value?.directives?.[name]` with `name = 'animateonscroll'` (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`, line 181). The typed key and the runtime key differ. The PrimeVue foundation note in `docs/prime-reference/foundations/primevue.md` §11 repeats `animate` and needs correcting.
- PT and theming docs: none. The showcase folders contain only `ImportDoc`, `BasicDoc` and `AccessibilityDoc` for both frameworks.

## 9. Relationships

- Embeds: none. No PrimeNG source outside its own folder references AnimateOnScroll. PrimeVue references it only in the barrels `primevue-4.5.5:packages/primevue/src/index.js` and `primevue-4.5.5:packages/primevue/src/index.d.ts`, the UMD bundle `primevue-4.5.5:packages/primevue/src/umd/primevue.js`, and the global PT type `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`.
- Used by: none in the component libraries; the showcase uses it directly.
- Related (Misc): **StyleClass** also applies enter and leave classes (`enterFromClass`, `enterActiveClass` in `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.d.ts`; `enterFromClass` in `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`), but on demand rather than from viewport intersection.
- Related (lazy rendering): **DeferredContent** (`primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`). The panel-category `deferredcontent` record treats AnimateOnScroll as its visibility-driven counterpart. PrimeNG has no DeferredContent, per that record.
- Directive family: AnimateOnScroll extends the same PrimeVue `BaseDirective` as the other directives (`primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`), alongside Tooltip, Ripple, FocusTrap, KeyFilter and the badge directive.
- Not related: PrimeNG's `pMotion` / `p-motion` system (`primeng-21.1.9:packages/primeng/src/motion/motion.directive.ts`). AnimateOnScroll does not import `@primeuix/motion` (`primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`).
- Alias chain: none within this record. PrimeVue's `v-animateonscroll` is a registration name; PrimeNG's `pAnimateOnScroll` is a selector.

## 10. Dependencies

- PrimeNG internal: `primeng/basecomponent` (`BaseComponent`), `@primeuix/utils` (`addClass`, `removeClass`), and `@angular/common` (`isPlatformBrowser`). It uses `@angular/core` for the directive, inputs and NgModule, and no style module.
- PrimeVue internal: `@primevue/core/basedirective` (`BaseDirective`, `DirectiveHooks` type), `@primevue/core/base/style` (through the style file), `primevue/animateonscroll/style`, and `@primeuix/utils/dom` (`addClass`, `removeClass`).
- External npm packages: none. PrimeVue's `.d.ts` imports types from `vue`. Both rely on browser APIs: IntersectionObserver, `animationend` and `setTimeout`.

## 11. Framework differences

| Aspect              | PrimeNG                                              | PrimeVue                                                               | PrimeReact |
| ------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------- | ---------- |
| Form of use         | attribute directive `[pAnimateOnScroll]` with inputs | directive `v-animateonscroll` with one binding object                  | N/A        |
| Modifier            | none                                                 | `.once`                                                                | N/A        |
| `once` default      | `false` (input)                                      | falsy when the modifier is absent; `.d.ts` says `true`                 | N/A        |
| `threshold` default | `0.5`; `0` coerced to `0.5` by `\|\| 0.5`            | `0.5` by destructuring; `0` kept; `.d.ts` type `ReadonlyArray<number>` | N/A        |
| `root` type         | `HTMLElement \| undefined \| null`                   | `Element \| Document \| null`                                          | N/A        |
| Host marker         | class `p-animateonscroll`                            | attribute `data-pd-animateonscroll`                                    | N/A        |
| SSR guard           | `isPlatformBrowser` before opacity and observer      | none in source                                                         | N/A        |
| Observer bound in   | `onAfterViewInit`                                    | `mounted`                                                              | N/A        |
| Global PT key       | `pt` / `ptOptions` inherited; no sections            | typed `directives.animate`; runtime `directives.animateonscroll`       | N/A        |
| Own CSS or tokens   | none                                                 | none (style module loads no CSS)                                       | N/A        |
| Showcase sections   | Import, Basic, Accessibility                         | Import, Basic, Accessibility                                           | N/A        |
| Menu                | Misc                                                 | Misc                                                                   | N/A        |

Sources: `primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`, `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, `primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`.

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.ts`
- `primeng-21.1.9:packages/primeng/src/animateonscroll/animateonscroll.spec.ts`
- `primeng-21.1.9:packages/primeng/src/animateonscroll/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/animateonscroll/ng-package.json`
- `primeng-21.1.9:packages/primeng/src/basecomponent/basecomponent.ts`
- `primeng-21.1.9:packages/primeng/src/styleclass/styleclass.ts`
- `primeng-21.1.9:packages/primeng/src/motion/motion.directive.ts`
- `primeng-21.1.9:apps/showcase/doc/animateonscroll/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/animateonscroll/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/animateonscroll/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/pages/animateonscroll/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.js`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/AnimateOnScroll.d.ts`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/BaseAnimateOnScroll.js`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/package.json`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/style/AnimateOnScrollStyle.js`
- `primevue-4.5.5:packages/primevue/src/animateonscroll/style/AnimateOnScrollStyle.d.ts`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/primevue/src/styleclass/StyleClass.d.ts`
- `primevue-4.5.5:packages/primevue/src/deferredcontent/DeferredContent.vue`
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/core/src/basedirective/BaseDirective.js`
- `primevue-4.5.5:apps/showcase/doc/animateonscroll/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/animateonscroll/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/animateonscroll/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/animateonscroll/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:components/lib/`
- `@primeuix/styles-2.0.3:dist/`
- `@primeuix/themes-2.0.3:types/`
- `@primeuix/themes-2.0.3:dist/aura/`
- `@primeuix/utils-0.7.2:dist/dom/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json` (module `animateonscroll`), `docs/prime-reference/catalog/primevue.json` (modules `animateonscroll`, `animateonscrollstyle`)
