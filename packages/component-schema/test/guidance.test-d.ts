import { expectTypeOf } from "vitest";
import type { Guidance } from "../src/guidance";

// All three fields optional in v1 (spec §6.7) — a component with zero
// authored guidance content must still produce a valid, empty Guidance value.
// Intentional: this assertion checks compatibility with any non-nullish value.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
expectTypeOf<Guidance>().toMatchTypeOf<{}>();
expectTypeOf<Guidance["antiPatterns"]>().toMatchTypeOf<string[] | undefined>();
