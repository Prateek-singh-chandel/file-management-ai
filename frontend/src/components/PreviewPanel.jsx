import React from 'react';
import { ArrowRightLeft, FolderTree, FolderOpen, FileText } from 'lucide-react';

function TreeNode({ node, level = 0 }) {
  const isFolder = node.kind === 'folder';

  return (
    <div style={{ marginLeft: level ? 18 : 0 }} className="select-none">
      <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5">
        {isFolder ? (
          <FolderOpen className="h-4 w-4 text-cyan-300" />
        ) : (
          <FileText className="h-4 w-4 text-slate-400" />
        )}
        <span className={`text-sm ${isFolder ? 'font-medium text-white' : 'text-slate-300'}`}>{node.name}</span>
      </div>
      {isFolder && Array.isArray(node.children) && node.children.length ? (
        <div className="border-l border-dashed border-white/10 pl-2">
          {node.children.map((child) => (
            <TreeNode key={`${node.name}-${child.name}-${child.kind}`} node={child} level={level + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TreeCard({ title, tree, accent }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="muted-label">{title}</p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {accent || title}
          </h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
          <FolderTree className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        {tree ? <TreeNode node={tree} /> : <p className="text-sm text-slate-400">No preview available.</p>}
      </div>
    </div>
  );
}

export default function PreviewPanel({ beforePreview, afterPreview }) {
  return (
    <section className="glass-card rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="muted-label">Before / after preview</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Predicted organization layout</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <TreeCard title="Before organization" tree={beforePreview} accent="Current structure" />
        <TreeCard title="After organization" tree={afterPreview} accent="Planned structure" />
      </div>
    </section>
  );
}
