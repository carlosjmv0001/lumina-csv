# Lumina CSV 📊🤖

Uma plataforma completa de análise de dados e **Business Intelligence em linguagem natural**. O sistema permite realizar upload de múltiplos arquivos CSV (ou pacotes compactados em `.zip`), inspecionar e catalogar automaticamente seus esquemas de dados, e fazer perguntas em português para obter respostas estruturadas, relatórios sintetizados por IA, cartões de KPI e gráficos dinâmicos.

---

## 🛠️ 1. Frameworks e Tecnologias Escolhidas

O projeto adota uma arquitetura **Full-Stack Híbrida** desenvolvida em TypeScript end-to-end:

### **Frontend**
- **React 19:** Biblioteca principal de UI para componentes declarativos e reativos.
- **Vite:** Bundler de alta performance e servidor de desenvolvimento instantâneo.
- **Tailwind CSS v4:** Framework utilitário para estilização responsiva, acessível e sem arquivos CSS adicionais.
- **Recharts:** Biblioteca de visualização de dados para geração de gráficos adaptativos (Barras, Linhas, Área e Pizza).
- **Lucide React & Motion:** Biblioteca de ícones modernos e animações de transição suave entre abas.

### **Backend & Motor Analítico**
- **Node.js + Express:** Servidor backend para disponibilizar APIs REST e servir o cliente estático em produção.
- **AlaSQL:** Motor de banco de dados SQL em memória, permitindo executar queries relacionais complexas (`JOIN`, `GROUP BY`, `ORDER BY`, agregações) diretamente sobre os dados em memória.
- **PapaParse & AdmZip:** Parsers e descompactadores para leitura eficiente de arquivos `.csv` (com detecção automática de encodificação UTF-8/ISO) e extratores de arquivos `.zip`.
- **OpenRouter SDK / LangChain:** Integração para chamadas de LLMs avançados (modelos gratuitos e pagos).

---

## 🏗️ 2. Arquitetura da Solução

A aplicação é estruturada como uma arquitetura full-stack desacoplada e isolada:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           NAVEGADOR DO USUÁRIO                          │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌─────────────────┐  │
│  │ Interface A: Upload  │  │ Interface B: Query │  │ Painel Arquitet.│  │
│  └──────────┬───────────┘  └─────────┬──────────┘  └────────┬────────┘  │
└─────────────┼────────────────────────┼──────────────────────┼───────────┘
              │                        │                      │
              ▼                        ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENTE ORQUESTRADOR (`orchestrator.ts`)               │
│                                                                         │
│  ┌──────────────────┐   ┌─────────────────────┐   ┌──────────────────┐  │
│  │ 1. Schema Mapper │──►│ 2. SQL Generator    │──►│ 3. Exec. AlaSQL  │  │
│  │    & Cataloger   │   │    (LLM / Rule Engine)│   │    (In-Memory)   │  │
│  └──────────────────┘   └─────────────────────┘   └─────────┬────────┘  │
│                                                             │           │
│  ┌──────────────────────────────────────────────────────────▼────────┐  │
│  │ 4. Visual Synthesis Engine (KPIs, Charts & Exec Summary)          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### **Caraterísticas da Arquitetura:**
1. **Isolamento e Privacidade em Memória:** Os dados dos CSVs/ZIPs não são salvos em bancos de dados persistentes no disco. Todo o ciclo de vida dos dados reside na memória da sessão (`AlaSQL`), garantindo privacidade total.
2. **Execução Híbrida de IA:** O backend tenta realizar chamadas via OpenRouter. Caso não haja conexão ou chave disponível, entra em ação o motor determinístico baseado em regras NLP, tornando a aplicação **100% funcional offline**.
3. **Servidor Unificado na Porta 3000:** Produz um único pacote compilado em `dist/server.cjs` via `esbuild`, permitindo implantação simples em contêineres Docker/Cloud Run.

---

## 🤖 3. Descrição dos Agentes Desenvolvidos

O núcleo de inteligência da aplicação é composto por sub-agentes integrados no orquestrador (`orchestrator.ts`):

1. **Agente Mapeador de Esquema (`Schema Mapper Agent`):**
   - **Função:** Inspeciona as colunas, infere tipos de dados (texto, número, data, moeda), gera estatísticas descritivas (mínimo, máximo, contagem, amostra) e constrói o dicionário de dados relacional.
