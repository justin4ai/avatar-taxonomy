import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Shell } from './components/layout/Shell';
import { TaxonomyGraph } from './components/graph/TaxonomyGraph';
import { TreeMode } from './components/modes/TreeMode';
import { Landing } from './components/landing/Landing';
import { useFilterStore } from './store/useFilterStore';
import { filterToHash, parseHash } from './lib/hash';
import type {
  Capability,
  InputModality,
  Pipeline,
  Representation,
  Target,
} from './types';

function App() {
  const store = useFilterStore();
  const [showLanding, setShowLanding] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('atlas.entered') !== '1';
  });

  useEffect(() => {
    const { filter, selected, layout } = parseHash(window.location.hash);
    if (filter.representation)
      filter.representation.forEach((v) =>
        store.toggle.representation(v as Representation),
      );
    if (filter.input)
      filter.input.forEach((v) => store.toggle.input(v as InputModality));
    if (filter.pipeline)
      filter.pipeline.forEach((v) => store.toggle.pipeline(v as Pipeline));
    if (filter.capability)
      filter.capability.forEach((v) =>
        store.toggle.capability(v as Capability),
      );
    if (filter.target)
      filter.target.forEach((v) => store.toggle.target(v as Target));
    if (filter.yearRange) store.setYear(filter.yearRange);
    if (filter.query) store.setQuery(filter.query);
    if (filter.mode) store.setMode(filter.mode);
    if (selected) store.select(selected);
    if (layout === 'tree' || layout === 'force') store.setLayout(layout);
  }, []);

  useEffect(() => {
    const h = filterToHash(store, store.selectedId, store.layout);
    const url = window.location.pathname + window.location.search + h;
    window.history.replaceState(null, '', url);
  }, [
    store.representation,
    store.input,
    store.pipeline,
    store.capability,
    store.target,
    store.yearRange,
    store.query,
    store.mode,
    store.selectedId,
    store.layout,
  ]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (store.sidebarOpen) store.setSidebarOpen(false);
        else if (store.selectedId) store.select(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store.selectedId, store.select, store.sidebarOpen, store.setSidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches && store.sidebarOpen) store.setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [store.sidebarOpen, store.setSidebarOpen]);

  return (
    <>
      <Shell>
        {store.layout === 'force' && <TaxonomyGraph />}
        {store.layout === 'tree' && <TreeMode />}
      </Shell>
      <AnimatePresence>
        {showLanding && (
          <Landing
            key="landing"
            onEnter={() => {
              sessionStorage.setItem('atlas.entered', '1');
              setShowLanding(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
