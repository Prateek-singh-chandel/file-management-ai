import React from 'react';
import { Brain, ChevronRight, WandSparkles } from 'lucide-react';

const toneStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  sky: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  violet: 'border-violet-400/20 bg-violet-400/10 text-violet-100',
  default: 'border-white/10 bg-white/5 text-slate-100',
};

export default function AiRecommendations({ suggestions }) {
  const cards = suggestions?.cards || [];
  const recommendations = suggestions?.recommendations || [];
  const mode = suggestions?.mode || 'local';

  return (
    <section id="suggestions" className="glass-card rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="muted-label">AI Suggestions</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Cleanup insights and next best actions</h2>
          <p className="mt-2 text-sm text-slate-400">
            {suggestions?.summary || 'Run a scan to generate cleanup guidance.'}
          </p>
        </div>
        <div className="metric-chip">
          <Brain className="h-4 w-4 text-cyan-300" />
          {mode === 'openai' ? 'OpenAI mode' : 'Local heuristic mode'}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {cards.length ? (
          cards.map((card) => (
            <div
              key={`${card.title}-${card.value}`}
              className={`rounded-[1.5rem] border p-4 ${toneStyles[card.tone] || toneStyles.default}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-current/70">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <WandSparkles className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-sm text-current/85">{card.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white">
                <span>{card.action}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400">
            No AI suggestions yet. Scan a folder to unlock cleanup recommendations.
          </div>
        )}
      </div>

      {recommendations.length ? (
        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Recommended next steps</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            {recommendations.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
