/**
 * Computes Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure a is the shorter string to minimize memory
  let s1 = a;
  let s2 = b;
  if (s1.length > s2.length) {
    s1 = b;
    s2 = a;
  }

  const len1 = s1.length;
  const len2 = s2.length;
  let prevRow = new Array<number>(len1 + 1);
  let currRow = new Array<number>(len1 + 1);

  for (let i = 0; i <= len1; i++) {
    prevRow[i] = i;
  }

  for (let j = 1; j <= len2; j++) {
    currRow[0] = j;
    const ch2 = s2.charCodeAt(j - 1);

    for (let i = 1; i <= len1; i++) {
      const cost = s1.charCodeAt(i - 1) === ch2 ? 0 : 1;
      const del = (prevRow[i] ?? 0) + 1;
      const ins = (currRow[i - 1] ?? 0) + 1;
      const sub = (prevRow[i - 1] ?? 0) + cost;
      currRow[i] = Math.min(del, ins, sub);
    }

    const tmp = prevRow;
    prevRow = currRow;
    currRow = tmp;
  }

  return prevRow[len1] ?? len2;
}

/**
 * Dynamic typo tolerance based on normalized target length:
 * - < 5 chars: 0 typos allowed (exact match required)
 * - 5 to 8 chars: 1 typo allowed
 * - 9+ chars: 2 typos allowed
 */
export function getMaxAllowedTypos(normalizedTarget: string): number {
  const compactLength = normalizedTarget.replace(/\s+/g, '').length;
  if (compactLength < 5) return 0;
  if (compactLength <= 8) return 1;
  return 2;
}
