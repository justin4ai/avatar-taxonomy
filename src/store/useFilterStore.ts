import { create } from 'zustand';
import type {
  Capability,
  FilterMode,
  FilterState,
  InputModality,
  LayoutMode,
  Pipeline,
  Representation,
  Target,
} from '../types';
import { YEAR_MAX, YEAR_MIN } from '../data/taxonomy';

interface Store extends FilterState {
  selectedId: string | null;
  layout: LayoutMode;
  sidebarOpen: boolean;
  toggle: {
    representation: (v: Representation) => void;
    input: (v: InputModality) => void;
    pipeline: (v: Pipeline) => void;
    capability: (v: Capability) => void;
    target: (v: Target) => void;
  };
  setYear: (r: [number, number]) => void;
  setQuery: (q: string) => void;
  setMode: (m: FilterMode) => void;
  select: (id: string | null) => void;
  setLayout: (m: LayoutMode) => void;
  setSidebarOpen: (v: boolean) => void;
  clearAll: () => void;
}

const empty = () => ({
  representation: new Set<Representation>(),
  input: new Set<InputModality>(),
  pipeline: new Set<Pipeline>(),
  capability: new Set<Capability>(),
  target: new Set<Target>(),
  yearRange: [YEAR_MIN, YEAR_MAX] as [number, number],
  query: '',
  mode: 'any' as FilterMode,
});

function toggleSet<T>(set: Set<T>, v: T): Set<T> {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

export const useFilterStore = create<Store>((set) => ({
  ...empty(),
  selectedId: null,
  layout: 'force',
  sidebarOpen: false,
  toggle: {
    representation: (v) =>
      set((s) => ({ representation: toggleSet(s.representation, v) })),
    input: (v) => set((s) => ({ input: toggleSet(s.input, v) })),
    pipeline: (v) => set((s) => ({ pipeline: toggleSet(s.pipeline, v) })),
    capability: (v) => set((s) => ({ capability: toggleSet(s.capability, v) })),
    target: (v) => set((s) => ({ target: toggleSet(s.target, v) })),
  },
  setYear: (r) => set({ yearRange: r }),
  setQuery: (q) => set({ query: q }),
  setMode: (m) => set({ mode: m }),
  select: (id) => set({ selectedId: id }),
  setLayout: (m) => set({ layout: m }),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  clearAll: () =>
    set((s) => ({ ...empty(), mode: s.mode, selectedId: null })),
}));
