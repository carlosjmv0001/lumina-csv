import { GoogleGenAI } from '@google/genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentStep, ChartConfig, Dataset, KPICard, QueryResult } from '../types';
import { executeQuery, formatCurrencyBR, formatNumberBR, getSafeTableName, initializeDatabase } from '../utils/sqlEngine';

// LangChain Prompt Template for Schema and SQL Agent Pipeline
const sqlPromptTemplate = new PromptTemplate({
  template: `Você é um Agente Especialista em SQL e Análise de Dados no framework LangChain.
Sua missão é gerar UMA ÚNICA instrução SQL válida para AlaSQL/ANSI SQL para responder à pergunta do usuário.

ESQUEMA DAS TABELAS DISPONÍVEIS:
{tableSummary}

DICIONÁRIO DE DADOS:
{dictSummary}

PERGUNTA DO USUÁRIO:
"{question}"

REGRAS RÍGIDAS DE GERAÇÃO SQL:
1. Retorne APENAS o código SQL puro. Não inclua marcas de markdown (\`\`\`sql), nem explicações.
2. Nomes de tabelas e colunas devem corresponder EXATAMENTE ao esquema.
3. Para somas/valores monetários ou quantidade, use SUM() ou AVG(). Se precisar limitar registros, use LIMIT.
4. Para agrupamentos, use GROUP BY. Ordene os resultados com ORDER BY para destacar os maiores ou menores valores.
5. Em colunas que contêm data (ex: 'data_emissao' ou 'dt_emissao'), você pode usar SUBSTR(data, 1, 7) para agrupar por mês (ex: '2024-01').
`,
  inputVariables: ['tableSummary', 'dictSummary', 'question'],
});

const outputParser = new StringOutputParser();

