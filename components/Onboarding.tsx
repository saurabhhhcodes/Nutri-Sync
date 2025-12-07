import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ActivityIcon } from './Icons';

interface OnboardingProps {
  onLogin: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Patient (Type 2 Diabetes)');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing...');

  // Generate deterministic avatar based on name
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'User'}&backgroundColor=06b6d4&textColor=ffffff`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    
    // Simulate secure setup sequence
    const steps = [
        { text: "Encrypting Bio-Data...", delay: 800 },
        { text: "Allocating Secure Sandbox...", delay: 1500 },
        { text: "Syncing Clinical Parameters...", delay: 800 }
    ];

    let currentStep = 0;
    
    // Run through fake loading steps
    const processSteps = async () => {
        for (const step of steps) {
            setLoadingText(step.text);
            await new Promise(resolve => setTimeout(resolve, step.delay));
        }
        
        // Finalize
        const profile: UserProfile = {
            id: crypto.randomUUID(),
            name,
            email,
            role,
            avatar: avatarUrl
        };
        onLogin(profile);
    };

    processSteps();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 z-10">
        <div className="glass-panel p-8 md:p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden">
            
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
                    <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2">{loadingText}</h3>
                    <p className="text-sm text-slate-400">Establishing HIPAA-compliant session...</p>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="relative mb-4 group">
                    <div className="w-24 h-24 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800 shadow-lg group-hover:border-cyan-500/50 transition-colors">
                        <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-cyan-500 text-slate-950 rounded-full p-1.5 border border-slate-900 shadow-md">
                        <ActivityIcon className="w-4 h-4" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Initialize Health Profile</h1>
                <p className="text-slate-400 text-sm">Create your secure bio-identity</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jane Doe"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Role / Condition</label>
                    <div className="relative">
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer hover:bg-slate-900"
                        >
                            <option value="Patient (Type 2 Diabetes)">Patient (Type 2 Diabetes)</option>
                            <option value="Patient (CVD/Heart Health)">Patient (CVD/Heart Health)</option>
                            <option value="Patient (Hypertension)">Patient (Hypertension)</option>
                            <option value="General Wellness">General Wellness</option>
                            <option value="Clinician (Demo Mode)">Clinician (Demo Mode)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] mt-4 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Create Secure Session
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>

            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-600">
                    Secure Session ID: <span className="font-mono text-slate-500">{crypto.randomUUID().split('-')[0]}...</span>
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};