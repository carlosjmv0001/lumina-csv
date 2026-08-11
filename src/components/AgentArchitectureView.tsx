import React from 'react';
import { Layers, CheckCircle, Shield, Bot, Terminal } from 'lucide-react';

export const AgentArchitectureView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-[0.2em] font-semibold">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Relatório de Arquitetura e Decisão dos Agentes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
          Como os Agentes Inteligentes Tomam Suas Decisões
        </h2>
        <p className="text-white/60 text-xs sm:text-sm max-w-3xl leading-relaxed font-light">
          Esta seção detalha o funcionamento interno da orquestração multi-agente desenvolvida para a consulta de dados CSV. A solução combina LLMs de última geração com interpretadores de esquemas e engines SQL determinísticas.
        </p>
      </div>

      {/* Agents Flow Diagram */}
      <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="font-semibold text-white/90 text-sm uppercase tracking-wider flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <span>Fluxo de Orquestração Multi-Agente (Pipeline de 4 Etapas)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-indigo-500/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="font-bold text-white text-sm">Agente Orquestrador</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Recebe a pergunta do usuário em linguagem natural, valida se há datasets ativos e define a sequência do pipeline.
            </p>
            <div className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
              Input: Pergunta + Dataset
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-indigo-500/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="font-bold text-white text-sm">Agente de Esquema</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Analisa os metadados das tabelas CSV e o dicionário de dados. Mapeia termos da pergunta para colunas e tipos reais.
            </p>
            <div className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
              Output: Mapeamento Semântico
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-indigo-500/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="font-bold text-white text-sm">Agente SQL</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Gera a instrução SQL exata (AlaSQL/ANSI). Se ocorrer erro de sintaxe, o agente corrige automaticamente a consulta.
            </p>
            <div className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
              Output: Query SELECT SQL
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-indigo-500/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="font-bold text-white text-sm">Agente Analista & Gráficos</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Sintetiza os resultados em texto (português), calcula indicadores KPI e formata a melhor representação gráfica.
            </p>
            <div className="text-[10px] font-mono text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              Output: Texto + KPI + Gráfico
            </div>
          </div>
        </div>
      </div>

      {/* Decision Making & Prompts Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Prompts Strategy */}
        <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
          <h3 className="font-semibold text-white/90 text-sm uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Engenharia de Prompts e Restrições</span>
          </h3>

          <ul className="space-y-3 text-xs text-white/70">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>System Instructions Rígidas:</strong> Restringem o LLM a produzir unicamente código SQL sem invólucros markdown no Agente SQL.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Grounding no Dicionário:</strong> O prompt injeta as colunas e descrições do dicionário do arquivo ZIP para evitar alucinações de nomes de colunas.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Tratamento de Números/Moeda BR:</strong> O motor pré-processa valores monetários no formato `R$ 1.500,00` convertendo em numérico para AlaSQL.</span>
            </li>
          </ul>
        </div>

        {/* Fallback Engine */}
        <div className="bg-[#161618] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
          <h3 className="font-semibold text-white/90 text-sm uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Mecanismo de Tolerância a Falhas (Fallback)</span>
          </h3>

          <ul className="space-y-3 text-xs text-white/70">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Motor Determinístico do Orquestrador:</strong> Caso não haja chave LLM configurada, o motor determinístico infere as colunas de agregação (fornecedor, valor, data) e constrói o SQL via heurística.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Auto-Correção em Loop:</strong> Se a consulta SQL gerada falhar na execução pelo AlaSQL, a exceção é capturada e a consulta adjusted é re-executada instantaneamente.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Framework de Agentes LangChain & OpenRouter:</strong> Utilização do <strong>LangChain</strong> (`@langchain/core` e OpenRouter SDK) para construção de `PromptTemplate`, `StringOutputParser` e pipelines de execução encadeados (Chains & Runnables).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Integração Exclusiva OpenRouter & Local AlaSQL:</strong> Acesso à chave de API do Gemini desativado por preferência do usuário. Todas as requisições de LLM são processadas exclusivamente via OpenRouter (`OPENROUTER_API_KEY` com modelos gratuitos) ou pelo motor determinístico local.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
