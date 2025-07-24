// MODELO DE ESTOQUE - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Gestão de Estoque
 * Conforme PARTE 4: GESTÃO E CONTROLE - Especificação revisada
 */
const Estoque = sequelize.define('estoque', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Relacionamento com Equipamento
  numero_serie_equipamento: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'equipamentos',
      key: 'numero_serie'
    }
  },
  
  // Localização no Estoque
  localizacao_fisica: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    },
    comment: 'Localização física no estoque'
  },
  setor_estoque: {
    type: DataTypes.ENUM('Almoxarifado_Principal', 'Estoque_Campo', 'Manutencao', 'Quarentena', 'Descarte', 'Externo'),
    allowNull: false,
    defaultValue: 'Almoxarifado_Principal'
  },
  prateleira: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    },
    comment: 'Identificação da prateleira'
  },
  posicao: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    },
    comment: 'Posição na prateleira'
  },
  codigo_barras: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      len: [0, 50]
    },
    comment: 'Código de barras'
  },
  
  // Status do Item no Estoque
  status_estoque: {
    type: DataTypes.ENUM('Disponivel', 'Reservado', 'Manutencao', 'Quarentena', 'Descarte', 'Emprestado'),
    allowNull: false,
    defaultValue: 'Disponivel'
  },
  condicao_fisica: {
    type: DataTypes.ENUM('Excelente', 'Boa', 'Regular', 'Ruim', 'Danificado'),
    allowNull: false,
    defaultValue: 'Boa'
  },
  
  // Datas de Controle
  data_entrada_estoque: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: true
    }
  },
  data_ultima_inspecao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  proxima_inspecao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  periodicidade_inspecao_meses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 120
    }
  },
  
  // Responsabilidade
  responsavel_estoque: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  centro_custo: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  numero_patrimonio: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      len: [0, 50]
    }
  },
  
  // Informações de Aquisição
  valor_aquisicao: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  data_aquisicao: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  fornecedor: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  numero_nota_fiscal: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  
  // Garantia
  garantia_fabricante_meses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  data_inicio_garantia: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  data_fim_garantia: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // Reserva
  reservado_para: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    },
    comment: 'Reservado para (usuário/projeto)'
  },
  data_reserva: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  motivo_reserva: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  data_liberacao_reserva: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // Controle de Manutenção
  necessita_calibracao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  necessita_manutencao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  // Controle de Quarentena
  motivo_quarentena: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  data_quarentena: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  liberado_quarentena_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_liberacao_quarentena: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // Condições de Armazenamento
  temperatura_armazenamento_min: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: -273.15
    }
  },
  temperatura_armazenamento_max: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: -273.15
    }
  },
  umidade_maxima_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  cuidados_especiais: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  
  // Documentação e Histórico
  documentos_anexos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com caminhos dos documentos anexos'
  },
  historico_movimentacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com histórico resumido'
  },
  
  // Observações
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000]
    }
  },
  
  // Controle de Registro
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  criado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  alterado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'estoque',
  underscored: true,
  
  // Campos virtuais calculados
  getterMethods: {
    // Status da garantia calculado
    em_garantia() {
      if (!this.data_fim_garantia) return false;
      return new Date() <= new Date(this.data_fim_garantia);
    }
  },
  
  // Índices
  indexes: [
    {
      fields: ['numero_serie_equipamento'],
      unique: true
    },
    {
      fields: ['status_estoque']
    },
    {
      fields: ['setor_estoque']
    },
    {
      fields: ['condicao_fisica']
    },
    {
      fields: ['data_entrada_estoque']
    },
    {
      fields: ['proxima_inspecao']
    },
    {
      fields: ['necessita_calibracao']
    },
    {
      fields: ['necessita_manutencao']
    },
    {
      fields: ['reservado_para']
    },
    {
      fields: ['numero_patrimonio']
    },
    {
      fields: ['codigo_barras']
    }
  ],
  
  // Validações
  validate: {
    validarReserva() {
      if (this.status_estoque === 'Reservado') {
        if (!this.reservado_para || !this.data_reserva) {
          throw new Error('Equipamento reservado deve ter informações de reserva completas');
        }
      }
    },
    
    validarGarantia() {
      if (this.data_inicio_garantia && this.data_fim_garantia) {
        if (new Date(this.data_inicio_garantia) >= new Date(this.data_fim_garantia)) {
          throw new Error('Data de início da garantia deve ser anterior à data de fim');
        }
      }
    },
    
    validarInspecao() {
      if (this.data_ultima_inspecao && this.proxima_inspecao) {
        if (new Date(this.data_ultima_inspecao) >= new Date(this.proxima_inspecao)) {
          throw new Error('Próxima inspeção deve ser posterior à última inspeção');
        }
      }
    },
    
    validarTemperaturas() {
      if (this.temperatura_armazenamento_min && this.temperatura_armazenamento_max) {
        if (this.temperatura_armazenamento_min >= this.temperatura_armazenamento_max) {
          throw new Error('Temperatura máxima deve ser maior que a mínima');
        }
      }
    },
    
    validarQuarentena() {
      if (this.status_estoque === 'Quarentena' && !this.motivo_quarentena) {
        throw new Error('Equipamento em quarentena deve ter motivo informado');
      }
      
      if (this.data_liberacao_quarentena && this.data_quarentena) {
        if (new Date(this.data_liberacao_quarentena) < new Date(this.data_quarentena)) {
          throw new Error('Data de liberação deve ser posterior à data de quarentena');
        }
      }
    },
    
    validarDocumentos() {
      if (this.documentos_anexos) {
        try {
          JSON.parse(this.documentos_anexos);
        } catch (e) {
          throw new Error('Documentos anexos devem estar em formato JSON válido');
        }
      }
      
      if (this.historico_movimentacoes) {
        try {
          JSON.parse(this.historico_movimentacoes);
        } catch (e) {
          throw new Error('Histórico de movimentações deve estar em formato JSON válido');
        }
      }
    }
  },
  
  // Hooks
  hooks: {
    beforeCreate: (estoque) => {
      // Definir localização padrão se não informada
      if (!estoque.localizacao_fisica) {
        estoque.localizacao_fisica = 'Estoque Geral';
      }
      
      // Calcular próxima inspeção se periodicidade informada
      if (estoque.periodicidade_inspecao_meses && !estoque.proxima_inspecao) {
        const proximaInspecao = new Date();
        proximaInspecao.setMonth(proximaInspecao.getMonth() + estoque.periodicidade_inspecao_meses);
        estoque.proxima_inspecao = proximaInspecao;
      }
    },
    
    beforeUpdate: (estoque) => {
      // Atualizar próxima inspeção se periodicidade mudou
      if (estoque.changed('periodicidade_inspecao_meses') && estoque.periodicidade_inspecao_meses) {
        const baseDate = estoque.data_ultima_inspecao || new Date();
        const proximaInspecao = new Date(baseDate);
        proximaInspecao.setMonth(proximaInspecao.getMonth() + estoque.periodicidade_inspecao_meses);
        estoque.proxima_inspecao = proximaInspecao;
      }
    }
  }
});

