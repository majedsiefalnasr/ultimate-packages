import { Injectable } from "@angular/core";

@Injectable()
export class ComponentIdGenerator {
  private counter = 0;

  next(prefix: string): string {
    return `${prefix}_${++this.counter}`;
  }
}
