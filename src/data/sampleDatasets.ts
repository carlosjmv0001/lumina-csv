import { Dataset } from '../types';

export const SAMPLE_202401_NFS_CSV = `numero_nf,data_emissao,cnpj_fornecedor,razao_social_fornecedor,categoria_produto,descricao_produto,quantidade,valor_unitario,valor_total,imposto_icms,estado_uf,status_nf
1001,2024-01-05,12.345.678/0001-90,TechLog Distribuidora Ltda,TI e Informática,Notebook Dell Latitude 15,10,4500.00,45000.00,5400.00,SP,Emitida
1002,2024-01-08,98.765.432/0001-10,Papelaria e Suprimentos Alvorada,Material de Escritório,Papel A4 Chamex 75g (Caixa c/ 10),50,220.00,11000.00,1320.00,RJ,Emitida
1003,2024-01-12,45.123.890/0001-55,Serviços de Limpeza ProAtiva,Serviços Gerais,Serviço de Higienização Mensal,1,8500.00,8500.00,425.00,MG,Emitida
1004,2024-01-15,12.345.678/0001-90,TechLog Distribuidora Ltda,TI e Informática,Monitor LG 27 UltraFine 4K,15,1800.00,27000.00,3240.00,SP,Emitida
1005,2024-01-20,33.999.111/0001-22,Móveis Corporativos Ergotech,Mobiliário,Cadeira Ergonômica NR17,20,1200.00,24000.00,2880.00,PR,Emitida
1006,2024-01-25,98.765.432/0001-10,Papelaria e Suprimentos Alvorada,Material de Escritório,Cartucho Tinta HP Black,30,150.00,4500.00,540.00,RJ,Emitida
1007,2024-02-02,12.345.678/0001-90,TechLog Distribuidora Ltda,TI e Informática,Servidor Rack PowerEdge R750,2,38000.00,76000.00,9120.00,SP,Emitida
1008,2024-02-10,77.888.999/0001-44,Alimentos e Eventos Gourmet,Alimentação,Coffee Break Treinamento Executivo,3,3200.00,9600.00,0.00,SP,Emitida
1009,2024-02-18,33.999.111/0001-22,Móveis Corporativos Ergotech,Mobiliário,Mesa Reunião Oval 10 Lugares,2,4500.00,9000.00,1080.00,PR,Emitida
1010,2024-02-24,45.123.890/0001-55,Serviços de Limpeza ProAtiva,Serviços Gerais,Manutenção Preventiva Ar Condicionado,4,1200.00,4800.00,240.00,MG,Emitida
1011,2024-03-05,12.345.678/0001-90,TechLog Distribuidora Ltda,TI e Informática,Switch Cisco 48 Portas Gigabit,4,6200.00,24800.00,2976.00,SP,Emitida
1012,2024-03-12,98.765.432/0001-10,Papelaria e Suprimentos Alvorada,Material de Escritório,Kit Canetas e Bloco de Notas Personalizado,100,45.00,4500.00,540.00,RJ,Emitida
1013,2024-03-19,55.444.333/0001-88,Transportes Rápidos TransBrasil,Logística,Frete Carga Lotação SP-RJ,5,2800.00,14000.00,1680.00,SP,Emitida
1014,2024-03-27,12.345.678/0001-90,TechLog Distribuidora Ltda,TI e Informática,Teclado e Mouse Sem Fio Logitech,40,250.00,10000.00,1200.00,SP,Emitida
1015,2024-04-03,33.999.111/0001-22,Móveis Corporativos Ergotech,Mobiliário,Gaveteiro Volante c/ Chave,15,650.00,9750.00,1170.00,PR,Emitida
1016,2024-04-14,77.888.999/0001-44,Alimentos e Eventos Gourmet,Alimentação,Almoço Comemorativo Meta Anual,1,12500.00,12500.00,0.00,SP,Emitida
1017,2024-04-22,55.444.333/0001-88,Transportes Rápidos TransBrasil,Logística,Seguro Carga Expresso,10,800.00,8000.00,960.00,SP,Emitida
1018,2024-05-08,12.345.678/0001-90,TechLog Distribuidora Ltda,TI e Informática,No-Break APC 3000VA,5,4200.00,21000.00,2520.00,SP,Emitida
1019,2024-05-18,45.123.890/0001-55,Serviços de Limpeza ProAtiva,Serviços Gerais,Sanitização de Ambientes,2,3500.00,7000.00,350.00,MG,Emitida
1020,2024-05-29,98.765.432/0001-10,Papelaria e Suprimentos Alvorada,Material de Escritório,Cartuchos Toner Laser HP,12,680.00,8160.00,979.20,RJ,Emitida
`;

