// ============================================================================
// ROUTES PARA PONTOS DE MEDIÇÃO - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let pontosMedicao = [];

/**
 * GET /api/pontos-medicao
 * Lista todos os pontos de medição
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { instalacao_id, polo_id, status, classificacao, search } = req.query;
    
    let filteredPontos = [...pontosMedicao];
    
    if (polo_id) {
      filteredPontos = filteredPontos.filter(ponto => ponto.polo_id === parseInt(polo_id));
    }
    
    if (instalacao_id) {
      filteredPontos = filteredPontos.filter(ponto => ponto.instalacao_id === parseInt(instalacao_id));
    }
    
    if (status && status !== 'all') {
      filteredPontos = filteredPontos.filter(ponto => ponto.status_ponto === status);
    }
    
    if (classificacao) {
      filteredPontos = filteredPontos.filter(ponto => ponto.classificacao === classificacao);
    }
    
    if (search) {
      filteredPontos = filteredPontos.filter(ponto => 
        ponto.tag_ponto.toLowerCase().includes(search.toLowerCase()) ||
        ponto.nome_ponto.toLowerCase().includes(search.toLowerCase()) ||
        ponto.localizacao.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredPontos,
      total: filteredPontos.length,
      message: 'Pontos de medição carregados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar pontos de medição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar pontos de medição'
    });
  }
});

/**
 * GET /api/pontos-medicao/:id
 * Busca ponto de medição por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ponto = pontosMedicao.find(p => p.id === parseInt(id));
    
    if (!ponto) {
      return res.status(404).json({
        success: false,
        error: 'Ponto de medição não encontrado',
        message: `Ponto com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: ponto,
      message: 'Ponto de medição encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao buscar ponto de medição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/pontos-medicao
 * Cria novo ponto de medição
 */
router.post('/', async (req, res) => {
  try {
    const {
      polo_id,
      instalacao_id,
      tag_ponto,
      nome_ponto,
      localizacao,
      tipo_medidor_primario,
      fluido_medido,
      direcao_fluxo,
      diametro_nominal,
      solicitacao_calibracao,
      status_ponto,
      sistema_medicao,
      classificacao,
      numero_serie_atual,
      data_instalacao_atual,
      data_ultima_calibracao,
      data_proxima_calibracao,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!tag_ponto || !nome_ponto || !polo_id || !instalacao_id) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Tag, nome, polo e instalação são obrigatórios'
      });
    }
    
    // Verificar se tag já existe
    const existeTag = pontosMedicao.some(p => p.tag_ponto === tag_ponto);
    if (existeTag) {
      return res.status(400).json({
        success: false,
        error: 'Tag já existe',
        message: `Ponto com tag ${tag_ponto} já está cadastrado`
      });
    }
    
    const novoPonto = {
      id: pontosMedicao.length + 1,
      polo_id: parseInt(polo_id),
      instalacao_id: parseInt(instalacao_id),
      tag_ponto,
      nome_ponto,
      localizacao: localizacao || '',
      tipo_medidor_primario: tipo_medidor_primario || 'Placa_Orificio',
      fluido_medido: fluido_medido || 'Gas_Natural',
      direcao_fluxo: direcao_fluxo || 'Entrada',
      diametro_nominal: diametro_nominal || 0,
      solicitacao_calibracao: solicitacao_calibracao || 'Pendente',
      status_ponto: status_ponto || 'Ativo',
      sistema_medicao: sistema_medicao || '',
      classificacao: classificacao || 'Operacional',
      numero_serie_atual: numero_serie_atual || '',
      data_instalacao_atual: data_instalacao_atual || null,
      data_ultima_calibracao: data_ultima_calibracao || null,
      data_proxima_calibracao: data_proxima_calibracao || null,
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    pontosMedicao.push(novoPonto);
    
    res.status(201).json({
      success: true,
      data: novoPonto,
      message: 'Ponto de medição criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar ponto de medição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/pontos-medicao/:id
 * Atualiza ponto de medição existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pontoIndex = pontosMedicao.findIndex(p => p.id === parseInt(id));
    
    if (pontoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ponto de medição não encontrado'
      });
    }
    
    // Verificar se nova tag já existe (se foi alterada)
    if (req.body.tag_ponto && req.body.tag_ponto !== pontosMedicao[pontoIndex].tag_ponto) {
      const existeTag = pontosMedicao.some(p => p.tag_ponto === req.body.tag_ponto);
      if (existeTag) {
        return res.status(400).json({
          success: false,
          error: 'Tag já existe',
          message: `Ponto com tag ${req.body.tag_ponto} já está cadastrado`
        });
      }
    }
    
    const pontoAtualizado = {
      ...pontosMedicao[pontoIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    pontosMedicao[pontoIndex] = pontoAtualizado;
    
    res.json({
      success: true,
      data: pontoAtualizado,
      message: 'Ponto de medição atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar ponto de medição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/pontos-medicao/:id
 * Remove ponto de medição
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pontoIndex = pontosMedicao.findIndex(p => p.id === parseInt(id));
    
    if (pontoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ponto de medição não encontrado'
      });
    }
    
    const pontoRemovido = pontosMedicao[pontoIndex];
    pontosMedicao.splice(pontoIndex, 1);
    
    res.json({
      success: true,
      data: pontoRemovido,
      message: 'Ponto de medição removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover ponto de medição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/pontos-medicao/tipos/lista
 * Lista tipos de medidores primários
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'Placa_Orificio',
    'Ultrassonico',
    'Coriolis',
    'Turbina',
    'Vortex',
    'Eletromagnetico',
    'Termico',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de medidores carregados'
  });
});

/**
 * GET /api/pontos-medicao/fluidos/lista
 * Lista fluidos medidos
 */
router.get('/fluidos/lista', (req, res) => {
  const fluidos = [
    'Gas_Natural',
    'Oleo_Cru',
    'Agua_Producao',
    'GLP',
    'Condensado',
    'Diesel',
    'Gasolina',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: fluidos,
    message: 'Fluidos medidos carregados'
  });
});

