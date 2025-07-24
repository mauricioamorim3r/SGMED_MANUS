// ============================================================================
// ROUTES PARA ANÁLISES QUÍMICAS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let analisesQuimicas = [];

/**
 * GET /api/analises-quimicas
 * Lista todas as análises químicas
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { polo_id, tipo_analise, status, laboratorio, data_inicio, data_fim, search } = req.query;
    
    let filteredAnalises = [...analisesQuimicas];
    
    if (polo_id) {
      filteredAnalises = filteredAnalises.filter(analise => analise.polo_id === parseInt(polo_id));
    }
    
    if (tipo_analise) {
      filteredAnalises = filteredAnalises.filter(analise => analise.tipo_analise === tipo_analise);
    }
    
    if (status && status !== 'all') {
      filteredAnalises = filteredAnalises.filter(analise => analise.status_analise === status);
    }
    
    if (laboratorio) {
      filteredAnalises = filteredAnalises.filter(analise => 
        analise.laboratorio.toLowerCase().includes(laboratorio.toLowerCase())
      );
    }
    
    if (data_inicio) {
      filteredAnalises = filteredAnalises.filter(analise => 
        new Date(analise.data_coleta) >= new Date(data_inicio)
      );
    }
    
    if (data_fim) {
      filteredAnalises = filteredAnalises.filter(analise => 
        new Date(analise.data_coleta) <= new Date(data_fim)
      );
    }
    
    if (search) {
      filteredAnalises = filteredAnalises.filter(analise => 
        analise.identificacao_amostra.toLowerCase().includes(search.toLowerCase()) ||
        analise.laboratorio.toLowerCase().includes(search.toLowerCase()) ||
        analise.responsavel_coleta.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredAnalises,
      total: filteredAnalises.length,
      message: 'Análises químicas carregadas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar análises químicas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar análises químicas'
    });
  }
});

/**
 * GET /api/analises-quimicas/:id
 * Busca análise química por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const analise = analisesQuimicas.find(a => a.id === parseInt(id));
    
    if (!analise) {
      return res.status(404).json({
        success: false,
        error: 'Análise química não encontrada',
        message: `Análise com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: analise,
      message: 'Análise química encontrada'
    });
    
  } catch (error) {
    console.error('Erro ao buscar análise química:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/analises-quimicas
 * Cria nova análise química
 */
