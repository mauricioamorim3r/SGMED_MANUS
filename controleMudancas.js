// MODELO DE CONTROLE DE MUDANÇAS (MOC) - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Controle de Mudanças (Management of Change)
 * Conforme PARTE 4: GESTÃO E CONTROLE - Especificação revisada
 */
const ControleMudancas = sequelize.define('controle_mudancas', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identificação da Mudança
  numero_moc: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    },
    comment: 'Número único da MOC'
  },
  titulo_mudanca: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  descricao_mudanca: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000]
    }
  },
  
  // Classificação da Mudança
  categoria_mudanca: {
    type: DataTypes.ENUM('Equipamento', 'Processo', 'Procedimento', 'Organizacional', 'Software', 'Infraestrutura', 'Emergencial', 'Temporaria'),
    allowNull: false
  },
  tipo_mudanca: {
    type: DataTypes.ENUM('Permanente', 'Temporaria', 'Emergencial', 'Teste'),
    allowNull: false,
    defaultValue: 'Permanente'
  },
  urgencia: {
    type: DataTypes.ENUM('Baixa', 'Normal', 'Alta', 'Critica', 'Emergencial'),
    allowNull: false,
    defaultValue: 'Normal'
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
  solicitante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  area_solicitante: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  justificativa_mudanca: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000]
    }
  },
  beneficios_esperados: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  consequencias_nao_implementar: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  
  // Sistemas e Equipamentos Afetados
  equipamentos_afetados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com números de série dos equipamentos'
  },
  sistemas_afetados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com sistemas afetados'
  },
  
  // Planejamento
  data_implementacao_planejada: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  data_implementacao_real: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  duracao_planejada_dias: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  duracao_real_dias: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  equipe_implementacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com equipe responsável'
  },
  
  // Análise de Impacto
  impacto_operacional: {
    type: DataTypes.ENUM('Baixo', 'Medio', 'Alto', 'Critico'),
    allowNull: false,
    defaultValue: 'Medio'
  },
  impacto_seguranca: {
    type: DataTypes.ENUM('Baixo', 'Medio', 'Alto', 'Critico'),
    allowNull: false,
    defaultValue: 'Medio'
  },
  impacto_ambiental: {
    type: DataTypes.ENUM('Baixo', 'Medio', 'Alto', 'Critico'),
    allowNull: false,
    defaultValue: 'Baixo'
  },
  impacto_qualidade: {
    type: DataTypes.ENUM('Baixo', 'Medio', 'Alto', 'Critico'),
    allowNull: false,
    defaultValue: 'Medio'
  },
  
  // Análise Financeira
  custo_estimado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  custo_real: {
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
  centro_custo: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  
  // Controle de Aprovações
  aprovacao_tecnica_necessaria: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  aprovacao_seguranca_necessaria: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  aprovacao_ambiental_necessaria: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  aprovacao_financeira_necessaria: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  todas_aprovacoes_concluidas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  // Aprovação Técnica
  aprovacao_tecnica_concedida: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  aprovador_tecnico_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_aprovacao_tecnica: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  observacoes_aprovacao_tecnica: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Aprovação de Segurança
  aprovacao_seguranca_concedida: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  aprovador_seguranca_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_aprovacao_seguranca: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  observacoes_aprovacao_seguranca: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Aprovação Ambiental
  aprovacao_ambiental_concedida: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  aprovador_ambiental_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_aprovacao_ambiental: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  observacoes_aprovacao_ambiental: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Aprovação Financeira
  aprovacao_financeira_concedida: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  aprovador_financeiro_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_aprovacao_financeira: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  observacoes_aprovacao_financeira: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  
  // Status da MOC
  status_moc: {
    type: DataTypes.ENUM('Rascunho', 'Submetido', 'Em_Analise', 'Aguardando_Aprovacao', 'Aprovado', 'Rejeitado', 'Em_Implementacao', 'Concluido', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Rascunho'
  },
  
  // Implementação
  responsavel_implementacao_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  data_inicio_implementacao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  data_conclusao_implementacao: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  percentual_conclusao: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // Planos e Critérios
  plano_implementacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000]
    }
  },
  plano_rollback: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000]
    }
  },
  criterios_sucesso: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  verificacao_implementacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  
  // Riscos
  riscos_identificados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com riscos identificados'
  },
  medidas_mitigacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com medidas de mitigação'
  },
  
  // Comunicação
  stakeholders_afetados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com stakeholders'
  },
  plano_comunicacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  
  // Treinamento
  requer_treinamento: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  plano_treinamento: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  treinamento_concluido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  // Documentação
  documentos_anexos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com documentos anexos'
  },
  documentos_atualizados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com documentos que precisam ser atualizados'
  },
  
  // Histórico e Observações
  historico_status: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com histórico de mudanças'
  },
  observacoes_gerais: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000]
    }
  },
  licoes_aprendidas: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
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
  tableName: 'controle_mudancas',
  underscored: true,
  
  // Campos virtuais calculados
  getterMethods: {
    // Duração real calculada
    duracao_real_calculada() {
      if (this.data_inicio_implementacao && this.data_conclusao_implementacao) {
        const inicio = new Date(this.data_inicio_implementacao);
        const fim = new Date(this.data_conclusao_implementacao);
        return Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
      }
      return null;
    }
  },
  
  // Índices
  indexes: [
    {
      fields: ['numero_moc'],
      unique: true
    },
    {
      fields: ['categoria_mudanca']
    },
    {
      fields: ['tipo_mudanca']
    },
    {
      fields: ['urgencia']
    },
    {
      fields: ['status_moc']
    },
    {
      fields: ['data_solicitacao']
    },
    {
      fields: ['solicitante_id']
    },
    {
      fields: ['data_implementacao_planejada']
    },
    {
      fields: ['impacto_operacional']
    },
    {
      fields: ['impacto_seguranca']
    },
    {
      fields: ['todas_aprovacoes_concluidas']
    },
    {
      fields: ['responsavel_implementacao_id']
    }
  ],
  
  // Validações
  validate: {
    validarDatas() {
      // Data de implementação planejada >= data de solicitação
      if (this.data_implementacao_planejada && this.data_solicitacao) {
        if (new Date(this.data_implementacao_planejada) < new Date(this.data_solicitacao)) {
          throw new Error('Data de implementação planejada deve ser posterior à solicitação');
        }
      }
      
      // Data de início <= data de conclusão
      if (this.data_inicio_implementacao && this.data_conclusao_implementacao) {
        if (new Date(this.data_inicio_implementacao) > new Date(this.data_conclusao_implementacao)) {
          throw new Error('Data de início deve ser anterior à data de conclusão');
        }
      }
    },
    
    validarAprovacoes() {
      // Validar aprovação técnica
      if (this.aprovacao_tecnica_necessaria && this.aprovacao_tecnica_concedida === true) {
        if (!this.aprovador_tecnico_id || !this.data_aprovacao_tecnica) {
          throw new Error('Aprovação técnica concedida deve ter aprovador e data');
        }
      }
      
      // Validar aprovação de segurança
      if (this.aprovacao_seguranca_necessaria && this.aprovacao_seguranca_concedida === true) {
        if (!this.aprovador_seguranca_id || !this.data_aprovacao_seguranca) {
          throw new Error('Aprovação de segurança concedida deve ter aprovador e data');
        }
      }
      
      // Validar aprovação ambiental
      if (this.aprovacao_ambiental_necessaria && this.aprovacao_ambiental_concedida === true) {
        if (!this.aprovador_ambiental_id || !this.data_aprovacao_ambiental) {
          throw new Error('Aprovação ambiental concedida deve ter aprovador e data');
        }
      }
      
      // Validar aprovação financeira
      if (this.aprovacao_financeira_necessaria && this.aprovacao_financeira_concedida === true) {
        if (!this.aprovador_financeiro_id || !this.data_aprovacao_financeira) {
          throw new Error('Aprovação financeira concedida deve ter aprovador e data');
        }
      }
    },
    
    validarImplementacao() {
      if (this.status_moc === 'Em_Implementacao') {
        if (!this.responsavel_implementacao_id || !this.data_inicio_implementacao) {
          throw new Error('MOC em implementação deve ter responsável e data de início');
        }
      }
      
      if (this.status_moc === 'Concluido') {
        if (!this.data_conclusao_implementacao || this.percentual_conclusao !== 100) {
          throw new Error('MOC concluída deve ter data de conclusão e 100% de progresso');
        }
      }
      
      if (this.percentual_conclusao < 0 || this.percentual_conclusao > 100) {
        throw new Error('Percentual de conclusão deve estar entre 0 e 100');
      }
    },
    
    validarTreinamento() {
      if (this.requer_treinamento && !this.plano_treinamento) {
        throw new Error('MOC que requer treinamento deve ter plano de treinamento');
      }
    },
    
    validarDocumentos() {
      const camposJson = [
        'equipamentos_afetados', 'sistemas_afetados', 'equipe_implementacao',
        'riscos_identificados', 'medidas_mitigacao', 'stakeholders_afetados',
        'documentos_anexos', 'documentos_atualizados', 'historico_status'
      ];
      
      camposJson.forEach(campo => {
        if (this[campo]) {
          try {
            JSON.parse(this[campo]);
          } catch (e) {
            throw new Error(`Campo ${campo} deve estar em formato JSON válido`);
          }
        }
      });
    }
  },
  
  // Hooks
  hooks: {
    beforeCreate: (moc) => {
      // Gerar número único se não fornecido
      if (!moc.numero_moc) {
        const timestamp = Date.now().toString().slice(-8);
        const categoria = moc.categoria_mudanca.substring(0, 3).toUpperCase();
        moc.numero_moc = `MOC-${categoria}-${timestamp}`;
      }
      
      // Inicializar histórico de status
      const historico = [{
        status: moc.status_moc,
        data: new Date(),
        usuario: moc.criado_por,
        observacao: 'MOC criada'
      }];
      moc.historico_status = JSON.stringify(historico);
    },
    
    beforeUpdate: (moc) => {
      // Atualizar histórico se status mudou
      if (moc.changed('status_moc')) {
        let historico = [];
        try {
          historico = JSON.parse(moc.historico_status || '[]');
        } catch (e) {
          historico = [];
        }
        
        historico.push({
          status: moc.status_moc,
          data: new Date(),
          usuario: moc.alterado_por,
          observacao: `Status alterado para ${moc.status_moc}`
        });
        
        moc.historico_status = JSON.stringify(historico);
      }
      
      // Verificar se todas as aprovações foram concluídas
      if (moc.changed('aprovacao_tecnica_concedida') || 
          moc.changed('aprovacao_seguranca_concedida') ||
          moc.changed('aprovacao_ambiental_concedida') ||
          moc.changed('aprovacao_financeira_concedida')) {
        
        const todasConcluidas = 
          (!moc.aprovacao_tecnica_necessaria || moc.aprovacao_tecnica_concedida === true) &&
          (!moc.aprovacao_seguranca_necessaria || moc.aprovacao_seguranca_concedida === true) &&
          (!moc.aprovacao_ambiental_necessaria || moc.aprovacao_ambiental_concedida === true) &&
          (!moc.aprovacao_financeira_necessaria || moc.aprovacao_financeira_concedida === true);
        
        moc.todas_aprovacoes_concluidas = todasConcluidas;
        
        if (todasConcluidas && moc.status_moc === 'Aguardando_Aprovacao') {
          moc.status_moc = 'Aprovado';
        }
      }
    }
  }
});

