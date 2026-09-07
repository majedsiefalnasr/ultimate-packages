import type { ComponentMetadata } from "@ultimate/component-schema";
import { BUTTON_METADATA } from "./records/button";
import { CHECKBOX_METADATA } from "./records/checkbox";
import { DIALOG_METADATA } from "./records/dialog";
import { MENU_METADATA } from "./records/menu";
import { TOOLTIP_METADATA } from "./records/tooltip";

export const ALL_COMPONENTS: ComponentMetadata[] = [
  BUTTON_METADATA,
  CHECKBOX_METADATA,
  DIALOG_METADATA,
  MENU_METADATA,
  TOOLTIP_METADATA,
];
