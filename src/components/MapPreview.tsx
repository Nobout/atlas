import { useMemo } from 'react';
import { FRANCE_DEPARTMENTS_PATHS } from '../data/maps/franceDepartmentsPaths';
import { FRANCE_REGIONS_PATHS } from '../data/maps/franceRegionsPaths';
import { WORLD_PATHS } from '../data/maps/worldPaths';
import type { QuizConfig, SvgPathEntry } from '../types/quiz';

interface MapPreviewProps {
  quiz: QuizConfig;
}

export function MapPreview({ quiz }: MapPreviewProps) {
  const paths: SvgPathEntry[] = useMemo(() => {
    if (quiz.mapType === 'world') return WORLD_PATHS;
    if (quiz.mapType === 'france-regions') return FRANCE_REGIONS_PATHS;
    return FRANCE_DEPARTMENTS_PATHS;
  }, [quiz.mapType]);

  const targetIds = useMemo(() => new Set(quiz.territoryIds), [quiz.territoryIds]);

  return (
    <svg
      viewBox={quiz.viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {paths.map((entry, idx) => {
        const isTarget = targetIds.has(entry.id);
        return (
          <path
            key={`${entry.id}-${idx}`}
            d={entry.d}
            fill={isTarget ? 'var(--palette-1)' : 'var(--map-context)'}
            fillOpacity={isTarget ? 0.82 : 1}
            stroke="var(--map-stroke)"
            strokeWidth={0.75}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
