import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { tableStyleModule } from "./table-style";

@Component({
  standalone: true,
  selector: "u-table",
  template: `
    <div [class]="cx('root')" role="table">
      <table [class]="cx('table')">
        <tbody [class]="cx('tbody')" role="rowgroup">
          @for (row of value(); track $index) {
            <tr [class]="cx('row')" role="row"></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UTable<T> extends UBaseComponent {
  protected override readonly componentName = "table";
  protected override readonly styleModule = tableStyleModule;

  value = input<T[]>([]);
  dataKey = input<string>("");
}
