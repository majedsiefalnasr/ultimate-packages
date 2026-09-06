import type { ComponentIdentity } from "./identity";
import type { ComponentApi } from "./api";
import type { AccessibilityFacts } from "./accessibility";
import type { StyleIdentity } from "./style";
import type { Relationships } from "./relationships";
import type { ProvenanceRef } from "./provenance-ref";
import type { Guidance } from "./guidance";

export type ComponentMetadata = ComponentIdentity & {
  api?: ComponentApi;
  accessibility?: AccessibilityFacts;
  style?: StyleIdentity;
  relationships?: Relationships;
  provenanceRef?: ProvenanceRef;
  guidance?: Guidance;
};
