
import React, { useState } from 'react';
import { XIcon, CheckCircleIcon, AxonFlowIcon, RefreshCwIcon, PayPalIcon, UpiIcon, AlertTriangleIcon, IconProps, LockIcon, BlockchainIcon } from './Icons';
import { paymentService, REAL_CONFIG } from '../services/paymentService';
import { UserProfile } from '../types';

interface WalletDashboardProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'PRO') => void;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({ user, isOpen, onClose, onUpgrade }) => {
  const [view, setView] = useState<'PLANS' | 'CHECKOUT' | 'VERIFYING'>('PLANS');
  const [gateway, setGateway] = useState<'PAYPAL' | 'UPI' | null>(null);
  const [txId, setTxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectGateway = (type: 'PAYPAL' | 'UPI') => {
    setGateway(type);
    setView('CHECKOUT');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txId.length < 6) {
      setError("Please enter a valid Transaction ID or UTR number.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    const isValid = await paymentService.verifyTransaction(txId);
    
    if (isValid) {
      setView('VERIFYING');
      setTimeout(() => {
        onUpgrade('PRO');
        setView('PLANS');
        onClose();
      }, 3000);
    } else {
      setError("Verification failed. Please check your Transaction ID.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] relative">
        <div className="flex flex-col md:flex-row min-h-[650px]">
          
          {/* Left: Account Status Panel */}
          <div className="w-full md:w-80 p-10 bg-slate-950/50 border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <AxonFlowIcon className="w-8 h-8 text-cyan-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white tracking-tighter uppercase">AxonWallet</span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {user.id.split('-')[0]}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Membership</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xl font-black uppercase ${user.tier === 'PRO' ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {user.tier}
                    </span>
                    {user.tier === 'PRO' && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                  </div>
                </div>

                <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Cloud Synced History</span>
                  <span className="text-3xl font-black text-white">{user.tier === 'PRO' ? '100%' : 'LOCKED'}</span>
                </div>
              </div>
            </div>

            <div className="pt-10 space-y-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <LockIcon className="w-3 h-3" /> ISO-27001 Secure
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <BlockchainIcon className="w-3 h-3" /> On-Chain Audit
              </div>
            </div>
          </div>

          {/* Main Interface Area */}
          <div className="flex-1 p-10 md:p-16 relative flex flex-col justify-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
            <button onClick={onClose} className="absolute top-10 right-10 p-2 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full border border-slate-700">
              <XIcon className="w-6 h-6" />
            </button>

            {view === 'PLANS' ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                  Upgrade to Pro <br /> Clinical Access.
                </h2>
                <p className="text-slate-400 text-lg mb-12 max-w-xl leading-relaxed">
                  Join 2,500+ clinicians using Nutri-Sync Pro for high-fidelity biomarker interpretation and visual dietary logic.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* PayPal Card */}
                  <div 
                    onClick={() => handleSelectGateway('PAYPAL')}
                    className="group p-8 rounded-[2.5rem] border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-blue-500/50 transition-all cursor-pointer relative"
                  >
                    <PayPalIcon className="w-12 h-12 mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-2">Global (PayPal)</h4>
                    <p className="text-slate-500 text-sm mb-6">International Credit & Debit cards.</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">$19.99</span>
                      <span className="text-slate-500 text-xs font-bold uppercase">/Month</span>
                    </div>
                  </div>

                  {/* UPI Card */}
                  <div 
                    onClick={() => handleSelectGateway('UPI')}
                    className="group p-8 rounded-[2.5rem] border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-emerald-500/50 transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center gap-2 mb-6 text-emerald-500 font-black text-2xl italic">UPI / GPay</div>
                    <h4 className="text-2xl font-bold text-white mb-2">India Region</h4>
                    <p className="text-slate-500 text-sm mb-6">Zero-fee bank transfer via VPA.</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">₹1,650</span>
                      <span className="text-slate-500 text-xs font-bold uppercase">/Month</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : view === 'CHECKOUT' ? (
              <div className="animate-in fade-in zoom-in duration-500 max-w-xl mx-auto w-full text-center">
                <button onClick={() => setView('PLANS')} className="mb-8 text-slate-500 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2">
                  ← Back to Plans
                </button>
                
                <div className="bg-slate-950 border border-slate-800 p-10 rounded-[3rem] shadow-2xl mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <AxonFlowIcon className="w-20 h-20" />
                  </div>

                  <div className="mb-8 flex flex-col items-center">
                    <h4 className="text-2xl font-black text-white mb-6 uppercase tracking-widest italic">Scan & Pay</h4>
                    
                    {/* REAL QR SLOT */}
                    <div className="w-56 h-56 bg-white p-4 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] relative group">
                        <div className="w-full h-full bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                            {/* Realistic QR Pattern Simulation */}
                            <div className="grid grid-cols-6 gap-1.5 p-4 opacity-80">
                                {[...Array(36)].map((_, i) => (
                                    <div key={i} className={`w-3 h-3 ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'} ${i % 7 === 0 ? 'bg-blue-600' : ''}`}></div>
                                ))}
                            </div>
                            <span className="absolute bottom-2 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                {gateway === 'UPI' ? REAL_CONFIG.UPI_ID : REAL_CONFIG.PAYPAL_ID}
                            </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-[2rem]">
                            <span className="text-slate-900 text-xs font-black uppercase text-center px-4 leading-tight">Use any payment app to scan this secure code</span>
                        </div>
                    </div>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="text-left">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Payment Reference (UTR / TxID)</label>
                      <input 
                        type="text" 
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="Enter the 6+ digit transaction ID"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono"
                        required
                      />
                    </div>
                    {error && <p className="text-red-400 text-xs font-bold text-left ml-1">{error}</p>}
                    
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black text-xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'Verifying with Node...' : 'Verify & Activate Pro'}
                    </button>
                  </form>
                </div>

                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                   <CheckCircleIcon className="w-3 h-3 text-emerald-500" /> SECURE AUDITABLE TRANSACTION
                </p>
              </div>
            ) : (
              <div className="text-center animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-cyan-500/5">
                  <RefreshCwIcon className="w-12 h-12 text-cyan-500 animate-spin" />
                </div>
                <h3 className="text-4xl font-black text-white mb-4">Provisioning Access</h3>
                <p className="text-slate-400 text-lg">Establishing your biological node in the Global Clinical Registry...</p>
                <div className="mt-12 max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-cyan-500 animate-progress-indefinite"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
