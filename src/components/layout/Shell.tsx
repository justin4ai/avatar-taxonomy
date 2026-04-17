import type { ReactNode } from 'react';
import { Mail } from 'lucide-react';
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
      <FeedbackBar />
    </div>
  );
}

function FeedbackBar() {
  return (
    <div className="flex-none flex items-center justify-center sm:justify-end gap-3 sm:gap-4 px-4 sm:px-6 py-2 border-t border-white/5 bg-black/20 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
      <span className="hidden sm:inline text-white/35">
        Found a wrong tag or missing paper?
      </span>
      <a
        href="https://github.com/justin4ai/avatar-taxonomy/issues"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 hover:text-white transition"
      >
        <GithubMark />
        issues
      </a>
      <span className="text-white/15">·</span>
      <a
        href="mailto:justinahn@kaist.ac.kr"
        className="inline-flex items-center gap-1.5 hover:text-white transition"
      >
        <Mail size={11} />
        justinahn@kaist.ac.kr
      </a>
    </div>
  );
}

function GithubMark() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.9-.39.99 0 1.98.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
