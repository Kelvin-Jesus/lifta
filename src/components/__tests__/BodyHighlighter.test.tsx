import { describe, it, expect } from 'vitest';
import { render } from 'solid-js/web';
import { BodyHighlighter } from '../BodyHighlighter';

describe('BodyHighlighter Component', () => {
  it('renders both anterior and posterior views by default', () => {
    const container = document.createElement('div');
    render(() => <BodyHighlighter primaryMuscles={['chest']} />, container);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
    expect(container.querySelector('[data-view="anterior"]')).not.toBeNull();
    expect(container.querySelector('[data-view="posterior"]')).not.toBeNull();
  });

  it('renders single view when specified', () => {
    const container = document.createElement('div');
    render(
      () => <BodyHighlighter view="anterior" primaryMuscles={['chest']} />,
      container
    );

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(container.querySelector('[data-view="anterior"]')).not.toBeNull();
    expect(container.querySelector('[data-view="posterior"]')).toBeNull();
  });

  it('highlights primary muscles at 100% opacity and secondary at 42%', () => {
    const container = document.createElement('div');
    render(
      () => (
        <BodyHighlighter
          view="anterior"
          primaryMuscles={['chest']}
          secondaryMuscles={['triceps']}
        />
      ),
      container
    );

    const chestPolygons = container.querySelectorAll('[data-muscle-group="chest"]');
    expect(chestPolygons.length).toBeGreaterThan(0);
    for (const poly of chestPolygons) {
      expect(poly.getAttribute('data-highlight')).toBe('primary');
      expect(poly.getAttribute('fill-opacity')).toBe('1');
    }

    const tricepPolygons = container.querySelectorAll('[data-muscle-group="triceps"]');
    expect(tricepPolygons.length).toBeGreaterThan(0);
    for (const poly of tricepPolygons) {
      expect(poly.getAttribute('data-highlight')).toBe('secondary');
      expect(poly.getAttribute('fill-opacity')).toBe('0.42');
    }
  });

  it('renders neutral polygons for muscles not in primary or secondary', () => {
    const container = document.createElement('div');
    render(
      () => <BodyHighlighter view="anterior" primaryMuscles={['chest']} />,
      container
    );

    const quadPolygons = container.querySelectorAll('[data-muscle-group="quadriceps"]');
    expect(quadPolygons.length).toBeGreaterThan(0);
    for (const poly of quadPolygons) {
      expect(poly.getAttribute('data-highlight')).toBe('neutral');
    }
  });
});
