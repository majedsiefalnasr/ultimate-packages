export interface ComponentIdentity {
  name: string;
  category: string;
  description: string;
  schemaVersion: string;
  metadataVersion: number;
  packages: {
    ng?: { packageName: string; sourcePath: string };
    react?: { packageName: string; sourcePath: string };
    vue?: { packageName: string; sourcePath: string };
  };
}
