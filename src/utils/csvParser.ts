import Papa from 'papaparse';
import { ColumnSchema, CSVTableData, DataDictionaryItem, Dataset } from '../types';
import { getSafeTableName } from './sqlEngine';

export interface ExtractedZipContent {
  csvFiles: { filename: string; content: string }[];
  dictionaryFiles: { filename: string; content: string }[];
}

export function parseCsvContent(filename: string, rawCsv: string): CSVTableData {
  const parsed = Papa.parse(rawCsv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const rows = (parsed.data as Record<string, any>[]).filter(r => Object.keys(r).length > 0);
  const sampleRow = rows[0] || {};
  const columnNames = Object.keys(sampleRow);

  const columns: ColumnSchema[] = columnNames.map(colName => {
    const sampleValues: any[] = [];
    let nullCount = 0;
    let typeCounts = { number: 0, date: 0, boolean: 0, string: 0 };

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const val = rows[i][colName];
      if (val === null || val === undefined || val === '') {
        nullCount++;
      } else {
        if (sampleValues.length < 3) sampleValues.push(val);

        if (typeof val === 'number') {
          typeCounts.number++;
        } else if (typeof val === 'boolean') {
          typeCounts.boolean++;
        } else if (typeof val === 'string') {
          const trimmed = val.trim();
          if (!isNaN(Date.parse(trimmed)) && trimmed.length >= 8 && (trimmed.includes('-') || trimmed.includes('/'))) {
            typeCounts.date++;
          } else if (!isNaN(Number(trimmed.replace(',', '.')))) {
            typeCounts.number++;
          } else {
            typeCounts.string++;
          }
        }
      }
    }

    let detectedType: ColumnSchema['type'] = 'string';
    if (typeCounts.number > typeCounts.string && typeCounts.number >= typeCounts.date) {
      detectedType = 'number';
    } else if (typeCounts.date > typeCounts.string) {
      detectedType = 'date';
    } else if (typeCounts.boolean > 0) {
      detectedType = 'boolean';
    }

    return {
      name: colName,
      type: detectedType,
      sampleValues,
      nullCount,
    };
  });

  const safeTableName = getSafeTableName(filename);

  return {
    id: `tb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    filename,
    tableName: safeTableName,
    rowCount: rows.length,
    columns,
    rows,
    rawCsv,
  };
}

export function parseDataDictionaryText(text: string, filename: string): DataDictionaryItem[] {
  const items: DataDictionaryItem[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('DICIONÁRIO')) continue;

    // Matches e.g., "1. numero_nf: Número sequencial" or "- dt_emissao: Data de emissão" or "coluna = descricao"
    const match = trimmed.match(/^(?:\d+[\.\)]\s*|[\-\*]\s*)?([a-zA-Z0-9_\-\.\s]+?)\s*[:=\-]\s*(.+)$/);
    if (match) {
      const colName = match[1].replace(/[`"']/g, '').trim();
      const desc = match[2].trim();
      if (colName && desc && colName.length < 50) {
        items.push({
          filename,
          columnName: colName,
          description: desc,
        });
      }
    }
  }

  return items;
}

export function buildDatasetFromFiles(
  datasetName: string,
  csvs: { filename: string; content: string }[],
  dictionaries: { filename: string; content: string }[]
): Dataset {
  const tables = csvs.map(c => parseCsvContent(c.filename, c.content));
  const dictItems: DataDictionaryItem[] = [];

  for (const dict of dictionaries) {
    const items = parseDataDictionaryText(dict.content, dict.filename);
    dictItems.push(...items);
  }

  // Associate descriptions from dictionaries to table columns
  for (const table of tables) {
    for (const col of table.columns) {
      const match = dictItems.find(
        d => d.columnName.toLowerCase() === col.name.toLowerCase()
      );
      if (match) {
        col.description = match.description;
      }
    }
  }

  const totalRows = tables.reduce((acc, t) => acc + t.rowCount, 0);

  return {
    id: `dataset-${Date.now()}`,
    name: datasetName,
    uploadedAt: new Date().toISOString(),
    tables,
    dictionaries: dictItems,
    totalRows,
  };
}