/**
 * GET /api/pontos-medicao/status/lista
 * Lista status disponíveis
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Ativo',
    'Inativo',
    'Manutenção',
    'Calibração',
    'Bloqueado',
    'Em Teste'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de pontos carregados'
  });
});

/**
 * GET /api/pontos-medicao/classificacao/lista
 * Lista classificações disponíveis
 */
router.get('/classificacao/lista', (req, res) => {
  const classificacoes = [
    'Fiscal',
    'Operacional',
    'Custódia',
    'Processo',
    'Segurança'
  ];
  
  res.json({
    success: true,
    data: classificacoes,
    message: 'Classificações carregadas'
  });
});

/**
 * GET /api/pontos-medicao/instalacao/:instalacao_id
 * Lista pontos por instalação
 */
router.get('/instalacao/:instalacao_id', async (req, res) => {
  try {
    const { instalacao_id } = req.params;
    const pontosInstalacao = pontosMedicao.filter(p => p.instalacao_id === parseInt(instalacao_id));
    
    res.json({
      success: true,
      data: pontosInstalacao,
      total: pontosInstalacao.length,
      message: `Pontos da instalação ${instalacao_id} carregados`
    });
    
  } catch (error) {
    console.error('Erro ao buscar pontos por instalação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/pontos-medicao/importar
 * Importa pontos de medição via CSV/bulk
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
    
    const pontosImportados = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const ponto = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!ponto.tag_ponto || !ponto.nome_ponto || !ponto.polo_id || !ponto.instalacao_id) {
          erros.push(`Linha ${i + 1}: Tag, nome, polo e instalação são obrigatórios`);
          continue;
        }
        
        // Verificar duplicatas
        const existeTag = pontosMedicao.some(p => p.tag_ponto === ponto.tag_ponto) ||
                         pontosImportados.some(p => p.tag_ponto === ponto.tag_ponto);
        
        if (existeTag) {
          erros.push(`Linha ${i + 1}: Tag ${ponto.tag_ponto} já existe`);
          continue;
        }
        
        const novoPonto = {
          id: pontosMedicao.length + pontosImportados.length + 1,
          polo_id: parseInt(ponto.polo_id),
          instalacao_id: parseInt(ponto.instalacao_id),
          tag_ponto: ponto.tag_ponto,
          nome_ponto: ponto.nome_ponto,
          localizacao: ponto.localizacao || '',
          tipo_medidor_primario: ponto.tipo_medidor_primario || 'Placa_Orificio',
          fluido_medido: ponto.fluido_medido || 'Gas_Natural',
          direcao_fluxo: ponto.direcao_fluxo || 'Entrada',
          diametro_nominal: parseFloat(ponto.diametro_nominal) || 0,
          solicitacao_calibracao: ponto.solicitacao_calibracao || 'Pendente',
          status_ponto: ponto.status_ponto || 'Ativo',
          sistema_medicao: ponto.sistema_medicao || '',
          classificacao: ponto.classificacao || 'Operacional',
          numero_serie_atual: ponto.numero_serie_atual || '',
          data_instalacao_atual: ponto.data_instalacao_atual || null,
          data_ultima_calibracao: ponto.data_ultima_calibracao || null,
          data_proxima_calibracao: ponto.data_proxima_calibracao || null,
          observacoes: ponto.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        pontosImportados.push(novoPonto);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar pontos válidos
    pontosMedicao.push(...pontosImportados);
    
    res.json({
      success: true,
      data: {
        importados: pontosImportados.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${pontosImportados.length} pontos de medição importados com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar pontos de medição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;