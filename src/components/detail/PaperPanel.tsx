import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Code2, ExternalLink, X } from 'lucide-react';
import { ALL_PAPERS as PAPERS } from '../../data';
import { useFilterStore } from '../../store/useFilterStore';
import { AXES, valueLabel } from '../../data/axes';
import { rgba } from '../../lib/colors';
import type { AxisId, Paper } from '../../types';

export function PaperPanel() {
  const { selectedId, select } = useFilterStore();
  const paper = selectedId ? PAPERS.find((p) => p.id === selectedId) : null;

  return (
    <AnimatePresence>
      {paper && (
        <>
          <motion.div
            key={`${paper.id}-backdrop`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => select(null)}
          />
          <motion.aside
            key={paper.id}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="md:hidden panel fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-b-none rounded-t-[20px]"
          >
            <Inner paper={paper} onClose={() => select(null)} />
          </motion.aside>
          <motion.aside
            key={`${paper.id}-desktop`}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="hidden md:block panel m-4 ml-0 w-[380px] flex-none overflow-y-auto relative"
          >
            <Inner paper={paper} onClose={() => select(null)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Inner({ paper, onClose }: { paper: Paper; onClose: () => void }) {
  const buildsOn = (paper.builds_on ?? [])
    .map((id) => PAPERS.find((p) => p.id === id))
    .filter((p): p is Paper => !!p);
  const builtBy = PAPERS.filter((p) => p.builds_on?.includes(paper.id));

  return (
    <div className="p-5 pb-6">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition"
        title="Close (Esc)"
      >
        <X size={14} />
      </button>

      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/45">
        {paper.venue}
      </div>
      <h2 className="text-[17px] leading-snug font-semibold mt-1 tracking-tight">
        {paper.title}
      </h2>
      <div className="text-[12.5px] text-white/60 mt-2 leading-relaxed">
        {paper.authors.slice(0, 8).join(', ')}
        {paper.authors.length > 8 ? `, +${paper.authors.length - 8} more` : ''}
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        {paper.arxiv && (
          <LinkBtn href={paper.arxiv} icon={<ExternalLink size={12} />}>
            paper
          </LinkBtn>
        )}
        {paper.project && (
          <LinkBtn href={paper.project} icon={<ArrowUpRight size={12} />}>
            project
          </LinkBtn>
        )}
        {paper.code && (
          <LinkBtn href={paper.code} icon={<Code2 size={12} />}>
            code
          </LinkBtn>
        )}
      </div>

      <div className="mt-5 text-[13px] leading-relaxed text-white/85">
        {paper.summary}
      </div>

      <div className="mt-3 text-[12px] text-cyan-300/90 bg-cyan-400/5 border border-cyan-400/15 rounded-lg px-3 py-2 leading-relaxed">
        <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400/80 mr-1">
          key
        </span>
        {paper.contribution}
      </div>

      <Tags paper={paper} />

      {buildsOn.length > 0 && (
        <Related title="Builds on" papers={buildsOn} />
      )}
      {builtBy.length > 0 && (
        <Related title="Built on by" papers={builtBy} />
      )}
    </div>
  );
}

function LinkBtn({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="btn !py-1 !px-2.5 text-[11.5px]"
    >
      {icon}
      {children}
    </a>
  );
}

function Tags({ paper }: { paper: Paper }) {
  const sections: { id: AxisId; values: string[] }[] = [
    { id: 'representation', values: paper.representation },
    { id: 'input', values: paper.input },
    { id: 'pipeline', values: paper.pipeline },
    { id: 'capability', values: paper.capability },
    { id: 'target', values: paper.target },
  ];
  return (
    <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
      {sections.map((sec) => {
        const axis = AXES.find((a) => a.id === sec.id)!;
        return (
          <div key={sec.id} className="contents">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 pt-0.5">
              {axis.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {sec.values.map((v) => (
                <span
                  key={v}
                  className="chip active !py-0 !text-[10px]"
                  style={{
                    background: rgba(axis.color, 0.2),
                    color: axis.color,
                    borderColor: rgba(axis.color, 0.4),
                  }}
                >
                  {valueLabel(axis.id, v)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Related({ title, papers }: { title: string; papers: Paper[] }) {
  const { select } = useFilterStore();
  return (
    <div className="mt-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-1">
        {papers.map((p) => (
          <button
            key={p.id}
            onClick={() => select(p.id)}
            className="group text-left px-2.5 py-1.5 rounded-md bg-white/[0.025] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition"
          >
            <div className="text-[12px] font-medium text-white/90 group-hover:text-white truncate">
              {p.title.split(':')[0]}
            </div>
            <div className="font-mono text-[10px] text-white/40">
              {p.venue}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