router.post('/', async (req, res) => {
  try {
    const {
      polo_id,
      identificacao_amostra,
      tipo_analise,
      tipo_produto,
      data_coleta,
      local_coleta,
      responsavel_coleta,
      laboratorio,
      data_analise,
      metodo_analise,
      // Propriedades físico-químicas
      densidade_15c_gcm3,
      densidade_20c_gcm3,
      grau_api,
      viscosidade_cinematica_40c_cst,
      viscosidade_cinematica_100c_cst,
      ponto_fulgor_celsius,
      ponto_fluidez_celsius,
      teor_agua_ppm,
      teor_sedimentos_percentual,
      teor_sal_ptb,
      // Composição química
      teor_enxofre_percentual,
      teor_parafinas_percentual,
      teor_aromaticos_percentual,
      numero_acido_mgkoh_g,
      // Análise cromatográfica
      c1_metano_percentual,
      c2_etano_percentual,
      c3_propano_percentual,
      c4_butano_percentual,
      c5_mais_percentual,
      poder_calorifico_kcal_m3,
      indice_wobbe,
      fator_compressibilidade,
      status_analise,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!identificacao_amostra || !tipo_analise || !data_coleta) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Identificação da amostra, tipo de análise e data de coleta são obrigatórios'
      });
    }
    
    // Calcular propriedades derivadas automaticamente
    let grauApiCalculado = grau_api;
    if (!grauApiCalculado && densidade_15c_gcm3) {
      // Fórmula: °API = (141.5 / densidade específica a 15°C) - 131.5
      grauApiCalculado = parseFloat(((141.5 / densidade_15c_gcm3) - 131.5).toFixed(2));
    }
    
    let indiceWobbeCalculado = indice_wobbe;
    if (!indiceWobbeCalculado && poder_calorifico_kcal_m3) {
      // Simplificação: assumir densidade relativa do gás = 0.6 para cálculo
      const densidadeRelativa = 0.6;
      indiceWobbeCalculado = parseFloat((poder_calorifico_kcal_m3 / Math.sqrt(densidadeRelativa)).toFixed(2));
    }
    
    const novaAnalise = {
      id: analisesQuimicas.length + 1,
      polo_id: polo_id ? parseInt(polo_id) : null,
      identificacao_amostra,
      tipo_analise,
      tipo_produto: tipo_produto || 'Petróleo Cru',
      data_coleta,
      local_coleta: local_coleta || '',
      responsavel_coleta: responsavel_coleta || '',
      laboratorio: laboratorio || '',
      data_analise: data_analise || null,
      metodo_analise: metodo_analise || '',
      
      // Propriedades físico-químicas
      densidade_15c_gcm3: parseFloat(densidade_15c_gcm3) || null,
      densidade_20c_gcm3: parseFloat(densidade_20c_gcm3) || null,
      grau_api: grauApiCalculado || null,
      viscosidade_cinematica_40c_cst: parseFloat(viscosidade_cinematica_40c_cst) || null,
      viscosidade_cinematica_100c_cst: parseFloat(viscosidade_cinematica_100c_cst) || null,
      ponto_fulgor_celsius: parseFloat(ponto_fulgor_celsius) || null,
      ponto_fluidez_celsius: parseFloat(ponto_fluidez_celsius) || null,
      teor_agua_ppm: parseFloat(teor_agua_ppm) || null,
      teor_sedimentos_percentual: parseFloat(teor_sedimentos_percentual) || null,
      teor_sal_ptb: parseFloat(teor_sal_ptb) || null,
      
      // Composição química
      teor_enxofre_percentual: parseFloat(teor_enxofre_percentual) || null,
      teor_parafinas_percentual: parseFloat(teor_parafinas_percentual) || null,
      teor_aromaticos_percentual: parseFloat(teor_aromaticos_percentual) || null,
      numero_acido_mgkoh_g: parseFloat(numero_acido_mgkoh_g) || null,
      
      // Análise cromatográfica (para gás natural)
      c1_metano_percentual: parseFloat(c1_metano_percentual) || null,
      c2_etano_percentual: parseFloat(c2_etano_percentual) || null,
      c3_propano_percentual: parseFloat(c3_propano_percentual) || null,
      c4_butano_percentual: parseFloat(c4_butano_percentual) || null,
      c5_mais_percentual: parseFloat(c5_mais_percentual) || null,
      poder_calorifico_kcal_m3: parseFloat(poder_calorifico_kcal_m3) || null,
      indice_wobbe: indiceWobbeCalculado || null,
      fator_compressibilidade: parseFloat(fator_compressibilidade) || null,
      
      status_analise: status_analise || 'Em Análise',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    analisesQuimicas.push(novaAnalise);
    
    res.status(201).json({
      success: true,
      data: novaAnalise,
      message: 'Análise química criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar análise química:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/analises-quimicas/:id
 * Atualiza análise química existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const analiseIndex = analisesQuimicas.findIndex(a => a.id === parseInt(id));
    
    if (analiseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Análise química não encontrada'
      });
    }
    
    // Recalcular propriedades derivadas se dados base foram alterados
    const dadosAtualizacao = { ...req.body };
    const analiseAtual = analisesQuimicas[analiseIndex];
    
    // Recalcular grau API se densidade foi alterada
    if (dadosAtualizacao.densidade_15c_gcm3 && !dadosAtualizacao.grau_api) {
      dadosAtualizacao.grau_api = parseFloat(((141.5 / dadosAtualizacao.densidade_15c_gcm3) - 131.5).toFixed(2));
    }
    
    // Recalcular Índice de Wobbe se poder calorífico foi alterado
    if (dadosAtualizacao.poder_calorifico_kcal_m3 && !dadosAtualizacao.indice_wobbe) {
      const densidadeRelativa = 0.6; // Simplificação
      dadosAtualizacao.indice_wobbe = parseFloat((dadosAtualizacao.poder_calorifico_kcal_m3 / Math.sqrt(densidadeRelativa)).toFixed(2));
    }
    
    const analiseAtualizada = {
      ...analiseAtual,
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    };
    
    analisesQuimicas[analiseIndex] = analiseAtualizada;
    
    res.json({
      success: true,
      data: analiseAtualizada,
      message: 'Análise química atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar análise química:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/analises-quimicas/:id
 * Remove análise química
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const analiseIndex = analisesQuimicas.findIndex(a => a.id === parseInt(id));
    
    if (analiseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Análise química não encontrada'
      });
    }
    
    const analiseRemovida = analisesQuimicas[analiseIndex];
    analisesQuimicas.splice(analiseIndex, 1);
    
    res.json({
      success: true,
      data: analiseRemovida,
      message: 'Análise química removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover análise química:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/analises-quimicas/tipos/lista
 * Lista tipos de análises disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
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
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de análises carregados'
  });
});

