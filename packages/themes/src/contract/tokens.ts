export type ColorScale = {
  0?: string;
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
};

export interface PrimitiveTokens {
  [key: string]: ColorScale | Record<string, string> | string | undefined;
}

export interface SemanticColorScheme<T = Record<string, unknown>> {
  light: T;
  dark: T;
}

export interface SemanticTokens<T = Record<string, unknown>> {
  colorScheme: SemanticColorScheme<T>;
  [key: string]: unknown;
}

export interface ComponentTokens<T = Record<string, unknown>> {
  root?: Record<string, unknown>;
  colorScheme: SemanticColorScheme<T>;
}
