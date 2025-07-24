// ============================================================================
// INICIALIZAÇÃO DO BANCO DE DADOS SGM
// ============================================================================

const { sequelize } = require('./config');
// seedData removido - sem dados de exemplo
const {
  Equipamento,
  PontoMedicao,
  Certificado,
  PlacaOrificio,
  HistoricoInstalacao,
  IncertezaSistema,
  TrechoReto,
  TestePocos,
  AnaliseQuimica,
  Usuario,
  Sessao,
  Auditoria,
  Estoque,
  MovimentacaoEstoque,
  ControleMudancas
} = require('../models');

/**
 * Inicializa o banco de dados criando todas as tabelas
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados SGM...');
    
    // Testa a conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com SQLite estabelecida com sucesso.');
    
    // Sincroniza os modelos (cria as tabelas)
    await sequelize.sync({ force: false });
    console.log('✅ Tabelas criadas/sincronizadas com sucesso.');
    
    // Verifica se existem dados iniciais
    const equipamentosCount = await Equipamento.count();
    const pontosCount = await PontoMedicao.count();
    
    console.log(`📊 Equipamentos cadastrados: ${equipamentosCount}`);
    console.log(`📊 Pontos de medição cadastrados: ${pontosCount}`);
    
    // Banco inicializado sem dados de exemplo
    // Usuário deve inserir dados reais através da interface
    
    console.log('🎉 Banco de dados inicializado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Função removida - sem dados de exemplo

/**
 * Reseta o banco de dados (CUIDADO: apaga todos os dados)
 */
async function resetDatabase() {
  try {
    console.log('⚠️  RESETANDO banco de dados...');
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados resetado com sucesso!');
    
    // Recria dados de exemplo
    await createSampleData();
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  }
}

/**
 * Fecha a conexão com o banco
 */
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de dados fechada.');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
}

module.exports = {
  initializeDatabase,
  resetDatabase,
  closeDatabase
};

