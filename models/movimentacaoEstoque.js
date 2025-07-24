// MODELO DE MOVIMENTAÇÃO DE ESTOQUE - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Movimentação de Estoque
 * Conforme PARTE 4: GESTÃO E CONTROLE - Especificação revisada
 */
const MovimentacaoEstoque = sequelize.define('movimentacao_estoque', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identificação da Movimentação
  numero_movimentacao: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Número único da movimentação'
  },
  
  // Relacionamentos
  numero_serie_equipamento: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'equipamentos',
      key: 'numero_serie'
    }
  },
  
  // Tipo de Movimentação
  tipo_movimentacao: {
    type: DataTypes.ENUM(
      'Entrada', 'Saida', 'Transferencia', 'Manutencao_Ida', 'Manutencao_Retorno', 
      'Calibracao_Ida', 'Calibracao_Retorno', 'Reserva', 'Liberacao_Reserva',
      'Quarentena', 'Liberacao_Quarentena', 'Descarte'
    ),
    allowNull: false
  },
  
  // Dados da Solicitação
  data_solicitacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: true
    }
  },
  solicitante: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  solicitante_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  justificativa: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  urgencia: {
    type: DataTypes.ENUM('Baixa', 'Normal', 'Alta', 'Critica'),
    allowNull: false,
    defaultValue: 'Normal'
  },
  data_necessidade: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // Localização
  localizacao_origem: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  localizacao_destino: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  responsavel_origem: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  responsavel_destino: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  centro_custo_origem: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  centro_custo_destino: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  
  // Status e Workflow
  status_movimentacao: {
    type: DataTypes.ENUM('Solicitada', 'Aprovada', 'Rejeitada', 'Em_Execucao', 'Concluida', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Solicitada'
  },
  requer_aprovacao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Calculado baseado no tipo'
  },
  aprovador_necessario: {
    type: DataTypes.ENUM('Supervisor', 'Gerente', 'Coordenador', 'Diretor'),
    allowNull: true
  },
  
  // Aprovação
  aprovado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_aprovacao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  observacoes_aprovacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Rejeição
  rejeitado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_rejeicao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  motivo_rejeicao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Execução
  executado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_execucao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  data_conclusao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // Condições do Equipamento
  condicao_antes: {
    type: DataTypes.ENUM('Excelente', 'Boa', 'Regular', 'Ruim', 'Danificado'),
    allowNull: true
  },
  condicao_depois: {
    type: DataTypes.ENUM('Excelente', 'Boa', 'Regular', 'Ruim', 'Danificado'),
    allowNull: true
  },
  observacoes_condicao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Transporte
  documento_transporte: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  transportadora: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  numero_lacre: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  
  // Dados Financeiros
  valor_movimentacao: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  moeda: {
    type: DataTypes.STRING(3),
    allowNull: true,
    validate: {
      len: [3, 3]
    },
    comment: 'Código ISO 4217'
  },
  
  // Ordem de Serviço
  numero_ordem_servico: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  fornecedor_servico: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  previsao_retorno: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  
  // Documentação
  anexos_documentos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com documentos anexos'
  },
  historico_status: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com histórico de mudanças'
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
  tableName: 'movimentacao_estoque',
  underscored: true,
  
  // Campos virtuais calculados
  getterMethods: {
    // Tempo de execução calculado
    tempo_execucao_horas() {
      if (this.data_execucao && this.data_conclusao) {
        const inicio = new Date(this.data_execucao);
        const fim = new Date(this.data_conclusao);
        return Math.abs((fim - inicio) / (1000 * 60 * 60));
      }
      return null;
    }
  },
  
  // Índices
  indexes: [
    {
      fields: ['numero_movimentacao'],
      unique: true
    },
    {
      fields: ['numero_serie_equipamento']
    },
    {
      fields: ['tipo_movimentacao']
    },
    {
      fields: ['data_solicitacao']
    },
    {
      fields: ['status_movimentacao']
    },
    {
      fields: ['urgencia']
    },
    {
      fields: ['solicitante_id']
    },
    {
      fields: ['aprovado_por']
    },
    {
      fields: ['executado_por']
    },
    {
      fields: ['data_necessidade']
    }
  ],
  
  // Validações
  validate: {
    validarDatas() {
      // Data de solicitação <= data de necessidade
      if (this.data_solicitacao && this.data_necessidade) {
        if (new Date(this.data_solicitacao) > new Date(this.data_necessidade)) {
          throw new Error('Data de necessidade deve ser posterior à solicitação');
        }
      }
      
      // Data de aprovação >= data de solicitação
      if (this.data_aprovacao && this.data_solicitacao) {
        if (new Date(this.data_aprovacao) < new Date(this.data_solicitacao)) {
          throw new Error('Data de aprovação deve ser posterior à solicitação');
        }
      }
      
      // Data de execução >= data de aprovação
      if (this.data_execucao && this.data_aprovacao) {
        if (new Date(this.data_execucao) < new Date(this.data_aprovacao)) {
          throw new Error('Data de execução deve ser posterior à aprovação');
        }
      }
      
      // Data de conclusão >= data de execução
      if (this.data_conclusao && this.data_execucao) {
        if (new Date(this.data_conclusao) < new Date(this.data_execucao)) {
          throw new Error('Data de conclusão deve ser posterior à execução');
        }
      }
    },
    
    validarAprovacao() {
      if (this.requer_aprovacao && this.status_movimentacao === 'Aprovada') {
        if (!this.aprovado_por || !this.data_aprovacao) {
          throw new Error('Movimentação aprovada deve ter responsável e data de aprovação');
        }
      }
      
      if (this.status_movimentacao === 'Rejeitada') {
        if (!this.rejeitado_por || !this.data_rejeicao || !this.motivo_rejeicao) {
          throw new Error('Movimentação rejeitada deve ter responsável, data e motivo');
        }
      }
    },
    
    validarExecucao() {
      if (this.status_movimentacao === 'Em_Execucao' && !this.executado_por) {
        throw new Error('Movimentação em execução deve ter responsável pela execução');
      }
      
      if (this.status_movimentacao === 'Concluida') {
        if (!this.data_conclusao) {
          throw new Error('Movimentação concluída deve ter data de conclusão');
        }
      }
    },
    
    validarDocumentos() {
      if (this.anexos_documentos) {
        try {
          JSON.parse(this.anexos_documentos);
        } catch (e) {
          throw new Error('Documentos anexos devem estar em formato JSON válido');
        }
      }
      
      if (this.historico_status) {
        try {
          JSON.parse(this.historico_status);
        } catch (e) {
          throw new Error('Histórico de status deve estar em formato JSON válido');
        }
      }
    }
  },
  
  // Hooks
  hooks: {
    beforeCreate: (movimentacao) => {
      // Gerar número único se não fornecido
      if (!movimentacao.numero_movimentacao) {
        const timestamp = Date.now().toString().slice(-8);
        const tipo = movimentacao.tipo_movimentacao.substring(0, 3).toUpperCase();
        movimentacao.numero_movimentacao = `MOV-${tipo}-${timestamp}`;
      }
      
      // Definir se requer aprovação baseado no tipo
      const tiposQueRequeremAprovacao = {
        'Saida': 'Supervisor',
        'Transferencia': 'Supervisor', 
        'Descarte': 'Gerente',
        'Manutencao_Ida': 'Coordenador',
        'Calibracao_Ida': 'Coordenador'
      };
      
      if (tiposQueRequeremAprovacao[movimentacao.tipo_movimentacao]) {
        movimentacao.requer_aprovacao = true;
        movimentacao.aprovador_necessario = tiposQueRequeremAprovacao[movimentacao.tipo_movimentacao];
      }
      
      // Inicializar histórico de status
      const historico = [{
        status: movimentacao.status_movimentacao,
        data: new Date(),
        usuario: movimentacao.criado_por,
        observacao: 'Movimentação criada'
      }];
      movimentacao.historico_status = JSON.stringify(historico);
    },
    
    beforeUpdate: (movimentacao) => {
      // Atualizar histórico se status mudou
      if (movimentacao.changed('status_movimentacao')) {
        let historico = [];
        try {
          historico = JSON.parse(movimentacao.historico_status || '[]');
        } catch (e) {
          historico = [];
        }
        
        historico.push({
          status: movimentacao.status_movimentacao,
          data: new Date(),
          usuario: movimentacao.alterado_por,
          observacao: `Status alterado para ${movimentacao.status_movimentacao}`
        });
        
        movimentacao.historico_status = JSON.stringify(historico);
      }
    }
  }
});

