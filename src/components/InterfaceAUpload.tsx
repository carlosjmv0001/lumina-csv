import React, { useState, useRef } from 'react';
import { Upload, FileArchive, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Table, BookOpen, Hash, Calendar, Type, Layers, Info } from 'lucide-react';
import { Dataset } from '../types';
import { getSampleDataset202401, getSampleDataset202505 } from '../data/sampleDatasets';

interface InterfaceAUploadProps {
  dataset: Dataset | null;
  onDatasetLoaded: (dataset: Dataset) => void;
  onNavigateToQuery: () => void;
}

export const InterfaceAUpload: React.FC<InterfaceAUploadProps> = ({
  dataset,
  onDatasetLoaded,
  onNavigateToQuery,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      if (file.name.endsWith('.zip')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64 = (e.target?.result as string).split(',')[1];
            const response = await fetch('/api/upload-zip', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                zipBase64: base64,
                filename: file.name,
              }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Falha ao processar ZIP');

            onDatasetLoaded(data.dataset);
          } catch (err: any) {
            setUploadError(err.message || 'Erro ao processar arquivo ZIP.');
          } finally {
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const { parseCsvContent, buildDatasetFromFiles } = await import('../utils/csvParser');
        const datasetObj = buildDatasetFromFiles(
          file.name,
          [{ filename: file.name, content: text }],
          []
        );
        onDatasetLoaded(datasetObj);
        setIsUploading(false);
      } else {
        throw new Error('Por favor envie um arquivo com extensão .ZIP ou .CSV.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao carregar o arquivo.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sampleType: '202401' | '202505') => {
    setIsUploading(true);
    setTimeout(() => {
      if (sampleType === '202401') {
        onDatasetLoaded(getSampleDataset202401());
      } else {
        onDatasetLoaded(getSampleDataset202505());
      }
      setIsUploading(false);
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-[0.2em] font-semibold">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interface A • Data Ingestion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic tracking-tight text-white">
            Upload de Arquivos .ZIP com CSVs e Dicionário de Dados
          </h2>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-light">
            Envie um arquivo compactado contendo um ou mais arquivos CSV acompanhados de um dicionário de dados em texto/markdown/json. O agente orquestrador indexará as tabelas e preparará o ambiente SQL automaticamente.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload Dropzone & Sample Datasets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dropzone Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl p-6 space-y-6">
            <h3 className="font-semibold text-white/90 text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Enviar Arquivo .ZIP ou .CSV</span>
            </h3>

            {/* Drop Zone */}
            <div
              id="zip-dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                  : 'border-white/15 hover:border-indigo-400/50 hover:bg-white/5 bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
                  {isUploading ? (
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileArchive className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-white/90">
                    Arraste seu arquivo <span className="text-indigo-400 font-bold">.ZIP</span> aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Suporta arquivos .ZIP com múltiplos CSVs e Dicionários de Dados (.TXT, .MD, .JSON)
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 pt-2 text-xs text-white/50">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> CSVs Ilimitados
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Dicionário de Colunas
                  </span>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Erro no Processamento</p>
                  <p className="text-xs text-rose-300/80 mt-0.5">{uploadError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sample Datasets Column (1 col) */}
        <div className="space-y-6">
          <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white/90 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Datasets de Exemplo</span>
              </h3>
            </div>
            <p className="text-xs text-white/50">
              Não possui um ZIP no momento? Teste o agente imediatamente utilizando as bases oficiais do curso:
            </p>

            {/* Sample Card 1 */}
            <div
              id="sample-dataset-202401"
              onClick={() => handleSelectSample('202401')}
              className="p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-white/[0.08] cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded">
                  202401_NFs.zip
                </span>
                <span className="text-[10px] text-white/40">20 Notas Fiscais</span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                Notas Fiscais de Compras 2024
              </p>
              <p className="text-[11px] text-white/50 line-clamp-2">
                Base com fornecedores, valores, categorias (TI, Mobiliário, Material Escritório), ICMS e datas.
              </p>
            </div>

            {/* Sample Card 2 */}
            <div
              id="sample-dataset-202505"
              onClick={() => handleSelectSample('202505')}
              className="p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-white/[0.08] cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded">
                  202505_NFe.zip
                </span>
                <span className="text-[10px] text-white/40">8 NFe Eletrônicas</span>
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                Notas Fiscais Eletrônicas (Maio/2025)
              </p>
              <p className="text-[11px] text-white/50 line-clamp-2">
                Base com chaves de acesso, licenças de software CloudTech, descontos e valores líquidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Dataset Inspection Section */}
      {dataset && (
        <div className="bg-[#161618] rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{dataset.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-wider font-semibold border border-emerald-500/20">
                    Processado
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Indexado no banco em memória AlaSQL com {dataset.tables.length} tabela(s) e {dataset.totalRows} linhas no total.
                </p>
              </div>
            </div>

            <button
              id="btn-go-to-query"
              onClick={onNavigateToQuery}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all group"
            >
              <span>Abrir Interface B - Consultar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Cataloged Tables Detail */}
          <div className="space-y-6">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-400" />
              <span>Esquema das Tabelas Carregadas</span>
            </h4>

            {dataset.tables.map((tbl) => (
              <div key={tbl.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-bold">
                      {tbl.tableName}
                    </span>
                    <span className="text-xs text-white/40">({tbl.filename})</span>
                  </div>
                  <span className="text-xs font-mono text-white/60">
                    {tbl.rowCount} registros
                  </span>
                </div>

                {/* Columns Grid */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">Coluna</th>
                        <th className="py-2.5 px-3 font-semibold">Tipo</th>
                        <th className="py-2.5 px-3 font-semibold">Descrição do Dicionário</th>
                        <th className="py-2.5 px-3 font-semibold">Valores de Exemplo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tbl.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-white/90">
                            {col.name}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              col.type === 'number' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              col.type === 'date' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-white/70'
                            }`}>
                              {col.type === 'number' && <Hash className="w-3 h-3" />}
                              {col.type === 'date' && <Calendar className="w-3 h-3" />}
                              {col.type === 'string' && <Type className="w-3 h-3" />}
                              {col.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-white/60">
                            {col.description || <span className="text-white/30 italic">Não catalogada</span>}
                          </td>
                          <td className="py-2.5 px-3 text-white/40 font-mono text-[11px]">
                            {col.sampleValues.slice(0, 3).map(v => String(v)).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Dictionaries Section */}
          {dataset.dictionaries.length > 0 && (
            <div className="border border-indigo-500/20 rounded-xl p-5 bg-indigo-500/5 space-y-3">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Dicionário de Dados Extraído do Arquivo</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {dataset.dictionaries.map((dict, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/80">
                    <span className="font-bold text-indigo-300 font-mono">{dict.columnName}:</span>{' '}
                    <span className="text-white/70">{dict.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
