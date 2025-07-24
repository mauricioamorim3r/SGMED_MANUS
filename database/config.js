// ============================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS - SGM
// ============================================================================

const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/sgm.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Configurações de pool para SQLite
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Configurações específicas do SQLite
  dialectOptions: {
    // Habilitar foreign keys
    options: {
      encrypt: false
    }
  },
  
  // Configurações de sincronização
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

// Teste de conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection
};