import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UFileUpload } from "./file-upload";
import { fileUploadStyleModule } from "./file-upload-style";

function makeFile(name: string, size: number, type = "text/plain"): File {
  return new File([new Uint8Array(size)], name, { type });
}

function fireDrop(element: Element, files: File[]) {
  const dataTransfer = { files } as unknown as DataTransfer;
  fireEvent.drop(element, { dataTransfer });
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
    render(<UFileUpload url="/upload" />);
    expect(screen.getByText("Choose")).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop/)).toBeInTheDocument();
  });

  it("selecting a file via the native input adds it to the file list and fires onSelect", () => {
    const onSelect = vi.fn();
    const { container } = render(<UFileUpload url="/upload" onSelect={onSelect} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.txt", 100)] } });

    expect(screen.getByText("a.txt")).toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("dropping files onto the content zone adds them (drag-drop)", () => {
    const { container } = render(<UFileUpload url="/upload" multiple />);
    const content = container.querySelector(".u-file-upload-content") as HTMLElement;
    fireDrop(content, [makeFile("dropped.png", 2048, "image/png")]);

    expect(screen.getByText("dropped.png")).toBeInTheDocument();
  });

  it("removing a file via its remove button fires onRemove and updates the list", () => {
    const onRemove = vi.fn();
    const { container } = render(<UFileUpload url="/upload" onRemove={onRemove} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.txt", 100)] } });
    expect(screen.getByText("a.txt")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Remove file"));
    expect(screen.queryByText("a.txt")).toBeNull();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("clear() (via the Cancel button) resets the file list and fires onClear", () => {
    const onClear = vi.fn();
    const { container } = render(<UFileUpload url="/upload" multiple onClear={onClear} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.txt", 100), makeFile("b.txt", 200)] } });
    expect(screen.getByText("a.txt")).toBeInTheDocument();
    expect(screen.getByText("b.txt")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("a.txt")).toBeNull();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("rejects a file exceeding maxFileSize with a validation message, not added to the list", () => {
    const { container } = render(<UFileUpload url="/upload" maxFileSize={10} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("big.txt", 1000)] } });

    expect(screen.queryByText("big.txt")).toBeNull();
    expect(screen.getByText(/invalid file size/)).toBeInTheDocument();
  });

  it("disabled state prevents choosing files", () => {
    const { container } = render(<UFileUpload url="/upload" disabled />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.disabled).toBe(true);
    expect((screen.getByText("Choose") as HTMLButtonElement).disabled).toBe(true);
  });

  it("uploads selected files via XHR and reports progress, then fires onUpload on success", () => {
    class FakeXhr {
      upload = {
        addEventListener: vi.fn((_type: string, handler: (event: ProgressEvent) => void) => {
          this.progressHandler = handler;
        }),
      };
      progressHandler: ((event: ProgressEvent) => void) | null = null;
      onreadystatechange: (() => void) | null = null;
      readyState = 0;
      status = 200;
      open = vi.fn();
      withCredentials = false;
      send = vi.fn(() => {
        this.progressHandler?.({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent);
        this.readyState = 4;
        this.onreadystatechange?.();
      });
    }
    globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;

    const onUpload = vi.fn();
    const onProgress = vi.fn();
    const { container } = render(
      <UFileUpload url="/upload" auto onUpload={onUpload} onProgress={onProgress} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.txt", 100)] } });

    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it("customUpload defers to onUploadHandler instead of XHR", () => {
    const onUploadHandler = vi.fn();
    const { container } = render(
      <UFileUpload url="/upload" customUpload auto onUploadHandler={onUploadHandler} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.txt", 100)] } });

    expect(onUploadHandler).toHaveBeenCalledWith({ files: expect.any(Array) });
  });
  describe("progress ARIA via UProgressBar composition (Spec §5.2, GAP-060)", () => {
    class InFlightXhr {
      upload = {
        addEventListener: (_type: string, handler: (event: ProgressEvent) => void) => {
          this.progressHandler = handler;
        },
      };
      progressHandler: ((event: ProgressEvent) => void) | null = null;
      onreadystatechange: (() => void) | null = null;
      readyState = 0;
      status = 200;
      withCredentials = false;
      open = vi.fn();
      send = vi.fn(() => {
        this.progressHandler?.({ lengthComputable: true, loaded: 42, total: 100 } as ProgressEvent);
      });
    }

    it("renders a role=progressbar element with the current progress as aria-valuenow while uploading", () => {
      globalThis.XMLHttpRequest = InFlightXhr as unknown as typeof XMLHttpRequest;
      const { container } = render(<UFileUpload url="/upload" auto />);
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [makeFile("a.txt", 100)] } });

      const bar = container.querySelector("[role=progressbar]");
      expect(bar).toBeTruthy();
      expect(bar?.getAttribute("aria-valuenow")).toBe("42");
    });

    it("renders no progressbar when not uploading", () => {
      const { container } = render(<UFileUpload url="/upload" />);
      expect(container.querySelector("[role=progressbar]")).toBeNull();
    });

    it("scopes the composed progress bar to Prime's thin FileUpload height", () => {
      const css = fileUploadStyleModule.css.replace(/\s+/g, " ");
      expect(css).toContain(".u-file-upload .u-progress-bar { width: 100%; height: 0.25rem;");
      expect(css).not.toContain("u-file-upload-progress-bar");
    });
  });
});
