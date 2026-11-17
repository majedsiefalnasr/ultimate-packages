# Angular UFileUpload

ID: angular.file-upload

Framework: angular; availability: public

## Authored interpretation

Inline file chooser and uploader: choose or drop files into a list with size, type and count validation, then upload them by XMLHttpRequest or hand them to a consumer handler.

## Framework surface

Extends UBaseComponent directly: not UBaseEditableHolder or UBaseInput, so it has no ControlValueAccessor, no NG_VALUE_ACCESSOR provider, no modelValue and no fluid input; it declares its own disabled input. No overlay is used; the widget is inline. Selector u-file-upload; componentName fileupload. Composes UProgressBar (u-progress-bar, shown only while uploading with showValue false). Signal inputs: name, url, method (POST or PUT, default POST), multiple, accept, disabled, auto, withCredentials, maxFileSize and fileLimit (numberAttribute), customUpload, chooseLabel (Choose), uploadLabel (Upload), cancelLabel (Cancel) and emptyMessage. Outputs: onSelect (UFileUploadSelectEvent {originalEvent, files, currentFiles}), onProgress (UFileUploadProgressEvent {originalEvent: ProgressEvent, progress}), onUpload (UFileUploadEvent {originalEvent, files}), onError (UFileUploadErrorEvent {originalEvent, files}), onClear (void), onRemove (UFileUploadRemoveEvent {originalEvent, file}) and uploadHandler (UFileUploadHandlerEvent {files}). All six exported event interfaces are used by an output. onUpload and onError carry a newly constructed synthetic Event (new Event('upload') / new Event('error')), not an XHR event. Public methods: formatSize(bytes), upload(), clear() and remove(event, index). Template: choose button (click opens the hidden native file input unless disabled), upload and cancel buttons only while auto is false (disabled without files; upload also while uploading), the hidden input type=file (class display none), validation messages as plain divs without role or aria-live, a drop zone with dragenter/dragover/dragleave/drop handlers and no keyboard handler, and per-file rows with a remove button aria-label Remove file. The disabled input is applied to the choose button, the file input and the four drag handlers (each returns early when disabled); the upload and cancel buttons do not read it and are governed by file state. Selection (picker or drop): drop is accepted only when multiple is set or exactly one file was dropped, otherwise it is ignored without a message. handleSelectedFiles returns early for an empty list; in single mode it starts from an empty list, so a new selection replaces the current one even if every new file is rejected; duplicates (name, type, size) are skipped silently; maxFileSize, accept and fileLimit failures add plain-English messages; onSelect is always emitted afterwards with files = all incoming files (including rejected) and currentFiles = the kept list; with auto set and files present, upload() runs. accept matching: comma-split and trimmed; a type containing * is matched by file.type.startsWith of the text before '/', so a bare * (no '/') yields an empty prefix that matches every file; otherwise the MIME type must equal the entry or '.' + the last dot-separated segment of the file name must equal it case-insensitively. upload(): returns when there are no files; with customUpload it emits uploadHandler and returns without setting the uploading state; without a url it returns silently; otherwise it posts FormData (field name from name(), default files) through XMLHttpRequest. Progress is emitted only when lengthComputable. onreadystatechange at readyState 4 resets uploading and progress, emits onUpload then calls clear() (which emits onClear) for 2xx, else emits onError (a network failure with status 0 also ends here). No other xhr handler is attached, and a direct upload() call while uploading starts another request. clear() and remove() reset the native input value; clear() emits onClear even when the list is already empty. formatSize math: 0 gives '0 B'; the unit index is floor(log(bytes)/log(1024)) with the label capped at TB while the divisor keeps the uncapped index (1024^5 bytes shows 1.00 TB); a fractional size below 1 byte gives a negative index and shows 512.00 TB for 0.5; negative or NaN input shows NaN TB (checked in plain Node arithmetic, not executed in the component). Host class cx('root'). Owned source-only declarations: FileUploadClassesParams and fileUploadStyleModule (classes root, header, chooseButton, uploadButton, cancelButton, input, content, file, fileThumbnail, fileInfo, fileName, fileSize, fileRemoveButton, empty, message). The fileThumbnail class and its CSS rule exist but no template element uses them. Consumer availability: exported from the root barrel through ./file-upload (UFileUpload and the type exports UFileUploadSelectEvent, UFileUploadProgressEvent, UFileUploadEvent, UFileUploadErrorEvent, UFileUploadRemoveEvent, UFileUploadHandlerEvent). There is no ./file-upload manifest subpath in packages/ng/package.json and no packages/ng/file-upload entry-point directory. No dedicated @ultimate/uix-styles export exists for this family: its CSS is hand-ported into the local style file. Aura registry key is fileupload (folder and selector use the hyphenated name); aura-token-wiring.spec.ts lists eleven approved unresolved variables (two button tokens, seven fileupload tokens and two message error tokens). That spec was not executed. There is no component-metadata record for this family (packages/component-metadata/src/records holds none for it). Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; those declared inputs are not read anywhere in ng-core, so they are not evidence that unstyled suppresses registration. Standalone, OnPush, ViewEncapsulation.None. Style helper exports are source-only internals, not barrel exports or independent rendered components. The spec and stories files are excluded.

