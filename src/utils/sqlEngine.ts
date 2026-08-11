import alasql from 'alasql';
import { CSVTableData, Dataset } from '../types';

export function initializeDatabase(dataset: Dataset): void {
  try {
    if (!dataset || !dataset.tables || dataset.tables.length === 0) return;

    dataset.tables.forEach((table, idx) => {
      const namesToRegister = new Set<string>();

      const safePrimary = getSafeTableName(table.tableName || table.filename || `tabela_${idx + 1}`);
      namesToRegister.add(safePrimary);

      if (table.tableName) {
        namesToRegister.add(table.tableName);
        namesToRegister.add(getSafeTableName(table.tableName));
      }
      if (table.filename) {
        namesToRegister.add(table.filename);
        namesToRegister.add(table.filename.replace(/\.csv$/i, ''));
        namesToRegister.add(getSafeTableName(table.filename));
      }

      // Generic fallback aliases for easy querying
      namesToRegister.add('tabela');
      namesToRegister.add('dataset');
      namesToRegister.add('dados');
      namesToRegister.add(`tabela_${idx + 1}`);
      namesToRegister.add(`tb_${idx + 1}`);

      // Sanitize row data for AlaSQL
      const sanitizedRows = table.rows.map(row => {
        const cleanedRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          cleanedRow[key] = cleanValue(value);
        }
        return cleanedRow;
      });

      // Register dataset in AlaSQL under each alias
      namesToRegister.forEach(name => {
        if (!name) return;
        const safeName = getSafeTableName(name);
        try {
          alasql(`DROP TABLE IF EXISTS \`${safeName}\``);
        } catch (e) {
          // ignore
        }
        try {
          alasql(`CREATE TABLE \`${safeName}\``);
        } catch (e) {
          // ignore
        }

        try {
          if (alasql.tables[safeName]) {
            alasql.tables[safeName].data = sanitizedRows;
          } else {
            alasql.tables[safeName] = { data: sanitizedRows } as any;
          }

          // Alias mapping directly in JS object
          if (name && name !== safeName) {
            alasql.tables[name] = alasql.tables[safeName];
          }
        } catch (err) {
          console.warn(`Could not register table alias ${safeName}:`, err);
        }
      });
    });
  } catch (err) {
    console.error('Error initializing AlaSQL database:', err);
  }
}

export function executeQuery(sqlQuery: string): { headers: string[]; rows: Record<string, any>[] } {
  try {
    let cleanSql = sqlQuery.trim();
    if (cleanSql.endsWith(';')) cleanSql = cleanSql.slice(0, -1);

    const rawResult = alasql(cleanSql);
    let rows: Record<string, any>[] = [];

    if (Array.isArray(rawResult)) {
      if (rawResult.length > 0 && typeof rawResult[0] === 'object' && rawResult[0] !== null) {
        rows = rawResult;
      } else if (rawResult.length === 1 && typeof rawResult[0] === 'number') {
        rows = [{ valor: rawResult[0] }];
      } else if (rawResult.length > 0 && Array.isArray(rawResult[0])) {
        const last = rawResult[rawResult.length - 1];
        if (Array.isArray(last)) rows = last;
      }
    }

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { headers, rows };
  } catch (err: any) {
    throw new Error(`Erro na execução do SQL (${err.message || err}): ${sqlQuery}`);
  }
}

export function getSafeTableName(name: string): string {
  let safe = name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
  safe = safe.replace(/^\d+/, 'tb_$&');
  if (safe.endsWith('_csv')) safe = safe.replace(/_csv$/, '');
  return safe || 'tabela';
}

function cleanValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val;

  if (typeof val === 'string') {
    const raw = val.trim();
    if (raw === '' || raw === '-' || raw.toLowerCase() === 'null' || raw.toLowerCase() === 'undefined' || raw === 'N/A') {
      return null;
    }

    // Try converting Brazilian currency or formatted numbers
    let s = raw.replace(/^(R\$|\$|BRL)\s*/i, '').trim();

    // Pattern 1: Brazilian format with comma decimal (e.g. "1.500,50" or "1500,50" or "250,00" or "-1.234,56")
    if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s) || /^-?\d+,\d+$/.test(s)) {
      const normalized = s.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(normalized);
      if (!isNaN(num)) return num;
    }

    // Pattern 2: Standard US format or integer (e.g. "1500.50" or "1500" or "-100.5")
    if (/^-?\d+(\.\d+)?$/.test(s)) {
      const num = parseFloat(s);
      if (!isNaN(num)) return num;
    }

    // Pattern 3: String with thousand dots only e.g. "1.500" (in BR format 1.500 = 1500)
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
      const normalized = s.replace(/\./g, '');
      const num = parseFloat(normalized);
      if (!isNaN(num)) return num;
    }
  }

  return val;
}

export function formatCurrencyBR(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export function formatNumberBR(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat('pt-BR').format(num);
}
