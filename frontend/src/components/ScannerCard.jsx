import React from 'react';
import { FolderOpen, Play, RotateCcw, WandSparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScannerCard({
  folderPath,
  setFolderPath,
  onScan,
  onOrganize,
  onUndo,
  isLoading,
  loadingAction,
  progress,
  scannedAt,
}) {
  const busy = Boolean(isLoading);

  return (
    <motion.section
      id="scanner"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[2rem] p-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <p className="muted-label">Folder Scanner</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            Scan messy folders, surface cleanup opportunities, and organize files with one command.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Paste an absolute path from your machine. The backend scans recursively, computes duplicates,
            builds before/after previews, and stores an undo history for safe recovery.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:w-[520px]">
          <button
            type="button"
            onClick={onScan}
            disabled={busy || !folderPath}
            className="primary-button"
          >
            <Play className="h-4 w-4" />
            {loadingAction === 'scan' ? 'Scanning...' : 'Scan Folder'}
          </button>
          <button
            type="button"
            onClick={onOrganize}
            disabled={busy || !folderPath}
            className="secondary-button"
          >
            <WandSparkles className="h-4 w-4" />
            {loadingAction === 'organize' ? 'Organizing...' : 'Organize'}
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={busy}
            className="secondary-button"
          >
            <RotateCcw className="h-4 w-4" />
            {loadingAction === 'undo' ? 'Undoing...' : 'Undo'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div>
          <label className="muted-label" htmlFor="folder-path">
            Absolute folder path
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FolderOpen className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="folder-path"
                className="input-field pl-11"
                value={folderPath}
                onChange={(event) => setFolderPath(event.target.value)}
                placeholder={'C:\\Users\\YourName\\Desktop\\Messy Folder'}
                autoComplete="off"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Tip: use the exact folder location on this machine. The organizer works on the backend server's
            filesystem, so browser-only uploads are not required.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Progress</span>
            <span className="text-xs font-medium text-cyan-200">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-1 font-medium text-white">
                {busy ? 'Processing request' : 'Ready to scan'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last scan</p>
              <p className="mt-1 line-clamp-1 font-medium text-white">{scannedAt || 'Not yet run'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
