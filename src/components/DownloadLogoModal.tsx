import React, { useState, useRef } from 'react';
import { X, Download, Image as ImageIcon, FileCode, Check, Sparkles } from 'lucide-react';
import { VaaniLogoMark } from './VaaniLogo';

interface DownloadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadLogoModal: React.FC<DownloadLogoModalProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [logoTheme, setLogoTheme] = useState<'gradient' | 'dark' | 'light'>('gradient');
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  // Download SVG
  const handleDownloadSVG = () => {
    const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg width="512" height="512" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dl-vaani-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="50%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
    <linearGradient id="dl-vaani-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>

  ${logoTheme === 'dark' ? '<rect width="200" height="200" fill="#0F172A" rx="0" />' : ''}
  ${logoTheme === 'light' ? '<rect width="200" height="200" fill="#F8FAFC" rx="0" />' : ''}

  <rect x="10" y="10" width="180" height="180" rx="48" fill="url(#dl-vaani-grad-primary)" />
  <rect x="12" y="12" width="176" height="176" rx="46" fill="black" fill-opacity="0.08" />

  <g transform="translate(100, 100)">
    <path d="M 0 -52 C 30 -30, 45 0, 45 32 C 45 55, 25 70, 0 70 C -25 70, -45 55, -45 32 C -45 0, -30 -30, 0 -52 Z" fill="white" fill-opacity="0.22" />
    <path d="M -15 -35 C 10 -20, 30 10, 30 38 C 30 55, 12 65, -15 65 C -35 65, -50 50, -50 30 C -50 5, -35 -20, -15 -35 Z" fill="white" fill-opacity="0.35" />
    <path d="M -32 10 C -32 -25, -10 -42, 12 -42 C 35 -42, 48 -22, 48 5 C 48 30, 28 48, -2 48 C -22 48, -32 32, -32 10 Z" fill="white" />
    <rect x="-18" y="-12" width="8" height="24" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <rect x="-4" y="-22" width="8" height="44" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <rect x="10" y="-16" width="8" height="32" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <rect x="24" y="-6" width="8" height="16" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <circle cx="12" cy="-56" r="8" fill="url(#dl-vaani-grad-accent)" />
  </g>
</svg>`;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vaani-logo-${logoTheme}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded('svg');
    setTimeout(() => setDownloaded(null), 3000);
  };

  // Download high resolution PNG via Canvas
  const handleDownloadPNG = (resolution = 1024) => {
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgString = `<?xml version="1.0" encoding="utf-8"?>
<svg width="${resolution}" height="${resolution}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dl-vaani-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="50%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
    <linearGradient id="dl-vaani-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>

  ${logoTheme === 'dark' ? '<rect width="200" height="200" fill="#0F172A" />' : ''}
  ${logoTheme === 'light' ? '<rect width="200" height="200" fill="#FFFFFF" />' : ''}

  <rect x="10" y="10" width="180" height="180" rx="48" fill="url(#dl-vaani-grad-primary)" />
  <rect x="12" y="12" width="176" height="176" rx="46" fill="black" fill-opacity="0.08" />

  <g transform="translate(100, 100)">
    <path d="M 0 -52 C 30 -30, 45 0, 45 32 C 45 55, 25 70, 0 70 C -25 70, -45 55, -45 32 C -45 0, -30 -30, 0 -52 Z" fill="white" fill-opacity="0.22" />
    <path d="M -15 -35 C 10 -20, 30 10, 30 38 C 30 55, 12 65, -15 65 C -35 65, -50 50, -50 30 C -50 5, -35 -20, -15 -35 Z" fill="white" fill-opacity="0.35" />
    <path d="M -32 10 C -32 -25, -10 -42, 12 -42 C 35 -42, 48 -22, 48 5 C 48 30, 28 48, -2 48 C -22 48, -32 32, -32 10 Z" fill="white" />
    <rect x="-18" y="-12" width="8" height="24" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <rect x="-4" y="-22" width="8" height="44" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <rect x="10" y="-16" width="8" height="32" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <rect x="24" y="-6" width="8" height="16" rx="4" fill="url(#dl-vaani-grad-primary)" />
    <circle cx="12" cy="-56" r="8" fill="url(#dl-vaani-grad-accent)" />
  </g>
</svg>`;

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `vaani-logo-${resolution}x${resolution}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded('png');
      setTimeout(() => setDownloaded(null), 3000);
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-8 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Official Vaani Brand Assets</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">High-resolution vector mark & app icon</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Logo Preview Stage */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>PREVIEW CANVAS</span>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-[11px]">
              <button 
                onClick={() => setLogoTheme('gradient')}
                className={`px-3 py-1 rounded-full transition-all ${logoTheme === 'gradient' ? 'bg-white dark:bg-slate-700 font-bold text-emerald-600 dark:text-emerald-400 shadow-sm' : ''}`}
              >
                Transparent
              </button>
              <button 
                onClick={() => setLogoTheme('light')}
                className={`px-3 py-1 rounded-full transition-all ${logoTheme === 'light' ? 'bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white shadow-sm' : ''}`}
              >
                Light
              </button>
              <button 
                onClick={() => setLogoTheme('dark')}
                className={`px-3 py-1 rounded-full transition-all ${logoTheme === 'dark' ? 'bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white shadow-sm' : ''}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className={`w-full h-56 rounded-2xl flex flex-col items-center justify-center p-6 border transition-all duration-300 ${
            logoTheme === 'dark' 
              ? 'bg-slate-950 border-slate-800' 
              : logoTheme === 'light' 
              ? 'bg-slate-50 border-slate-200' 
              : 'bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border-emerald-500/20'
          }`}>
            <VaaniLogoMark size={110} idPrefix="modal-preview" />
            <div className="mt-4 text-center">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">vaani</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Vernacular AI</p>
            </div>
          </div>
        </div>

        {/* Download Action Options */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleDownloadPNG(1024)}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 text-xs uppercase tracking-wider"
          >
            {downloaded === 'png' ? <Check size={16} /> : <ImageIcon size={16} />}
            <span>{downloaded === 'png' ? 'Downloaded PNG!' : 'Download PNG (1024px)'}</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider"
          >
            {downloaded === 'svg' ? <Check size={16} /> : <FileCode size={16} />}
            <span>{downloaded === 'svg' ? 'Downloaded SVG!' : 'Download Vector SVG'}</span>
          </button>
        </div>

        <div className="text-center pt-1">
          <p className="text-[11px] text-slate-400">
            Suitable for app icons, dark/light websites, press kits, and academic reports.
          </p>
        </div>
      </div>
    </div>
  );
};
