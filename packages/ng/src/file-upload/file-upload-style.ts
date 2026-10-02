/**
 * Ultimate-owned adaptation of PrimeNG's `FileUploadStyle` (see
 * `.vendor-extracted/ng/fileupload/style/fileuploadstyle.ts`, sourced from
 * `@primeuix/styles/fileupload`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `select-style.ts`/`knob-style.ts`: no
 * `@ultimate/uix-styles/fileupload` subpath exists yet and this task may not
 * add one.
 */
const css = /*css*/ `
    .u-file-upload {
        display: flex;
        flex-direction: column;
    }

    .u-file-upload-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: dt('fileupload.header.padding');
    }

    .u-file-upload-choose-button,
    .u-file-upload-upload-button,
    .u-file-upload-cancel-button {
        cursor: pointer;
        border: 1px solid dt('fileupload.header.border.color');
        border-radius: dt('button.border.radius');
        padding: 0.5rem 1rem;
        background: dt('button.secondary.background');
    }

    .u-file-upload-choose-button.p-disabled,
    .u-file-upload-upload-button:disabled,
    .u-file-upload-cancel-button:disabled {
        opacity: 0.6;
        cursor: default;
    }

    .u-file-upload-input {
        display: none;
    }

    .u-file-upload-content {
        border: 1px dashed dt('fileupload.content.border.color');
        border-radius: dt('fileupload.content.border.radius');
        padding: 1rem;
        min-height: 6rem;
        transition: background dt('fileupload.transition.duration'), border-color dt('fileupload.transition.duration');
    }

    .u-file-upload-content.u-file-upload-highlight {
        border-color: dt('fileupload.content.highlight.border.color');
        background: dt('fileupload.content.highlight.background');
    }

    .u-file-upload .u-progress-bar {
        width: 100%;
        height: 0.25rem;
        margin-bottom: 0.75rem;
    }

    .u-file-upload-file {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: dt('fileupload.file.padding');
        border-bottom: 1px solid dt('fileupload.file.border.color');
    }

    .u-file-upload-file-thumbnail {
        width: 3rem;
        height: 3rem;
        object-fit: cover;
        border-radius: dt('fileupload.file.info.border.radius');
    }

    .u-file-upload-file-info {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .u-file-upload-file-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .u-file-upload-file-size {
        color: dt('fileupload.file.size.color');
        font-size: 0.85rem;
    }

    .u-file-upload-file-remove-button {
        cursor: pointer;
        border: 0 none;
        background: transparent;
        color: dt('fileupload.file.actions.color');
    }

    .u-file-upload-empty {
        color: dt('fileupload.content.color');
        text-align: center;
        padding: 1rem;
    }

    .u-file-upload-message {
        padding: 0.5rem;
        border-radius: dt('button.border.radius');
        background: dt('message.error.background');
        color: dt('message.error.color');
        margin-bottom: 0.5rem;
    }
`;

/** Params `UFileUpload` passes into `cx('content', params)`/`cx('chooseButton', params)`. */
export interface FileUploadClassesParams {
  disabled?: boolean;
  highlight?: boolean;
}

const classes = {
  root: "u-file-upload u-component",
  header: "u-file-upload-header",
  chooseButton: (params: FileUploadClassesParams = {}) => [
    "u-file-upload-choose-button",
    { "p-disabled": params.disabled },
  ],
  uploadButton: "u-file-upload-upload-button",
  cancelButton: "u-file-upload-cancel-button",
  input: "u-file-upload-input",
  content: (params: FileUploadClassesParams = {}) => [
    "u-file-upload-content",
    { "u-file-upload-highlight": params.highlight },
  ],
  file: "u-file-upload-file",
  fileThumbnail: "u-file-upload-file-thumbnail",
  fileInfo: "u-file-upload-file-info",
  fileName: "u-file-upload-file-name",
  fileSize: "u-file-upload-file-size",
  fileRemoveButton: "u-file-upload-file-remove-button",
  empty: "u-file-upload-empty",
  message: "u-file-upload-message",
};

/** `UBaseComponent`-shaped style module for `UFileUpload`. */
export const fileUploadStyleModule = { css, classes };