// Métodos de instância
ControleMudancas.prototype.submeter = async function(usuarioId) {
  if (this.status_moc !== 'Rascunho') {
    throw new Error('Apenas MOCs em rascunho podem ser submetidas');
  }
  
  this.status_moc = 'Submetido';
  this.alterado_por = usuarioId;
  
  await this.save();
};

ControleMudancas.prototype.aprovarTecnico = async function(usuarioId, observacoes = '') {
  if (!this.aprovacao_tecnica_necessaria) {
    throw new Error('Esta MOC não requer aprovação técnica');
  }
  
  if (this.aprovacao_tecnica_concedida !== null) {
    throw new Error('Aprovação técnica já foi concedida ou negada');
  }
  
  this.aprovacao_tecnica_concedida = true;
  this.aprovador_tecnico_id = usuarioId;
  this.data_aprovacao_tecnica = new Date();
  this.observacoes_aprovacao_tecnica = observacoes;
  this.alterado_por = usuarioId;
  
  await this.save();
};

ControleMudancas.prototype.rejeitarTecnico = async function(usuarioId, motivo) {
  if (!this.aprovacao_tecnica_necessaria) {
    throw new Error('Esta MOC não requer aprovação técnica');
  }
  
  if (this.aprovacao_tecnica_concedida !== null) {
    throw new Error('Aprovação técnica já foi concedida ou negada');
  }
  
  this.aprovacao_tecnica_concedida = false;
  this.aprovador_tecnico_id = usuarioId;
  this.data_aprovacao_tecnica = new Date();
  this.observacoes_aprovacao_tecnica = motivo;
  this.status_moc = 'Rejeitado';
  this.alterado_por = usuarioId;
  
  await this.save();
};

