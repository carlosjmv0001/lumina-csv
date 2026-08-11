import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InterfaceAUpload } from './components/InterfaceAUpload';
import { InterfaceBQuery } from './components/InterfaceBQuery';
import { AgentArchitectureView } from './components/AgentArchitectureView';
import { UnitTestView } from './components/UnitTestView';
import { Dataset } from './types';
import { getSampleDataset202401 } from './data/sampleDatasets';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'query' | 'architecture' | 'tests'>('upload');
  const [dataset, setDataset] = useState<Dataset | null>(null);

  // Auto-load sample dataset on initial load so the user can test queries right away
  useEffect(() => {
    const sample = getSampleDataset202401();
    setDataset(sample);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataset={dataset}
        onOpenSampleModal={() => {
          setDataset(getSampleDataset202401());
          setActiveTab('query');
        }}
      />

      <main className="flex-1">
        {activeTab === 'upload' && (
          <InterfaceAUpload
            dataset={dataset}
            onDatasetLoaded={(ds) => {
              setDataset(ds);
              setActiveTab('query');
            }}
            onNavigateToQuery={() => setActiveTab('query')}
          />
        )}

        {activeTab === 'query' && (
          <InterfaceBQuery
            dataset={dataset}
            onNavigateToUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'architecture' && <AgentArchitectureView />}

        {activeTab === 'tests' && <UnitTestView />}
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 px-4 text-center mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Lumina CSV - Sistema Multi-Agente AI com AlaSQL e React</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('upload')} className="hover:text-white transition-colors">Interface A (Carga)</button>
            <button onClick={() => setActiveTab('query')} className="hover:text-white transition-colors">Interface B (Consulta)</button>
            <button onClick={() => setActiveTab('architecture')} className="hover:text-white transition-colors">Relatório dos Agentes</button>
            <button onClick={() => setActiveTab('tests')} className="hover:text-white transition-colors">Suíte de Testes</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
