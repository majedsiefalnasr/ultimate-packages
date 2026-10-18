// scripts/perf/stage1-stats.mjs
//
// Shared statistics for the ADR-057 Stage 1 performance harness (Spec B4-R1).
// Pure functions, no I/O. Definitions (fixed here so every consumer agrees):
//
//   median  Midpoint average of the two middle values for even n; the middle
//           value for odd n.
//   p95     Nearest-rank: the value at 1-based rank ceil(0.95 * n) in
//           ascending order.
//   iqr     Q3 - Q1 by the inclusive median-of-halves method. Sort ascending.
//           For even n split into the lower and upper halves. For odd n the
//           median belongs to both halves. Q1 and Q3 are the medians of the
//           lower and upper half. Example: 1..10 gives Q1 3, Q3 8, iqr 5.
//   cv      Sample standard deviation (divisor n - 1) over the mean. It is 0
//           when n = 1 or when every sample is equal (this also covers an
//           all-zero series, where the mean would otherwise be 0).
//   sameCommitDiff
//           Compares two runs of the same commit by each run's median:
//           medianDelta = median(B) - median(A) and
//           relativeDelta = medianDelta / median(A).

function sortedCopy(samples) {
  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error("stage1-stats: no samples");
  }
  if (!samples.every((value) => Number.isFinite(value))) {
    throw new Error("stage1-stats: samples must be finite numbers");
  }
  return [...samples].sort((a, b) => a - b);
}

function medianOfSorted(sorted) {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function interquartileRange(sorted) {
  const half = Math.floor(sorted.length / 2);
  const odd = sorted.length % 2 === 1;
  const lower = sorted.slice(0, odd ? half + 1 : half);
  const upper = sorted.slice(half);
  return medianOfSorted(upper) - medianOfSorted(lower);
}

function coefficientOfVariation(sorted) {
  const n = sorted.length;
  if (n === 1 || sorted[0] === sorted[n - 1]) return 0;
  const mean = sorted.reduce((sum, value) => sum + value, 0) / n;
  const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance) / mean;
}

/** @param {number[]} samples @returns {{ n: number, median: number, p95: number, iqr: number, cv: number }} */
export function summarize(samples) {
  const sorted = sortedCopy(samples);
  const n = sorted.length;
  return {
    n,
    median: medianOfSorted(sorted),
    p95: sorted[Math.ceil(0.95 * n) - 1],
    iqr: interquartileRange(sorted),
    cv: coefficientOfVariation(sorted),
  };
}

/** @param {number[]} runA @param {number[]} runB @returns {{ medianDelta: number, relativeDelta: number }} */
export function sameCommitDiff(runA, runB) {
  const medianA = medianOfSorted(sortedCopy(runA));
  const medianB = medianOfSorted(sortedCopy(runB));
  const medianDelta = medianB - medianA;
  return { medianDelta, relativeDelta: medianDelta / medianA };
}
