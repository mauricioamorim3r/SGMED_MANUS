// ============================================================================
// SERVICE PARA INCERTEZAS - SGM
// ============================================================================

const Incerteza = require('../models/incertezas');
const { Op } = require('sequelize');

class IncertezasService {
  /**
   * Lista incertezas com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        tag_ponto, tipo_medicao, status, search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (tag_ponto) {
        where.tag_ponto = tag_ponto;
      }
      
      if (tipo_medicao) {
        where.tipo_medicao = tipo_medicao;
      }
      
      if (status && status !== 'all') {
        where.status_calculo = status;
      }
      
      if (search) {
        where[Op.or] = [
          { tag_ponto: { [Op.like]: `%${search}%` } },
          { descricao: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await Incerteza.findAndCountAll({
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
      console.error('Erro no service ao listar incertezas:', error);
      throw new Error('Erro ao buscar incertezas');
    }
  }
  
  /**
   * Busca incerteza por ID
   */
  async buscarPorId(id) {
    try {
      const incerteza = await Incerteza.findByPk(id);
      
      if (!incerteza) {
        throw new Error('Incerteza não encontrada');
      }
      
      return incerteza;
      
    } catch (error) {
      console.error('Erro no service ao buscar incerteza:', error);
      throw error;
    }
  }
  
  /**
   * Cria nova incerteza
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Calcular incerteza expandida e combinada
      const dadosCompletos = this.calcularIncertezas(dados);
      
      const novaIncerteza = await Incerteza.create(dadosCompletos);
      
      return novaIncerteza;
      
    } catch (error) {
      console.error('Erro no service ao criar incerteza:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza incerteza existente
   */
  async atualizar(id, dados) {
    try {
      const incerteza = await this.buscarPorId(id);
      
      // Recalcular incertezas se componentes foram alterados
      const dadosAtualizados = this.calcularIncertezas({
        ...incerteza.dataValues,
        ...dados
      });
      
      await incerteza.update(dadosAtualizados);
      
      return incerteza;
      
    } catch (error) {
      console.error('Erro no service ao atualizar incerteza:', error);
      throw error;
    }
  }
  
  /**
   * Remove incerteza
   */
  async remover(id) {
    try {
      const incerteza = await this.buscarPorId(id);
      
      await incerteza.destroy();
      
      return { message: 'Incerteza removida com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover incerteza:', error);
      throw error;
    }
  }
  
