import { definePreset } from "@ultimate/uix-styled";
import { primitive, semantic } from "./base";
import { accordion } from "./accordion";
import { autocomplete } from "./autocomplete";
import { avatar } from "./avatar";
import { blockUI } from "./block-ui";
import { breadcrumb } from "./breadcrumb";
import { button } from "./button";
import { card } from "./card";
import { carousel } from "./carousel";
import { cascadeSelect } from "./cascade-select";
import { checkbox } from "./checkbox";
import { chip } from "./chip";
import { colorPicker } from "./color-picker";
import { confirmDialog } from "./confirm-dialog";
import { confirmPopup } from "./confirm-popup";
import { contextMenu } from "./context-menu";
import { datePicker } from "./date-picker";
import { dialog } from "./dialog";
import { divider } from "./divider";
import { dock } from "./dock";
import { drawer } from "./drawer";
import { fieldset } from "./fieldset";
import { fileUpload } from "./file-upload";
import { floatLabel } from "./float-label";
import { galleria } from "./galleria";
import { iconField } from "./icon-field";
import { iftaLabel } from "./ifta-label";
import { image } from "./image";
import { imageCompare } from "./image-compare";
import { inlineMessage } from "./inline-message";
import { inplace } from "./inplace";
import { inputChips } from "./input-chips";
import { inputNumber } from "./input-number";
import { inputOtp } from "./input-otp";
import { inputText } from "./input-text";
import { knob } from "./knob";
import { listbox } from "./listbox";
import { megaMenu } from "./mega-menu";
import { menu } from "./menu";
import { menubar } from "./menubar";
import { message } from "./message";
import { meterGroup } from "./meter-group";
import { multiSelect } from "./multi-select";
import { overlayBadge } from "./overlay-badge";
import { panel } from "./panel";
import { panelMenu } from "./panel-menu";
import { password } from "./password";
import { popover } from "./popover";
import { progressBar } from "./progress-bar";
import { progressSpinner } from "./progress-spinner";
import { radioButton } from "./radio-button";
import { rating } from "./rating";
import { scrollPanel } from "./scroll-panel";
import { select } from "./select";
import { selectButton } from "./select-button";
import { skeleton } from "./skeleton";
import { slider } from "./slider";
import { speedDial } from "./speed-dial";
import { splitButton } from "./split-button";
import { splitter } from "./splitter";
import { stepper } from "./stepper";
import { steps } from "./steps";
import { tabs } from "./tabs";
import { tag } from "./tag";
import { terminal } from "./terminal";
import { textarea } from "./textarea";
import { tieredMenu } from "./tiered-menu";
import { timeline } from "./timeline";
import { toast } from "./toast";
import { toggleButton } from "./toggle-button";
import { toggleSwitch } from "./toggle-switch";
import { toolbar } from "./toolbar";
import { tooltip } from "./tooltip";

/**
 * Ultimate's Aura-derived preset: the shared primitive/semantic base tier plus
 * component tokens for the five-component proof set (Button, Checkbox, Dialog,
 * Menu, Tooltip) and the Form family (24 modules: RadioButton through
 * IftaLabel; `inputmask` has no upstream module — PrimeVue's InputMask reuses
 * the InputText tokens), the Overlay family (6 modules: Popover, Drawer,
 * ContextMenu, ConfirmDialog, ConfirmPopup, OverlayBadge), the Navigation
 * family (11 modules: Breadcrumb, MegaMenu, Menubar, PanelMenu, TieredMenu, Tabs,
 * Stepper, Steps, Dock, SpeedDial, SplitButton; upstream `tabview`/`tabmenu`
 * are not ported) and the Panel/Layout/Display/Feedback family (25 modules:
 * Accordion, Avatar, BlockUI, Card, Carousel, Chip, Divider, Fieldset, Galleria,
 * Image, ImageCompare, Inplace, Message, MeterGroup, Panel, ProgressBar,
 * ProgressSpinner, ScrollPanel, Skeleton, Splitter, Tag, Terminal, Timeline,
 * Toolbar, Toast) and InlineMessage. Ported (Option B —
 * reference, not verbatim copy) from `@primeuix/themes@2.0.3`'s Aura preset; see `docs/architecture/provenance/themes.json`
 * for per-file provenance detail. Each module is registered under upstream's
 * own preset key (e.g. `radiobutton`), which is the name the dt engine looks
 * up per component.
 */
export const auraPreset = definePreset({
  primitive,
  semantic,
  components: {
    accordion,
    autocomplete,
    avatar,
    blockui: blockUI,
    breadcrumb,
    button,
    card,
    carousel,
    cascadeselect: cascadeSelect,
    checkbox,
    chip,
    colorpicker: colorPicker,
    confirmdialog: confirmDialog,
    confirmpopup: confirmPopup,
    contextmenu: contextMenu,
    datepicker: datePicker,
    dialog,
    divider,
    dock,
    drawer,
    fieldset,
    fileupload: fileUpload,
    floatlabel: floatLabel,
    galleria,
    iconfield: iconField,
    iftalabel: iftaLabel,
    image,
    imagecompare: imageCompare,
    inlinemessage: inlineMessage,
    inplace,
    inputchips: inputChips,
    inputnumber: inputNumber,
    inputotp: inputOtp,
    inputtext: inputText,
    knob,
    listbox,
    megamenu: megaMenu,
    menu,
    menubar,
    message,
    metergroup: meterGroup,
    multiselect: multiSelect,
    overlaybadge: overlayBadge,
    panel,
    panelmenu: panelMenu,
    password,
    popover,
    progressbar: progressBar,
    progressspinner: progressSpinner,
    radiobutton: radioButton,
    rating,
    scrollpanel: scrollPanel,
    select,
    selectbutton: selectButton,
    skeleton,
    slider,
    speeddial: speedDial,
    splitbutton: splitButton,
    splitter,
    stepper,
    steps,
    tabs,
    tag,
    terminal,
    textarea,
    tieredmenu: tieredMenu,
    timeline,
    toast,
    togglebutton: toggleButton,
    toggleswitch: toggleSwitch,
    toolbar,
    tooltip,
  },
});
