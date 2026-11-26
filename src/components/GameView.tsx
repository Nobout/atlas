import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTerritoriesForQuiz } from '../data/quizzes';
import { validateTerritoryInput } from '../engine/validator';
import type { UITranslations } from '../i18n/translations';
import type { GameStatus, Language, QuizConfig, TimerMode } from '../types/quiz';
import { AnswersTable } from './AnswersTable';
import styles from './GameView.module.css';
import { InteractiveMap } from './InteractiveMap';

interface GameViewProps {
  quiz: QuizConfig;
  language: Language;
  t: UITranslations;
  onBackHome: () => void;
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function GameView({ quiz, language, t, onBackHome }: GameViewProps) {
  const territories = useMemo(() => getTerritoriesForQuiz(quiz), [quiz]);

  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<GameStatus>('playing');
  const [timedOut, setTimedOut] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'duplicate' | 'found';
  } | null>(null);

  const [timerMode, setTimerMode] = useState<TimerMode>('stopwatch');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetGame = useCallback(
    (nextMode?: TimerMode) => {
      setFoundIds(new Set());
      setStatus('playing');
      setTimedOut(false);
      setInputValue('');
      setFeedback(null);
      setElapsedSeconds(0);
      setHasStarted(false);
      setHighlightedId(null);
      if (nextMode) {
        setTimerMode(nextMode);
      }
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    []
  );

  // Focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer tick
  useEffect(() => {
    if (status !== 'playing' || !hasStarted || timerMode === 'unlimited') {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (timerMode === 'countdown' && next >= quiz.defaultCountdownSeconds) {
          setStatus('abandoned');
          setTimedOut(true);
          return quiz.defaultCountdownSeconds;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status, hasStarted, timerMode, quiz.defaultCountdownSeconds]);

  // Auto-clear duplicate/found pill feedback
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 1600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const tryValidate = useCallback(
    (value: string, allowTrailingPrefixFuzzy: boolean) => {
      if (status !== 'playing') return false;

      const result = validateTerritoryInput(value, territories, foundIds, {
        language,
        acceptDepartmentCode: quiz.acceptDepartmentCode,
        allowTrailingPrefixFuzzy,
      });

      if (result.status === 'matched' && result.territory) {
        const matched = result.territory;
        const nextFound = new Set(foundIds);
        nextFound.add(matched.id);
        setFoundIds(nextFound);
        setInputValue('');
        setFeedback({
          text: matched.names[language],
          type: 'found',
        });

        if (nextFound.size === territories.length) {
          setStatus('won');
        }
        return true;
      }

      if (result.status === 'already_found' && result.territory) {
        setFeedback({
          text: t.alreadyFound(result.territory.names[language]),
          type: 'duplicate',
        });
      }

      return false;
    },
    [status, territories, foundIds, language, quiz.acceptDepartmentCode, t]
  );

  // Delayed trailing-prefix fuzzy check when user pauses typing
  useEffect(() => {
    if (status !== 'playing' || inputValue.trim().length < 4) return;
    const timer = window.setTimeout(() => {
      tryValidate(inputValue, true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [inputValue, status, tryValidate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!hasStarted && val.trim().length > 0) {
      setHasStarted(true);
    }
    tryValidate(val, false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryValidate(inputValue, true);
    }
  };

  const handleGiveUp = () => {
    setStatus('abandoned');
    setTimedOut(false);
  };

  const handleModeSwitch = (mode: TimerMode) => {
    if (status !== 'playing' || foundIds.size > 0 || hasStarted) return;
    setTimerMode(mode);
    setElapsedSeconds(0);
    inputRef.current?.focus();
  };

  const displayedTime = useMemo(() => {
    if (timerMode === 'unlimited') return '∞';
    if (timerMode === 'countdown') {
      return formatDuration(quiz.defaultCountdownSeconds - elapsedSeconds);
    }
    return formatDuration(elapsedSeconds);
  }, [timerMode, elapsedSeconds, quiz.defaultCountdownSeconds]);

  const canChangeTimerMode = status === 'playing' && !hasStarted && foundIds.size === 0;

  return (
    <main className={styles.page}>
      {/* Sticky Control Bar */}
      <div className={styles.controlBar}>
        <div className={styles.controlBarInner}>
          <div className={styles.leftMeta}>
            <button
              type="button"
              className={styles.backButton}
              onClick={onBackHome}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{t.backToHome}</span>
            </button>
            <h1 className={styles.quizTitle}>{quiz.titles[language]}</h1>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                className={styles.answerInput}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                disabled={status !== 'playing'}
                placeholder={
                  quiz.acceptDepartmentCode
                    ? t.inputPlaceholderCodes
                    : t.inputPlaceholder
                }
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {feedback && (
                <span
                  className={`${styles.feedbackPill} ${
                    feedback.type === 'duplicate'
                      ? styles.feedbackDuplicate
                      : styles.feedbackFound
                  }`}
                >
                  {feedback.text}
                </span>
              )}
            </div>
          </div>

          <div className={styles.statsGroup}>
            <div className={`${styles.scoreBadge} tabular-nums`}>
              <span>{foundIds.size}</span>
              <span className={styles.scoreSlash}>/</span>
              <span>{territories.length}</span>
            </div>

            <div className={styles.timerGroup}>
              {canChangeTimerMode && (
                <div className={styles.timerModeSwitch} role="group" aria-label="Timer mode">
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${
                      timerMode === 'stopwatch' ? styles.modeActive : ''
                    }`}
                    onClick={() => handleModeSwitch('stopwatch')}
                  >
                    {t.timerModeStopwatch}
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${
                      timerMode === 'countdown' ? styles.modeActive : ''
                    }`}
                    onClick={() => handleModeSwitch('countdown')}
                  >
                    {t.timerModeCountdown}
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeBtn} ${
                      timerMode === 'unlimited' ? styles.modeActive : ''
                    }`}
                    onClick={() => handleModeSwitch('unlimited')}
                  >
                    {t.timerModeUnlimited}
                  </button>
                </div>
              )}

              <div
                className={`${styles.timerDisplay} tabular-nums ${
                  timerMode === 'countdown' &&
                  quiz.defaultCountdownSeconds - elapsedSeconds <= 30 &&
                  status === 'playing'
                    ? styles.timerUrgent
                    : ''
                }`}
              >
                {displayedTime}
              </div>
            </div>

            {status === 'playing' ? (
              <button
                type="button"
                className={styles.giveUpButton}
                onClick={handleGiveUp}
              >
                {t.giveUp}
              </button>
            ) : (
              <button
                type="button"
                className={styles.playAgainButton}
                onClick={() => resetGame()}
              >
                {t.playAgain}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.workspace}>
        {/* End-of-game banner */}
        {status !== 'playing' && (
          <div
            className={`${styles.resultBanner} ${
              status === 'won' ? styles.bannerSuccess : styles.bannerEnded
            }`}
            role="status"
          >
            <div>
              <h2 className={styles.bannerTitle}>
                {status === 'won'
                  ? t.victoryTitle
                  : timedOut
                  ? t.timeUpTitle
                  : t.abandonedTitle}
              </h2>
              <p className={styles.bannerSubtitle}>
                {status === 'won'
                  ? t.victorySubtitle(
                      timerMode === 'unlimited'
                        ? t.timerModeUnlimited
                        : formatDuration(elapsedSeconds),
                      territories.length
                    )
                  : t.abandonedSubtitle(foundIds.size, territories.length)}
              </p>
            </div>
            <button
              type="button"
              className={styles.playAgainButton}
              onClick={() => resetGame()}
            >
              {t.playAgain}
            </button>
          </div>
        )}

        {/* Interactive SVG Map */}
        <InteractiveMap
          quiz={quiz}
          territories={territories}
          foundIds={foundIds}
          status={status}
          language={language}
          t={t}
          highlightedTerritoryId={highlightedId}
          onHoverTerritory={setHighlightedId}
        />

        {/* Answers Table */}
        <AnswersTable
          quiz={quiz}
          territories={territories}
          foundIds={foundIds}
          status={status}
          language={language}
          t={t}
          highlightedTerritoryId={highlightedId}
          onHoverTerritory={setHighlightedId}
        />
      </div>
    </main>
  );
}
