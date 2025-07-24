// TESTE COMPLETO DAS APIs SGM
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Lista de endpoints para testar
const endpoints = [
  // Core APIs
  { name: 'Health Check', url: '/health', method: 'GET' },
  { name: 'Info Sistema', url: '/info', method: 'GET' },
  
  // Módulos Básicos
  { name: 'Equipamentos', url: '/equipamentos', method: 'GET' },
  { name: 'Polos', url: '/polos', method: 'GET' },
  { name: 'Instalações', url: '/instalacoes', method: 'GET' },
  { name: 'Pontos Medição', url: '/pontos-medicao', method: 'GET' },
  
  // Módulos Especializados
  { name: 'Placas Orifício', url: '/placas-orificio', method: 'GET' },
  { name: 'Incertezas', url: '/incertezas', method: 'GET' },
  { name: 'Trechos Retos', url: '/trechos-retos', method: 'GET' },
  
  // Módulos Avançados
  { name: 'Testes de Poços', url: '/testes-pocos', method: 'GET' },
  { name: 'Análises FQ', url: '/analises-quimicas', method: 'GET' },
  
  // Módulos de Gestão
  { name: 'Estoque', url: '/estoque', method: 'GET' },
  { name: 'Movimentação Estoque', url: '/movimentacao-estoque', method: 'GET' },
  { name: 'Controle Mudanças', url: '/controle-mudancas', method: 'GET' },
  
  // Sistema de Configurações
  { name: 'Configurações Health', url: '/configuracoes/health', method: 'GET' },
  { name: 'Configurações Lista', url: '/configuracoes', method: 'GET' },
  { name: 'Unidades Medida', url: '/configuracoes/unidades-medida', method: 'GET' },
  { name: 'Perfis Config', url: '/configuracoes/perfis', method: 'GET' }
];

async function testAPI(endpoint) {
  try {
    const response = await axios({
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      timeout: 5000
    });
    
    return {
      name: endpoint.name,
      status: 'SUCCESS',
      statusCode: response.status,
      hasData: response.data ? (Array.isArray(response.data.data) ? response.data.data.length : 'object') : 'no data'
    };
    
  } catch (error) {
    return {
      name: endpoint.name,
      status: 'ERROR',
      statusCode: error.response?.status || 'TIMEOUT',
      error: error.response?.data?.message || error.message
    };
  }
}

async function runTests() {
  console.log('🚀 INICIANDO TESTE COMPLETO DAS APIs SGM');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of endpoints) {
    process.stdout.write(`Testando ${endpoint.name}... `);
    const result = await testAPI(endpoint);
    results.push(result);
    
    if (result.status === 'SUCCESS') {
      console.log(`✅ OK (${result.statusCode}) - ${result.hasData} registros`);
    } else {
      console.log(`❌ ERRO (${result.statusCode}) - ${result.error}`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'ERROR');
  
  console.log(`✅ APIs Funcionando: ${successful.length}/${results.length}`);
  console.log(`❌ APIs com Erro: ${failed.length}/${results.length}`);
  console.log(`📈 Taxa de Sucesso: ${((successful.length / results.length) * 100).toFixed(1)}%`);
  
  if (failed.length > 0) {
    console.log('\n❌ APIS COM PROBLEMAS:');
    failed.forEach(f => {
      console.log(`   • ${f.name}: ${f.error}`);
    });
  }
  
  console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
  process.exit(0);
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro ao executar testes:', error.message);
  process.exit(1);
});

