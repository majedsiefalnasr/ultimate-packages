export interface PropFact {
  name: string;
  type: string;
  default?: string;
  required: boolean;
  description?: string;
}

export interface EventFact {
  semanticId: string;
  frameworkName: string;
  mechanism: "output" | "callback-prop" | "emit";
  payloadDescription?: string;
}

export interface FrameworkApi {
  props: PropFact[];
  events: EventFact[];
}

export interface ComponentApi {
  ng?: FrameworkApi;
  react?: FrameworkApi;
  vue?: FrameworkApi;
}
