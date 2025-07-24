// ============================================================================
// MODELO DE POLOS - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Polos de Produção/Operação
 * Conforme especificação do sistema SGM
 */
const Polo = sequelize.define('polos', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identificação do Polo
  nome_polo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  codigo_polo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 20]
    }
  },
  
  // Localização
  localizacao: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Localização geográfica do polo'
  },
  
  // Responsabilidade
  responsavel_tecnico: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome do responsável técnico'
  },
  contato_responsavel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Telefone/email do responsável'
  },
  
  // Status Operacional
  status_polo: {
    type: DataTypes.ENUM(
      'Ativo',
      'Inativo',
      'Manutenção',
      'Planejamento',
      'Descomissionado'
    ),
    allowNull: false,
    defaultValue: 'Ativo'
  },
  
  // Observações
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Campos de Auditoria
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do usuário que criou o registro'
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do usuário que alterou o registro'
  }
}, {
  // Opções do modelo
  tableName: 'polos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Índices
  indexes: [
    {
      unique: true,
      fields: ['codigo_polo']
    },
    {
      fields: ['status_polo']
    },
    {
      fields: ['nome_polo']
    }
  ],
  
  // Hooks
  hooks: {
    beforeUpdate: (polo, options) => {
      polo.updated_at = new Date();
    }
  }
});

// Métodos de instância
Polo.prototype.isAtivo = function() {
  return this.status_polo === 'Ativo';
};

Polo.prototype.getTotalInstalacoes = async function() {
  // Método para contar instalações do polo
  // Seria implementado com JOIN quando models estiverem conectados
  return 0;
};

// Métodos estáticos
Polo.findByStatus = function(status) {
  return this.findAll({
    where: { status_polo: status }
  });
};

Polo.findAtivos = function() {
  return this.findAll({
    where: { status_polo: 'Ativo' }
  });
};

Polo.findByCodigo = function(codigo) {
  return this.findOne({
    where: { codigo_polo: codigo }
  });
};

// Associações serão definidas em um arquivo separado de associações
Polo.associate = function(models) {
  // Relacionamento com Instalações (um polo tem várias instalações)
  Polo.hasMany(models.Instalacao, {
    foreignKey: 'polo_id',
    as: 'instalacoes'
  });
  
  // Relacionamento com PontosMedicao (através de instalações)
  Polo.hasMany(models.PontoMedicao, {
    foreignKey: 'polo_id',
    as: 'pontosMedicao'
  });
  
  // Relacionamento com Usuarios (criado por, alterado por)
  Polo.belongsTo(models.Usuario, {
    foreignKey: 'created_by',
    as: 'criadoPor'
  });
  
  Polo.belongsTo(models.Usuario, {
    foreignKey: 'updated_by',
    as: 'alteradoPor'
  });
  
  // Relacionamento com HistoricoInstalacao
  Polo.hasMany(models.HistoricoInstalacao, {
    foreignKey: 'polo_id',
    as: 'historicoInstalacoes'
  });
  
  // Relacionamento com Auditoria
  Polo.hasMany(models.Auditoria, {
    foreignKey: 'entidade_id',
    scope: {
      entidade_tipo: 'polo'
    },
    as: 'auditorias'
  });
};

module.exports = Polo;