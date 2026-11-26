const ABBREVIATION_MAP: Record<string, string> = {
  st: 'saint',
  ste: 'sainte',
};

/**
 * Normalizes user input or territory names for language-tolerant comparison:
 * - lowercases
 * - expands ligatures (œ -> oe, æ -> ae, ß -> ss)
 * - strips diacritics/accents
 * - replaces punctuation (hyphens, apostrophes, dots, slashes) with spaces
 * - expands common abbreviations (st -> saint, ste -> sainte)
 */
export function normalizeText(value: string): string {
  const expanded = value
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`\-–—.,/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!expanded) return '';

  return expanded
    .split(' ')
    .map((token) => ABBREVIATION_MAP[token] ?? token)
    .join(' ');
}

/**
 * Normalizes a French department code input (e.g. "1" -> "01", "2a" -> "2a").
 */
export function normalizeDepartmentCode(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/\s+/g, '');
  if (/^\d$/.test(cleaned)) {
    return `0${cleaned}`;
  }
  return cleaned;
}
