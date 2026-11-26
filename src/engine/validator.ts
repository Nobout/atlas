import type { Language, Territory } from '../types/quiz';
import { isExcludedMatch } from './exclusions';
import { getMaxAllowedTypos, levenshteinDistance } from './levenshtein';
import { normalizeDepartmentCode, normalizeText } from './normalize';

export interface ValidationMatch {
  status: 'matched' | 'already_found' | 'none';
  territory?: Territory;
}

export interface ValidationOptions {
  language: Language;
  acceptDepartmentCode?: boolean;
  allowTrailingPrefixFuzzy?: boolean;
}

interface CandidateEntry {
  territory: Territory;
  normalized: string;
}

/**
 * Validates user input against a quiz's territories in the active language.
 * Priority:
 * 1. Exact department code match (if enabled)
 * 2. Exact normalized name/alias match (unfound first, then already found)
 * 3. Fuzzy Levenshtein match respecting length thresholds, exclusion blacklist,
 *    and prefix guard (so fast typers don't get prematurely matched mid-word)
 */
export function validateTerritoryInput(
  rawInput: string,
  territories: Territory[],
  foundIds: ReadonlySet<string>,
  options: ValidationOptions
): ValidationMatch {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { status: 'none' };
  }

  // 1. Department code check (mode 10)
  if (options.acceptDepartmentCode) {
    const normalizedCode = normalizeDepartmentCode(trimmed);
    const codeMatch = territories.find(
      (t) => t.code && t.code.toLowerCase() === normalizedCode
    );
    if (codeMatch) {
      return foundIds.has(codeMatch.id)
        ? { status: 'already_found', territory: codeMatch }
        : { status: 'matched', territory: codeMatch };
    }
  }

  const normalizedInput = normalizeText(trimmed);
  if (!normalizedInput) {
    return { status: 'none' };
  }

  const candidates: CandidateEntry[] = [];
  for (const territory of territories) {
    const names = [territory.names[options.language], ...territory.aliases[options.language]];
    for (const name of names) {
      const norm = normalizeText(name);
      if (norm) {
        candidates.push({ territory, normalized: norm });
      }
    }
  }

  // 2. Exact normalized match
  const exactUnfound = candidates.find(
    (c) => !foundIds.has(c.territory.id) && c.normalized === normalizedInput
  );
  if (exactUnfound) {
    return { status: 'matched', territory: exactUnfound.territory };
  }

  const exactFound = candidates.find(
    (c) => foundIds.has(c.territory.id) && c.normalized === normalizedInput
  );
  if (exactFound) {
    return { status: 'already_found', territory: exactFound.territory };
  }

  // 3. Fuzzy Levenshtein match on unfound territories
  // Skip fuzzy if input is too short (< 4 chars)
  if (normalizedInput.replace(/\s+/g, '').length < 4) {
    return { status: 'none' };
  }

  let bestMatch: { territory: Territory; distance: number } | null = null;

  for (const candidate of candidates) {
    if (foundIds.has(candidate.territory.id)) continue;

    if (isExcludedMatch(normalizedInput, candidate.normalized)) {
      continue;
    }

    const maxTypos = getMaxAllowedTypos(candidate.normalized);
    if (maxTypos === 0) continue;

    // Prefix guard: if user is still typing a prefix of the target, don't auto-submit on keystroke
    if (
      !options.allowTrailingPrefixFuzzy &&
      candidate.normalized.startsWith(normalizedInput) &&
      normalizedInput.length < candidate.normalized.length
    ) {
      continue;
    }

    if (Math.abs(normalizedInput.length - candidate.normalized.length) > maxTypos) {
      continue;
    }

    const dist = levenshteinDistance(normalizedInput, candidate.normalized);
    if (dist > 0 && dist <= maxTypos) {
      if (!bestMatch || dist < bestMatch.distance) {
        bestMatch = { territory: candidate.territory, distance: dist };
      }
    }
  }

  if (bestMatch) {
    return { status: 'matched', territory: bestMatch.territory };
  }

  return { status: 'none' };
}
