import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, FileText, Bookmark, Info, Copy, Check } from 'lucide-react';

export default function CitationPanel({ source, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!source) return null;

  const handleCopy = async () => {
    if (!source.content) return;
    try {
      await navigator.clipboard.writeText(source.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-[#10131d] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="bg-[#151a27] px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                {source.citation_tag || 'SOURCE'}
              </span>
              <div>
                <h2 className="text-base font-bold text-white capitalize leading-tight">
                  {source.pokemon_name} Evidence Record
                </h2>
                <span className="text-[11px] font-mono text-zinc-400">
                  PokéAPI Canonical Document
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-3 bg-[#0a0c13] p-4 rounded-xl border border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                  Content Type
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono text-xs">
                  <Bookmark className="w-3.5 h-3.5 text-red-400" />
                  {source.content_type || 'General'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                  Canon Source Group
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 font-mono text-xs capitalize">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  {source.version_group || 'Generation 1 Kanto'}
                </span>
              </div>
            </div>

            {/* Exact Evidence Passage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  Exact Retrieved Grounding Chunk:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] hover:text-white text-zinc-400 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy chunk</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#090a10] p-4 rounded-xl border-l-2 border-l-red-500 border border-white/[0.06] text-zinc-200 leading-relaxed font-sans text-sm selection:bg-red-500/30">
                "{source.content}"
              </div>
            </div>

            {/* Source Reference Link */}
            {source.source_url && (
              <div className="pt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-white/[0.06]">
                <span className="truncate max-w-xs font-mono text-[11px] text-zinc-400">
                  {source.source_url}
                </span>
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Inspect PokéAPI
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#151a27] px-6 py-3 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500">
              Atlas Vector Search Grounding
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
