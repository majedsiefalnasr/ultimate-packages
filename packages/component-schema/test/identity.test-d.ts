import { expectTypeOf } from "vitest";
import type { ComponentIdentity } from "../src/identity";

// metadataVersion must be a number (spec §5.1), never a string — this is the
// exact type-level guard against the "semver-string" mistake the spec's own
// fix round corrected.
expectTypeOf<ComponentIdentity["metadataVersion"]>().toEqualTypeOf<number>();
expectTypeOf<ComponentIdentity["schemaVersion"]>().toEqualTypeOf<string>();
expectTypeOf<ComponentIdentity["packages"]>().toMatchTypeOf<{
  ng?: { packageName: string; sourcePath: string };
  react?: { packageName: string; sourcePath: string };
  vue?: { packageName: string; sourcePath: string };
}>();
