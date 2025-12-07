import React, { useState, useEffect } from 'react';
import { AnalysisResult, FoodStatus } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, ActivityIcon, ShareIcon, CheckCircleIcon as CopiedIcon } from './Icons';

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  loading: boolean;
  loadingStep: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, loading, loadingStep }) => {
  const [copied, setCopied] = useState(false);
  
  // Animation state for the gauge
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (result) {
        // Simple counter animation for the number text
        let start = 0;
        const end = result.compatibilityScore;
        const duration = 1500;
        const incrementTime = 20;
        const step = Math.ceil(end / (duration / incrementTime));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setAnimatedScore(end);
                clearInterval(timer);
            } else {
                setAnimatedScore(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }
  }, [result]);

  if (loading) {
    return (
      <div className="w-full py-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative w-32 h-32 mb-10">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <ActivityIcon className="text-cyan-500 w-12 h-12 animate-pulse" />
            </div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-4 animate-pulse">Analyzing...</h3>
        <div className="h-8 overflow-hidden relative w-full max-w-md">
             <p className="text-cyan-400 text-lg font-mono absolute w-full transition-all duration-500 transform translate-y-0 opacity-100">
                {loadingStep}
             </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 70) return 'text-cyan-400 stroke-cyan-500';
    if (score >= 50) return 'text-amber-400 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const getScoreShadow = (score: number) => {
    if (score >= 90) return 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]';
    if (score >= 70) return 'shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]';
    if (score >= 50) return 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]';
    return 'shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]';
  };

  const handleShare = () => {
    const text = `Nutri-Sync Analysis\n\nScore: ${result.compatibilityScore}/100\n\n${result.summary}\n\nKey Issues:\n${result.foodItems.filter(f => f.status === 'AVOID').map(f => `- ${f.name}: ${f.biotechReason}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG Gauge Calculations
  const radius = 60; // Increased radius slightly
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (result.compatibilityScore / 100) * circumference;

  // Highlight numbers in text for medical emphasis
  const formatReason = (text: string) => {
    const parts = text.split(/(\d+(?:\.\d+)?\s*(?:mg\/dL|%|mmol\/L|g|kg)?)/g);
    return parts.map((part, i) => {
      if (/\d/.test(part)) {
        return <span key={i} className="font-mono font-bold text-slate-100 bg-slate-800/50 px-1 rounded mx-0.5">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Header Summary with Score */}
      <div className={`glass-panel p-6 md:p-10 rounded-[2rem] border border-slate-700/50 relative overflow-hidden flex flex-col md:flex-row gap-10 items-center transition-all duration-500 ${getScoreShadow(result.compatibilityScore)}`}>
        
        {/* Animated Score Gauge */}
        <div className="relative flex-shrink-0 w-44 h-44 flex items-center justify-center">
            {/* Background Circle */}
            <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-800"
                />
                {/* Progress Circle */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    className={`transition-all duration-1000 ease-out ${getScoreColor(result.compatibilityScore)}`}
                    style={{ strokeDashoffset: offset, strokeLinecap: 'round' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-6xl font-black tracking-tighter leading-none ${getScoreColor(result.compatibilityScore).split(' ')[0]}`}>
                    {animatedScore}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Score</span>
            </div>
        </div>

        <div className="flex-grow z-10 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <h3 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-3">
                    <ActivityIcon className="text-cyan-400 w-6 h-6" />
                    Clinical Assessment
                </h3>
                <button 
                    onClick={handleShare}
                    className="self-center md:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700 hover:border-cyan-500/30 group"
                >
                    {copied ? <CopiedIcon className="w-3.5 h-3.5 text-emerald-400"/> : <ShareIcon className="w-3.5 h-3.5 group-hover:text-cyan-400"/>}
                    {copied ? 'Copied!' : 'Share Result'}
                </button>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                <p className="text-slate-300 leading-relaxed text-lg font-light">
                    {result.summary}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Extracted Biomarkers */}
        <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    Patient Profile
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
                    AI EXTRACTED
                </span>
            </div>
            
            <div className="space-y-3">
                {result.biomarkers.map((marker, idx) => {
                    const status = marker.status.toLowerCase();
                    let statusStyle = 'bg-slate-800 text-slate-400 border-slate-700';
                    let glow = '';
                    
                    if (status.includes('high') || status.includes('critical') || status.includes('low')) {
                        statusStyle = 'bg-red-500/10 text-red-400 border-red-500/20';
                        glow = 'shadow-[0_0_15px_-5px_rgba(239,68,68,0.2)]';
                    } else if (status.includes('normal')) {
                        statusStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    }

                    return (
                        <div key={idx} className={`bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-all ${glow}`}>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">{marker.name}</div>
                                <div className="text-lg font-bold text-slate-200 font-mono tracking-tight">{marker.value}</div>
                            </div>
                            <div className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${statusStyle}`}>
                                {marker.status}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Right: Food Analysis */}
        <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 mb-4 px-2">Dietary Compatibility</h3>
            <div className="grid gap-5">
                {result.foodItems.map((item, idx) => {
                    let containerClass = '';
                    let statusBadgeClass = '';
                    let Icon = InfoIcon;

                    switch (item.status) {
                        case FoodStatus.SAFE:
                            containerClass = 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/30';
                            statusBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                            Icon = CheckCircleIcon;
                            break;
                        case FoodStatus.MODERATE:
                            containerClass = 'bg-amber-950/10 border-amber-900/30 hover:border-amber-500/30';
                            statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                            Icon = InfoIcon;
                            break;
                        case FoodStatus.AVOID:
                            containerClass = 'bg-red-950/10 border-red-900/30 hover:border-red-500/40 shadow-[inset_0_0_40px_-20px_rgba(239,68,68,0.1)]';
                            statusBadgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                            Icon = AlertTriangleIcon;
                            break;
                    }

                    return (
                        <div key={idx} className={`glass-panel p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl ${containerClass}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                <h4 className="text-xl font-bold text-slate-100">{item.name}</h4>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border w-fit ${statusBadgeClass}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.status}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800/80 relative overflow-hidden">
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="mt-1 min-w-[20px]">
                                           <ActivityIcon className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Biotech Analysis</span>
                                            <p className="text-slate-300 leading-relaxed text-sm">
                                                {formatReason(item.biotechReason)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {item.suggestedSwap && item.status !== FoodStatus.SAFE && (
                                    <div className="flex items-center gap-4 pl-2 opacity-50">
                                        <div className="h-px bg-slate-700 flex-grow"></div>
                                        <div className="text-[10px] text-slate-500 font-mono">VS</div>
                                        <div className="h-px bg-slate-700 flex-grow"></div>
                                    </div>
                                )}

                                {item.suggestedSwap && item.status !== FoodStatus.SAFE && (
                                    <div className="flex items-center gap-4 bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/20 hover:bg-emerald-950/30 transition-colors cursor-default">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-emerald-500 font-bold text-xs uppercase tracking-wider block mb-0.5">Recommended Swap</span>
                                            <span className="text-emerald-100 font-medium">{item.suggestedSwap}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};