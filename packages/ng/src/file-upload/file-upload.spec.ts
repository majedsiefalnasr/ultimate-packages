import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UFileUpload } from "./file-upload";

function makeFile(name: string, size: number, type = "text/plain"): File {
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
}

function makeFileList(files: File[]): FileList {
  const list = {
    length: files.length,
    item: (index: number) => files[index] ?? null,
    [Symbol.iterator]: function* () {
      yield* files;
    },
  };
  files.forEach((file, index) => {
    (list as unknown as Record<number, File>)[index] = file;
  });
  return list as unknown as FileList;
}

function setInputFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: makeFileList(files), configurable: true });
}

function makeDropEvent(files: File[]): DragEvent {
  const event = new Event("drop", { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, "dataTransfer", { value: { files: makeFileList(files) } });
  return event;
}

describe("UFileUpload", () => {
  let originalXhr: typeof XMLHttpRequest;

  beforeEach(() => {
    originalXhr = globalThis.XMLHttpRequest;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXhr;
  });

  it("renders choose/upload/cancel buttons and an empty drop zone message", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector(".u-file-upload-choose-button")).not.toBeNull();
    expect(root.querySelector(".u-file-upload-upload-button")).not.toBeNull();
    expect(root.querySelector(".u-file-upload-empty")?.textContent).toContain("Drag and drop");
  });

  it("selecting a file via the native input adds it to the file list and fires onSelect", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" (onSelect)="onSelect($event)" />`,
    })
    class HostComponent {
      selected: unknown;
      onSelect(event: unknown) {
        this.selected = event;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, [makeFile("a.txt", 100)]);
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    const fileRows = fixture.nativeElement.querySelectorAll(".u-file-upload-file");
    expect(fileRows.length).toBe(1);
    expect(fileRows[0].textContent).toContain("a.txt");
    expect(fixture.componentInstance.selected).toBeDefined();
  });

  it("dropping files onto the content zone adds them (drag-drop)", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" [multiple]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const content: HTMLElement = fixture.nativeElement.querySelector(".u-file-upload-content");
    content.dispatchEvent(makeDropEvent([makeFile("dropped.png", 2048, "image/png")]));
    fixture.detectChanges();

    const fileRows = fixture.nativeElement.querySelectorAll(".u-file-upload-file");
    expect(fileRows.length).toBe(1);
    expect(fileRows[0].textContent).toContain("dropped.png");
  });

  it("removing a file via its remove button emits onRemove and updates the list", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" (onRemove)="onRemove($event)" />`,
    })
    class HostComponent {
      removed: unknown;
      onRemove(event: unknown) {
        this.removed = event;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, [makeFile("a.txt", 100)]);
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    const removeButton: HTMLElement = fixture.nativeElement.querySelector(".u-file-upload-file-remove-button");
    removeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll(".u-file-upload-file").length).toBe(0);
    expect(fixture.componentInstance.removed).toBeDefined();
  });

  it("clear() resets the file list and emits onClear", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" [multiple]="true" (onClear)="onClear()" />`,
    })
    class HostComponent {
      cleared = false;
      onClear() {
        this.cleared = true;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, [makeFile("a.txt", 100), makeFile("b.txt", 200)]);
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-file-upload-file").length).toBe(2);

    const cancelButton: HTMLElement = fixture.nativeElement.querySelector(".u-file-upload-cancel-button");
    cancelButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll(".u-file-upload-file").length).toBe(0);
    expect(fixture.componentInstance.cleared).toBe(true);
  });

  it("rejects a file exceeding maxFileSize with a validation message, not added to the list", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" [maxFileSize]="10" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, [makeFile("big.txt", 1000)]);
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll(".u-file-upload-file").length).toBe(0);
    expect(fixture.nativeElement.querySelector(".u-file-upload-message")?.textContent).toContain(
      "invalid file size"
    );
  });

  it("disabled state prevents choosing files", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" [disabled]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const fileInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    expect(fileInput.disabled).toBe(true);
    const chooseButton: HTMLButtonElement = fixture.nativeElement.querySelector(".u-file-upload-choose-button");
    expect(chooseButton.disabled).toBe(true);
  });

  it("uploads selected files via XHR and reports progress, then emits onUpload on success", () => {
    class FakeXhr {
      static instances: FakeXhr[] = [];
      upload = { addEventListener: vi.fn((_type: string, handler: (event: ProgressEvent) => void) => {
        this.progressHandler = handler;
      }) };
      progressHandler: ((event: ProgressEvent) => void) | null = null;
      onreadystatechange: (() => void) | null = null;
      readyState = 0;
      status = 200;
      open = vi.fn();
      send = vi.fn(() => {
        this.progressHandler?.({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent);
        this.readyState = 4;
        this.onreadystatechange?.();
      });
      withCredentials = false;
      constructor() {
        FakeXhr.instances.push(this);
      }
    }
    globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;

    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" [auto]="true" (onUpload)="onUpload($event)" (onProgress)="onProgress($event)" />`,
    })
    class HostComponent {
      uploaded: unknown;
      progressEvents: unknown[] = [];
      onUpload(event: unknown) {
        this.uploaded = event;
      }
      onProgress(event: unknown) {
        this.progressEvents.push(event);
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, [makeFile("a.txt", 100)]);
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    expect(fixture.componentInstance.progressEvents.length).toBe(1);
    expect(fixture.componentInstance.uploaded).toBeDefined();
  });

  it("customUpload defers to uploadHandler instead of XHR", () => {
    @Component({
      standalone: true,
      imports: [UFileUpload],
      template: `<u-file-upload url="/upload" [customUpload]="true" [auto]="true" (uploadHandler)="onHandler($event)" />`,
    })
    class HostComponent {
      handled: unknown;
      onHandler(event: unknown) {
        this.handled = event;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    setInputFiles(input, [makeFile("a.txt", 100)]);
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();

    expect(fixture.componentInstance.handled).toEqual({ files: expect.any(Array) });
  });
});