export const SAMPLE_202401_DICTIONARY_TXT = `DICIONÁRIO DE DADOS - NOTAS FISCAIS DE COMPRAS (202401_NFs)

1. numero_nf: Número sequencial da Nota Fiscal emitida pelo fornecedor.
2. data_emissao: Data de emissão no formato AAAA-MM-DD.
3. cnpj_fornecedor: Cadastro Nacional da Pessoa Jurídica do fornecedor com pontuação.
4. razao_social_fornecedor: Nome oficial / Razão social da empresa fornecedora.
5. categoria_produto: Categoria do bem ou serviço adquirido (ex: TI e Informática, Mobiliário, Material de Escritório).
6. descricao_produto: Detalhamento do item ou serviço contratado.
7. quantidade: Quantidade de itens adquiridos na nota fiscal.
8. valor_unitario: Preço em Reais (R$) por unidade de produto.
9. valor_total: Valor total da nota fiscal em Reais (R$) [quantidade x valor_unitario].
10. imposto_icms: Valor destacado referente ao imposto estadual ICMS em R$.
11. estado_uf: Sigla da Unidade Federativa (Estado) de origem da nota fiscal.
12. status_nf: Situação cadastral da nota fiscal (Emitida, Cancelada, Devolvida).
`;

export const SAMPLE_202505_NFE_CSV = `chave_acesso,dt_emissao,fornecedor_nome,fornecedor_cnpj,grupo_material,item_nome,qtd,prc_unit,vlr_bruto,desconto,vlr_liquido,uf_destino
35250512345678000190550010000010011,2025-05-01,Soluções em Nuvem CloudTech,61.111.222/0001-33,Softwares e Licenças,Licença Microsoft 365 Business,120,85.00,10200.00,200.00,10000.00,SP
35250512345678000190550010000010022,2025-05-03,Alfa Infraestrutura Elétrica,82.333.444/0001-55,Obras e Instalações,Cabeamento Estruturado Cat6,500,28.00,14000.00,1000.00,13000.00,SP
35250512345678000190550010000010033,2025-05-06,Soluções em Nuvem CloudTech,61.111.222/0001-33,Softwares e Licenças,Servidor AWS Cloud Compute,1,18500.00,18500.00,500.00,18000.00,SP
35250512345678000190550010000010044,2025-05-10,Segurança & Alarme Guard,11.222.333/0001-77,Segurança Patrimonial,Monitoramento 24h Maio/2025,1,4200.00,4200.00,0.00,4200.00,RJ
35250512345678000190550010000010055,2025-05-15,Soluções em Nuvem CloudTech,61.111.222/0001-33,Softwares e Licenças,Licença Salesforce CRM Pro,15,450.00,6750.00,250.00,6500.00,SP
35250512345678000190550010000010066,2025-05-20,Alfa Infraestrutura Elétrica,82.333.444/0001-55,Obras e Instalações,Gerador Diesel 50kVA,1,45000.00,45000.00,3000.00,42000.00,SP
35250512345678000190550010000010077,2025-05-25,Gráfica e Mídia Express,44.555.666/0001-99,Marketing e Comunicação,Banners e Uniformes Evento,1,9800.00,9800.00,300.00,9500.00,MG
35250512345678000190550010000010088,2025-05-28,Soluções em Nuvem CloudTech,61.111.222/0001-33,Softwares e Licenças,Consultoria DevOps & Kubernetes,40,250.00,10000.00,0.00,10000.00,SP
`;

export const SAMPLE_202505_DICTIONARY_TXT = `DICIONÁRIO DE DADOS - NFE 2025-05 (202505_NFe)

- chave_acesso: Chave eletrônica de 44 dígitos da Nota Fiscal Eletrônica.
- dt_emissao: Data de emissão da NFe (AAAA-MM-DD).
- fornecedor_nome: Razão social do emitente / fornecedor.
- fornecedor_cnpj: CNPJ do fornecedor.
- grupo_material: Agrupamento de despesa / Categoria.
- item_nome: Descrição comercial do produto/serviço.
- qtd: Quantidade faturada.
- prc_unit: Preço unitário líquido.
- vlr_bruto: Valor bruto da nota fiscal.
- desconto: Desconto concedido pelo fornecedor.
- vlr_liquido: Valor líquido a pagar (vlr_bruto - desconto).
- uf_destino: Estado de destino das mercadorias.
`;

