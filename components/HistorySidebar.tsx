import React from 'react';
import { AnalysisResult } from '../types';
import { ClockIcon, TrashIcon, XIcon, ActivityIcon } from './Icons';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
  onClear: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  onClear 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ClockIcon className="text-cyan-400" />
              Scan History
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <XIcon />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No past analyses yet.</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.compatibilityScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 
                        item.compatibilityScore >= 50 ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-red-500/10 text-red-400'
                    }`}>
                      Score: {item.compatibilityScore}
                    </span>
                  </div>
                  <h4 className="text-slate-200 font-semibold mb-1 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {item.foodItems[0]?.name || "Unknown Meal"} + {item.foodItems.length > 1 ? ` ${item.foodItems.length - 1} others` : ''}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div className="p-6 border-t border-slate-800">
              <button 
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-900/30 text-red-400 hover:bg-red-900/10 transition-colors text-sm font-semibold"
              >
                <TrashIcon className="w-4 h-4" />
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};