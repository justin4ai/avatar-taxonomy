import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ALL_PAPERS as PAPERS } from '../../data';
import { matchesFilter } from '../../lib/filter';
import { buildGraph, type GraphLink, type GraphNode } from '../../lib/graph';
import { INPUT_COLOR, REP_COLOR, REP_GLOW, rgba } from '../../lib/colors';
import { useFilterStore } from '../../store/useFilterStore';

type FGNode = GraphNode;
type FGLink = GraphLink;

export function AtlasGraph() {
  const filter = useFilterStore();
  const hoverIdRef = useRef<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const ref = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const visibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const p of PAPERS) if (matchesFilter(p, filter)) s.add(p.id);
    return s;
  }, [
    filter.representation,
    filter.input,
    filter.pipeline,
    filter.capability,
    filter.target,
    filter.yearRange,
    filter.query,
  ]);

  const graph = useMemo(() => buildGraph(PAPERS, visibleIds), []);
  useEffect(() => {
    for (const n of graph.nodes) n.visible = visibleIds.has(n.id);
    ref.current?.d3ReheatSimulation();
  }, [visibleIds, graph.nodes]);

  useEffect(() => {
    const fg = ref.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-160);
    fg.d3Force('link')
      ?.distance((l: FGLink) => (l.kind === 'builds_on' ? 60 : 90))
      .strength((l: FGLink) => (l.kind === 'builds_on' ? 0.5 : 0.08));
  }, []);

  function nodeRadius(n: FGNode): number {
    return 3 + n.paper.importance * 1.8;
  }

  function nodeColor(n: FGNode): { fill: string; ring: string; glow: string } {
    const rep = n.paper.representation[0] ?? 'hybrid';
    const inp = n.paper.input[0] ?? 'monocular';
    return {
      fill: REP_COLOR[rep],
      ring: INPUT_COLOR[inp],
      glow: REP_GLOW[rep],
    };
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <ForceGraph2D
        ref={ref}
        width={size.w}
        height={size.h}
        graphData={graph}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTime={6000}
        warmupTicks={60}
        nodeRelSize={4}
        nodeVal={(n: FGNode) => n.paper.importance}
        linkColor={() => 'rgba(255,255,255,0.08)'}
        linkDirectionalParticles={0}
        enableNodeDrag={false}
        onNodeHover={(n: FGNode | null) => {
          hoverIdRef.current = n?.id ?? null;
          setHoverId(n?.id ?? null);
          document.body.style.cursor = n ? 'pointer' : 'default';
        }}
        onNodeClick={(n: FGNode) => {
          filter.select(n.id);
          ref.current?.centerAt(n.x, n.y, 600);
          ref.current?.zoom(3, 600);
        }}
        onBackgroundClick={() => filter.select(null)}
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={(link: FGLink, ctx: CanvasRenderingContext2D) => {
          const src = link.source as FGNode;
          const tgt = link.target as FGNode;
          if (src.x == null || tgt.x == null) return;
          const bothVisible = src.visible && tgt.visible;
          const alpha = bothVisible
            ? link.kind === 'builds_on'
              ? 0.45
              : 0.18
            : 0.05;
          ctx.strokeStyle = `rgba(200,210,255,${alpha})`;
          ctx.lineWidth = link.kind === 'builds_on' ? 0.9 : 0.4;
          ctx.beginPath();
          ctx.moveTo(src.x!, src.y!);
          ctx.lineTo(tgt.x!, tgt.y!);
          ctx.stroke();
        }}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(n: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const node = n;
          if (!node.x || !node.y) return;
          const r = nodeRadius(node);
          const { fill, ring, glow } = nodeColor(node);
          const visible = node.visible;
          const isHover = hoverIdRef.current === node.id;
          const isSelected = filter.selectedId === node.id;

          ctx.save();

          if (visible) {
            ctx.shadowColor = glow;
            ctx.shadowBlur = isHover || isSelected ? 24 : 10;
          }

          ctx.fillStyle = visible ? fill : rgba('#6b7280', 0.15);
          ctx.globalAlpha = visible ? 1 : 0.25;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          if (visible) {
            ctx.strokeStyle = ring;
            ctx.lineWidth = 1.25;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 2.5, 0, Math.PI * 2);
            ctx.stroke();
          }

          if (isSelected) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.6;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 7, 0, Math.PI * 2);
            ctx.stroke();
          }

          const labelZoom = 1.25;
          if (visible && (globalScale > labelZoom || isHover || isSelected)) {
            const label = node.paper.title.split(':')[0];
            const short =
              label.length > 28 ? label.slice(0, 26) + '…' : label;
            const year = ' ' + node.paper.year;
            ctx.globalAlpha = Math.min(
              1,
              (globalScale - 0.8) * 0.8 + (isHover || isSelected ? 1 : 0),
            );
            ctx.font =
              '500 11px Inter, ui-sans-serif, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'rgba(240,240,255,0.95)';
            ctx.fillText(short, node.x, node.y + r + 6);
            ctx.font =
              '400 9px "JetBrains Mono", ui-monospace, monospace';
            ctx.fillStyle = 'rgba(160,170,200,0.8)';
            ctx.fillText(year, node.x, node.y + r + 20);
          }

          ctx.restore();
        }}
      />
      <HoverCard id={hoverId} />
    </div>
  );
}

function HoverCard({ id }: { id: string | null }) {
  if (!id) return null;
  const paper = PAPERS.find((p) => p.id === id);
  if (!paper) return null;
  return (
    <div className="pointer-events-none absolute left-4 bottom-4 max-w-sm panel px-3 py-2 animate-fade-in">
      <div className="font-medium text-[13px] leading-snug">
        {paper.title}
      </div>
      <div className="font-mono text-2xs text-white/50 mt-0.5">
        {paper.venue} · {paper.authors[0].split(' ').slice(-1)[0]} et al.
      </div>
      <div className="text-[11.5px] text-white/70 mt-1 leading-snug">
        {paper.contribution}
      </div>
    </div>
  );
}
