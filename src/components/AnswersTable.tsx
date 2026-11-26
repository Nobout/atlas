import { useMemo } from 'react';
import type { UITranslations } from '../i18n/translations';
import type {
  GameStatus,
  Language,
  QuizConfig,
  Territory,
} from '../types/quiz';
import styles from './AnswersTable.module.css';

interface AnswersTableProps {
  quiz: QuizConfig;
  territories: Territory[];
  foundIds: ReadonlySet<string>;
  status: GameStatus;
  language: Language;
  t: UITranslations;
  highlightedTerritoryId: string | null;
  onHoverTerritory: (id: string | null) => void;
}

export function AnswersTable({
  quiz,
  territories,
  foundIds,
  status,
  language,
  t,
  highlightedTerritoryId,
  onHoverTerritory,
}: AnswersTableProps) {
  const groupedTerritories = useMemo(() => {
    const map = new Map<string, Territory[]>();
    for (const group of quiz.groups) {
      map.set(group.id, []);
    }
    for (const territory of territories) {
      const list = map.get(territory.groupId);
      if (list) {
        list.push(territory);
      }
    }

    return quiz.groups.map((group) => {
      const items = [...(map.get(group.id) ?? [])];
      if (quiz.displayCodeInTable) {
        items.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? ''));
      } else {
        items.sort((a, b) =>
          a.names[language].localeCompare(b.names[language], language)
        );
      }
      return { group, items };
    });
  }, [quiz.groups, quiz.displayCodeInTable, territories, language]);

  return (
    <section className={styles.section} aria-label={t.answersTableTitle}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t.answersTableTitle}</h2>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.swatchFound}`} />
            {t.foundLabel}
          </span>
          {status === 'abandoned' && (
            <span className={styles.legendItem}>
              <span className={`${styles.legendSwatch} ${styles.swatchMissed}`} />
              {t.missedLabel}
            </span>
          )}
          <span className={styles.legendItem}>
            <span className={`${styles.legendSwatch} ${styles.swatchEmpty}`} />
            {t.remainingLabel}
          </span>
        </div>
      </div>

      <div
        className={`${styles.groupsGrid} ${
          groupedTerritories.length === 1 ? styles.singleGroupGrid : ''
        }`}
      >
        {groupedTerritories.map(({ group, items }) => {
          const foundInGroup = items.filter((item) => foundIds.has(item.id)).length;
          return (
            <div key={group.id} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupTitle}>{group.names[language]}</h3>
                <span className={`${styles.groupCount} tabular-nums`}>
                  {foundInGroup} / {items.length}
                </span>
              </div>

              <ul
                className={`${styles.cellsList} ${
                  groupedTerritories.length === 1 ? styles.multiColCells : ''
                }`}
              >
                {items.map((item) => {
                  const isFound = foundIds.has(item.id);
                  const isMissed = !isFound && status === 'abandoned';
                  const isRevealed = isFound || isMissed;
                  const isHighlighted = highlightedTerritoryId === item.id;

                  const displayText =
                    quiz.displayCodeInTable && item.code
                      ? `${item.code} — ${item.names[language]}`
                      : item.names[language];

                  return (
                    <li
                      key={item.id}
                      className={`${styles.cell} ${
                        isFound
                          ? styles.cellFound
                          : isMissed
                          ? styles.cellMissed
                          : styles.cellEmpty
                      } ${isHighlighted ? styles.cellHighlighted : ''}`}
                      onMouseEnter={() => {
                        if (isRevealed) onHoverTerritory(item.id);
                      }}
                      onMouseLeave={() => onHoverTerritory(null)}
                    >
                      {isRevealed ? (
                        <span className={styles.cellText}>{displayText}</span>
                      ) : (
                        <span className={styles.cellPlaceholder} aria-hidden="true">
                          &nbsp;
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
