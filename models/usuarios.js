// MODELO USUÁRIOS - PARTE 5: SISTEMA E SEGURANÇA
// ============================================================================

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Chave primária auto-incremento'
    },
    nome_usuario: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      },
      comment: 'Nome completo do usuário'
    },
    login: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50]
      },
      comment: 'Login único do usuário'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [1, 100]
      },
      comment: 'Email do usuário'
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Hash da senha (bcrypt)'
    },
    salt: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: 'Salt para hash da senha'
    },
    perfil_usuario: {
      type: DataTypes.ENUM('Administrador', 'Supervisor', 'Tecnico', 'Consulta', 'Auditor'),
      allowNull: false,
      comment: 'Perfil hierárquico'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Usuário ativo/inativo'
    },
    primeiro_acesso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Primeiro acesso'
    },
    senha_temporaria: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Senha temporária'
    },
    data_expiracao_senha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isAfter: new Date().toISOString().split('T')[0]
      },
      comment: 'Data expiração da senha'
    },
    deve_alterar_senha: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Deve alterar senha'
    },
    tentativas_login: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'Tentativas de login'
    },
    bloqueado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Usuário bloqueado'
    },
    data_bloqueio: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data do bloqueio'
    },
    motivo_bloqueio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      },
      comment: 'Motivo do bloqueio'
    },
    ultimo_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data do último login'
    },
    ultimo_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        isIP: true
      },
      comment: 'Último IP de acesso'
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação'
    },
    data_alteracao_senha: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data alteração senha'
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: [0, 20]
      },
      comment: 'Telefone de contato'
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      },
      comment: 'Cargo do usuário'
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      },
      comment: 'Departamento'
    },
    empresa: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      },
      comment: 'Empresa'
    },
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 20]
      },
      comment: 'Matrícula funcional'
    },
    supervisor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Supervisor direto'
    },
    polos_acesso: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('polos_acesso');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('polos_acesso', JSON.stringify(value || []));
      },
      comment: 'Polos com acesso (JSON array)'
    },
    instalacoes_acesso: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('instalacoes_acesso');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('instalacoes_acesso', JSON.stringify(value || []));
      },
      comment: 'Instalações com acesso (JSON array)'
    },
    restricao_localizacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Tem restrição de localização'
    },
    permissao_equipamentos: {
      type: DataTypes.ENUM('Nenhuma', 'Consulta', 'Edicao', 'Total'),
      allowNull: false,
      defaultValue: 'Nenhuma',
      comment: 'Permissão equipamentos'
    },
    permissao_calibracao: {
      type: DataTypes.ENUM('Nenhuma', 'Consulta', 'Edicao', 'Total'),
      allowNull: false,
      defaultValue: 'Nenhuma',
      comment: 'Permissão calibração'
    },
    permissao_certificados: {
      type: DataTypes.ENUM('Nenhuma', 'Consulta', 'Edicao', 'Total'),
      allowNull: false,
      defaultValue: 'Nenhuma',
      comment: 'Permissão certificados'
    },
    permissao_relatorios: {
      type: DataTypes.ENUM('Nenhuma', 'Consulta', 'Edicao', 'Total'),
      allowNull: false,
      defaultValue: 'Nenhuma',
      comment: 'Permissão relatórios'
    },
    permissao_configuracao: {
      type: DataTypes.ENUM('Nenhuma', 'Consulta', 'Edicao', 'Total'),
      allowNull: false,
      defaultValue: 'Nenhuma',
      comment: 'Permissão configuração'
    },
    permissao_auditoria: {
      type: DataTypes.ENUM('Nenhuma', 'Consulta', 'Edicao', 'Total'),
      allowNull: false,
      defaultValue: 'Nenhuma',
      comment: 'Permissão auditoria'
    },
    pode_aprovar_movimentacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Pode aprovar movimentações'
    },
    pode_aprovar_moc: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Pode aprovar MOCs'
    },
    nivel_aprovacao_moc: {
      type: DataTypes.ENUM('Tecnico', 'Seguranca', 'Ambiental', 'Financeiro', 'Gerencial'),
      allowNull: true,
      comment: 'Nível aprovação MOC'
    },
    limite_aprovacao_financeira: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: {
        min: 0
      },
      comment: 'Limite aprovação (R$)'
    },
    configuracoes_pessoais: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('configuracoes_pessoais');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('configuracoes_pessoais', JSON.stringify(value || {}));
      },
      comment: 'Configurações pessoais (JSON object)'
    },
    tema_interface: {
      type: DataTypes.ENUM('Claro', 'Escuro', 'Auto'),
      allowNull: false,
      defaultValue: 'Claro',
      comment: 'Tema da interface'
    },
    idioma: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'pt-BR',
      comment: 'Idioma preferido'
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'America/Sao_Paulo',
      comment: 'Fuso horário'
    },
    notificacoes_email: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Receber notificações email'
    },
    notificacoes_sistema: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Receber notificações sistema'
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      },
      comment: 'Observações sobre o usuário'
    },
    criado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Usuário criador'
    },
    alterado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      comment: 'Usuário que alterou'
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['login']
      },
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['matricula'],
        where: {
          matricula: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['perfil_usuario']
      },
      {
        fields: ['ativo']
      },
      {
        fields: ['bloqueado']
      },
      {
        fields: ['supervisor_id']
      }
    ],
    hooks: {
      beforeCreate: async (usuario) => {
        // Gerar salt único
        usuario.salt = crypto.randomBytes(16).toString('hex');
        
        // Definir data de expiração da senha (90 dias)
        if (!usuario.data_expiracao_senha) {
          const dataExpiracao = new Date();
          dataExpiracao.setDate(dataExpiracao.getDate() + 90);
          usuario.data_expiracao_senha = dataExpiracao.toISOString().split('T')[0];
        }
        
        // Definir permissões padrão baseadas no perfil
        await usuario.definirPermissoesPadrao();
      },
      beforeUpdate: async (usuario) => {
        // Se alterou a senha, atualizar data de alteração
        if (usuario.changed('senha_hash')) {
          usuario.data_alteracao_senha = new Date();
          usuario.deve_alterar_senha = false;
          usuario.primeiro_acesso = false;
          usuario.senha_temporaria = false;
          usuario.tentativas_login = 0;
          
          // Nova data de expiração
          const dataExpiracao = new Date();
          dataExpiracao.setDate(dataExpiracao.getDate() + 90);
          usuario.data_expiracao_senha = dataExpiracao.toISOString().split('T')[0];
        }
        
        // Se alterou o perfil, redefinir permissões
        if (usuario.changed('perfil_usuario')) {
          await usuario.definirPermissoesPadrao();
        }
      }
    }
  });

  // Métodos de instância
  Usuario.prototype.hashSenha = async function(senha) {
    if (!this.salt) {
      this.salt = crypto.randomBytes(16).toString('hex');
    }
    this.senha_hash = await bcrypt.hash(senha + this.salt, 12);
  };

  Usuario.prototype.verificarSenha = async function(senha) {
    return await bcrypt.compare(senha + this.salt, this.senha_hash);
  };

  Usuario.prototype.definirPermissoesPadrao = async function() {
    const permissoesPorPerfil = {
      'Administrador': {
        permissao_equipamentos: 'Total',
        permissao_calibracao: 'Total',
        permissao_certificados: 'Total',
        permissao_relatorios: 'Total',
        permissao_configuracao: 'Total',
        permissao_auditoria: 'Total',
        pode_aprovar_movimentacao: true,
        pode_aprovar_moc: true,
        nivel_aprovacao_moc: 'Gerencial',
        limite_aprovacao_financeira: 1000000.00
      },
      'Supervisor': {
        permissao_equipamentos: 'Total',
        permissao_calibracao: 'Total',
        permissao_certificados: 'Total',
        permissao_relatorios: 'Total',
        permissao_configuracao: 'Edicao',
        permissao_auditoria: 'Consulta',
        pode_aprovar_movimentacao: true,
        pode_aprovar_moc: true,
        nivel_aprovacao_moc: 'Tecnico',
        limite_aprovacao_financeira: 100000.00
      },
      'Tecnico': {
        permissao_equipamentos: 'Edicao',
        permissao_calibracao: 'Edicao',
        permissao_certificados: 'Edicao',
        permissao_relatorios: 'Consulta',
        permissao_configuracao: 'Nenhuma',
        permissao_auditoria: 'Nenhuma',
        pode_aprovar_movimentacao: false,
        pode_aprovar_moc: false,
        nivel_aprovacao_moc: null,
        limite_aprovacao_financeira: null
      },
      'Consulta': {
        permissao_equipamentos: 'Consulta',
        permissao_calibracao: 'Consulta',
        permissao_certificados: 'Consulta',
        permissao_relatorios: 'Consulta',
        permissao_configuracao: 'Nenhuma',
        permissao_auditoria: 'Nenhuma',
        pode_aprovar_movimentacao: false,
        pode_aprovar_moc: false,
        nivel_aprovacao_moc: null,
        limite_aprovacao_financeira: null
      },
      'Auditor': {
        permissao_equipamentos: 'Consulta',
        permissao_calibracao: 'Consulta',
        permissao_certificados: 'Consulta',
        permissao_relatorios: 'Total',
        permissao_configuracao: 'Nenhuma',
        permissao_auditoria: 'Total',
        pode_aprovar_movimentacao: false,
        pode_aprovar_moc: false,
        nivel_aprovacao_moc: null,
        limite_aprovacao_financeira: null
      }
    };

    const permissoes = permissoesPorPerfil[this.perfil_usuario];
    if (permissoes) {
      Object.assign(this, permissoes);
    }
  };

  Usuario.prototype.bloquear = async function(motivo, usuarioId) {
    this.bloqueado = true;
    this.data_bloqueio = new Date();
    this.motivo_bloqueio = motivo;
    this.alterado_por = usuarioId;
    await this.save();
  };

  Usuario.prototype.desbloquear = async function(usuarioId) {
    this.bloqueado = false;
    this.data_bloqueio = null;
    this.motivo_bloqueio = null;
    this.tentativas_login = 0;
    this.alterado_por = usuarioId;
    await this.save();
  };

  Usuario.prototype.incrementarTentativasLogin = async function() {
    this.tentativas_login += 1;
    
    // Bloquear após 5 tentativas
    if (this.tentativas_login >= 5) {
      await this.bloquear('Excesso de tentativas de login', null);
    } else {
      await this.save();
    }
  };

  Usuario.prototype.registrarLogin = async function(ip) {
    this.ultimo_login = new Date();
    this.ultimo_ip = ip;
    this.tentativas_login = 0;
    await this.save();
  };

  Usuario.prototype.senhaExpirada = function() {
    if (!this.data_expiracao_senha) return false;
    return new Date() > new Date(this.data_expiracao_senha);
  };

  Usuario.prototype.temPermissao = function(modulo, acao) {
    const campoPermissao = `permissao_${modulo}`;
    const permissao = this[campoPermissao];
    
    if (!permissao || permissao === 'Nenhuma') return false;
    
    switch (acao) {
      case 'consulta':
        return ['Consulta', 'Edicao', 'Total'].includes(permissao);
      case 'edicao':
        return ['Edicao', 'Total'].includes(permissao);
      case 'total':
        return permissao === 'Total';
      default:
        return false;
    }
  };

  Usuario.prototype.temAcessoLocalizacao = function(poloId, instalacaoId) {
    if (!this.restricao_localizacao) return true;
    
    const polosAcesso = this.polos_acesso || [];
    const instalacoesAcesso = this.instalacoes_acesso || [];
    
    // Verificar acesso ao polo
    if (poloId && !polosAcesso.includes(poloId)) return false;
    
    // Verificar acesso à instalação
    if (instalacaoId && !instalacoesAcesso.includes(instalacaoId)) return false;
    
    return true;
  };

  Usuario.prototype.gerarSenhaTemporaria = function() {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  };

  // Métodos estáticos
  Usuario.obterEstatisticas = async function() {
    const total = await this.count({ where: { ativo: true } });
    const porPerfil = await this.findAll({
      attributes: [
        'perfil_usuario',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: { ativo: true },
      group: ['perfil_usuario'],
      raw: true
    });
    
    const bloqueados = await this.count({ 
      where: { ativo: true, bloqueado: true } 
    });
    
    const senhasExpiradas = await this.count({
      where: {
        ativo: true,
        data_expiracao_senha: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });
    
    const primeiroAcesso = await this.count({
      where: { ativo: true, primeiro_acesso: true }
    });

    return {
      total,
      por_perfil: porPerfil,
      bloqueados,
      senhas_expiradas: senhasExpiradas,
      primeiro_acesso: primeiroAcesso
    };
  };

  Usuario.obterUsuariosVencendoSenha = async function(dias = 7) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);
    
    return await this.findAll({
      where: {
        ativo: true,
        bloqueado: false,
        data_expiracao_senha: {
          [sequelize.Sequelize.Op.between]: [new Date(), dataLimite]
        }
      },
      attributes: ['id', 'nome_usuario', 'email', 'data_expiracao_senha'],
      order: [['data_expiracao_senha', 'ASC']]
    });
  };

  Usuario.obterHierarquia = async function(usuarioId) {
    const usuario = await this.findByPk(usuarioId, {
      include: [
        {
          model: this,
          as: 'supervisor',
          attributes: ['id', 'nome_usuario', 'perfil_usuario']
        },
        {
          model: this,
          as: 'subordinados',
          attributes: ['id', 'nome_usuario', 'perfil_usuario']
        }
      ]
    });
    
    return usuario;
  };

  // Definir associações
  Usuario.associate = function(models) {
    // Auto-relacionamento para hierarquia
    Usuario.belongsTo(models.Usuario, {
      foreignKey: 'supervisor_id',
      as: 'supervisor'
    });
    
    Usuario.hasMany(models.Usuario, {
      foreignKey: 'supervisor_id',
      as: 'subordinados'
    });
    
    // Relacionamento com criação/alteração
    Usuario.belongsTo(models.Usuario, {
      foreignKey: 'criado_por',
      as: 'criador'
    });
    
    Usuario.belongsTo(models.Usuario, {
      foreignKey: 'alterado_por',
      as: 'alterador'
    });
    
    // Relacionamentos com outros módulos
    Usuario.hasMany(models.Sessao, {
      foreignKey: 'usuario_id',
      as: 'sessoes'
    });
    
    Usuario.hasMany(models.Auditoria, {
      foreignKey: 'usuario_id',
      as: 'auditorias'
    });
  };

  return Usuario;
};

