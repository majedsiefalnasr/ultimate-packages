import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UFileUpload } from "./index";
import { fileUploadStyleModule } from "./file-upload-style";

function makeFile(name: string, size: number, type = "text/plain"): File {
  return new File([new Uint8Array(size)], name, { type });
}

function makeFileList(files: File[]): FileList {
  const list: Record<string, unknown> = {
    length: files.length,
    item: (index: number) => files[index] ?? null,
  };
  files.forEach((file, index) => {
    list[index] = file;
  });
  return list as unknown as FileList;
}

function setInputFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", { value: makeFileList(files), configurable: true });
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
    const wrapper = mount(UFileUpload, { props: { url: "/upload" } });
    expect(wrapper.find(".u-file-upload-choose-button").exists()).toBe(true);
    expect(wrapper.find(".u-file-upload-upload-button").exists()).toBe(true);
    expect(wrapper.find(".u-file-upload-empty").text()).toContain("Drag and drop");
  });

  it("selecting a file via the native input adds it to the file list and emits select", async () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload" } });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    setInputFiles(input, [makeFile("a.txt", 100)]);
    await wrapper.find('input[type="file"]').trigger("change");

    const fileRows = wrapper.findAll(".u-file-upload-file");
    expect(fileRows.length).toBe(1);
    expect(fileRows[0].text()).toContain("a.txt");
    expect(wrapper.emitted("select")).toBeTruthy();
  });

  it("dropping files onto the content zone adds them (drag-drop)", async () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload", multiple: true } });
    const content = wrapper.find(".u-file-upload-content");
    await content.trigger("drop", { dataTransfer: { files: makeFileList([makeFile("dropped.png", 2048, "image/png")]) } });

    const fileRows = wrapper.findAll(".u-file-upload-file");
    expect(fileRows.length).toBe(1);
    expect(fileRows[0].text()).toContain("dropped.png");
  });

  it("removing a file via its remove button emits remove and updates the list", async () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload" } });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    setInputFiles(input, [makeFile("a.txt", 100)]);
    await wrapper.find('input[type="file"]').trigger("change");
    expect(wrapper.findAll(".u-file-upload-file").length).toBe(1);

    await wrapper.find(".u-file-upload-file-remove-button").trigger("click");
    expect(wrapper.findAll(".u-file-upload-file").length).toBe(0);
    expect(wrapper.emitted("remove")).toBeTruthy();
  });

  it("clear() (via the Cancel button) resets the file list and emits clear", async () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload", multiple: true } });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    setInputFiles(input, [makeFile("a.txt", 100), makeFile("b.txt", 200)]);
    await wrapper.find('input[type="file"]').trigger("change");
    expect(wrapper.findAll(".u-file-upload-file").length).toBe(2);

    await wrapper.find(".u-file-upload-cancel-button").trigger("click");
    expect(wrapper.findAll(".u-file-upload-file").length).toBe(0);
    expect(wrapper.emitted("clear")).toBeTruthy();
  });

  it("rejects a file exceeding maxFileSize with a validation message, not added to the list", async () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload", maxFileSize: 10 } });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    setInputFiles(input, [makeFile("big.txt", 1000)]);
    await wrapper.find('input[type="file"]').trigger("change");

    expect(wrapper.findAll(".u-file-upload-file").length).toBe(0);
    expect(wrapper.find(".u-file-upload-message").text()).toContain("invalid file size");
  });

  it("disabled state prevents choosing files", () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload", disabled: true } });
    const fileInput = wrapper.find('input[type="file"]').element as HTMLInputElement;
    expect(fileInput.disabled).toBe(true);
    const chooseButton = wrapper.find(".u-file-upload-choose-button").element as HTMLButtonElement;
    expect(chooseButton.disabled).toBe(true);
  });

  it("uploads selected files via XHR and reports progress, then emits upload on success", async () => {
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

    const wrapper = mount(UFileUpload, { props: { url: "/upload", auto: true } });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    setInputFiles(input, [makeFile("a.txt", 100)]);
    await wrapper.find('input[type="file"]').trigger("change");

    expect(wrapper.emitted("progress")).toBeTruthy();
    expect(wrapper.emitted("upload")).toBeTruthy();
  });

  it("customUpload defers to upload-handler instead of XHR", async () => {
    const wrapper = mount(UFileUpload, { props: { url: "/upload", customUpload: true, auto: true } });
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    setInputFiles(input, [makeFile("a.txt", 100)]);
    await wrapper.find('input[type="file"]').trigger("change");

    expect(wrapper.emitted("upload-handler")).toBeTruthy();
    const payload = wrapper.emitted("upload-handler")?.[0][0] as { files: File[] };
    expect(payload.files.length).toBe(1);
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

    it("renders a role=progressbar element with the current progress as aria-valuenow while uploading", async () => {
      globalThis.XMLHttpRequest = InFlightXhr as unknown as typeof XMLHttpRequest;
      const wrapper = mount(UFileUpload, { props: { url: "/upload", auto: true } });
      const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
      setInputFiles(input, [makeFile("a.txt", 100)]);
      await wrapper.find('input[type="file"]').trigger("change");

      const bar = wrapper.find("[role=progressbar]");
      expect(bar.exists()).toBe(true);
      expect(bar.attributes("aria-valuenow")).toBe("42");
    });

    it("renders no progressbar when not uploading", () => {
      const wrapper = mount(UFileUpload, { props: { url: "/upload" } });
      expect(wrapper.find("[role=progressbar]").exists()).toBe(false);
    });

    it("scopes the composed progress bar to Prime's thin FileUpload height", () => {
      const css = fileUploadStyleModule.css.replace(/\s+/g, " ");
      expect(css).toContain(".u-file-upload .u-progress-bar { width: 100%; height: 0.25rem;");
      expect(css).not.toContain("u-file-upload-progress-bar");
    });
  });
});
