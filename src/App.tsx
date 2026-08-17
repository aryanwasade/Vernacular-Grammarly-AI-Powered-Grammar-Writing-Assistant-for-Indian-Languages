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
  Check,
  Mic,
  MicOff,
  Sun,
  Moon,
  Volume2,
  ArrowRightLeft,
  Clipboard,
  Languages as LanguagesIcon,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeText, translateText, generateSpeech, type AnalysisResult, type Suggestion, type TranslationResult } from './services/geminiService';
import { INDIAN_LANGUAGES, TONES } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VaaniLogoMark } from './components/VaaniLogo';
import { DownloadLogoModal } from './components/DownloadLogoModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add SpeechRecognition type for TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'refine' | 'translate'>('translate');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState(INDIAN_LANGUAGES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vaani-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vaani-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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

  const handleTranslate = async () => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    setError(null);
    try {
      const data = await translateText(text, language.name);
      setTranslationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTTS = async () => {
    if (!translationResult?.translatedText) return;
    
    setIsPlaying(true);
    try {
      const base64 = await generateSpeech(translationResult.translatedText);
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
    } catch (err) {
      setError("Failed to play audio.");
      setIsPlaying(false);
    }
  };

  const handleCopy = (content?: string) => {
    const textToCopy = content || result?.correctedText || translationResult?.translatedText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setText('');
    setResult(null);
    setTranslationResult(null);
    setError(null);
  };

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Map our language codes to BCP 47 tags if possible
    // Most Indian languages follow lang-IN
    recognition.lang = `${language.code}-IN`;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setText(prev => prev + (prev.length > 0 ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please check your browser permissions.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, language.code]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-700 relative">
      <div className="grain" />
      {/* Header */}
      <header className="bg-paper/80 backdrop-blur-md border-b border-brand-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => setIsLogoModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer group"
            title="Click to preview & download official logo"
          >
            <div className="group-hover:scale-105 transition-transform">
              <VaaniLogoMark size={40} idPrefix="hdr" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-brand-700">vaani</h1>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-brand-500/10 text-brand-600 rounded-md group-hover:bg-brand-500 group-hover:text-white transition-colors">Logo</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-500/60 leading-none">Vernacular AI</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('translate')}
              className={cn(
                "text-sm font-medium transition-colors",
                activeTab === 'translate' ? "text-brand-700 font-bold" : "text-brand-700/60 hover:text-brand-700"
              )}
            >
              Translator
            </button>
            <button 
              onClick={() => setActiveTab('refine')}
              className={cn(
                "text-sm font-medium transition-colors",
                activeTab === 'refine' ? "text-brand-700 font-bold" : "text-brand-700/60 hover:text-brand-700"
              )}
            >
              Writing Assistant
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 rounded-full text-xs font-bold transition-all border border-brand-500/20"
            >
              <Sparkles size={13} className="text-brand-500" />
              <span>Download Logo</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 text-brand-700/60 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-100 rounded-full transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <span className="text-xs font-bold px-3 py-1 bg-brand-100 text-brand-700 rounded-full">Beta</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-brand-700 leading-[1.1] tracking-tight">
              {activeTab === 'translate' ? (
                <>Bridge the <span className="italic font-normal font-serif">language</span> gap.</>
              ) : (
                <>Refine your <span className="italic font-normal font-serif">vernacular</span> voice.</>
              )}
            </h2>
            <p className="text-lg text-brand-700/60 max-w-lg leading-relaxed">
              {activeTab === 'translate' 
                ? "Seamlessly translate text from any language into India's rich vernacular scripts with AI precision."
                : "vaani understands the nuances of Indian languages, helping you write with clarity, precision, and cultural authenticity."}
            </p>
          </div>

          <div className="bg-white dark:bg-brand-50 rounded-[32px] shadow-2xl shadow-black/[0.03] border border-brand-100 overflow-hidden transition-all duration-500 hover:shadow-black/[0.05]">
            <div className="p-5 border-b border-brand-50 flex flex-wrap gap-4 items-center justify-between bg-brand-50/20">
              <div className="flex gap-3">
                {activeTab === 'translate' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-brand-50 border border-brand-100 rounded-full text-sm font-semibold text-brand-700/60">
                    Auto-detect
                  </div>
                )}
                
                {activeTab === 'translate' && <ArrowRightLeft size={16} className="text-brand-200 self-center" />}

                <div className="relative">
                  <select 
                    value={language.code}
                    onChange={(e) => setLanguage(INDIAN_LANGUAGES.find(l => l.code === e.target.value) || INDIAN_LANGUAGES[0])}
                    className="appearance-none text-sm font-semibold bg-white dark:bg-brand-50 border border-brand-100 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer hover:border-brand-200"
                  >
                    {INDIAN_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name} ({lang.native})</option>
                    ))}
                  </select>
                  <LanguagesIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                </div>

                {activeTab === 'refine' && (
                  <div className="relative">
                    <select 
                      value={tone.id}
                      onChange={(e) => setTone(TONES.find(t => t.id === e.target.value) || TONES[0])}
                      className="appearance-none text-sm font-semibold bg-white dark:bg-brand-50 border border-brand-100 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer hover:border-brand-200"
                    >
                      {TONES.map(t => (
                        <option key={t.id} value={t.id}>{t.name} Tone</option>
                      ))}
                    </select>
                    <TypeIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-500 pointer-events-none" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={toggleListening}
                  className={cn(
                    "p-2.5 rounded-full transition-all flex items-center gap-2",
                    isListening 
                      ? "bg-red-50 dark:bg-red-900/20 text-red-500 animate-pulse" 
                      : "text-brand-500/40 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-100"
                  )}
                  title={isListening ? "Stop Listening" : "Start Voice Typing"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  {isListening && <span className="text-xs font-bold uppercase tracking-widest">Listening</span>}
                </button>
                <button 
                  onClick={handleReset}
                  className="p-2.5 text-brand-500/40 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-100 rounded-full transition-all"
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
                placeholder={
                  activeTab === 'translate' 
                    ? "Enter text to translate..." 
                    : `Begin writing in ${language.name}...`
                }
                className="w-full h-[400px] p-8 text-xl leading-relaxed resize-none focus:outline-none placeholder:text-brand-100 font-medium bg-transparent"
                style={{ direction: 'ltr' }}
              />
              
              <div className="absolute bottom-6 right-6 flex items-center gap-6">
                <span className="text-[10px] uppercase tracking-widest text-brand-500/40 font-bold">
                  {text.length} chars
                </span>
                <button
                  onClick={activeTab === 'translate' ? handleTranslate : handleAnalyze}
                  disabled={isAnalyzing || isTranslating || !text.trim()}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3.5 rounded-full font-bold transition-all shadow-xl",
                    (isAnalyzing || isTranslating || !text.trim())
                      ? "bg-brand-50 text-brand-200 cursor-not-allowed shadow-none" 
                      : "bg-brand-500 text-white hover:bg-brand-600 active:scale-95 shadow-brand-500/20"
                  )}
                >
                  {isAnalyzing || isTranslating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {activeTab === 'translate' ? 'Translating...' : 'Refining...'}
                    </>
                  ) : (
                    <>
                      {activeTab === 'translate' ? (
                        <LanguagesIcon size={20} />
                      ) : (
                        <Sparkles size={20} />
                      )}
                      {activeTab === 'translate' ? 'Translate' : 'Refine Writing'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>


          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[24px] flex items-start gap-4 text-red-700 dark:text-red-400"
            >
              <AlertCircle size={22} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Results Display */}
          <AnimatePresence>
            {(result || translationResult) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-brand-50 rounded-[32px] shadow-2xl shadow-black/[0.03] border border-brand-100 overflow-hidden">
                  <div className="p-5 border-b border-brand-50 flex items-center justify-between bg-brand-50/10">
                    <div className="flex items-center gap-3 text-brand-600 font-bold">
                      {activeTab === 'translate' ? <LanguagesIcon size={20} /> : <CheckCircle2 size={20} />}
                      <span className="text-sm uppercase tracking-widest">
                        {activeTab === 'translate' ? 'Translation' : 'Polished Version'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'translate' && (
                        <button 
                          onClick={handleTTS}
                          disabled={isPlaying}
                          className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-100 rounded-full border border-brand-100 transition-all disabled:opacity-50"
                          title="Listen"
                        >
                          <Volume2 size={18} className={isPlaying ? "animate-pulse" : ""} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleCopy()}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-100 rounded-full border border-brand-100 transition-all"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy Text'}
                      </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="text-3xl leading-relaxed text-brand-700 whitespace-pre-wrap font-medium">
                      {activeTab === 'translate' ? translationResult?.translatedText : result?.correctedText}
                    </div>
                    {activeTab === 'translate' && translationResult?.transliteration && (
                      <div className="text-lg text-brand-700/40 italic font-serif">
                        {translationResult.transliteration}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Suggestions & Insights */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-brand-50 rounded-[32px] shadow-2xl shadow-black/[0.03] border border-brand-100 flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-brand-50 flex items-center gap-3 bg-brand-50/10">
              {activeTab === 'translate' ? (
                <Info size={20} className="text-brand-500" />
              ) : (
                <MessageSquare size={20} className="text-brand-500" />
              )}
              <h2 className="font-bold text-lg text-brand-700">
                {activeTab === 'translate' ? 'Translation Details' : 'Linguistic Insights'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!(result || translationResult) && !(isAnalyzing || isTranslating) && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <div className="w-20 h-20 bg-brand-50 dark:bg-brand-100/10 rounded-full flex items-center justify-center text-brand-200 dark:text-brand-500">
                    {activeTab === 'translate' ? (
                      <LanguagesIcon size={40} />
                    ) : (
                      <TypeIcon size={40} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-brand-700 font-bold text-lg">Awaiting Input</p>
                    <p className="text-sm text-brand-700/40 max-w-[200px] mx-auto">
                      {activeTab === 'translate' 
                        ? "Your translation details and source detection will appear here."
                        : "Your linguistic analysis and suggestions will appear here."}
                    </p>
                  </div>
                </div>
              )}

              {(isAnalyzing || isTranslating) && (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="h-3 bg-brand-100 dark:bg-brand-100/20 rounded-full w-1/3"></div>
                      <div className="h-24 bg-brand-50/50 dark:bg-brand-100/10 rounded-[24px]"></div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'translate' && translationResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-brand-50/50 dark:bg-brand-100/10 border border-brand-100 rounded-[24px]">
                    <div className="flex items-center gap-2 text-brand-600 font-bold mb-4">
                      <span className="text-xs uppercase tracking-widest">Source Language</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-brand-500 text-white rounded-full text-sm font-bold">
                        {translationResult.detectedLanguage}
                      </div>
                      <ChevronRight size={16} className="text-brand-200" />
                      <div className="px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-bold">
                        {language.name}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-brand-50/50 dark:bg-brand-100/10 border border-brand-100 rounded-[24px]">
                    <div className="flex items-center gap-2 text-brand-600 font-bold mb-2">
                      <span className="text-xs uppercase tracking-widest">Usage Tip</span>
                    </div>
                    <p className="text-sm text-brand-700/60 leading-relaxed italic">
                      "You can use the speaker icon to hear the pronunciation in {language.name}. This helps in learning the correct accent and rhythm of the language."
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'refine' && result && (
                <>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-brand-50/50 dark:bg-brand-100/10 border border-brand-100 rounded-[24px] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Info size={48} />
                    </div>
                    <div className="flex items-center gap-2 text-brand-600 font-bold mb-2">
                      <span className="text-xs uppercase tracking-widest">Overview</span>
                    </div>
                    <p className="text-sm text-brand-700/80 leading-relaxed font-medium">
                      {result.summary}
                    </p>
                  </motion.div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-brand-500/40 uppercase tracking-[0.2em] px-1">
                      Detailed Refinements ({result.suggestions.length})
                    </h3>
                    {result.suggestions.map((suggestion, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                          "p-5 rounded-[24px] border transition-all hover:translate-x-1",
                          suggestion.type === 'grammar' && "bg-blue-50/20 border-blue-100/50 dark:bg-blue-900/10 dark:border-blue-900/30",
                          suggestion.type === 'spelling' && "bg-red-50/20 border-red-100/50 dark:bg-red-900/10 dark:border-red-900/30",
                          suggestion.type === 'style' && "bg-purple-50/20 border-purple-100/50 dark:bg-purple-900/10 dark:border-purple-900/30",
                          suggestion.type === 'tone' && "bg-orange-50/20 border-orange-100/50 dark:bg-orange-900/10 dark:border-orange-900/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                            suggestion.type === 'grammar' && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                            suggestion.type === 'spelling' && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                            suggestion.type === 'style' && "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
                            suggestion.type === 'tone' && "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                          )}>
                            {suggestion.type}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="line-through text-brand-700/30 italic">{suggestion.original}</span>
                            <ChevronRight size={14} className="text-brand-200" />
                            <span className="font-bold text-brand-700">{suggestion.suggestion}</span>
                          </div>
                          <p className="text-xs text-brand-700/60 leading-relaxed font-medium italic">
                            "{suggestion.explanation}"
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-6 border-t border-brand-50 bg-brand-50/10">
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-500/40">
                <ShieldCheck size={10} />
                <span>Crafted with vaani AI</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-brand-100 bg-white dark:bg-brand-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div 
              onClick={() => setIsLogoModalOpen(true)}
              className="flex items-center gap-3 cursor-pointer group"
              title="Download Brand Assets"
            >
              <div className="group-hover:scale-105 transition-transform">
                <VaaniLogoMark size={32} idPrefix="ftr" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-brand-700">vaani</h1>
            </div>
            <p className="text-sm text-brand-700/50 max-w-xs leading-relaxed">
              Empowering the next billion users to communicate effectively in their native tongue. vaani is built with deep respect for India's linguistic diversity.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-700">Product & Brand</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setIsLogoModalOpen(true)} 
                  className="text-sm font-semibold text-brand-500 hover:underline flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>Download Logo Assets</span>
                </button>
              </li>
              <li><a href="#" className="text-sm text-brand-700/50 hover:text-brand-700 transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-brand-700/50 hover:text-brand-700 transition-colors">Languages</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-700">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-brand-700/50 hover:text-brand-700 transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-brand-700/50 hover:text-brand-700 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-brand-700/50 hover:text-brand-700 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-brand-50 flex justify-between items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-700/30">
            © 2026 vaani Linguistic AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700/30">System Operational</span>
          </div>
        </div>
      </footer>

      {/* Logo Preview & Download Modal */}
      <DownloadLogoModal 
        isOpen={isLogoModalOpen} 
        onClose={() => setIsLogoModalOpen(false)} 
      />
    </div>
  );
}