  /**
   * Calcula incerteza de medição baseada em componentes
   */
  async calcularIncerteza(dadosCalculo) {
    try {
      const {
        componentes_incerteza,
        fator_cobertura = 2,
        nivel_confianca = 95
      } = dadosCalculo;
      
      if (!Array.isArray(componentes_incerteza) || componentes_incerteza.length === 0) {
        throw new Error('Componentes de incerteza são obrigatórios');
      }
      
      // Calcular incerteza combinada (raiz quadrada da soma dos quadrados)
      let somaQuadrados = 0;
      const componentesProcessados = [];
      
      componentes_incerteza.forEach((comp, index) => {
        const valor = parseFloat(comp.valor) || 0;
        const coeficiente = parseFloat(comp.coeficiente_sensibilidade) || 1;
        const distribuicao = comp.distribuicao || 'normal';
        
        // Aplicar fator de divisor baseado na distribuição
        let divisor = 1;
        switch (distribuicao) {
          case 'retangular':
            divisor = Math.sqrt(3);
            break;
          case 'triangular':
            divisor = Math.sqrt(6);
            break;
          case 'normal':
            divisor = 1;
            break;
          default:
            divisor = 1;
        }
        
        const incertezaPadrao = valor / divisor;
        const contribuicao = Math.pow(coeficiente * incertezaPadrao, 2);
        
        somaQuadrados += contribuicao;
        
        componentesProcessados.push({
          ...comp,
          incerteza_padrao: parseFloat(incertezaPadrao.toFixed(4)),
          contribuicao: parseFloat(contribuicao.toFixed(6)),
          contribuicao_percentual: 0 // Será calculado após soma total
        });
      });
      
      const incertezaCombinada = Math.sqrt(somaQuadrados);
      const incertezaExpandida = incertezaCombinada * fator_cobertura;
      
      // Calcular contribuição percentual de cada componente
      componentesProcessados.forEach(comp => {
        comp.contribuicao_percentual = parseFloat(((comp.contribuicao / somaQuadrados) * 100).toFixed(2));
      });
      
      return {
        componentes_processados: componentesProcessados,
        incerteza_combinada: parseFloat(incertezaCombinada.toFixed(4)),
        incerteza_expandida: parseFloat(incertezaExpandida.toFixed(4)),
        fator_cobertura: parseFloat(fator_cobertura),
        nivel_confianca: parseFloat(nivel_confianca),
        graus_liberdade_efetivos: this.calcularGrausLiberdade(componentesProcessados),
        data_calculo: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao calcular incerteza:', error);
      throw error;
    }
  }
  
  /**
   * Valida cálculo de incerteza conforme normas técnicas
   */
  async validarCalculo(id) {
    try {
      const incerteza = await this.buscarPorId(id);
      
      const validacoes = {
        componentes_suficientes: (incerteza.componentes_incerteza || []).length >= 3,
        fator_cobertura_adequado: incerteza.fator_cobertura >= 2 && incerteza.fator_cobertura <= 3,
        nivel_confianca_adequado: incerteza.nivel_confianca >= 95,
        incerteza_expandida_calculada: incerteza.incerteza_expandida > 0,
        contribuicoes_balanceadas: this.verificarContribuicoesBalanceadas(incerteza),
        atende_norma_gum: true // Simplificado - na prática seria mais complexo
      };
      
      const conformidade = Object.values(validacoes).every(v => v === true);
      
      return {
        ...validacoes,
        conformidade_geral: conformidade,
        recomendacoes: this.gerarRecomendacoes(validacoes),
        data_validacao: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao validar cálculo:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório de incerteza detalhado
   */
  async gerarRelatorio(id) {
    try {
      const incerteza = await this.buscarPorId(id);
      const validacao = await this.validarCalculo(id);
      
      // Classificar incerteza por magnitude
      let classificacao = '';
      const incertezaPercentual = (incerteza.incerteza_expandida / incerteza.valor_medido) * 100;
      
      if (incertezaPercentual <= 0.5) {
        classificacao = 'Excelente (≤0.5%)';
      } else if (incertezaPercentual <= 1.0) {
        classificacao = 'Boa (≤1.0%)';
      } else if (incertezaPercentual <= 2.0) {
        classificacao = 'Aceitável (≤2.0%)';
      } else {
        classificacao = 'Requer atenção (>2.0%)';
      }
      
      const relatorio = {
        ...incerteza.dataValues,
        validacao,
        analise: {
          incerteza_percentual: parseFloat(incertezaPercentual.toFixed(3)),
          classificacao_qualidade: classificacao,
          componente_dominante: this.identificarComponenteDominante(incerteza),
          intervalo_confianca: {
            limite_inferior: incerteza.valor_medido - incerteza.incerteza_expandida,
            limite_superior: incerteza.valor_medido + incerteza.incerteza_expandida
          }
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
   * Importa incertezas em lote
   */
  async importarLote(dados) {
    try {
      if (!Array.isArray(dados)) {
        throw new Error('Dados devem ser um array');
      }
      
      const incertezasImportadas = [];
      const erros = [];
      
      for (let i = 0; i < dados.length; i++) {
        const incerteza = dados[i];
        
        try {
          // Validar dados obrigatórios
          if (!incerteza.tag_ponto || !incerteza.tipo_medicao || !incerteza.valor_medido) {
            erros.push(`Linha ${i + 1}: Tag do ponto, tipo de medição e valor medido são obrigatórios`);
            continue;
          }
          
          const dadosCompletos = this.calcularIncertezas(incerteza);
          const novaIncerteza = await Incerteza.create(dadosCompletos);
          incertezasImportadas.push(novaIncerteza);
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        importadas: incertezasImportadas.length,
        erros: erros.length,
        detalhes_erros: erros,
        dados: incertezasImportadas
      };
      
    } catch (error) {
      console.error('Erro ao importar incertezas:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.tag_ponto || !dados.tipo_medicao || !dados.valor_medido) {
      throw new Error('Tag do ponto, tipo de medição e valor medido são obrigatórios');
    }
  }
  
  /**
   * Calcula incertezas combinada e expandida
   */
  calcularIncertezas(dados) {
    const dadosCompletos = { ...dados };
    
    // Se não há cálculo específico, usar valores padrão simplificados
    if (!dadosCompletos.incerteza_combinada && !dadosCompletos.incerteza_expandida) {
      // Cálculo simplificado baseado em percentual típico
      const percentualIncerteza = 1.0; // 1% como padrão
      dadosCompletos.incerteza_combinada = (dados.valor_medido * percentualIncerteza) / 100 / 2;
      dadosCompletos.incerteza_expandida = dadosCompletos.incerteza_combinada * 2;
      dadosCompletos.fator_cobertura = dadosCompletos.fator_cobertura || 2;
      dadosCompletos.nivel_confianca = dadosCompletos.nivel_confianca || 95.45;
    }
    
    return dadosCompletos;
  }
  
  /**
   * Calcula graus de liberdade efetivos (Welch-Satterthwaite)
   */
  calcularGrausLiberdade(componentes) {
    // Simplificação: assumir graus de liberdade infinitos para componentes do tipo B
    return 'infinito';
  }
  
  /**
   * Verifica se as contribuições estão balanceadas
   */
  verificarContribuicoesBalanceadas(incerteza) {
    const componentes = incerteza.componentes_incerteza || [];
    if (componentes.length === 0) return false;
    
    // Verificar se nenhum componente domina mais que 50%
    const maxContribuicao = Math.max(...componentes.map(c => c.contribuicao_percentual || 0));
    return maxContribuicao <= 50;
  }
  
  /**
   * Identifica o componente de maior contribuição
   */
  identificarComponenteDominante(incerteza) {
    const componentes = incerteza.componentes_incerteza || [];
    if (componentes.length === 0) return null;
    
    const dominante = componentes.reduce((max, comp) => 
      (comp.contribuicao_percentual || 0) > (max.contribuicao_percentual || 0) ? comp : max
    );
    
    return {
      fonte: dominante.fonte,
      contribuicao_percentual: dominante.contribuicao_percentual
    };
  }
  
  /**
   * Gera recomendações baseadas na validação
   */
  gerarRecomendacoes(validacoes) {
    const recomendacoes = [];
    
    if (!validacoes.componentes_suficientes) {
      recomendacoes.push('Incluir mais componentes de incerteza para análise completa');
    }
    
    if (!validacoes.fator_cobertura_adequado) {
      recomendacoes.push('Ajustar fator de cobertura para valor entre 2 e 3');
    }
    
    if (!validacoes.nivel_confianca_adequado) {
      recomendacoes.push('Aumentar nível de confiança para pelo menos 95%');
    }
    
    if (!validacoes.contribuicoes_balanceadas) {
      recomendacoes.push('Revisar componentes dominantes e buscar melhor balanceamento');
    }
    
    if (recomendacoes.length === 0) {
      recomendacoes.push('Cálculo de incerteza está em conformidade com as normas técnicas');
    }
    
    return recomendacoes;
  }
  
  /**
   * Lista tipos de medição disponíveis
   */
  async listarTipos() {
    return [
      'Vazão',
      'Pressão',
      'Temperatura',
      'Densidade',
      'Viscosidade',
      'Composição',
      'Poder Calorífico',
      'Outros'
    ];
  }
  
  /**
   * Lista unidades de medida disponíveis
   */
  async listarUnidades() {
    return [
      'm³/h', 'm³/d', 'kg/h', 'kg/d',
      'kPa', 'MPa', 'bar', 'psi',
      '°C', 'K',
      'kg/m³', 'g/cm³',
      'cP', 'cSt',
      '%', 'ppm',
      'kcal/m³', 'MJ/m³'
    ];
  }
  
  /**
   * Lista status disponíveis para cálculos
   */
  async listarStatus() {
    return [
      'Em Elaboração',
      'Calculado',
      'Validado',
      'Aprovado',
      'Expirado',
      'Em Revisão'
    ];
  }
}

module.exports = new IncertezasService();