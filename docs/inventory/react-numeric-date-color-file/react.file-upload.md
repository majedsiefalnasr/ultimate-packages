# React UFileUpload

ID: react.file-upload

Framework: react; availability: public

## Authored interpretation

Inline file chooser and drop zone that validates selections, lists files and uploads them with XMLHttpRequest or hands them to a custom handler.

## Framework surface

UFileUpload is a plain function component (not a forwardRef) with UFileUploadProps. Props: name (default "files"), url, method (POST | PUT, default POST), multiple, accept, disabled, auto, withCredentials, maxFileSize, fileLimit, customUpload, chooseLabel, uploadLabel, cancelLabel, emptyMessage, className, onSelect, onProgress, onUpload, onError, onClear, onRemove and onUploadHandler. Event types: UFileUploadSelectEvent (originalEvent, files, currentFiles), UFileUploadProgressEvent (originalEvent ProgressEvent, progress), UFileUploadEvent and UFileUploadErrorEvent (files), UFileUploadRemoveEvent (originalEvent, file) and UFileUploadHandlerEvent (files). The style module exports FileUploadClassesParams (disabled, highlight) and fileUploadStyleModule; neither is re-exported by index.ts.

State: the selected list, uploading, progress, highlight and validation messages are internal; the list cannot be bound or set from props, and there is no ref or imperative API. Inline widget: no overlay and no portal. It renders UProgressBar (imported from ../progress-bar/progress-bar) with value=progress and showValue=false only while uploading.

Upload: upload(currentFiles) returns on an empty list. With customUpload it calls onUploadHandler({ files }) and returns, without setting uploading and without clearing the list. Without url it returns silently. Otherwise it sets uploading and progress 0, builds a FormData with append(name, file, file.name) per file, and sends an XMLHttpRequest with the configured method, url and withCredentials. Progress comes from xhr.upload's progress listener and is applied only when lengthComputable, as round(loaded * 100 / total), updating state and calling onProgress. onreadystatechange acts at readyState 4: it clears uploading and progress, and for 2xx statuses calls onUpload({ files }), empties the list and messages, clears the native input and calls onClear; other statuses (including 0) call onError({ files }). There is no onerror or onabort handler, no abort (the Cancel button only calls clear(), is enabled while uploading and the request continues), no setRequestHeader, no response exposure and no unmount cleanup. onUpload and onError carry only files.

Selection: handleSelectedFiles returns for a null or empty FileList. The next list starts from the current list when multiple, otherwise empty, so single mode replaces the list even when every new file is rejected. A file with the same name, type and size is skipped silently. Files over maxFileSize add the message '{name}: invalid file size, maximum upload size is {formatSize}.'; files failing accept add '{name}: invalid file type, allowed file types: {accept}.'. When the list exceeds fileLimit a message is added and the newest entries are truncated. Messages are replaced on each selection. onSelect always fires with files (all incoming, including rejected) and currentFiles (the kept list), even if nothing was accepted; the native input is cleared; with auto and a non-empty list the whole kept list is uploaded again.

Accept matching: isFileTypeValid splits accept on commas and trims; an entry containing `*` matches file.type.startsWith(entry up to the first `/`), so `'*'` matches every file, `'image/*'` matches image types and `'*/*'` uses prefix `*` and rejects every file; other entries match file.type exactly (case-sensitive) or the lowercase '.' plus last name segment. formatSize returns '0 B' for 0, otherwise floor(log(bytes) / log(1024)) with toFixed(2), a label from sizes[i] ?? 'TB' and an uncapped divisor (1024^5 gives '1.00 TB'; 0.5 gives '512.00 TB'; negative or NaN gives 'NaN TB'; 1536 gives '1.50 KB').

Controls and markup: the Choose button uses the disabled attribute and its click returns when disabled before clicking a hidden input type=file (class u-file-upload-input, display none) that carries multiple, accept, disabled and onChange but no id, name or aria attributes. Upload and Cancel buttons render only when auto is false: Upload is disabled when there are no files or while uploading, Cancel when there are no files; neither reads the disabled prop. The content zone handles dragenter, dragover, dragleave and drop, returning early when disabled; dragover sets highlight, dragleave clears it (so child entry can flicker), all stop propagation and preventDefault, and a drop is processed only when multiple or exactly one file, otherwise ignored silently. The drop zone has no role and is not keyboard operable. Messages render in a plain div with no role or aria-live. File rows show name and formatSize, with a type=button remove button whose aria-label is Remove file on every row; removeFile filters the list, clears the native input, calls onRemove only when a file was removed and does not clear messages. clear() empties files and messages, clears the input and calls onClear even when the list was already empty. Keys: messages by text, files by name-size-index.

Styles: root class u-file-upload u-component; content reads highlight only, and FileUploadClassesParams.disabled is never read by any class resolver. Class keys: header, chooseButton, uploadButton, cancelButton, input, content, file, fileInfo, fileName, fileSize, fileRemoveButton, empty, message. The CSS contains no var(--) custom properties. The doc comment states that only advanced mode is implemented. componentName is file-upload while the Aura registry key is fileupload.

## Public exports

@ultimate/react#UFileUpload
@ultimate/react/file-upload#UFileUpload
@ultimate/react#UFileUploadProps
@ultimate/react/file-upload#UFileUploadProps
@ultimate/react#UFileUploadSelectEvent
@ultimate/react/file-upload#UFileUploadSelectEvent
@ultimate/react#UFileUploadProgressEvent
@ultimate/react/file-upload#UFileUploadProgressEvent
@ultimate/react#UFileUploadEvent
@ultimate/react/file-upload#UFileUploadEvent
@ultimate/react#UFileUploadErrorEvent
@ultimate/react/file-upload#UFileUploadErrorEvent
@ultimate/react#UFileUploadRemoveEvent
@ultimate/react/file-upload#UFileUploadRemoveEvent
@ultimate/react#UFileUploadHandlerEvent
@ultimate/react/file-upload#UFileUploadHandlerEvent

## Owned source and evidence

packages/react/src/file-upload/index.ts
packages/react/src/file-upload/file-upload.tsx
packages/react/src/file-upload/file-upload-style.ts

```text
packages/react/src/file-upload/index.ts: export { UFileUpload } from
packages/react/src/file-upload/file-upload.tsx: export function UFileUpload({
packages/react/src/file-upload/file-upload.tsx: onUploadHandler?.({ files: currentFiles });
packages/react/src/file-upload/file-upload.tsx: if (event.lengthComputable) {
packages/react/src/file-upload/file-upload.tsx: function isFileTypeValid(file: File, accept: string): boolean {
packages/react/src/file-upload/file-upload-style.ts: export const fileUploadStyleModule
packages/themes/src/presets/aura/index.ts: fileupload: fileUpload,
packages/react/src/index.ts: export * from "./file-upload";
packages/react/package.json: "./file-upload": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.file-upload → [react.file-upload](react.file-upload.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)
package.ultimate.react.progress-bar (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product spec for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "e99d41249677496cf6c531576dd6e1c181544883",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
