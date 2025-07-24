// ============================================================================
// SERVICE PARA TESTES DE POÇOS - SGM
// ============================================================================

const TestePoco = require('../models/testesPocos');
const { Op } = require('sequelize');

class TestesPocoService {
  /**
   * Lista testes de poços com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        polo_id, poco, tipo_teste, status, data_inicio, data_fim,
        search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (polo_id) {
        where.polo_id = polo_id;
      }
      
      if (poco) {
        where.nome_poco = {
          [Op.like]: `%${poco}%`
        };
      }
      
      if (tipo_teste) {
        where.tipo_teste = tipo_teste;
      }
      
      if (status && status !== 'all') {
        where.status_teste = status;
      }
      
      if (data_inicio) {
        where.data_inicio = {
          [Op.gte]: new Date(data_inicio)
        };
      }
      
      if (data_fim) {
        where.data_inicio = {
          ...where.data_inicio,
          [Op.lte]: new Date(data_fim)
        };
      }
      
      if (search) {
        where[Op.or] = [
          { nome_poco: { [Op.like]: `%${search}%` } },
          { nome_teste: { [Op.like]: `%${search}%` } },
          { responsavel_teste: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await TestePoco.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_inicio', 'DESC']]
      });
      
      return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(resultado.count / limit)
      };
      
    } catch (error) {
      console.error('Erro no service ao listar testes de poços:', error);
      throw new Error('Erro ao buscar testes de poços');
    }
  }
  
  /**
   * Busca teste de poço por ID
   */
  async buscarPorId(id) {
    try {
      const teste = await TestePoco.findByPk(id);
      
      if (!teste) {
        throw new Error('Teste de poço não encontrado');
      }
      
      return teste;
      
    } catch (error) {
      console.error('Erro no service ao buscar teste de poço:', error);
      throw error;
    }
  }
  
  /**
   * Cria novo teste de poço
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Calcular duração e métricas derivadas
      const dadosCompletos = this.calcularMetricas(dados);
      
      const novoTeste = await TestePoco.create(dadosCompletos);
      
      return novoTeste;
      
    } catch (error) {
      console.error('Erro no service ao criar teste de poço:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza teste de poço existente
   */
  async atualizar(id, dados) {
    try {
      const teste = await this.buscarPorId(id);
      
      // Recalcular métricas se dados foram alterados
      const dadosAtualizados = this.calcularMetricas({
        ...teste.dataValues,
        ...dados
      });
      
      await teste.update(dadosAtualizados);
      
      return teste;
      
    } catch (error) {
      console.error('Erro no service ao atualizar teste de poço:', error);
      throw error;
    }
  }
  
  /**
   * Remove teste de poço
   */
  async remover(id) {
    try {
      const teste = await this.buscarPorId(id);
      
      await teste.destroy();
      
      return { message: 'Teste de poço removido com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover teste de poço:', error);
      throw error;
    }
  }
  
  /**
   * Lista testes por polo
   */
  async listarPorPolo(polo_id) {
    try {
      const testesPolo = await TestePoco.findAll({
        where: { polo_id: parseInt(polo_id) },
        order: [['data_inicio', 'DESC']]
      });
      
      return {
        dados: testesPolo,
        total: testesPolo.length
      };
      
    } catch (error) {
      console.error('Erro ao buscar testes por polo:', error);
      throw error;
    }
  }
  
  /**
   * Lista testes por poço
   */
  async listarPorPoco(nome_poco) {
    try {
      const testesPoco = await TestePoco.findAll({
        where: { 
          nome_poco: {
            [Op.like]: `%${nome_poco}%`
          }
        },
        order: [['data_inicio', 'DESC']]
      });
      
      return {
        dados: testesPoco,
        total: testesPoco.length
      };
      
    } catch (error) {
      console.error('Erro ao buscar testes por poço:', error);
      throw error;
    }
  }
  
