// Compares each compatibility-manifest entry's frameworkVersionRange with the
// published peerDependencies range of its Ultimate framework package (Spec B3-R2).

const PEER_KEY_BY_FRAMEWORK = {
  angular: "@angular/core",
  react: "react",
  vue: "vue",
};

/**
 * @param {Array<{framework: string, frameworkVersionRange: string, ultimateFrameworkPackage?: {name: string}}>} manifest
 * @param {Record<string, Record<string, string>>} peersByPackage package name -> peerDependencies
 * @returns {Array<{framework: string, manifestRange: string, peerRange: string | undefined}>}
 */
export function findPeerRangeMismatches(manifest, peersByPackage) {
  const mismatches = [];
  for (const entry of manifest) {
    const packageName = entry.ultimateFrameworkPackage?.name;
    const peerKey = PEER_KEY_BY_FRAMEWORK[entry.framework];
    const peerRange = peersByPackage[packageName]?.[peerKey];
    if (peerRange !== entry.frameworkVersionRange) {
      mismatches.push({
        framework: entry.framework,
        manifestRange: entry.frameworkVersionRange,
        peerRange,
      });
    }
  }
  return mismatches;
}
