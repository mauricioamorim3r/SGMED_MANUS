// Script para testar sincronização do banco de dados
const { sequelize } = require('./src/main/database/config');
const models = require('./src/main/models');

async function testSync() {
  try {
    console.log('🔄 Testando sincronização do banco...');
    
    // Força a sincronização de todos os modelos
    await sequelize.sync({ force: true });
    console.log('✅ Sincronização forçada concluída.');
    
    // Lista todas as tabelas criadas
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Tabelas criadas:', tables);
    
    // Testa especificamente a tabela trechos_retos
    const trechosRetosTable = await sequelize.getQueryInterface().describeTable('trechos_retos');
    console.log('🔍 Estrutura da tabela trechos_retos:');
    console.log(Object.keys(trechosRetosTable));
    
    console.log('✅ Teste concluído com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
  }
}

testSync();

