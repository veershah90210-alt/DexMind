import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, FileText, Bookmark, Info, Copy, Check } from 'lucide-react';

function formatContentType(type) {
  if (!type) return 'Field Record';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
          className="fixed inset-0 bg-[#060b19]/80 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[#1e293b] border-2 border-[#475569] border-t-4 border-t-[#dc2626] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="bg-[#c0262d] px-5 py-3 border-b-2 border-[#8e1920] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="bg-yellow-400 text-slate-950 text-xs font-mono font-black px-2 py-0.5 border border-yellow-300 uppercase">
                Canon Archive
              </span>
              <div>
                <h2 className="text-sm font-black text-white capitalize leading-tight font-sans">
                  {source.pokemon_name} Battle Record
                </h2>
                <span className="text-[10px] font-mono text-red-100 font-bold uppercase">
                  {formatContentType(source.content_type)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-300 p-1 bg-red-800 hover:bg-red-700 transition-colors cursor-pointer border border-red-900"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-sm bg-[#1e293b]">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2.5 bg-[#0f172a] p-3 border border-[#334155]">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                  Record Category
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1e293b] border border-[#334155] text-slate-200 font-mono text-xs font-semibold">
                  <Bookmark className="w-3 h-3 text-yellow-400" />
                  {formatContentType(source.content_type)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
                  Canon Source
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1e293b] border border-[#334155] text-slate-200 font-mono text-xs capitalize font-semibold">
                  <Info className="w-3 h-3 text-sky-400" />
                  {source.version_group || 'National Pokédex Archives'}
                </span>
              </div>
            </div>

            {/* Exact Evidence Passage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 text-white font-bold text-[11px] uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-yellow-400" />
                  Exact Evidence Passage:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] hover:text-white text-slate-400 transition-colors cursor-pointer font-bold uppercase"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#0f172a] p-3.5 border-l-4 border-l-yellow-400 border border-[#334155] text-slate-100 leading-relaxed font-sans text-xs">
                "{source.content}"
              </div>
            </div>

            {/* Source Reference Link */}
            {source.source_url && (
              <div className="pt-2.5 flex items-center justify-between text-xs text-slate-300 border-t border-[#334155]">
                <span className="truncate max-w-xs font-mono text-[11px] text-slate-400">
                  {source.source_url}
                </span>
                <a
                  href={source.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300 font-bold transition-colors uppercase tracking-wider text-[11px]"
                >
                  Inspect Reference
                  <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#0f172a] px-5 py-3 border-t-2 border-[#334155] flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
              Verified Game Evidence
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#334155] hover:bg-slate-600 text-white text-xs font-bold border border-slate-500 cursor-pointer uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
