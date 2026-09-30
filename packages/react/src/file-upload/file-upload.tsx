import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UProgressBar } from "../progress-bar/progress-bar";
import { fileUploadStyleModule } from "./file-upload-style";

export interface UFileUploadSelectEvent {
  originalEvent: React.SyntheticEvent;
  files: File[];
  currentFiles: File[];
}

export interface UFileUploadProgressEvent {
  originalEvent: ProgressEvent;
  progress: number;
}

export interface UFileUploadEvent {
  files: File[];
}

export interface UFileUploadErrorEvent {
  files: File[];
}

export interface UFileUploadRemoveEvent {
  originalEvent: React.SyntheticEvent;
  file: File;
}

export interface UFileUploadHandlerEvent {
  files: File[];
}

export interface UFileUploadProps {
  name?: string;
  url?: string;
  method?: "POST" | "PUT";
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  auto?: boolean;
  withCredentials?: boolean;
  maxFileSize?: number;
  fileLimit?: number;
  customUpload?: boolean;
  chooseLabel?: string;
  uploadLabel?: string;
  cancelLabel?: string;
  emptyMessage?: string;
  className?: string;
  onSelect?: (event: UFileUploadSelectEvent) => void;
  onProgress?: (event: UFileUploadProgressEvent) => void;
  onUpload?: (event: UFileUploadEvent) => void;
  onError?: (event: UFileUploadErrorEvent) => void;
  onClear?: () => void;
  onRemove?: (event: UFileUploadRemoveEvent) => void;
  onUploadHandler?: (event: UFileUploadHandlerEvent) => void;
}

function formatSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return `0 ${sizes[0]}`;
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = (bytes / Math.pow(k, i)).toFixed(2);
  return `${formatted} ${sizes[i] ?? sizes[sizes.length - 1]}`;
}

function isFileTypeValid(file: File, accept: string): boolean {
  const acceptableTypes = accept.split(",").map((type) => type.trim());
  return acceptableTypes.some((type) => {
    if (type.includes("*")) {
      const typeClass = type.substring(0, type.indexOf("/"));
      return file.type.startsWith(typeClass);
    }
    const extension = "." + file.name.split(".").pop();
    return file.type === type || extension.toLowerCase() === type.toLowerCase();
  });
}

/**
 * Ultimate-owned adaptation of PrimeReact's `FileUpload` (real source:
 * `components/lib/fileupload/FileUpload.js`/`FileUploadBase.js`, extracted
 * this session via `scripts/provenance/extract-primereact-source.mjs`).
 * Fully controlled surface for file-list *rendering*, but — matching real
 * source's own shape, confirmed against Angular's/Vue's real `FileUpload`
 * sources too (all 3 own a self-contained internal `files` list, not a
 * bindable form value) — the selected-file list is internal component state
 * driven by events (`onSelect`/`onRemove`/`onClear`), same no-shared-form-
 * state-base-class convention every sibling React component in this batch
 * follows for its own value shape.
 *
 * NOT overlay-based — real source renders an inline widget: a header
 * (choose/upload/cancel buttons) plus a drag-drop content zone listing
 * selected files, matching this batch's own classification of FileUpload as
 * an inline (non-overlay) capability.
 *
 * **Documented scope cut** (proof-by-exception, matching `UInputNumber`'s own
 * documented-cut precedent, same cut Angular's/Vue's `UFileUpload` document):
 * real source's full surface includes a `mode: 'advanced' | 'basic'` switch
 * (two structurally different widgets) and full `ButtonProps`/i18n-template
 * passthrough. This port implements only real source's own **advanced mode**
 * (the richer, default mode) — `basic` mode is NOT implemented. Upload
 * transport uses `XMLHttpRequest` directly, matching real source's own
 * `XMLHttpRequest`-based upload exactly (`xhr.upload.addEventListener(
 * 'progress', ...)`).
 */
