import { definePreset } from "@ultimate/uix-styled";
import { primitive, semantic } from "./base";
import { button } from "./button";
import { checkbox } from "./checkbox";
import { dialog } from "./dialog";
import { menu } from "./menu";
import { tooltip } from "./tooltip";

/**
 * Ultimate's Aura-derived preset for the five-component proof set (Button,
 * Checkbox, Dialog, Menu, Tooltip) plus the shared primitive/semantic base
 * tier. Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset; see `docs/architecture/provenance/themes.json`
 * for per-file provenance detail.
 */
export const auraPreset = definePreset({
  primitive,
  semantic,
  components: {
    button,
    checkbox,
    dialog,
    menu,
    tooltip,
  },
});
