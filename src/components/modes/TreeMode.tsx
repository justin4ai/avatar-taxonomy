import { useMemo, useState } from 'react';
import { ALL_PAPERS as PAPERS } from '../../data';
import { matchesFilter } from '../../lib/filter';
import { useFilterStore } from '../../store/useFilterStore';
import { AXES, YEAR_MAX, YEAR_MIN } from '../../data/taxonomy';
import { REP_COLOR, rgba } from '../../lib/colors';
import { paperDate, paperMonth } from '../../lib/dates';
import type { Paper, Representation } from '../../types';

const LANES: Representation[] = ['mesh', 'sdf', 'nerf', 'hybrid', '3dgs', 'points'];

const PX_PER_YEAR = 320;
const LANE_H = 210;
const PAD_X = 80;
const PAD_Y = 72;
const NODE_SLOT_Y = 28;
const MAX_TITLE_CHARS = 22;
const CHAR_PX = 6.2;
const LABEL_OFFSET_X = 6;
const LABEL_PAD = 8;

interface LaidOut {
  id: string;
  paper: Paper;
  x: number;
  y: number;
  lane: Representation;
  visible: boolean;
  r: number;
  labelW: number;
  shortTitle: string;
  hideLabel: boolean;
}

function truncateTitle(title: string): string {
  const t = title.split(':')[0];
  return t.length > MAX_TITLE_CHARS
    ? t.slice(0, MAX_TITLE_CHARS - 1) + '…'
    : t;
}

function representativeLane(p: Paper): Representation {
  for (const l of LANES) if (p.representation.includes(l)) return l;
  return p.representation[0] ?? 'hybrid';
}

function laneCenter(lane: Representation): number {
  return PAD_Y + LANES.indexOf(lane) * LANE_H + LANE_H / 2;
}

function paperX(p: Paper): number {
  return PAD_X + (paperDate(p) - YEAR_MIN) * PX_PER_YEAR;
}

function layout(papers: Paper[], visibleIds: Set<string>): LaidOut[] {
  const nodes: LaidOut[] = papers.map((p) => {
    const shortTitle = truncateTitle(p.title);
    return {
      id: p.id,
      paper: p,
      x: paperX(p),
      y: laneCenter(representativeLane(p)),
      lane: representativeLane(p),
      visible: visibleIds.has(p.id),
      r: 4 + p.importance * 1.6,
      labelW: shortTitle.length * CHAR_PX + LABEL_OFFSET_X + LABEL_PAD,
      shortTitle,
      hideLabel: false,
    };
  });

  const laneBuckets = new Map<Representation, LaidOut[]>();
  for (const n of nodes) {
    const arr = laneBuckets.get(n.lane) ?? [];
    arr.push(n);
    laneBuckets.set(n.lane, arr);
  }
  for (const arr of laneBuckets.values()) {
    arr.sort((a, b) => a.x - b.x);
    const placed: LaidOut[] = [];
    const slots = [0, -1, 1, -2, 2, -3, 3];
    for (const n of arr) {
      const cy = laneCenter(n.lane);
      let chosen: number | null = null;
      for (const s of slots) {
        const y = cy + s * NODE_SLOT_Y;
        const overlaps = placed.some((p) => {
          if (Math.abs(p.y - y) >= NODE_SLOT_Y) return false;
          const pRight = p.x + p.r + (p.hideLabel ? 0 : p.labelW);
          const nLeft = n.x - n.r - 2;
          return pRight > nLeft;
        });
        if (!overlaps) {
          chosen = s;
          break;
        }
      }
      if (chosen == null) {
        let best = 0;
        let bestScore = Infinity;
        for (const s of slots) {
          const y = cy + s * NODE_SLOT_Y;
          const score = placed.reduce((acc, p) => {
            if (Math.abs(p.y - y) >= NODE_SLOT_Y) return acc;
            return acc + Math.max(0, p.x + p.r - (n.x - n.r));
          }, 0);
          if (score < bestScore) {
            bestScore = score;
            best = s;
          }
        }
        chosen = best;
        n.hideLabel = true;
      }
      n.y = cy + chosen * NODE_SLOT_Y;
      placed.push(n);
    }
  }

  return nodes;
}

