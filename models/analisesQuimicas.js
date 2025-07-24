// MODELO DE ANÁLISES FÍSICO-QUÍMICAS (FQ) - SGM
// ============================================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/config');

/**
 * Modelo para Análises Físico-Químicas (FQ)
 * Conforme PARTE 3: MÓDULOS AVANÇADOS - Especificação revisada
 */
const AnaliseQuimica = sequelize.define('analises_quimicas', {
  // Chave Primária
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Identificação da Análise
  numero_analise: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  numero_amostra: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
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
  ponto_medicao_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pontos_medicao',
      key: 'id'
    }
  },
  teste_poco_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'testes_pocos',
      key: 'id'
    }
  },
  
  // Tipo da Amostra e Análise
  tipo_amostra: {
    type: DataTypes.ENUM('Oleo_Cru', 'Gas_Natural', 'Agua_Producao', 'Condensado', 'GLP', 'Gasolina', 'Diesel', 'Querosene', 'Outro'),
    allowNull: false
  },
  tipo_analise: {
    type: DataTypes.ENUM('BSW', 'Cromatografia', 'PVT', 'Densidade', 'Viscosidade', 'Ponto_Fulgor', 'API', 'Teor_Enxofre', 'Outro'),
    allowNull: false
  },
  
  // Coleta da Amostra
  metodo_coleta: {
    type: DataTypes.ENUM('Manual', 'Automatico', 'Outro'),
    allowNull: false
  },
  data_coleta: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  condicoes_coleta: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  temperatura_coleta_c: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: -273.15
    }
  },
  pressao_coleta_bar: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  volume_amostra_ml: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0.01
    }
  },
  recipiente_coleta: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  
  // Laboratório
  data_recebimento_lab: {
    type: DataTypes.DATE,
    allowNull: true
  },
  laboratorio_analise: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  data_inicio_analise: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_fim_analise: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metodo_ensaio: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  norma_referencia: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  
  // Propriedades Físicas
  densidade_15c_kg_m3: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    validate: {
      min: 0.01
    }
  },
  viscosidade_40c_cst: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  viscosidade_100c_cst: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  ponto_fulgor_c: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: -273.15
    }
  },
  ponto_fluidez_c: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    validate: {
      min: -273.15
    }
  },
  
  // Composição Química
  teor_enxofre_ppm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  teor_agua_ppm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  teor_sal_mg_l: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  acidez_total_mg_koh_g: {
    type: DataTypes.DECIMAL(6, 3),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  corrosividade_lamina_cu: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20]
    }
  },
  residuo_carbono_percentual: {
    type: DataTypes.DECIMAL(5, 3),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  cinzas_percentual: {
    type: DataTypes.DECIMAL(5, 3),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  
  // Composição Cromatográfica
  metano_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  etano_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  propano_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  butano_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  co2_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  n2_percentual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  h2s_ppm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  poder_calorifico_mj_m3: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  indice_wobbe_mj_m3: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  
  // Dados Adicionais (JSON)
  composicao_detalhada: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com composição detalhada'
  },
  curva_destilacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com dados da curva de destilação'
  },
  resultados_adicionais: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com outros resultados'
  },
  
  // Controle de Qualidade
  incerteza_medicao: {
    type: DataTypes.DECIMAL(6, 4),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  limite_deteccao: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  limite_quantificacao: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  controle_qualidade: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com dados de controle de qualidade'
  },
  duplicatas_realizadas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  brancos_analisados: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  padroes_utilizados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array com padrões de referência utilizados'
  },
  
  // Status e Conformidade
  status_analise: {
    type: DataTypes.ENUM('Programada', 'Coletada', 'Em_Analise', 'Concluida', 'Aprovada', 'Rejeitada', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Programada'
  },
  observacoes_conformidade: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  validade_resultado: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  certificado_analise: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
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
  tableName: 'analises_quimicas',
  underscored: true,
  
  // Campos virtuais calculados
  getterMethods: {
    // Densidade API calculada
    densidade_api() {
      if (this.densidade_15c_kg_m3) {
        return (141.5 / (this.densidade_15c_kg_m3 / 1000)) - 131.5;
      }
      return null;
    },
    
    // Conformidade ANP calculada
    conforme_anp() {
      // Implementar lógica de conformidade baseada no tipo de amostra
      // e especificações ANP
      return true; // Placeholder
    }
  },
  
  // Validações de modelo
  validate: {
    validarDatas() {
      if (this.data_coleta && this.data_recebimento_lab) {
        if (new Date(this.data_coleta) > new Date(this.data_recebimento_lab)) {
          throw new Error('Data de coleta não pode ser posterior ao recebimento no laboratório');
        }
      }
      
      if (this.data_inicio_analise && this.data_fim_analise) {
        if (new Date(this.data_inicio_analise) > new Date(this.data_fim_analise)) {
          throw new Error('Data de início da análise não pode ser posterior ao fim');
        }
      }
    },
    
    validarComposicao() {
      // Validar composição de gás natural (soma deve ser ~100%)
      if (this.tipo_amostra === 'Gas_Natural') {
        const componentes = [
          this.metano_percentual || 0,
          this.etano_percentual || 0,
          this.propano_percentual || 0,
          this.butano_percentual || 0,
          this.co2_percentual || 0,
          this.n2_percentual || 0
        ];
        
        const soma = componentes.reduce((acc, val) => acc + val, 0);
        
        if (soma > 0 && (soma < 95 || soma > 105)) {
          throw new Error('Soma dos componentes deve estar entre 95% e 105%');
        }
      }
    }
  },
  
  // Hooks
  hooks: {
    beforeUpdate: (analise) => {
      // Validar transições de status
      if (analise.changed('status_analise')) {
        const statusAnterior = analise._previousDataValues.status_analise;
        const novoStatus = analise.status_analise;
        
        const transicoesValidas = {
          'Programada': ['Coletada', 'Cancelada'],
          'Coletada': ['Em_Analise', 'Cancelada'],
          'Em_Analise': ['Concluida', 'Cancelada'],
          'Concluida': ['Aprovada', 'Rejeitada'],
          'Aprovada': [], // Status final
          'Rejeitada': ['Em_Analise'], // Pode reanalizar
          'Cancelada': [] // Status final
        };
        
        if (!transicoesValidas[statusAnterior]?.includes(novoStatus)) {
          throw new Error(`Transição de status inválida: ${statusAnterior} → ${novoStatus}`);
        }
      }
    }
  }
});

module.exports = AnaliseQuimica;

