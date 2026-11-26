export type Language = 'fr' | 'en';

export type Theme = 'light' | 'dark';

export type QuizCategory = 'world' | 'france';

export type MapType = 'world' | 'france-regions' | 'france-departments';

export type TimerMode = 'stopwatch' | 'countdown' | 'unlimited';

export type GameStatus = 'playing' | 'won' | 'abandoned';

export interface LocalizedText {
  fr: string;
  en: string;
}

export interface Territory {
  id: string;
  code?: string;
  names: LocalizedText;
  aliases: {
    fr: string[];
    en: string[];
  };
  groupId: string;
  colorIndex: number;
}

export interface TerritoryGroup {
  id: string;
  names: LocalizedText;
}

export interface QuizConfig {
  id: string;
  category: QuizCategory;
  mapType: MapType;
  titles: LocalizedText;
  descriptions: LocalizedText;
  viewBox: string;
  defaultCountdownSeconds: number;
  acceptDepartmentCode?: boolean;
  displayCodeInTable?: boolean;
  territoryIds: string[];
  groups: TerritoryGroup[];
}

export interface SvgPathEntry {
  id: string;
  d: string;
  isInset?: boolean;
}

export interface SvgInsetBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: LocalizedText;
  territoryId?: string;
}
