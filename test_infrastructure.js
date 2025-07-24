// ============================================================================
// TESTE DE INFRAESTRUTURA SGM - MÓDULOS IMPLEMENTADOS
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_TIMEOUT = 5000;

// Configurar axios
axios.defaults.timeout = TEST_TIMEOUT;

class SGMInfrastructureTest {
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

  async testHealthCheck() {
    this.log('\n🏥 TESTANDO HEALTH CHECK');
    return await this.testEndpoint('Health Check', 'GET', '/health');
  }

  async testEquipamentos() {
    this.log('\n⚙️ TESTANDO MÓDULO EQUIPAMENTOS');
    
    const tests = [
      // Listar equipamentos (vazio inicialmente)
      this.testEndpoint('Listar Equipamentos', 'GET', '/equipamentos'),
      
      // Listar tipos de equipamentos
      this.testEndpoint('Tipos de Equipamentos', 'GET', '/equipamentos/tipos/lista'),
      
      // Listar status de equipamentos
      this.testEndpoint('Status de Equipamentos', 'GET', '/equipamentos/status/lista'),
      
      // Criar equipamento de teste
      this.testEndpoint('Criar Equipamento', 'POST', '/equipamentos', {
        numero_serie: 'TEST001',
        tag_equipamento: 'EQ-TEST-001',
        nome_equipamento: 'Equipamento de Teste',
        fabricante: 'Teste Inc',
        tipo_equipamento: 'Transmissor_Pressao',
        status_atual: 'Estoque'
      }, 201),
      
      // Buscar equipamento criado
      this.testEndpoint('Buscar Equipamento ID 1', 'GET', '/equipamentos/1')
    ];

    return await Promise.all(tests);
  }

  async testPolos() {
    this.log('\n🏭 TESTANDO MÓDULO POLOS');
    
    const tests = [
      // Listar polos (vazio inicialmente)
      this.testEndpoint('Listar Polos', 'GET', '/polos'),
      
      // Listar status de polos
      this.testEndpoint('Status de Polos', 'GET', '/polos/status/lista'),
      
      // Criar polo de teste
      this.testEndpoint('Criar Polo', 'POST', '/polos', {
        nome_polo: 'Polo de Teste',
        codigo_polo: 'TEST001',
        localizacao: 'Local de Teste',
        status_polo: 'Ativo'
      }, 201),
      
      // Buscar polo criado
      this.testEndpoint('Buscar Polo ID 1', 'GET', '/polos/1')
    ];

    return await Promise.all(tests);
  }

  async testInstalacoes() {
    this.log('\n🏗️ TESTANDO MÓDULO INSTALAÇÕES');
    
    const tests = [
      // Listar instalações (vazio inicialmente)
      this.testEndpoint('Listar Instalações', 'GET', '/instalacoes'),
      
      // Listar tipos de instalações
      this.testEndpoint('Tipos de Instalações', 'GET', '/instalacoes/tipos/lista'),
      
      // Listar status de instalações
      this.testEndpoint('Status de Instalações', 'GET', '/instalacoes/status/lista'),
      
      // Criar instalação de teste (usando polo_id = 1 criado anteriormente)
      this.testEndpoint('Criar Instalação', 'POST', '/instalacoes', {
        polo_id: 1,
        nome_instalacao: 'Instalação de Teste',
        codigo_instalacao: 'INST-TEST-001',
        tipo_instalacao: 'UPGN',
        status_instalacao: 'Operacional'
      }, 201),
      
      // Buscar instalação criada
      this.testEndpoint('Buscar Instalação ID 1', 'GET', '/instalacoes/1'),
      
      // Listar instalações por polo
      this.testEndpoint('Instalações do Polo 1', 'GET', '/instalacoes/polo/1')
    ];

    return await Promise.all(tests);
  }

  async testPontosMedicao() {
    this.log('\n📊 TESTANDO MÓDULO PONTOS DE MEDIÇÃO');
    
    const tests = [
      // Listar pontos de medição (vazio inicialmente)
      this.testEndpoint('Listar Pontos de Medição', 'GET', '/pontos-medicao'),
      
      // Listar tipos de medidores
      this.testEndpoint('Tipos de Medidores', 'GET', '/pontos-medicao/tipos/lista'),
      
      // Listar fluidos
      this.testEndpoint('Fluidos Medidos', 'GET', '/pontos-medicao/fluidos/lista'),
      
      // Listar status de pontos
      this.testEndpoint('Status de Pontos', 'GET', '/pontos-medicao/status/lista'),
      
      // Listar classificações
      this.testEndpoint('Classificações', 'GET', '/pontos-medicao/classificacao/lista'),
      
      // Criar ponto de medição de teste
      this.testEndpoint('Criar Ponto de Medição', 'POST', '/pontos-medicao', {
        polo_id: 1,
        instalacao_id: 1,
        tag_ponto: 'PM-TEST-001',
        nome_ponto: 'Ponto de Medição de Teste',
        tipo_medidor_primario: 'Placa_Orificio',
        fluido_medido: 'Gas_Natural',
        classificacao: 'Operacional',
        status_ponto: 'Ativo'
      }, 201),
      
      // Buscar ponto criado
      this.testEndpoint('Buscar Ponto ID 1', 'GET', '/pontos-medicao/1'),
      
      // Listar pontos por instalação
      this.testEndpoint('Pontos da Instalação 1', 'GET', '/pontos-medicao/instalacao/1')
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
    console.log('📊 RELATÓRIO DE TESTES - INFRAESTRUTURA SGM');
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
    const modules = ['Health', 'Equipamentos', 'Polos', 'Instalações', 'Pontos'];
    modules.forEach(module => {
      const moduleTests = this.results.filter(r => r.name.includes(module) || 
        (module === 'Health' && r.name.includes('Health')) ||
        (module === 'Equipamentos' && r.name.includes('Equipamento')) ||
        (module === 'Polos' && r.name.includes('Polo')) ||
        (module === 'Instalações' && r.name.includes('Instalação')) ||
        (module === 'Pontos' && r.name.includes('Ponto'))
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
    this.log('🚀 Iniciando testes de infraestrutura SGM...\n');

    try {
      // Executar todos os testes em sequência
      await this.testHealthCheck();
      await this.testEquipamentos();
      await this.testPolos();
      await this.testInstalacoes();
      await this.testPontosMedicao();

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
  const tester = new SGMInfrastructureTest();
  
  tester.runAllTests()
    .then(report => {
      process.exit(report.successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = SGMInfrastructureTest;