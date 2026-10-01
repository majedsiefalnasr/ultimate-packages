import { definePreset } from "@ultimate/uix-styled";
import { primitive, semantic } from "./base";
import { autocomplete } from "./autocomplete";
import { button } from "./button";
import { cascadeSelect } from "./cascade-select";
import { checkbox } from "./checkbox";
import { colorPicker } from "./color-picker";
import { datePicker } from "./date-picker";
import { dialog } from "./dialog";
import { fileUpload } from "./file-upload";
import { floatLabel } from "./float-label";
import { iconField } from "./icon-field";
import { iftaLabel } from "./ifta-label";
import { inputChips } from "./input-chips";
import { inputNumber } from "./input-number";
import { inputOtp } from "./input-otp";
import { inputText } from "./input-text";
import { knob } from "./knob";
import { listbox } from "./listbox";
import { menu } from "./menu";
import { multiSelect } from "./multi-select";
import { password } from "./password";
import { radioButton } from "./radio-button";
import { rating } from "./rating";
import { select } from "./select";
import { selectButton } from "./select-button";
import { slider } from "./slider";
import { textarea } from "./textarea";
import { toggleButton } from "./toggle-button";
import { toggleSwitch } from "./toggle-switch";
import { tooltip } from "./tooltip";
import { confirmDialog } from "./confirm-dialog";
import { confirmPopup } from "./confirm-popup";
import { contextMenu } from "./context-menu";
import { drawer } from "./drawer";
import { overlayBadge } from "./overlay-badge";
import { popover } from "./popover";

/**
 * Ultimate's Aura-derived preset: the shared primitive/semantic base tier plus
 * component tokens for the five-component proof set (Button, Checkbox, Dialog,
 * Menu, Tooltip) and the Form family (24 modules: RadioButton through
 * IftaLabel; `inputmask` has no upstream module — PrimeVue's InputMask reuses
 * the InputText tokens) and the Overlay family (6 modules: Popover, Drawer,
 * ContextMenu, ConfirmDialog, ConfirmPopup, OverlayBadge). Ported (Option B —
 * reference, not verbatim copy) from `@primeuix/themes@2.0.3`'s Aura preset; see `docs/architecture/provenance/themes.json`
 * for per-file provenance detail. Each module is registered under upstream's
 * own preset key (e.g. `radiobutton`), which is the name the dt engine looks
 * up per component.
 */
export const auraPreset = definePreset({
  primitive,
  semantic,
  components: {
    autocomplete,
    button,
    cascadeselect: cascadeSelect,
    checkbox,
    colorpicker: colorPicker,
    confirmdialog: confirmDialog,
    confirmpopup: confirmPopup,
    contextmenu: contextMenu,
    datepicker: datePicker,
    dialog,
    drawer,
    fileupload: fileUpload,
    floatlabel: floatLabel,
    iconfield: iconField,
    iftalabel: iftaLabel,
    inputchips: inputChips,
    inputnumber: inputNumber,
    inputotp: inputOtp,
    inputtext: inputText,
    knob,
    listbox,
    menu,
    multiselect: multiSelect,
    overlaybadge: overlayBadge,
    password,
    popover,
    radiobutton: radioButton,
    rating,
    select,
    selectbutton: selectButton,
    slider,
    textarea,
    togglebutton: toggleButton,
    toggleswitch: toggleSwitch,
    tooltip,
  },
});
