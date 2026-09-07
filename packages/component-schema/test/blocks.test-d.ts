import { expectTypeOf } from "vitest";
import type { AccessibilityFacts } from "../src/accessibility";
import type { StyleIdentity } from "../src/style";
import type { Relationships } from "../src/relationships";
import type { ProvenanceRef } from "../src/provenance-ref";

expectTypeOf<AccessibilityFacts["verifiedRoles"]>().toMatchTypeOf<string[] | undefined>();
expectTypeOf<StyleIdentity["componentName"]>().toEqualTypeOf<string>();
expectTypeOf<Relationships["dependsOn"]>().toMatchTypeOf<string[] | undefined>();
expectTypeOf<ProvenanceRef["package"]>().toEqualTypeOf<"ng" | "react" | "vue" | "uix-styles">();
expectTypeOf<ProvenanceRef["ultimateDestinations"]>().toEqualTypeOf<string[]>();
