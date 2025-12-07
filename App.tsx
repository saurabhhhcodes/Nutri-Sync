import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { FileUploadCard } from './components/FileUploadCard';
import { AnalysisResults } from './components/AnalysisResults';
import { HistorySidebar } from './components/HistorySidebar';
import { Login } from './components/Login';
import { FileData, AnalysisResult } from './types';
import { analyzeHealthAndFood } from './services/geminiService';
import { ActivityIcon, RefreshCwIcon, HistoryIcon, LogOutIcon } from './components/Icons';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [reportFile, setReportFile] = useState<FileData | null>(null);
  const [foodFile, setFoodFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Only set to null if we aren't in guest mode
        setUser((prev) => (prev?.uid === 'guest-demo-user' ? prev : null));
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load history (Scoped to User ID)
  useEffect(() => {
    if (user) {
        const saved = localStorage.getItem(`nutriSyncHistory_${user.uid}`);
        if (saved) {
          try {
            setHistory(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse history");
          }
        } else {
            setHistory([]);
        }
    }
  }, [user]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveToHistory = (newResult: AnalysisResult) => {
    if (!user) return;
    const updated = [newResult, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem(`nutriSyncHistory_${user.uid}`, JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (!user) return;
    setHistory([]);
    localStorage.removeItem(`nutriSyncHistory_${user.uid}`);
  };

  const handleGuestLogin = () => {
      const guestUser = {
          uid: 'guest-demo-user',
          displayName: 'Guest Demo',
          photoURL: null,
          email: 'guest@nutrisync.demo',
          emailVerified: true,
          isAnonymous: true,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
      };
      // Cast to unknown first to bypass partial implementation warnings in this context
      setUser(guestUser as unknown as User);
  };

  const handleSignOut = async () => {
    if (user?.uid === 'guest-demo-user') {
        setUser(null);
        reset();
        return;
    }
    try {
        await signOut(auth);
        reset();
    } catch (e) {
        console.error("Sign out failed", e);
    }
  };

  const handleAnalyze = async () => {
    if (!reportFile || !foodFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Scroll to results area automatically
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);

    // Fake loading steps for better UX
    const steps = [
        "Scanning Medical Report...",
        "Extracting Biomarkers (HbA1c, Lipids)...",
        "Analyzing Food Composition...",
        "Cross-Referencing Contraindications...",
        "Calculating Health Score..."
    ];
    let stepIndex = 0;
    setLoadingStep(steps[0]);
    
    const interval = setInterval(() => {
        stepIndex = (stepIndex + 1) % steps.length;
        setLoadingStep(steps[stepIndex]);
    }, 1500);

    try {
      const analysis = await analyzeHealthAndFood(
        reportFile.base64,
        reportFile.mimeType,
        foodFile.base64,
        foodFile.mimeType
      );
      
      clearInterval(interval);
      setResult(analysis);
      saveToHistory(analysis);

    } catch (err) {
      clearInterval(interval);
      setError("Analysis failed. Please ensure both images are clear and try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setReportFile(null);
    setFoodFile(null);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadFromHistory = (item: AnalysisResult) => {
    setResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <ActivityIcon className="w-10 h-10 text-cyan-500 animate-pulse" />
          </div>
      );
  }

  if (!user) {
      return <Login onGuestLogin={handleGuestLogin} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      
      <HistorySidebar 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        history={history}
        onSelect={loadFromHistory}
        onClear={clearHistory}
      />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md border-cyan-900/30 py-3' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-lg text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <ActivityIcon />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">Nutri-Sync</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {result && (
                <button onClick={reset} className="hidden md:flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/30 px-3 py-2 rounded-lg border border-cyan-900/50">
                    <RefreshCwIcon className="w-4 h-4" /> New
                </button>
            )}
            <button 
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700 hover:border-cyan-500/50"
            >
                <HistoryIcon className="w-4 h-4" /> 
                <span className="hidden md:inline">History</span>
            </button>

            {/* User Profile Dropdown / Area */}
            <div className="h-8 w-px bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-3 pl-1">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-200 leading-none">{user.displayName}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Patient</span>
                </div>
                {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border border-slate-700 ring-2 ring-transparent hover:ring-cyan-500/50 transition-all" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                        {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                )}
                <button 
                    onClick={handleSignOut}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                    title="Sign Out"
                >
                    <LogOutIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 max-w-7xl mx-auto px-6">
        
        {/* Intro Text */}
        {!result && !loading && (
            <div className="text-center mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                    Synchronize your diet with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">physiology</span>.
                </h2>
                <p className="text-lg text-slate-400">
                    Upload your medical report and a picture of your meal. Our AI cross-references your biomarkers to detect hidden dietary risks.
                </p>
            </div>
        )}

        {/* Input Section - Hide when result is shown for cleaner view, or keep minimized */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 transition-all duration-500 ${result ? 'hidden' : ''}`}>
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <FileUploadCard 
              title="Health Profile" 
              description="Upload a Medical Lab Report (Image/PDF)"
              icon="report"
              fileData={reportFile}
              onFileSelect={setReportFile}
              accept="image/*,application/pdf"
            />
          </div>
          
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <FileUploadCard 
              title="Current Meal" 
              description="Upload a photo of groceries or a plate"
              icon="food"
              fileData={foodFile}
              onFileSelect={setFoodFile}
              accept="image/*"
            />
          </div>
        </div>
        
        {/* Minimized Inputs View (When Result is Active) */}
        {result && (
             <div className="flex justify-center mb-8 animate-in fade-in zoom-in duration-300">
                <button onClick={reset} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm border-b border-transparent hover:border-cyan-400 pb-1">
                    <RefreshCwIcon className="w-4 h-4" /> Start New Analysis
                </button>
             </div>
        )}

        {/* Action Button */}
        {!result && !loading && (
            <div className="flex flex-col items-center justify-center mb-16">
            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}
            
            <button
                onClick={handleAnalyze}
                disabled={!reportFile || !foodFile}
                className={`
                group relative px-10 py-5 rounded-full font-bold text-lg transition-all duration-300
                ${!reportFile || !foodFile 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95'
                }
                `}
            >
                <span className="relative z-10 flex items-center gap-2">
                    Analyze Compatibility
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </span>
            </button>
            </div>
        )}

        {/* Results Section */}
        <AnalysisResults result={result} loading={loading} loadingStep={loadingStep} />

      </main>

      {/* Footer Disclaimer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 py-3 text-center z-30">
        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-semibold px-4">
          Disclaimer: AI generated analysis for demonstration only. Not medical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;