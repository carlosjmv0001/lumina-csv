import express from 'express';
import path from 'path';
import AdmZip from 'adm-zip';
import { createServer as createViteServer } from 'vite';
import { getSampleDataset202401, getSampleDataset202505 } from './src/data/sampleDatasets';
import { buildDatasetFromFiles } from './src/utils/csvParser';
import { processNaturalLanguageQuery } from './src/agents/orchestrator';
import { runAllUnitTests } from './src/tests/unitTests';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Pre-packaged Sample Datasets
  app.get('/api/sample-datasets', (req, res) => {
    try {
      const dataset202401 = getSampleDataset202401();
      const dataset202505 = getSampleDataset202505();
      res.json({
        datasets: [dataset202401, dataset202505]
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao carregar datasets de exemplo: ' + err.message });
    }
  });

  // ZIP Upload & Processing Endpoint
  app.post('/api/upload-zip', (req, res) => {
    try {
      const { zipBase64, filename } = req.body;
      if (!zipBase64) {
        return res.status(400).json({ error: 'Nenhum arquivo ZIP enviado.' });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(zipBase64, 'base64');
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();

      const csvs: { filename: string; content: string }[] = [];
      const dictionaries: { filename: string; content: string }[] = [];

      zipEntries.forEach(entry => {
        if (entry.isDirectory) return;

        const entryName = entry.entryName.toLowerCase();
        // Ignore macOS hidden files
        if (entryName.includes('__macosx') || entryName.startsWith('.')) return;

        const content = entry.getData().toString('utf8');

        if (entryName.endsWith('.csv')) {
          csvs.push({ filename: entry.name || entry.entryName, content });
        } else if (
          entryName.endsWith('.txt') ||
          entryName.endsWith('.md') ||
          entryName.endsWith('.json') ||
          entryName.includes('dicionario') ||
          entryName.includes('dictionary') ||
          entryName.includes('readme')
        ) {
          dictionaries.push({ filename: entry.name || entry.entryName, content });
        }
      });

      if (csvs.length === 0) {
        return res.status(400).json({
          error: 'O arquivo ZIP enviado não contém nenhum arquivo .CSV válido.',
        });
      }

      const dataset = buildDatasetFromFiles(filename || 'Dataset_Upload.zip', csvs, dictionaries);
      res.json({ success: true, dataset });
    } catch (err: any) {
      console.error('Erro no upload de ZIP:', err);
      res.status(500).json({ error: 'Erro ao processar arquivo ZIP: ' + (err.message || String(err)) });
    }
  });

  // Natural Language Query Endpoint
  app.post('/api/query', async (req, res) => {
    try {
      const { question, dataset, apiKeyOverride } = req.body;
      if (!question || !dataset) {
        return res.status(400).json({ error: 'Parâmetros "question" e "dataset" são obrigatórios.' });
      }

      const result = await processNaturalLanguageQuery(question, dataset, apiKeyOverride);
      res.json(result);
    } catch (err: any) {
      console.error('Erro na consulta do agente:', err);
      res.status(500).json({ error: 'Erro no processamento da consulta: ' + (err.message || String(err)) });
    }
  });

  // Test Runner Endpoint
  app.post('/api/run-tests', async (req, res) => {
    try {
      const summary = await runAllUnitTests();
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro na execução dos testes: ' + (err.message || String(err)) });
    }
  });

  // Vite development middleware or production static server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Falha ao iniciar o servidor:', err);
});
