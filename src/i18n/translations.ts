import type { Language } from '../types/quiz';

export interface UITranslations {
  appName: string;
  tagline: string;
  themeLight: string;
  themeDark: string;
  toggleThemeAria: string;
  filterAll: string;
  filterWorld: string;
  filterFrance: string;
  searchPlaceholder: string;
  noQuizzesFound: string;
  territoriesCount: (count: number) => string;
  playQuiz: string;
  backToHome: string;
  inputPlaceholder: string;
  inputPlaceholderCodes: string;
  alreadyFound: (name: string) => string;
  timerModeStopwatch: string;
  timerModeCountdown: string;
  timerModeUnlimited: string;
  giveUp: string;
  playAgain: string;
  victoryTitle: string;
  victorySubtitle: (time: string, total: number) => string;
  abandonedTitle: string;
  abandonedSubtitle: (found: number, total: number) => string;
  timeUpTitle: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  answersTableTitle: string;
  foundLabel: string;
  missedLabel: string;
  remainingLabel: string;
}

export const TRANSLATIONS: Record<Language, UITranslations> = {
  fr: {
    appName: 'GeoAtlas Quiz',
    tagline: 'Testez vos connaissances géographiques sur cartes vectorielles interactives.',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    toggleThemeAria: 'Basculer le thème clair ou sombre',
    filterAll: 'Tous',
    filterWorld: 'Monde',
    filterFrance: 'France',
    searchPlaceholder: 'Rechercher un quiz...',
    noQuizzesFound: 'Aucun quiz ne correspond à votre recherche.',
    territoriesCount: (count: number) => `${count} territoires`,
    playQuiz: 'Jouer',
    backToHome: 'Accueil',
    inputPlaceholder: 'Tapez un nom de territoire...',
    inputPlaceholderCodes: 'Tapez un nom ou un code (ex: 21, 2A, 971)...',
    alreadyFound: (name: string) => `${name} déjà trouvé`,
    timerModeStopwatch: 'Chrono',
    timerModeCountdown: 'Rebours',
    timerModeUnlimited: 'Illimité',
    giveUp: 'Abandonner',
    playAgain: 'Rejouer',
    victoryTitle: 'Félicitations !',
    victorySubtitle: (time: string, total: number) =>
      `Vous avez trouvé les ${total} territoires en ${time}.`,
    abandonedTitle: 'Partie terminée',
    abandonedSubtitle: (found: number, total: number) =>
      `Score final : ${found} / ${total} territoires trouvés.`,
    timeUpTitle: 'Temps écoulé !',
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    resetView: 'Recentrer la carte',
    answersTableTitle: 'Tableau des réponses',
    foundLabel: 'Trouvés',
    missedLabel: 'Manqués',
    remainingLabel: 'Restants',
  },
  en: {
    appName: 'GeoAtlas Quiz',
    tagline: 'Test your geography knowledge on interactive vector maps.',
    themeLight: 'Light',
    themeDark: 'Dark',
    toggleThemeAria: 'Toggle light or dark theme',
    filterAll: 'All',
    filterWorld: 'World',
    filterFrance: 'France',
    searchPlaceholder: 'Search a quiz...',
    noQuizzesFound: 'No quizzes match your search.',
    territoriesCount: (count: number) => `${count} territories`,
    playQuiz: 'Play',
    backToHome: 'Home',
    inputPlaceholder: 'Type a territory name...',
    inputPlaceholderCodes: 'Type a name or code (e.g. 21, 2A, 971)...',
    alreadyFound: (name: string) => `${name} already found`,
    timerModeStopwatch: 'Stopwatch',
    timerModeCountdown: 'Countdown',
    timerModeUnlimited: 'Unlimited',
    giveUp: 'Give Up',
    playAgain: 'Play Again',
    victoryTitle: 'Congratulations!',
    victorySubtitle: (time: string, total: number) =>
      `You found all ${total} territories in ${time}.`,
    abandonedTitle: 'Quiz Ended',
    abandonedSubtitle: (found: number, total: number) =>
      `Final score: ${found} / ${total} territories found.`,
    timeUpTitle: "Time's Up!",
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset map view',
    answersTableTitle: 'Answers Table',
    foundLabel: 'Found',
    missedLabel: 'Missed',
    remainingLabel: 'Remaining',
  },
};
