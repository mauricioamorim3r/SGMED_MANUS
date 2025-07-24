// ============================================================================
// SERVICE PARA PLACAS DE ORIFÍCIO - SGM
// ============================================================================

const PlacaOrificio = require('../models/placasOrificio');
const { Op } = require('sequelize');

class PlacasOrificioService {
  /**
   * Lista placas de orifício com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        tag_ponto, status, fabricante, search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (tag_ponto) {
        where.tag_ponto = tag_ponto;
      }
      
      if (status && status !== 'all') {
        where.status_placa = status;
      }
      
      if (fabricante) {
        where.fabricante = {
          [Op.like]: `%${fabricante}%`
        };
      }
      
      if (search) {
        where[Op.or] = [
          { tag_ponto: { [Op.like]: `%${search}%` } },
          { numero_serie: { [Op.like]: `%${search}%` } },
          { fabricante: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await PlacaOrificio.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['tag_ponto', 'ASC']]
      });
      
      return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(resultado.count / limit)
      };
      
    } catch (error) {
      console.error('Erro no service ao listar placas de orifício:', error);
      throw new Error('Erro ao buscar placas de orifício');
    }
  }
  
  /**
   * Busca placa de orifício por ID
   */
  async buscarPorId(id) {
    try {
      const placa = await PlacaOrificio.findByPk(id);
      
      if (!placa) {
        throw new Error('Placa de orifício não encontrada');
      }
      
      return placa;
      
    } catch (error) {
      console.error('Erro no service ao buscar placa de orifício:', error);
      throw error;
    }
  }
  
  /**
   * Cria nova placa de orifício
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Calcular β ratio e validar especificações
      const dadosCompletos = this.calcularEspecificacoes(dados);
      
      const novaPlaca = await PlacaOrificio.create(dadosCompletos);
      
      return novaPlaca;
      
    } catch (error) {
      console.error('Erro no service ao criar placa de orifício:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza placa de orifício existente
   */
  async atualizar(id, dados) {
    try {
      const placa = await this.buscarPorId(id);
      
      // Recalcular especificações se diâmetros foram alterados
      const dadosAtualizados = this.calcularEspecificacoes({
        ...placa.dataValues,
        ...dados
      });
      
      await placa.update(dadosAtualizados);
      
      return placa;
      
    } catch (error) {
      console.error('Erro no service ao atualizar placa de orifício:', error);
      throw error;
    }
  }
  
  /**
   * Remove placa de orifício
   */
  async remover(id) {
    try {
      const placa = await this.buscarPorId(id);
      
      await placa.destroy();
      
      return { message: 'Placa de orifício removida com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover placa de orifício:', error);
      throw error;
    }
  }
  
