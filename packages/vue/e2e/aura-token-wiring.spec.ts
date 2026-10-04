import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 Tranche 1 (Spec §8 criteria 6–7): screenshot coverage for the
 * components whose style key is renamed to the upstream Aura preset key
 * (ADR-051), plus Badge (new `badge` module). The baselines were first
 * recorded before the change, so the post-change diff is reviewable.
 * Readiness uses toBeAttached(), not toBeVisible(): before the change some
 * roots have undefined size tokens and may have an empty bounding box.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; root: string }> = [
  { name: "Badge", story: "vue-badge--default", root: ".u-badge" },
  { name: "CascadeSelect", story: "vue-cascadeselect--default", root: ".u-cascade-select" },
  { name: "ColorPicker", story: "vue-colorpicker--default", root: ".u-color-picker" },
  { name: "DatePicker", story: "vue-datepicker--default", root: ".u-date-picker" },
  { name: "FileUpload", story: "vue-fileupload--default", root: ".u-file-upload" },
  { name: "FloatLabel", story: "vue-floatlabel--default", root: ".u-float-label" },
  { name: "IconField", story: "vue-iconfield--leading-icon", root: ".u-icon-field" },
  { name: "IftaLabel", story: "vue-iftalabel--default", root: ".u-ifta-label" },
  { name: "InputChips", story: "vue-inputchips--default", root: ".u-input-chips" },
  { name: "InputGroup", story: "vue-inputgroup--leading-addon", root: ".u-input-group" },
  { name: "InputNumber", story: "vue-inputnumber--default", root: ".u-input-number" },
  { name: "InputOtp", story: "vue-inputotp--default", root: ".u-input-otp" },
  { name: "InputText", story: "vue-inputtext--default", root: ".u-input-text" },
  { name: "MultiSelect", story: "vue-multiselect--default", root: ".u-multi-select" },
  { name: "RadioButton", story: "vue-radiobutton--default", root: ".u-radio-button" },
  { name: "SelectButton", story: "vue-selectbutton--default", root: ".u-select-button" },
  { name: "ToggleButton", story: "vue-togglebutton--default", root: ".u-toggle-button" },
  { name: "ToggleSwitch", story: "vue-toggleswitch--default", root: ".u-toggle-switch" },
];

for (const { name, story, root } of STORIES) {
  test(`Vue/${name} story: visual regression`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(root).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });
}
