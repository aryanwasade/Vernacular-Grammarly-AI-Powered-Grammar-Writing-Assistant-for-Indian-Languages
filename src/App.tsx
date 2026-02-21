/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RotateCcw, 
  ChevronRight,
  Info,
  Type as TypeIcon,
  MessageSquare,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeText, type AnalysisResult, type Suggestion } from './services/geminiService';
import { INDIAN_LANGUAGES, TONES } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState(INDIAN_LANGUAGES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeText(text, language.name, tone.name);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const applySuggestion = (suggestion: Suggestion) => {
    // Basic replacement - in a real app this would be more sophisticated
    // for now we just show the result from Gemini which is already corrected
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Vani</h1>
            <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">Beta</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Languages size={16} />
              <span>Vernacular Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
              <div className="flex gap-2">
                <select 
                  value={language.code}
                  onChange={(e) => setLanguage(INDIAN_LANGUAGES.find(l => l.code === e.target.value) || INDIAN_LANGUAGES[0])}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {INDIAN_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name} ({lang.native})</option>
                  ))}
                </select>

                <select 
                  value={tone.id}
                  onChange={(e) => setTone(TONES.find(t => t.id === e.target.value) || TONES[0])}
                  className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {TONES.map(t => (
                    <option key={t.id} value={t.id}>{t.name} Tone</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Type or paste your ${language.name} text here...`}
                className="w-full h-80 p-6 text-lg resize-none focus:outline-none placeholder:text-slate-300"
                style={{ direction: 'ltr' }}
              />
              
              <div className="absolute bottom-4 right-4 flex items-center gap-4">
                <span className="text-xs text-slate-400 font-mono">
                  {text.length} characters
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !text.trim()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/20",
                    isAnalyzing || !text.trim() 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : "bg-brand-600 text-white hover:bg-brand-700 active:scale-95"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Improve Writing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Results Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-brand-50/30">
                    <div className="flex items-center gap-2 text-brand-700 font-semibold">
                      <CheckCircle2 size={18} />
                      <span>Improved Text</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-6 text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {result.correctedText}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Suggestions & Insights */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px]">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <MessageSquare size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-900">Suggestions & Insights</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!result && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <TypeIcon size={32} />
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">No analysis yet</p>
                    <p className="text-sm text-slate-400">Enter some text and click "Improve Writing" to see suggestions.</p>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                      <div className="h-20 bg-slate-50 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              )}

              {result && (
                <>
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                      <Info size={16} />
                      <span className="text-sm">Summary</span>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                      Detailed Corrections ({result.suggestions.length})
                    </h3>
                    {result.suggestions.map((suggestion, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                          "p-4 rounded-xl border transition-all hover:shadow-md",
                          suggestion.type === 'grammar' && "bg-blue-50/30 border-blue-100",
                          suggestion.type === 'spelling' && "bg-red-50/30 border-red-100",
                          suggestion.type === 'style' && "bg-purple-50/30 border-purple-100",
                          suggestion.type === 'tone' && "bg-orange-50/30 border-orange-100"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                            suggestion.type === 'grammar' && "bg-blue-100 text-blue-700",
                            suggestion.type === 'spelling' && "bg-red-100 text-red-700",
                            suggestion.type === 'style' && "bg-purple-100 text-purple-700",
                            suggestion.type === 'tone' && "bg-orange-100 text-orange-700"
                          )}>
                            {suggestion.type}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="line-through text-slate-400">{suggestion.original}</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="font-semibold text-slate-900">{suggestion.suggestion}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {suggestion.explanation}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
              <p className="text-[10px] text-slate-400 text-center">
                Powered by Gemini AI • Optimized for Indian Vernacular Languages
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 Vani AI Assistant. Built for the Indian linguistic ecosystem.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-400 hover:text-slate-600">Privacy</a>
            <a href="#" className="text-sm text-slate-400 hover:text-slate-600">Terms</a>
            <a href="#" className="text-sm text-slate-400 hover:text-slate-600">Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