/**
 * GET /api/analises-quimicas/produtos/lista
 * Lista tipos de produtos analisados
 */
router.get('/produtos/lista', (req, res) => {
  const produtos = [
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
  
  res.json({
    success: true,
    data: produtos,
    message: 'Tipos de produtos carregados'
  });
});

/**
 * GET /api/analises-quimicas/metodos/lista
 * Lista métodos de análise disponíveis
 */
router.get('/metodos/lista', (req, res) => {
  const metodos = [
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
  
  res.json({
    success: true,
    data: metodos,
    message: 'Métodos de análise carregados'
  });
});

/**
 * GET /api/analises-quimicas/status/lista
 * Lista status disponíveis para análises
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Coletada',
    'Em Análise',
    'Concluída',
    'Aprovada',
    'Rejeitada',
    'Em Revisão',
    'Arquivada'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de análises carregados'
  });
});

/**
 * POST /api/analises-quimicas/calcular-api
 * Calcula grau API baseado na densidade
 */
router.post('/calcular-api', async (req, res) => {
  try {
    const { densidade_15c_gcm3, densidade_20c_gcm3 } = req.body;
    
    let densidade15c = densidade_15c_gcm3;
    
    // Se só temos densidade a 20°C, fazer correção aproximada para 15°C
    if (!densidade15c && densidade_20c_gcm3) {
      // Correção simplificada: densidade aumenta ~0.0007 g/cm³ por °C de diminuição
      densidade15c = parseFloat((densidade_20c_gcm3 + (5 * 0.0007)).toFixed(4));
    }
    
    if (!densidade15c) {
      return res.status(400).json({
        success: false,
        error: 'Densidade é obrigatória',
        message: 'Forneça densidade a 15°C ou 20°C'
      });
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
    
    res.json({
      success: true,
      data: {
        densidade_15c_gcm3: densidade15c,
        densidade_20c_gcm3: densidade_20c_gcm3 || null,
        grau_api: parseFloat(grauApi.toFixed(2)),
        classificacao_petroleo: classificacao,
        densidade_especifica_15c: densidade15c, // Assumindo água = 1.0 g/cm³
        data_calculo: new Date().toISOString()
      },
      message: 'Grau API calculado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao calcular grau API:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/analises-quimicas/calcular-wobbe
 * Calcula Índice de Wobbe para gás natural
 */
router.post('/calcular-wobbe', async (req, res) => {
  try {
    const { poder_calorifico_kcal_m3, densidade_relativa } = req.body;
    
    if (!poder_calorifico_kcal_m3) {
      return res.status(400).json({
        success: false,
        error: 'Poder calorífico é obrigatório'
      });
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
    
    res.json({
      success: true,
      data: {
        poder_calorifico_kcal_m3: parseFloat(poder_calorifico_kcal_m3),
        densidade_relativa: densRel,
        indice_wobbe: parseFloat(indiceWobbe.toFixed(2)),
        classificacao_gas: classificacao,
        unidade: 'kcal/m³',
        data_calculo: new Date().toISOString()
      },
      message: 'Índice de Wobbe calculado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao calcular Índice de Wobbe:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/analises-quimicas/:id/relatorio
 * Gera relatório detalhado da análise
 */
router.get('/:id/relatorio', async (req, res) => {
  try {
    const { id } = req.params;
    const analise = analisesQuimicas.find(a => a.id === parseInt(id));
    
    if (!analise) {
      return res.status(404).json({
        success: false,
        error: 'Análise química não encontrada'
      });
    }
    
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
      ...analise,
      interpretacoes,
      resumo_qualidade: {
        produto_comercial: analise.grau_api ? analise.grau_api >= 22.3 : null,
        especificacao_enxofre: analise.teor_enxofre_percentual ? analise.teor_enxofre_percentual <= 1.0 : null,
        qualidade_gas: analise.indice_wobbe ? analise.indice_wobbe >= 10200 : null
      },
      data_relatorio: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: relatorio,
      message: 'Relatório gerado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/analises-quimicas/importar
 * Importa análises químicas via CSV/bulk
 */
router.post('/importar', async (req, res) => {
  try {
    const { dados } = req.body;
    
    if (!dados || !Array.isArray(dados)) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        message: 'Array de dados é obrigatório'
      });
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
        
        // Calcular grau API se densidade fornecida
        let grauApiCalculado = parseFloat(analise.grau_api) || null;
        if (!grauApiCalculado && analise.densidade_15c_gcm3) {
          grauApiCalculado = parseFloat(((141.5 / parseFloat(analise.densidade_15c_gcm3)) - 131.5).toFixed(2));
        }
        
        const novaAnalise = {
          id: analisesQuimicas.length + analisesImportadas.length + 1,
          polo_id: analise.polo_id ? parseInt(analise.polo_id) : null,
          identificacao_amostra: analise.identificacao_amostra,
          tipo_analise: analise.tipo_analise,
          tipo_produto: analise.tipo_produto || 'Petróleo Cru',
          data_coleta: analise.data_coleta,
          local_coleta: analise.local_coleta || '',
          responsavel_coleta: analise.responsavel_coleta || '',
          laboratorio: analise.laboratorio || '',
          data_analise: analise.data_analise || null,
          metodo_analise: analise.metodo_analise || '',
          
          // Propriedades físico-químicas
          densidade_15c_gcm3: parseFloat(analise.densidade_15c_gcm3) || null,
          densidade_20c_gcm3: parseFloat(analise.densidade_20c_gcm3) || null,
          grau_api: grauApiCalculado,
          viscosidade_cinematica_40c_cst: parseFloat(analise.viscosidade_cinematica_40c_cst) || null,
          viscosidade_cinematica_100c_cst: parseFloat(analise.viscosidade_cinematica_100c_cst) || null,
          ponto_fulgor_celsius: parseFloat(analise.ponto_fulgor_celsius) || null,
          ponto_fluidez_celsius: parseFloat(analise.ponto_fluidez_celsius) || null,
          teor_agua_ppm: parseFloat(analise.teor_agua_ppm) || null,
          teor_sedimentos_percentual: parseFloat(analise.teor_sedimentos_percentual) || null,
          teor_sal_ptb: parseFloat(analise.teor_sal_ptb) || null,
          
          // Composição química
          teor_enxofre_percentual: parseFloat(analise.teor_enxofre_percentual) || null,
          teor_parafinas_percentual: parseFloat(analise.teor_parafinas_percentual) || null,
          teor_aromaticos_percentual: parseFloat(analise.teor_aromaticos_percentual) || null,
          numero_acido_mgkoh_g: parseFloat(analise.numero_acido_mgkoh_g) || null,
          
          // Análise cromatográfica
          c1_metano_percentual: parseFloat(analise.c1_metano_percentual) || null,
          c2_etano_percentual: parseFloat(analise.c2_etano_percentual) || null,
          c3_propano_percentual: parseFloat(analise.c3_propano_percentual) || null,
          c4_butano_percentual: parseFloat(analise.c4_butano_percentual) || null,
          c5_mais_percentual: parseFloat(analise.c5_mais_percentual) || null,
          poder_calorifico_kcal_m3: parseFloat(analise.poder_calorifico_kcal_m3) || null,
          indice_wobbe: parseFloat(analise.indice_wobbe) || null,
          fator_compressibilidade: parseFloat(analise.fator_compressibilidade) || null,
          
          status_analise: analise.status_analise || 'Em Análise',
          observacoes: analise.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        analisesImportadas.push(novaAnalise);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar análises válidas
    analisesQuimicas.push(...analisesImportadas);
    
    res.json({
      success: true,
      data: {
        importadas: analisesImportadas.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${analisesImportadas.length} análises químicas importadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar análises químicas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;