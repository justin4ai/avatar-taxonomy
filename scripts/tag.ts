import Anthropic from '@anthropic-ai/sdk';
import type { ArxivCandidate, TaggedCandidate } from './schema';

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5-20251001';

const SYSTEM = `You tag 3D-avatar-research papers for a curated atlas.

Return STRICT JSON matching this exact schema:

{
  "is_avatar_paper": boolean,       // true iff the paper's central contribution is 3D avatar / human reconstruction / generation / relighting / animation. Reject non-avatar 3DGS scene work, robotic controllers, NLP, etc.
  "reject_reason": string,          // empty if accepted; else short reason
  "importance": 1|2|3|4|5,          // 1=minor increment, 3=solid venue quality, 5=clear SOTA / field-defining
  "tier": 1|2,                      // 1 if SIGGRAPH/CVPR/ICCV/ECCV/NeurIPS/TOG/TPAMI; 2 otherwise (including arXiv-only)
  "representation": [ "nerf"|"3dgs"|"mesh"|"sdf"|"points"|"hybrid" ],
  "input": [ "monocular"|"multiview"|"single_image"|"studio"|"text"|"rgbd" ],
  "pipeline": [ "per_subject"|"feed_forward"|"diffusion_prior" ],
  "capability": [ "animatable"|"relightable"|"static" ],
  "target": [ "head"|"body"|"hand"|"full" ],
  "summary": string,                // <= 280 chars, technical, neutral
  "contribution": string,           // one-line key novelty ("X = first Y that does Z")
  "builds_on_hints": string[],      // 1-4 short paper nicknames this work explicitly builds on (e.g. "3DGS", "FLAME", "SMPL-X", "NeRF", "InstantNGP"), if mentioned
  "short_id": string                // kebab-case id like "gaussian-head-2024" (lowercase, no spaces)
}

Rules:
- Every array must have 1+ values.
- Use "studio" for 100+ camera captures or light-stage. "multiview" is a handful of cameras.
- "feed_forward" means generalizable (no per-subject fitting at test time).
- "diffusion_prior" applies if SDS loss or a pretrained 2D/3D diffusion model is a core training signal.
- Output ONLY the JSON object. No prose, no fences.`;

export async function tagPaper(
  paper: ArxivCandidate,
): Promise<TaggedCandidate | null> {
  const userBody = JSON.stringify({
    title: paper.title,
    authors: paper.authors,
    published: paper.published,
    abstract: paper.abstract,
    arxiv_id: paper.id,
    primary_category: paper.primaryCategory,
  });

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 900,
    system: [
      {
        type: 'text',
        text: SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userBody }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const json = extractJson(text);
  if (!json) {
    console.error('[tag] no JSON from model for', paper.id);
    return null;
  }

  const year = paper.published ? parseInt(paper.published.slice(0, 4), 10) : new Date().getFullYear();
  const yymm = paper.id.split('.')[0];
  const venue = `arXiv ${yymm.slice(0, 2)}-${yymm.slice(2, 4)}`;

  return {
    id: String(json.short_id ?? paper.id),
    title: paper.title,
    authors: paper.authors,
    year,
    venue,
    tier: json.tier ?? 2,
    importance: json.importance ?? 2,
    arxiv: `https://arxiv.org/abs/${paper.id}`,
    summary: String(json.summary ?? '').slice(0, 320),
    contribution: String(json.contribution ?? ''),
    representation: json.representation ?? [],
    input: json.input ?? [],
    pipeline: json.pipeline ?? [],
    capability: json.capability ?? [],
    target: json.target ?? [],
    is_avatar_paper: Boolean(json.is_avatar_paper),
    builds_on_hints: json.builds_on_hints ?? [],
    reject_reason: json.reject_reason,
  };
}

function extractJson(text: string): Record<string, unknown> | null {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
