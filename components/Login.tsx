
import React, { useState } from 'react';
import { ActivityIcon, NutriSyncLogo, AxonFlowIcon, CheckCircleIcon } from './Icons';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (profile: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('2FA');
    }, 1500);
  };

  const handleFinalize = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: crypto.randomUUID(),
        name: email.split('@')[0].toUpperCase() || 'DR. GUEST',
        email: email || 'guest@axonflow.ai',
        role: 'Clinical User',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email || 'Guest'}`,
        tier: 'FREE',
        credits: 3
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Brand Side */}
      <div className="hidden md:flex md:w-1/2 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-slate-950 p-12 flex-col justify-between relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] border border-cyan-500/20 rounded-full animate-pulse"></div>
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] border border-blue-500/10 rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <NutriSyncLogo className="w-12 h-12 shadow-2xl" />
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter">NUTRI-SYNC</h1>
              <div className="flex items-center gap-2">
                <AxonFlowIcon className="w-4 h-4 text-cyan-500" />
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">Enterprise Node v4.0</span>
              </div>
            </div>
          </div>
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Global Clinical <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Interpreting patient biomarkers with pixel-perfect visual food analysis. Secured by AxonFlow AI.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">99.9%</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Uptime</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">ISO/IEC</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Certified</span>
          </div>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-950">
        <div className="w-full max-w-md">
          {step === 'LOGIN' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-2xl font-bold text-white mb-2">Secure Access</h3>
              <p className="text-slate-500 text-sm mb-8">Enter your clinical credentials to access the global node.</p>
              
              <form onSubmit={handleInitialSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Institutional Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    placeholder="dr.jane@hospital.com"
                    required
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Request Access Node'}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-500 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-emerald-500/30">
                <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Identity Verified</h3>
              <p className="text-slate-500 text-sm mb-10">Establishing HIPAA-compliant connection to PostgreSQL Global Cluster...</p>
              
              <button 
                onClick={handleFinalize}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Launch Dashboard'}
              </button>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-900 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Powered by AxonFlow</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-cyan-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-500 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