export function getSampleDataset202401(): Dataset {
  return {
    id: 'dataset-202401-nfs',
    name: '202401_NFs.zip (Notas Fiscais de Compras 2024)',
    uploadedAt: new Date().toISOString(),
    sourceZipName: '202401_NFs.zip',
    totalRows: 20,
    tables: [
      {
        id: 'tb-202401-nfs',
        filename: '202401_NFs.csv',
        tableName: 'nfs_202401',
        rowCount: 20,
        columns: [
          { name: 'numero_nf', type: 'number', sampleValues: [1001, 1002, 1003], nullCount: 0, description: 'Número sequencial da Nota Fiscal' },
          { name: 'data_emissao', type: 'date', sampleValues: ['2024-01-05', '2024-01-08'], nullCount: 0, description: 'Data de emissão da NF' },
          { name: 'cnpj_fornecedor', type: 'string', sampleValues: ['12.345.678/0001-90'], nullCount: 0, description: 'CNPJ do fornecedor' },
          { name: 'razao_social_fornecedor', type: 'string', sampleValues: ['TechLog Distribuidora Ltda'], nullCount: 0, description: 'Razão social da empresa fornecedora' },
          { name: 'categoria_produto', type: 'string', sampleValues: ['TI e Informática', 'Material de Escritório'], nullCount: 0, description: 'Categoria do bem ou serviço' },
          { name: 'descricao_produto', type: 'string', sampleValues: ['Notebook Dell Latitude 15'], nullCount: 0, description: 'Detalhamento do item' },
          { name: 'quantidade', type: 'number', sampleValues: [10, 50, 1], nullCount: 0, description: 'Quantidade de itens' },
          { name: 'valor_unitario', type: 'number', sampleValues: [4500.00, 220.00], nullCount: 0, description: 'Preço unitário em Reais (R$)' },
          { name: 'valor_total', type: 'number', sampleValues: [45000.00, 11000.00], nullCount: 0, description: 'Valor total da nota em Reais (R$)' },
          { name: 'imposto_icms', type: 'number', sampleValues: [5400.00, 1320.00], nullCount: 0, description: 'Valor do imposto ICMS' },
          { name: 'estado_uf', type: 'string', sampleValues: ['SP', 'RJ', 'MG', 'PR'], nullCount: 0, description: 'Estado (UF) de origem' },
          { name: 'status_nf', type: 'string', sampleValues: ['Emitida'], nullCount: 0, description: 'Situação da Nota Fiscal' }
        ],
        rows: parseSampleCsv(SAMPLE_202401_NFS_CSV),
        rawCsv: SAMPLE_202401_NFS_CSV
      }
    ],
    dictionaries: [
      { columnName: 'numero_nf', description: 'Número sequencial da Nota Fiscal emitida pelo fornecedor.', dataType: 'INTEGER' },
      { columnName: 'data_emissao', description: 'Data de emissão no formato AAAA-MM-DD.', dataType: 'DATE' },
      { columnName: 'cnpj_fornecedor', description: 'CNPJ do fornecedor com pontuação.', dataType: 'VARCHAR' },
      { columnName: 'razao_social_fornecedor', description: 'Nome oficial / Razão social da empresa fornecedora.', dataType: 'VARCHAR' },
      { columnName: 'categoria_produto', description: 'Categoria do bem ou serviço adquirido.', dataType: 'VARCHAR' },
      { columnName: 'descricao_produto', description: 'Detalhamento do item ou serviço contratado.', dataType: 'VARCHAR' },
      { columnName: 'quantidade', description: 'Quantidade de itens adquiridos.', dataType: 'INTEGER' },
      { columnName: 'valor_unitario', description: 'Preço em Reais (R$) por unidade de produto.', dataType: 'DECIMAL' },
      { columnName: 'valor_total', description: 'Valor total da nota fiscal em Reais (R$).', dataType: 'DECIMAL' },
      { columnName: 'imposto_icms', description: 'Valor destacado referente ao imposto estadual ICMS em R$.', dataType: 'DECIMAL' },
      { columnName: 'estado_uf', description: 'Sigla da Unidade Federativa (Estado) de origem.', dataType: 'VARCHAR' },
      { columnName: 'status_nf', description: 'Situação cadastral da nota fiscal.', dataType: 'VARCHAR' }
    ]
  };
}

