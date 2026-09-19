import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
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
  template: `
    <div [class]="cx('header')">
      <ng-content select="[card-header]"></ng-content>
    </div>
    <div [class]="cx('body')">
      @if (header()) {
        <div [class]="cx('title')">{{ header() }}</div>
      }
      @if (subheader()) {
        <div [class]="cx('subtitle')">{{ subheader() }}</div>
      }
      <div [class]="cx('content')">
        <ng-content></ng-content>
      </div>
      <div [class]="cx('footer')">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
})
export class UCard extends UBaseComponent {
  protected override readonly componentName = "card";
  protected override readonly styleModule = cardStyleModule;

  /** Header of the card. */
  header = input<string>();
  /** Subheader of the card. */
  subheader = input<string>();
}
