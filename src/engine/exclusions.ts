import { normalizeText } from './normalize';

/**
 * Bidirectional exclusion pairs to prevent false positives between similar names.
 * Keys and values are normalized names or territory IDs.
 */
const EXCLUSION_NAME_GROUPS: string[][] = [
  ['niger', 'nigeria'],
  ['irak', 'iraq', 'iran'],
  ['somalie', 'somalia', 'somaliland'],
  ['autriche', 'austria', 'australie', 'australia'],
  ['inde', 'india', 'indre', 'indre et loire'],
  ['loire', 'loiret', 'haute loire', 'loir et cher'],
  ['mali', 'malawi'],
  ['oman', 'roumanie', 'romania'],
  ['tchad', 'chad', 'chine', 'china'],
  ['chili', 'chile', 'chine', 'china'],
  ['soudan', 'sudan', 'soudan du sud', 'south sudan'],
  ['guinee', 'guinea', 'guinee bissau', 'guinea bissau', 'guinee equatoriale', 'equatorial guinea', 'guyane', 'guyana', 'papouasie nouvelle guinee', 'papua new guinea'],
  ['congo', 'republique du congo', 'republic of congo', 'republique democratique du congo', 'democratic republic of the congo'],
  ['coree du nord', 'north korea', 'coree du sud', 'south korea'],
  ['suede', 'sweden', 'suisse', 'switzerland'],
  ['slovenie', 'slovenia', 'slovaquie', 'slovakia'],
  ['lettonie', 'latvia', 'lituanie', 'lithuania'],
  ['zambie', 'zambia', 'gambie', 'gambia'],
  ['senegal', 'nepal'],
  ['mauritanie', 'mauritania', 'maurice', 'mauritius'],
  ['dominique', 'dominica', 'republique dominicaine', 'dominican republic'],
  ['savoie', 'haute savoie'],
  ['corse du sud', 'haute corse'],
  ['bas rhin', 'haut rhin'],
  ['pyrenees atlantiques', 'hautes pyrenees', 'pyrenees orientales'],
  ['alpes de haute provence', 'hautes alpes', 'alpes maritimes'],
  ['haute garonne', 'lot et garonne', 'tarn et garonne'],
  ['marne', 'haute marne', 'seine et marne', 'val de marne'],
  ['seine maritime', 'seine saint denis', 'hauts de seine', 'seine et marne'],
  ['charente', 'charente maritime'],
  ['saone et loire', 'haute saone'],
  ['vienne', 'haute vienne'],
  ['aude', 'aube'],
  ['tarn', 'tarn et garonne'],
  ['lot', 'lot et garonne'],
  ['cher', 'loir et cher'],
  ['eure', 'eure et loir'],
  ['ain', 'aisne'],
  ['oise', 'val d oise'],
  ['cote d or', 'cotes d armor'],
];

const EXCLUSION_MAP = new Map<string, Set<string>>();

for (const group of EXCLUSION_NAME_GROUPS) {
  const normalizedGroup = group.map(normalizeText);
  for (const item of normalizedGroup) {
    const existing = EXCLUSION_MAP.get(item) ?? new Set<string>();
    for (const other of normalizedGroup) {
      if (other !== item) {
        existing.add(other);
      }
    }
    EXCLUSION_MAP.set(item, existing);
  }
}

/**
 * Checks whether a normalized input is explicitly blocked from matching a given candidate.
 */
export function isExcludedMatch(
  normalizedInput: string,
  normalizedCandidate: string
): boolean {
  const blockedTargets = EXCLUSION_MAP.get(normalizedInput);
  if (blockedTargets && blockedTargets.has(normalizedCandidate)) {
    return true;
  }

  // Also block if input is an exact external name (e.g. "inde" or "somaliland")
  // that appears in an exclusion group with the candidate
  for (const [term, others] of EXCLUSION_MAP.entries()) {
    if (normalizedInput === term && others.has(normalizedCandidate)) {
      return true;
    }
  }

  return false;
}
