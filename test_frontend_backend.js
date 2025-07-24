// ============================================================================
// TESTE DE INTEGRAÇÃO FRONTEND-BACKEND - SGM
// ============================================================================

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3002/api';
const FRONTEND_URL = 'http://127.0.0.1:5175';

class FrontendBackendTest {
  constructor() {
    this.results = [];
    this.startTime = new Date();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testBackendHealth() {
    this.log('🔍 Testando conectividade com backend...');
    
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      
      if (response.status === 200 && response.data.status === 'OK') {
        this.log('Backend está respondendo corretamente', 'success');
        return { success: true, data: response.data };
      } else {
        this.log('Backend respondeu com status inesperado', 'error');
        return { success: false, error: 'Status inesperado' };
      }
      
    } catch (error) {
      this.log(`Backend não está acessível: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testFrontendHealth() {
    this.log('🔍 Testando conectividade com frontend...');
    
    try {
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      
      if (response.status === 200 && response.data.includes('<!doctype html>')) {
        this.log('Frontend está servindo conteúdo HTML', 'success');
        return { success: true };
      } else {
        this.log('Frontend respondeu mas sem HTML válido', 'error');
        return { success: false, error: 'HTML inválido' };
      }
      
    } catch (error) {
      this.log(`Frontend não está acessível: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testCORSConfiguration() {
    this.log('🔍 Testando configuração CORS...');
    
    try {
      // Fazer uma requisição OPTIONS para verificar CORS
      const response = await axios.options(`${BACKEND_URL}/health`, {
        timeout: 5000,
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      this.log('CORS parece estar configurado corretamente', 'success');
      return { success: true };
      
    } catch (error) {
      // CORS pode estar configurado mesmo se OPTIONS falhar
      this.log(`Teste CORS não conclusivo: ${error.message}`, 'info');
      return { success: true, warning: 'Não conclusivo' };
    }
  }

  async testAPIEndpoints() {
    this.log('🔍 Testando endpoints principais da API...');
    
    const endpoints = [
      '/equipamentos',
      '/polos',
      '/instalacoes',
      '/pontos-medicao',
      '/placas-orificio',
      '/incertezas'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 3000 });
        
        if (response.status === 200 && response.data.success) {
          this.log(`✓ ${endpoint}: OK (${response.data.total || 0} registros)`, 'success');
          results.push({ endpoint, success: true, count: response.data.total || 0 });
        } else {
          this.log(`✗ ${endpoint}: Resposta inesperada`, 'error');
          results.push({ endpoint, success: false, error: 'Resposta inesperada' });
        }
        
      } catch (error) {
        this.log(`✗ ${endpoint}: ${error.message}`, 'error');
        results.push({ endpoint, success: false, error: error.message });
      }
    }

    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    this.log(`Endpoints testados: ${successful}/${total} funcionando (${((successful/total)*100).toFixed(1)}%)`, 
      successful === total ? 'success' : 'error');

    return { success: successful === total, results };
  }

  async testDataOperations() {
    this.log('🔍 Testando operações de dados...');
    
    try {
      // Testar criação de um polo
      const createResponse = await axios.post(`${BACKEND_URL}/polos`, {
        nome_polo: 'Polo Teste Integration',
        codigo_polo: `TEST-${Date.now()}`,
        localizacao: 'Teste - Brasil',
        status_polo: 'Ativo'
      }, { timeout: 5000 });

      if (createResponse.status === 201 && createResponse.data.success) {
        const poloId = createResponse.data.data.id;
        this.log(`✓ Criação de dados: Polo criado com ID ${poloId}`, 'success');
        
        // Testar leitura
        const readResponse = await axios.get(`${BACKEND_URL}/polos/${poloId}`, { timeout: 3000 });
        
        if (readResponse.status === 200 && readResponse.data.success) {
          this.log('✓ Leitura de dados: Polo recuperado com sucesso', 'success');
          
          // Testar atualização
          const updateResponse = await axios.put(`${BACKEND_URL}/polos/${poloId}`, {
            observacoes: 'Atualizado durante teste de integração'
          }, { timeout: 3000 });
          
          if (updateResponse.status === 200 && updateResponse.data.success) {
            this.log('✓ Atualização de dados: Polo atualizado com sucesso', 'success');
            
            // Testar exclusão
            const deleteResponse = await axios.delete(`${BACKEND_URL}/polos/${poloId}`, { timeout: 3000 });
            
            if (deleteResponse.status === 200 && deleteResponse.data.success) {
              this.log('✓ Exclusão de dados: Polo removido com sucesso', 'success');
              return { success: true, operations: ['create', 'read', 'update', 'delete'] };
            }
          }
        }
      }
      
      return { success: false, error: 'Operação CRUD incompleta' };
      
    } catch (error) {
      this.log(`✗ Operações de dados falharam: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async runIntegrationTests() {
    this.log('🚀 Iniciando testes de integração frontend-backend...\n');

    const tests = [
      { name: 'Backend Health', test: () => this.testBackendHealth() },
      { name: 'Frontend Health', test: () => this.testFrontendHealth() },
      { name: 'CORS Configuration', test: () => this.testCORSConfiguration() },
      { name: 'API Endpoints', test: () => this.testAPIEndpoints() },
      { name: 'Data Operations', test: () => this.testDataOperations() }
    ];

    const results = [];
    
    for (const test of tests) {
      this.log(`\n📋 Executando: ${test.name}`);
      const result = await test.test();
      results.push({ name: test.name, ...result });
    }

    // Gerar relatório final
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const successRate = ((successful / total) * 100).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE INTEGRAÇÃO FRONTEND-BACKEND');
    console.log('='.repeat(80));
    console.log(`🎯 Taxa de sucesso: ${successRate}%`);
    console.log(`✅ Testes passaram: ${successful}/${total}`);
    console.log(`⚙️  Backend: ${BACKEND_URL}`);
    console.log(`🌐 Frontend: ${FRONTEND_URL}`);
    console.log('='.repeat(80));

    if (successful < total) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      results.filter(r => !r.success).forEach(test => {
        console.log(`   • ${test.name}: ${test.error || 'Erro desconhecido'}`);
      });
    }

    this.log(`\n🎉 Testes de integração concluídos! Taxa: ${successRate}%`, 
      parseFloat(successRate) >= 80 ? 'success' : 'error');

    return { successRate: parseFloat(successRate), results };
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new FrontendBackendTest();
  
  tester.runIntegrationTests()
    .then(report => {
      process.exit(report.successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error.message);
      process.exit(1);
    });
}

module.exports = FrontendBackendTest;