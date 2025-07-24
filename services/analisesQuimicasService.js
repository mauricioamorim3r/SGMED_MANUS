// ============================================================================
// SERVICE PARA ANÁLISES QUÍMICAS - SGM
// ============================================================================

const AnaliseQuimica = require('../models/analisesQuimicas');
const { Op } = require('sequelize');

class AnalisesQuimicasService {
  /**
   * Lista análises químicas com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        polo_id, tipo_analise, status, laboratorio, data_inicio, data_fim, 
        search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (polo_id) {
        where.polo_id = polo_id;
      }
      
      if (tipo_analise) {
        where.tipo_analise = tipo_analise;
      }
      
      if (status && status !== 'all') {
        where.status_analise = status;
      }
      
      if (laboratorio) {
        where.laboratorio = {
          [Op.like]: `%${laboratorio}%`
        };
      }
      
      if (data_inicio) {
        where.data_coleta = {
          [Op.gte]: new Date(data_inicio)
        };
      }
      
      if (data_fim) {
        where.data_coleta = {
          ...where.data_coleta,
          [Op.lte]: new Date(data_fim)
        };
      }
      
      if (search) {
        where[Op.or] = [
          { identificacao_amostra: { [Op.like]: `%${search}%` } },
          { laboratorio: { [Op.like]: `%${search}%` } },
          { responsavel_coleta: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await AnaliseQuimica.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_coleta', 'DESC']]
      });
      
      return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(resultado.count / limit)
      };
      
    } catch (error) {
      console.error('Erro no service ao listar análises químicas:', error);
      throw new Error('Erro ao buscar análises químicas');
    }
  }
  
  /**
   * Busca análise química por ID
   */
  async buscarPorId(id) {
    try {
      const analise = await AnaliseQuimica.findByPk(id);
      
      if (!analise) {
        throw new Error('Análise química não encontrada');
      }
      
      return analise;
      
    } catch (error) {
      console.error('Erro no service ao buscar análise química:', error);
      throw error;
    }
  }
  
  /**
   * Cria nova análise química
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Calcular propriedades derivadas
      const dadosCompletos = this.calcularPropriedadesDerivadas(dados);
      
      const novaAnalise = await AnaliseQuimica.create(dadosCompletos);
      
      return novaAnalise;
      
    } catch (error) {
      console.error('Erro no service ao criar análise química:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza análise química existente
   */
  async atualizar(id, dados) {
    try {
      const analise = await this.buscarPorId(id);
      
      // Recalcular propriedades derivadas se dados base foram alterados
      const dadosAtualizados = this.calcularPropriedadesDerivadas({
        ...analise.dataValues,
        ...dados
      });
      
      await analise.update(dadosAtualizados);
      
      return analise;
      
    } catch (error) {
      console.error('Erro no service ao atualizar análise química:', error);
      throw error;
    }
  }
  
  /**
   * Remove análise química
   */
  async remover(id) {
    try {
      const analise = await this.buscarPorId(id);
      
      await analise.destroy();
      
      return { message: 'Análise química removida com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover análise química:', error);
      throw error;
    }
  }
  
