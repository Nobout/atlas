import { useEffect, useMemo, useState } from 'react';
import { GameView } from './components/GameView';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { QUIZZES } from './data/quizzes';
import { TRANSLATIONS } from './i18n/translations';
import type { Language, Theme } from './types/quiz';

export function App() {
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('light');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const activeQuiz = useMemo(
    () => QUIZZES.find((q) => q.id === activeQuizId) ?? null,
    [activeQuizId]
  );

  const t = TRANSLATIONS[language];

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div>
      <Header
        language={language}
        theme={theme}
        t={t}
        onSelectLanguage={setLanguage}
        onToggleTheme={handleToggleTheme}
        onNavigateHome={() => setActiveQuizId(null)}
      />

      {activeQuiz ? (
        <GameView
          key={activeQuiz.id}
          quiz={activeQuiz}
          language={language}
          t={t}
          onBackHome={() => setActiveQuizId(null)}
        />
      ) : (
        <HomeView
          language={language}
          t={t}
          onSelectQuiz={(quizId) => setActiveQuizId(quizId)}
        />
      )}
    </div>
  );
}

export default App;
