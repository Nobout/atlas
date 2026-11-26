import { useMemo, useState } from 'react';
import { QUIZZES } from '../data/quizzes';
import type { UITranslations } from '../i18n/translations';
import type { Language, QuizCategory, QuizConfig } from '../types/quiz';
import { MapPreview } from './MapPreview';
import styles from './HomeView.module.css';

interface HomeViewProps {
  language: Language;
  t: UITranslations;
  onSelectQuiz: (quizId: string) => void;
}

type CategoryFilter = 'all' | QuizCategory;

export function HomeView({ language, t, onSelectQuiz }: HomeViewProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState<string>('');

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return QUIZZES.filter((quiz) => {
      if (filter !== 'all' && quiz.category !== filter) return false;
      if (!query) return true;
      return (
        quiz.titles.fr.toLowerCase().includes(query) ||
        quiz.titles.en.toLowerCase().includes(query) ||
        quiz.descriptions[language].toLowerCase().includes(query)
      );
    });
  }, [filter, search, language]);

  const handleCardClick = (quiz: QuizConfig) => {
    onSelectQuiz(quiz.id);
  };

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{t.appName}</h1>
        <p className={styles.subtitle}>{t.tagline}</p>

        <div className={styles.toolbar}>
          <div className={styles.filters} role="tablist" aria-label="Category filter">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={`${styles.filterPill} ${filter === 'all' ? styles.filterActive : ''}`}
              onClick={() => setFilter('all')}
            >
              {t.filterAll}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'world'}
              className={`${styles.filterPill} ${filter === 'world' ? styles.filterActive : ''}`}
              onClick={() => setFilter('world')}
            >
              {t.filterWorld}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'france'}
              className={`${styles.filterPill} ${filter === 'france' ? styles.filterActive : ''}`}
              onClick={() => setFilter('france')}
            >
              {t.filterFrance}
            </button>
          </div>

          <div className={styles.searchWrapper}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              className={styles.searchInput}
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t.searchPlaceholder}
            />
          </div>
        </div>
      </section>

      {filteredQuizzes.length === 0 ? (
        <div className={styles.emptyState}>{t.noQuizzesFound}</div>
      ) : (
        <section className={styles.masonryGrid} aria-label="Quizzes">
          {filteredQuizzes.map((quiz) => (
            <article key={quiz.id} className={styles.card}>
              <button
                type="button"
                className={styles.cardButton}
                onClick={() => handleCardClick(quiz)}
              >
                <div
                  className={`${styles.previewBox} ${
                    quiz.mapType === 'world' ? styles.previewWide : styles.previewTall
                  }`}
                >
                  <MapPreview quiz={quiz} />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryBadge}>
                      {quiz.category === 'world' ? t.filterWorld : t.filterFrance}
                    </span>
                    <span className={`${styles.countBadge} tabular-nums`}>
                      {t.territoriesCount(quiz.territoryIds.length)}
                    </span>
                  </div>

                  <h2 className={styles.cardTitle}>{quiz.titles[language]}</h2>
                  <p className={styles.cardDescription}>{quiz.descriptions[language]}</p>

                  <span className={styles.cardCta}>
                    {t.playQuiz}
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
