// ============================================================================
// MODELO DE PONTOS DE MEDIÇÃO - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Pontos de Medição
 * Conforme especificação do sistema SGM
 */
const PontoMedicao = sequelize.define('pontos_medicao', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Relacionamentos Hierárquicos
  polo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'polos',
      key: 'id'
    },
    comment: 'Chave estrangeira para polo'
  },
  instalacao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instalacoes',
      key: 'id'
    },
    comment: 'Chave estrangeira para instalação'
  },
  
  // Identificação do Ponto
  tag_ponto: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Tag única do ponto de medição'
  },
  nome_ponto: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  // Localização
  localizacao: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Localização específica do ponto'
  },
  
  // Características do Sistema de Medição
  tipo_medidor_primario: {
    type: DataTypes.ENUM(
      'Placa_Orificio',
      'Ultrassonico',
      'Coriolis', 
      'Turbina',
      'Vortex',
      'Eletromagnetico',
      'Termico',
      'Outros'
    ),
    allowNull: false,
    defaultValue: 'Placa_Orificio'
  },
  
  // Fluido e Processo
  fluido_medido: {
    type: DataTypes.ENUM(
      'Gas_Natural',
      'Oleo_Cru',
      'Agua_Producao',
      'GLP',
      'Condensado',
      'Diesel',
      'Gasolina',
      'Outros'
    ),
    allowNull: false,
    defaultValue: 'Gas_Natural'
  },
  direcao_fluxo: {
    type: DataTypes.ENUM(
      'Entrada',
      'Saida',
      'Recirculacao',
      'Bypass'
    ),
    allowNull: false,
    defaultValue: 'Entrada'
  },
  
  // Características Técnicas
  diametro_nominal: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    comment: 'Diâmetro nominal da tubulação em polegadas'
  },
  
  // Gestão de Calibração
  solicitacao_calibracao: {
    type: DataTypes.ENUM(
      'Pendente',
      'Aprovada',
      'Em_Execução',
      'Concluída',
      'Cancelada'
    ),
    allowNull: false,
    defaultValue: 'Pendente'
  },
  
  // Status Operacional
  status_ponto: {
    type: DataTypes.ENUM(
      'Ativo',
      'Inativo',
      'Manutenção',
      'Calibração',
      'Bloqueado',
      'Em_Teste'
    ),
    allowNull: false,
    defaultValue: 'Ativo'
  },
  
  // Sistema e Classificação
  sistema_medicao: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Identificação do sistema de medição'
  },
  classificacao: {
    type: DataTypes.ENUM(
      'Fiscal',
      'Operacional',
      'Custódia',
      'Processo',
      'Segurança'
    ),
    allowNull: false,
    defaultValue: 'Operacional'
  },
  
  // Equipamento Atual
  numero_serie_atual: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: 'equipamentos',
      key: 'numero_serie'
    },
    comment: 'Número de série do equipamento atualmente instalado'
  },
  
  // Datas de Controle
  data_instalacao_atual: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de instalação do equipamento atual'
  },
  data_ultima_calibracao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da última calibração realizada'
  },
  data_proxima_calibracao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data prevista para próxima calibração'
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
  tableName: 'pontos_medicao',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Índices
  indexes: [
    {
      unique: true,
      fields: ['tag_ponto']
    },
    {
      fields: ['polo_id']
    },
    {
      fields: ['instalacao_id']
    },
    {
      fields: ['tipo_medidor_primario']
    },
    {
      fields: ['fluido_medido']
    },
    {
      fields: ['status_ponto']
    },
    {
      fields: ['classificacao']
    },
    {
      fields: ['numero_serie_atual']
    },
    {
      fields: ['data_proxima_calibracao']
    }
  ],
  
  // Validações
  validate: {
    // Validar que instalação pertence ao polo
    instalacaoPertenceAoPolo() {
      // Esta validação seria implementada com consulta ao banco
      // quando os relacionamentos estiverem ativos
    },
    
    // Validar datas de calibração
    datasCalibracaoConsistentes() {
      if (this.data_ultima_calibracao && this.data_proxima_calibracao) {
        if (this.data_proxima_calibracao <= this.data_ultima_calibracao) {
          throw new Error('Data da próxima calibração deve ser posterior à última calibração');
        }
      }
    }
  },
  
  // Hooks
  hooks: {
    beforeUpdate: (ponto, options) => {
      ponto.updated_at = new Date();
    }
  }
});

