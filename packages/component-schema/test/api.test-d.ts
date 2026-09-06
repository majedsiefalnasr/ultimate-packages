import { expectTypeOf } from "vitest";
import type { PropFact, EventFact, ComponentApi } from "../src/api";

expectTypeOf<EventFact["mechanism"]>().toEqualTypeOf<"output" | "callback-prop" | "emit">();
expectTypeOf<PropFact["required"]>().toEqualTypeOf<boolean>();
// events/props are per-framework arrays, never a single unified list —
// the type-level guard against re-introducing a universal event name.
expectTypeOf<ComponentApi["ng"]>().toMatchTypeOf<
  { props: PropFact[]; events: EventFact[] } | undefined
>();