// Métodos de instância
MovimentacaoEstoque.prototype.aprovar = async function(usuarioId, observacoes = '') {
  if (!this.requer_aprovacao) {
    throw new Error('Esta movimentação não requer aprovação');
  }
  
  if (this.status_movimentacao !== 'Solicitada') {
    throw new Error('Apenas movimentações solicitadas podem ser aprovadas');
  }
  
  this.status_movimentacao = 'Aprovada';
  this.aprovado_por = usuarioId;
  this.data_aprovacao = new Date();
  this.observacoes_aprovacao = observacoes;
  this.alterado_por = usuarioId;
  
  await this.save();
};

MovimentacaoEstoque.prototype.rejeitar = async function(usuarioId, motivo) {
  if (!this.requer_aprovacao) {
    throw new Error('Esta movimentação não requer aprovação');
  }
  
  if (this.status_movimentacao !== 'Solicitada') {
    throw new Error('Apenas movimentações solicitadas podem ser rejeitadas');
  }
  
  this.status_movimentacao = 'Rejeitada';
  this.rejeitado_por = usuarioId;
  this.data_rejeicao = new Date();
  this.motivo_rejeicao = motivo;
  this.alterado_por = usuarioId;
  
  await this.save();
};

MovimentacaoEstoque.prototype.iniciarExecucao = async function(usuarioId) {
  const statusValidos = this.requer_aprovacao ? ['Aprovada'] : ['Solicitada'];
  
  if (!statusValidos.includes(this.status_movimentacao)) {
    throw new Error(`Movimentação deve estar ${statusValidos.join(' ou ')} para iniciar execução`);
  }
  
  this.status_movimentacao = 'Em_Execucao';
  this.executado_por = usuarioId;
  this.data_execucao = new Date();
  this.alterado_por = usuarioId;
  
  await this.save();
};

