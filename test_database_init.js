// TESTE DE INICIALIZAÇÃO COMPLETA DO BANCO DE DADOS SGM
// ============================================================================

const { initializeDatabase } = require('./src/main/database/init');

async function testDatabaseInit() {
  console.log('🚀 INICIANDO TESTE DE INICIALIZAÇÃO DO BANCO SGM');
  console.log('=' .repeat(60));
  
  try {
    console.log('📊 1. Inicializando banco de dados...');
    const result = await initializeDatabase();
    
    console.log('✅ Banco inicializado com sucesso!');
    console.log('📋 Resultado:', result);
    
    // Verificar se o arquivo foi criado
    const fs = require('fs');
    const path = require('path');
    
    const dbPath = path.join(__dirname, 'sgm_database.sqlite');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`✅ Arquivo de banco criado: ${dbPath}`);
      console.log(`📏 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Criado em: ${stats.birthtime}`);
    } else {
      console.log('❌ Arquivo de banco não encontrado!');
    }
    
    console.log('\n🎉 TESTE DE INICIALIZAÇÃO CONCLUÍDO COM SUCESSO!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERRO NA INICIALIZAÇÃO:', error.message);
    console.error('📋 Stack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
testDatabaseInit();

