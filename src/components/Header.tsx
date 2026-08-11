import React from 'react';
import { Database, Sparkles, Cpu, ShieldCheck, Upload, MessageSquareCode, Layers } from 'lucide-react';
import { Dataset } from '../types';

interface HeaderProps {
  activeTab: 'upload' | 'query' | 'architecture' | 'tests';
  setActiveTab: (tab: 'upload' | 'query' | 'architecture' | 'tests') => void;
  dataset: Dataset | null;
  onOpenSampleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dataset,
  onOpenSampleModal,
}) => {
  return (
    <header className="bg-[#0F0F12] border-b border-white/5 text-white sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif italic text-xl tracking-tight text-white">Lumina CSV</h1>
              <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                Multi-Agent AI
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 hidden sm:block">
              Data Intelligence • Natural Language & SQL
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          <button
            id="tab-btn-upload"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Interface A: Carga</span>
            <span className="sm:hidden">Carga</span>
          </button>

          <button
            id="tab-btn-query"
            onClick={() => setActiveTab('query')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'query'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span className="hidden sm:inline">Interface B: Consulta</span>
            <span className="sm:hidden">Consulta</span>
            {dataset && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            )}
          </button>

          <button
            id="tab-btn-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">Relatório de Agentes</span>
          </button>

          <button
            id="tab-btn-tests"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'tests'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Testes</span>
          </button>
        </nav>

        {/* Dataset Quick Switcher */}
        <div className="hidden lg:flex items-center gap-3">
          {dataset ? (
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
              <span className="font-medium text-white/90 truncate max-w-[160px]">{dataset.name}</span>
              <span className="text-white/40">({dataset.totalRows} lin)</span>
            </div>
          ) : (
            <button
              onClick={onOpenSampleModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Exemplo (202401_NFs)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
