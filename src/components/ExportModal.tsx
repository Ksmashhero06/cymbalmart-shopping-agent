import React, { useState } from 'react';
import { X, Copy, Check, Download, Printer, FileText } from 'lucide-react';
import { PartyPlan } from '../types';
import { exportPlanAsMarkdown, exportPlanAsCSV } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan
}) => {
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen) return null;

  const markdownText = exportPlanAsMarkdown(plan);
  const csvText = exportPlanAsCSV(plan);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_shopping_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Download className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export & Print Shopping List
              </h3>
              <p className="text-xs text-slate-500">
                Share with co-hosts, open in Excel/Sheets, or print for your store trip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              {copiedMd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedMd ? 'Copied to Clipboard!' : 'Copy Checklist'}
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Download CSV
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Print Sheet
            </button>
          </div>

          {/* Preview window */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Markdown / Text Preview
            </label>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono max-h-64 overflow-y-auto whitespace-pre-wrap select-all">
              {markdownText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200/80 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