export async function processNaturalLanguageQuery(
  question: string,
  dataset: Dataset,
  apiKeyOverride?: string
): Promise<QueryResult> {
  const startTime = Date.now();
  const steps: AgentStep[] = [];

  // Initialize DB with dataset
  initializeDatabase(dataset);

  const tableSummary = dataset.tables.map(t => {
    const cols = t.columns.map(c => `${c.name} (${c.type}${c.description ? `: ${c.description}` : ''})`).join(', ');
    return `Tabela '${t.tableName}' (${t.rowCount} linhas, arquivo: ${t.filename}):\n  Colunas: [${cols}]`;
  }).join('\n\n');

  const dictSummary = dataset.dictionaries.length > 0
    ? dataset.dictionaries.map(d => `- ${d.columnName}: ${d.description}`).join('\n')
    : 'Nenhum dicionário explícito anexado.';

  // Step 1: Orchestrator & Schema Agent
  const step1Timestamp = new Date().toLocaleTimeString();
  steps.push({
    agentName: 'Orquestrador',
    title: 'Análise da Pergunta e Contexto de Dados',
    description: `Analisando a pergunta do usuário e o esquema de ${dataset.tables.length} tabela(s) no dataset '${dataset.name}'.`,
    status: 'running',
    timestamp: step1Timestamp,
  });

  // Determine LLM provider: OpenRouter API key or user override key (Gemini API key is disabled per user preference)
  const openRouterKey = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'MY_OPENROUTER_API_KEY'
    ? process.env.OPENROUTER_API_KEY
    : null;
  const effectiveKey = apiKeyOverride || openRouterKey;

  steps[0].status = 'completed';
  steps[0].details = `Mapeamento concluído. Dataset de entrada contém ${dataset.totalRows} registros e ${dataset.tables[0]?.columns.length || 0} colunas catalogadas.`;

  // Step 2: Agente de Esquema e SQL
  steps.push({
    agentName: 'Agente de Esquema',
    title: 'Mapeamento Semântico e Dicionário de Dados',
    description: 'Interpretando intenção da pergunta e correlacionando com as colunas do dicionário de dados.',
    status: 'completed',
    details: `Intenção identificada para a pergunta: "${question}". Mapeando agregações, agrupamentos e filtros apropriados.`,
    timestamp: new Date().toLocaleTimeString(),
  });

  steps.push({
    agentName: 'Agente SQL',
    title: 'Geração e Execução de Consulta AlaSQL',
    description: 'Gerando comando SQL otimizado para extração e transformação dos dados.',
    status: 'running',
    timestamp: new Date().toLocaleTimeString(),
  });

  let generatedSql = '';
  let sqlResult: { headers: string[]; rows: Record<string, any>[] } = { headers: [], rows: [] };
  let executionError: string | undefined;

  // Try LLM SQL Generation if OpenRouter / override key is available
  if (effectiveKey) {
    try {
      generatedSql = await generateSqlWithOpenRouter(question, tableSummary, dictSummary, effectiveKey);
    } catch (err: any) {
      console.warn('OpenRouter LLM SQL generation failed, falling back to deterministic query builder:', err);
    }
  }

  // Fallback / Deterministic Query Builder if LLM failed or generated empty SQL
  if (!generatedSql || generatedSql.trim() === '') {
    generatedSql = generateDeterministicSql(question, dataset);
  }

  // Execute SQL
  try {
    sqlResult = executeQuery(generatedSql);

    // If query succeeded but returned 0 rows, attempt deterministic fallback query
    if (sqlResult.rows.length === 0) {
      const fallbackSql = generateDeterministicSql(question, dataset);
      if (fallbackSql && fallbackSql !== generatedSql) {
        try {
          const fallbackResult = executeQuery(fallbackSql);
          if (fallbackResult.rows.length > 0) {
            sqlResult = fallbackResult;
            generatedSql = fallbackSql;
          }
        } catch (e) {
          // ignore fallback error if original succeeded with 0 rows
        }
      }
    }

    steps[2].status = 'completed';
    steps[2].sqlQuery = generatedSql;
    steps[2].details = `Consulta executada com sucesso. Retornou ${sqlResult.rows.length} registros e ${sqlResult.headers.length} colunas.`;
  } catch (err: any) {
    executionError = err.message || String(err);
    // Attempt auto-correction
    const fallbackSql = generateDeterministicSql(question, dataset);
    try {
      sqlResult = executeQuery(fallbackSql);
      generatedSql = fallbackSql;
      steps[2].status = 'completed';
      steps[2].sqlQuery = generatedSql;
      steps[2].details = `Correção automática aplicada. Consulta ajustada executada com ${sqlResult.rows.length} registros.`;
      executionError = undefined;
    } catch (retryErr: any) {
      steps[2].status = 'failed';
      steps[2].details = `Falha na execução do SQL: ${executionError}`;
    }
  }

  // Step 3: Agente de Análise e Gráficos
  steps.push({
    agentName: 'Agente de Análise e Gráficos',
    title: 'Síntese de Resposta, KPIs e Visualização',
    description: 'Formatando os resultados, calculando indicadores e gerando gráficos interativos.',
    status: 'running',
    timestamp: new Date().toLocaleTimeString(),
  });

  let answerText = '';
  let chartConfig: ChartConfig | undefined;
  let kpis: KPICard[] = [];

  if (sqlResult.rows.length > 0) {
    chartConfig = deriveChartConfig(question, sqlResult.headers, sqlResult.rows);
    kpis = deriveKPIs(sqlResult.headers, sqlResult.rows);

    if (effectiveKey && !executionError) {
      try {
        answerText = await generateSynthesisWithLLM(question, generatedSql, sqlResult.rows, effectiveKey, 'openrouter');
      } catch (err) {
        answerText = buildDefaultTextSummary(question, sqlResult.headers, sqlResult.rows, generatedSql);
      }
    } else {
      answerText = buildDefaultTextSummary(question, sqlResult.headers, sqlResult.rows, generatedSql);
    }
  } else {
    answerText = `Não foram encontrados registros que correspondam aos critérios da sua consulta para a pergunta: "${question}".`;
  }

  steps[3].status = 'completed';
  steps[3].details = `Resposta gerada contendo ${sqlResult.rows.length} linha(s) em tabela, ${kpis.length} indicador(es) KPI e ${chartConfig ? '1 gráfico interativo (' + chartConfig.type + ')' : 'visão textual'}.`;

  const executionTimeMs = Date.now() - startTime;

  return {
    id: `query-${Date.now()}`,
    question,
    timestamp: new Date().toISOString(),
    answerText,
    sqlQuery: generatedSql,
    tableHeaders: sqlResult.headers,
    tableRows: sqlResult.rows,
    chartConfig,
    kpis,
    agentSteps: steps,
    executionTimeMs,
    error: executionError,
  };
}

