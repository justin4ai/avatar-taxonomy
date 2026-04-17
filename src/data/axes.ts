import type { Axis } from '../types';

export const YEAR_MIN = 2015;
export const YEAR_MAX = 2026;

export const AXES: Axis[] = [
  {
    id: 'representation',
    label: 'Representation',
    color: '#22d3ee',
    values: [
      {
        id: 'nerf',
        label: 'NeRF',
        description: 'Neural radiance fields — volumetric MLP / hashgrid / plane-factorized.',
      },
      {
        id: '3dgs',
        label: '3D Gaussians',
        short: '3DGS',
        description:
          'Explicit 3D Gaussian primitives rendered via differentiable splatting (Kerbl 2023).',
      },
      {
        id: 'mesh',
        label: 'Mesh',
        description:
          'Parametric or learned triangle mesh (SMPL / FLAME / template-based).',
      },
      {
        id: 'sdf',
        label: 'SDF',
        description:
          'Signed distance or occupancy field — surface-based implicit representation.',
      },
      {
        id: 'points',
        label: 'Points',
        description:
          'Neural point clouds or learned point primitives with per-point features.',
      },
      {
        id: 'hybrid',
        label: 'Hybrid',
        description:
          'Mix of explicit + implicit (mesh+NeRF, mesh-anchored Gaussians, voxel hybrids).',
      },
    ],
  },
  {
    id: 'input',
    label: 'Input Modality',
    color: '#e879f9',
    values: [
      {
        id: 'monocular',
        label: 'Monocular video',
        short: 'Mono',
        description: 'Single-camera RGB video (in-the-wild capture).',
      },
      {
        id: 'multiview',
        label: 'Multi-view video',
        short: 'Multi',
        description: 'A handful of calibrated cameras (e.g. ~4–16 views).',
      },
      {
        id: 'single_image',
        label: 'Single image',
        short: 'Img',
        description: 'One-shot reconstruction from a single RGB image.',
      },
      {
        id: 'studio',
        label: 'Studio capture',
        short: 'Studio',
        description:
          'Dense multi-camera light-stage or capture dome (50+ cameras).',
      },
      {
        id: 'text',
        label: 'Text prompt',
        short: 'Text',
        description: 'Text-to-avatar via diffusion / SDS guidance.',
      },
      {
        id: 'rgbd',
        label: 'RGB-D',
        description: 'Depth sensor or fused depth+color.',
      },
    ],
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    color: '#a3e635',
    values: [
      {
        id: 'per_subject',
        label: 'Per-subject optimization',
        short: 'Per-subject',
        description:
          'Each avatar trained / fit from scratch on the target subject.',
      },
      {
        id: 'feed_forward',
        label: 'Feed-forward',
        short: 'Feed-fwd',
        description:
          'A generalizable network that infers an avatar in one or few forward passes.',
      },
      {
        id: 'diffusion_prior',
        label: 'Diffusion prior (SDS)',
        short: 'Diffusion',
        description:
          'Uses a pre-trained 2D / 3D diffusion model as a prior (often via Score Distillation).',
      },
    ],
  },
  {
    id: 'capability',
    label: 'Capability',
    color: '#fbbf24',
    values: [
      {
        id: 'animatable',
        label: 'Animatable',
        description:
          'Drivable by novel pose, expression, or identity — not a static scan.',
      },
      {
        id: 'relightable',
        label: 'Relightable',
        description:
          'Decomposes appearance so the avatar can be re-rendered under novel lighting.',
      },
      {
        id: 'static',
        label: 'Static reconstruction',
        short: 'Static',
        description: 'Captures a single frozen pose / expression.',
      },
    ],
  },
  {
    id: 'target',
    label: 'Target',
    color: '#a78bfa',
    values: [
      {
        id: 'head',
        label: 'Head / Face',
        short: 'Head',
        description: 'Head, face, or expression avatars.',
      },
      {
        id: 'body',
        label: 'Body',
        description: 'Full human body (clothing + pose).',
      },
      {
        id: 'hand',
        label: 'Hand',
        description: 'Hands specifically (MANO-family).',
      },
      {
        id: 'full',
        label: 'Whole-body',
        short: 'Full',
        description: 'Joint head + body + (sometimes) hands.',
      },
    ],
  },
];

export const AXIS_BY_ID = Object.fromEntries(AXES.map((a) => [a.id, a])) as Record<
  Axis['id'],
  Axis
>;

export function valueLabel(axisId: Axis['id'], valueId: string): string {
  const v = AXIS_BY_ID[axisId]?.values.find((x) => x.id === valueId);
  return v?.short ?? v?.label ?? valueId;
}