2. **Agente Gerador de SQL (`SQL Generator Agent`):**
   - **Função:** Converte a pergunta em linguagem natural em uma consulta SQL válida.
   - **Toma de Decisão:** Tenta inicialmente a geração via LLM no OpenRouter. Se falhar ou estiver sem chave, utiliza o **Motor Determinístico Baseado em Regras e Heurísticas NLP** que analisa intenções de agregação (`SUM`, `AVG`, `COUNT`), colunas e agrupamentos `GROUP BY`.
3. **Agente Executor de Consultas (`Query Execution Agent`):**
   - **Função:** Sanitiza a query gerada (remove blocos Markdown e caracteres inválidos) e a executa diretamente no banco em memória `AlaSQL`, tratando erros e formatando os resultados.
4. **Agente Sintetizador de Resposta & KPIs (`Synthesis Agent`):**
   - **Função:** Analisa a tabela resultante para selecionar autonomamente os indicadores-chave de desempenho (KPIs), escolher o tipo de gráfico mais adequado (`line`, `bar`, `pie`) e redigir a resposta textual explicativa.

---

## 🔄 4. Fluxo de Funcionamento da Aplicação

O fluxo de uso da aplicação é dividido em 4 etapas sequenciais e intuitivas:

```text
[ 1. Upload CSV / ZIP ] ──► [ 2. Inspeção de Dados ] ──► [ 3. Consulta em Linguagem Natural ] ──► [ 4. Resposta, KPIs & Gráficos ]
```

1. **Upload de Dados (Interface A):**
   - O usuário arrasta ou seleciona um ou mais arquivos `.csv` ou um arquivo compactado `.zip`.
   - O sistema descompacta o arquivo `.zip`, parseia as tabelas com o `PapaParse`, trata codificações (UTF-8 / ISO) e formata valores monetários brasileiros (`R$`).
2. **Inspeção do Dataset:**
   - As tabelas são exibidas em guias interativas com estatísticas descritivas e contadores de registros.
3. **Formulação de Pergunta (Interface B):**
   - O usuário digita uma pergunta em português (ex: *"Qual o total de vendas por estado?"* ou *"Qual a média de idade dos clientes?"*).
4. **Processamento & Apresentação de Resultados:**
   - O agente exibe o progresso em tempo real das 4 etapas de raciocínio.
   - A tela renderiza o resultado completo contendo:
     - **Relatório Executivo Textual:** Resposta direta e explicativa.
     - **Cartões de KPIs:** Métricas de destaque geradas automaticamente.
     - **Gráficos Dinâmicos:** Visualização em Recharts (Linhas, Barras ou Pizza).
     - **Tabela de Dados Brutos & Botão de Exportação SQL/CSV.**

---

## 🚀 Principais Funcionalidades

- **📁 Ingestão Versátil de Dados (Interface A):**
  - Upload drag-and-drop de arquivos `.csv` e arquivos compactados `.zip`.
  - Extração automática de múltiplos arquivos CSV contidos em um `.zip`.
  - Tratamento inteligente de encodificação (UTF-8 / ISO-8859-1), limpeza de cabeçalhos e formatação de números e moedas brasileiras (`R$`, separadores de milhares e decimais).
  - Pré-visualização de tabelas, contagem de registros, tipos de colunas e estatísticas descritivas.

- **🤖 Agente Orquestrador de Consultas (Interface B):**
  - **Tradução em Linguagem Natural para SQL:** Transforma perguntas do usuário em consultas SQL otimizadas.
  - **Suporte ao OpenRouter & Fallback Determinístico:** Utiliza modelos via OpenRouter (`OPENROUTER_API_KEY`) para geração de SQL e síntese textual. Caso nenhuma chave seja fornecida ou haja falha na API, o motor de regras determinístico gera e executa a consulta automaticamente de forma 100% offline.
  - **Execução SQL em Memória (AlaSQL):** Motor SQL alimentado pela biblioteca `AlaSQL`, permitindo `SELECT`, `JOIN`, `GROUP BY`, `ORDER BY`, agregações (`SUM`, `AVG`, `COUNT`, `MAX`, `MIN`) e filtros dinâmicos diretamente nas tabelas carregadas.

