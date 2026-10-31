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
          className="fixed inset-0 bg-[#060b19]/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-[#0b142b] border border-blue-500/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="bg-[#0f1d38] px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                {source.citation_tag || 'SOURCE'}
              </span>
              <div>
                <h2 className="text-base font-bold text-white capitalize leading-tight">
                  {source.pokemon_name} Battle Record
                </h2>
                <span className="text-[11px] font-mono text-blue-300">
                  Official Field Research Document
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-300 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-3 bg-[#060b19] p-4 rounded-xl border border-blue-500/15">
              <div>
                <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider block mb-1 font-bold">
                  Record Category
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-200 font-mono text-xs">
                  <Bookmark className="w-3.5 h-3.5 text-yellow-400" />
                  {source.content_type?.replace('_', ' ') || 'General Lore'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider block mb-1 font-bold">
                  Canon Source
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-200 font-mono text-xs capitalize">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  {source.version_group || 'National Pokédex Archives'}
                </span>
              </div>
            </div>

            {/* Exact Evidence Passage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-blue-200">
                <span className="flex items-center gap-1.5 text-white font-bold">
                  <FileText className="w-3.5 h-3.5 text-yellow-400" />
                  Exact Field Research Citation:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] hover:text-white text-blue-300 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#060b19] p-4 rounded-xl border-l-2 border-l-yellow-400 border border-blue-500/15 text-blue-100 leading-relaxed font-sans text-sm selection:bg-yellow-400/20">
                "{source.content}"
              </div>
            </div>

            {/* Source Reference Link */}
            {source.source_url && (
              <div className="pt-3 flex items-center justify-between text-xs text-blue-300/70 border-t border-blue-500/15">
                <span className="truncate max-w-xs font-mono text-[11px] text-blue-300">
                  {source.source_url}
                </span>
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
                >
                  Inspect Reference
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#0f1d38] px-6 py-3 border-t border-blue-500/20 flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-300 font-medium">
              Official Pokémon League Field Lore
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
