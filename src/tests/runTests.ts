import { runAllUnitTests } from './unitTests';

async function main() {
  console.log('🧪 Executando Suíte de Testes Unitários para Lumina CSV...\n');
  const summary = await runAllUnitTests();

  summary.tests.forEach(test => {
    const icon = test.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon} [${test.category}] ${test.name} (${test.durationMs}ms)`);
    if (test.error) {
      console.error(`   └─ Erro: ${test.error}`);
    }
  });

  console.log(`\n--------------------------------------------------`);
  console.log(`Resumo dos Testes: ${summary.passed}/${summary.total} passaram em ${summary.totalDurationMs}ms.`);
  console.log(`--------------------------------------------------`);

  if (summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Falha na execução dos testes:', err);
  process.exit(1);
});