ControleMudancas.prototype.iniciarImplementacao = async function(usuarioId) {
  if (!this.todas_aprovacoes_concluidas) {
    throw new Error('Todas as aprovações devem estar concluídas para iniciar implementação');
  }
  
  if (this.status_moc !== 'Aprovado') {
    throw new Error('MOC deve estar aprovada para iniciar implementação');
  }
  
  this.status_moc = 'Em_Implementacao';
  this.responsavel_implementacao_id = usuarioId;
  this.data_inicio_implementacao = new Date();
  this.alterado_por = usuarioId;
  
  await this.save();
};

ControleMudancas.prototype.atualizarProgresso = async function(percentual, usuarioId, observacoes = '') {
  if (this.status_moc !== 'Em_Implementacao') {
    throw new Error('MOC deve estar em implementação para atualizar progresso');
  }
  
  if (percentual < 0 || percentual > 100) {
    throw new Error('Percentual deve estar entre 0 e 100');
  }
  
  this.percentual_conclusao = percentual;
  this.alterado_por = usuarioId;
  
  if (observacoes) {
    this.observacoes_gerais = (this.observacoes_gerais || '') + 
      `\n[${new Date().toISOString()}] Progresso ${percentual}%: ${observacoes}`;
  }
  
  // Se chegou a 100%, marcar como concluída
  if (percentual === 100) {
    this.status_moc = 'Concluido';
    this.data_conclusao_implementacao = new Date();
  }
  
  await this.save();
};

