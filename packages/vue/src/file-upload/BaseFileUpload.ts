import { defineComponent } from "vue";
import { createBaseComponent, registerComponentStyle } from "@ultimate/vue-core";
import { fileUploadStyleModule } from "./file-upload-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseComponent(), matching verified BaseFileUpload.vue's
// real chain exactly: `export default { name: 'BaseFileUpload', extends:
// BaseComponent, ... }` — confirmed against
// .vendor-extracted/vue/fileupload/BaseFileUpload.vue — NOT
// createBaseEditableHolder()/createBaseInput(): FileUpload owns no
// v-model-bindable single value, matching real source's own shape (it
// manages a self-contained `files` list via events, not a form-control
// value) — same tier URating/UKnob extend for their own non-editable-value
// reasons, though FileUpload's own reason (no bindable scalar value at all)
// differs from Rating/Knob's (editable value, but simpler base needed).
export function createBaseFileUpload() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "fileupload", styleModule: fileUploadStyleModule }),
    props: {
      name: { type: String, default: "files" },
      url: { type: String, default: null },
      method: { type: String, default: "POST" },
      multiple: { type: Boolean, default: false },
      accept: { type: String, default: null },
      disabled: { type: Boolean, default: false },
      auto: { type: Boolean, default: false },
      withCredentials: { type: Boolean, default: false },
      maxFileSize: { type: Number, default: null },
      fileLimit: { type: Number, default: null },
      customUpload: { type: Boolean, default: false },
      chooseLabel: { type: String, default: "Choose" },
      uploadLabel: { type: String, default: "Upload" },
      cancelLabel: { type: String, default: "Cancel" },
      emptyMessage: { type: String, default: "Drag and drop files here to upload." },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = fileUploadStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("fileupload", fileUploadStyleModule);
    },
  });
}
