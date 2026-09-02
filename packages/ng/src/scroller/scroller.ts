import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";
import { scrollerStyleModule } from "./scroller-style";

@Component({
  standalone: true,
  selector: "u-scroller",
  template: `<div
    [class]="cx('root')"
    [attr.data-num-items-in-viewport]="numItemsInViewportComputed"
    [attr.data-last]="last"
  ></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UScroller extends UBaseComponent {
  protected override readonly componentName = "scroller";
  protected override readonly styleModule = scrollerStyleModule;

  items = input<unknown[]>([]);
  itemSize = input(0);
  numToleratedItems = input<number | undefined>(undefined);

  private _contentSize = 0;

  protected get numItemsInViewportComputed(): number {
    return calculateNumItemsInViewport(this._contentSize, this.itemSize());
  }

  protected get resolvedNumToleratedItems(): number {
    const explicit = this.numToleratedItems();
    if (explicit !== undefined) {
      return explicit;
    }
    return Math.ceil(this.numItemsInViewportComputed / 2);
  }

  protected get last(): number {
    const rawLast = calculateLast(0, this.numItemsInViewportComputed, this.resolvedNumToleratedItems);
    return this.getLast(rawLast);
  }

  private getLast(last = 0, isCols = false): number {
    const liveItems = this.items();
    if (!liveItems) return 0;
    const liveLength = isCols ? liveItems.length : liveItems.length; // isCols branch unreachable in vertical-only scope (Global Constraints); kept for signature parity with the deferred horizontal/both follow-up
    return Math.min(liveLength, last);
  }
}
