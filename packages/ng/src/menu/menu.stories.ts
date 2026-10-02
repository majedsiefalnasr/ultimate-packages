import { provideRouter } from "@angular/router";
import type { Meta, StoryObj } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { UMenu } from "./menu";
import type { UMenuItem } from "@ultimate/ng-core";

/**
 * Accessibility info source: `packages/component-metadata/src/records/menu.ts`
 * (the `MENU_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/menu/menu.spec.ts`'s existing test cases (menuitem/
 * separator rendering, disabled item, routerLink item).
 *
 * `UMenu`'s template binds `[routerLink]`, which requires Angular's Router
 * to be provided — matching menu.spec.ts's own
 * `TestBed.configureTestingModule({ providers: [provideRouter([])] })`
 * pattern, applied here via Storybook's `applicationConfig` decorator so
 * every story in this file gets a working (empty) router.
 */
const meta: Meta<UMenu> = {
  title: "Ng/Menu",
  component: UMenu,
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default meta;
type Story = StoryObj<UMenu>;

const defaultItems: UMenuItem[] = [
  { label: "Home", icon: "pi pi-home" },
  { separator: true },
  { label: "Settings", routerLink: "/settings" },
];

/** Default state — a flat model with a separator, per menu.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    model: defaultItems,
  },
};

/** A disabled item, per menu.spec.ts's "skips disabled items when navigating with ArrowDown" test. */
export const WithDisabledItem: Story = {
  args: {
    model: [{ label: "Home" }, { label: "Disabled", disabled: true }, { label: "Settings" }],
  },
};

/**
 * Popup mode (GAP-067): hidden until opened; the trigger button's `(click)`
 * calls `menu.toggle($event)` on a template-ref'd `<u-menu #menu>`, the same
 * imperative pattern as the Popover stories.
 */
export const Popup: Story = {
  args: {
    model: defaultItems,
  },
  render: (args) => ({
    props: args,
    template: `
      <button type="button" (click)="menu.toggle($event)">Toggle Menu</button>
      <u-menu #menu [popup]="true" [model]="model"></u-menu>
    `,
  }),
};