ControleMudancas.prototype.cancelar = async function(usuarioId, motivo) {
  const statusCancelaveis = ['Rascunho', 'Submetido', 'Em_Analise', 'Aguardando_Aprovacao', 'Aprovado'];
  
  if (!statusCancelaveis.includes(this.status_moc)) {
    throw new Error('MOC não pode ser cancelada no status atual');
  }
  
  this.status_moc = 'Cancelado';
  this.alterado_por = usuarioId;
  
  // Adicionar motivo às observações
  const motivoCancelamento = `[${new Date().toISOString()}] Cancelada: ${motivo}`;
  this.observacoes_gerais = (this.observacoes_gerais || '') + '\n' + motivoCancelamento;
  
  await this.save();
};

ControleMudancas.prototype.adicionarRisco = async function(descricao, probabilidade, impacto, mitigacao) {
  let riscos = [];
  try {
    riscos = JSON.parse(this.riscos_identificados || '[]');
  } catch (e) {
    riscos = [];
  }
  
  riscos.push({
    id: Date.now(),
    descricao,
    probabilidade,
    impacto,
    mitigacao,
    data_identificacao: new Date()
  });
  
  this.riscos_identificados = JSON.stringify(riscos);
  await this.save();
};

ControleMudancas.prototype.adicionarDocumento = async function(caminhoDocumento, tipo = 'documento') {
  let anexos = [];
  try {
    anexos = JSON.parse(this.documentos_anexos || '[]');
  } catch (e) {
    anexos = [];
  }
  
  anexos.push({
    caminho: caminhoDocumento,
    tipo: tipo,
    data_anexo: new Date(),
    usuario: this.alterado_por
  });
  
  this.documentos_anexos = JSON.stringify(anexos);
  await this.save();
};

