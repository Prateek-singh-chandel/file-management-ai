import React from 'react';
import { Circle, Layers3 } from 'lucide-react';

const palette = ['#22d3ee', '#34d399', '#f59e0b', '#f472b6', '#a78bfa', '#60a5fa', '#fb7185', '#cbd5e1'];

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

export default function CategoryChart({ distribution, totalFiles = 0 }) {
  const list = distribution || [];
  const total = list.reduce((sum, item) => sum + (item.count || 0), 0) || totalFiles;
  const segments = list.length
    ? list
        .map((item, index) => {
          const start = list.slice(0, index).reduce((sum, entry) => sum + (entry.percentage || 0), 0);
          const end = start + (item.percentage || 0);
          return `${palette[index % palette.length]} ${start}% ${end}%`;
        })
        .join(', ')
    : '#1f2937 0% 100%';

  return (
    <section className="glass-card rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="muted-label">Category distribution</p>
          <h2 className="mt-2 text-xl font-semibold text-white">File mix at a glance</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
          <Layers3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="flex items-center justify-center">
          <div
            className="relative h-56 w-56 rounded-full border border-white/10 shadow-2xl"
            style={{ background: `conic-gradient(${segments})` }}
          >
            <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/95 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Total</p>
              <p className="mt-2 text-3xl font-bold text-white">{total}</p>
              <p className="mt-1 text-sm text-slate-400">files</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {list.length ? (
            list.map((item, index) => (
              <div key={item.category} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Circle className="h-3 w-3 fill-current" style={{ color: palette[index % palette.length] }} />
                    <p className="font-medium text-white">{item.category}</p>
                  </div>
                  <p className="text-sm text-slate-400">{formatPercent(item.percentage || 0)}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage || 0}%`,
                      backgroundColor: palette[index % palette.length],
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{item.count} files</span>
                  <span>{item.sizeHuman || '0 B'}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
              <p className="text-sm text-slate-400">No category data yet. Run a scan to populate the chart.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
