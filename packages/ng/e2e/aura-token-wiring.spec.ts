import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 Tranche 1 (Spec §8 criteria 6–7): screenshot coverage for the
 * components whose style key is renamed to the upstream Aura preset key
 * (ADR-051). The baselines were first recorded before the rename, so the
 * post-rename diff is reviewable. Readiness uses toBeAttached(), not
 * toBeVisible(): before the rename some roots have undefined size tokens and
 * may have an empty bounding box.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; root: string }> = [
  { name: "CascadeSelect", story: "ng-cascadeselect--default", root: ".u-cascade-select" },
  { name: "ColorPicker", story: "ng-colorpicker--default", root: ".u-color-picker" },
  { name: "DatePicker", story: "ng-datepicker--default", root: ".u-date-picker" },
  { name: "FileUpload", story: "ng-fileupload--default", root: ".u-file-upload" },
  { name: "FloatLabel", story: "ng-floatlabel--default", root: ".u-float-label" },
  { name: "IconField", story: "ng-iconfield--leading-icon", root: ".u-icon-field" },
  { name: "IftaLabel", story: "ng-iftalabel--default", root: ".u-ifta-label" },
  { name: "InputGroup", story: "ng-inputgroup--leading-addon", root: ".u-input-group" },
  { name: "InputNumber", story: "ng-inputnumber--default", root: ".u-inputnumber" },
  { name: "InputOtp", story: "ng-inputotp--default", root: ".u-inputotp" },
  { name: "InputText", story: "ng-inputtext--default", root: ".u-inputtext" },
  { name: "MultiSelect", story: "ng-multiselect--default", root: ".u-multi-select" },
  { name: "RadioButton", story: "ng-radiobutton--default", root: ".u-radio-button" },
  { name: "SelectButton", story: "ng-selectbutton--default", root: ".u-select-button" },
  { name: "ToggleButton", story: "ng-togglebutton--default", root: ".u-toggle-button" },
  { name: "ToggleSwitch", story: "ng-toggleswitch--default", root: ".u-toggle-switch" },
];

for (const { name, story, root } of STORIES) {
  test(`Ng/${name} story: visual regression`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(root).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });
}