async function generateSqlWithGemini(
  question: string,
  tableSummary: string,
  dictSummary: string,
  apiKey: string
): Promise<string> {
  const formattedPrompt = await sqlPromptTemplate.format({
    tableSummary,
    dictSummary,
    question,
  });

  if (apiKey && !apiKey.startsWith('sk-or-')) {
    try {
      const model = new ChatGoogleGenerativeAI({
        apiKey: apiKey,
        model: 'gemini-2.0-flash',
      });
      const res = await model.invoke(formattedPrompt);
      const parsedText = await outputParser.parse(String(res.content));
      if (parsedText && parsedText.trim()) {
        return cleanSqlText(parsedText);
      }
    } catch (err) {
      console.warn('LangChain ChatGoogleGenerativeAI invoke error, using direct SDK runner:', err);
    }
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: formattedPrompt,
  });

  let sql = response.text || '';
  return cleanSqlText(sql);
}

async function generateSqlWithOpenRouter(
  question: string,
  tableSummary: string,
  dictSummary: string,
  apiKey: string
): Promise<string> {
  const freeModels = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
  ];

  for (const model of freeModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai.studio',
          'X-Title': 'CSV Data Agent',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em SQL. Retorne APENAS o código SQL puro sem formatação markdown.',
            },
            {
              role: 'user',
              content: `Tabelas:\n${tableSummary}\n\nDicionário:\n${dictSummary}\n\nPergunta: ${question}\n\nForneça a consulta SQL em AlaSQL:`,
            },
          ],
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || '';
        if (text && text.trim()) {
          return cleanSqlText(text);
        }
      }
    } catch (err) {
      console.warn(`OpenRouter model ${model} failed, trying next model:`, err);
    }
  }

  return '';
}

async function generateSynthesisWithLLM(
  question: string,
  sql: string,
  rows: Record<string, any>[],
  apiKey: string,
  provider: 'gemini' | 'openrouter'
): Promise<string> {
  const dataPreview = JSON.stringify(rows.slice(0, 15), null, 2);
  const prompt = `Você é um Agente Analista Financeiro e de Dados.
Sua tarefa é elaborar uma resposta analítica clara, objetiva e profissional em Português do Brasil para a pergunta: "${question}".

CONSULTA SQL EXECUTADA:
${sql}

RESULTADO DOS DADOS (${rows.length} registros no total):
${dataPreview}

DIRETRIZES DA RESPOSTA:
1. Responda diretamente à pergunta no primeiro parágrafo com destaques em negrito.
2. Apresente os principais destaques/insights (ex: maior valor, fornecedor dominante, tendência mensal).
3. Formate valores monetários em R$ (Ex: R$ 45.000,00).
4. Mantenha um tom profissional, direto e fundamentado nos dados.`;

  if (provider === 'gemini') {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    const res = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    return res.text || '';
  } else {
    const freeModels = [
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
    ];

    for (const model of freeModels) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://ai.studio',
            'X-Title': 'CSV Data Agent',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.choices?.[0]?.message?.content || '';
          if (text && text.trim()) {
            return text;
          }
        }
      } catch (err) {
        console.warn(`OpenRouter synthesis model ${model} failed:`, err);
      }
    }

    return '';
  }
}

function cleanSqlText(text: string): string {
  let cleaned = text.replace(/```sql/gi, '').replace(/```/g, '').trim();
  const firstSelect = cleaned.indexOf('SELECT');
  if (firstSelect !== -1) {
    cleaned = cleaned.substring(firstSelect);
  }
  const lastSemicolon = cleaned.lastIndexOf(';');
  if (lastSemicolon !== -1) {
    cleaned = cleaned.substring(0, lastSemicolon + 1);
  }
  return cleaned.trim();
}

