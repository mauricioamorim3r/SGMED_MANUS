// ============================================================================
// TESTE RÁPIDO DOS NOVOS MÓDULOS - SGM
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api';

async function testNewModules() {
  console.log('🚀 Testando novos módulos implementados...\n');
  
  const tests = [
    // Trechos Retos
    { name: '🔧 Trechos Retos - Listar', url: '/trechos-retos' },
    { name: '🔧 Trechos Retos - Normas', url: '/trechos-retos/normas/lista' },
    { name: '🔧 Trechos Retos - Perturbações', url: '/trechos-retos/perturbacoes/lista' },
    { name: '🔧 Trechos Retos - Status', url: '/trechos-retos/status/lista' },
    
    // Testes de Poços
    { name: '🛢️ Testes Poços - Listar', url: '/testes-pocos' },
    { name: '🛢️ Testes Poços - Tipos', url: '/testes-pocos/tipos/lista' },
    { name: '🛢️ Testes Poços - Status', url: '/testes-pocos/status/lista' },
    
    // Análises Químicas
    { name: '🧪 Análises Químicas - Listar', url: '/analises-quimicas' },
    { name: '🧪 Análises Químicas - Tipos', url: '/analises-quimicas/tipos/lista' },
    { name: '🧪 Análises Químicas - Produtos', url: '/analises-quimicas/produtos/lista' },
    { name: '🧪 Análises Químicas - Métodos', url: '/analises-quimicas/metodos/lista' }
  ];
  
  let successful = 0;
  const total = tests.length;
  
  for (const test of tests) {
    try {
      const response = await axios.get(`${BASE_URL}${test.url}`, { timeout: 3000 });
      
      if (response.status === 200 && response.data.success) {
        console.log(`✅ ${test.name}: OK`);
        successful++;
      } else {
        console.log(`❌ ${test.name}: Resposta inesperada`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
  
  const successRate = ((successful / total) * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resultado: ${successful}/${total} testes passaram (${successRate}%)`);
  console.log('='.repeat(50));
  
  if (successRate >= 80) {
    console.log('🎉 Novos módulos funcionando corretamente!');
  } else {
    console.log('⚠️ Alguns módulos precisam de atenção.');
  }
  
  return { successful, total, successRate: parseFloat(successRate) };
}

// Executar teste
testNewModules()
  .then(result => {
    process.exit(result.successRate >= 80 ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Erro:', error.message);
    process.exit(1);
  });