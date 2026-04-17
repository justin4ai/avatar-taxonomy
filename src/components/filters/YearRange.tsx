import * as Slider from '@radix-ui/react-slider';
import { YEAR_MAX, YEAR_MIN } from '../../data/axes';
import { useFilterStore } from '../../store/useFilterStore';

export function YearRange() {
  const { yearRange, setYear } = useFilterStore();
  return (
    <div className="pb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/55">
          Year
        </div>
        <div className="ml-auto font-mono text-[10.5px] text-white/60">
          {yearRange[0]} – {yearRange[1]}
        </div>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-6"
        value={yearRange}
        min={YEAR_MIN}
        max={YEAR_MAX}
        step={1}
        minStepsBetweenThumbs={0}
        onValueChange={(v) => setYear([v[0], v[1]] as [number, number])}
      >
        <Slider.Track className="bg-white/10 relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-cyan-400/40 hover:scale-110 transition" />
        <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-cyan-400/40 hover:scale-110 transition" />
      </Slider.Root>
    </div>
  );
}