function generateDeterministicSql(question: string, dataset: Dataset): string {
  const q = question.toLowerCase();
  const primaryTable = dataset.tables[0];
  if (!primaryTable || !primaryTable.columns || primaryTable.columns.length === 0) return 'SELECT 1';

  const safeTableName = getSafeTableName(primaryTable.tableName || primaryTable.filename || 'tabela');

  const findCol = (candidates: string[]) => {
    return primaryTable.columns.find(c =>
      candidates.some(cand => {
        const cName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const candClean = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cName.includes(candClean);
      })
    )?.name;
  };

  const supplierCol = findCol(['fornecedor', 'razaosocial', 'razao', 'vendor', 'emitente', 'empresa', 'nome', 'prestador', 'credor', 'fornec', 'fantasia', 'nmfornecedor', 'dsfornecedor', 'nmemitente', 'cliente'])
    || primaryTable.columns.find(c => c.type === 'string')?.name
    || primaryTable.columns[0]?.name;

  const amountCol = findCol(['valortotal', 'vlrliquido', 'vlrbruto', 'valor', 'vlr', 'vl', 'total', 'monto', 'preco', 'pago', 'gasto', 'recebido', 'amount', 'price', 'val'])
    || primaryTable.columns.find(c => c.type === 'number')?.name
    || primaryTable.columns[1]?.name;

  const productCol = findCol(['descricaoproduto', 'itemnome', 'produto', 'item', 'descricao', 'desc', 'prod', 'material', 'servico', 'nmproduto', 'dsproduto']);
  const categoryCol = findCol(['categoriaproduto', 'grupomaterial', 'categoria', 'grupo', 'tipo', 'classe', 'familia', 'segmento']);
  const dateCol = findCol(['dataemissao', 'dtemissao', 'data', 'dt', 'date', 'emissao', 'periodo', 'ano', 'mes']);
  const qtyCol = findCol(['quantidade', 'qtd', 'volume', 'qtdfaturada', 'quant', 'unidades']);

  // Intenção 1: Fornecedor / Maior Gasto / Maior Recebimento
  if (q.includes('fornecedor') || q.includes('maior') || q.includes('top') || q.includes('gasto') || q.includes('recebeu') || q.includes('pago') || q.includes('empresa') || q.includes('quem')) {
    if (supplierCol && amountCol && supplierCol !== amountCol) {
      return `SELECT \`${supplierCol}\` AS Fornecedor, SUM(\`${amountCol}\`) AS Total_Gasto FROM \`${safeTableName}\` WHERE \`${supplierCol}\` IS NOT NULL GROUP BY \`${supplierCol}\` ORDER BY Total_Gasto DESC LIMIT 10`;
    }
  }

  // Intenção 2: Produto / Item / Volume
  if (q.includes('produto') || q.includes('item') || q.includes('comprado') || q.includes('volume') || q.includes('vendido') || q.includes('material')) {
    const groupCol = productCol || categoryCol || supplierCol;
    const metricCol = qtyCol || amountCol;
    if (groupCol) {
      const metricExpr = metricCol ? `SUM(\`${metricCol}\`)` : 'COUNT(*)';
      const metricLabel = qtyCol ? 'Volume_Total' : (amountCol ? 'Valor_Total' : 'Qtd_Registros');
      return `SELECT \`${groupCol}\` AS Item, ${metricExpr} AS ${metricLabel} FROM \`${safeTableName}\` WHERE \`${groupCol}\` IS NOT NULL GROUP BY \`${groupCol}\` ORDER BY ${metricLabel} DESC LIMIT 10`;
    }
  }

  // Intenção 3: Data / Evolução / Mês / Período
  if (q.includes('mes') || q.includes('mês') || q.includes('data') || q.includes('evolucao') || q.includes('evolução') || q.includes('periodo') || q.includes('período') || q.includes('tempo')) {
    if (dateCol && amountCol) {
      return `SELECT SUBSTR(\`${dateCol}\`, 1, 7) AS Mes, SUM(\`${amountCol}\`) AS Total FROM \`${safeTableName}\` WHERE \`${dateCol}\` IS NOT NULL GROUP BY SUBSTR(\`${dateCol}\`, 1, 7) ORDER BY Mes ASC`;
    }
  }

  // Fallback 1: Agrupar pela coluna de texto com soma numérica
  if (supplierCol && amountCol && supplierCol !== amountCol) {
    return `SELECT \`${supplierCol}\` AS Categoria, SUM(\`${amountCol}\`) AS Total FROM \`${safeTableName}\` WHERE \`${supplierCol}\` IS NOT NULL GROUP BY \`${supplierCol}\` ORDER BY Total DESC LIMIT 10`;
  }

  // Absolute fallback
  return `SELECT * FROM \`${safeTableName}\` LIMIT 20`;
}

