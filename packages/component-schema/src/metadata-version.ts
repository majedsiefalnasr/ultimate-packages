import type { ComponentMetadata } from "./component-metadata";

/**
 * Per spec §5.1: metadataVersion increments by exactly 1 on any real content
 * change (generated facts or human-authored guidance, no distinction — one
 * shared counter), and does NOT increment on a no-op regeneration (identical
 * content) or on a schemaVersion-only change. Compares every field except
 * metadataVersion itself. The comparison technique below (JSON
 * serialization) is a private implementation detail of this one function —
 * not a canonicalization subsystem, not depended on by any other task.
 */
export function nextMetadataVersion(
  current: ComponentMetadata,
  next: Omit<ComponentMetadata, "metadataVersion">
): number {
  const { metadataVersion: _currentVersion, schemaVersion: _currentSchema, ...currentContent } = current;
  // `next`'s static type omits metadataVersion, but callers may still pass an
  // object that carries it at runtime (e.g. via object spread from a
  // ComponentMetadata) — strip it defensively so the comparison never keys
  // off a field this function has no business considering.
  const { metadataVersion: _nextVersion, schemaVersion: _nextSchema, ...nextContent } =
    next as ComponentMetadata;
  const changed = JSON.stringify(currentContent) !== JSON.stringify(nextContent);
  return changed ? current.metadataVersion + 1 : current.metadataVersion;
}
