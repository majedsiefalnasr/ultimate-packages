import { Component, input } from "@angular/core";

/**
 * G3-E reference cases (route `#/g3e/<key>/<case>`, received here as `<key>/<case>`); one
 * `@case` per case, added per batch (Plan Tasks 5, 8, 11, 14). Each case mirrors the content
 * of the matching @ultimate/ng story.
 */
@Component({
  selector: "app-g3e",
  standalone: true,
  imports: [],
  template: `@switch (id()) {}`,
})
export class G3ECases {
  readonly id = input.required<string>();
}
