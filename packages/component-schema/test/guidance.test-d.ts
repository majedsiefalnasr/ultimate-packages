import { expectTypeOf } from "vitest";
import type { Guidance } from "../src/guidance";

// All three fields optional in v1 (spec §6.7) — a component with zero
// authored guidance content must still produce a valid, empty Guidance value.
expectTypeOf<Guidance>().toMatchTypeOf<{}>();
expectTypeOf<Guidance["antiPatterns"]>().toMatchTypeOf<string[] | undefined>();
