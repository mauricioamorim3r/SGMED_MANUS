// ============================================================================
// ROUTES PARA INCERTEZAS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let incertezas = [];

/**
 * GET /api/incertezas
 * Lista todas as incertezas
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { tag_ponto, tipo_incerteza, status, search } = req.query;
    
    let filteredIncertezas = [...incertezas];
    
    if (tag_ponto) {
      filteredIncertezas = filteredIncertezas.filter(inc => inc.tag_ponto === tag_ponto);
    }
    
    if (tipo_incerteza) {
      filteredIncertezas = filteredIncertezas.filter(inc => inc.tipo_incerteza === tipo_incerteza);
    }
    
    if (status && status !== 'all') {
      filteredIncertezas = filteredIncertezas.filter(inc => inc.status_incerteza === status);
    }
    
    if (search) {
      filteredIncertezas = filteredIncertezas.filter(inc => 
        inc.tag_ponto.toLowerCase().includes(search.toLowerCase()) ||
        inc.descricao.toLowerCase().includes(search.toLowerCase()) ||
        inc.fonte_incerteza.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredIncertezas,
      total: filteredIncertezas.length,
      message: 'Incertezas carregadas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar incertezas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar incertezas'
    });
  }
});

/**
 * GET /api/incertezas/:id
 * Busca incerteza por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const incerteza = incertezas.find(inc => inc.id === parseInt(id));
    
    if (!incerteza) {
      return res.status(404).json({
        success: false,
        error: 'Incerteza não encontrada',
        message: `Incerteza com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: incerteza,
      message: 'Incerteza encontrada'
    });
    
  } catch (error) {
    console.error('Erro ao buscar incerteza:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/incertezas
 * Cria nova incerteza
 */
router.post('/', async (req, res) => {
  try {
    const {
      tag_ponto,
      tipo_incerteza,
      fonte_incerteza,
      descricao,
      valor_incerteza,
      unidade_incerteza,
      metodo_calculo,
      nivel_confianca,
      distribuicao_probabilidade,
      coeficiente_sensibilidade,
      contribuicao_incerteza,
      status_incerteza,
      data_avaliacao,
      responsavel_avaliacao,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!tag_ponto || !tipo_incerteza || !fonte_incerteza || !valor_incerteza) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Tag do ponto, tipo, fonte e valor da incerteza são obrigatórios'
      });
    }
    
    const novaIncerteza = {
      id: incertezas.length + 1,
      tag_ponto,
      tipo_incerteza,
      fonte_incerteza,
      descricao: descricao || '',
      valor_incerteza: parseFloat(valor_incerteza),
      unidade_incerteza: unidade_incerteza || '',
      metodo_calculo: metodo_calculo || 'GUM',
      nivel_confianca: parseFloat(nivel_confianca) || 95.45,
      distribuicao_probabilidade: distribuicao_probabilidade || 'Normal',
      coeficiente_sensibilidade: parseFloat(coeficiente_sensibilidade) || 1.0,
      contribuicao_incerteza: parseFloat(contribuicao_incerteza) || 0,
      status_incerteza: status_incerteza || 'Ativa',
      data_avaliacao: data_avaliacao || new Date().toISOString().split('T')[0],
      responsavel_avaliacao: responsavel_avaliacao || '',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    incertezas.push(novaIncerteza);
    
    res.status(201).json({
      success: true,
      data: novaIncerteza,
      message: 'Incerteza criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar incerteza:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/incertezas/:id
 * Atualiza incerteza existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const incertezaIndex = incertezas.findIndex(inc => inc.id === parseInt(id));
    
    if (incertezaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Incerteza não encontrada'
      });
    }
    
    const incertezaAtualizada = {
      ...incertezas[incertezaIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    incertezas[incertezaIndex] = incertezaAtualizada;
    
    res.json({
      success: true,
      data: incertezaAtualizada,
      message: 'Incerteza atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar incerteza:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/incertezas/:id
 * Remove incerteza
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const incertezaIndex = incertezas.findIndex(inc => inc.id === parseInt(id));
    
    if (incertezaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Incerteza não encontrada'
      });
    }
    
    const incertezaRemovida = incertezas[incertezaIndex];
    incertezas.splice(incertezaIndex, 1);
    
    res.json({
      success: true,
      data: incertezaRemovida,
      message: 'Incerteza removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover incerteza:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/incertezas/tipos/lista
 * Lista tipos de incertezas disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'Tipo A',
    'Tipo B',
    'Combinada',
    'Expandida'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de incertezas carregados'
  });
});

/**
 * GET /api/incertezas/fontes/lista
 * Lista fontes de incertezas disponíveis
 */
router.get('/fontes/lista', (req, res) => {
  const fontes = [
    'Equipamento de Medição',
    'Método de Medição',
    'Condições Ambientais',
    'Operador',
    'Amostragem',
    'Interpolação',
    'Deriva',
    'Resolução',
    'Histerese',
    'Linearidade',
    'Repetibilidade',
    'Reprodutibilidade',
    'Estabilidade',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: fontes,
    message: 'Fontes de incertezas carregadas'
  });
});