// Métodos estáticos
ControleMudancas.obterEstatisticas = async function(filtros = {}) {
  const { dataInicio, dataFim, categoria_mudanca, urgencia } = filtros;
  
  const where = {};
  
  if (dataInicio && dataFim) {
    where.data_solicitacao = {
      [require('sequelize').Op.between]: [dataInicio, dataFim]
    };
  }
  
  if (categoria_mudanca) {
    where.categoria_mudanca = categoria_mudanca;
  }
  
  if (urgencia) {
    where.urgencia = urgencia;
  }
  
  const [total, rascunho, submetidas, emAnalise, aguardandoAprovacao, aprovadas, rejeitadas, emImplementacao, concluidas, canceladas] = await Promise.all([
    ControleMudancas.count({ where }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Rascunho' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Submetido' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Em_Analise' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Aguardando_Aprovacao' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Aprovado' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Rejeitado' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Em_Implementacao' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Concluido' } }),
    ControleMudancas.count({ where: { ...where, status_moc: 'Cancelado' } })
  ]);
  
  return {
    total,
    rascunho,
    submetidas,
    em_analise: emAnalise,
    aguardando_aprovacao: aguardandoAprovacao,
    aprovadas,
    rejeitadas,
    em_implementacao: emImplementacao,
    concluidas,
    canceladas,
    taxa_conclusao: total > 0 ? (concluidas / total * 100).toFixed(2) : 0
  };
};

ControleMudancas.obterPendentesAprovacao = async function(tipoAprovacao = null) {
  const where = {
    status_moc: {
      [require('sequelize').Op.in]: ['Submetido', 'Em_Analise', 'Aguardando_Aprovacao']
    }
  };
  
  if (tipoAprovacao === 'tecnica') {
    where.aprovacao_tecnica_necessaria = true;
    where.aprovacao_tecnica_concedida = null;
  } else if (tipoAprovacao === 'seguranca') {
    where.aprovacao_seguranca_necessaria = true;
    where.aprovacao_seguranca_concedida = null;
  } else if (tipoAprovacao === 'ambiental') {
    where.aprovacao_ambiental_necessaria = true;
    where.aprovacao_ambiental_concedida = null;
  } else if (tipoAprovacao === 'financeira') {
    where.aprovacao_financeira_necessaria = true;
    where.aprovacao_financeira_concedida = null;
  }
  
  return await ControleMudancas.findAll({
    where,
    order: [['urgencia', 'DESC'], ['data_solicitacao', 'ASC']]
  });
};

ControleMudancas.obterVencendoPrazo = async function(dias = 7) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  
  return await ControleMudancas.findAll({
    where: {
      data_implementacao_planejada: {
        [require('sequelize').Op.between]: [new Date(), dataLimite]
      },
      status_moc: {
        [require('sequelize').Op.in]: ['Aprovado', 'Em_Implementacao']
      }
    },
    order: [['data_implementacao_planejada', 'ASC']]
  });
};

ControleMudancas.obterPorEquipamento = async function(numeroSerie) {
  return await ControleMudancas.findAll({
    where: {
      equipamentos_afetados: {
        [require('sequelize').Op.like]: `%"${numeroSerie}"%`
      }
    },
    order: [['data_solicitacao', 'DESC']]
  });
};

module.exports = ControleMudancas;

