import React from 'react';
import { FileText, Search, ShieldAlert } from 'lucide-react';

function formatSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return unitIndex === 0 ? `${Math.round(value)} ${units[unitIndex]}` : `${value.toFixed(1)} ${units[unitIndex]}`;
}

export default function FileTable({ files, searchTerm, setSearchTerm }) {
  const safeFiles = files || [];
  const query = searchTerm.trim().toLowerCase();
  const filtered = query
    ? safeFiles.filter((file) => {
        const haystack = [file.name, file.category, file.relativePath, file.extension].join(' ').toLowerCase();
        return haystack.includes(query);
      })
    : safeFiles;

  return (
    <section id="files" className="glass-card rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="muted-label">File table</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Scanned files and metadata</h2>
        </div>
        <div className="relative min-w-[260px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search files, categories, or paths..."
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.22em] text-slate-400">
              <tr>
                <th className="px-4 py-4 font-medium">File</th>
                <th className="px-4 py-4 font-medium">Category</th>
                <th className="px-4 py-4 font-medium">Size</th>
                <th className="px-4 py-4 font-medium">Modified</th>
                <th className="px-4 py-4 font-medium">Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length ? (
                filtered.map((file) => (
                  <tr key={file.path} className="transition hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-cyan-200">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{file.name}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {file.isLarge ? (
                              <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-rose-100">
                                Large
                              </span>
                            ) : null}
                            {file.isScreenshot ? (
                              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-1 text-sky-100">
                                Screenshot
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">{file.category}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{file.sizeHuman || formatSize(file.size)}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{file.modifiedAt}</td>
                    <td className="max-w-[320px] px-4 py-4 text-sm text-slate-400">
                      <div className="line-clamp-2 break-all">{file.relativePath}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-4 text-cyan-200">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-white">No matching files</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {safeFiles.length ? 'Try another search term.' : 'Run a scan to populate the table.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
