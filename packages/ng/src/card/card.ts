import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { cardStyleModule } from "./card-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Card` component (see
 * `.vendor-extracted/ng/card/card.ts`). A flexible content-slot layout
 * container: an optional header projection, a `header`/`subheader` text
 * pair, a default-content slot, and an optional footer projection —
 * matching real source's own header/title/subtitle/content/footer
 * structural shape.
 *
 * Deliberately excludes real source's `p-header`/`p-footer`
 * content-select facets and the header/title/subtitle/content/footer
 * `<ng-template>`-override system (`BlockableUI`, `Footer`/`Header`
 * `ContentChild` facets) — this port uses plain named `ng-content select`
 * slots instead for header/footer, and `header`/`subheader` string inputs
 * for the title pair, same "smaller surface than upstream" precedent as
 * every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-card",
  imports: [UBind],
  template: `
    <div [uBind]="ptm('header')" [class]="cx('header')">
      <ng-content select="[card-header]"></ng-content>
    </div>
    <div [uBind]="ptm('body')" [class]="cx('body')">
      @if (header()) {
        <div [uBind]="ptm('title')" [class]="cx('title')">{{ header() }}</div>
      }
      @if (subheader()) {
        <div [uBind]="ptm('subtitle')" [class]="cx('subtitle')">{{ subheader() }}</div>
      }
      <div [uBind]="ptm('content')" [class]="cx('content')">
        <ng-content></ng-content>
      </div>
      <div [uBind]="ptm('footer')" [class]="cx('footer')">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UCard }],
  host: {
    "[class]": "cx('root')",
  },
  hostDirectives: [UBind],
})
export class UCard extends UBaseComponent {
  protected override readonly componentName = "card";
  protected override readonly styleModule = cardStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Header of the card. */
  header = input<string>();
  /** Subheader of the card. */
  subheader = input<string>();

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
