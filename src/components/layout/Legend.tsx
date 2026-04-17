import { INPUT_COLOR, REP_COLOR } from '../../lib/colors';
import { AXES } from '../../data/taxonomy';

export function Legend() {
  return (
    <div className="hidden sm:block pointer-events-none absolute right-4 top-4 panel px-3 py-2.5 text-[11px]">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50 mb-1.5">
        Node fill · Representation
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 max-w-[200px]">
        {AXES[0].values.map((v) => (
          <div key={v.id} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: REP_COLOR[v.id as keyof typeof REP_COLOR],
                boxShadow: `0 0 6px ${REP_COLOR[v.id as keyof typeof REP_COLOR]}`,
              }}
            />
            <span className="text-white/75">{v.short ?? v.label}</span>
          </div>
        ))}
      </div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50 mt-3 mb-1.5">
        Ring · Input
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 max-w-[200px]">
        {AXES[1].values.map((v) => (
          <div key={v.id} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full border"
              style={{
                borderColor: INPUT_COLOR[v.id as keyof typeof INPUT_COLOR],
              }}
            />
            <span className="text-white/75">{v.short ?? v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
