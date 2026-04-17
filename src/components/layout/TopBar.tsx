import { Search, Network, GitBranch, Menu } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { ALL_PAPERS as PAPERS } from '../../data';
import { matchesFilter } from '../../lib/filter';
import clsx from 'clsx';
import type { LayoutMode } from '../../types';

export function TopBar() {
  const store = useFilterStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const count = PAPERS.filter((p) => matchesFilter(p, store)).length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 border-b border-white/5">
      <button
        onClick={() => store.setSidebarOpen(true)}
        className="md:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
        title="Filters"
        aria-label="Open filters"
      >
        <Menu size={18} />
      </button>
      <Logo />
      <div className="hidden md:block h-5 w-px bg-white/10" />
      <div className="hidden md:flex items-center gap-3">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/55">
          3D Avatar Taxonomy
        </div>
        <div className="font-mono text-[10px] text-white/35">
          {count} / {PAPERS.length} papers
        </div>
      </div>

      <div className="relative ml-auto flex-1 sm:flex-none sm:w-[320px] max-w-[420px]">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          ref={inputRef}
          value={store.query}
          onChange={(e) => store.setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-white/[0.04] border border-white/8 rounded-lg pl-8 pr-8 sm:pr-10 py-1.5 text-[13px] placeholder:text-white/30 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30 transition"
        />
        <kbd className="kbd absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex">/</kbd>
      </div>

      <LayoutToggle value={store.layout} onChange={store.setLayout} />
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div
          className="h-6 w-6 rounded-md"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, #22d3ee 0%, #a78bfa 55%, #e879f9 100%)',
            boxShadow: '0 0 18px rgba(167,139,250,0.45)',
          }}
        />
        <div className="absolute inset-0 rounded-md ring-1 ring-white/20" />
      </div>
      <div className="leading-tight hidden sm:block">
        <div className="text-[13.5px] font-semibold tracking-tight">
          Avatar Atlas
        </div>
        <div className="font-mono text-[9.5px] text-white/40 uppercase tracking-[0.15em]">
          NeRF · 3DGS · Relightable
        </div>
      </div>
    </div>
  );
}

function LayoutToggle({
  value,
  onChange,
}: {
  value: LayoutMode;
  onChange: (v: LayoutMode) => void;
}) {
  const items: { id: LayoutMode; label: string; icon: typeof Network }[] = [
    { id: 'force', label: 'Graph', icon: Network },
    { id: 'tree', label: 'Tree', icon: GitBranch },
  ];
  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-white/[0.03] border border-white/8 rounded-lg flex-none">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={clsx(
            'flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-[11.5px] font-medium transition',
            value === id
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5',
          )}
        >
          <Icon size={12} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