// Métodos de instância
PontoMedicao.prototype.isAtivo = function() {
  return this.status_ponto === 'Ativo';
};

PontoMedicao.prototype.isFiscal = function() {
  return this.classificacao === 'Fiscal';
};

PontoMedicao.prototype.isVencido = function() {
  if (!this.data_proxima_calibracao) return false;
  return new Date() > new Date(this.data_proxima_calibracao);
};

PontoMedicao.prototype.diasParaVencimento = function() {
  if (!this.data_proxima_calibracao) return null;
  
  const hoje = new Date();
  const proximaCalibracoo = new Date(this.data_proxima_calibracao);
  const diffTime = proximaCalibracoo - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

PontoMedicao.prototype.getStatusCalibração = function() {
  const dias = this.diasParaVencimento();
  
  if (dias === null) return 'Sem data definida';
  if (dias < 0) return 'Vencido';
  if (dias <= 30) return 'Próximo ao vencimento';
  if (dias <= 90) return 'Atenção';
  return 'Em dia';
};

// Métodos estáticos
PontoMedicao.findByPolo = function(polo_id) {
  return this.findAll({
    where: { polo_id: polo_id }
  });
};

PontoMedicao.findByInstalacao = function(instalacao_id) {
  return this.findAll({
    where: { instalacao_id: instalacao_id }
  });
};

PontoMedicao.findByTipo = function(tipo) {
  return this.findAll({
    where: { tipo_medidor_primario: tipo }
  });
};

PontoMedicao.findByFluido = function(fluido) {
  return this.findAll({
    where: { fluido_medido: fluido }
  });
};

PontoMedicao.findByStatus = function(status) {
  return this.findAll({
    where: { status_ponto: status }
  });
};

PontoMedicao.findFiscais = function() {
  return this.findAll({
    where: { classificacao: 'Fiscal' }
  });
};

PontoMedicao.findVencidos = function() {
  const hoje = new Date();
  return this.findAll({
    where: {
      data_proxima_calibracao: {
        [Op.lt]: hoje
      }
    }
  });
};

PontoMedicao.findByTag = function(tag) {
  return this.findOne({
    where: { tag_ponto: tag }
  });
};

// Associações serão definidas em um arquivo separado de associações
PontoMedicao.associate = function(models) {
  // Relacionamento com Polo
  PontoMedicao.belongsTo(models.Polo, {
    foreignKey: 'polo_id',
    as: 'polo'
  });
  
  // Relacionamento com Instalação
  PontoMedicao.belongsTo(models.Instalacao, {
    foreignKey: 'instalacao_id',
    as: 'instalacao'
  });
  
  // Relacionamento com Equipamento atual
  PontoMedicao.belongsTo(models.Equipamento, {
    foreignKey: 'numero_serie_atual',
    sourceKey: 'numero_serie',
    as: 'equipamentoAtual'
  });
  
  // Relacionamento com PlacasOrificio
  PontoMedicao.hasMany(models.PlacaOrificio, {
    foreignKey: 'tag_ponto',
    sourceKey: 'tag_ponto',
    as: 'placasOrificio'
  });
  
  // Relacionamento com Incertezas
  PontoMedicao.hasMany(models.Incerteza, {
    foreignKey: 'tag_ponto',
    sourceKey: 'tag_ponto',
    as: 'incertezas'
  });
  
  // Relacionamento com TrechosRetos
  PontoMedicao.hasMany(models.TrechoReto, {
    foreignKey: 'tag_ponto',
    sourceKey: 'tag_ponto',
    as: 'trechosRetos'
  });
  
  // Relacionamento com HistoricoInstalacao
  PontoMedicao.hasMany(models.HistoricoInstalacao, {
    foreignKey: 'tag_ponto',
    sourceKey: 'tag_ponto',
    as: 'historicoInstalacoes'
  });
  
  // Relacionamento com Usuarios (criado por, alterado por)
  PontoMedicao.belongsTo(models.Usuario, {
    foreignKey: 'created_by',
    as: 'criadoPor'
  });
  
  PontoMedicao.belongsTo(models.Usuario, {
    foreignKey: 'updated_by',
    as: 'alteradoPor'
  });
  
  // Relacionamento com Auditoria
  PontoMedicao.hasMany(models.Auditoria, {
    foreignKey: 'entidade_id',
    scope: {
      entidade_tipo: 'ponto_medicao'
    },
    as: 'auditorias'
  });
};

module.exports = PontoMedicao;