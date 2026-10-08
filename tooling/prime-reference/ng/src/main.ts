import { Component, provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import Aura from "@primeuix/themes/aura";
import { providePrimeNG } from "primeng/config";
import { DrawerModule } from "primeng/drawer";
import { MessageModule } from "primeng/message";
import { TagModule } from "primeng/tag";

type Position = "left" | "right" | "top" | "bottom" | "full";

const DRAWERS: Record<
  string,
  { header: string; position: Position; body: string; visible: boolean; rtl?: boolean }
> = {
  "drawer/left": { header: "Menu", position: "left", body: "Drawer body content.", visible: true },
  "drawer/closed": { header: "Menu", position: "left", body: "", visible: false },
  "drawer/right": {
    header: "Settings",
    position: "right",
    body: "Right-positioned drawer.",
    visible: true,
  },
  "drawer/top": { header: "Top", position: "top", body: "Drawer body content.", visible: true },
  "drawer/bottom": {
    header: "Bottom",
    position: "bottom",
    body: "Drawer body content.",
    visible: true,
  },
  "drawer/full": { header: "Full", position: "full", body: "Drawer body content.", visible: true },
  "drawer/rtl": {
    header: "RTL",
    position: "left",
    body: "Drawer body content.",
    visible: true,
    rtl: true,
  },
};

/** Each case mirrors the content of the matching @ultimate/ng story (see ../../cases.ts). */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [DrawerModule, MessageModule, TagModule],
  template: `
    @switch (id) {
      @case ("tag/default") {
        <p-tag value="New" />
      }
      @case ("tag/severities") {
        <p-tag severity="success" value="Success" />
        <p-tag severity="info" value="Info" />
        <p-tag severity="warn" value="Warn" />
        <p-tag severity="danger" value="Danger" />
        <p-tag severity="secondary" value="Secondary" />
        <p-tag severity="contrast" value="Contrast" />
      }
      @case ("message/default") {
        <p-message severity="info">This is an informational message.</p-message>
      }
      @case ("message/severities") {
        <p-message severity="success">Success message</p-message>
        <p-message severity="info">Info message</p-message>
        <p-message severity="warn">Warn message</p-message>
        <p-message severity="error">Error message</p-message>
        <p-message severity="secondary">Secondary message</p-message>
        <p-message severity="contrast">Contrast message</p-message>
      }
      @case ("message/closable") {
        <p-message severity="warn" [closable]="true">This message can be closed.</p-message>
      }
      <!-- Class D cases (no Ultimate support): rendered for the record only. -->
      @case ("message/outlined") {
        <p-message severity="info" variant="outlined">Outlined message</p-message>
      }
      @case ("message/simple") {
        <p-message severity="info" variant="simple">Simple message</p-message>
      }
      @case ("message/sizes") {
        <p-message severity="info" size="small">Small message</p-message>
        <p-message severity="info" size="large">Large message</p-message>
      }
      @default {
        @if (drawer) {
          <!-- One-way binding, as in the @ultimate/ng Drawer stories. -->
          <p-drawer [visible]="visible" [header]="drawer.header" [position]="drawer.position">{{
            drawer.body
          }}</p-drawer>
        }
      }
    }
  `,
})
class App {
  readonly id = location.hash.replace(/^#\//, "");
  readonly drawer = DRAWERS[this.id];
  visible = this.drawer?.visible ?? false;

  constructor() {
    if (this.drawer?.rtl) document.documentElement.dir = "rtl";
  }
}

// Prime as Prime ships: default PrimeNG setup with the Aura preset, styled mode.
bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), providePrimeNG({ theme: { preset: Aura } })],
}).catch((error) => console.error(error));
