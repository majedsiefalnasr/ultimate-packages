import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  booleanAttribute,
  numberAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UProgressBar } from "@ultimate/ng/progress-bar";
import { fileUploadStyleModule } from "./file-upload-style";

export interface UFileUploadSelectEvent {
  originalEvent: Event;
  files: File[];
  currentFiles: File[];
}

export interface UFileUploadProgressEvent {
  originalEvent: ProgressEvent;
  progress: number;
}

export interface UFileUploadEvent {
  originalEvent: Event;
  files: File[];
}

export interface UFileUploadErrorEvent {
  originalEvent: Event;
  files: File[];
}

export interface UFileUploadRemoveEvent {
  originalEvent: Event;
  file: File;
}

export interface UFileUploadHandlerEvent {
  files: File[];
}

/**
 * Ultimate-owned adaptation of PrimeNG's `FileUpload` component (see
 * `.vendor-extracted/ng/fileupload/fileupload.ts`). Real source extends
 * `BaseComponent<FileUploadPassThrough>` — confirmed against `export class
 * FileUpload extends BaseComponent<...> implements BlockableUI` — NOT
 * `BaseEditableHolder`/`BaseInput`: FileUpload owns no CVA-bindable single
 * value (`v-model`/`ngModel`), matching real source's own shape (it manages
 * a self-contained `files: File[]` list via events, not a form-control
 * value) — same tier `UKnob`/`URating` extend for their own non-editable-
 * value reasons, though FileUpload's own reason (no bindable scalar value at
 * all) differs from Knob/Rating's (editable value, but no `UBaseInput`-tier
 * config surface needed).
 *
 * NOT overlay-based — real source renders an inline widget: a header (choose/
 * upload/cancel buttons) plus a drag-drop content zone listing selected
 * files, matching this batch's own classification of FileUpload as an inline
 * (non-overlay) capability.
 *
 * **Documented scope cut** (proof-by-exception, matching `UInputNumber`'s own
 * documented-cut precedent): real source's full surface includes a `mode:
 * 'advanced' | 'basic'` switch (two structurally different widgets), IE11
 * `duplicateIEEvent`/`MSInputMethodContext` compatibility branches, full
 * `ButtonProps` passthrough on the choose/upload/cancel buttons, and
 * per-message i18n template strings (`invalidFileSizeMessageSummary`, etc).
 * This port implements only real source's own **`advanced` mode** (the
 * richer, default mode) — `basic` mode (a single native `<input>` styled as
 * a button, no file-list/progress UI) is NOT implemented, matching the same
 * "smaller surface than upstream" precedent every sibling component in this
 * batch draws. Upload transport uses `XMLHttpRequest` directly (matching
 * real PrimeReact's/PrimeVue's own `XMLHttpRequest`-based upload — Angular's
 * own real source is the outlier using `HttpClient`, which this port avoids
 * to keep zero extra DI/module dependency and identical behavior across all
 * 3 frameworks in this batch, consistent with Option B: reference, not
 * verbatim). Validation messages are plain English strings, not i18n
 * templates.
 */
