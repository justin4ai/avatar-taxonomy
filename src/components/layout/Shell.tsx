import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { FilterSidebar } from '../filters/FilterSidebar';
import { PaperPanel } from '../detail/PaperPanel';
import { Legend } from './Legend';
import { useFilterStore } from '../../store/useFilterStore';

export function Shell({ children }: { children: ReactNode }) {
  const layout = useFilterStore((s) => s.layout);
  const sidebarOpen = useFilterStore((s) => s.sidebarOpen);
  const setSidebarOpen = useFilterStore((s) => s.setSidebarOpen);
  return (
    <div className="h-full w-full flex flex-col">
      <TopBar />
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30 animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <FilterSidebar />
        <main className="flex-1 relative overflow-hidden min-w-0">
          {children}
          {layout === 'force' && <Legend />}
        </main>
        <PaperPanel />
      </div>
    </div>
  );
}
