import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output,
  signal,
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
 * internal `_first` signal inside `ngOnChanges` — no `firstChange` output.
 * This matches the brief's own literal example code for this task; the
 * getter/setter-backed variant described in this task's Global Constraints
 * text is not implemented here since Task 2 is scoped to this raw
 * `_first`/`ngOnChanges` reconciliation shown in the brief's example.
 * `_first` is a `signal()` rather than a plain field (Task 3 addition): with
 * `ChangeDetectionStrategy.OnPush`, a plain-field mutation from
 * `changePage()` — invoked directly by tests/Task 4 outside any template
 * event — does not itself mark the component dirty, so the host's
 * `data-page` attribute binding would not refresh on the next
 * `detectChanges()`. Signals participate in Angular's reactive dependency
 * tracking regardless of the call's origin, which resolves this without
 * manually injecting `ChangeDetectorRef` and calling `markForCheck()`.
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
 *
 * Task 3 re-verified this same finding for `data-page` (this task's new
 * observable/DOM-readable proxy for the `protected page` getter): the
 * brief's Step 3 template again shows `data-page` on a child `<nav>`, but
 * `fixture.nativeElement` still resolves only to the `<u-paginator>` host,
 * not to any element inside its template — a child `<nav>`'s own attributes
 * are never reachable via `fixture.nativeElement.getAttribute(...)`
 * regardless of whether that `<nav>` happens to be the template's sole root
 * node. `data-page` is therefore added to `host` alongside `class`/
 * `data-page-count`, consistent with Task 2's resolution. The `<nav>` in the
 * template below is retained as the purely *visual* wrapper for the
 * first/prev/next/last buttons — its own `[class]`/attribute bindings are
 * for rendering only and are not asserted on directly by any spec.
 */
@Component({
  standalone: true,
  selector: "u-paginator",
  template: `
    <nav [class]="cx('content')">
      <button
        type="button"
        [class]="cx('first', { disabled: isFirstPage })"
        [disabled]="isFirstPage"
        (click)="goFirst()"
      ></button>
      <button
        type="button"
        [class]="cx('prev', { disabled: isFirstPage })"
        [disabled]="isFirstPage"
        (click)="goPrev()"
      ></button>
      <button
        type="button"
        [class]="cx('next', { disabled: isLastPage })"
        [disabled]="isLastPage"
        (click)="goNext()"
      ></button>
      <button
        type="button"
        [class]="cx('last', { disabled: isLastPage })"
        [disabled]="isLastPage"
        (click)="goLast()"
      ></button>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "[attr.data-page-count]": "pageCount",
    "[attr.data-page]": "page",
    "[attr.data-page-links]": "pageLinks.join(',')",
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

  private readonly _first = signal(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["first"]) {
      this._first.set(changes["first"].currentValue);
    }
  }

  protected get pageCount(): number {
    return getPageCount(this.totalRecords(), this.rows());
  }

  protected get page(): number {
    return this.rows() > 0 ? Math.floor(this._first() / this.rows()) : 0;
  }

  protected get isFirstPage(): boolean {
    return this.page === 0;
  }

  protected get isLastPage(): boolean {
    return this.page === this.pageCount - 1;
  }

  protected get empty(): boolean {
    return this.pageCount === 0;
  }

  /**
   * Public: called by this component's own template click handlers
   * (`goFirst`/`goPrev`/`goNext`/`goLast`) and directly by Task 4's tests.
   * Bounds-checked against the current `pageCount`; out-of-range offsets are
   * silently ignored (no state change, no emit).
   */
  changePage(first: number): void {
    const pc = this.pageCount;
    const p = this.rows() > 0 ? Math.floor(first / this.rows()) : 0;
    if (p >= 0 && p < pc) {
      this._first.set(first);
      this.onPageChange.emit({ page: p, first, rows: this.rows(), pageCount: pc });
    }
  }

  protected goFirst(): void {
    this.changePage(0);
  }

  protected goPrev(): void {
    this.changePage(Math.max(0, this._first() - this.rows()));
  }

  protected goNext(): void {
    this.changePage(this._first() + this.rows());
  }

  protected goLast(): void {
    this.changePage((this.pageCount - 1) * this.rows());
  }

  protected get pageLinks(): number[] {
    const pageCount = this.pageCount;
    const pageLinkSize = this.pageLinkSize();
    const currentPage = this.page;

    const visiblePages = Math.min(pageLinkSize, pageCount);
    let start = Math.max(0, Math.ceil(currentPage - visiblePages / 2));
    const end = Math.min(pageCount - 1, start + visiblePages - 1);
    const delta = pageLinkSize - (end - start + 1);
    start = Math.max(0, start - delta);

    const links: number[] = [];
    for (let i = start; i <= end; i++) {
      links.push(i + 1);
    }
    return links;
  }
}