MovimentacaoEstoque.prototype.concluir = async function(usuarioId, observacoes = '') {
  if (this.status_movimentacao !== 'Em_Execucao') {
    throw new Error('Movimentação deve estar em execução para ser concluída');
  }
  
  this.status_movimentacao = 'Concluida';
  this.data_conclusao = new Date();
  this.alterado_por = usuarioId;
  
  if (observacoes) {
    this.observacoes = (this.observacoes || '') + '\n' + observacoes;
  }
  
  await this.save();
};

MovimentacaoEstoque.prototype.cancelar = async function(usuarioId, motivo) {
  const statusCancelaveis = ['Solicitada', 'Aprovada', 'Em_Execucao'];
  
  if (!statusCancelaveis.includes(this.status_movimentacao)) {
    throw new Error('Movimentação não pode ser cancelada no status atual');
  }
  
  this.status_movimentacao = 'Cancelada';
  this.alterado_por = usuarioId;
  
  // Adicionar motivo às observações
  const motivoCancelamento = `[${new Date().toISOString()}] Cancelada: ${motivo}`;
  this.observacoes = (this.observacoes || '') + '\n' + motivoCancelamento;
  
  await this.save();
};

MovimentacaoEstoque.prototype.adicionarDocumento = async function(caminhoDocumento, tipo = 'documento') {
  let anexos = [];
  try {
    anexos = JSON.parse(this.anexos_documentos || '[]');
  } catch (e) {
    anexos = [];
  }
  
  anexos.push({
    caminho: caminhoDocumento,
    tipo: tipo,
    data_anexo: new Date(),
    usuario: this.alterado_por
  });
  
  this.anexos_documentos = JSON.stringify(anexos);
  await this.save();
};

// Métodos estáticos
MovimentacaoEstoque.obterEstatisticas = async function(filtros = {}) {
  const { dataInicio, dataFim, tipo_movimentacao } = filtros;
  
  const where = {};
  
  if (dataInicio && dataFim) {
    where.data_solicitacao = {
      [require('sequelize').Op.between]: [dataInicio, dataFim]
    };
  }
  
  if (tipo_movimentacao) {
    where.tipo_movimentacao = tipo_movimentacao;
  }
  
  const [total, solicitadas, aprovadas, rejeitadas, emExecucao, concluidas, canceladas] = await Promise.all([
    MovimentacaoEstoque.count({ where }),
    MovimentacaoEstoque.count({ where: { ...where, status_movimentacao: 'Solicitada' } }),
    MovimentacaoEstoque.count({ where: { ...where, status_movimentacao: 'Aprovada' } }),
    MovimentacaoEstoque.count({ where: { ...where, status_movimentacao: 'Rejeitada' } }),
    MovimentacaoEstoque.count({ where: { ...where, status_movimentacao: 'Em_Execucao' } }),
    MovimentacaoEstoque.count({ where: { ...where, status_movimentacao: 'Concluida' } }),
    MovimentacaoEstoque.count({ where: { ...where, status_movimentacao: 'Cancelada' } })
  ]);
  
  return {
    total,
    solicitadas,
    aprovadas,
    rejeitadas,
    em_execucao: emExecucao,
    concluidas,
    canceladas,
    taxa_conclusao: total > 0 ? (concluidas / total * 100).toFixed(2) : 0
  };
};

MovimentacaoEstoque.obterPendentesAprovacao = async function(tipoAprovador = null) {
  const where = {
    requer_aprovacao: true,
    status_movimentacao: 'Solicitada'
  };
  
  if (tipoAprovador) {
    where.aprovador_necessario = tipoAprovador;
  }
  
  return await MovimentacaoEstoque.findAll({
    where,
    order: [['urgencia', 'DESC'], ['data_solicitacao', 'ASC']]
  });
};

MovimentacaoEstoque.obterHistoricoEquipamento = async function(numeroSerie) {
  return await MovimentacaoEstoque.findAll({
    where: {
      numero_serie_equipamento: numeroSerie
    },
    order: [['data_solicitacao', 'DESC']]
  });
};

MovimentacaoEstoque.obterVencendoPrazo = async function(dias = 7) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  
  return await MovimentacaoEstoque.findAll({
    where: {
      data_necessidade: {
        [require('sequelize').Op.between]: [new Date(), dataLimite]
      },
      status_movimentacao: {
        [require('sequelize').Op.in]: ['Solicitada', 'Aprovada', 'Em_Execucao']
      }
    },
    order: [['data_necessidade', 'ASC']]
  });
};

module.exports = MovimentacaoEstoque;