  /**
   * Calcula grau API baseado na densidade
   */
  async calcularGrauAPI(densidade_15c_gcm3, densidade_20c_gcm3) {
    try {
      let densidade15c = densidade_15c_gcm3;
      
      // Se só temos densidade a 20°C, fazer correção aproximada para 15°C
      if (!densidade15c && densidade_20c_gcm3) {
        densidade15c = parseFloat((densidade_20c_gcm3 + (5 * 0.0007)).toFixed(4));
      }
      
      if (!densidade15c) {
        throw new Error('Densidade é obrigatória');
      }
      
      // Fórmula: °API = (141.5 / densidade específica a 15°C) - 131.5
      const grauApi = (141.5 / densidade15c) - 131.5;
      
      // Classificação do petróleo baseada no grau API
      let classificacao = '';
      if (grauApi >= 31.1) {
        classificacao = 'Leve';
      } else if (grauApi >= 22.3) {
        classificacao = 'Médio';
      } else if (grauApi >= 10.0) {
        classificacao = 'Pesado';
      } else {
        classificacao = 'Extra Pesado';
      }
      
      return {
        densidade_15c_gcm3: densidade15c,
        densidade_20c_gcm3: densidade_20c_gcm3 || null,
        grau_api: parseFloat(grauApi.toFixed(2)),
        classificacao_petroleo: classificacao,
        densidade_especifica_15c: densidade15c,
        data_calculo: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao calcular grau API:', error);
      throw error;
    }
  }
  
  /**
   * Calcula Índice de Wobbe para gás natural
   */
  async calcularIndiceWobbe(poder_calorifico_kcal_m3, densidade_relativa) {
    try {
      if (!poder_calorifico_kcal_m3) {
        throw new Error('Poder calorífico é obrigatório');
      }
      
      // Densidade relativa padrão para gás natural se não fornecida
      const densRel = densidade_relativa || 0.6;
      
      // Índice de Wobbe = Poder Calorífico / √(densidade relativa)
      const indiceWobbe = poder_calorifico_kcal_m3 / Math.sqrt(densRel);
      
      // Classificação baseada no Índice de Wobbe
      let classificacao = '';
      if (indiceWobbe >= 11700) {
        classificacao = 'Grupo H (Alto)';
      } else if (indiceWobbe >= 10200) {
        classificacao = 'Grupo L (Baixo)';
      } else {
        classificacao = 'Fora de especificação';
      }
      
      return {
        poder_calorifico_kcal_m3: parseFloat(poder_calorifico_kcal_m3),
        densidade_relativa: densRel,
        indice_wobbe: parseFloat(indiceWobbe.toFixed(2)),
        classificacao_gas: classificacao,
        unidade: 'kcal/m³',
        data_calculo: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao calcular Índice de Wobbe:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório detalhado da análise
   */
  async gerarRelatorio(id) {
    try {
      const analise = await this.buscarPorId(id);
      
      // Gerar classificações e interpretações
      const interpretacoes = {};
      
      // Classificação por grau API
      if (analise.grau_api) {
        if (analise.grau_api >= 31.1) {
          interpretacoes.classificacao_api = 'Petróleo Leve - Alta qualidade comercial';
        } else if (analise.grau_api >= 22.3) {
          interpretacoes.classificacao_api = 'Petróleo Médio - Qualidade comercial boa';
        } else if (analise.grau_api >= 10.0) {
          interpretacoes.classificacao_api = 'Petróleo Pesado - Necessita processamento especial';
        } else {
          interpretacoes.classificacao_api = 'Petróleo Extra Pesado - Difícil processamento';
        }
      }
      
      // Avaliação do teor de enxofre
      if (analise.teor_enxofre_percentual !== null) {
        if (analise.teor_enxofre_percentual <= 0.5) {
          interpretacoes.classificacao_enxofre = 'Baixo teor de enxofre - Doce';
        } else if (analise.teor_enxofre_percentual <= 1.0) {
          interpretacoes.classificacao_enxofre = 'Teor médio de enxofre';
        } else {
          interpretacoes.classificacao_enxofre = 'Alto teor de enxofre - Ácido';
        }
      }
      
      // Avaliação da qualidade do gás (se aplicável)
      if (analise.indice_wobbe) {
        if (analise.indice_wobbe >= 11700) {
          interpretacoes.classificacao_gas = 'Gás Natural Grupo H - Alto poder calorífico';
        } else if (analise.indice_wobbe >= 10200) {
          interpretacoes.classificacao_gas = 'Gás Natural Grupo L - Baixo poder calorífico';
        }
      }
      
      const relatorio = {
        ...analise.dataValues,
        interpretacoes,
        resumo_qualidade: {
          produto_comercial: analise.grau_api ? analise.grau_api >= 22.3 : null,
          especificacao_enxofre: analise.teor_enxofre_percentual ? analise.teor_enxofre_percentual <= 1.0 : null,
          qualidade_gas: analise.indice_wobbe ? analise.indice_wobbe >= 10200 : null
        },
        data_relatorio: new Date().toISOString()
      };
      
      return relatorio;
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }
  
  /**
   * Importa análises químicas em lote
   */
  async importarLote(dados) {
    try {
      if (!Array.isArray(dados)) {
        throw new Error('Dados devem ser um array');
      }
      
      const analisesImportadas = [];
      const erros = [];
      
      for (let i = 0; i < dados.length; i++) {
        const analise = dados[i];
        
        try {
          // Validar dados obrigatórios
          if (!analise.identificacao_amostra || !analise.tipo_analise || !analise.data_coleta) {
            erros.push(`Linha ${i + 1}: Identificação da amostra, tipo de análise e data de coleta são obrigatórios`);
            continue;
          }
          
          // Calcular propriedades derivadas
          const dadosCompletos = this.calcularPropriedadesDerivadas(analise);
          
          const novaAnalise = await AnaliseQuimica.create(dadosCompletos);
          analisesImportadas.push(novaAnalise);
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        importadas: analisesImportadas.length,
        erros: erros.length,
        detalhes_erros: erros,
        dados: analisesImportadas
      };
      
    } catch (error) {
      console.error('Erro ao importar análises químicas:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.identificacao_amostra || !dados.tipo_analise || !dados.data_coleta) {
      throw new Error('Identificação da amostra, tipo de análise e data de coleta são obrigatórios');
    }
  }
  
  /**
   * Calcula propriedades derivadas automaticamente
   */
  calcularPropriedadesDerivadas(dados) {
    const dadosCompletos = { ...dados };
    
    // Calcular grau API se densidade fornecida
    if (!dadosCompletos.grau_api && dadosCompletos.densidade_15c_gcm3) {
      dadosCompletos.grau_api = parseFloat(((141.5 / dadosCompletos.densidade_15c_gcm3) - 131.5).toFixed(2));
    }
    
    // Calcular Índice de Wobbe se poder calorífico fornecido
    if (!dadosCompletos.indice_wobbe && dadosCompletos.poder_calorifico_kcal_m3) {
      const densidadeRelativa = 0.6; // Simplificação
      dadosCompletos.indice_wobbe = parseFloat((dadosCompletos.poder_calorifico_kcal_m3 / Math.sqrt(densidadeRelativa)).toFixed(2));
    }
    
    return dadosCompletos;
  }
  
  /**
   * Lista tipos de análises disponíveis
   */
  async listarTipos() {
    return [
      'Análise Completa',
      'Densidade e °API',
      'Viscosidade',
      'Ponto de Fulgor',
      'Teor de Água e Sedimentos',
      'Teor de Enxofre',
      'Número de Acidez',
      'Cromatografia Gasosa',
      'Poder Calorífico',
      'Análise Elementar',
      'Destilação ASTM',
      'Outros'
    ];
  }
  
  /**
   * Lista tipos de produtos analisados
   */
  async listarProdutos() {
    return [
      'Petróleo Cru',
      'Gás Natural',
      'GLP',
      'Gasolina',
      'Diesel',
      'Querosene',
      'Óleo Combustível',
      'Condensado',
      'Nafta',
      'Asfalto',
      'Outros'
    ];
  }
  
  /**
   * Lista métodos de análise disponíveis
   */
  async listarMetodos() {
    return [
      'ASTM D1298',
      'ASTM D4052',
      'ASTM D445',
      'ASTM D93',
      'ASTM D97',
      'ASTM D4006',
      'ASTM D4294',
      'ASTM D664',
      'ASTM D1945',
      'ASTM D3588',
      'ISO 3104',
      'ISO 12185',
      'NBR 7148',
      'NBR 14598',
      'Outros'
    ];
  }
  
  /**
   * Lista status disponíveis para análises
   */
  async listarStatus() {
    return [
      'Coletada',
      'Em Análise',
      'Concluída',
      'Aprovada',
      'Rejeitada',
      'Em Revisão',
      'Arquivada'
    ];
  }
}

module.exports = new AnalisesQuimicasService();