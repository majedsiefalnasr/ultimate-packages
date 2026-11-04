# Vue UFileUpload

ID: vue.file-upload

Framework: vue; availability: public

## Authored interpretation

Inline file chooser and drop zone that validates selected files and uploads them with XMLHttpRequest or hands them to a custom handler.

## Framework surface

UFileUpload (Options API SFC FileUpload.vue, name "UFileUpload") and createBaseFileUpload (BaseFileUpload.ts) plus fileUploadStyleModule and FileUploadClassesParams (file-upload-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseFileUpload extends createBaseComponent({ componentName "fileupload", styleModule }) only, so there is no modelValue, defaultValue, dValue or writeValue and no update:modelValue (no modelValue binding at all) and no size, fluid or variant; the factory also shadows cx() and declares mounted() with registerComponentStyle("fileupload"), the same name as the Aura registry key. Declared props: name ("files"), url, method ("POST"), multiple, accept, disabled, auto, withCredentials, maxFileSize, fileLimit, customUpload, chooseLabel, uploadLabel, cancelLabel, emptyMessage. Emits declared: select, progress, upload, error, clear, remove, upload-handler; payloads: select { originalEvent, files (incoming), currentFiles }, progress { originalEvent, progress }, upload { files }, error { files }, remove { originalEvent, file }, upload-handler { files }, clear none. No slots. Template: root div; header with choose button, then (v-if !auto) Upload and Cancel buttons, and a hidden input type=file (class display none); UProgressBar (imported by relative path ../progress-bar/ProgressBar.vue) while uploading with showValue false; message divs with no role or aria-live (no role or aria-live on validation messages); a drop zone with dragenter, dragover, dragleave and drop handlers; empty message; file rows (key name-size-index) with the formatted size and a remove button whose aria-label is the fixed English text "Remove file". No UPortal and no overlay. Validation (handleSelectedFiles): empty lists return; single mode starts from an empty list, multiple mode from the existing list; duplicates (name, type and size) are skipped; maxFileSize and accept failures add a message; fileLimit truncates the list; messages are replaced on each call; select is emitted even when every file was rejected; then the native input is cleared and, when auto is set and files exist, upload() runs. accept matching (isFileTypeValid): entries containing an asterisk compare file.type with the text before the first "/", so the pattern `*/*` (typeClass `*`) rejects every file because no type starts with "*", while a bare `*` has no "/" and its empty prefix accepts every file; other entries match the exact type or the extension case-insensitively. Dropping several files in single mode is ignored without a message; drag handlers return early when disabled. Upload (upload): returns silently without files, or without url unless customUpload; customUpload emits upload-handler and sends nothing; otherwise a FormData (field name) is sent with XMLHttpRequest, method, withCredentials and an upload progress listener that emits progress only when lengthComputable (Math.round(loaded*100/total)). Completion is handled only in onreadystatechange at readyState 4: a 2xx status emits upload with the files read at completion time, clears the list and messages, and emits clear; any other status, including status 0 for a network failure, emits error. There is no onerror, onabort or ontimeout handler and no abort: the XHR is not retained, so Cancel (clear) and remove do not abort an in-flight request; clear() during an upload empties the list, and the later completion reads the then-empty list. The Upload button is disabled while uploading and without files, but the Upload and Cancel buttons do not read the disabled prop (only the choose button, the hidden input and drag handlers do). formatSize: 0 gives "0 B"; each 1024 step moves through B/KB/MB/GB/TB with toFixed(2); sizes of 1024^5 bytes or more are not scaled past TB (1024^5 shows "1.00 TB"); fractional sizes below 1 give a negative index that falls back to "TB" (0.5 gives "512.00 TB") and negative sizes give "NaN TB". Styles (file-upload-style.ts, hand-ported, no @ultimate/uix-styles import): 13 dt('fileupload.…') uses plus dt('button.…') (button.border.radius, button.secondary.background) and dt('message.…') (message.error.background, message.error.color), i.e. it reads button and message theme tokens; classes root, header, chooseButton (disabled gives p-disabled), uploadButton, cancelButton, input, content (highlight gives u-file-upload-highlight), file, fileInfo, fileName, fileSize, fileRemoveButton, empty and message all used; FileUploadClassesParams.disabled and highlight are both read; the rule .u-file-upload .u-progress-bar sizes the child progress bar; no position or z-index. Theme: Aura registry key fileupload (value fileUpload), differing from the family name file-upload. No component-metadata record exists. file-upload.spec.ts and file-upload.stories.ts are excluded supporting files. Composes no UPortal: no UPortal in this component.

## Public exports

@ultimate/vue#UFileUpload
@ultimate/vue/file-upload#UFileUpload
@ultimate/vue#createBaseFileUpload
@ultimate/vue/file-upload#createBaseFileUpload

## Owned source and evidence

packages/vue/src/file-upload/BaseFileUpload.ts
packages/vue/src/file-upload/FileUpload.vue
packages/vue/src/file-upload/file-upload-style.ts
packages/vue/src/file-upload/index.ts

```text
packages/vue/src/file-upload/FileUpload.vue: name: "UFileUpload",
packages/vue/src/file-upload/FileUpload.vue: emits: ["select", "progress", "upload", "error", "clear", "remove", "upload-handler"],
packages/vue/src/file-upload/FileUpload.vue: import UProgressBar from "../progress-bar/ProgressBar.vue";
packages/vue/src/file-upload/FileUpload.vue: xhr.onreadystatechange = () => {
packages/vue/src/file-upload/BaseFileUpload.ts: componentName: "fileupload",
packages/vue/src/file-upload/file-upload-style.ts: export const fileUploadStyleModule
packages/vue/src/file-upload/index.ts: createBaseFileUpload
packages/vue/src/index.ts: export * from "./file-upload";
packages/vue/package.json: "./file-upload": {
```

## Relationships

package.ultimate.vue.file-upload → [vue.file-upload](vue.file-upload.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.vue.progress-bar (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Vue product spec for the numeric, date, color and file families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "3143b1f248e72addb28087e65a31014466c5969d",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); no product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
