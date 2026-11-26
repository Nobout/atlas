import type { UITranslations } from '../i18n/translations';
import type { Language, Theme } from '../types/quiz';
import styles from './Header.module.css';

interface HeaderProps {
  language: Language;
  theme: Theme;
  t: UITranslations;
  onSelectLanguage: (lang: Language) => void;
  onToggleTheme: () => void;
  onNavigateHome: () => void;
}

export function Header({
  language,
  theme,
  t,
  onSelectLanguage,
  onToggleTheme,
  onNavigateHome,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.brandButton}
          onClick={onNavigateHome}
        >
          <span className={styles.logoMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8" />
              <path d="M12 3a14.5 14.5 0 0 0 0 18M12 3a14.5 14.5 0 0 1 0 18" />
            </svg>
          </span>
          <span className={styles.brandName}>{t.appName}</span>
        </button>

        <div className={styles.controls}>
          <div className={styles.langSwitch} role="group" aria-label="Language">
            <button
              type="button"
              className={`${styles.langButton} ${language === 'fr' ? styles.langActive : ''}`}
              onClick={() => onSelectLanguage('fr')}
              aria-pressed={language === 'fr'}
            >
              FR
            </button>
            <span className={styles.langDivider} aria-hidden="true">|</span>
            <button
              type="button"
              className={`${styles.langButton} ${language === 'en' ? styles.langActive : ''}`}
              onClick={() => onSelectLanguage('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            className={styles.themeButton}
            onClick={onToggleTheme}
            aria-label={t.toggleThemeAria}
            title={theme === 'light' ? t.themeDark : t.themeLight}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
            <span>{theme === 'light' ? t.themeDark : t.themeLight}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