export function UFileUpload({
  name = "files",
  url,
  method = "POST",
  multiple = false,
  accept,
  disabled = false,
  auto = false,
  withCredentials = false,
  maxFileSize,
  fileLimit,
  customUpload = false,
  chooseLabel = "Choose",
  uploadLabel = "Upload",
  cancelLabel = "Cancel",
  emptyMessage = "Drag and drop files here to upload.",
  className,
  onSelect,
  onProgress,
  onUpload,
  onError,
  onClear,
  onRemove,
  onUploadHandler,
}: UFileUploadProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "file-upload", styleModule: fileUploadStyleModule });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [highlight, setHighlight] = React.useState(false);
  const [messages, setMessages] = React.useState<string[]>([]);

  const clearInputElement = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const upload = React.useCallback(
    (currentFiles: File[]) => {
      if (currentFiles.length === 0) return;

      if (customUpload) {
        onUploadHandler?.({ files: currentFiles });
        return;
      }
      if (!url) return;

      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      for (const file of currentFiles) {
        formData.append(name, file, file.name);
      }

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const value = Math.round((event.loaded * 100) / event.total);
          setProgress(value);
          onProgress?.({ originalEvent: event, progress: value });
        }
      });
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        setUploading(false);
        setProgress(0);
        if (xhr.status >= 200 && xhr.status < 300) {
          onUpload?.({ files: currentFiles });
          setFiles([]);
          setMessages([]);
          clearInputElement();
          onClear?.();
        } else {
          onError?.({ files: currentFiles });
        }
      };
      xhr.open(method, url, true);
      xhr.withCredentials = withCredentials;
      xhr.send(formData);
    },
    [customUpload, onUploadHandler, url, name, onProgress, onUpload, onClear, onError, method, withCredentials]
  );

  const handleSelectedFiles = (fileList: FileList | null, event: React.SyntheticEvent) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const next = multiple ? [...files] : [];
    const validationMessages: string[] = [];

    for (const file of incoming) {
      const alreadySelected = next.some(
        (f) => f.name === file.name && f.type === file.type && f.size === file.size
      );
      if (alreadySelected) continue;

      if (maxFileSize !== undefined && file.size > maxFileSize) {
        validationMessages.push(`${file.name}: invalid file size, maximum upload size is ${formatSize(maxFileSize)}.`);
        continue;
      }
      if (accept && !isFileTypeValid(file, accept)) {
        validationMessages.push(`${file.name}: invalid file type, allowed file types: ${accept}.`);
        continue;
      }
      next.push(file);
    }

    if (fileLimit !== undefined && next.length > fileLimit) {
      validationMessages.push(`Maximum number of files exceeded, limit is ${fileLimit} at most.`);
      next.length = fileLimit;
    }

    setMessages(validationMessages);
    setFiles(next);
    onSelect?.({ originalEvent: event, files: incoming, currentFiles: next });
    clearInputElement();

    if (next.length > 0 && auto) {
      upload(next);
    }
  };

  const onChooseClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectedFiles(event.target.files, event);
  };

  const onDragEnter = (event: React.DragEvent) => {
    if (disabled) return;
    event.stopPropagation();
    event.preventDefault();
  };

  const onDragOver = (event: React.DragEvent) => {
    if (disabled) return;
    setHighlight(true);
    event.stopPropagation();
    event.preventDefault();
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (disabled) return;
    setHighlight(false);
    event.stopPropagation();
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent) => {
    if (disabled) return;
    setHighlight(false);
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer?.files ?? null;
    if (!fileList) return;
    const allowDrop = multiple || fileList.length === 1;
    if (allowDrop) {
      handleSelectedFiles(fileList, event);
    }
  };

  const clear = () => {
    setFiles([]);
    setMessages([]);
    clearInputElement();
    onClear?.();
  };

  const removeFile = (event: React.SyntheticEvent, index: number) => {
    const removed = files[index];
    setFiles((current) => current.filter((_, i) => i !== index));
    clearInputElement();
    if (removed) {
      onRemove?.({ originalEvent: event, file: removed });
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className={[cx("root"), className].filter(Boolean).join(" ")}>
      <div className={cx("header")}>
        <button type="button" className={cx("chooseButton")} disabled={disabled} onClick={onChooseClick}>
          {chooseLabel}
        </button>
        {!auto && (
          <>
            <button
              type="button"
              className={cx("uploadButton")}
              disabled={!hasFiles || uploading}
              onClick={() => upload(files)}
            >
              {uploadLabel}
            </button>
            <button type="button" className={cx("cancelButton")} disabled={!hasFiles} onClick={clear}>
              {cancelLabel}
            </button>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className={cx("input")}
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          onChange={onFileInputChange}
        />
      </div>
      {uploading && <UProgressBar value={progress} showValue={false} />}
      {messages.map((msg) => (
        <div key={msg} className={cx("message")}>
          {msg}
        </div>
      ))}
      <div
        className={cx("content", { highlight })}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {!hasFiles && <div className={cx("empty")}>{emptyMessage}</div>}
        {files.map((file, index) => (
          <div key={`${file.name}-${file.size}-${index}`} className={cx("file")}>
            <div className={cx("fileInfo")}>
              <div className={cx("fileName")}>{file.name}</div>
              <span className={cx("fileSize")}>{formatSize(file.size)}</span>
            </div>
            <button
              type="button"
              className={cx("fileRemoveButton")}
              aria-label="Remove file"
              onClick={(event) => removeFile(event, index)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
