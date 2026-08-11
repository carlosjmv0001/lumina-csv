import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Database, Code, Table, BarChart3, LineChart, PieChart, AreaChart, Download, CheckCircle2, AlertTriangle, Key, Clock, ArrowUpRight, Search, ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell, AreaChart as ReAreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { ChartConfig, Dataset, QueryResult } from '../types';
import { formatCurrencyBR } from '../utils/sqlEngine';

interface InterfaceBQueryProps {
  dataset: Dataset | null;
  onNavigateToUpload: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const InterfaceBQuery: React.FC<InterfaceBQueryProps> = ({ dataset, onNavigateToUpload }) => {
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [activeChartType, setActiveChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [apiKeyOverride, setApiKeyOverride] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const suggestedQuestions = [
    'Qual fornecedor recebeu o maior valor no período?',
    'Qual produto apresentou o maior volume comprado?',
    'Qual foi o total gasto em cada mês?',
    'Quais foram os cinco maiores fornecedores?',
    'Qual categoria apresentou maior valor em compras?',
  ];

  const handleRunQuery = async (q: string) => {
    if (!q.trim() || !dataset) return;
    setIsQuerying(true);
    setQueryResult(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          dataset,
          apiKeyOverride: apiKeyOverride || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao processar consulta');

      setQueryResult(data);
      if (data.chartConfig) {
        setActiveChartType(data.chartConfig.type);
      }
    } catch (err: any) {
      alert(`Erro no processamento da consulta: ${err.message || String(err)}`);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopySql = () => {
    if (queryResult?.sqlQuery) {
      navigator.clipboard.writeText(queryResult.sqlQuery);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleExportCsv = () => {
    if (!queryResult || !queryResult.tableRows || queryResult.tableRows.length === 0) return;
    const headers = queryResult.tableHeaders || Object.keys(queryResult.tableRows[0]);
    let csvContent = headers.join(',') + '\n';

    queryResult.tableRows.forEach(row => {
      const line = headers.map(h => {
        let val = row[h];
        if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
        return val ?? '';
      }).join(',');
      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resultado_consulta_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!dataset) {
    return (
      <div className="max-w-4xl mx-auto my-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif italic text-white">Nenhum Dataset Carregado na Interface A</h2>
        <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto font-light">
          Para realizar consultas em linguagem natural, por favor carregue um arquivo .ZIP contendo arquivos CSV na Interface A.
        </p>
        <button
          onClick={onNavigateToUpload}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider transition-all"
        >
          Ir para Interface A - Carga
        </button>
      </div>
    );
  }

  const filteredRows = queryResult?.tableRows?.filter(row => {
    if (!tableSearch.trim()) return true;
    return Object.values(row).some(v =>
      String(v).toLowerCase().includes(tableSearch.toLowerCase())
    );
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner & Active Dataset Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161618] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-white">Interface B • Natural Language Query</h2>
            <p className="text-xs text-white/50">
              Pergunte ao sistema em português. O time de agentes interpretará a pergunta e executará a consulta em SQL.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-white/40 uppercase text-[10px] tracking-wider block">Dataset Ativo:</span>
            <span className="font-mono text-indigo-300 font-bold">{dataset.name}</span>
          </div>

          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 text-xs font-semibold transition-all"
            title="Configurar Chave API OpenRouter"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Chave API</span>
          </button>
        </div>
      </div>

      {/* API Key Modal / Popover */}
      {showKeyModal && (
        <div className="bg-amber-950/80 border border-amber-500/40 rounded-xl p-4 text-xs space-y-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              Configurar Chave API do OpenRouter (Opcional)
            </span>
            <button onClick={() => setShowKeyModal(false)} className="text-amber-300 hover:text-white font-bold p-1">✕</button>
          </div>
          <p className="text-amber-100 font-medium text-xs leading-relaxed">
            O sistema utiliza a chave OpenRouter configurada no ambiente por padrão. Se desejar usar sua própria chave OpenRouter (<code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">sk-or-...</code>), insira-a abaixo:
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Cole sua OPENROUTER_API_KEY (sk-or-...)"
              value={apiKeyOverride}
              onChange={(e) => setApiKeyOverride(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-lg text-amber-100 placeholder-amber-400/60 font-mono text-xs focus:ring-2 focus:ring-amber-400 outline-none"
            />
            <button
              onClick={() => setShowKeyModal(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wide transition-all"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Query Bar */}
      <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery(question);
          }}
          className="space-y-3"
        >
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
            Faça sua pergunta sobre o conjunto de dados
          </label>
          <div className="relative flex items-center">
            <input
              id="input-nl-query"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Qual fornecedor recebeu o maior valor no período?"
              disabled={isQuerying}
              className="w-full pl-4 pr-36 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:bg-white/[0.08] focus:border-indigo-500 outline-none transition-all placeholder:text-white/30"
            />
            <button
              id="btn-submit-query"
              type="submit"
              disabled={isQuerying || !question.trim()}
              className="absolute right-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              {isQuerying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Quick Questions */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Perguntas Sugeridas
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleRunQuery(q);
                }}
                disabled={isQuerying}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 font-medium transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Execution Output */}
      {queryResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Agent Steps Timeline */}
          <div className="bg-[#161618] border border-white/10 rounded-2xl p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Orquestração dos Agentes Inteligentes ({queryResult.executionTimeMs}ms)</span>
              </h3>
              <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                {queryResult.agentSteps.filter(s => s.status === 'completed').length}/{queryResult.agentSteps.length} Etapas Concluídas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {queryResult.agentSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-300">{step.agentName}</span>
                    <span className="text-[10px] text-white/30">{step.timestamp}</span>
                  </div>
                  <p className="font-semibold text-white/90">{step.title}</p>
                  <p className="text-[11px] text-white/50 leading-snug">{step.details || step.description}</p>
                  {step.status === 'completed' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute bottom-3 right-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KPI Cards Grid */}
          {queryResult.kpis && queryResult.kpis.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {queryResult.kpis.map((kpi, i) => (
                <div key={i} className="bg-[#161618] border border-white/10 rounded-2xl p-5 shadow-xl space-y-1">
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] block">
                    {kpi.label}
                  </span>
                  <span className="text-2xl font-serif italic font-extrabold text-white block font-mono">
                    {kpi.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Answer Synthesis */}
          <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Resposta Analítica do Agente</span>
            </h3>
            <div className="prose prose-invert max-w-none text-white/90 text-sm leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/10">
              {queryResult.answerText}
            </div>
          </div>

          {/* Dynamic Interactive Chart */}
          {queryResult.chartConfig && queryResult.chartConfig.data.length > 0 && (
            <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif italic font-bold text-white text-base">{queryResult.chartConfig.title}</h3>
                  <p className="text-xs text-white/40">Visualização gráfica gerada automaticamente para os dados</p>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setActiveChartType('bar')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      activeChartType === 'bar' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/40 hover:text-white'
                    }`}
                    title="Gráfico de Barras"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveChartType('line')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      activeChartType === 'line' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/40 hover:text-white'
                    }`}
                    title="Gráfico de Linhas"
                  >
                    <LineChart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveChartType('pie')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      activeChartType === 'pie' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/40 hover:text-white'
                    }`}
                    title="Gráfico de Pizza"
                  >
                    <PieChart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveChartType('area')}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      activeChartType === 'area' ? 'bg-indigo-600 text-white shadow-md' : 'text-white/40 hover:text-white'
                    }`}
                    title="Gráfico de Área"
                  >
                    <AreaChart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart Render Area */}
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartType === 'bar' ? (
                    <BarChart data={queryResult.chartConfig.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey={queryResult.chartConfig.xAxisKey} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5', borderRadius: '8px' }}
                        formatter={(v: any) => [typeof v === 'number' ? formatCurrencyBR(v) : v]}
                      />
                      <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                      {queryResult.chartConfig.yAxisKeys.map((key, i) => (
                        <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  ) : activeChartType === 'line' ? (
                    <ReLineChart data={queryResult.chartConfig.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey={queryResult.chartConfig.xAxisKey} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5', borderRadius: '8px' }}
                        formatter={(v: any) => [typeof v === 'number' ? formatCurrencyBR(v) : v]}
                      />
                      <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                      {queryResult.chartConfig.yAxisKeys.map((key, i) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4 }} />
                      ))}
                    </ReLineChart>
                  ) : activeChartType === 'pie' ? (
                    <RePieChart>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5', borderRadius: '8px' }}
                        formatter={(v: any) => [typeof v === 'number' ? formatCurrencyBR(v) : v]}
                      />
                      <Pie
                        data={queryResult.chartConfig.data}
                        dataKey={queryResult.chartConfig.yAxisKeys[0]}
                        nameKey={queryResult.chartConfig.xAxisKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {queryResult.chartConfig.data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RePieChart>
                  ) : (
                    <ReAreaChart data={queryResult.chartConfig.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                      <XAxis dataKey={queryResult.chartConfig.xAxisKey} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#f4f4f5', borderRadius: '8px' }}
                        formatter={(v: any) => [typeof v === 'number' ? formatCurrencyBR(v) : v]}
                      />
                      {queryResult.chartConfig.yAxisKeys.map((key, i) => (
                        <Area key={key} type="monotone" dataKey={key} fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} fillOpacity={0.2} />
                      ))}
                    </ReAreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Interactive Results Data Table */}
          {queryResult.tableRows && queryResult.tableRows.length > 0 && (
            <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif italic font-bold text-white text-base flex items-center gap-2">
                    <Table className="w-4 h-4 text-indigo-400" />
                    <span>Tabela de Resultados Gerados</span>
                  </h3>
                  <p className="text-xs text-white/40">Exibindo {filteredRows.length} de {queryResult.tableRows.length} linhas</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filtrar dados na tabela..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs outline-none focus:border-indigo-500 text-white placeholder:text-white/30"
                    />
                  </div>

                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Table Render */}
              <div className="overflow-x-auto border border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-white/40 uppercase tracking-wider">
                      {(queryResult.tableHeaders || Object.keys(queryResult.tableRows[0])).map((h) => (
                        <th key={h} className="py-2.5 px-3 font-semibold">
                          {h.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRows.slice(0, 50).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                        {(queryResult.tableHeaders || Object.keys(row)).map((h) => (
                          <td key={h} className="py-2 px-3 text-white/90 font-mono text-[11px]">
                            {typeof row[h] === 'number' && (h.toLowerCase().includes('valor') || h.toLowerCase().includes('total') || h.toLowerCase().includes('gasto'))
                              ? formatCurrencyBR(row[h])
                              : String(row[h] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SQL Query Inspector */}
          {queryResult.sqlQuery && (
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Consulta SQL Gerada pelo Agente (AlaSQL / ANSI)</span>
                </span>

                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded text-xs font-mono transition-all"
                >
                  <Copy className="w-3 h-3 text-emerald-400" />
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0A0A0B] font-mono text-xs text-emerald-300 overflow-x-auto border border-white/10">
                <code>{queryResult.sqlQuery}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
