import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FRANCE_DEPARTMENTS_INSETS,
  FRANCE_DEPARTMENTS_PATHS,
} from '../data/maps/franceDepartmentsPaths';
import {
  FRANCE_REGIONS_INSETS,
  FRANCE_REGIONS_PATHS,
} from '../data/maps/franceRegionsPaths';
import { WORLD_PATHS } from '../data/maps/worldPaths';
import type { UITranslations } from '../i18n/translations';
import type {
  GameStatus,
  Language,
  QuizConfig,
  SvgInsetBox,
  SvgPathEntry,
  Territory,
} from '../types/quiz';
import styles from './InteractiveMap.module.css';

interface ViewBoxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function parseViewBox(vb: string): ViewBoxRect {
  const parts = vb.trim().split(/\s+/).map(Number);
  return {
    x: parts[0] ?? 0,
    y: parts[1] ?? 0,
    w: parts[2] ?? 1000,
    h: parts[3] ?? 800,
  };
}

interface InteractiveMapProps {
  quiz: QuizConfig;
  territories: Territory[];
  foundIds: ReadonlySet<string>;
  status: GameStatus;
  language: Language;
  t: UITranslations;
  highlightedTerritoryId: string | null;
  onHoverTerritory: (id: string | null) => void;
}

export function InteractiveMap({
  quiz,
  territories,
  foundIds,
  status,
  language,
  t,
  highlightedTerritoryId,
  onHoverTerritory,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const initialBox = useMemo(() => parseViewBox(quiz.viewBox), [quiz.viewBox]);
  const [viewBox, setViewBox] = useState<ViewBoxRect>(initialBox);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    box: ViewBoxRect;
  } | null>(null);

  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    isMissed: boolean;
  } | null>(null);

  const { paths, insets, fullBounds } = useMemo((): {
    paths: SvgPathEntry[];
    insets: SvgInsetBox[];
    fullBounds: ViewBoxRect;
  } => {
    if (quiz.mapType === 'world') {
      return {
        paths: WORLD_PATHS,
        insets: [],
        fullBounds: { x: 0, y: 0, w: 2000, h: 857 },
      };
    }
    if (quiz.mapType === 'france-regions') {
      return {
        paths: FRANCE_REGIONS_PATHS,
        insets: FRANCE_REGIONS_INSETS,
        fullBounds: initialBox,
      };
    }
    return {
      paths: FRANCE_DEPARTMENTS_PATHS,
      insets: FRANCE_DEPARTMENTS_INSETS,
      fullBounds: initialBox,
    };
  }, [quiz.mapType, initialBox]);

  const territoryById = useMemo(() => {
    const map = new Map<string, Territory>();
    for (const item of territories) {
      map.set(item.id, item);
    }
    return map;
  }, [territories]);

  const clampBox = useCallback(
    (box: ViewBoxRect): ViewBoxRect => {
      const minW = Math.min(initialBox.w, fullBounds.w) * 0.12;
      const maxW = fullBounds.w * 1.15;
      const w = Math.max(minW, Math.min(maxW, box.w));
      const aspect = initialBox.h / initialBox.w;
      const h = w * aspect;

      const padX = w * 0.35;
      const padY = h * 0.35;
      const minX = fullBounds.x - padX;
      const maxX = fullBounds.x + fullBounds.w - w + padX;
      const minY = fullBounds.y - padY;
      const maxY = fullBounds.y + fullBounds.h - h + padY;

      return {
        x: Math.max(minX, Math.min(maxX, box.x)),
        y: Math.max(minY, Math.min(maxY, box.y)),
        w,
        h,
      };
    },
    [initialBox, fullBounds]
  );

  const zoomAt = useCallback(
    (factor: number, normX = 0.5, normY = 0.5) => {
      setViewBox((prev) => {
        const nextW = prev.w * factor;
        const nextH = prev.h * factor;
        const focusX = prev.x + prev.w * normX;
        const focusY = prev.y + prev.h * normY;
        return clampBox({
          x: focusX - nextW * normX,
          y: focusY - nextH * normY,
          w: nextW,
          h: nextH,
        });
      });
    },
    [clampBox]
  );

  const handleResetView = () => {
    setViewBox(initialBox);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      const factor = e.deltaY < 0 ? 0.84 : 1.19;
      zoomAt(factor, normX, normY);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [zoomAt]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      box: viewBox,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging && dragStartRef.current && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const { clientX, clientY, box } = dragStartRef.current;
      const scaleX = box.w / rect.width;
      const scaleY = box.h / rect.height;
      const scale = Math.max(scaleX, scaleY);
      const dx = (e.clientX - clientX) * scale;
      const dy = (e.clientY - clientY) * scale;
      setViewBox(
        clampBox({
          ...box,
          x: box.x - dx,
          y: box.y - dy,
        })
      );
      setTooltip(null);
    } else if (tooltip && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltip((prev) =>
        prev
          ? {
              ...prev,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            }
          : null
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const handlePathMouseEnter = (
    territory: Territory | undefined,
    e: React.MouseEvent<SVGPathElement>
  ) => {
    if (!territory || isDragging) return;
    const isFound = foundIds.has(territory.id);
    const isRevealed = isFound || status === 'abandoned';

    if (!isRevealed) {
      onHoverTerritory(null);
      setTooltip(null);
      return;
    }

    onHoverTerritory(territory.id);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const label =
        quiz.displayCodeInTable && territory.code
          ? `${territory.code} — ${territory.names[language]}`
          : territory.names[language];
      setTooltip({
        text: label,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isMissed: !isFound && status === 'abandoned',
      });
    }
  };

  const handlePathMouseLeave = () => {
    onHoverTerritory(null);
    setTooltip(null);
  };

  const zoomPercent = Math.round((initialBox.w / viewBox.w) * 100);

  return (
    <div
      ref={containerRef}
      className={`${styles.mapViewport} ${isDragging ? styles.grabbing : ''}`}
    >
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Inset backgrounds & labels for France maps */}
        {insets.length > 0 && (
          <g aria-hidden="true">
            {insets.map((box, i) => (
              <g key={`inset-${i}`}>
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx={8}
                  className={styles.insetBox}
                />
                <text
                  x={box.x + box.width / 2}
                  y={box.y + box.height - 9}
                  textAnchor="middle"
                  className={styles.insetLabel}
                >
                  {box.label[language]}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Map territory paths */}
        <g>
          {paths.map((entry, idx) => {
            const territory = territoryById.get(entry.id);
            const isTarget = Boolean(territory);
            const isFound = territory ? foundIds.has(territory.id) : false;
            const isMissed = Boolean(
              territory && !isFound && status === 'abandoned'
            );
            const isHighlighted = Boolean(
              territory && highlightedTerritoryId === territory.id
            );

            let fill = 'var(--map-context)';
            if (isTarget) {
              if (isFound && territory) {
                fill = `var(--palette-${territory.colorIndex})`;
              } else if (isMissed) {
                fill = 'var(--map-missed)';
              } else {
                fill = 'var(--map-neutral)';
              }
            }

            return (
              <path
                key={`${entry.id}-${idx}`}
                d={entry.d}
                fill={fill}
                className={`${styles.territoryPath} ${
                  isTarget ? styles.playablePath : styles.contextPath
                } ${isHighlighted ? styles.highlightedPath : ''}`}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={(e) => handlePathMouseEnter(territory, e)}
                onMouseLeave={handlePathMouseLeave}
              />
            );
          })}
        </g>
      </svg>

      {/* Map zoom/pan controls */}
      <div className={styles.controlsOverlay}>
        <button
          type="button"
          className={styles.controlBtn}
          onClick={() => zoomAt(0.78)}
          aria-label={t.zoomIn}
          title={t.zoomIn}
        >
          +
        </button>
        <button
          type="button"
          className={styles.controlBtn}
          onClick={() => zoomAt(1.28)}
          aria-label={t.zoomOut}
          title={t.zoomOut}
        >
          −
        </button>
        <button
          type="button"
          className={styles.controlBtn}
          onClick={handleResetView}
          aria-label={t.resetView}
          title={t.resetView}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
        <span className={`${styles.zoomBadge} tabular-nums`}>{zoomPercent}%</span>
      </div>

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className={`${styles.tooltip} ${
            tooltip.isMissed ? styles.tooltipMissed : ''
          }`}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
