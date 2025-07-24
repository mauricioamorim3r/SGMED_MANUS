// ============================================================================
// MODELO DE EQUIPAMENTOS - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Equipamentos de Medição
 * Conforme especificação do sistema SGM
 */
const Equipamento = sequelize.define('equipamentos', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identificação do Equipamento
  numero_serie: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  tag_equipamento: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 30]
    }
  },
  nome_equipamento: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  // Características Técnicas
  fabricante: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tipo_equipamento: {
    type: DataTypes.ENUM(
      'Transmissor_Pressao',
      'Transmissor_Temperatura', 
      'Transmissor_Vazao',
      'Ultrassonico',
      'Coriolis',
      'Turbina',
      'Placa_Orificio',
      'Analisador',
      'Cromatografo',
      'Outros'
    ),
    allowNull: false,
    defaultValue: 'Outros'
  },
  
  // Faixas de Medição
  faixa_equipamento: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Faixa nominal do equipamento'
  },
  faixa_pam: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Faixa de utilização (PAM - Ponto de Aplicação de Medição)'
  },
  faixa_calibrada: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Faixa efetivamente calibrada'
  },
  unidade_medicao: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  // Características Metrológicas
  erro_maximo_admissivel: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'EMA - Erro Máximo Admissível'
  },
  criterio_aceitacao: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Critério de aceitação na calibração'
  },
  
  // Status e Localização
  status_atual: {
    type: DataTypes.ENUM(
      'Instalado',
      'Estoque',
      'Calibração',
      'Manutenção', 
      'Reserva',
      'Descartado',
      'Inativo'
    ),
    allowNull: false,
    defaultValue: 'Estoque'
  },
  localizacao_fisica: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Localização física atual do equipamento'
  },
  
  // Gestão de Calibração
  frequencia_calibracao: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 12,
    comment: 'Frequência de calibração em meses'
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
  tableName: 'equipamentos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Índices
  indexes: [
    {
      unique: true,
      fields: ['numero_serie']
    },
    {
      unique: true, 
      fields: ['tag_equipamento']
    },
    {
      fields: ['tipo_equipamento']
    },
    {
      fields: ['status_atual']
    },
    {
      fields: ['fabricante']
    }
  ],
  
  // Validações
  validate: {
    // Validar que faixa_calibrada está dentro da faixa_equipamento
    faixasConsistentes() {
      if (this.faixa_calibrada && this.faixa_equipamento) {
        // Implementar validação de consistência de faixas se necessário
      }
    }
  },
  
  // Hooks
  hooks: {
    beforeUpdate: (equipamento, options) => {
      equipamento.updated_at = new Date();
    }
  }
});

// Métodos de instância
Equipamento.prototype.isVencido = function() {
  // Lógica para verificar se equipamento está com calibração vencida
  // Seria implementada com base nas datas de calibração
  return false;
};

Equipamento.prototype.proximaCalibração = function() {
  // Calcular próxima data de calibração baseada na frequência
  if (this.frequencia_calibracao) {
    const hoje = new Date();
    const proxima = new Date(hoje);
    proxima.setMonth(hoje.getMonth() + this.frequencia_calibracao);
    return proxima;
  }
  return null;
};

// Métodos estáticos
Equipamento.findByTipo = function(tipo) {
  return this.findAll({
    where: { tipo_equipamento: tipo }
  });
};

Equipamento.findByStatus = function(status) {
  return this.findAll({
    where: { status_atual: status }
  });
};

Equipamento.findByFabricante = function(fabricante) {
  return this.findAll({
    where: { fabricante: fabricante }
  });
};

// Associações serão definidas em um arquivo separado de associações
Equipamento.associate = function(models) {
  // Relacionamento com PontosMedicao (um equipamento pode estar em vários pontos ao longo do tempo)
  Equipamento.hasMany(models.PontoMedicao, {
    foreignKey: 'numero_serie_atual',
    sourceKey: 'numero_serie',
    as: 'pontosAtivos'
  });
  
  // Relacionamento com Certificados
  Equipamento.hasMany(models.Certificado, {
    foreignKey: 'numero_serie',
    sourceKey: 'numero_serie',
    as: 'certificados'
  });
  
  // Relacionamento com Estoque
  Equipamento.hasMany(models.Estoque, {
    foreignKey: 'numero_serie_equipamento',
    sourceKey: 'numero_serie',
    as: 'registrosEstoque'
  });
  
  // Relacionamento com HistoricoInstalacao
  Equipamento.hasMany(models.HistoricoInstalacao, {
    foreignKey: 'numero_serie',
    sourceKey: 'numero_serie', 
    as: 'historicoInstalacoes'
  });
  
  // Relacionamento com Usuarios (criado por, alterado por)
  Equipamento.belongsTo(models.Usuario, {
    foreignKey: 'created_by',
    as: 'criadoPor'
  });
  
  Equipamento.belongsTo(models.Usuario, {
    foreignKey: 'updated_by',
    as: 'alteradoPor'
  });
};

module.exports = Equipamento;