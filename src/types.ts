export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  description?: string;
  nullCount: number;
}

export interface CSVTableData {
  id: string;
  filename: string;
  tableName: string;
  rowCount: number;
  columns: ColumnSchema[];
  rows: Record<string, any>[];
  rawCsv?: string;
}

export interface DataDictionaryItem {
  filename?: string;
  columnName: string;
  description: string;
  dataType?: string;
  example?: string;
}

export interface Dataset {
  id: string;
  name: string;
  uploadedAt: string;
  tables: CSVTableData[];
  dictionaries: DataDictionaryItem[];
  sourceZipName?: string;
  totalRows: number;
}

export interface AgentStep {
  agentName: 'Orquestrador' | 'Agente de Esquema' | 'Agente SQL' | 'Agente de Análise e Gráficos';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
  sqlQuery?: string;
  timestamp: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'kpi';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxisKey: string;
  yAxisKeys: string[];
  yAxisLabels?: Record<string, string>;
  data: Record<string, any>[];
}

export interface KPICard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'number' | 'percentage' | 'text';
}

export interface QueryResult {
  id: string;
  question: string;
  timestamp: string;
  answerText: string;
  sqlQuery?: string;
  tableHeaders?: string[];
  tableRows?: Record<string, any>[];
  chartConfig?: ChartConfig;
  kpis?: KPICard[];
  agentSteps: AgentStep[];
  executionTimeMs: number;
  error?: string;
}

export interface TestResultItem {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  totalDurationMs: number;
  tests: TestResultItem[];
}