- **📈 Visualização Dinâmica de Dados & KPIs:**
  - Cartões de Indicadores-Chave de Desempenho (KPIs) gerados automaticamente.
  - Gráficos interativos adaptativos usando **Recharts** (Barras, Linhas, Área e Pizza).
  - Tabela interativa com os resultados brutos da consulta e exportação de dados.

- **🏗️ Visualização de Arquitetura & Testes:**
  - **Painel de Arquitetura do Agente:** Exibe visualmente o fluxo de decisões do pipeline orquestrado.
  - **Suíte de Testes Unitários Integrada:** Permite rodar e visualizar testes automatizados do parser CSV, do motor AlaSQL e do pipeline de agentes diretamente na interface gráfica.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** & **TypeScript**
- **Tailwind CSS v4** (estilização rápida e responsiva)
- **Lucide React** (ícones de interface)
- **Motion** (animações e transições suaves)
- **Recharts** (gráficos dinâmicos e interativos)

### Backend & Processamento de Dados
- **Node.js** com **Express**
- **AlaSQL** (motor SQL em memória)
- **PapaParse** (parser de arquivos CSV)
- **AdmZip** (descompactação de arquivos `.zip`)
- **LangChain / OpenRouter SDK** (orquestração de IA e LLMs)
- **tsx** & **esbuild** (compilação e execução híbrida em dev e produção)

---

## 📁 Estrutura do Projeto

```text
├── src/
│   ├── agents/
│   │   └── orchestrator.ts       # Agente orquestrador (Mapeamento, SQL Gen, Execução e Síntese)
│   ├── components/
│   │   ├── Header.tsx            # Barra de navegação e seletor de modelos/chaves
│   │   ├── InterfaceAUpload.tsx  # Interface para upload de CSV/ZIP e inspeção de dados
│   │   ├── InterfaceBQuery.tsx   # Interface de consulta em linguagem natural, KPIs e gráficos
│   │   ├── AgentArchitectureView.tsx # Diagrama explicativo da arquitetura do agente
│   │   └── UnitTestView.tsx      # Executor e visualizador de testes unitários na UI
│   ├── data/                     # Datasets de exemplo/demo incorporados
│   ├── tests/                    # Suíte de testes automatizados do motor e pipeline
│   ├── utils/
│   │   ├── csvParser.ts          # Utilitários de parsing, suporte a ZIP e sanitização
│   │   └── sqlEngine.ts          # Registro de tabelas no AlaSQL e execução de SQL
│   ├── App.tsx                   # Componente principal e gerenciamento de abas
│   ├── main.tsx                  # Ponto de entrada do React
│   └── types.ts                  # Definições de tipos e interfaces TypeScript
├── server.ts                     # Servidor Express híbrido (API e middleware Vite/estáticos)
├── .env.example                  # Modelo de variáveis de ambiente
├── metadata.json                 # Metadados do applet
├── package.json                  # Dependências e scripts do projeto
└── vite.config.ts                # Configuração do Vite
```

---

## ⚙️ Pré-requisitos e Instalação

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (incluso com o Node.js)

### Passos para execução local

1. **Clonar o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd lumina-csv
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` conforme necessário:
   ```env
   # Chave opcional do OpenRouter para modelos LLM gratuitos ou pagos (sk-or-...)
   OPENROUTER_API_KEY="sua_chave_openrouter_aqui"

   # URL da aplicação (opcional)
   APP_URL="http://localhost:3000"
   ```

4. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador através de: `http://localhost:3000`

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, você encontrará os seguintes scripts:

- `npm run dev` - Inicia o servidor backend Express e o middleware de dev do Vite na porta 3000.
- `npm run build` - Executa a compilação do frontend estático e o empacotamento do servidor backend em `dist/server.cjs` via `esbuild`.
- `npm run start` - Inicia a aplicação compilada em ambiente de produção (`node dist/server.cjs`).
- `npm run lint` - Executa a verificação estática de tipos do TypeScript (`tsc --noEmit`).
- `npm run test` - Executa a suíte de testes unitários do motor SQL e dos agentes via `tsx`.

---

## 🔒 Segurança e Privacidade de Dados

- **Processamento em Memória:** Os dados dos arquivos CSV/ZIP carregados são armazenados e consultados em memória durante a sessão.
- **Isolamento de Chaves de API:** As chaves de API do OpenRouter e do ambiente permanecem seguras no servidor ou salvas localmente no navegador caso inseridas via modal opcional pelo usuário.

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para utilizar, modificar e distribuir.
