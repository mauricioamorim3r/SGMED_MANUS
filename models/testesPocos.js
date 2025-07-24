// MODELO DE TESTES DE POÇOS (TP) - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Testes de Poços (TP)
 * Conforme PARTE 3: MÓDULOS AVANÇADOS - Especificação revisada
 */
const TestePocos = sequelize.define('testes_pocos', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identificação do Teste
  numero_teste: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  
  // Identificação do Poço
  poco_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  nome_poco: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  
  // Relacionamentos Hierárquicos
  polo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'polos',
      key: 'id'
    }
  },
  instalacao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'instalacoes',
      key: 'id'
    }
  },
  
  // Tipo e Objetivo do Teste
  tipo_teste: {
    type: DataTypes.ENUM('DST', 'RFT', 'MDT', 'PLT', 'Producao', 'Injetividade', 'Interferencia', 'Buildup', 'Drawdown', 'Outro'),
    allowNull: false
  },
  objetivo_teste: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000]
    }
  },
  
  // Programação do Teste
  data_programada: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  data_inicio_real: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_fim_real: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duracao_programada_horas: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  
  // Status do Teste
  status_teste: {
    type: DataTypes.ENUM('Programado', 'Preparacao', 'Executando', 'Concluido', 'Suspenso', 'Cancelado', 'Falha'),
    allowNull: false,
    defaultValue: 'Programado'
  },
  
  // Equipamentos Utilizados
  equipamentos_utilizados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array de equipamentos utilizados'
  },
  
  // Resultados de Produção
  vazao_oleo_m3d: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  vazao_gas_m3d: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  vazao_agua_m3d: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  bsw_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  gor_m3_m3: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  // Condições Operacionais
  condicoes_climaticas: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  problemas_operacionais: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  
  // Amostras e Análises
  amostras_coletadas: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array de amostras coletadas'
  },
  analises_laboratorio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array de análises de laboratório'
  },
  recomendacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
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
    allowNull: true
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
  tableName: 'testes_pocos',
  underscored: true,
  
  // Campos virtuais calculados
  getterMethods: {
    // Duração real calculada
    duracao_real_horas() {
      if (this.data_inicio_real && this.data_fim_real) {
        const inicio = new Date(this.data_inicio_real);
        const fim = new Date(this.data_fim_real);
        return Math.abs((fim - inicio) / (1000 * 60 * 60));
      }
      return null;
    }
  },
  
  // Validações de modelo
  validate: {
    validarDatas() {
      if (this.data_inicio_real && this.data_fim_real) {
        if (new Date(this.data_inicio_real) > new Date(this.data_fim_real)) {
          throw new Error('Data de início não pode ser posterior à data de fim');
        }
      }
    },
    
    validarResultados() {
      if (this.status_teste === 'Concluido') {
        if (!this.data_inicio_real || !this.data_fim_real) {
          throw new Error('Teste concluído deve ter datas de início e fim');
        }
      }
    }
  },
  
  // Hooks
  hooks: {
    beforeUpdate: (teste) => {
      // Validar transições de status
      if (teste.changed('status_teste')) {
        const statusAnterior = teste._previousDataValues.status_teste;
        const novoStatus = teste.status_teste;
        
        const transicoesValidas = {
          'Programado': ['Preparacao', 'Cancelado'],
          'Preparacao': ['Executando', 'Cancelado'],
          'Executando': ['Concluido', 'Suspenso', 'Falha'],
          'Suspenso': ['Executando', 'Cancelado'],
          'Concluido': [], // Status final
          'Cancelado': [], // Status final
          'Falha': [] // Status final
        };
        
        if (!transicoesValidas[statusAnterior]?.includes(novoStatus)) {
          throw new Error(`Transição de status inválida: ${statusAnterior} → ${novoStatus}`);
        }
      }
    }
  }
});

module.exports = TestePocos;

