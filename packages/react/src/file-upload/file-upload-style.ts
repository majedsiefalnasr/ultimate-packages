import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `select-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do).
 */
const css = /*css*/ `
.u-file-upload { display: flex; flex-direction: column; }
.u-file-upload-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.u-file-upload-choose-button, .u-file-upload-upload-button, .u-file-upload-cancel-button {
  cursor: pointer; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem 1rem; background: #f3f4f6;
}
.u-file-upload-choose-button:disabled, .u-file-upload-upload-button:disabled, .u-file-upload-cancel-button:disabled {
  opacity: 0.6; cursor: default;
}
.u-file-upload-input { display: none; }
.u-file-upload-content { border: 1px dashed #d1d5db; border-radius: 6px; padding: 1rem; min-height: 6rem; transition: background 0.2s, border-color 0.2s; }
.u-file-upload-content-highlight { border-color: #6366f1; background: #eef2ff; }
.u-file-upload .u-progress-bar { width: 100%; height: 0.25rem; margin-bottom: 0.75rem; }
.u-file-upload-file { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; }
.u-file-upload-file-info { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.u-file-upload-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.u-file-upload-file-size { color: #6b7280; font-size: 0.85rem; }
.u-file-upload-file-remove-button { cursor: pointer; border: 0 none; background: transparent; font-size: 1rem; }
.u-file-upload-empty { color: #6b7280; text-align: center; padding: 1rem; }
.u-file-upload-message { padding: 0.5rem; border-radius: 6px; background: #fee2e2; color: #b91c1c; margin-bottom: 0.5rem; }
`;

export interface FileUploadClassesParams {
  disabled?: boolean;
  highlight?: boolean;
}

const classes = {
  root: "u-file-upload u-component",
  header: "u-file-upload-header",
  chooseButton: "u-file-upload-choose-button",
  uploadButton: "u-file-upload-upload-button",
  cancelButton: "u-file-upload-cancel-button",
  input: "u-file-upload-input",
  content: (params: FileUploadClassesParams = {}) => [
    "u-file-upload-content",
    { "u-file-upload-content-highlight": Boolean(params.highlight) },
  ],
  file: "u-file-upload-file",
  fileInfo: "u-file-upload-file-info",
  fileName: "u-file-upload-file-name",
  fileSize: "u-file-upload-file-size",
  fileRemoveButton: "u-file-upload-file-remove-button",
  empty: "u-file-upload-empty",
  message: "u-file-upload-message",
};

export const fileUploadStyleModule: StyleModule = { css, classes };
