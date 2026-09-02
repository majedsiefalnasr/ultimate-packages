import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { getPageCount } from "@ultimate/uix-data";
import { paginatorStyleModule } from "./paginator-style";

export interface PaginatorPageChangeEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

/**
 * Scaffold for `UPaginator`: bare component class with core derived-state
 * logic (`pageCount` via uix-data's `getPageCount`, `page` from internal
 * `_first`). No first/prev/next/last controls or `changePage` yet — that's
 * Task 3's scope. State is wired to a `data-page-count` host attribute for
 * test assertion, matching `UScroller`'s Task 2 pattern of exposing
 * internal state via `data-*` attributes rather than reading protected
 * members directly from specs.
 *
 * `first` is a plain signal input (`first = input(0)`) reconciled into an
 * internal `_first` field inside `ngOnChanges` — no `firstChange` output.
 * This matches the brief's own literal example code for this task; the
 * getter/setter-backed variant described in this task's Global Constraints
 * text is not implemented here since Task 2 is scoped to this raw
 * `_first`/`ngOnChanges` reconciliation shown in the brief's example.
 *
 * DEVIATION from the brief's literal example: the brief's sample template
 * renders `<nav [class]="cx('root')" [attr.data-page-count]="pageCount">`
 * as a *child* element, but its own test asserts on
 * `fixture.nativeElement.getAttribute("data-page-count")` directly —
 * `fixture.nativeElement` is the component's *host* element (`<u-paginator>`
 * itself), not that child `<nav>`, so the brief's literal template would
 * leave the attribute unreachable at that assertion path (verified: compiles
 * clean but the attribute assertion fails with `null`, not `"10"`/`"0"`).
 * Following this repo's own established pattern for binding root
 * class/attrs onto the host (`UBadge`/`UCheckbox`/`UTooltip`/`UDialog`, all
 * using `host: { "[class]": "cx(...)", ... }`), `root`/`data-page-count`
 * are bound via `host` here instead, with no separate wrapper element.
 */
@Component({
  standalone: true,
  selector: "u-paginator",
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[attr.data-page-count]": "pageCount",
  },
})
export class UPaginator extends UBaseComponent implements OnChanges {
  protected override readonly componentName = "paginator";
  protected override readonly styleModule = paginatorStyleModule;

  first = input(0);
  rows = input(0);
  totalRecords = input(0);
  pageLinkSize = input(5);

  onPageChange = output<PaginatorPageChangeEvent>();

  private _first = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["first"]) {
      this._first = changes["first"].currentValue;
    }
  }

  protected get pageCount(): number {
    return getPageCount(this.totalRecords(), this.rows());
  }

  protected get page(): number {
    return this.rows() > 0 ? Math.floor(this._first / this.rows()) : 0;
  }
}
