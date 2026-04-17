import type { FilterState } from '../types';
import { YEAR_MAX, YEAR_MIN } from '../data/axes';

export interface HashState {
  filter: Partial<{
    representation: string[];
    input: string[];
    pipeline: string[];
    capability: string[];
    target: string[];
    yearRange: [number, number];
    query: string;
    mode: 'any' | 'all';
  }>;
  selected?: string;
  layout?: string;
}

export function filterToHash(
  f: FilterState,
  selected: string | null,
  layout: string,
): string {
  const parts: string[] = [];
  if (f.representation.size) parts.push('rep=' + [...f.representation].join(','));
  if (f.input.size) parts.push('in=' + [...f.input].join(','));
  if (f.pipeline.size) parts.push('pipe=' + [...f.pipeline].join(','));
  if (f.capability.size) parts.push('cap=' + [...f.capability].join(','));
  if (f.target.size) parts.push('tgt=' + [...f.target].join(','));
  if (f.yearRange[0] !== YEAR_MIN || f.yearRange[1] !== YEAR_MAX) {
    parts.push(`y=${f.yearRange[0]}-${f.yearRange[1]}`);
  }
  if (f.query) parts.push('q=' + encodeURIComponent(f.query));
  if (f.mode === 'all') parts.push('m=all');
  if (selected) parts.push('p=' + selected);
  if (layout && layout !== 'force') parts.push('v=' + layout);
  return parts.length ? '#' + parts.join('&') : '';
}

export function parseHash(hash: string): HashState {
  if (!hash.startsWith('#')) return { filter: {} };
  const filter: HashState['filter'] = {};
  let selected: string | undefined;
  let layout: string | undefined;
  for (const part of hash.slice(1).split('&')) {
    const [k, vRaw] = part.split('=');
    const v = decodeURIComponent(vRaw ?? '');
    if (!v) continue;
    switch (k) {
      case 'rep':
        filter.representation = v.split(',');
        break;
      case 'in':
        filter.input = v.split(',');
        break;
      case 'pipe':
        filter.pipeline = v.split(',');
        break;
      case 'cap':
        filter.capability = v.split(',');
        break;
      case 'tgt':
        filter.target = v.split(',');
        break;
      case 'y': {
        const [a, b] = v.split('-').map(Number);
        if (Number.isFinite(a) && Number.isFinite(b)) {
          filter.yearRange = [a, b];
        }
        break;
      }
      case 'q':
        filter.query = v;
        break;
      case 'm':
        if (v === 'all' || v === 'any') filter.mode = v;
        break;
      case 'p':
        selected = v;
        break;
      case 'v':
        layout = v;
        break;
    }
  }
  return { filter, selected, layout };
}