export function getSampleDataset202505(): Dataset {
  return {
    id: 'dataset-202505-nfe',
    name: '202505_NFe.zip (Notas Fiscais Eletrônicas 2025)',
    uploadedAt: new Date().toISOString(),
    sourceZipName: '202505_NFe.zip',
    totalRows: 8,
    tables: [
      {
        id: 'tb-202505-nfe',
        filename: '202505_NFe.csv',
        tableName: 'nfe_202505',
        rowCount: 8,
        columns: [
          { name: 'chave_acesso', type: 'string', sampleValues: ['35250512345...'], nullCount: 0, description: 'Chave eletrônica de 44 dígitos' },
          { name: 'dt_emissao', type: 'date', sampleValues: ['2025-05-01'], nullCount: 0, description: 'Data de emissão da NFe' },
          { name: 'fornecedor_nome', type: 'string', sampleValues: ['Soluções em Nuvem CloudTech'], nullCount: 0, description: 'Razão social do emitente' },
          { name: 'fornecedor_cnpj', type: 'string', sampleValues: ['61.111.222/0001-33'], nullCount: 0, description: 'CNPJ do fornecedor' },
          { name: 'grupo_material', type: 'string', sampleValues: ['Softwares e Licenças', 'Obras e Instalações'], nullCount: 0, description: 'Agrupamento de despesa / Categoria' },
          { name: 'item_nome', type: 'string', sampleValues: ['Licença Microsoft 365 Business'], nullCount: 0, description: 'Descrição comercial do produto' },
          { name: 'qtd', type: 'number', sampleValues: [120, 500, 1], nullCount: 0, description: 'Quantidade faturada' },
          { name: 'prc_unit', type: 'number', sampleValues: [85.00, 28.00], nullCount: 0, description: 'Preço unitário líquido' },
          { name: 'vlr_bruto', type: 'number', sampleValues: [10200.00, 14000.00], nullCount: 0, description: 'Valor bruto da NF' },
          { name: 'desconto', type: 'number', sampleValues: [200.00, 1000.00], nullCount: 0, description: 'Desconto concedido' },
          { name: 'vlr_liquido', type: 'number', sampleValues: [10000.00, 13000.00], nullCount: 0, description: 'Valor líquido a pagar' },
          { name: 'uf_destino', type: 'string', sampleValues: ['SP', 'RJ', 'MG'], nullCount: 0, description: 'Estado de destino' }
        ],
        rows: parseSampleCsv(SAMPLE_202505_NFE_CSV),
        rawCsv: SAMPLE_202505_NFE_CSV
      }
    ],
    dictionaries: [
      { columnName: 'chave_acesso', description: 'Chave eletrônica de 44 dígitos da Nota Fiscal Eletrônica.', dataType: 'VARCHAR' },
      { columnName: 'dt_emissao', description: 'Data de emissão da NFe (AAAA-MM-DD).', dataType: 'DATE' },
      { columnName: 'fornecedor_nome', description: 'Razão social do emitente / fornecedor.', dataType: 'VARCHAR' },
      { columnName: 'fornecedor_cnpj', description: 'CNPJ do fornecedor.', dataType: 'VARCHAR' },
      { columnName: 'grupo_material', description: 'Agrupamento de despesa / Categoria.', dataType: 'VARCHAR' },
      { columnName: 'item_nome', description: 'Descrição comercial do produto/serviço.', dataType: 'VARCHAR' },
      { columnName: 'qtd', description: 'Quantidade faturada.', dataType: 'INTEGER' },
      { columnName: 'prc_unit', description: 'Preço unitário líquido.', dataType: 'DECIMAL' },
      { columnName: 'vlr_bruto', description: 'Valor bruto da nota fiscal.', dataType: 'DECIMAL' },
      { columnName: 'desconto', description: 'Desconto concedido pelo fornecedor.', dataType: 'DECIMAL' },
      { columnName: 'vlr_liquido', description: 'Valor líquido a pagar (vlr_bruto - desconto).', dataType: 'DECIMAL' },
      { columnName: 'uf_destino', description: 'Estado de destino das mercadorias.', dataType: 'VARCHAR' }
    ]
  };
}

function parseSampleCsv(rawCsv: string): Record<string, any>[] {
  const lines = rawCsv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',');
    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      let val: any = values[idx] ? values[idx].trim() : '';
      if (!isNaN(Number(val)) && val !== '') {
        val = Number(val);
      }
      rowObj[h] = val;
    });
    rows.push(rowObj);
  }
  return rows;
}
