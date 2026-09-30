<template>
  <div :class="cx('root')">
    <div :class="cx('header')">
      <button type="button" :class="cx('chooseButton', { disabled })" :disabled="disabled" @click="onChooseClick">
        {{ chooseLabel }}
      </button>
      <template v-if="!auto">
        <button type="button" :class="cx('uploadButton')" :disabled="!hasFiles || uploading" @click="upload">
          {{ uploadLabel }}
        </button>
        <button type="button" :class="cx('cancelButton')" :disabled="!hasFiles" @click="clear">
          {{ cancelLabel }}
        </button>
      </template>
      <input
        ref="fileInput"
        type="file"
        :class="cx('input')"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        @change="onFileInputChange"
      />
    </div>
    <UProgressBar v-if="uploading" :value="progress" :showValue="false" />
    <div v-for="msg in messages" :key="msg" :class="cx('message')">{{ msg }}</div>
    <div
      ref="content"
      :class="cx('content', { highlight })"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div v-if="!hasFiles" :class="cx('empty')">{{ emptyMessage }}</div>
      <div v-for="(file, index) in files" :key="`${file.name}-${file.size}-${index}`" :class="cx('file')">
        <div :class="cx('fileInfo')">
          <div :class="cx('fileName')">{{ file.name }}</div>
          <span :class="cx('fileSize')">{{ formatSize(file.size) }}</span>
        </div>
        <button type="button" :class="cx('fileRemoveButton')" aria-label="Remove file" @click="remove($event, index)">&times;</button>
      </div>
    </div>
  </div>
</template>

<script>
import UProgressBar from "../progress-bar/ProgressBar.vue";
import { createBaseFileUpload } from "./BaseFileUpload";

function formatSize(bytes) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return `0 ${sizes[0]}`;
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formatted = (bytes / Math.pow(k, i)).toFixed(2);
  return `${formatted} ${sizes[i] ?? sizes[sizes.length - 1]}`;
}

function isFileTypeValid(file, accept) {
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

// Real PrimeVue FileUpload (.vendor-extracted/vue/fileupload/FileUpload.vue)
// renders a header (choose/upload/cancel buttons) plus a drag-drop content
// zone listing selected files with a progress bar — NOT overlay-based,
// matching this batch's own classification of FileUpload as an inline
// (non-overlay) capability.
//
// Documented scope cut (proof-by-exception, matching UInputNumber's own
// documented-cut precedent, same cut Angular's/React's UFileUpload
// document): real source's full surface includes a `mode: 'advanced' |
// 'basic'` switch (two structurally different widgets) and full
// slot-template/passthrough surface. This port implements only real
// source's own advanced mode (the richer, default mode) — basic mode is
// NOT implemented. Upload transport uses XMLHttpRequest directly, matching
// real source's own XMLHttpRequest-based upload exactly
// (xhr.upload.addEventListener('progress', ...)).
export default {
  name: "UFileUpload",
  extends: createBaseFileUpload(),
  emits: ["select", "progress", "upload", "error", "clear", "remove", "upload-handler"],
  components: { UProgressBar },
  data() {
    return {
      files: [],
      uploading: false,
      progress: 0,
      highlight: false,
      messages: [],
    };
  },
  computed: {
    hasFiles() {
      return this.files.length > 0;
    },
  },
  methods: {
    formatSize,
    onChooseClick() {
      if (this.disabled) return;
      this.$refs.fileInput?.click();
    },
    onFileInputChange(event) {
      this.handleSelectedFiles(event.target.files, event);
    },
    onDragEnter(event) {
      if (this.disabled) return;
      event.stopPropagation();
      event.preventDefault();
    },
    onDragOver(event) {
      if (this.disabled) return;
      this.highlight = true;
      event.stopPropagation();
      event.preventDefault();
    },
    onDragLeave(event) {
      if (this.disabled) return;
      this.highlight = false;
      event.stopPropagation();
      event.preventDefault();
    },
    onDrop(event) {
      if (this.disabled) return;
      this.highlight = false;
      event.stopPropagation();
      event.preventDefault();
      const fileList = event.dataTransfer ? event.dataTransfer.files : null;
      if (!fileList) return;
      const allowDrop = this.multiple || fileList.length === 1;
      if (allowDrop) {
        this.handleSelectedFiles(fileList, event);
      }
    },
    handleSelectedFiles(fileList, event) {
      if (!fileList || fileList.length === 0) return;
      const incoming = Array.from(fileList);
      const next = this.multiple ? [...this.files] : [];
      const validationMessages = [];

      for (const file of incoming) {
        const alreadySelected = next.some((f) => f.name === file.name && f.type === file.type && f.size === file.size);
        if (alreadySelected) continue;

        if (this.maxFileSize && file.size > this.maxFileSize) {
          validationMessages.push(`${file.name}: invalid file size, maximum upload size is ${formatSize(this.maxFileSize)}.`);
          continue;
        }
        if (this.accept && !isFileTypeValid(file, this.accept)) {
          validationMessages.push(`${file.name}: invalid file type, allowed file types: ${this.accept}.`);
          continue;
        }
        next.push(file);
      }

      if (this.fileLimit && next.length > this.fileLimit) {
        validationMessages.push(`Maximum number of files exceeded, limit is ${this.fileLimit} at most.`);
        next.length = this.fileLimit;
      }

      this.messages = validationMessages;
      this.files = next;
      this.$emit("select", { originalEvent: event, files: incoming, currentFiles: next });
      this.clearInputElement();

      if (this.hasFiles && this.auto) {
        this.upload();
      }
    },
    clearInputElement() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },
    upload() {
      if (!this.hasFiles) return;

      if (this.customUpload) {
        this.$emit("upload-handler", { files: this.files });
        return;
      }
      if (!this.url) return;

      this.uploading = true;
      this.progress = 0;

      const formData = new FormData();
      for (const file of this.files) {
        formData.append(this.name, file, file.name);
      }

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const value = Math.round((event.loaded * 100) / event.total);
          this.progress = value;
          this.$emit("progress", { originalEvent: event, progress: value });
        }
      });
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        this.uploading = false;
        this.progress = 0;
        const uploadedFiles = this.files;
        if (xhr.status >= 200 && xhr.status < 300) {
          this.$emit("upload", { files: uploadedFiles });
          this.files = [];
          this.messages = [];
          this.clearInputElement();
          this.$emit("clear");
        } else {
          this.$emit("error", { files: uploadedFiles });
        }
      };
      xhr.open(this.method, this.url, true);
      xhr.withCredentials = this.withCredentials;
      xhr.send(formData);
    },
    clear() {
      this.files = [];
      this.messages = [];
      this.clearInputElement();
      this.$emit("clear");
    },
    remove(event, index) {
      const removed = this.files[index];
      this.files = this.files.filter((_, i) => i !== index);
      this.clearInputElement();
      if (removed) {
        this.$emit("remove", { originalEvent: event, file: removed });
      }
    },
  },
};
</script>
