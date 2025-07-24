// MODELO AUDITORIA - PARTE 5: SISTEMA E SEGURANÇA
// ============================================================================

const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const Auditoria = sequelize.define('Auditoria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Chave primária auto-incremento'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Usuário que executou ação'
    },
    sessao_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
      references: {
        model: 'sessoes',
        key: 'id'
      },
      comment: 'Sessão relacionada'
    },
    acao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      },
      comment: 'Ação executada'
    },
    modulo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      },
      comment: 'Módulo do sistema'
    },
    entidade: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      },
      comment: 'Entidade afetada'
    },
    entidade_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      },
      comment: 'ID da entidade'
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500]
      },
      comment: 'Descrição da ação'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        isIP: true
      },
      comment: 'Endereço IP'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      },
      comment: 'User agent'
    },
    valores_anteriores: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('valores_anteriores');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('valores_anteriores', value ? JSON.stringify(value) : null);
      },
      comment: 'Valores antes da mudança (JSON object)'
    },
    valores_novos: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('valores_novos');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('valores_novos', value ? JSON.stringify(value) : null);
      },
      comment: 'Valores após a mudança (JSON object)'
    },
    contexto_adicional: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('contexto_adicional');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('contexto_adicional', JSON.stringify(value || {}));
      },
      comment: 'Contexto adicional (JSON object)'
    },
    nivel_risco: {
      type: DataTypes.ENUM('Baixo', 'Medio', 'Alto', 'Critico'),
      allowNull: false,
      defaultValue: 'Baixo',
      comment: 'Nível de risco'
    },
    sucesso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Ação bem-sucedida'
    },
    codigo_erro: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      },
      comment: 'Código do erro'
    },
    mensagem_erro: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      },
      comment: 'Mensagem de erro'
    },
    data_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data/hora da ação'
    },
    duracao_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      },
      comment: 'Duração em milissegundos'
    },
    polo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'polos',
        key: 'id'
      },
      comment: 'Polo relacionado'
    },
    instalacao_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'instalacoes',
        key: 'id'
      },
      comment: 'Instalação relacionada'
    },
    categoria_auditoria: {
      type: DataTypes.ENUM('Acesso', 'Dados', 'Configuracao', 'Seguranca', 'Aprovacao', 'Sistema'),
      allowNull: false,
      defaultValue: 'Dados',
      comment: 'Categoria da auditoria'
    },
    subcategoria: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      },
      comment: 'Subcategoria específica'
    },
    criticidade_negocio: {
      type: DataTypes.ENUM('Baixa', 'Media', 'Alta', 'Critica'),
      allowNull: false,
      defaultValue: 'Baixa',
      comment: 'Criticidade para negócio'
    },
    requer_aprovacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Requer aprovação'
    },
    aprovado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Usuário que aprovou'
    },
    data_aprovacao: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterDataHora(value) {
          if (value && this.data_hora && value < this.data_hora) {
            throw new Error('Data de aprovação deve ser posterior à data da ação');
          }
        }
      },
      comment: 'Data da aprovação'
    },
    observacoes_aprovacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      },
      comment: 'Observações aprovação'
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      },
      comment: 'Tags para busca (JSON array)'
    },
    dados_sensiveis: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Contém dados sensíveis'
    },
    anonimizado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Dados anonimizados'
    },
    data_anonimizacao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da anonimização'
    },
    data_retencao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data limite retenção'
    },
    arquivado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Registro arquivado'
    },
    data_arquivamento: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data do arquivamento'
    },
    hash_integridade: {
      type: DataTypes.STRING(64),
      allowNull: true,
      validate: {
        len: [64, 64]
      },
      comment: 'Hash SHA-256 integridade'
    },
    assinatura_digital: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Assinatura digital (Base64)'
    },
    cadeia_auditoria: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('cadeia_auditoria');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('cadeia_auditoria', JSON.stringify(value || []));
      },
      comment: 'Cadeia de auditoria (JSON array)'
    },
    correlacao_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      validate: {
        isUUID: 4
      },
      comment: 'ID correlação (UUID)'
    },
    transacao_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      validate: {
        isUUID: 4
      },
      comment: 'ID transação (UUID)'
    },
    origem_requisicao: {
      type: DataTypes.ENUM('Web', 'API', 'Sistema', 'Batch', 'Mobile'),
      allowNull: false,
      defaultValue: 'Web',
      comment: 'Origem da requisição'
    },
    metadados_sistema: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('metadados_sistema');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('metadados_sistema', JSON.stringify(value || {}));
      },
      comment: 'Metadados do sistema (JSON object)'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      },
      comment: 'Observações gerais'
    }
  }, {
    tableName: 'auditoria',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['usuario_id']
      },
      {
        fields: ['sessao_id']
      },
      {
        fields: ['acao']
      },
      {
        fields: ['modulo']
      },
      {
        fields: ['entidade', 'entidade_id']
      },
      {
        fields: ['data_hora']
      },
      {
        fields: ['categoria_auditoria']
      },
      {
        fields: ['nivel_risco']
      },
      {
        fields: ['criticidade_negocio']
      },
      {
        fields: ['correlacao_id']
      },
      {
        fields: ['transacao_id']
      },
      {
        fields: ['arquivado']
      },
      {
        fields: ['data_retencao']
      }
    ],
    hooks: {
      beforeCreate: async (auditoria) => {
        // Definir data de retenção baseada na categoria
        if (!auditoria.data_retencao) {
          auditoria.data_retencao = auditoria.calcularDataRetencao();
        }
        
        // Classificar automaticamente risco e criticidade
        await auditoria.classificarAutomaticamente();
        
        // Gerar IDs de correlação se não informados
        if (!auditoria.correlacao_id) {
          auditoria.correlacao_id = uuidv4();
        }
        
        if (!auditoria.transacao_id) {
          auditoria.transacao_id = uuidv4();
        }
        
        // Gerar hash de integridade
        auditoria.hash_integridade = auditoria.gerarHashIntegridade();
        
        // Adicionar à cadeia de auditoria
        auditoria.adicionarCadeiaAuditoria('criacao');
      },
      beforeUpdate: async (auditoria) => {
        // Registros de auditoria são imutáveis por padrão
        // Apenas campos específicos podem ser alterados
        const camposPermitidos = [
          'aprovado_por', 'data_aprovacao', 'observacoes_aprovacao',
          'anonimizado', 'data_anonimizacao', 'arquivado', 'data_arquivamento'
        ];
        
        const camposAlterados = auditoria.changed();
        const alteracoesNaoPermitidas = camposAlterados.filter(campo => 
          !camposPermitidos.includes(campo)
        );
        
        if (alteracoesNaoPermitidas.length > 0) {
          throw new Error(`Campos não podem ser alterados: ${alteracoesNaoPermitidas.join(', ')}`);
        }
        
        // Atualizar cadeia de auditoria
        auditoria.adicionarCadeiaAuditoria('alteracao', camposAlterados);
        
        // Regenerar hash de integridade
        auditoria.hash_integridade = auditoria.gerarHashIntegridade();
      }
    }
  });

  // Métodos de instância
  Auditoria.prototype.calcularDataRetencao = function() {
    const dataBase = new Date(this.data_hora || new Date());
    
    // Períodos de retenção por categoria (em anos)
    const periodos = {
      'Acesso': 2,
      'Dados': 7,
      'Configuracao': 10,
      'Seguranca': 7,
      'Aprovacao': 10,
      'Sistema': 5
    };
    
    const anos = periodos[this.categoria_auditoria] || 7;
    dataBase.setFullYear(dataBase.getFullYear() + anos);
    
    return dataBase.toISOString().split('T')[0];
  };

  Auditoria.prototype.classificarAutomaticamente = async function() {
    // Classificação de risco baseada na ação e módulo
    const classificacoes = {
      'login': { risco: 'Baixo', criticidade: 'Baixa' },
      'logout': { risco: 'Baixo', criticidade: 'Baixa' },
      'consulta': { risco: 'Baixo', criticidade: 'Baixa' },
      'criacao': { risco: 'Medio', criticidade: 'Media' },
      'alteracao': { risco: 'Medio', criticidade: 'Media' },
      'exclusao': { risco: 'Alto', criticidade: 'Alta' },
      'aprovacao': { risco: 'Critico', criticidade: 'Critica' },
      'configuracao': { risco: 'Critico', criticidade: 'Critica' }
    };
    
    const acao = this.acao.toLowerCase();
    let classificacao = { risco: 'Baixo', criticidade: 'Baixa' };
    
    // Buscar classificação baseada na ação
    for (const [chave, valor] of Object.entries(classificacoes)) {
      if (acao.includes(chave)) {
        classificacao = valor;
        break;
      }
    }
    
    // Ajustar baseado no módulo
    if (['usuarios', 'configuracoes', 'auditoria'].includes(this.modulo.toLowerCase())) {
      if (classificacao.risco === 'Baixo') classificacao.risco = 'Medio';
      if (classificacao.criticidade === 'Baixa') classificacao.criticidade = 'Media';
    }
    
    this.nivel_risco = classificacao.risco;
    this.criticidade_negocio = classificacao.criticidade;
    
    // Definir se requer aprovação
    this.requer_aprovacao = ['Alto', 'Critico'].includes(classificacao.risco);
    
    // Definir categoria automaticamente
    if (!this.categoria_auditoria || this.categoria_auditoria === 'Dados') {
      if (acao.includes('login') || acao.includes('logout')) {
        this.categoria_auditoria = 'Acesso';
      } else if (acao.includes('configuracao') || acao.includes('config')) {
        this.categoria_auditoria = 'Configuracao';
      } else if (acao.includes('aprovacao') || acao.includes('aprovar')) {
        this.categoria_auditoria = 'Aprovacao';
      } else if (this.modulo === 'sistema') {
        this.categoria_auditoria = 'Sistema';
      } else if (['usuarios', 'sessoes', 'auditoria'].includes(this.modulo)) {
        this.categoria_auditoria = 'Seguranca';
      }
    }
  };

  Auditoria.prototype.gerarHashIntegridade = function() {
    const dados = {
      usuario_id: this.usuario_id,
      acao: this.acao,
      modulo: this.modulo,
      entidade: this.entidade,
      entidade_id: this.entidade_id,
      data_hora: this.data_hora,
      ip_address: this.ip_address
    };
    
    const dadosString = JSON.stringify(dados, Object.keys(dados).sort());
    return crypto.createHash('sha256').update(dadosString).digest('hex');
  };

  Auditoria.prototype.verificarIntegridade = function() {
    const hashAtual = this.gerarHashIntegridade();
    return hashAtual === this.hash_integridade;
  };

  Auditoria.prototype.adicionarCadeiaAuditoria = function(tipo, detalhes = null) {
    const cadeia = this.cadeia_auditoria || [];
    
    cadeia.push({
      tipo,
      timestamp: new Date(),
      detalhes,
      hash_anterior: cadeia.length > 0 ? cadeia[cadeia.length - 1].hash : null,
      hash: crypto.createHash('sha256').update(`${tipo}-${Date.now()}`).digest('hex')
    });
    
    this.cadeia_auditoria = cadeia;
  };

  Auditoria.prototype.aprovar = async function(aprovadorId, observacoes = null) {
    if (!this.requer_aprovacao) {
      throw new Error('Esta ação não requer aprovação');
    }
    
    if (this.aprovado_por) {
      throw new Error('Ação já foi aprovada');
    }
    
    this.aprovado_por = aprovadorId;
    this.data_aprovacao = new Date();
    this.observacoes_aprovacao = observacoes;
    
    await this.save();
  };

  Auditoria.prototype.anonimizar = async function() {
    if (this.anonimizado) {
      throw new Error('Registro já foi anonimizado');
    }
    
    // Anonimizar dados sensíveis
    this.ip_address = '0.0.0.0';
    this.user_agent = '[ANONIMIZADO]';
    
    if (this.valores_anteriores) {
      this.valores_anteriores = { '[ANONIMIZADO]': true };
    }
    
    if (this.valores_novos) {
      this.valores_novos = { '[ANONIMIZADO]': true };
    }
    
    this.anonimizado = true;
    this.data_anonimizacao = new Date();
    
    await this.save();
  };

  Auditoria.prototype.arquivar = async function() {
    if (this.arquivado) {
      throw new Error('Registro já foi arquivado');
    }
    
    this.arquivado = true;
    this.data_arquivamento = new Date();
    
    await this.save();
  };

  Auditoria.prototype.obterResumo = function() {
    return {
      id: this.id,
      usuario_id: this.usuario_id,
      acao: this.acao,
      modulo: this.modulo,
      entidade: this.entidade,
      entidade_id: this.entidade_id,
      data_hora: this.data_hora,
      nivel_risco: this.nivel_risco,
      criticidade_negocio: this.criticidade_negocio,
      sucesso: this.sucesso,
      requer_aprovacao: this.requer_aprovacao,
      aprovado: !!this.aprovado_por
    };
  };

  // Métodos estáticos
  Auditoria.registrar = async function(dados) {
    const {
      usuarioId, sessaoId, acao, modulo, entidade, entidadeId,
      descricao, ip, userAgent, valoresAnteriores, valoresNovos,
      contextoAdicional, sucesso = true, codigoErro, mensagemErro,
      duracaoMs, poloId, instalacaoId, origemRequisicao = 'Web',
      metadadosSistema
    } = dados;
    
    return await this.create({
      usuario_id: usuarioId,
      sessao_id: sessaoId,
      acao,
      modulo,
      entidade,
      entidade_id: entidadeId,
      descricao,
      ip_address: ip,
      user_agent: userAgent,
      valores_anteriores: valoresAnteriores,
      valores_novos: valoresNovos,
      contexto_adicional: contextoAdicional,
      sucesso,
      codigo_erro: codigoErro,
      mensagem_erro: mensagemErro,
      duracao_ms: duracaoMs,
      polo_id: poloId,
      instalacao_id: instalacaoId,
      origem_requisicao: origemRequisicao,
      metadados_sistema: metadadosSistema
    });
  };

  Auditoria.obterEstatisticas = async function(periodo = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodo);
    
    const total = await this.count({
      where: {
        data_hora: {
          [sequelize.Sequelize.Op.gte]: dataInicio
        }
      }
    });
    
    // Por categoria
    const porCategoria = await this.findAll({
      attributes: [
        'categoria_auditoria',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: {
        data_hora: {
          [sequelize.Sequelize.Op.gte]: dataInicio
        }
      },
      group: ['categoria_auditoria'],
      raw: true
    });
    
    // Por nível de risco
    const porRisco = await this.findAll({
      attributes: [
        'nivel_risco',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: {
        data_hora: {
          [sequelize.Sequelize.Op.gte]: dataInicio
        }
      },
      group: ['nivel_risco'],
      raw: true
    });
    
    // Falhas
    const falhas = await this.count({
      where: {
        sucesso: false,
        data_hora: {
          [sequelize.Sequelize.Op.gte]: dataInicio
        }
      }
    });
    
    // Pendentes de aprovação
    const pendentesAprovacao = await this.count({
      where: {
        requer_aprovacao: true,
        aprovado_por: null
      }
    });

    return {
      total,
      por_categoria: porCategoria,
      por_risco: porRisco,
      falhas,
      pendentes_aprovacao: pendentesAprovacao,
      periodo_dias: periodo
    };
  };

  Auditoria.obterTrilhaAuditoria = async function(correlacaoId) {
    return await this.findAll({
      where: { correlacao_id: correlacaoId },
      order: [['data_hora', 'ASC']],
      include: [
        {
          model: sequelize.models.Usuario,
          as: 'usuario',
          attributes: ['id', 'nome_usuario', 'login']
        }
      ]
    });
  };

  Auditoria.obterPendentesAprovacao = async function() {
    return await this.findAll({
      where: {
        requer_aprovacao: true,
        aprovado_por: null
      },
      order: [['data_hora', 'ASC']],
      include: [
        {
          model: sequelize.models.Usuario,
          as: 'usuario',
          attributes: ['id', 'nome_usuario', 'login']
        }
      ]
    });
  };

  Auditoria.gerarRelatorioConformidade = async function(dataInicio, dataFim) {
    const registros = await this.findAll({
      where: {
        data_hora: {
          [sequelize.Sequelize.Op.between]: [dataInicio, dataFim]
        }
      },
      attributes: [
        'categoria_auditoria',
        'nivel_risco',
        'criticidade_negocio',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['categoria_auditoria', 'nivel_risco', 'criticidade_negocio'],
      raw: true
    });
    
    const integridade = await this.verificarIntegridadeLote(dataInicio, dataFim);
    
    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      registros,
      integridade,
      total_registros: registros.reduce((sum, r) => sum + parseInt(r.total), 0)
    };
  };

  Auditoria.verificarIntegridadeLote = async function(dataInicio, dataFim) {
    const registros = await this.findAll({
      where: {
        data_hora: {
          [sequelize.Sequelize.Op.between]: [dataInicio, dataFim]
        }
      },
      attributes: ['id', 'hash_integridade']
    });
    
    let integros = 0;
    let corrompidos = 0;
    
    for (const registro of registros) {
      const registroCompleto = await this.findByPk(registro.id);
      if (registroCompleto.verificarIntegridade()) {
        integros++;
      } else {
        corrompidos++;
      }
    }
    
    return {
      total: registros.length,
      integros,
      corrompidos,
      percentual_integridade: registros.length > 0 ? (integros / registros.length) * 100 : 100
    };
  };

  Auditoria.arquivarAntigos = async function(dataLimite) {
    const registros = await this.findAll({
      where: {
        arquivado: false,
        data_retencao: {
          [sequelize.Sequelize.Op.lt]: dataLimite
        }
      }
    });
    
    for (const registro of registros) {
      await registro.arquivar();
    }
    
    return registros.length;
  };

  Auditoria.anonimizarLote = async function(criterios) {
    const registros = await this.findAll({
      where: {
        ...criterios,
        anonimizado: false,
        dados_sensiveis: true
      }
    });
    
    for (const registro of registros) {
      await registro.anonimizar();
    }
    
    return registros.length;
  };

  // Definir associações
  Auditoria.associate = function(models) {
    Auditoria.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    
    Auditoria.belongsTo(models.Usuario, {
      foreignKey: 'aprovado_por',
      as: 'aprovador'
    });
    
    Auditoria.belongsTo(models.Sessao, {
      foreignKey: 'sessao_id',
      as: 'sessao'
    });
    
    Auditoria.belongsTo(models.Polo, {
      foreignKey: 'polo_id',
      as: 'polo'
    });
    
    Auditoria.belongsTo(models.Instalacao, {
      foreignKey: 'instalacao_id',
      as: 'instalacao'
    });
  };

  return Auditoria;
};

