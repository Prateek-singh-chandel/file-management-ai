import React from 'react';
import Sidebar from '../components/Sidebar';
import ScannerCard from '../components/ScannerCard';
import StatCards from '../components/StatCards';
import PreviewPanel from '../components/PreviewPanel';
import AiRecommendations from '../components/AiRecommendations';
import CategoryChart from '../components/CategoryChart';
import FileTable from '../components/FileTable';
import { motion } from 'framer-motion';
import { AlertTriangle, FileDigit, FolderClock, ScanSearch } from 'lucide-react';

export default function DashboardPage({
  folderPath,
  setFolderPath,
  onNavigate,
  onScan,
  onOrganize,
  onUndo,
  isLoading,
  loadingAction,
  progress,
  scanData,
  searchTerm,
  setSearchTerm,
}) {
  const stats = scanData?.stats || {};

  return (
    <div className="mx-auto grid w-full max-w-[1700px] gap-6 px-4 py-4 lg:grid-cols-[290px_1fr] lg:px-6">
      <Sidebar onNavigate={onNavigate} stats={stats} folderPath={folderPath} />

      <main className="space-y-6">
        <ScannerCard
          folderPath={folderPath}
          setFolderPath={setFolderPath}
          onScan={onScan}
          onOrganize={onOrganize}
          onUndo={onUndo}
          isLoading={isLoading}
          loadingAction={loadingAction}
          progress={progress}
          scannedAt={scanData?.scannedAt}
        />

        <StatCards stats={stats} />

        {scanData?.issues?.length ? (
          <section className="glass-card rounded-[1.75rem] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="muted-label">Scan notes</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Non-fatal scan issues</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-amber-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {scanData.issues.slice(0, 4).map((issue) => (
                <div key={`${issue.path}-${issue.error}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium text-white">{issue.path}</p>
                  <p className="mt-1 text-sm text-slate-400">{issue.error}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <AiRecommendations suggestions={scanData?.suggestions} />

          <section id="analytics" className="space-y-6">
            <CategoryChart
              distribution={stats.categoryDistribution}
              totalFiles={stats.totalFiles || 0}
            />

            <div className="glass-card rounded-[1.75rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="muted-label">High-value signals</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Largest and oldest files</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                  <FolderClock className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <ScanSearch className="h-4 w-4 text-cyan-300" />
                    Largest files
                  </div>
                  <div className="mt-3 space-y-3 text-sm text-slate-300">
                    {(stats.largestFiles || []).slice(0, 4).map((item) => (
                      <div key={item.path} className="flex items-center justify-between gap-4">
                        <span className="line-clamp-1">{item.name}</span>
                        <span className="shrink-0 text-slate-400">{item.sizeHuman}</span>
                      </div>
                    ))}
                    {!(stats.largestFiles || []).length ? (
                      <p className="text-slate-400">Run a scan to surface the largest files.</p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <FileDigit className="h-4 w-4 text-emerald-300" />
                    Duplicate clusters
                  </div>
                  <div className="mt-3 space-y-3 text-sm text-slate-300">
                    {(stats.duplicateGroups || []).slice(0, 4).map((group) => (
                      <div key={group.md5} className="flex items-center justify-between gap-4">
                        <span>{group.count} files</span>
                        <span className="shrink-0 text-slate-400">{group.reclaimableBytesHuman || ''}</span>
                      </div>
                    ))}
                    {!(stats.duplicateGroups || []).length ? (
                      <p className="text-slate-400">No duplicate clusters detected yet.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <PreviewPanel beforePreview={scanData?.beforePreview} afterPreview={scanData?.afterPreview} />

        <FileTable files={scanData?.files || []} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {!scanData ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[1.75rem] p-8 text-center"
          >
            <p className="text-lg font-semibold text-white">Ready when you are</p>
            <p className="mt-2 text-sm text-slate-400">
              Enter a folder path, scan it, and the dashboard will fill with analytics, previews, and cleanup advice.
            </p>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
