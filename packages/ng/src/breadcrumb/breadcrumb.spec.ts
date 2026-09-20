import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { UBreadcrumb } from "./breadcrumb";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UBreadcrumb", () => {
  const home: UMenuItem = { icon: "pi pi-home", url: "/" };
  const items: UMenuItem[] = [
    { label: "Category", routerLink: "/category" },
    { label: "Details", routerLink: "/category/details" },
  ];

  function setup(model: UMenuItem[] = items, options: { home?: UMenuItem } = { home }) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UBreadcrumb);
    fixture.componentRef.setInput("model", model);
    if (options.home) fixture.componentRef.setInput("home", options.home);
    fixture.detectChanges();
    return fixture;
  }

  it("renders a nav > ol trail of links", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector("nav")).not.toBeNull();
    expect(fixture.nativeElement.querySelector("nav > ol")).not.toBeNull();
  });

  it("renders the home item plus every model item as a link", () => {
    const fixture = setup();
    const links = fixture.nativeElement.querySelectorAll("a");
    // home + 2 model items
    expect(links.length).toBe(3);
  });

  it("renders a separator between each rendered item", () => {
    const fixture = setup();
    const separators = fixture.nativeElement.querySelectorAll('[role="separator"]');
    // home->item1, item1->item2
    expect(separators.length).toBe(2);
  });

  it("renders without a home item when none is provided", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UBreadcrumb);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll("a");
    expect(links.length).toBe(2);
  });

  it('sets aria-current="page" on the last item when its routerLink matches the current location', () => {
    const fixture = setup([{ label: "Category", routerLink: "/category" }, { label: "Details", routerLink: "/" }]);
    const links = fixture.nativeElement.querySelectorAll("a");
    const last = links[links.length - 1];
    expect(last.getAttribute("aria-current")).toBe("page");
  });

  it("does not set aria-current on non-matching items", () => {
    const fixture = setup();
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll("a"));
    for (const link of links) {
      expect(link.getAttribute("aria-current")).toBeNull();
    }
  });

  it("emits onItemClick and invokes item.command when a link is clicked", () => {
    let commandCalled = false;
    const model: UMenuItem[] = [
      { label: "Category", routerLink: "/category" },
      { label: "Details", command: () => (commandCalled = true) },
    ];
    const fixture = setup(model);
    let emitted: unknown;
    fixture.componentInstance.onItemClick.subscribe((e: unknown) => (emitted = e));
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll("a"));
    links[links.length - 1].click();
    expect(commandCalled).toBe(true);
    expect(emitted).toBeDefined();
  });

  it("prevents navigation and skips command for a disabled item", () => {
    let commandCalled = false;
    const model: UMenuItem[] = [{ label: "Disabled", disabled: true, command: () => (commandCalled = true) }];
    const fixture = setup(model, {});
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    link.click();
    expect(commandCalled).toBe(false);
  });

  it("does not render a separator after the last item", () => {
    const fixture = setup();
    const items = fixture.nativeElement.querySelectorAll(".u-breadcrumb-item");
    const separators = fixture.nativeElement.querySelectorAll('[role="separator"]');
    // items.length includes home item; separators = items.length - 1
    expect(separators.length).toBe(items.length - 1);
  });
});
