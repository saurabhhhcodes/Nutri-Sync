import React, { useState } from 'react';
import { ActivityIcon, GoogleIcon } from './Icons';

interface LoginProps {
  onGuestLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onGuestLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = async () => {
    if (loading || isRedirecting) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate login delay
    setTimeout(() => {
        setLoading(false);
        setError("Google Sign-in is currently disabled. Please use Guest Access.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="bg-cyan-500/10 p-4 rounded-2xl mb-6 ring-1 ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <ActivityIcon className="w-10 h-10 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Nutri-Sync</h1>
                <p className="text-slate-400">Dietary Intelligence Platform</p>
            </div>

            {/* Action */}
            <div className="space-y-4">
                <button 
                    onClick={handleLogin}
                    disabled={loading || isRedirecting}
                    className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg group disabled:opacity-70 disabled:cursor-wait"
                >
                    {loading || isRedirecting ? (
                        <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <GoogleIcon className="w-5 h-5" />
                    )}
                    <span>
                        {isRedirecting ? 'Redirecting...' : loading ? 'Connecting...' : 'Continue with Google'}
                    </span>
                </button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500 font-semibold rounded">Or</span>
                    </div>
                </div>

                <button 
                    onClick={onGuestLogin}
                    disabled={loading || isRedirecting}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 border border-slate-700 hover:border-cyan-500/30 disabled:opacity-50"
                >
                    <span>Guest Access (Demo)</span>
                </button>

                {error && (
                    <div className={`text-center text-sm py-3 rounded-lg border mt-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                        isRedirecting 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-950/30 border-red-900/30 text-red-400'
                    }`}>
                        {error}
                    </div>
                )}
            </div>

            {/* Footer Trust Badge */}
            <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Clinical-Grade Encryption
                </div>
            </div>

        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};