import { definePreset } from "@ultimate/uix-styled";
import { primitive, semantic } from "./base";
import { autocomplete } from "./autocomplete";
import { breadcrumb } from "./breadcrumb";
import { button } from "./button";
import { cascadeSelect } from "./cascade-select";
import { checkbox } from "./checkbox";
import { colorPicker } from "./color-picker";
import { confirmDialog } from "./confirm-dialog";
import { confirmPopup } from "./confirm-popup";
import { contextMenu } from "./context-menu";
import { datePicker } from "./date-picker";
import { dialog } from "./dialog";
import { dock } from "./dock";
import { drawer } from "./drawer";
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
import { megaMenu } from "./mega-menu";
import { menu } from "./menu";
import { menubar } from "./menubar";
import { multiSelect } from "./multi-select";
import { overlayBadge } from "./overlay-badge";
import { panelMenu } from "./panel-menu";
import { password } from "./password";
import { popover } from "./popover";
import { radioButton } from "./radio-button";
import { rating } from "./rating";
import { select } from "./select";
import { selectButton } from "./select-button";
import { slider } from "./slider";
import { speedDial } from "./speed-dial";
import { splitButton } from "./split-button";
import { stepper } from "./stepper";
import { steps } from "./steps";
import { tabs } from "./tabs";
import { textarea } from "./textarea";
import { tieredMenu } from "./tiered-menu";
import { toggleButton } from "./toggle-button";
import { toggleSwitch } from "./toggle-switch";
import { tooltip } from "./tooltip";

/**
 * Ultimate's Aura-derived preset: the shared primitive/semantic base tier plus
 * component tokens for the five-component proof set (Button, Checkbox, Dialog,
 * Menu, Tooltip) and the Form family (24 modules: RadioButton through
 * IftaLabel; `inputmask` has no upstream module — PrimeVue's InputMask reuses
 * the InputText tokens), the Overlay family (6 modules: Popover, Drawer,
 * ContextMenu, ConfirmDialog, ConfirmPopup, OverlayBadge) and the Navigation
 * family (11 modules: Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Tabs,
 * Stepper, Steps, Dock, SpeedDial, SplitButton; upstream `tabview`/`tabmenu`
 * are not ported). Ported (Option B —
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
    breadcrumb,
    button,
    cascadeselect: cascadeSelect,
    checkbox,
    colorpicker: colorPicker,
    confirmdialog: confirmDialog,
    confirmpopup: confirmPopup,
    contextmenu: contextMenu,
    datepicker: datePicker,
    dialog,
    dock,
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
    megamenu: megaMenu,
    menu,
    menubar,
    multiselect: multiSelect,
    overlaybadge: overlayBadge,
    panelmenu: panelMenu,
    password,
    popover,
    radiobutton: radioButton,
    rating,
    select,
    selectbutton: selectButton,
    slider,
    speeddial: speedDial,
    splitbutton: splitButton,
    stepper,
    steps,
    tabs,
    textarea,
    tieredmenu: tieredMenu,
    togglebutton: toggleButton,
    toggleswitch: toggleSwitch,
    tooltip,
  },
});
