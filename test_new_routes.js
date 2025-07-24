// ============================================================================
// TESTE DAS NOVAS ROUTES - PLACAS DE ORIFÍCIO E INCERTEZAS
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';
const TEST_TIMEOUT = 5000;

// Configurar axios
axios.defaults.timeout = TEST_TIMEOUT;

class NewRoutesTest {
  constructor() {
    this.results = [];
    this.startTime = new Date();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testEndpoint(name, method, url, data = null, expectedStatus = 200) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${url}`,
        timeout: TEST_TIMEOUT
      };

      if (data) {
        config.data = data;
      }

      const startTime = Date.now();
      const response = await axios(config);
      const duration = Date.now() - startTime;

      const success = response.status === expectedStatus;
      
      this.results.push({
        name,
        method,
        url,
        status: response.status,
        expected: expectedStatus,
        success,
        duration,
        responseSize: JSON.stringify(response.data).length
      });

      this.log(`${name}: ${method} ${url} - ${response.status} (${duration}ms)`, success ? 'success' : 'error');
      
      return { success, response, duration };

    } catch (error) {
      this.results.push({
        name,
        method,
        url,
        status: error.response?.status || 'ERROR',
        expected: expectedStatus,
        success: false,
        duration: 0,
        error: error.message
      });

      this.log(`${name}: ${method} ${url} - FALHOU: ${error.message}`, 'error');
      return { success: false, error, duration: 0 };
    }
  }

  async testPlacasOrificio() {
    this.log('\n🔧 TESTANDO MÓDULO PLACAS DE ORIFÍCIO');
    
    const tests = [
      // Endpoints básicos
      this.testEndpoint('Listar Placas', 'GET', '/placas-orificio'),
      this.testEndpoint('Materiais Lista', 'GET', '/placas-orificio/materiais/lista'),
      this.testEndpoint('Tomadas Lista', 'GET', '/placas-orificio/tomadas/lista'),
      this.testEndpoint('Status Lista', 'GET', '/placas-orificio/status/lista'),
      
      // Criar placa de teste
      this.testEndpoint('Criar Placa', 'POST', '/placas-orificio', {
        tag_ponto: 'PM-TEST-001',
        numero_serie: 'PO-TEST-001',
        fabricante: 'Fabricante Teste',
        material_placa: 'Aço Inoxidável 316',
        diametro_interno_montante: 100.0,
        diametro_furo: 60.0,
        tipo_tomada_pressao: 'Corner',
        status_placa: 'Ativa'
      }, 201),
      
      // Buscar placa criada
      this.testEndpoint('Buscar Placa ID 1', 'GET', '/placas-orificio/1'),
      
      // Calcular beta
      this.testEndpoint('Calcular Beta', 'GET', '/placas-orificio/1/calcular-beta'),
      
      // Buscar por ponto
      this.testEndpoint('Placas por Ponto', 'GET', '/placas-orificio/ponto/PM-TEST-001')
    ];

    return await Promise.all(tests);
  }

  async testIncertezas() {
    this.log('\n📊 TESTANDO MÓDULO INCERTEZAS');
    
    const tests = [
      // Endpoints básicos
      this.testEndpoint('Listar Incertezas', 'GET', '/incertezas'),
      this.testEndpoint('Tipos Lista', 'GET', '/incertezas/tipos/lista'),
      this.testEndpoint('Fontes Lista', 'GET', '/incertezas/fontes/lista'),
      this.testEndpoint('Distribuições Lista', 'GET', '/incertezas/distribuicoes/lista'),
      this.testEndpoint('Métodos Lista', 'GET', '/incertezas/metodos/lista'),
      this.testEndpoint('Status Lista', 'GET', '/incertezas/status/lista'),
      
      // Criar incertezas de teste
      this.testEndpoint('Criar Incerteza 1', 'POST', '/incertezas', {
        tag_ponto: 'PM-TEST-001',
        tipo_incerteza: 'Tipo B',
        fonte_incerteza: 'Equipamento de Medição',
        descricao: 'Incerteza do transmissor de pressão',
        valor_incerteza: 0.05,
        unidade_incerteza: '%',
        metodo_calculo: 'GUM',
        coeficiente_sensibilidade: 1.0,
        status_incerteza: 'Ativa'
      }, 201),
      
      this.testEndpoint('Criar Incerteza 2', 'POST', '/incertezas', {
        tag_ponto: 'PM-TEST-001',
        tipo_incerteza: 'Tipo B',
        fonte_incerteza: 'Condições Ambientais',
        descricao: 'Incerteza por variação de temperatura',
        valor_incerteza: 0.02,
        unidade_incerteza: '%',
        metodo_calculo: 'GUM',
        coeficiente_sensibilidade: 0.8,
        status_incerteza: 'Ativa'
      }, 201),
      
      // Buscar incerteza criada
      this.testEndpoint('Buscar Incerteza ID 1', 'GET', '/incertezas/1'),
      
      // Incertezas por ponto
      this.testEndpoint('Incertezas por Ponto', 'GET', '/incertezas/ponto/PM-TEST-001'),
      
      // Calcular incerteza combinada
      this.testEndpoint('Calcular Combinada', 'POST', '/incertezas/calcular-combinada', {
        tag_ponto: 'PM-TEST-001',
        metodo: 'GUM'
      }),
      
      // Relatório detalhado
      this.testEndpoint('Relatório Ponto', 'GET', '/incertezas/relatorio/PM-TEST-001')
    ];

    return await Promise.all(tests);
  }

  generateReport() {
    const endTime = new Date();
    const totalDuration = endTime - this.startTime;
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE TESTES - NOVAS ROUTES');
    console.log('='.repeat(80));
    console.log(`⏱️  Duração total: ${totalDuration}ms`);
    console.log(`📋 Total de testes: ${total}`);
    console.log(`✅ Sucessos: ${successful}`);
    console.log(`❌ Falhas: ${failed}`);
    console.log(`📊 Taxa de sucesso: ${successRate}%`);
    console.log('='.repeat(80));

    if (failed > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      this.results.filter(r => !r.success).forEach(test => {
        console.log(`   • ${test.name}: ${test.method} ${test.url} - ${test.status} (esperado: ${test.expected})`);
        if (test.error) {
          console.log(`     Erro: ${test.error}`);
        }
      });
    }

    console.log('\n📈 RESUMO POR MÓDULO:');
    const modules = ['Placas', 'Incertezas'];
    modules.forEach(module => {
      const moduleTests = this.results.filter(r => r.name.includes(module) || 
        (module === 'Placas' && r.name.includes('Placa')) ||
        (module === 'Incertezas' && r.name.includes('Incerteza'))
      );
      
      if (moduleTests.length > 0) {
        const moduleSuccessful = moduleTests.filter(t => t.success).length;
        const moduleRate = ((moduleSuccessful / moduleTests.length) * 100).toFixed(1);
        console.log(`   • ${module}: ${moduleSuccessful}/${moduleTests.length} (${moduleRate}%)`);
      }
    });

    return { successful, failed, total, successRate: parseFloat(successRate) };
  }

  async runAllTests() {
    this.log('🚀 Iniciando testes das novas routes...\n');

    try {
      // Executar todos os testes em sequência
      await this.testPlacasOrificio();
      await this.testIncertezas();

      // Gerar relatório final
      const report = this.generateReport();
      
      this.log(`\n🎉 Testes concluídos! Taxa de sucesso: ${report.successRate}%`, 
        report.successRate >= 80 ? 'success' : 'error');

      return report;

    } catch (error) {
      this.log(`💥 Erro durante execução dos testes: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new NewRoutesTest();
  
  tester.runAllTests()
    .then(report => {
      process.exit(report.successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = NewRoutesTest;