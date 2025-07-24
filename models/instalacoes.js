// ============================================================================
// MODELO DE INSTALAÇÕES - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Instalações de Produção
 * Conforme especificação do sistema SGM
 */
const Instalacao = sequelize.define('instalacoes', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Relacionamento com Polo
  polo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'polos',
      key: 'id'
    },
    comment: 'Chave estrangeira para polo'
  },
  
  // Identificação da Instalação
  nome_instalacao: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  codigo_instalacao: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 30]
    }
  },
  
  // Classificação
  tipo_instalacao: {
    type: DataTypes.ENUM(
      'UPGN',
      'UTGA', 
      'Estação de Medição',
      'Terminal Aquaviário',
      'Terminal Terrestre',
      'Refinaria',
      'Plataforma Marítima',
      'FPSO',
      'UEP',
      'Outros'
    ),
    allowNull: false,
    defaultValue: 'UPGN'
  },
  
  // Localização
  localizacao: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Localização específica da instalação'
  },
  
  // Responsabilidade
  responsavel_tecnico: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome do responsável técnico da instalação'
  },
  contato_responsavel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Telefone/email do responsável'
  },
  
  // Status Operacional
  status_instalacao: {
    type: DataTypes.ENUM(
      'Operacional',
      'Parada',
      'Manutenção',
      'Construção',
      'Comissionamento',
      'Descomissionada',
      'Inativa'
    ),
    allowNull: false,
    defaultValue: 'Operacional'
  },
  
  // Dados Operacionais
  data_inicio_operacao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de início das operações'
  },
  capacidade_producao: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Capacidade de produção (unidade dependente do tipo)'
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
  tableName: 'instalacoes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Índices
  indexes: [
    {
      unique: true,
      fields: ['codigo_instalacao']
    },
    {
      fields: ['polo_id']
    },
    {
      fields: ['tipo_instalacao']
    },
    {
      fields: ['status_instalacao']
    },
    {
      fields: ['nome_instalacao']
    }
  ],
  
  // Hooks
  hooks: {
    beforeUpdate: (instalacao, options) => {
      instalacao.updated_at = new Date();
    }
  }
});

// Métodos de instância
Instalacao.prototype.isOperacional = function() {
  return this.status_instalacao === 'Operacional';
};

Instalacao.prototype.getTotalPontosMedicao = async function() {
  // Método para contar pontos de medição da instalação
  // Seria implementado com JOIN quando models estiverem conectados
  return 0;
};

Instalacao.prototype.getCapacidadeFormatada = function() {
  if (!this.capacidade_producao) return 'N/A';
  
  // Formatação baseada no tipo de instalação
  switch(this.tipo_instalacao) {
    case 'UPGN':
    case 'UTGA':
      return `${this.capacidade_producao} MMm³/d`;
    case 'Refinaria':
      return `${this.capacidade_producao} bbl/d`;
    default:
      return `${this.capacidade_producao}`;
  }
};

// Métodos estáticos
Instalacao.findByPolo = function(polo_id) {
  return this.findAll({
    where: { polo_id: polo_id }
  });
};

Instalacao.findByTipo = function(tipo) {
  return this.findAll({
    where: { tipo_instalacao: tipo }
  });
};

Instalacao.findByStatus = function(status) {
  return this.findAll({
    where: { status_instalacao: status }
  });
};

Instalacao.findOperacionais = function() {
  return this.findAll({
    where: { status_instalacao: 'Operacional' }
  });
};

Instalacao.findByCodigo = function(codigo) {
  return this.findOne({
    where: { codigo_instalacao: codigo }
  });
};

// Associações serão definidas em um arquivo separado de associações
Instalacao.associate = function(models) {
  // Relacionamento com Polo (uma instalação pertence a um polo)
  Instalacao.belongsTo(models.Polo, {
    foreignKey: 'polo_id',
    as: 'polo'
  });
  
  // Relacionamento com PontosMedicao (uma instalação tem vários pontos)
  Instalacao.hasMany(models.PontoMedicao, {
    foreignKey: 'instalacao_id',
    as: 'pontosMedicao'
  });
  
  // Relacionamento com Usuarios (criado por, alterado por)
  Instalacao.belongsTo(models.Usuario, {
    foreignKey: 'created_by',
    as: 'criadoPor'
  });
  
  Instalacao.belongsTo(models.Usuario, {
    foreignKey: 'updated_by',
    as: 'alteradoPor'
  });
  
  // Relacionamento com HistoricoInstalacao
  Instalacao.hasMany(models.HistoricoInstalacao, {
    foreignKey: 'instalacao_id',
    as: 'historicoInstalacoes'
  });
  
  // Relacionamento com Auditoria
  Instalacao.hasMany(models.Auditoria, {
    foreignKey: 'entidade_id',
    scope: {
      entidade_tipo: 'instalacao'
    },
    as: 'auditorias'
  });
};

module.exports = Instalacao;