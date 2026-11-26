import type { QuizConfig } from '../types/quiz';
import { FRANCE_DEPARTMENT_GROUPS, FRANCE_DEPARTMENTS } from './franceDepartments';
import { FRANCE_REGION_GROUPS, FRANCE_REGIONS } from './franceRegions';
import { FRANCE_DEPARTMENTS_VIEWBOX } from './maps/franceDepartmentsPaths';
import { FRANCE_REGIONS_VIEWBOX } from './maps/franceRegionsPaths';
import { CONTINENT_GROUPS, WORLD_COUNTRIES } from './worldCountries';

const byGroup = (groupId: string): string[] =>
  WORLD_COUNTRIES.filter((c) => c.groupId === groupId).map((c) => c.id);

const singleGroup = (groupId: string) =>
  CONTINENT_GROUPS.filter((g) => g.id === groupId);

export const QUIZZES: QuizConfig[] = [
  {
    id: 'world-all',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: 'Pays du monde',
      en: 'Countries of the World',
    },
    descriptions: {
      fr: 'Nommez tous les pays souverains représentés sur la carte mondiale.',
      en: 'Name all sovereign countries represented on the world map.',
    },
    viewBox: '0 0 2000 857',
    defaultCountdownSeconds: 900,
    territoryIds: WORLD_COUNTRIES.map((c) => c.id),
    groups: CONTINENT_GROUPS,
  },
  {
    id: 'world-europe',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: "Pays d'Europe",
      en: 'Countries of Europe',
    },
    descriptions: {
      fr: "Retrouvez l'ensemble des pays d'Europe du Portugal à l'Oural.",
      en: 'Find all European countries from Iceland and Portugal to Eastern Europe.',
    },
    viewBox: '865 45 360 250',
    defaultCountdownSeconds: 480,
    territoryIds: byGroup('europe'),
    groups: singleGroup('europe'),
  },
  {
    id: 'world-asia',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: "Pays d'Asie",
      en: 'Countries of Asia',
    },
    descriptions: {
      fr: 'De la Turquie au Japon, localisez tous les pays du continent asiatique.',
      en: 'From Turkey to Japan, identify every country across Asia.',
    },
    viewBox: '1145 45 650 545',
    defaultCountdownSeconds: 480,
    territoryIds: byGroup('asia'),
    groups: singleGroup('asia'),
  },
  {
    id: 'world-africa',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: "Pays d'Afrique",
      en: 'Countries of Africa',
    },
    descriptions: {
      fr: 'Identifiez les 54 pays du continent africain et ses archipels.',
      en: 'Identify all 54 African countries and island nations.',
    },
    viewBox: '870 255 465 490',
    defaultCountdownSeconds: 480,
    territoryIds: byGroup('africa'),
    groups: singleGroup('africa'),
  },
  {
    id: 'world-north-america',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: "Pays d'Amérique du Nord",
      en: 'Countries of North America',
    },
    descriptions: {
      fr: 'Amérique du Nord, Amérique centrale et Caraïbes.',
      en: 'North America, Central America, and the Caribbean.',
    },
    viewBox: '85 45 615 440',
    defaultCountdownSeconds: 300,
    territoryIds: byGroup('north_america'),
    groups: singleGroup('north_america'),
  },
  {
    id: 'world-south-america',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: "Pays d'Amérique du Sud",
      en: 'Countries of South America',
    },
    descriptions: {
      fr: 'Les 12 États souverains du continent sud-américain.',
      en: 'All 12 sovereign nations of South America.',
    },
    viewBox: '480 410 345 445',
    defaultCountdownSeconds: 180,
    territoryIds: byGroup('south_america'),
    groups: singleGroup('south_america'),
  },
  {
    id: 'world-oceania',
    category: 'world',
    mapType: 'world',
    titles: {
      fr: "Pays d'Océanie",
      en: 'Countries of Oceania',
    },
    descriptions: {
      fr: "Australie, Nouvelle-Zélande et nations insulaires du Pacifique.",
      en: 'Australia, New Zealand, and Pacific island nations.',
    },
    viewBox: '1540 430 460 390',
    defaultCountdownSeconds: 240,
    territoryIds: byGroup('oceania'),
    groups: singleGroup('oceania'),
  },
  {
    id: 'france-regions',
    category: 'france',
    mapType: 'france-regions',
    titles: {
      fr: 'Régions de France',
      en: 'Regions of France',
    },
    descriptions: {
      fr: 'Les 13 régions métropolitaines et les 5 DROM en encart.',
      en: 'All 13 metropolitan regions plus the 5 overseas regions (DROM).',
    },
    viewBox: FRANCE_REGIONS_VIEWBOX,
    defaultCountdownSeconds: 240,
    territoryIds: FRANCE_REGIONS.map((r) => r.id),
    groups: FRANCE_REGION_GROUPS,
  },
  {
    id: 'france-departments-names',
    category: 'france',
    mapType: 'france-departments',
    titles: {
      fr: 'Départements de France (Noms)',
      en: 'Departments of France (Names)',
    },
    descriptions: {
      fr: 'Les 101 départements français (validation par nom uniquement).',
      en: 'All 101 French departments (validated by name only).',
    },
    viewBox: FRANCE_DEPARTMENTS_VIEWBOX,
    defaultCountdownSeconds: 720,
    acceptDepartmentCode: false,
    displayCodeInTable: false,
    territoryIds: FRANCE_DEPARTMENTS.map((d) => d.id),
    groups: FRANCE_DEPARTMENT_GROUPS,
  },
  {
    id: 'france-departments-codes',
    category: 'france',
    mapType: 'france-departments',
    titles: {
      fr: 'Départements de France (Noms + Numéros)',
      en: 'Departments of France (Names + Numbers)',
    },
    descriptions: {
      fr: 'Les 101 départements français (nom ou code postal/départemental accepté).',
      en: 'All 101 French departments (name or department code accepted).',
    },
    viewBox: FRANCE_DEPARTMENTS_VIEWBOX,
    defaultCountdownSeconds: 600,
    acceptDepartmentCode: true,
    displayCodeInTable: true,
    territoryIds: FRANCE_DEPARTMENTS.map((d) => d.id),
    groups: FRANCE_DEPARTMENT_GROUPS,
  },
];

export function getTerritoriesForQuiz(quiz: QuizConfig) {
  if (quiz.mapType === 'world') {
    const allowed = new Set(quiz.territoryIds);
    return WORLD_COUNTRIES.filter((c) => allowed.has(c.id));
  }
  if (quiz.mapType === 'france-regions') {
    return FRANCE_REGIONS;
  }
  return FRANCE_DEPARTMENTS;
}
