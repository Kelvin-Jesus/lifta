import { For, Show, type Component, type JSX } from 'solid-js';
import type { MuscleGroup } from '../domain/types';
import {
  ANTERIOR_POLYGONS,
  POSTERIOR_POLYGONS,
  type MusclePolygon,
} from '../catalog/anatomy';

export interface BodyHighlighterProps {
  primaryMuscles?: readonly MuscleGroup[];
  secondaryMuscles?: readonly MuscleGroup[];
  view?: 'both' | 'anterior' | 'posterior';
  accentColor?: string;
  neutralColor?: string;
  strokeColor?: string;
  class?: string;
  style?: JSX.CSSProperties;
  onClickMuscle?: (muscle: MuscleGroup) => void;
}

export const BodyHighlighter: Component<BodyHighlighterProps> = (props) => {
  const viewMode = () => props.view ?? 'both';
  const primarySet = () => new Set(props.primaryMuscles ?? []);
  const secondarySet = () => new Set(props.secondaryMuscles ?? []);

  const accentColor = () => props.accentColor ?? 'var(--color-accent, #3b82f6)';
  const neutralColor = () => props.neutralColor ?? 'rgba(255, 255, 255, 0.12)';
  const strokeColor = () => props.strokeColor ?? 'rgba(0, 0, 0, 0.5)';

  const getHighlightState = (
    group?: MuscleGroup
  ): { highlight: 'primary' | 'secondary' | 'neutral'; fill: string; opacity: string } => {
    if (!group) {
      return { highlight: 'neutral', fill: neutralColor(), opacity: '1' };
    }
    if (primarySet().has(group)) {
      return { highlight: 'primary', fill: accentColor(), opacity: '1' };
    }
    if (secondarySet().has(group)) {
      return { highlight: 'secondary', fill: accentColor(), opacity: '0.42' };
    }
    return { highlight: 'neutral', fill: neutralColor(), opacity: '1' };
  };

  const renderViewSvg = (
    viewName: 'anterior' | 'posterior',
    polygons: MusclePolygon[]
  ) => {
    return (
      <svg
        viewBox="0 0 100 225"
        class="h-full w-auto max-h-full max-w-full drop-shadow-sm select-none"
        data-view={viewName}
        data-testid={`body-highlighter-${viewName}`}
        aria-label={`Vista ${viewName === 'anterior' ? 'anterior' : 'posterior'} da anatomia`}
      >
        <title>{`Vista ${viewName === 'anterior' ? 'Anterior' : 'Posterior'}`}</title>
        <g stroke={strokeColor()} stroke-width="0.6" stroke-linejoin="round">
          <For each={polygons}>
            {(poly) => {
              const state = () => getHighlightState(poly.muscleGroup);
              return (
                <For each={poly.points}>
                  {(points) => (
                    <polygon
                      points={points}
                      fill={state().fill}
                      fill-opacity={state().opacity}
                      data-muscle-id={poly.id}
                      data-muscle-group={poly.muscleGroup ?? 'silhouette'}
                      data-highlight={state().highlight}
                      class="transition-colors duration-150"
                      style={{ cursor: poly.muscleGroup && props.onClickMuscle ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (poly.muscleGroup && props.onClickMuscle) {
                          props.onClickMuscle(poly.muscleGroup);
                        }
                      }}
                    />
                  )}
                </For>
              );
            }}
          </For>
        </g>
      </svg>
    );
  };

  return (
    <div
      class={`inline-flex items-center justify-center gap-4 ${props.class ?? ''}`}
      style={props.style}
      data-testid="body-highlighter"
    >
      <Show when={viewMode() === 'both' || viewMode() === 'anterior'}>
        <div class="flex flex-col items-center">
          {renderViewSvg('anterior', ANTERIOR_POLYGONS)}
          <span class="text-[10px] tracking-wider uppercase text-neutral-500 font-mono mt-1">Frente</span>
        </div>
      </Show>

      <Show when={viewMode() === 'both' || viewMode() === 'posterior'}>
        <div class="flex flex-col items-center">
          {renderViewSvg('posterior', POSTERIOR_POLYGONS)}
          <span class="text-[10px] tracking-wider uppercase text-neutral-500 font-mono mt-1">Costas</span>
        </div>
      </Show>
    </div>
  );
};
