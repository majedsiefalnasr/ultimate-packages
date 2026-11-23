import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { UAvatar } from "./avatar";

function render<T>(host: new () => T) {
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  fixture.detectChanges();
  return fixture;
}

describe("UAvatar", () => {
  it("renders a label when no image or icon is provided", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [label]="'AB'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = render(HostComponent);
    expect(fixture.nativeElement.querySelector(".u-avatar-text")?.textContent).toBe("AB");
  });

  it("renders an icon when no image is provided", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [icon]="'pi pi-user'"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = render(HostComponent);
    const icon = fixture.nativeElement.querySelector(".pi-user");
    expect(icon).not.toBeNull();
    expect(icon.classList.contains("u-avatar-icon")).toBe(true);
  });

  it("renders an image when provided", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [image]="'avatar.png'" ariaLabel="User"></u-avatar>`,
    })
    class HostComponent {}
    const fixture = render(HostComponent);
    const img = fixture.nativeElement.querySelector("img");
    expect(img?.src).toContain("avatar.png");
    expect(img?.getAttribute("aria-label")).toBe("User");
    expect(fixture.nativeElement.querySelector(".u-avatar-image")).not.toBeNull();
  });

  describe("content priority", () => {
    it("shows the label before the icon and the image, as PrimeNG does", () => {
      @Component({
        standalone: true,
        imports: [UAvatar],
        template: `<u-avatar label="AB" icon="pi pi-user" image="a.png"></u-avatar>`,
      })
      class HostComponent {}
      const element = render(HostComponent).nativeElement as HTMLElement;
      expect(element.querySelector(".u-avatar-text")?.textContent).toBe("AB");
      expect(element.querySelector(".pi-user")).toBeNull();
      expect(element.querySelector("img")).toBeNull();
    });

    it("shows the icon before the image", () => {
      @Component({
        standalone: true,
        imports: [UAvatar],
        template: `<u-avatar icon="pi pi-user" image="a.png"></u-avatar>`,
      })
      class HostComponent {}
      const element = render(HostComponent).nativeElement as HTMLElement;
      expect(element.querySelector(".pi-user")).not.toBeNull();
      expect(element.querySelector("img")).toBeNull();
    });

    it("projects custom content ahead of the label, icon or image", () => {
      @Component({
        standalone: true,
        imports: [UAvatar],
        template: `<u-avatar label="AB"><b class="custom">!</b></u-avatar>`,
      })
      class HostComponent {}
      const host = render(HostComponent).nativeElement.querySelector("u-avatar") as HTMLElement;
      expect(host.querySelector(".custom")).not.toBeNull();
      expect(host.firstElementChild?.classList.contains("custom")).toBe(true);
      expect(host.querySelector(".u-avatar-text")?.textContent).toBe("AB");
    });
  });

  describe("image errors", () => {
    it("emits onImageError and keeps the image, with no fallback to the label", () => {
      @Component({
        standalone: true,
        imports: [UAvatar],
        template: `<u-avatar [image]="image()" (onImageError)="count = count + 1"></u-avatar>`,
      })
      class HostComponent {
        image = signal("broken.png");
        count = 0;
      }
      const fixture = render(HostComponent);
      const img: HTMLImageElement = fixture.nativeElement.querySelector("img");
      img.dispatchEvent(new Event("error"));
      fixture.detectChanges();
      expect(fixture.componentInstance.count).toBe(1);
      expect(fixture.nativeElement.querySelector("img")).not.toBeNull();
      expect(fixture.nativeElement.querySelector(".u-avatar-image")).not.toBeNull();
    });

    it("keeps emitting for a new image after an earlier failure", () => {
      @Component({
        standalone: true,
        imports: [UAvatar],
        template: `<u-avatar [image]="image()" (onImageError)="count = count + 1"></u-avatar>`,
      })
      class HostComponent {
        image = signal("broken.png");
        count = 0;
      }
      const fixture = render(HostComponent);
      fixture.nativeElement.querySelector("img").dispatchEvent(new Event("error"));
      fixture.componentInstance.image.set("other.png");
      fixture.detectChanges();
      fixture.detectChanges();
      const img: HTMLImageElement = fixture.nativeElement.querySelector("img");
      expect(img.src).toContain("other.png");
      img.dispatchEvent(new Event("error"));
      expect(fixture.componentInstance.count).toBe(2);
    });
  });

  it("applies the circle shape class", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [label]="'A'" [shape]="'circle'"></u-avatar>`,
    })
    class HostComponent {}
    expect(render(HostComponent).nativeElement.querySelector(".u-avatar-circle")).not.toBeNull();
  });

  it("applies the large size class", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar [label]="'A'" [size]="'large'"></u-avatar>`,
    })
    class HostComponent {}
    expect(render(HostComponent).nativeElement.querySelector(".u-avatar-lg")).not.toBeNull();
  });

  describe("pass-through, unstyled and dt", () => {
    @Component({
      standalone: true,
      imports: [UAvatar],
      template: `<u-avatar
        label="AB"
        [pt]="pt"
        [unstyled]="unstyled()"
        [dt]="{ width: '5rem' }"
      ></u-avatar>`,
    })
    class PtHostComponent {
      unstyled = signal(false);
      pt = {
        host: { "data-host": "h" },
        root: { id: "avatar-root", class: "extra-root" },
        label: { "data-label": "l" },
      };
    }

    it("applies host, root and label pt attributes and keeps the root class", () => {
      const element = render(PtHostComponent).nativeElement as HTMLElement;
      const host = element.querySelector("u-avatar") as HTMLElement;
      expect(host.getAttribute("data-host")).toBe("h");
      expect(host.id).toBe("avatar-root");
      expect(host.classList.contains("u-avatar")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("avatar");
      expect(element.querySelector(".u-avatar-text")?.getAttribute("data-label")).toBe("l");
    });

    it("routes the icon and image sections", () => {
      @Component({
        standalone: true,
        imports: [UAvatar],
        template: `
          <u-avatar class="by-icon" icon="pi pi-user" [pt]="{ icon: { 'data-icon': 'i' } }" />
          <u-avatar class="by-image" image="a.png" [pt]="{ image: { 'data-image': 'm' } }" />
        `,
      })
      class HostComponent {}
      const element = render(HostComponent).nativeElement as HTMLElement;
      expect(element.querySelector(".by-icon .pi-user")?.getAttribute("data-icon")).toBe("i");
      expect(element.querySelector(".by-image img")?.getAttribute("data-image")).toBe("m");
    });

    it("unstyled drops the Ultimate classes", () => {
      const fixture = render(PtHostComponent);
      fixture.componentInstance.unstyled.set(true);
      fixture.detectChanges();
      fixture.detectChanges();
      const host = fixture.nativeElement.querySelector("u-avatar") as HTMLElement;
      expect(host.classList.contains("u-avatar")).toBe(false);
      expect(host.classList.contains("extra-root")).toBe(true);
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { avatar: { root: { width: "2rem" } } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      const host = render(PtHostComponent).nativeElement.querySelector("u-avatar") as HTMLElement;
      const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-avatar"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-avatar-width:5rem;}`);
    });
  });
});
