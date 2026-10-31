import React from 'react';
import { X, ExternalLink, FileText, Bookmark, Info } from 'lucide-react';

export default function CitationPanel({ source, onClose }) {
  if (!source) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-zinc-900 border border-zinc-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-zinc-850 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
              {source.citation_tag || 'SOURCE'}
            </span>
            <h2 className="text-lg font-bold text-zinc-100 capitalize">
              {source.pokemon_name} Evidence Passage
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                Content Type
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs">
                <Bookmark className="w-3 h-3 text-red-400" />
                {source.content_type || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">
                Version / Group
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs capitalize">
                <Info className="w-3 h-3 text-cyan-400" />
                {source.version_group || 'Generation 1 (All)'}
              </span>
            </div>
          </div>

          {/* Exact Retrieved Passage */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-zinc-400 font-medium">
              <FileText className="w-4 h-4 text-red-400" />
              <span>Exact Retrieved Evidence Passage:</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-zinc-200 leading-relaxed font-sans text-sm selection:bg-red-500/30">
              "{source.content}"
            </div>
          </div>

          {/* Source Link */}
          {source.source_url && (
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80">
              <span className="truncate max-w-xs font-mono">{source.source_url}</span>
              <a
                href={source.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Inspect PokéAPI Record
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-850 px-6 py-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