@Component({
  standalone: true,
  selector: "u-file-upload",
  imports: [UProgressBar],
  template: `
    <div [class]="cx('header')">
      <button
        type="button"
        [class]="cx('chooseButton', headerClassesParams())"
        [attr.disabled]="disabled() ? '' : undefined"
        (click)="onChooseClick()"
      >{{ chooseLabel() }}</button>
      @if (!auto()) {
        <button
          type="button"
          [class]="cx('uploadButton')"
          [disabled]="!hasFiles() || uploading()"
          (click)="upload()"
        >{{ uploadLabel() }}</button>
        <button
          type="button"
          [class]="cx('cancelButton')"
          [disabled]="!hasFiles()"
          (click)="clear()"
        >{{ cancelLabel() }}</button>
      }
      <input
        #fileInput
        type="file"
        [class]="cx('input')"
        [attr.multiple]="multiple() ? '' : undefined"
        [attr.accept]="accept()"
        [attr.disabled]="disabled() ? '' : undefined"
        (change)="onFileInputChange($event)"
      />
    </div>
    @if (uploading()) {
      <u-progress-bar [value]="progress()" [showValue]="false" />
    }
    @for (msg of messages(); track msg) {
      <div [class]="cx('message')">{{ msg }}</div>
    }
    <div
      #content
      [class]="cx('content', contentClassesParams())"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      @if (!hasFiles()) {
        <div [class]="cx('empty')">{{ emptyMessage() }}</div>
      }
      @for (file of files(); track file.name + '-' + file.size + '-' + $index; let index = $index) {
        <div [class]="cx('file')">
          <div [class]="cx('fileInfo')">
            <div [class]="cx('fileName')">{{ file.name }}</div>
            <span [class]="cx('fileSize')">{{ formatSize(file.size) }}</span>
          </div>
          <button
            type="button"
            [class]="cx('fileRemoveButton')"
            aria-label="Remove file"
            (click)="remove($event, index)"
          >&times;</button>
        </div>
      }
    </div>
  `,
  host: {
    "[class]": "cx('root')",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UFileUpload extends UBaseComponent {
  protected override readonly componentName = "file-upload";
  protected override readonly styleModule = fileUploadStyleModule;

  @ViewChild("fileInput") private readonly fileInputRef?: ElementRef<HTMLInputElement>;

  /** Form field name used in the multipart upload request. */
  name = input<string>();
  /** Upload endpoint URL. */
  url = input<string>();
  /** HTTP method used when uploading. */
  method = input<"POST" | "PUT">("POST");
  /** Whether multiple files can be selected/uploaded at once. */
  multiple = input(false, { transform: booleanAttribute });
  /** Comma-separated list of accepted file types (`<input accept>` syntax). */
  accept = input<string>();
  /** Whether the whole widget is disabled. */
  disabled = input(false, { transform: booleanAttribute });
  /** Whether to upload automatically once files are selected. */
  auto = input(false, { transform: booleanAttribute });
  /** Whether to send credentials (cookies) with the upload request. */
  withCredentials = input(false, { transform: booleanAttribute });
  /** Maximum individual file size, in bytes. */
  maxFileSize = input<number | undefined>(undefined, { transform: numberAttribute });
  /** Maximum number of files allowed. */
  fileLimit = input<number | undefined>(undefined, { transform: numberAttribute });
  /** Whether the default XHR upload is bypassed in favor of `uploadHandler`. */
  customUpload = input(false, { transform: booleanAttribute });
  /** Label for the choose-files button. */
  chooseLabel = input("Choose");
  /** Label for the upload button. */
  uploadLabel = input("Upload");
  /** Label for the cancel/clear button. */
  cancelLabel = input("Cancel");
  /** Message shown in the drop zone when no files are selected. */
  emptyMessage = input("Drag and drop files here to upload.");

  /** Callback to invoke when files are selected (via picker or drag-drop). */
  onSelect = output<UFileUploadSelectEvent>();
  /** Callback to invoke on upload progress (default XHR upload only). */
  onProgress = output<UFileUploadProgressEvent>();
  /** Callback to invoke when the upload succeeds. */
  onUpload = output<UFileUploadEvent>();
  /** Callback to invoke when the upload fails. */
  onError = output<UFileUploadErrorEvent>();
  /** Callback to invoke when the file list is cleared. */
  onClear = output<void>();
  /** Callback to invoke when a single file is removed. */
  onRemove = output<UFileUploadRemoveEvent>();
  /** Callback to invoke instead of the default XHR upload when `customUpload` is set. */
  uploadHandler = output<UFileUploadHandlerEvent>();

  protected readonly files = signal<File[]>([]);
  protected readonly uploading = signal(false);
  protected readonly progress = signal(0);
  protected readonly dragHighlight = signal(false);
  protected readonly messages = signal<string[]>([]);

  protected readonly hasFiles = computed(() => this.files().length > 0);

  protected headerClassesParams() {
    return { disabled: this.disabled() };
  }

  protected contentClassesParams() {
    return { highlight: this.dragHighlight() };
  }

  formatSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return `0 ${sizes[0]}`;
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = (bytes / Math.pow(k, i)).toFixed(2);
    return `${formatted} ${sizes[i] ?? sizes[sizes.length - 1]}`;
  }

  protected onChooseClick(): void {
    if (this.disabled()) return;
    this.fileInputRef?.nativeElement.click();
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleSelectedFiles(input.files, event);
  }

  protected onDragEnter(event: DragEvent): void {
    if (this.disabled()) return;
    event.stopPropagation();
    event.preventDefault();
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) return;
    this.dragHighlight.set(true);
    event.stopPropagation();
    event.preventDefault();
  }

  protected onDragLeave(event: DragEvent): void {
    if (this.disabled()) return;
    this.dragHighlight.set(false);
    event.stopPropagation();
    event.preventDefault();
  }

  protected onDrop(event: DragEvent): void {
    if (this.disabled()) return;
    this.dragHighlight.set(false);
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer?.files ?? null;
    if (!fileList) return;
    const allowDrop = this.multiple() || fileList.length === 1;
    if (allowDrop) {
      this.handleSelectedFiles(fileList, event);
    }
  }

  private handleSelectedFiles(fileList: FileList | null, event: Event): void {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const next = this.multiple() ? [...this.files()] : [];
    const validationMessages: string[] = [];

    for (const file of incoming) {
      const alreadySelected = next.some(
        (f) => f.name === file.name && f.type === file.type && f.size === file.size
      );
      if (alreadySelected) continue;

      const maxFileSize = this.maxFileSize();
      if (maxFileSize !== undefined && file.size > maxFileSize) {
        validationMessages.push(`${file.name}: invalid file size, maximum upload size is ${this.formatSize(maxFileSize)}.`);
        continue;
      }
      const accept = this.accept();
      if (accept && !this.isFileTypeValid(file, accept)) {
        validationMessages.push(`${file.name}: invalid file type, allowed file types: ${accept}.`);
        continue;
      }
      next.push(file);
    }

    const fileLimit = this.fileLimit();
    if (fileLimit !== undefined && next.length > fileLimit) {
      validationMessages.push(`Maximum number of files exceeded, limit is ${fileLimit} at most.`);
      next.length = fileLimit;
    }

    this.messages.set(validationMessages);
    this.files.set(next);
    this.onSelect.emit({ originalEvent: event, files: incoming, currentFiles: next });
    this.clearInputElement();

    if (this.hasFiles() && this.auto()) {
      this.upload();
    }
  }

  private isFileTypeValid(file: File, accept: string): boolean {
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

  private clearInputElement(): void {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = "";
    }
  }

  upload(): void {
    if (!this.hasFiles()) return;

    if (this.customUpload()) {
      this.uploadHandler.emit({ files: this.files() });
      return;
    }

    const url = this.url();
    if (!url) return;

    this.uploading.set(true);
    this.progress.set(0);

    const formData = new FormData();
    const fieldName = this.name() ?? "files";
    for (const file of this.files()) {
      formData.append(fieldName, file, file.name);
    }

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const value = Math.round((event.loaded * 100) / event.total);
        this.progress.set(value);
        this.onProgress.emit({ originalEvent: event, progress: value });
      }
    });
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      this.uploading.set(false);
      this.progress.set(0);
      const uploadedFiles = this.files();
      if (xhr.status >= 200 && xhr.status < 300) {
        this.onUpload.emit({ originalEvent: new Event("upload"), files: uploadedFiles });
        this.clear();
      } else {
        this.onError.emit({ originalEvent: new Event("error"), files: uploadedFiles });
      }
    };
    xhr.open(this.method(), url, true);
    xhr.withCredentials = this.withCredentials();
    xhr.send(formData);
  }

  clear(): void {
    this.files.set([]);
    this.messages.set([]);
    this.clearInputElement();
    this.onClear.emit();
  }

  remove(event: Event, index: number): void {
    const removed = this.files()[index];
    this.files.update((current) => current.filter((_, i) => i !== index));
    this.clearInputElement();
    if (removed) {
      this.onRemove.emit({ originalEvent: event, file: removed });
    }
  }
}
