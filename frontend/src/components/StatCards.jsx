import React from 'react';
import { ArchiveRestore, Database, FileDigit, Files, FolderTree, ScanSearch } from 'lucide-react';

const metricCards = [
  { key: 'totalFiles', label: 'Files scanned', Icon: Files },
  { key: 'totalSizeHuman', label: 'Total size', Icon: Database },
  { key: 'storageCleanedHuman', label: 'Storage cleaned', Icon: ArchiveRestore },
  { key: 'duplicateCount', label: 'Duplicate files', Icon: FileDigit },
  { key: 'largeFileCount', label: 'Large files', Icon: ScanSearch },
  { key: 'categoryCount', label: 'Categories', Icon: FolderTree },
];

export default function StatCards({ stats }) {
  const safeStats = stats || {};

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metricCards.map(({ key, label, Icon }) => (
        <div key={key} className="glass-card rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{safeStats[key] ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
