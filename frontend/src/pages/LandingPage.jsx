import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Bot, FolderSearch, ShieldCheck, Sparkles, Undo2 } from 'lucide-react';

const features = [
  {
    Icon: FolderSearch,
    title: 'Recursive folder scanner',
    description: 'Crawls nested folders, extracts metadata, and flags clutter patterns automatically.',
  },
  {
    Icon: Bot,
    title: 'AI cleanup suggestions',
    description: 'Uses OpenAI when available and falls back to smart local heuristics when it is not.',
  },
  {
    Icon: ShieldCheck,
    title: 'Safe organization and undo',
    description: 'Files are moved with history tracking so you can restore anything with one click.',
  },
  {
    Icon: Undo2,
    title: 'Hackathon-ready UX',
    description: 'Glassmorphism panels, motion, analytics, and clear flows built for live demos.',
  },
];

export default function LandingPage({ onEnterDashboard }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,_rgba(2,6,23,0.95),_rgba(2,6,23,1))]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="flex flex-col justify-center">
            <div className="metric-chip w-fit">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Smart File Organizer + AI Suggestions
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight text-white sm:text-6xl">
              Turn chaotic folders into a structured, AI-assisted workflow.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              A production-style hackathon demo that scans messy folders, detects duplicates and clutter,
              predicts category-based organization, and restores everything safely with undo support.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="primary-button" onClick={onEnterDashboard}>
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#features"
                className="secondary-button"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore features
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Recursive scanner', value: '1-click' },
                { label: 'Cleanup safety', value: 'Undo JSON' },
                { label: 'AI mode', value: 'OpenAI + local' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-[1.5rem] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              className="glass-card-strong relative rounded-[2rem] p-6"
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="muted-label">Demo cockpit</p>
                <div className="mt-4 space-y-4">
                  {[
                    'Scan absolute folder paths',
                    'Detect duplicates, old files, and screenshots',
                    'Preview before/after organization',
                    'Move files into category folders',
                    'Restore the previous layout anytime',
                  ].map((line, index) => (
                    <div key={line} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm text-cyan-200">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-200">{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">Glass UI</p>
                  <p className="mt-2 text-sm text-emerald-50">Dark, modern, and built for fast live demos.</p>
                </div>
                <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-100/80">Undo safety</p>
                  <p className="mt-2 text-sm text-sky-50">Every move is stored in JSON for instant restore.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div id="features" className="mt-16">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="muted-label">Features</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Everything a startup-grade demo needs</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnimatePresence>
              {features.map(({ Icon, title, description }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-[1.5rem] p-5"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
