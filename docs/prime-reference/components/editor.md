# Editor

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Editor is a rich-text (WYSIWYG) input that produces an HTML string. It is a thin wrapper around the third-party [Quill](https://quilljs.com/) editor: the Prime component renders a toolbar container and a content container, hands both to Quill with the `snow` theme, and bridges Quill's events and value to the framework's form model. Quill itself is **not bundled and not declared as a dependency** by any of the three packages; the application must install it (the showcase "Quill" section says so in all three frameworks), and each wrapper loads it lazily at runtime. All three ship the component, and all three list it in the Form menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`). Showcase description: "Editor is rich text editor component based on Quill" (`primevue-4.5.5:apps/showcase/pages/editor/index.vue`, `primeng-21.1.9:apps/showcase/pages/editor/index.ts`).

## 2. Names & status

- Canonical name: **Editor** (file `editor`). No legacy aliases in any framework; not deprecated.
- PrimeNG: selector `p-editor`, class `Editor`, module `EditorModule` (`primeng-21.1.9:packages/primeng/src/editor/editor.ts`). The input `styleClass` is deprecated since v20.0.0 in favour of `class` (`primeng-21.1.9:packages/primeng/src/editor/editor.ts`).
- PrimeVue: component `Editor` (`primevue-4.5.5:packages/primevue/src/editor/Editor.vue`).
- PrimeReact: component `Editor` (`primereact-10.9.9:components/lib/editor/Editor.js`).
- Doc-string defect: the JSDoc on PrimeNG's class and the header of PrimeVue's `Editor.d.ts` both read "Editor groups a collection of contents in tabs" (a copy-paste from TabView); the showcase and PrimeReact types correctly say "rich text editor component based on Quill" (`primeng-21.1.9:packages/primeng/src/editor/editor.ts`, `primevue-4.5.5:packages/primevue/src/editor/Editor.d.ts`, `primereact-10.9.9:components/lib/editor/editor.d.ts`).
- Menu category: Form in all three showcases (see §1 menu files).

## 3. Per framework

### PrimeNG 21.1.9

- Import: `import { EditorModule } from 'primeng/editor';` (`primeng-21.1.9:apps/showcase/doc/editor/import-doc.ts`). The class `Editor` is also standalone (`standalone: true`), so it can be imported directly.
- Selector: `<p-editor>`; entry point `primeng/editor`, `public_api.ts` re-exports `primeng/types/editor`, `./editor` and `./style/editorstyle` (`primeng-21.1.9:packages/primeng/src/editor/public_api.ts`).
- Source: `primeng-21.1.9:packages/primeng/src/editor/editor.ts` (class `Editor extends BaseEditableHolder<EditorPassThrough>`, `OnPush`, `ViewEncapsulation.None`, `hostDirectives: [Bind]`), style `primeng-21.1.9:packages/primeng/src/editor/style/editorstyle.ts`, types `primeng-21.1.9:packages/primeng/src/types/editor/editor.types.ts`.
- Exports: `Editor`, `EditorModule`, `EDITOR_VALUE_ACCESSOR`, `EditorStyle`, `EditorClasses`, and the event/interface types (`EditorTextChangeEvent`, `EditorSelectionChangeEvent`, `EditorChangeEvent`, `EditorFocusEvent`, `EditorBlurEvent`, `EditorInitEvent`, `EditorTemplates`, `EditorPassThrough`, `QuillDelta`, `QuillRange`). No directives.
- Forms: implements `ControlValueAccessor` through `EDITOR_VALUE_ACCESSOR` (`NG_VALUE_ACCESSOR`, multi) so `ngModel` and `formControlName` work.

### PrimeVue 4.5.5

- Import: `import Editor from 'primevue/editor';` (`primevue-4.5.5:apps/showcase/doc/editor/ImportDoc.vue`); registered as global component type `Editor` (`primevue-4.5.5:packages/primevue/src/editor/Editor.d.ts`).
- Source: `primevue-4.5.5:packages/primevue/src/editor/Editor.vue` (extends `BaseEditor`), `primevue-4.5.5:packages/primevue/src/editor/BaseEditor.vue` (extends `BaseEditableHolder`, provides `$pcEditor` and `$parentInstance`), types `primevue-4.5.5:packages/primevue/src/editor/Editor.d.ts`, style `primevue-4.5.5:packages/primevue/src/editor/style/EditorStyle.js`.
- Forms: value held by `BaseEditableHolder` (`modelValue`, `defaultValue`, `name`, `invalid`, `disabled`, `formControl`) so it works with `v-model` and with the PrimeVue Forms library via `name` (`primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).

### PrimeReact 10.9.9

- Import: `import { Editor } from 'primereact/editor';` (`primereact-10.9.9:components/doc/editor/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/editor/Editor.js` (`React.memo(React.forwardRef(...))`), base/CSS `primereact-10.9.9:components/lib/editor/EditorBase.js`, types `primereact-10.9.9:components/lib/editor/editor.d.ts`, package manifest `primereact-10.9.9:components/lib/editor/package.json`.
- Controlled component: `value` plus `onTextChange`; no form-library integration is documented.

## 4. Anatomy

All three render the same two-part structure (root → toolbar → content), then Quill mounts inside the content element:

- **root** — wrapper `div` (`p-editor` in PrimeNG/PrimeVue).
- **toolbar** — `div` (`p-editor-toolbar`) that Quill adopts as its toolbar module container. Default contents are groups of `span.ql-formats`:
  1. `select.ql-header` (Heading, Subheading, Normal) and `select.ql-font` (Sans Serif, Serif, Monospace);
  2. buttons `ql-bold`, `ql-italic`, `ql-underline`;
  3. selects `ql-color`, `ql-background`;
  4. buttons `ql-list` (ordered, bullet) and select `ql-align` (left, center, right, justify);
  5. buttons `ql-link`, `ql-image`, `ql-code-block`;
  6. button `ql-clean`.
- **content** — `div` (`p-editor-content`) in which Quill creates its `.ql-container`/`.ql-editor` and tooltip. Its inline style is the place to set the height (`style` in PrimeNG/PrimeReact, `editorStyle` in PrimeVue).

(`primeng-21.1.9:packages/primeng/src/editor/editor.ts`, `primevue-4.5.5:packages/primevue/src/editor/Editor.vue`, `primereact-10.9.9:components/lib/editor/Editor.js`.)

Pass-through keys declared by each framework's types:

- PrimeNG: `root`, `toolbar`, `formats`, `header`, `option`, `bold`, `italic`, `underline`, `color`, `background`, `list`, `select`, `link`, `image`, `codeBlock`, `clean`, `content` (`primeng-21.1.9:packages/primeng/src/types/editor/editor.types.ts`).
- PrimeVue: the same set plus `hooks` (`primevue-4.5.5:packages/primevue/src/editor/Editor.d.ts`).
- PrimeReact: only `root`, `toolbar`, `formats`, `select`, `option`, `button`, `content`, `hooks` (`primereact-10.9.9:components/lib/editor/editor.d.ts`). Wireframe: `primereact-10.9.9:components/doc/editor/pt/wireframe.js`.

## 5. API highlights

### PrimeNG (`primeng-21.1.9:packages/primeng/src/editor/editor.ts`, catalog `docs/prime-reference/catalog/primeng.json`)

- **Value:** HTML `string | null` through `ngModel`/`formControlName`. The model is only updated for user edits (Quill `text-change` with `source === 'user'`); an empty document (`<p><br></p>`) becomes `null`.
- **Inputs:** `style: { [klass: string]: any }` (content inline style), `styleClass` (deprecated since v20.0.0), `placeholder: string`, `formats: string[]` (Quill format whitelist), `modules: object` (merged over `{ toolbar }`), `bounds: HTMLElement | string`, `scrollingContainer: HTMLElement | string`, `debug: string`, `readonly: boolean` (setter calls `quill.disable()`/`quill.enable()`), plus base inputs `disabled = false`, `invalid = false`, `required = false`, `name`, `dt`, `pt`, `ptOptions`, `unstyled`.
- **Outputs:** `onInit` (`EditorInitEvent { editor }`, fired once Quill is created), `onTextChange` (`{ htmlValue: string | null, textValue: string, delta: QuillDelta, source }`), `onSelectionChange` (`{ range: QuillRange | null, oldRange, source }`), `onEditorChange` (`{ eventName: 'text-change' | 'selection-change', args }`), `onFocus` and `onBlur` (`{ source }`, attached to `quill.root`).
- **Template:** `header` (replaces the whole default toolbar); legacy content projection `<p-header>` is also honoured (`@ContentChild(Header) toolbar`).
- **Methods:** `getQuill()`.

### PrimeVue (`primevue-4.5.5:packages/primevue/src/editor/Editor.d.ts`)

The catalog has no component entry for Editor (its `editor` module has an empty component list), so the `.d.ts` is the fact source (`docs/prime-reference/catalog/primevue.json`).

- **Props:** `modelValue?: string`, `defaultValue?: any`, `name?: string`, `placeholder?: string`, `readonly = false`, `invalid = false`, `formats?: any[]`, `editorStyle?: any`, `modules?: any`, `formControl?: Record<string, any>`, `dt`, `pt`, `ptOptions`, `unstyled = false`. `disabled` exists on `BaseEditableHolder` (default `false`) but is not declared in `EditorProps` and is not used by the template.
- **Emits:** `update:modelValue(string)`, `value-change(string)`, `text-change` (`{ htmlValue, textValue, delta, source, instance }`), `selection-change` (`{ htmlValue, textValue, range, oldRange, source, instance }`), `load` (`{ instance }`, the Quill instance).
- **Slot:** `toolbar` (replaces the default toolbar).
- **Methods:** none exposed.
- Empty document becomes `''` (not `null`).

### PrimeReact (`primereact-10.9.9:components/lib/editor/editor.d.ts`, `primereact-10.9.9:components/lib/editor/EditorBase.js`)

- **Props:** `value?: string`, `placeholder`, `readOnly = false`, `modules`, `formats: string[]`, `theme` (source default `'snow'`; the d.ts gives no default), `showHeader = true` (when `false` the toolbar module is disabled and no toolbar is rendered), `headerTemplate: ReactNode`, `style`, `className`, `id`, `pt`, `ptOptions`, `unstyled = false`, plus the HTML div attributes.
- **Callbacks:** `onTextChange(e: { htmlValue: string | null, textValue: string, delta, source })`, `onSelectionChange(e: { range, oldRange, source })`, `onLoad(quill)`.
- **Methods (ref):** `getQuill()`, `getElement()`, `getContent()`, `getToolbar()`; the types and catalog also list `focus()`.
- **Undocumented:** `maxLength` is in `defaultProps` and truncates the content with `quill.deleteText(maxLength, length)` after a text change, but it is absent from the d.ts and catalog (`primereact-10.9.9:components/lib/editor/Editor.js`).
- No `invalid`, `disabled`, `onFocus`, `onBlur`, `bounds`, `debug` or `scrollingContainer`.

## 6. Usage guidance

Showcase sections per framework, in page order:

- **Import** — framework import statement (`primeng-21.1.9:apps/showcase/doc/editor/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/editor/ImportDoc.vue`, `primereact-10.9.9:components/doc/editor/importdoc.js`).
- **Quill** — Quill must be installed by the application because Editor only uses it underneath (`primeng-21.1.9:apps/showcase/doc/editor/quill-doc.ts`, `primevue-4.5.5:apps/showcase/doc/editor/QuillDoc.vue`, `primereact-10.9.9:components/doc/editor/quilldoc.js`). PrimeVue and PrimeReact show `npm install quill`; PrimeNG states the requirement without a command.
- **Basic** — PrimeNG binds with `ngModel` and a `style` height (`primeng-21.1.9:apps/showcase/doc/editor/basic-doc.ts`); PrimeVue uses `v-model` with `editorStyle="height: 320px"` (`primevue-4.5.5:apps/showcase/doc/editor/BasicDoc.vue`); PrimeReact is controlled through `value` and `onTextChange` using `e.htmlValue` (`primereact-10.9.9:components/doc/editor/basicdoc.js`). The demos give the editor an explicit pixel height because the content area has no intrinsic height.
- **ReadOnly** — `readonly` (Angular, Vue) or `readOnly` (React) makes the content non-editable (`primeng-21.1.9:apps/showcase/doc/editor/readonly-doc.ts`, `primevue-4.5.5:apps/showcase/doc/editor/ReadOnlyDoc.vue`, `primereact-10.9.9:components/doc/editor/readonlydoc.js`).
- **Template (custom toolbar)** — replace the default toolbar with your own Quill toolbar markup (`span.ql-formats` with `ql-*` controls): `<ng-template #header>` in PrimeNG (`primeng-21.1.9:apps/showcase/doc/editor/customtoolbar-doc.ts`), `#toolbar` slot in PrimeVue (`primevue-4.5.5:apps/showcase/doc/editor/TemplateDoc.vue`), `headerTemplate` prop in PrimeReact (`primereact-10.9.9:components/doc/editor/templatedoc.js`).
- **Forms** — PrimeNG: template-driven (`ngModel` with `required` and `[invalid]`) and reactive (`formControlName` with `Validators.required`), both showing an error `p-message` and toast via `MessageService` (`primeng-21.1.9:apps/showcase/doc/editor/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/reactiveforms-doc.ts`). PrimeVue: the Forms library with a `zod` resolver and `name="content"` (`primevue-4.5.5:apps/showcase/doc/editor/FormsDoc.vue`). PrimeReact: no Forms section.
- **Accessibility** — see §7.
- Required services/providers: none for the component itself; the form demos use `MessageService` + `ToastModule` (PrimeNG) or `Toast`/`useToast` (PrimeVue).
- Server-side rendering: PrimeNG skips Quill creation on the server (`isPlatformServer`) and loads it with a dynamic `import('quill')`; Vue and React also import it dynamically from the mounted hook (`primeng-21.1.9:packages/primeng/src/editor/editor.ts`, `primevue-4.5.5:packages/primevue/src/editor/Editor.vue`, `primereact-10.9.9:components/lib/editor/Editor.js`).

## 7. Accessibility

- All three AccessibilityDocs delegate to Quill: the toolbar controls are tabbable and carry the roles and attributes Quill provides (`primeng-21.1.9:apps/showcase/doc/editor/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/editor/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/editor/accessibilitydoc.js`).
- PrimeNG and PrimeVue docs additionally name a known Quill limitation: toolbar dropdowns lack arrow-key support, which a custom toolbar can work around. The PrimeReact doc omits this sentence.
- No ARIA roles or keyboard handlers are added by the Prime wrappers themselves; the rich-text surface is Quill's contenteditable `.ql-editor`.
- Default-toolbar button labels differ: PrimeNG and PrimeReact set `aria-label` on the buttons (Bold, Italic, Underline, Ordered List, Unordered List, Insert Link, Insert Image, Insert Code Block, Remove Styles); the PrimeVue default toolbar sets none (`primeng-21.1.9:packages/primeng/src/editor/editor.ts`, `primereact-10.9.9:components/lib/editor/Editor.js`, `primevue-4.5.5:packages/primevue/src/editor/Editor.vue`). Custom toolbars should supply their own labels (the PrimeNG and PrimeReact template demos do).
- Selects in the default toolbar are native `<select>` elements until Quill replaces them with its picker widgets; the pickers are Quill's own markup.

## 8. Theming

- **Style classes** (identical in PrimeNG and PrimeVue): `p-editor` (root, with `p-invalid` when invalid), `p-editor-toolbar`, `p-editor-content` (`primeng-21.1.9:packages/primeng/src/editor/style/editorstyle.ts`, `primevue-4.5.5:packages/primevue/src/editor/style/EditorStyle.js`; catalog `docs/prime-reference/catalog/primeng.json` `modules.editor.style.classes`, and `EditorClasses` members `root`/`toolbar`/`content` in `docs/prime-reference/catalog/primevue.json`).
- **Pass-through keys:** see §4. PrimeNG and PrimeVue also use `font`/`select` keys inconsistently: the Vue and React sources bind a `font` key on the font select, which is not declared in their types, while PrimeNG binds the font select to `select`.
- **Structural CSS:** `@primeuix/styles-2.0.3:dist/editor/index.mjs`. It contains a full copy of Quill's snow-theme CSS (its banner reads Quill Editor v1.3.3) rewritten with logical properties, followed by the `.p-editor` rules that map Quill's elements to design tokens (toolbar, picker label/options, content, and toolbar button hover/focus/active states). Its placeholder colour reuses `form.field.placeholder.color`.
- **Design tokens** (`@primeuix/themes-2.0.3:types/editor/index.d.ts`, interface `EditorDesignTokens`; there is no `tokens/editor` file):
  - `toolbar`: `background`, `borderColor`, `borderRadius`.
  - `toolbarItem`: `color`, `hoverColor`, `activeColor`, `padding`.
  - `overlay`: `background`, `borderColor`, `borderRadius`, `color`, `shadow`, `padding` (the picker dropdown).
  - `overlayOption`: `focusBackground`, `color`, `focusColor`, `padding`, `borderRadius`.
  - `content`: `background`, `borderColor`, `color`, `borderRadius`.
- **Preset values:** Aura maps toolbar and content to the `content.*` tokens, toolbar items to `text.muted.color`/`text.color`/`primary.color`, and the overlay to `overlay.select.*` and `list.*` tokens (`@primeuix/themes-2.0.3:dist/aura/editor/index.mjs`). Lara, Material and Nora ship their own files (`@primeuix/themes-2.0.3:dist/lara/editor/index.mjs`, `@primeuix/themes-2.0.3:dist/material/editor/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/editor/index.mjs`).
- **PrimeReact:** no `@primeuix`; the type header of the theme package lists only PrimeNG and PrimeVue as compatible libraries. `EditorBase.js` embeds its own copy of the Quill snow CSS (banner: Quill Editor v2.0.2) and injects it via `useHandleStyle` under the name `editor`; its `classes` map is empty strings, so the component emits **no** `p-editor`, `p-editor-toolbar` or `p-editor-content` class (`primereact-10.9.9:components/lib/editor/EditorBase.js`). The theming doc nonetheless lists `p-editor-container`, `p-editor-toolbar` and `p-editor-content` (`primereact-10.9.9:components/doc/editor/styledoc.js`, `primereact-10.9.9:components/doc/editor/theming/styleddoc.js`, Tailwind guidance `primereact-10.9.9:components/doc/editor/theming/tailwinddoc.js`). Design tokens: N/A.
- PrimeVue theming docs: `primevue-4.5.5:apps/showcase/doc/editor/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/editor/theming/TailwindDoc.vue`; PrimeNG PT docs: `primeng-21.1.9:apps/showcase/doc/editor/pt/PTComponent.ts`.

## 9. Relationships

- **Embeds / drives:** [Quill](https://quilljs.com/) (external) is the real implementation; no other Prime component is embedded. The PrimeVue template demo uses the Tooltip directive on custom toolbar buttons (`primevue-4.5.5:apps/showcase/doc/editor/TemplateDoc.vue`).
- **Form integration:** PrimeNG `BaseEditableHolder` (CVA), PrimeVue `BaseEditableHolder` and the PrimeVue Forms library; error messaging in demos uses [Message](message.md) (messages category).
- **Alternatives:** [Textarea](textarea.md) and [InputText](inputtext.md) for plain text; Editor is the only rich-text/HTML-valued input in the Prime baseline.
- **Styling siblings:** shares token families with form fields (`form.field.placeholder.color`) and with select overlays (`overlay.select.*`, `list.*`), so theme presets that restyle [Select](select.md) pickers also affect the toolbar dropdowns.
- Not used as a part of any other Prime component.

## 10. Dependencies

- **External npm package: `quill` (required at runtime, not installed by Prime).**
  - PrimeNG: `quill` is not in the `peerDependencies`/`dependencies` of `primeng-21.1.9:packages/primeng/package.json` (peers are the Angular packages, CDK and RxJS); only the showcase app pins `"quill": "2.0.2"` (`primeng-21.1.9:apps/showcase/package.json`). The component loads it with `import('quill')` inside `afterNextRender` and supports both Quill 1 and 2 by branching on `version.startsWith('2')` (`getSemanticHTML()` and `clipboard.convert({ html })` for 2; `.ql-editor` `innerHTML` for 1).
  - PrimeVue: `quill` is listed in the bundle `GLOBAL_EXTERNALS` (`['vue', 'chart.js/auto', 'quill']`, `primevue-4.5.5:packages/primevue/rollup.config.mjs`) and not in the package manifest; the workspace catalog pins `quill: 2.0.0` (`primevue-4.5.5:pnpm-workspace.yaml`) and the showcase uses it (`primevue-4.5.5:apps/showcase/package.json`). It first looks for a global `window.Quill` (script-tag usage), otherwise dynamic `import('quill')`. It requires Quill 2 (`getSemanticHTML()`).
  - PrimeReact: `quill` is in the `external` list of the bundle (`primereact-10.9.9:rollup.config.js`) and is pinned `"quill": "2.0.3"` in the repository `dependencies` (`primereact-10.9.9:package.json`), but is not a peer dependency of the published component; it too prefers a global `Quill`, otherwise `import('quill')`. The embedded CSS banner says v2.0.2 and the showcase snippets declare `quill: '2.0.0'`.
- **Version skew to note:** the shared `@primeuix/styles` editor CSS carries a Quill 1.3.3 snow stylesheet (list rules based on `ul[data-checked]`), while the three components are exercised against Quill 2.x in their showcases (`@primeuix/styles-2.0.3:dist/editor/index.mjs`).
- **Internal (PrimeNG):** `primeng/api` (`Header`, `PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/base`, `primeng/ts-helpers`, `@primeuix/utils` (`findSingle`), `@angular/forms`.
- **Internal (PrimeVue):** `@primevue/core/baseeditableholder`, `@primeuix/utils/dom` (`isExist`), `primevue/editor/style` (→ `@primeuix/styles/editor`).
- **Internal (PrimeReact):** `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`, `useUpdateEffect`), `../utils/Utils` (`DomHandler`, `classNames`).

## 11. Framework differences

| Aspect                | PrimeNG                                                                              | PrimeVue                                                                       | PrimeReact                                                |
| --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Tag / import          | `<p-editor>`, `EditorModule` from `primeng/editor`                                   | `Editor` from `primevue/editor`                                                | `Editor` from `primereact/editor`                         |
| Value binding         | `ngModel` / `formControlName` (CVA)                                                  | `v-model` / `name` in Forms                                                    | controlled `value` + `onTextChange` (`e.htmlValue`)       |
| Empty value           | `null`                                                                               | `''`                                                                           | `null` (from `onTextChange`)                              |
| Quill location        | dynamic `import('quill')`, not declared                                              | global `window.Quill` or dynamic import; external                              | global `Quill` or dynamic import; external                |
| Quill version support | 1 and 2 (version check)                                                              | 2 only                                                                         | 2 (`clipboard.convert({ html, text })`)                   |
| Content height        | `style`                                                                              | `editorStyle`                                                                  | `style`                                                   |
| Read-only             | `readonly` (reactive setter)                                                         | `readonly` (watched)                                                           | `readOnly` (applied at construction only)                 |
| Custom toolbar        | `#header` template / `<p-header>`                                                    | `toolbar` slot                                                                 | `headerTemplate`; `showHeader=false` hides it             |
| Events                | `onInit`, `onTextChange`, `onSelectionChange`, `onEditorChange`, `onFocus`, `onBlur` | `load`, `text-change`, `selection-change`, `update:modelValue`, `value-change` | `onLoad`, `onTextChange`, `onSelectionChange`             |
| Quill access          | `getQuill()`, `onInit.editor`                                                        | `load.instance`, event `instance`                                              | `getQuill()`, `onLoad(quill)`                             |
| Invalid / disabled    | `invalid`, `disabled`, `required` inputs                                             | `invalid` (disabled only on base)                                              | none                                                      |
| Extra Quill options   | `bounds`, `scrollingContainer`, `debug`                                              | none                                                                           | `theme`, `maxLength` (undocumented)                       |
| SSR guard             | `isPlatformServer` skip                                                              | dynamic import in `mounted`                                                    | dynamic import in mount effect                            |
| Styling               | `@primeuix/styles/editor` + tokens                                                   | `@primeuix/styles/editor` + tokens                                             | own embedded Quill CSS; no `p-editor*` classes, no tokens |
| Accessibility labels  | `aria-label` on default buttons                                                      | none on default buttons                                                        | `aria-label` on default buttons                           |
| Forms showcase        | template-driven + reactive                                                           | PrimeVue Forms (zod)                                                           | none                                                      |

## 12. Sources

- PrimeNG: `primeng-21.1.9:packages/primeng/src/editor/editor.ts`, `primeng-21.1.9:packages/primeng/src/editor/public_api.ts`, `primeng-21.1.9:packages/primeng/src/editor/style/editorstyle.ts`, `primeng-21.1.9:packages/primeng/src/types/editor/editor.types.ts`, `primeng-21.1.9:packages/primeng/package.json`, `primeng-21.1.9:apps/showcase/package.json`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primeng-21.1.9:apps/showcase/pages/editor/index.ts`
- PrimeNG docs: `primeng-21.1.9:apps/showcase/doc/editor/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/quill-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/readonly-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/customtoolbar-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/accessibility-doc.ts`, `primeng-21.1.9:apps/showcase/doc/editor/pt/PTComponent.ts`
- PrimeVue: `primevue-4.5.5:packages/primevue/src/editor/Editor.vue`, `primevue-4.5.5:packages/primevue/src/editor/BaseEditor.vue`, `primevue-4.5.5:packages/primevue/src/editor/Editor.d.ts`, `primevue-4.5.5:packages/primevue/src/editor/style/EditorStyle.js`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`, `primevue-4.5.5:packages/primevue/rollup.config.mjs`, `primevue-4.5.5:pnpm-workspace.yaml`, `primevue-4.5.5:apps/showcase/package.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primevue-4.5.5:apps/showcase/pages/editor/index.vue`
- PrimeVue docs: `primevue-4.5.5:apps/showcase/doc/editor/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/QuillDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/ReadOnlyDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/TemplateDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/AccessibilityDoc.vue`, `primevue-4.5.5:apps/showcase/doc/editor/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/editor/theming/TailwindDoc.vue`
- PrimeReact: `primereact-10.9.9:components/lib/editor/Editor.js`, `primereact-10.9.9:components/lib/editor/EditorBase.js`, `primereact-10.9.9:components/lib/editor/editor.d.ts`, `primereact-10.9.9:components/lib/editor/package.json`, `primereact-10.9.9:package.json`, `primereact-10.9.9:rollup.config.js`, `primereact-10.9.9:components/layout/menu.json`
- PrimeReact docs: `primereact-10.9.9:components/doc/editor/importdoc.js`, `primereact-10.9.9:components/doc/editor/quilldoc.js`, `primereact-10.9.9:components/doc/editor/basicdoc.js`, `primereact-10.9.9:components/doc/editor/readonlydoc.js`, `primereact-10.9.9:components/doc/editor/templatedoc.js`, `primereact-10.9.9:components/doc/editor/accessibilitydoc.js`, `primereact-10.9.9:components/doc/editor/styledoc.js`, `primereact-10.9.9:components/doc/editor/theming/styleddoc.js`, `primereact-10.9.9:components/doc/editor/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/editor/pt/wireframe.js`
- Design system: `@primeuix/styles-2.0.3:dist/editor/index.mjs`, `@primeuix/themes-2.0.3:types/editor/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/editor/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/editor/index.mjs`, `@primeuix/themes-2.0.3:dist/material/editor/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/editor/index.mjs`
- Catalog: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
