// MODELO SESSÕES - PARTE 5: SISTEMA E SEGURANÇA
// ============================================================================

const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const Sessao = sequelize.define('Sessao', {
    id: {
      type: DataTypes.STRING(128),
      primaryKey: true,
      defaultValue: () => uuidv4(),
      comment: 'ID único da sessão (UUID)'
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Referência ao usuário'
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
      comment: 'User agent do navegador'
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data/hora início sessão'
    },
    data_ultimo_acesso: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Último acesso'
    },
    data_expiracao: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data/hora expiração'
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Sessão ativa'
    },
    motivo_encerramento: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 200]
      },
      comment: 'Motivo do encerramento'
    },
    dados_sessao: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('dados_sessao');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('dados_sessao', JSON.stringify(value || {}));
      },
      comment: 'Dados da sessão (JSON object)'
    },
    token_jwt: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Token JWT'
    },
    refresh_token: {
      type: DataTypes.STRING(128),
      allowNull: true,
      defaultValue: () => uuidv4(),
      comment: 'Token de renovação'
    },
    data_refresh: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data último refresh'
    },
    localizacao: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      },
      comment: 'Localização geográfica'
    },
    dispositivo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      },
      comment: 'Tipo de dispositivo'
    },
    navegador: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      },
      comment: 'Navegador utilizado'
    },
    versao_navegador: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      },
      comment: 'Versão do navegador'
    },
    sistema_operacional: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      },
      comment: 'Sistema operacional'
    },
    resolucao_tela: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      },
      comment: 'Resolução da tela'
    },
    timezone_cliente: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      },
      comment: 'Timezone do cliente'
    },
    idioma_navegador: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: [0, 10]
      },
      comment: 'Idioma do navegador'
    },
    sessao_concorrente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Sessão concorrente'
    },
    limite_inatividade_minutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 1
      },
      comment: 'Limite inatividade'
    },
    renovacoes_automaticas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'Número de renovações'
    },
    max_renovacoes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 1
      },
      comment: 'Máximo renovações'
    },
    paginas_acessadas: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('paginas_acessadas');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('paginas_acessadas', JSON.stringify(value || []));
      },
      comment: 'Páginas acessadas (JSON array)'
    },
    acoes_realizadas: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('acoes_realizadas');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('acoes_realizadas', JSON.stringify(value || []));
      },
      comment: 'Ações realizadas (JSON array)'
    },
    tempo_total_sessao_minutos: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.data_inicio) return 0;
        
        const dataFim = this.ativa ? new Date() : this.updatedAt;
        const diffMs = dataFim - this.data_inicio;
        return Math.floor(diffMs / (1000 * 60));
      },
      comment: 'Tempo total (minutos) - CALCULADO'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      },
      comment: 'Observações da sessão'
    }
  }, {
    tableName: 'sessoes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['id']
      },
      {
        fields: ['usuario_id']
      },
      {
        fields: ['ativa']
      },
      {
        fields: ['data_expiracao']
      },
      {
        fields: ['ip_address']
      },
      {
        fields: ['refresh_token']
      }
    ],
    hooks: {
      beforeCreate: async (sessao) => {
        // Definir data de expiração (8 horas)
        if (!sessao.data_expiracao) {
          const dataExpiracao = new Date(sessao.data_inicio);
          dataExpiracao.setHours(dataExpiracao.getHours() + 8);
          sessao.data_expiracao = dataExpiracao;
        }
        
        // Gerar token JWT
        if (!sessao.token_jwt) {
          sessao.token_jwt = await sessao.gerarTokenJWT();
        }
        
        // Processar user agent para extrair informações
        if (sessao.user_agent) {
          await sessao.processarUserAgent();
        }
      },
      beforeUpdate: async (sessao) => {
        // Atualizar último acesso se sessão ainda ativa
        if (sessao.ativa && !sessao.changed('ativa')) {
          sessao.data_ultimo_acesso = new Date();
        }
        
        // Se encerrando sessão, definir motivo se não informado
        if (sessao.changed('ativa') && !sessao.ativa && !sessao.motivo_encerramento) {
          sessao.motivo_encerramento = 'Logout normal';
        }
      }
    }
  });

  // Métodos de instância
  Sessao.prototype.gerarTokenJWT = async function() {
    const payload = {
      sessaoId: this.id,
      usuarioId: this.usuario_id,
      ip: this.ip_address,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(this.data_expiracao.getTime() / 1000)
    };
    
    const secret = process.env.JWT_SECRET || 'sgm-secret-key-2025';
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
  };

  Sessao.prototype.validarToken = function(token) {
    try {
      const secret = process.env.JWT_SECRET || 'sgm-secret-key-2025';
      const decoded = jwt.verify(token, secret);
      
      // Verificar se é o token desta sessão
      if (decoded.sessaoId !== this.id) return false;
      
      // Verificar se sessão ainda está ativa
      if (!this.ativa) return false;
      
      // Verificar se não expirou
      if (this.estaExpirada()) return false;
      
      return decoded;
    } catch (error) {
      return false;
    }
  };

  Sessao.prototype.renovar = async function() {
    // Verificar se pode renovar
    if (this.renovacoes_automaticas >= this.max_renovacoes) {
      throw new Error('Limite de renovações atingido');
    }
    
    if (!this.ativa) {
      throw new Error('Sessão inativa não pode ser renovada');
    }
    
    // Estender expiração por mais 8 horas
    const novaExpiracao = new Date();
    novaExpiracao.setHours(novaExpiracao.getHours() + 8);
    
    this.data_expiracao = novaExpiracao;
    this.data_ultimo_acesso = new Date();
    this.data_refresh = new Date();
    this.renovacoes_automaticas += 1;
    this.refresh_token = uuidv4();
    
    // Gerar novo token JWT
    this.token_jwt = await this.gerarTokenJWT();
    
    await this.save();
    
    return {
      token: this.token_jwt,
      refresh_token: this.refresh_token,
      expiracao: this.data_expiracao
    };
  };

  Sessao.prototype.encerrar = async function(motivo = 'Logout normal') {
    this.ativa = false;
    this.motivo_encerramento = motivo;
    this.data_ultimo_acesso = new Date();
    await this.save();
  };

  Sessao.prototype.estaExpirada = function() {
    return new Date() > this.data_expiracao;
  };

  Sessao.prototype.estaInativa = function() {
    if (!this.data_ultimo_acesso) return false;
    
    const agora = new Date();
    const limiteInatividade = new Date(this.data_ultimo_acesso);
    limiteInatividade.setMinutes(limiteInatividade.getMinutes() + this.limite_inatividade_minutos);
    
    return agora > limiteInatividade;
  };

  Sessao.prototype.registrarAcesso = async function(pagina, acao = null) {
    // Atualizar último acesso
    this.data_ultimo_acesso = new Date();
    
    // Registrar página acessada
    const paginasAcessadas = this.paginas_acessadas || [];
    paginasAcessadas.push({
      pagina,
      timestamp: new Date(),
      ip: this.ip_address
    });
    
    // Manter apenas as últimas 100 páginas
    if (paginasAcessadas.length > 100) {
      paginasAcessadas.shift();
    }
    
    this.paginas_acessadas = paginasAcessadas;
    
    // Registrar ação se informada
    if (acao) {
      const acoesRealizadas = this.acoes_realizadas || [];
      acoesRealizadas.push({
        acao,
        timestamp: new Date(),
        pagina
      });
      
      // Manter apenas as últimas 50 ações
      if (acoesRealizadas.length > 50) {
        acoesRealizadas.shift();
      }
      
      this.acoes_realizadas = acoesRealizadas;
    }
    
    await this.save();
  };

  Sessao.prototype.processarUserAgent = async function() {
    if (!this.user_agent) return;
    
    const ua = this.user_agent.toLowerCase();
    
    // Detectar navegador
    if (ua.includes('chrome')) {
      this.navegador = 'Chrome';
      const match = ua.match(/chrome\/([0-9.]+)/);
      if (match) this.versao_navegador = match[1];
    } else if (ua.includes('firefox')) {
      this.navegador = 'Firefox';
      const match = ua.match(/firefox\/([0-9.]+)/);
      if (match) this.versao_navegador = match[1];
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      this.navegador = 'Safari';
      const match = ua.match(/version\/([0-9.]+)/);
      if (match) this.versao_navegador = match[1];
    } else if (ua.includes('edge')) {
      this.navegador = 'Edge';
      const match = ua.match(/edge\/([0-9.]+)/);
      if (match) this.versao_navegador = match[1];
    }
    
    // Detectar sistema operacional
    if (ua.includes('windows')) {
      this.sistema_operacional = 'Windows';
    } else if (ua.includes('mac')) {
      this.sistema_operacional = 'macOS';
    } else if (ua.includes('linux')) {
      this.sistema_operacional = 'Linux';
    } else if (ua.includes('android')) {
      this.sistema_operacional = 'Android';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      this.sistema_operacional = 'iOS';
    }
    
    // Detectar tipo de dispositivo
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      this.dispositivo = 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      this.dispositivo = 'Tablet';
    } else {
      this.dispositivo = 'Desktop';
    }
  };

  Sessao.prototype.obterResumo = function() {
    return {
      id: this.id,
      usuario_id: this.usuario_id,
      ip_address: this.ip_address,
      data_inicio: this.data_inicio,
      data_ultimo_acesso: this.data_ultimo_acesso,
      data_expiracao: this.data_expiracao,
      ativa: this.ativa,
      dispositivo: this.dispositivo,
      navegador: this.navegador,
      sistema_operacional: this.sistema_operacional,
      tempo_total_minutos: this.tempo_total_sessao_minutos,
      renovacoes: this.renovacoes_automaticas,
      motivo_encerramento: this.motivo_encerramento
    };
  };

  // Métodos estáticos
  Sessao.criarSessao = async function(usuarioId, dadosRequisicao) {
    const { ip, userAgent, localizacao, timezoneCliente, idiomaNavegador, resolucaoTela } = dadosRequisicao;
    
    // Verificar se usuário já tem sessões ativas (controle de concorrência)
    const sessoesAtivas = await this.count({
      where: {
        usuario_id: usuarioId,
        ativa: true
      }
    });
    
    const sessao = await this.create({
      usuario_id: usuarioId,
      ip_address: ip,
      user_agent: userAgent,
      localizacao,
      timezone_cliente: timezoneCliente,
      idioma_navegador: idiomaNavegador,
      resolucao_tela: resolucaoTela,
      sessao_concorrente: sessoesAtivas > 0
    });
    
    return sessao;
  };

  Sessao.limpezaAutomatica = async function() {
    const agora = new Date();
    
    // Encerrar sessões expiradas
    const sessoesExpiradas = await this.findAll({
      where: {
        ativa: true,
        data_expiracao: {
          [sequelize.Sequelize.Op.lt]: agora
        }
      }
    });
    
    for (const sessao of sessoesExpiradas) {
      await sessao.encerrar('Expiração automática');
    }
    
    // Encerrar sessões inativas
    const sessoesInativas = await this.findAll({
      where: {
        ativa: true
      }
    });
    
    for (const sessao of sessoesInativas) {
      if (sessao.estaInativa()) {
        await sessao.encerrar('Inatividade');
      }
    }
    
    // Remover sessões antigas (mais de 30 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    
    const removidas = await this.destroy({
      where: {
        ativa: false,
        updated_at: {
          [sequelize.Sequelize.Op.lt]: dataLimite
        }
      }
    });
    
    return {
      expiradas: sessoesExpiradas.length,
      inativas: sessoesInativas.filter(s => s.estaInativa()).length,
      removidas
    };
  };

  Sessao.obterEstatisticas = async function() {
    const total = await this.count();
    const ativas = await this.count({ where: { ativa: true } });
    const expiradas = await this.count({
      where: {
        ativa: true,
        data_expiracao: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });
    
    // Estatísticas por dispositivo
    const porDispositivo = await this.findAll({
      attributes: [
        'dispositivo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: { ativa: true },
      group: ['dispositivo'],
      raw: true
    });
    
    // Estatísticas por navegador
    const porNavegador = await this.findAll({
      attributes: [
        'navegador',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: { ativa: true },
      group: ['navegador'],
      raw: true
    });
    
    // Tempo médio de sessão
    const tempoMedio = await this.findAll({
      attributes: [
        [sequelize.fn('AVG', 
          sequelize.literal('TIMESTAMPDIFF(MINUTE, data_inicio, COALESCE(updated_at, NOW()))')
        ), 'tempo_medio_minutos']
      ],
      where: { ativa: false },
      raw: true
    });

    return {
      total,
      ativas,
      expiradas,
      por_dispositivo: porDispositivo,
      por_navegador: porNavegador,
      tempo_medio_minutos: tempoMedio[0]?.tempo_medio_minutos || 0
    };
  };

  Sessao.obterSessoesUsuario = async function(usuarioId, incluirInativas = false) {
    const where = { usuario_id: usuarioId };
    if (!incluirInativas) {
      where.ativa = true;
    }
    
    return await this.findAll({
      where,
      order: [['data_inicio', 'DESC']],
      limit: 10
    });
  };

  Sessao.encerrarTodasUsuario = async function(usuarioId, motivo = 'Encerramento forçado') {
    const sessoes = await this.findAll({
      where: {
        usuario_id: usuarioId,
        ativa: true
      }
    });
    
    for (const sessao of sessoes) {
      await sessao.encerrar(motivo);
    }
    
    return sessoes.length;
  };

  Sessao.obterDispositivosUsuario = async function(usuarioId) {
    return await this.findAll({
      attributes: [
        'dispositivo',
        'navegador',
        'sistema_operacional',
        'ip_address',
        'data_ultimo_acesso',
        'ativa'
      ],
      where: { usuario_id: usuarioId },
      group: ['dispositivo', 'navegador', 'sistema_operacional', 'ip_address'],
      order: [['data_ultimo_acesso', 'DESC']],
      limit: 20
    });
  };

  // Definir associações
  Sessao.associate = function(models) {
    Sessao.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    
    Sessao.hasMany(models.Auditoria, {
      foreignKey: 'sessao_id',
      as: 'auditorias'
    });
  };

  return Sessao;
};