## Public exports

@ultimate/ng#UFileUpload
@ultimate/ng#UFileUploadSelectEvent
@ultimate/ng#UFileUploadProgressEvent
@ultimate/ng#UFileUploadEvent
@ultimate/ng#UFileUploadErrorEvent
@ultimate/ng#UFileUploadRemoveEvent
@ultimate/ng#UFileUploadHandlerEvent

## Owned source and evidence

packages/ng/src/file-upload/index.ts
packages/ng/src/file-upload/file-upload.ts
packages/ng/src/file-upload/file-upload-style.ts

```text
packages/ng/src/file-upload/index.ts: export { UFileUpload }
packages/ng/src/file-upload/file-upload.ts: export class UFileUpload extends UBaseComponent
packages/ng/src/file-upload/file-upload.ts: uploadHandler = output<UFileUploadHandlerEvent>();
packages/ng/src/file-upload/file-upload.ts: imports: [UProgressBar],
packages/ng/src/file-upload/file-upload.ts: const next = this.multiple() ? [...this.files()] : [];
packages/ng/src/file-upload/file-upload.ts: this.onSelect.emit({ originalEvent: event, files: incoming, currentFiles: next });
packages/ng/src/file-upload/file-upload.ts: const allowDrop = this.multiple() || fileList.length === 1;
packages/ng/src/file-upload/file-upload.ts: const xhr = new XMLHttpRequest();
packages/ng/src/file-upload/file-upload.ts: this.onUpload.emit({ originalEvent: new Event("upload"), files: uploadedFiles });
packages/ng/src/file-upload/file-upload.ts: const i = Math.floor(Math.log(bytes) / Math.log(k));
packages/ng/src/file-upload/file-upload.ts: aria-label="Remove file"
packages/ng/src/file-upload/file-upload-style.ts: export interface FileUploadClassesParams
packages/ng/src/file-upload/file-upload-style.ts: fileThumbnail: "u-file-upload-file-thumbnail",
packages/ng/src/file-upload/file-upload-style.ts: export const fileUploadStyleModule
packages/ng/src/index.ts: export * from "./file-upload";
packages/ng/src/progress-bar/progress-bar.ts: selector: "u-progress-bar",
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/themes/src/presets/aura/index.ts:     fileupload: fileUpload,
```

## Relationships

package.ultimate.ng.file-upload → [angular.file-upload](angular.file-upload.md) (reconciled family alias)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng.progress-bar (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{input-number,date-picker,color-picker,file-upload}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "73cc77945ad2e4213695c2d140166822dc1ad12c",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