/**
 * GET /api/incertezas/distribuicoes/lista
 * Lista distribuições de probabilidade disponíveis
 */
router.get('/distribuicoes/lista', (req, res) => {
  const distribuicoes = [
    'Normal',
    'Retangular (Uniforme)',
    'Triangular',
    'U-Shaped',
    'Trapezoidal',
    'Student-t'
  ];
  
  res.json({
    success: true,
    data: distribuicoes,
    message: 'Distribuições de probabilidade carregadas'
  });
});

/**
 * GET /api/incertezas/metodos/lista
 * Lista métodos de cálculo disponíveis
 */
router.get('/metodos/lista', (req, res) => {
  const metodos = [
    'GUM',
    'Monte Carlo',
    'Propagação de Incertezas',
    'Estatístico',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: metodos,
    message: 'Métodos de cálculo carregados'
  });
});

/**
 * GET /api/incertezas/status/lista
 * Lista status disponíveis para incertezas
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Ativa',
    'Inativa',
    'Em Revisão',
    'Aprovada',
    'Rejeitada',
    'Arquivada'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de incertezas carregados'
  });
});

/**
 * GET /api/incertezas/ponto/:tag_ponto
 * Lista incertezas por ponto de medição
 */
router.get('/ponto/:tag_ponto', async (req, res) => {
  try {
    const { tag_ponto } = req.params;
    const incertezasPonto = incertezas.filter(inc => inc.tag_ponto === tag_ponto);
    
    res.json({
      success: true,
      data: incertezasPonto,
      total: incertezasPonto.length,
      message: `Incertezas do ponto ${tag_ponto} carregadas`
    });
    
  } catch (error) {
    console.error('Erro ao buscar incertezas por ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/incertezas/calcular-combinada
 * Calcula incerteza combinada para um ponto
 */
router.post('/calcular-combinada', async (req, res) => {
  try {
    const { tag_ponto, metodo = 'GUM' } = req.body;
    
    if (!tag_ponto) {
      return res.status(400).json({
        success: false,
        error: 'Tag do ponto é obrigatória'
      });
    }
    
    // Buscar todas as incertezas ativas do ponto
    const incertezasPonto = incertezas.filter(inc => 
      inc.tag_ponto === tag_ponto && 
      inc.status_incerteza === 'Ativa'
    );
    
    if (incertezasPonto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma incerteza ativa encontrada para este ponto'
      });
    }
    
    // Calcular incerteza combinada usando método GUM
    // uc = √(Σ(ci * ui)²)
    let somaQuadrados = 0;
    const componentes = [];
    
    incertezasPonto.forEach(inc => {
      const ci = inc.coeficiente_sensibilidade || 1.0;
      const ui = inc.valor_incerteza || 0;
      const contribuicao = Math.pow(ci * ui, 2);
      
      somaQuadrados += contribuicao;
      
      componentes.push({
        fonte: inc.fonte_incerteza,
        valor_incerteza: ui,
        coeficiente_sensibilidade: ci,
        contribuicao: contribuicao,
        contribuicao_percentual: 0 // será calculado depois
      });
    });
    
    const incertezaCombinada = Math.sqrt(somaQuadrados);
    
    // Calcular contribuições percentuais
    componentes.forEach(comp => {
      comp.contribuicao_percentual = parseFloat(((comp.contribuicao / somaQuadrados) * 100).toFixed(2));
    });
    
    // Calcular incerteza expandida (k=2 para ~95% confiança)
    const fatorCobertura = 2.0;
    const incertezaExpandida = incertezaCombinada * fatorCobertura;
    
    res.json({
      success: true,
      data: {
        tag_ponto,
        metodo_calculo: metodo,
        incerteza_combinada: parseFloat(incertezaCombinada.toFixed(4)),
        incerteza_expandida: parseFloat(incertezaExpandida.toFixed(4)),
        fator_cobertura: fatorCobertura,
        nivel_confianca: 95.45,
        componentes,
        total_componentes: componentes.length,
        data_calculo: new Date().toISOString()
      },
      message: 'Incerteza combinada calculada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao calcular incerteza combinada:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/incertezas/importar
 * Importa incertezas via CSV/bulk
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
    
    const incertezasImportadas = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const incerteza = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!incerteza.tag_ponto || !incerteza.tipo_incerteza || !incerteza.fonte_incerteza || !incerteza.valor_incerteza) {
          erros.push(`Linha ${i + 1}: Tag do ponto, tipo, fonte e valor da incerteza são obrigatórios`);
          continue;
        }
        
        const novaIncerteza = {
          id: incertezas.length + incertezasImportadas.length + 1,
          tag_ponto: incerteza.tag_ponto,
          tipo_incerteza: incerteza.tipo_incerteza,
          fonte_incerteza: incerteza.fonte_incerteza,
          descricao: incerteza.descricao || '',
          valor_incerteza: parseFloat(incerteza.valor_incerteza),
          unidade_incerteza: incerteza.unidade_incerteza || '',
          metodo_calculo: incerteza.metodo_calculo || 'GUM',
          nivel_confianca: parseFloat(incerteza.nivel_confianca) || 95.45,
          distribuicao_probabilidade: incerteza.distribuicao_probabilidade || 'Normal',
          coeficiente_sensibilidade: parseFloat(incerteza.coeficiente_sensibilidade) || 1.0,
          contribuicao_incerteza: parseFloat(incerteza.contribuicao_incerteza) || 0,
          status_incerteza: incerteza.status_incerteza || 'Ativa',
          data_avaliacao: incerteza.data_avaliacao || new Date().toISOString().split('T')[0],
          responsavel_avaliacao: incerteza.responsavel_avaliacao || '',
          observacoes: incerteza.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        incertezasImportadas.push(novaIncerteza);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar incertezas válidas
    incertezas.push(...incertezasImportadas);
    
    res.json({
      success: true,
      data: {
        importadas: incertezasImportadas.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${incertezasImportadas.length} incertezas importadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar incertezas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/incertezas/relatorio/:tag_ponto
 * Gera relatório detalhado de incertezas para um ponto
 */
router.get('/relatorio/:tag_ponto', async (req, res) => {
  try {
    const { tag_ponto } = req.params;
    
    const incertezasPonto = incertezas.filter(inc => inc.tag_ponto === tag_ponto);
    
    if (incertezasPonto.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nenhuma incerteza encontrada para este ponto'
      });
    }
    
    // Agrupar por tipo
    const porTipo = {};
    incertezasPonto.forEach(inc => {
      if (!porTipo[inc.tipo_incerteza]) {
        porTipo[inc.tipo_incerteza] = [];
      }
      porTipo[inc.tipo_incerteza].push(inc);
    });
    
    // Agrupar por fonte
    const porFonte = {};
    incertezasPonto.forEach(inc => {
      if (!porFonte[inc.fonte_incerteza]) {
        porFonte[inc.fonte_incerteza] = [];
      }
      porFonte[inc.fonte_incerteza].push(inc);
    });
    
    res.json({
      success: true,
      data: {
        tag_ponto,
        total_incertezas: incertezasPonto.length,
        incertezas_ativas: incertezasPonto.filter(inc => inc.status_incerteza === 'Ativa').length,
        resumo_por_tipo: Object.keys(porTipo).map(tipo => ({
          tipo,
          quantidade: porTipo[tipo].length,
          incertezas: porTipo[tipo]
        })),
        resumo_por_fonte: Object.keys(porFonte).map(fonte => ({
          fonte,
          quantidade: porFonte[fonte].length,
          incertezas: porFonte[fonte]
        })),
        incertezas_detalhadas: incertezasPonto
      },
      message: 'Relatório de incertezas gerado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;