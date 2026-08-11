import React, { useState } from 'react';
import { ShieldCheck, Play, CheckCircle2, XCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { TestSuiteSummary } from '../types';

export const UnitTestView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/run-tests', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao executar testes');

      setTestSummary(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao executar a suíte de testes');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] uppercase tracking-[0.2em] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Garantia de Qualidade e Estabilidade</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Suíte de Testes Unitários do Sistema
          </h2>
          <p className="text-white/60 text-xs sm:text-sm max-w-2xl font-light">
            Execute a validação automatizada dos componentes do sistema: parser CSV, leitor de dicionário de dados, engine AlaSQL e orquestração de agentes.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executando Testes...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Executar Suíte de Testes</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {testSummary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#161618] border border-white/10 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] block">Total de Testes</span>
              <span className="text-3xl font-serif italic font-extrabold text-white block font-mono mt-1">{testSummary.total}</span>
            </div>

            <div className="bg-[#161618] border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.15em] block">Passaram</span>
              <span className="text-3xl font-serif italic font-extrabold text-emerald-400 block font-mono mt-1">{testSummary.passed}</span>
            </div>

            <div className="bg-[#161618] border border-rose-500/30 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-[0.15em] block">Falharam</span>
              <span className="text-3xl font-serif italic font-extrabold text-rose-400 block font-mono mt-1">{testSummary.failed}</span>
            </div>

            <div className="bg-[#161618] border border-white/10 rounded-2xl p-5 shadow-xl">
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] block">Tempo de Execução</span>
              <span className="text-3xl font-serif italic font-extrabold text-white block font-mono mt-1">{testSummary.totalDurationMs}ms</span>
            </div>
          </div>

          {/* Test List */}
          <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
            <h3 className="font-serif italic font-bold text-white text-base">Resultado Detalhado dos Testes</h3>

            <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden">
              {testSummary.tests.map((t, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    {t.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/70">
                          {t.category}
                        </span>
                        <span className="text-sm font-semibold text-white">{t.name}</span>
                      </div>
                      {t.error && (
                        <p className="text-xs text-rose-300 font-mono mt-1 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                          {t.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.durationMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
