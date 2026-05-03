import React from 'react';
import { ArrowRight, Bot, FolderKanban, LayoutDashboard, ScanSearch, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const sections = [
  { id: 'scanner', label: 'Scanner', Icon: ScanSearch },
  { id: 'suggestions', label: 'AI Suggestions', Icon: Bot },
  { id: 'analytics', label: 'Analytics', Icon: LayoutDashboard },
  { id: 'files', label: 'Files', Icon: FolderKanban },
];

export default function Sidebar({ onNavigate, stats, folderPath }) {
  return (
    <aside className="glass-card-strong rounded-[2rem] p-5 md:sticky md:top-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
          <Sparkles className="h-6 w-6 text-cyan-300" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Smart File</p>
          <p className="text-lg font-bold text-white">Organizer</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
        <p className="muted-label">Folder Path</p>
        <p className="mt-2 break-all text-sm text-slate-300">
          {folderPath || 'Enter an absolute folder path to start the scan.'}
        </p>
      </div>

      <nav className="mt-5 space-y-2">
        {sections.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-cyan-300" />
              {label}
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}
      </nav>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Files</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats?.totalFiles ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Duplicates</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats?.duplicateCount ?? 0}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-emerald-400/10 p-4"
      >
        <p className="muted-label">Hackathon Mode</p>
        <p className="mt-2 text-sm text-slate-300">
          This dashboard scans, classifies, suggests cleanup, and keeps an undo trail in JSON.
        </p>
      </motion.div>
    </aside>
  );
}