  /**
   * Calcula ROP (Razão Óleo-Produção) baseado nas vazões
   */
  async calcularROP(vazao_oleo_m3d, vazao_agua_m3d) {
    try {
      if (!vazao_oleo_m3d || !vazao_agua_m3d) {
        throw new Error('Vazões de óleo e água são obrigatórias');
      }
      
      const vazaoOleo = parseFloat(vazao_oleo_m3d);
      const vazaoAgua = parseFloat(vazao_agua_m3d);
      const vazaoTotal = vazaoOleo + vazaoAgua;
      
      if (vazaoTotal === 0) {
        throw new Error('Vazão total não pode ser zero');
      }
      
      const ropOleo = (vazaoOleo / vazaoTotal) * 100;
      const ropAgua = (vazaoAgua / vazaoTotal) * 100;
      
      // Classificação da produção
      let classificacao = '';
      if (ropOleo >= 80) {
        classificacao = 'Alto teor de óleo - Excelente';
      } else if (ropOleo >= 60) {
        classificacao = 'Teor bom de óleo';
      } else if (ropOleo >= 40) {
        classificacao = 'Teor médio de óleo';
      } else {
        classificacao = 'Alto teor de água - Atenção';
      }
      
      return {
        vazao_oleo_m3d: vazaoOleo,
        vazao_agua_m3d: vazaoAgua,
        vazao_total_liquidos_m3d: vazaoTotal,
        rop_oleo_percentual: parseFloat(ropOleo.toFixed(2)),
        rop_agua_percentual: parseFloat(ropAgua.toFixed(2)),
        classificacao_producao: classificacao,
        bsw_calculado: parseFloat(ropAgua.toFixed(2)), // BSW ≈ ROP água para simplificação
        data_calculo: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao calcular ROP:', error);
      throw error;
    }
  }
  
  /**
   * Analisa performance do poço
   */
  async analisarPerformance(id) {
    try {
      const teste = await this.buscarPorId(id);
      
      // Calcular métricas de performance
      const vazaoTotalLiquidos = (parseFloat(teste.vazao_oleo_m3d) || 0) + (parseFloat(teste.vazao_agua_m3d) || 0);
      const vazaoTotalFluidos = vazaoTotalLiquidos + (parseFloat(teste.vazao_gas_m3d) || 0);
      
      // Produtividade (simplificada)
      const deltaP = (parseFloat(teste.pressao_inicial_kgfcm2) || 0) - (parseFloat(teste.pressao_final_kgfcm2) || 0);
      const produtividade = deltaP > 0 ? vazaoTotalLiquidos / deltaP : 0;
      
      // Eficiência temporal
      const duracaoPlanejada = parseFloat(teste.duracao_planejada_horas) || 0;
      const duracaoReal = parseFloat(teste.duracao_real_horas) || 0;
      const eficienciaTempo = duracaoPlanejada > 0 && duracaoReal > 0 ? 
        Math.min((duracaoPlanejada / duracaoReal) * 100, 100) : null;
      
      // ROP se disponível
      let ropAnalise = null;
      if (teste.vazao_oleo_m3d && teste.vazao_agua_m3d) {
        ropAnalise = await this.calcularROP(teste.vazao_oleo_m3d, teste.vazao_agua_m3d);
      }
      
      // Classificação geral
      let classificacaoGeral = 'Indefinida';
      if (vazaoTotalLiquidos > 100) {
        classificacaoGeral = 'Alta produção';
      } else if (vazaoTotalLiquidos > 50) {
        classificacaoGeral = 'Produção média';
      } else if (vazaoTotalLiquidos > 0) {
        classificacaoGeral = 'Baixa produção';
      }
      
      return {
        teste_id: id,
        metricas_calculadas: {
          vazao_total_liquidos_m3d: vazaoTotalLiquidos,
          vazao_total_fluidos_m3d: vazaoTotalFluidos,
          produtividade_m3d_kgfcm2: parseFloat(produtividade.toFixed(2)),
          eficiencia_tempo_percentual: eficienciaTempo,
          diferenca_pressao_kgfcm2: deltaP,
          classificacao_geral: classificacaoGeral
        },
        rop_analise: ropAnalise,
        recomendacoes: this.gerarRecomendacoes(teste, {
          vazaoTotalLiquidos,
          produtividade,
          eficienciaTempo,
          ropAnalise
        }),
        data_analise: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao analisar performance:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório detalhado do teste
   */
  async gerarRelatorio(id) {
    try {
      const teste = await this.buscarPorId(id);
      const performance = await this.analisarPerformance(id);
      
      const relatorio = {
        ...teste.dataValues,
        analise_performance: performance,
        resumo_executivo: {
          tipo_teste: teste.tipo_teste,
          duracao_total: `${teste.duracao_real_horas || 'N/A'} horas`,
          producao_oleo: `${teste.vazao_oleo_m3d || 0} m³/d`,
          producao_agua: `${teste.vazao_agua_m3d || 0} m³/d`,
          producao_gas: `${teste.vazao_gas_m3d || 0} m³/d`,
          status_final: teste.status_teste,
          avaliacao_geral: performance.metricas_calculadas.classificacao_geral
        },
        aspectos_tecnicos: {
          pressao_estatica_inicial: `${teste.pressao_inicial_kgfcm2 || 'N/A'} kgf/cm²`,
          pressao_estatica_final: `${teste.pressao_final_kgfcm2 || 'N/A'} kgf/cm²`,
          temperatura_operacao: `${teste.temperatura_celsius || 'N/A'} °C`,
          grau_api: teste.grau_api || 'N/A',
          bsw: `${teste.bsw_percentual || 'N/A'}%`,
          equipamentos: teste.equipamentos_utilizados || 'Não especificado'
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
   * Importa testes de poços em lote
   */
  async importarLote(dados) {
    try {
      if (!Array.isArray(dados)) {
        throw new Error('Dados devem ser um array');
      }
      
      const testesImportados = [];
      const erros = [];
      
      for (let i = 0; i < dados.length; i++) {
        const teste = dados[i];
        
        try {
          // Validar dados obrigatórios
          if (!teste.nome_poco || !teste.nome_teste || !teste.tipo_teste || !teste.data_inicio) {
            erros.push(`Linha ${i + 1}: Nome do poço, nome do teste, tipo e data de início são obrigatórios`);
            continue;
          }
          
          const dadosCompletos = this.calcularMetricas(teste);
          const novoTeste = await TestePoco.create(dadosCompletos);
          testesImportados.push(novoTeste);
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        importados: testesImportados.length,
        erros: erros.length,
        detalhes_erros: erros,
        dados: testesImportados
      };
      
    } catch (error) {
      console.error('Erro ao importar testes de poços:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.nome_poco || !dados.nome_teste || !dados.tipo_teste || !dados.data_inicio) {
      throw new Error('Nome do poço, nome do teste, tipo e data de início são obrigatórios');
    }
  }
  
  /**
   * Calcula métricas derivadas
   */
  calcularMetricas(dados) {
    const dadosCompletos = { ...dados };
    
    // Calcular duração real se data_fim fornecida
    if (dados.data_fim && dados.data_inicio && !dados.duracao_real_horas) {
      const inicio = new Date(dados.data_inicio);
      const fim = new Date(dados.data_fim);
      dadosCompletos.duracao_real_horas = Math.round((fim - inicio) / (1000 * 60 * 60));
    }
    
    // Calcular ROP água se vazões disponíveis
    if (dados.vazao_oleo_m3d && dados.vazao_agua_m3d && !dados.rop_agua_percentual) {
      const vazaoOleo = parseFloat(dados.vazao_oleo_m3d);
      const vazaoAgua = parseFloat(dados.vazao_agua_m3d);
      const vazaoTotal = vazaoOleo + vazaoAgua;
      
      if (vazaoTotal > 0) {
        dadosCompletos.rop_agua_percentual = parseFloat(((vazaoAgua / vazaoTotal) * 100).toFixed(2));
      }
    }
    
    return dadosCompletos;
  }
  
  /**
   * Gera recomendações baseadas na análise
   */
  gerarRecomendacoes(teste, metricas) {
    const recomendacoes = [];
    
    // Recomendações baseadas na produção
    if (metricas.vazaoTotalLiquidos < 10) {
      recomendacoes.push('Produção muito baixa - Verificar integridade do poço');
    } else if (metricas.vazaoTotalLiquidos > 500) {
      recomendacoes.push('Alta produção - Monitorar pressão e equipamentos');
    }
    
    // Recomendações baseadas no ROP
    if (metricas.ropAnalise) {
      if (metricas.ropAnalise.rop_agua_percentual > 80) {
        recomendacoes.push('Alto corte de água - Considerar workover');
      } else if (metricas.ropAnalise.rop_oleo_percentual > 90) {
        recomendacoes.push('Excelente qualidade de óleo - Manter condições operacionais');
      }
    }
    
    // Recomendações baseadas na eficiência
    if (metricas.eficienciaTempo && metricas.eficienciaTempo < 70) {
      recomendacoes.push('Baixa eficiência temporal - Revisar planejamento');
    }
    
    // Recomendações baseadas na pressão
    const deltaP = (parseFloat(teste.pressao_inicial_kgfcm2) || 0) - (parseFloat(teste.pressao_final_kgfcm2) || 0);
    if (deltaP > 50) {
      recomendacoes.push('Grande queda de pressão - Verificar restrições no sistema');
    }
    
    if (recomendacoes.length === 0) {
      recomendacoes.push('Teste executado dentro dos parâmetros normais');
    }
    
    return recomendacoes;
  }
  
  /**
   * Lista tipos de testes disponíveis
   */
  async listarTipos() {
    return [
      'Teste de Produção',
      'Teste de Injetividade',
      'Teste de Pressão',
      'Teste de Formação',
      'Teste DST',
      'Teste de Build-up',
      'Teste de Draw-down',
      'Teste de Interferência',
      'Teste de Step-rate',
      'Outros'
    ];
  }
  
  /**
   * Lista status disponíveis para testes
   */
  async listarStatus() {
    return [
      'Planejado',
      'Em Execução',
      'Concluído',
      'Suspenso',
      'Cancelado',
      'Aguardando Análise',
      'Finalizado'
    ];
  }
  
  /**
   * Gera estatísticas de produção por período
   */
  async gerarEstatisticasProducao(data_inicio, data_fim) {
    try {
      const where = {};
      
      if (data_inicio && data_fim) {
        where.data_inicio = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }
      
      const testes = await TestePoco.findAll({
        where,
        order: [['data_inicio', 'DESC']]
      });
      
      // Calcular estatísticas
      const estatisticas = {
        total_testes: testes.length,
        producao_oleo_total: 0,
        producao_agua_total: 0,
        producao_gas_total: 0,
        testes_por_tipo: {},
        testes_por_status: {},
        media_rop_oleo: 0,
        pocos_testados: new Set()
      };
      
      testes.forEach(teste => {
        // Produção total
        estatisticas.producao_oleo_total += parseFloat(teste.vazao_oleo_m3d) || 0;
        estatisticas.producao_agua_total += parseFloat(teste.vazao_agua_m3d) || 0;
        estatisticas.producao_gas_total += parseFloat(teste.vazao_gas_m3d) || 0;
        
        // Contadores por tipo
        estatisticas.testes_por_tipo[teste.tipo_teste] = 
          (estatisticas.testes_por_tipo[teste.tipo_teste] || 0) + 1;
        
        // Contadores por status
        estatisticas.testes_por_status[teste.status_teste] = 
          (estatisticas.testes_por_status[teste.status_teste] || 0) + 1;
        
        // Poços únicos
        estatisticas.pocos_testados.add(teste.nome_poco);
      });
      
      // Converter Set para contagem
      estatisticas.pocos_unicos = estatisticas.pocos_testados.size;
      delete estatisticas.pocos_testados;
      
      // Médias
      if (estatisticas.total_testes > 0) {
        estatisticas.media_producao_oleo = parseFloat(
          (estatisticas.producao_oleo_total / estatisticas.total_testes).toFixed(2)
        );
        estatisticas.media_producao_agua = parseFloat(
          (estatisticas.producao_agua_total / estatisticas.total_testes).toFixed(2)
        );
        estatisticas.media_producao_gas = parseFloat(
          (estatisticas.producao_gas_total / estatisticas.total_testes).toFixed(2)
        );
      }
      
      return {
        periodo: { data_inicio, data_fim },
        estatisticas,
        data_relatorio: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao gerar estatísticas:', error);
      throw error;
    }
  }
}

module.exports = new TestesPocoService();