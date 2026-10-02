/**
 * Ultimate Aura-derived fileupload component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset fileupload module
 * (`.vendor-extracted/themes/src/presets/aura/fileupload/index.ts`). Top-level
 * sections `root`, `header`, `content`, `file`, `fileList`, `progressbar`, `basic` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's fileupload module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `FileUploadComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface FileUploadComponentTokens {
  root?: Record<string, unknown>;
  header?: Record<string, unknown>;
  content?: Record<string, unknown>;
  file?: Record<string, unknown>;
  fileList?: Record<string, unknown>;
  progressbar?: Record<string, unknown>;
  basic?: Record<string, unknown>;
}

export const fileUpload: FileUploadComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    borderRadius: "{content.border.radius}",
    transitionDuration: "{transition.duration}",
  },
  header: {
    background: "transparent",
    color: "{text.color}",
    padding: "1.125rem",
    borderColor: "unset",
    borderWidth: "0",
    borderRadius: "0",
    gap: "0.5rem",
  },
  content: {
    highlightBorderColor: "{primary.color}",
    padding: "0 1.125rem 1.125rem 1.125rem",
    gap: "1rem",
  },
  file: {
    padding: "1rem",
    gap: "1rem",
    borderColor: "{content.border.color}",
    info: {
      gap: "0.5rem",
    },
  },
  fileList: {
    gap: "0.5rem",
  },
  progressbar: {
    height: "0.25rem",
  },
  basic: {
    gap: "0.5rem",
  },
};
