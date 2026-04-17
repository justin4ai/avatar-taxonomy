import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  onEnter: () => void;
}

export function Landing({ onEnter }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = '/hero.png';
    img.onload = () => setImgLoaded(true);
    img.onerror = () => setImgLoaded(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        onEnter();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onEnter]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
      onClick={onEnter}
      className="fixed inset-0 z-[100] overflow-hidden bg-[#050509] cursor-pointer"
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: imgLoaded ? 1 : 0, scale: 1 }}
        transition={{
          opacity: { duration: 1.2, ease: 'easeOut' },
          scale: { duration: 14, ease: 'linear' },
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(5,5,9,0) 0%, rgba(5,5,9,0.35) 55%, rgba(5,5,9,0.92) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,9,0.98) 0%, rgba(5,5,9,0.7) 40%, rgba(5,5,9,0) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background:
            'radial-gradient(900px 700px at 15% 20%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(900px 700px at 85% 80%, rgba(232,121,249,0.18), transparent 60%)',
        }}
      />

      <div className="relative z-10 h-full w-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center gap-2.5 px-6 sm:px-10 pt-6 sm:pt-8"
        >
          <div className="relative">
            <div
              className="h-6 w-6 rounded-md"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, #22d3ee 0%, #a78bfa 55%, #e879f9 100%)',
                boxShadow: '0 0 18px rgba(167,139,250,0.45)',
              }}
            />
            <div className="absolute inset-0 rounded-md ring-1 ring-white/20" />
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/60">
            Avatar Atlas
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col justify-end px-6 sm:px-10 pb-12 sm:pb-16 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.35em] text-cyan-300/80 mb-4 sm:mb-6"
          >
            <span className="inline-block h-px w-8 align-middle mr-3 bg-cyan-300/60" />
            An atlas of 3D human research
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.0, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-semibold tracking-[-0.02em] leading-[0.95] text-white"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}
          >
            3D Avatar
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #22d3ee 0%, #a78bfa 55%, #e879f9 100%)',
              }}
            >
              Taxonomy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.9 }}
            className="mt-5 sm:mt-7 max-w-xl text-[14px] sm:text-[16px] leading-relaxed text-white/65"
          >
            NeRF · 3D Gaussian Splatting · parametric priors · relightable and
            animatable humans. A curated, searchable map of the field from
            2018 to today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.55, duration: 0.8 }}
            className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-6"
          >
            <button
              onClick={onEnter}
              className="group relative inline-flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-[13px] sm:text-[14px] font-medium text-black bg-white hover:bg-white/90 transition"
            >
              Enter the atlas
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <div className="hidden sm:flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/45">
              <kbd className="kbd">Enter</kbd>
              <span>or click anywhere</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="absolute bottom-5 right-6 sm:right-10 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/35"
        >
          NeRF · 3DGS · Relightable · 2018 → 2026
        </motion.div>
      </div>

    </motion.div>
  );
}