  /**
   * Calcula β ratio baseado nos diâmetros
   */
  async calcularBetaRatio(diametro_orificio, diametro_tubulacao) {
    try {
      if (!diametro_orificio || !diametro_tubulacao) {
        throw new Error('Diâmetros do orifício e da tubulação são obrigatórios');
      }
      
      const d = parseFloat(diametro_orificio);
      const D = parseFloat(diametro_tubulacao);
      
      if (d >= D) {
        throw new Error('Diâmetro do orifício deve ser menor que o da tubulação');
      }
      
      const betaRatio = d / D;
      
      // Verificar se está dentro dos limites da norma ISO 5167
      let validacao_norma = '';
      if (betaRatio >= 0.1 && betaRatio <= 0.75) {
        validacao_norma = 'Conforme ISO 5167';
      } else if (betaRatio < 0.1) {
        validacao_norma = 'Abaixo do limite mínimo (β < 0.1)';
      } else {
        validacao_norma = 'Acima do limite máximo (β > 0.75)';
      }
      
      // Calcular área do orifício
      const area_orificio = Math.PI * Math.pow(d / 2, 2);
      const area_tubulacao = Math.PI * Math.pow(D / 2, 2);
      const razao_areas = area_orificio / area_tubulacao;
      
      return {
        diametro_orificio: d,
        diametro_tubulacao: D,
        beta_ratio: parseFloat(betaRatio.toFixed(4)),
        area_orificio_mm2: parseFloat(area_orificio.toFixed(2)),
        area_tubulacao_mm2: parseFloat(area_tubulacao.toFixed(2)),
        razao_areas: parseFloat(razao_areas.toFixed(4)),
        validacao_norma,
        atende_iso5167: betaRatio >= 0.1 && betaRatio <= 0.75,
        data_calculo: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao calcular β ratio:', error);
      throw error;
    }
  }
  
  /**
   * Valida especificações da placa conforme normas
   */
  async validarEspecificacoes(id) {
    try {
      const placa = await this.buscarPorId(id);
      
      const validacoes = {
        beta_ratio_adequado: placa.beta_ratio >= 0.1 && placa.beta_ratio <= 0.75,
        espessura_adequada: placa.espessura_placa >= 1.0 && placa.espessura_placa <= 5.0,
        material_apropriado: ['Aço Inox 316', 'Aço Carbono', 'Hastelloy'].includes(placa.material_placa),
        acabamento_superficial: placa.rugosidade_superficial <= 0.0001, // Ra ≤ 0.1 μm
        certificado_dimensional: placa.certificado_dimensional !== null,
        certificado_material: placa.certificado_material !== null
      };
      
      const conformidade = Object.values(validacoes).every(v => v === true);
      
      return {
        ...validacoes,
        conformidade_geral: conformidade,
        recomendacoes: this.gerarRecomendacoes(validacoes),
        normas_aplicaveis: ['ISO 5167-2', 'AGA-3', 'API MPMS 14.3'],
        data_validacao: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao validar especificações:', error);
      throw error;
    }
  }
  
  /**
   * Calcula coeficiente de descarga (Cd) simplificado
   */
  async calcularCoeficienteDescarga(dadosCalculo) {
    try {
      const {
        beta_ratio,
        numero_reynolds,
        rugosidade_relativa = 0.0001
      } = dadosCalculo;
      
      if (!beta_ratio || !numero_reynolds) {
        throw new Error('β ratio e número de Reynolds são obrigatórios');
      }
      
      const β = parseFloat(beta_ratio);
      const Re = parseFloat(numero_reynolds);
      
      // Fórmula simplificada da ISO 5167-2 para placas de orifício com tomadas de canto
      // Cd = 0.5961 + 0.0261β² - 0.216β⁸ + 0.000521(10⁶β/Re)^0.7 + ...
      
      const A = 0.5961;
      const B = 0.0261 * Math.pow(β, 2);
      const C = -0.216 * Math.pow(β, 8);
      const D = 0.000521 * Math.pow((1000000 * β) / Re, 0.7);
      
      // Simplificação - fórmula completa é mais complexa
      const Cd = A + B + C + D;
      
      // Fator de expansibilidade (para gases)
      const epsilon = 1.0; // Simplificado - para líquidos
      
      return {
        beta_ratio: β,
        numero_reynolds: Re,
        coeficiente_descarga: parseFloat(Cd.toFixed(6)),
        fator_expansibilidade: epsilon,
        incerteza_cd: 0.5, // Típica para placas bem dimensionadas (%)
        aplicabilidade: {
          re_minimo: 5000,
          re_maximo: 1000000,
          beta_minimo: 0.1,
          beta_maximo: 0.75,
          atende_requisitos: Re >= 5000 && Re <= 1000000 && β >= 0.1 && β <= 0.75
        },
        data_calculo: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao calcular coeficiente de descarga:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório técnico da placa
   */
  async gerarRelatorioTecnico(id) {
    try {
      const placa = await this.buscarPorId(id);
      const validacao = await this.validarEspecificacoes(id);
      
      // Calcular parâmetros derivados
      const betaCalculos = await this.calcularBetaRatio(placa.diametro_orificio, placa.diametro_tubulacao);
      
      const relatorio = {
        ...placa.dataValues,
        calculos: betaCalculos,
        validacao,
        classificacao: {
          faixa_beta: this.classificarBetaRatio(placa.beta_ratio),
          aplicacao_tipica: this.determinarAplicacao(placa.beta_ratio),
          precisao_esperada: this.estimarPrecisao(placa.beta_ratio)
        },
        manutencao: {
          proxima_inspecao: this.calcularProximaInspecao(placa.data_instalacao),
          vida_util_estimada: '5-10 anos (dependendo das condições)',
          criterios_substituicao: [
            'Desgaste do orifício > 2%',
            'Corrosão visível',
            'Danos mecânicos',
            'Perda de certificação'
          ]
        },
        data_relatorio: new Date().toISOString()
      };
      
      return relatorio;
      
    } catch (error) {
      console.error('Erro ao gerar relatório técnico:', error);
      throw error;
    }
  }
  
  /**
   * Importa placas de orifício em lote
   */
  async importarLote(dados) {
    try {
      if (!Array.isArray(dados)) {
        throw new Error('Dados devem ser um array');
      }
      
      const placasImportadas = [];
      const erros = [];
      
      for (let i = 0; i < dados.length; i++) {
        const placa = dados[i];
        
        try {
          // Validar dados obrigatórios
          if (!placa.tag_ponto || !placa.diametro_orificio || !placa.diametro_tubulacao) {
            erros.push(`Linha ${i + 1}: Tag do ponto e diâmetros são obrigatórios`);
            continue;
          }
          
          const dadosCompletos = this.calcularEspecificacoes(placa);
          const novaPlaca = await PlacaOrificio.create(dadosCompletos);
          placasImportadas.push(novaPlaca);
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        importadas: placasImportadas.length,
        erros: erros.length,
        detalhes_erros: erros,
        dados: placasImportadas
      };
      
    } catch (error) {
      console.error('Erro ao importar placas de orifício:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.tag_ponto || !dados.diametro_orificio || !dados.diametro_tubulacao) {
      throw new Error('Tag do ponto e diâmetros são obrigatórios');
    }
  }
  
  /**
   * Calcula especificações da placa
   */
  calcularEspecificacoes(dados) {
    const dadosCompletos = { ...dados };
    
    // Calcular β ratio se não fornecido
    if (!dadosCompletos.beta_ratio && dados.diametro_orificio && dados.diametro_tubulacao) {
      const d = parseFloat(dados.diametro_orificio);
      const D = parseFloat(dados.diametro_tubulacao);
      dadosCompletos.beta_ratio = parseFloat((d / D).toFixed(4));
    }
    
    // Validar conformidade com norma
    if (dadosCompletos.beta_ratio) {
      dadosCompletos.atende_iso5167 = dadosCompletos.beta_ratio >= 0.1 && dadosCompletos.beta_ratio <= 0.75;
    }
    
    return dadosCompletos;
  }
  
  /**
   * Classifica β ratio
   */
  classificarBetaRatio(betaRatio) {
    if (betaRatio < 0.2) return 'Baixo β (alta perda de carga)';
    if (betaRatio < 0.5) return 'Médio β (balanceado)';
    if (betaRatio < 0.7) return 'Alto β (baixa perda de carga)';
    return 'Muito alto β (limite superior)';
  }
  
  /**
   * Determina aplicação típica
   */
  determinarAplicacao(betaRatio) {
    if (betaRatio < 0.3) return 'Medição de alta precisão, baixas vazões';
    if (betaRatio < 0.6) return 'Aplicação geral, bom compromisso';
    return 'Altas vazões, menor perda de carga';
  }
  
  /**
   * Estima precisão esperada
   */
  estimarPrecisao(betaRatio) {
    if (betaRatio >= 0.2 && betaRatio <= 0.6) return '±0.5% (ótima)';
    if (betaRatio >= 0.1 && betaRatio < 0.2) return '±0.7% (boa)';
    if (betaRatio > 0.6 && betaRatio <= 0.75) return '±1.0% (aceitável)';
    return '±2.0% (limitada)';
  }
  
  /**
   * Calcula próxima inspeção
   */
  calcularProximaInspecao(dataInstalacao) {
    if (!dataInstalacao) return null;
    
    const instalacao = new Date(dataInstalacao);
    const proximaInspecao = new Date(instalacao);
    proximaInspecao.setFullYear(instalacao.getFullYear() + 2); // 2 anos típico
    
    return proximaInspecao.toISOString().split('T')[0];
  }
  
  /**
   * Gera recomendações baseadas na validação
   */
  gerarRecomendacoes(validacoes) {
    const recomendacoes = [];
    
    if (!validacoes.beta_ratio_adequado) {
      recomendacoes.push('Ajustar β ratio para faixa 0.1 ≤ β ≤ 0.75');
    }
    
    if (!validacoes.espessura_adequada) {
      recomendacoes.push('Verificar espessura da placa (1.0 a 5.0 mm)');
    }
    
    if (!validacoes.material_apropriado) {
      recomendacoes.push('Utilizar material apropriado (Aço Inox 316, Aço Carbono, Hastelloy)');
    }
    
    if (!validacoes.acabamento_superficial) {
      recomendacoes.push('Melhorar acabamento superficial (Ra ≤ 0.1 μm)');
    }
    
    if (!validacoes.certificado_dimensional) {
      recomendacoes.push('Obter certificado dimensional da placa');
    }
    
    if (!validacoes.certificado_material) {
      recomendacoes.push('Obter certificado de material da placa');
    }
    
    if (recomendacoes.length === 0) {
      recomendacoes.push('Placa atende a todos os requisitos normativos');
    }
    
    return recomendacoes;
  }
  
  /**
   * Lista materiais disponíveis
   */
  async listarMateriais() {
    return [
      'Aço Inox 316',
      'Aço Inox 316L',
      'Aço Carbono',
      'Hastelloy C-276',
      'Inconel 625',
      'Monel 400',
      'Duplex 2205',
      'Outros'
    ];
  }
  
  /**
   * Lista tipos de tomada de pressão
   */
  async listarTiposTomada() {
    return [
      'Canto (Corner)',
      'D e D/2',
      'Flange',
      'Vena Contracta',
      'Tubo de Pitot'
    ];
  }
  
  /**
   * Lista status disponíveis
   */
  async listarStatus() {
    return [
      'Instalada',
      'Em Estoque',
      'Em Manutenção',
      'Aguardando Calibração',
      'Descartada',
      'Em Fabricação'
    ];
  }
}

module.exports = new PlacasOrificioService();