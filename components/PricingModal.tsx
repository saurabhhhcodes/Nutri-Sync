
import React, { useState } from 'react';
import { XIcon, CheckCircleIcon, AxonFlowIcon } from './Icons';
import { paymentService } from '../services/paymentService';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [processing, setProcessing] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async (type: 'GLOBAL' | 'INDIA') => {
    setProcessing(type);
    if (type === 'GLOBAL') {
        await paymentService.initiatePayPal(19.99);
    } else {
        await paymentService.initiateIndianBankTransfer(19.99);
    }
    onUpgrade();
    setProcessing(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="grid md:grid-cols-2">
          
          {/* Left: Perks */}
          <div className="p-8 md:p-12 bg-slate-950/50">
            <div className="flex items-center gap-2 mb-8">
              <AxonFlowIcon className="w-6 h-6 text-cyan-500" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em]">Nutri-Sync Pro</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Unlock Medical Grade Insights</h2>
            <ul className="space-y-4 mb-8">
              {[
                "Unlimited Biomarker Extractions",
                "Advanced Clinical Cross-Referencing",
                "Priority Cloud Sync (PostgreSQL)",
                "Full History Cloud Backup",
                "Direct Clinician Export (PDF)"
              ].map((perk, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                    "Nutri-Sync Pro allows me to keep a persistent record of my patient markers without worrying about local data loss."
                </p>
            </div>
          </div>

          {/* Right: Payment Options */}
          <div className="p-8 md:p-12 flex flex-col justify-center border-l border-slate-800 relative">
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <XIcon />
            </button>
            
            <div className="text-center mb-10">
                <div className="text-slate-400 text-sm mb-1 uppercase tracking-widest font-bold">Monthly Plan</div>
                <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-black text-white">$19.99</span>
                    <span className="text-slate-500 text-sm">/ month</span>
                </div>
            </div>

            <div className="space-y-4">
                <button 
                    onClick={() => handlePayment('GLOBAL')}
                    disabled={!!processing}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {processing === 'GLOBAL' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    Global Payment (PayPal)
                </button>
                
                <button 
                    onClick={() => handlePayment('INDIA')}
                    disabled={!!processing}
                    className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all border border-slate-700 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {processing === 'INDIA' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    Indian Banks / UPI
                </button>
            </div>

            <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-widest leading-relaxed">
                Securely processed by global clinical compliance standards. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
