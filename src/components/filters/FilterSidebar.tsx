import { AXES } from '../../data/taxonomy';
import { useFilterStore } from '../../store/useFilterStore';
import { AxisGroup } from './AxisGroup';
import { YearRange } from './YearRange';
import { hasAnyFilter } from '../../lib/filter';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { FilterMode } from '../../types';
import { ALL_PAPERS as PAPERS } from '../../data';
import { matchesFilter } from '../../lib/filter';

export function FilterSidebar() {
  const store = useFilterStore();

  function axisSelected(id: (typeof AXES)[number]['id']): Set<string> {
    switch (id) {
      case 'representation':
        return store.representation as Set<string>;
      case 'input':
        return store.input as Set<string>;
      case 'pipeline':
        return store.pipeline as Set<string>;
      case 'capability':
        return store.capability as Set<string>;
      case 'target':
        return store.target as Set<string>;
    }
  }

  function axisToggle(id: (typeof AXES)[number]['id'], v: string) {
    (store.toggle as any)[id](v);
  }

  const dirty = hasAnyFilter(store);
  const count = PAPERS.filter((p) => matchesFilter(p, store)).length;
  const open = store.sidebarOpen;

  return (
    <aside
      className={clsx(
        'panel flex flex-col gap-1 overflow-y-auto',
        'md:m-4 md:p-5 md:w-[300px] md:flex-none md:static md:translate-x-0',
        'fixed left-0 top-0 bottom-0 z-40 w-[86vw] max-w-[340px] p-5 rounded-none md:rounded-[14px] transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/80">
          Filters
        </div>
        <span className="md:hidden font-mono text-[10px] text-white/40">
          · {count} / {PAPERS.length}
        </span>
        {dirty && (
          <button
            onClick={() => store.clearAll()}
            className="ml-auto flex items-center gap-1 text-[10.5px] font-mono text-white/50 hover:text-white transition"
            title="Clear all filters"
          >
            <X size={11} /> clear
          </button>
        )}
        <button
          onClick={() => store.setSidebarOpen(false)}
          className={clsx(
            'md:hidden p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition',
            dirty ? '' : 'ml-auto',
          )}
          title="Close"
          aria-label="Close filters"
        >
          <X size={14} />
        </button>
      </div>
      <ModeSwitch mode={store.mode} onChange={store.setMode} />
      {AXES.map((axis) => (
        <AxisGroup
          key={axis.id}
          axis={axis}
          selected={axisSelected(axis.id)}
          onToggle={(v) => axisToggle(axis.id, v)}
        />
      ))}
      <YearRange />
      <div className="mt-auto pt-4 border-t border-white/5 text-[11px] text-white/35 leading-snug">
        <span className="font-mono text-white/60">
          {store.mode === 'any' ? 'ANY' : 'ALL'}
        </span>{' '}
        mode: within one axis, matches must satisfy{' '}
        {store.mode === 'any' ? 'at least one' : 'every'} selected tag.
        Different axes always combine with <span className="font-mono text-white/60">AND</span>.
      </div>
    </aside>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: FilterMode;
  onChange: (m: FilterMode) => void;
}) {
  const items: {
    id: FilterMode;
    label: string;
    desc: string;
  }[] = [
    { id: 'any', label: 'ANY', desc: 'Union (OR) within each axis' },
    { id: 'all', label: 'ALL', desc: 'Intersection (AND) within each axis' },
  ];
  return (
    <div className="mb-4">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1.5">
        Filter mode
      </div>
      <div className="flex items-center gap-0.5 p-0.5 bg-white/[0.03] border border-white/10 rounded-md">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            title={it.desc}
            className={clsx(
              'flex-1 text-[10.5px] font-mono tracking-[0.12em] py-1 rounded transition',
              mode === it.id
                ? 'bg-white/12 text-white'
                : 'text-white/45 hover:text-white/90 hover:bg-white/5',
            )}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