function deriveChartConfig(
  question: string,
  headers: string[],
  rows: Record<string, any>[]
): ChartConfig | undefined {
  if (rows.length === 0 || headers.length < 2) return undefined;

  const xAxisKey = headers[0];
  const yAxisKeys = headers.slice(1).filter(h => {
    const sampleVal = rows[0][h];
    return typeof sampleVal === 'number' || (!isNaN(Number(sampleVal)) && sampleVal !== '');
  });

  if (yAxisKeys.length === 0) return undefined;

  const q = question.toLowerCase();
  let chartType: ChartConfig['type'] = 'bar';

  if (q.includes('mês') || q.includes('mes') || q.includes('evolução') || q.includes('crescimento') || q.includes('tendência')) {
    chartType = 'line';
  } else if (q.includes('distribuição') || q.includes('participação') || q.includes('percentual') || q.includes('categoria')) {
    chartType = rows.length <= 6 ? 'pie' : 'bar';
  } else if (q.includes('acumulado') || q.includes('área')) {
    chartType = 'area';
  }

  // Title formatting
  let title = 'Visualização Gráfica';
  if (headers[1] && headers[0]) {
    title = `${headers[1].replace(/_/g, ' ')} por ${headers[0].replace(/_/g, ' ')}`;
  }

  return {
    type: chartType,
    title,
    xAxisKey,
    yAxisKeys,
    data: rows,
  };
}

function deriveKPIs(headers: string[], rows: Record<string, any>[]): KPICard[] {
  const kpis: KPICard[] = [];
  if (rows.length === 0) return kpis;

  // Check if first numeric column represents a total or count
  const numHeader = headers.find(h => typeof rows[0][h] === 'number');
  if (numHeader) {
    const total = rows.reduce((sum, r) => sum + (Number(r[numHeader]) || 0), 0);
    const labelHeader = headers[0];

    kpis.push({
      label: `Total acumulado (${numHeader.replace(/_/g, ' ')})`,
      value: numHeader.toLowerCase().includes('valor') || numHeader.toLowerCase().includes('gasto') || numHeader.toLowerCase().includes('total')
        ? formatCurrencyBR(total)
        : formatNumberBR(total),
      format: 'currency',
    });

    if (rows.length > 0) {
      const topRow = rows[0];
      kpis.push({
        label: `Líder: ${topRow[labelHeader] || 'N/A'}`,
        value: typeof topRow[numHeader] === 'number' && (numHeader.toLowerCase().includes('valor') || numHeader.toLowerCase().includes('gasto'))
          ? formatCurrencyBR(topRow[numHeader])
          : formatNumberBR(topRow[numHeader]),
        trend: 'up',
      });
    }

    kpis.push({
      label: 'Registros Analisados',
      value: `${rows.length} item(ns)`,
    });
  }

  return kpis;
}

function buildDefaultTextSummary(
  question: string,
  headers: string[],
  rows: Record<string, any>[],
  sql: string
): string {
  if (rows.length === 0) {
    return `Nenhum resultado foi retornado pela consulta para a pergunta: "${question}".`;
  }

  const topRow = rows[0];
  const firstCol = headers[0];
  const secondCol = headers[1];

  let topValStr = '';
  if (secondCol && topRow[secondCol] !== undefined) {
    const val = topRow[secondCol];
    topValStr = typeof val === 'number' && (secondCol.toLowerCase().includes('total') || secondCol.toLowerCase().includes('valor') || secondCol.toLowerCase().includes('gasto'))
      ? formatCurrencyBR(val)
      : String(val);
  }

  let text = `Com base na análise dos dados carregados para a pergunta **"${question}"**:\n\n`;
  if (firstCol && secondCol && topRow[firstCol]) {
    text += `• O principal destaque do período é **${topRow[firstCol]}**, com o montante de **${topValStr}**.\n`;
  }
  text += `• A consulta processou um total de **${rows.length} registro(s)** relevante(s).\n`;
  text += `• Todos os registros estão tabulados abaixo para detalhamento completo.`;

  return text;
}