// Métodos de instância
Estoque.prototype.isDisponivel = function() {
  return this.status_estoque === 'Disponivel' && 
         this.condicao_fisica !== 'Danificado';
};

Estoque.prototype.podeSerReservado = function() {
  return this.isDisponivel() && !this.necessita_manutencao;
};

Estoque.prototype.isGarantiaValida = function() {
  if (!this.data_fim_garantia) return false;
  return new Date() <= new Date(this.data_fim_garantia);
};

Estoque.prototype.diasParaVencimentoGarantia = function() {
  if (!this.data_fim_garantia) return null;
  
  const hoje = new Date();
  const vencimento = new Date(this.data_fim_garantia);
  const diffTime = vencimento - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

Estoque.prototype.diasParaProximaInspecao = function() {
  if (!this.proxima_inspecao) return null;
  
  const hoje = new Date();
  const proximaInspecao = new Date(this.proxima_inspecao);
  const diffTime = proximaInspecao - hoje;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

Estoque.prototype.tempoNoEstoque = function() {
  const hoje = new Date();
  const entrada = new Date(this.data_entrada_estoque);
  const diffTime = hoje - entrada;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

Estoque.prototype.reservar = async function(reservadoPara, motivo, usuarioId) {
  if (!this.podeSerReservado()) {
    throw new Error('Equipamento não pode ser reservado no estado atual');
  }
  
  this.status_estoque = 'Reservado';
  this.reservado_para = reservadoPara;
  this.motivo_reserva = motivo;
  this.data_reserva = new Date();
  this.alterado_por = usuarioId;
  
  await this.save();
};

Estoque.prototype.liberarReserva = async function(usuarioId) {
  if (this.status_estoque !== 'Reservado') {
    throw new Error('Equipamento não está reservado');
  }
  
  this.status_estoque = 'Disponivel';
  this.reservado_para = null;
  this.motivo_reserva = null;
  this.data_liberacao_reserva = new Date();
  this.alterado_por = usuarioId;
  
  await this.save();
};

Estoque.prototype.colocarEmQuarentena = async function(motivo, usuarioId) {
  this.status_estoque = 'Quarentena';
  this.motivo_quarentena = motivo;
  this.data_quarentena = new Date();
  this.alterado_por = usuarioId;
  
  await this.save();
};

Estoque.prototype.liberarQuarentena = async function(usuarioId) {
  if (this.status_estoque !== 'Quarentena') {
    throw new Error('Equipamento não está em quarentena');
  }
  
  this.status_estoque = 'Disponivel';
  this.liberado_quarentena_por = usuarioId;
  this.data_liberacao_quarentena = new Date();
  this.alterado_por = usuarioId;
  
  await this.save();
};

Estoque.prototype.realizarInspecao = async function(resultado, observacoes, usuarioId) {
  this.data_ultima_inspecao = new Date();
  
  // Calcular próxima inspeção
  if (this.periodicidade_inspecao_meses) {
    const proximaInspecao = new Date();
    proximaInspecao.setMonth(proximaInspecao.getMonth() + this.periodicidade_inspecao_meses);
    this.proxima_inspecao = proximaInspecao;
  }
  
  // Adicionar observações ao histórico
  if (observacoes) {
    this.observacoes = (this.observacoes || '') + `\n[${new Date().toISOString()}] Inspeção: ${observacoes}`;
  }
  
  this.alterado_por = usuarioId;
  
  await this.save();
};

// Métodos estáticos
Estoque.obterEstatisticas = async function() {
  const [total, disponivel, reservado, manutencao, quarentena, emprestado] = await Promise.all([
    Estoque.count(),
    Estoque.count({ where: { status_estoque: 'Disponivel' } }),
    Estoque.count({ where: { status_estoque: 'Reservado' } }),
    Estoque.count({ where: { status_estoque: 'Manutencao' } }),
    Estoque.count({ where: { status_estoque: 'Quarentena' } }),
    Estoque.count({ where: { status_estoque: 'Emprestado' } })
  ]);
  
  return {
    total,
    disponivel,
    reservado,
    manutencao,
    quarentena,
    emprestado,
    taxa_disponibilidade: total > 0 ? (disponivel / total * 100).toFixed(2) : 0
  };
};

Estoque.obterItensVencendoGarantia = async function(dias = 60) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  
  return await Estoque.findAll({
    where: {
      data_fim_garantia: {
        [require('sequelize').Op.between]: [new Date(), dataLimite]
      }
    },
    order: [['data_fim_garantia', 'ASC']]
  });
};

Estoque.obterItensVencendoInspecao = async function(dias = 30) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  
  return await Estoque.findAll({
    where: {
      proxima_inspecao: {
        [require('sequelize').Op.between]: [new Date(), dataLimite]
      }
    },
    order: [['proxima_inspecao', 'ASC']]
  });
};

module.exports = Estoque;

