// Modelo de trechos retos do sistema SGM
const trechosRetos = {
  // Estrutura de dados para trechos retos
  schema: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    nome: 'VARCHAR(100) NOT NULL',
    comprimento: 'DECIMAL(10,2)',
    diametro: 'DECIMAL(10,2)',
    material: 'VARCHAR(50)',
    instalacao_id: 'INTEGER',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  
  // Validações
  validations: {
    nome: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    comprimento: {
      required: true,
      min: 0.01,
      max: 10000
    },
    diametro: {
      required: true,
      min: 0.01,
      max: 1000
    }
  }
};

module.exports = trechosRetos;