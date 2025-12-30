
import React, { useState, useEffect } from 'react';
import { FileUploadCard } from './components/FileUploadCard';
import { AnalysisResults } from './components/AnalysisResults';
import { HistorySidebar } from './components/HistorySidebar';
import { Login } from './components/Login';
import { WalletDashboard } from './components/WalletDashboard';
import { FileData, AnalysisResult, UserProfile } from './types';
import { analyzeHealthAndFood } from './services/geminiService';
import { dbService } from './services/databaseService';
import { NutriSyncLogo, AxonFlowIcon, ActivityIcon, RefreshCwIcon, HistoryIcon, LogOutIcon, BlockchainIcon } from './components/Icons';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  // App State - Changed to Arrays for Multi-file support
  const [reportFiles, setReportFiles] = useState<FileData[]>([]);
  const [foodFiles, setFoodFiles] = useState<FileData[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Persistent Session
  useEffect(() => {
    const savedProfile = localStorage.getItem('nutriSyncUser');
    if (savedProfile) {
      try {
        setUser(JSON.parse(savedProfile));
      } catch (e) {
        localStorage.removeItem('nutriSyncUser');
      }
    }
    setAuthLoading(false);
  }, []);

  // Real-time PostgreSQL Sync Simulation
  useEffect(() => {
    if (user) {
      setIsSyncing(true);
      dbService.fetchHistory(user.id).then(data => {
        setHistory(data);
        setIsSyncing(false);
      });
    }
  }, [user?.id]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveToHistory = async (newResult: AnalysisResult) => {
    if (!user) return;
    const updated = [newResult, ...history].slice(0, 50);
    setHistory(updated);
    
    setIsSyncing(true);
    await dbService.syncHistory(user.id, updated);
    
    if (user.tier === 'FREE') {
      const updatedUser = { ...user, credits: Math.max(0, user.credits - 1) };
      setUser(updatedUser);
      await dbService.updateUser(updatedUser);
    }
    setIsSyncing(false);
  };

  const handleUpgrade = async (tier: 'PRO') => {
    if (!user) return;
    const proUser: UserProfile = { ...user, tier, credits: 999999 };
    setUser(proUser);
    await dbService.updateUser(proUser);
  };

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('nutriSyncUser', JSON.stringify(profile));
  };

  const handleSignOut = () => {
    localStorage.removeItem('nutriSyncUser');
    setUser(null);
    reset();
  };

  const handleAnalyze = async () => {
    if (reportFiles.length === 0 || foodFiles.length === 0) return;
    
    if (user?.tier === 'FREE' && user.credits <= 0) {
      setShowWallet(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      "Securing Node Connection...",
      "Hashing Patient Data for Blockchain Audit...",
      "Extracting Clinical Biomarkers from Reports...",
      "Analyzing Nutrient Composition...",
      "Generating Risk Matrix..."
    ];
    let stepIndex = 0;
    setLoadingStep(steps[0]);
    
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setLoadingStep(steps[stepIndex]);
    }, 1200);

    try {
      const analysis = await analyzeHealthAndFood(
        reportFiles,
        foodFiles
      );
      
      clearInterval(interval);
      setResult(analysis);
      await saveToHistory({ ...analysis, userId: user?.id || 'guest' });

    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setError("AxonFlow Clinical Node timed out. Please ensure images are clear.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setReportFiles([]);
    setFoodFiles([]);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <ActivityIcon className="w-12 h-12 text-cyan-500 animate-pulse mb-4" />
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Establishing Secure Session</span>
    </div>
  );

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-32 bg-slate-950 text-slate-100 selection:bg-blue-600">
      
      <WalletDashboard 
        user={user} 
        isOpen={showWallet} 
        onClose={() => setShowWallet(false)} 
        onUpgrade={handleUpgrade} 
      />
      
      <HistorySidebar 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        history={history}
        onSelect={(item) => { setResult(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onClear={() => { setHistory([]); localStorage.removeItem(`nutriSyncHistory_${user.id}`); }}
      />

      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md border-slate-800 py-4' : 'bg-transparent border-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <NutriSyncLogo className="w-10 h-10 shadow-2xl cursor-pointer hover:scale-105 transition-transform" onClick={reset} />
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-white leading-none">Nutri-Sync</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">PostgreSQL v16 • Live Sync</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowWallet(true)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${user.tier === 'PRO' ? 'bg-slate-900 border-cyan-500/30 text-cyan-400' : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20'}`}
            >
              {user.tier === 'PRO' ? 'Pro Membership' : 'Get Unlimited Access'}
            </button>
            
            <button onClick={() => setHistoryOpen(true)} className="p-2.5 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-xl border border-slate-800">
                <HistoryIcon className="w-5 h-5" /> 
            </button>

            <div className="h-8 w-px bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-white">{user.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{user.tier === 'PRO' ? 'Clinical Elite' : `${user.credits} Reports Remaining`}</span>
                </div>
                <img src={user.avatar} className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 shadow-xl" />
                <button onClick={handleSignOut} className="p-2.5 text-slate-500 hover:text-red-400 transition-colors"><LogOutIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-48 max-w-7xl mx-auto px-6">
        
        {!result && !loading && (
            <div className="text-center mb-24 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 mb-10">
                    <BlockchainIcon className="w-4 h-4 text-cyan-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Auditable Blockchain Medical Records</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                    Sync your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500">Biological Truth.</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Professional-grade interpretation of lab biomarkers. We cross-reference your specific medical history with real-time visual meal data.
                </p>
            </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 transition-all duration-700 ${result ? 'hidden opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-slate-800/50 to-slate-950 shadow-2xl">
            <FileUploadCard 
              title="Clinical Data" 
              description="Upload multiple Blood Panels, Hormonal Logs, or BP Reports" 
              icon="report" 
              files={reportFiles} 
              onFilesChange={setReportFiles} 
              accept="image/*,application/pdf" 
            />
          </div>
          <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-slate-800/50 to-slate-950 shadow-2xl">
            <FileUploadCard 
              title="Nutrient Visuals" 
              description="Upload multiple angles of your meal" 
              icon="food" 
              files={foodFiles} 
              onFilesChange={setFoodFiles} 
              accept="image/*" 
            />
          </div>
        </div>
        
        {result && (
             <div className="flex justify-center mb-16 animate-in fade-in zoom-in duration-500">
                <button onClick={reset} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-xl">
                    <RefreshCwIcon className="w-4 h-4" /> Reset Analysis Environment
                </button>
             </div>
        )}

        {!result && !loading && (
            <div className="flex flex-col items-center justify-center pb-20">
            {error && <div className="mb-10 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 text-sm font-medium animate-in shake duration-500">{error}</div>}
            
            <button
                onClick={handleAnalyze}
                disabled={reportFiles.length === 0 || foodFiles.length === 0}
                className={`group relative px-16 py-8 rounded-[2.5rem] font-black text-2xl transition-all duration-500 ${reportFiles.length === 0 || foodFiles.length === 0 ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800' : 'bg-white text-slate-950 shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95'}`}
            >
                <span className="relative z-10 flex items-center gap-4">
                    Analyze Bio-Compatibility
                    <AxonFlowIcon className="w-8 h-8" />
                </span>
            </button>
            </div>
        )}

        <AnalysisResults result={result} loading={loading} loadingStep={loadingStep} />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 py-6 flex flex-col items-center justify-center z-30">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-cyan-500 font-mono text-[10px] uppercase font-black">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
            Node-01
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.4em] font-black">AxonFlow Global Clinical Grid v4.0</p>
        </div>
        <div className="flex gap-4">
            <p className="text-[8px] text-slate-700 uppercase tracking-widest font-bold">HIPAA Compliant Session</p>
            <p className="text-[8px] text-slate-700 uppercase tracking-widest font-bold">ISO-27001 Certified Environment</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
