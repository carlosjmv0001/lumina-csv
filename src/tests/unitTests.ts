import { getSampleDataset202401 } from '../data/sampleDatasets';
import { TestResultItem, TestSuiteSummary } from '../types';
import { parseCsvContent, parseDataDictionaryText } from '../utils/csvParser';
import { executeQuery, formatCurrencyBR, initializeDatabase } from '../utils/sqlEngine';
import { processNaturalLanguageQuery } from '../agents/orchestrator';

export async function runAllUnitTests(): Promise<TestSuiteSummary> {
  const tests: TestResultItem[] = [];
  const suiteStartTime = Date.now();

  // Test 1: CSV Parser
  await runSingleTest(tests, 'CSV Parser - Extração de colunas e dados', 'Parser CSV', async () => {
    const rawCsv = `id,nome,valor\n1,Produto A,100.50\n2,Produto B,250.00`;
    const result = parseCsvContent('teste.csv', rawCsv);
    if (result.rowCount !== 2) throw new Error(`Esperado 2 linhas, obtido ${result.rowCount}`);
    if (result.columns.length !== 3) throw new Error(`Esperado 3 colunas, obtido ${result.columns.length}`);
    if (result.columns[2].type !== 'number') throw new Error(`Coluna 'valor' deveria ser do tipo number`);
  });

  // Test 2: Data Dictionary Parser
  await runSingleTest(tests, 'Dicionário - Leitura de descrições', 'Parser Dicionário', async () => {
    const dictText = `1. numero_nf: Número da Nota Fiscal\n2. valor_total: Valor final em Reais (R$)`;
    const items = parseDataDictionaryText(dictText, 'dict.txt');
    if (items.length !== 2) throw new Error(`Esperado 2 itens no dicionário, obtido ${items.length}`);
    if (items[0].columnName !== 'numero_nf') throw new Error(`Nome da coluna incorreto: ${items[0].columnName}`);
    if (items[1].description !== 'Valor final em Reais (R$)') throw new Error(`Descrição incorreta`);
  });

  // Test 3: SQL Engine & AlaSQL Integration
  await runSingleTest(tests, 'Engine SQL - Execução de GROUP BY e SUM', 'Engine SQL', async () => {
    const dataset = getSampleDataset202401();
    initializeDatabase(dataset);

    const query = `SELECT razao_social_fornecedor, SUM(valor_total) AS total FROM nfs_202401 GROUP BY razao_social_fornecedor ORDER BY total DESC`;
    const res = executeQuery(query);

    if (res.rows.length === 0) throw new Error('A consulta SQL não retornou registros');
    if (!res.headers.includes('razao_social_fornecedor') || !res.headers.includes('total')) {
      throw new Error('Cabeçalhos retornados pelo SQL são inválidos');
    }
  });

  // Test 4: Formatters
  await runSingleTest(tests, 'Formatadores - Formatação de Moeda BRL', 'Formatadores', async () => {
    const formatted = formatCurrencyBR(45000.50);
    if (!formatted.includes('45') || !formatted.includes('R$')) {
      throw new Error(`Formatação de moeda BRL falhou: ${formatted}`);
    }
  });

  // Test 5: Multi-Agent System Pipeline
  await runSingleTest(tests, 'Agentes - Pipeline de Pergunta e Resposta', 'Orquestração de Agentes', async () => {
    const dataset = getSampleDataset202401();
    const result = await processNaturalLanguageQuery('Qual fornecedor recebeu o maior valor no período?', dataset);

    if (!result.sqlQuery) throw new Error('Agente SQL não gerou consulta SQL');
    if (result.agentSteps.length < 3) throw new Error(`Esperado no mínimo 3 etapas de agentes, obtido ${result.agentSteps.length}`);
    if (!result.answerText) throw new Error('Agente de Análise não gerou resposta em texto');
    if (result.tableRows?.length === 0) throw new Error('Resultado da tabela está vazio');
  });

  const passed = tests.filter(t => t.passed).length;
  const failed = tests.length - passed;

  return {
    total: tests.length,
    passed,
    failed,
    totalDurationMs: Date.now() - suiteStartTime,
    tests,
  };
}

async function runSingleTest(
  list: TestResultItem[],
  name: string,
  category: string,
  fn: () => Promise<void>
) {
  const start = Date.now();
  try {
    await fn();
    list.push({
      name,
      category,
      passed: true,
      durationMs: Date.now() - start,
    });
  } catch (err: any) {
    list.push({
      name,
      category,
      passed: false,
      durationMs: Date.now() - start,
      error: err.message || String(err),
    });
  }
}