export function TreeMode() {
  const filter = useFilterStore();
  const [hoverId, setHoverId] = useState<string | null>(null);

  const visibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const p of PAPERS) if (matchesFilter(p, filter)) s.add(p.id);
    return s;
  }, [filter]);

  const nodes = useMemo(() => layout(PAPERS, visibleIds), [visibleIds]);
  const nodeMap = useMemo(() => {
    const m = new Map<string, LaidOut>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const edges = useMemo(() => {
    const out: { from: LaidOut; to: LaidOut }[] = [];
    for (const p of PAPERS) {
      for (const parent of p.builds_on ?? []) {
        const a = nodeMap.get(parent);
        const b = nodeMap.get(p.id);
        if (a && b) out.push({ from: a, to: b });
      }
    }
    return out;
  }, [nodeMap]);

  const lineage = useMemo(() => {
    if (!hoverId) return null;
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const upById = new Map<string, string[]>();
    const downById = new Map<string, string[]>();
    for (const p of PAPERS) {
      for (const parent of p.builds_on ?? []) {
        upById.set(p.id, [...(upById.get(p.id) ?? []), parent]);
        downById.set(parent, [...(downById.get(parent) ?? []), p.id]);
      }
    }
    function walk(id: string, map: Map<string, string[]>, acc: Set<string>) {
      const q = [id];
      while (q.length) {
        const x = q.shift()!;
        for (const n of map.get(x) ?? []) {
          if (!acc.has(n)) {
            acc.add(n);
            q.push(n);
          }
        }
      }
    }
    walk(hoverId, upById, ancestors);
    walk(hoverId, downById, descendants);
    return { ancestors, descendants, self: hoverId };
  }, [hoverId]);

  const width = PAD_X + (YEAR_MAX - YEAR_MIN + 1) * PX_PER_YEAR + 60;
  const height = PAD_Y + LANES.length * LANE_H + 40;

  const years: number[] = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX + 1; y++) years.push(y);

  return (
    <div className="absolute inset-0 overflow-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        onMouseLeave={() => setHoverId(null)}
      >
        <defs>
          {LANES.map((l) => (
            <linearGradient
              id={`laneGrad-${l}`}
              key={l}
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor={rgba(REP_COLOR[l], 0.0)} />
              <stop offset="50%" stopColor={rgba(REP_COLOR[l], 0.04)} />
              <stop offset="100%" stopColor={rgba(REP_COLOR[l], 0.0)} />
            </linearGradient>
          ))}
        </defs>

        {LANES.map((l, i) => (
          <g key={l}>
            <rect
              x={PAD_X - 20}
              y={PAD_Y + i * LANE_H}
              width={width - PAD_X}
              height={LANE_H}
              fill={`url(#laneGrad-${l})`}
            />
            <line
              x1={PAD_X - 20}
              x2={width - 20}
              y1={PAD_Y + i * LANE_H + LANE_H}
              y2={PAD_Y + i * LANE_H + LANE_H}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="2 4"
            />
            <text
              x={8}
              y={laneCenter(l) + 4}
              fontSize={11}
              fontFamily="'JetBrains Mono', ui-monospace, monospace"
              fill={REP_COLOR[l]}
              opacity={0.85}
              style={{ textTransform: 'uppercase', letterSpacing: 2 }}
            >
              {AXES[0].values.find((v) => v.id === l)!.short ??
                AXES[0].values.find((v) => v.id === l)!.label}
            </text>
          </g>
        ))}

        {years.map((y) => {
          const x = PAD_X + (y - YEAR_MIN) * PX_PER_YEAR;
          return (
            <g key={y}>
              <line
                x1={x}
                x2={x}
                y1={PAD_Y - 18}
                y2={height - 24}
                stroke="rgba(255,255,255,0.06)"
              />
              <text
                x={x}
                y={PAD_Y - 26}
                fontSize={11}
                fontFamily="'JetBrains Mono', ui-monospace, monospace"
                fill="rgba(255,255,255,0.55)"
              >
                {y}
              </text>
              {[3, 6, 9].map((m) => (
                <line
                  key={m}
                  x1={x + (m / 12) * PX_PER_YEAR}
                  x2={x + (m / 12) * PX_PER_YEAR}
                  y1={PAD_Y - 8}
                  y2={height - 24}
                  stroke="rgba(255,255,255,0.025)"
                />
              ))}
            </g>
          );
        })}

        <g>
          {edges.map((e, i) => {
            const { from, to } = e;
            const involved =
              lineage &&
              (lineage.self === from.id ||
                lineage.self === to.id ||
                lineage.ancestors.has(from.id) ||
                lineage.descendants.has(to.id));
            const bothVisible = from.visible && to.visible;
            const color = REP_COLOR[from.lane];
            const alpha = lineage
              ? involved
                ? 0.85
                : 0.04
              : bothVisible
                ? 0.35
                : 0.06;
            const width = lineage && involved ? 1.5 : 0.8;
            const dx = to.x - from.x;
            const cx1 = from.x + dx * 0.4;
            const cx2 = to.x - dx * 0.4;
            return (
              <path
                key={i}
                d={`M ${from.x} ${from.y} C ${cx1} ${from.y}, ${cx2} ${to.y}, ${to.x} ${to.y}`}
                fill="none"
                stroke={color}
                strokeOpacity={alpha}
                strokeWidth={width}
              />
            );
          })}
        </g>

        <g>
          {nodes.map((n) => {
            const involved =
              lineage &&
              (n.id === lineage.self ||
                lineage.ancestors.has(n.id) ||
                lineage.descendants.has(n.id));
            const dim = lineage ? !involved : !n.visible;
            const color = REP_COLOR[n.lane];
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId((prev) => (prev === n.id ? null : prev))}
                onClick={() => filter.select(n.id)}
                style={{ cursor: 'pointer', opacity: dim ? 0.25 : 1 }}
              >
                <title>{n.paper.title}</title>
                <circle
                  r={n.r + 4}
                  fill={rgba(color, 0.15)}
                  opacity={n.visible ? 1 : 0.3}
                />
                <circle
                  r={n.r}
                  fill={color}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={0.6}
                  style={{
                    filter: n.visible ? `drop-shadow(0 0 6px ${rgba(color, 0.6)})` : 'none',
                  }}
                />
                {filter.selectedId === n.id && (
                  <circle
                    r={n.r + 8}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={1.5}
                    opacity={0.9}
                  />
                )}
                {(!n.hideLabel || hoverId === n.id) && (
                  <>
                    <text
                      x={n.r + LABEL_OFFSET_X}
                      y={3.5}
                      fontSize={10.5}
                      fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                      fill="rgba(240,240,255,0.92)"
                      fontWeight={500}
                    >
                      {hoverId === n.id
                        ? n.paper.title.split(':')[0]
                        : n.shortTitle}
                    </text>
                    <text
                      x={n.r + LABEL_OFFSET_X}
                      y={15}
                      fontSize={9}
                      fontFamily="'JetBrains Mono', ui-monospace, monospace"
                      fill="rgba(180,190,220,0.55)"
                    >
                      {n.paper.year}
                      {'·'}
                      {String(paperMonth(n.paper)).padStart(2, '0')}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>

        <text
          x={width - 20}
          y={height - 8}
          textAnchor="end"
          fontSize={10.5}
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fill="rgba(255,255,255,0.35)"
        >
          hover a node to light its lineage · click for details
        </text>
      </svg>
    </div>
  );
}
