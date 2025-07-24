// ============================================================================
// ROUTES PARA TRECHOS RETOS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let trechosRetos = [];

/**
 * GET /api/trechos-retos
 * Lista todos os trechos retos
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { tag_ponto, status, atende_norma, search } = req.query;
    
    let filteredTrechos = [...trechosRetos];
    
    if (tag_ponto) {
      filteredTrechos = filteredTrechos.filter(trecho => trecho.tag_ponto === tag_ponto);
    }
    
    if (status && status !== 'all') {
      filteredTrechos = filteredTrechos.filter(trecho => trecho.status_trecho === status);
    }
    
    if (atende_norma !== undefined) {
      const atendeNorma = atende_norma === 'true';
      filteredTrechos = filteredTrechos.filter(trecho => trecho.atende_norma === atendeNorma);
    }
    
    if (search) {
      filteredTrechos = filteredTrechos.filter(trecho => 
        trecho.tag_ponto.toLowerCase().includes(search.toLowerCase()) ||
        trecho.localizacao.toLowerCase().includes(search.toLowerCase()) ||
        trecho.observacoes.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredTrechos,
      total: filteredTrechos.length,
      message: 'Trechos retos carregados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar trechos retos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar trechos retos'
    });
  }
});

/**
 * GET /api/trechos-retos/:id
 * Busca trecho reto por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trecho = trechosRetos.find(t => t.id === parseInt(id));
    
    if (!trecho) {
      return res.status(404).json({
        success: false,
        error: 'Trecho reto não encontrado',
        message: `Trecho com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: trecho,
      message: 'Trecho reto encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao buscar trecho reto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/trechos-retos
 * Cria novo trecho reto
 */
router.post('/', async (req, res) => {
  try {
    const {
      tag_ponto,
      localizacao,
      diametro_nominal,
      comprimento_montante,
      comprimento_jusante,
      comprimento_total,
      minimo_requerido_montante,
      minimo_requerido_jusante,
      norma_referencia,
      atende_norma,
      tipo_perturbacao_montante,
      tipo_perturbacao_jusante,
      status_trecho,
      data_inspecao,
      responsavel_inspecao,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!tag_ponto || !diametro_nominal) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Tag do ponto e diâmetro nominal são obrigatórios'
      });
    }
    
    // Calcular se atende norma automaticamente se não informado
    let atendeNormaCalculado = atende_norma;
    if (atendeNormaCalculado === undefined && 
        comprimento_montante && comprimento_jusante && 
        minimo_requerido_montante && minimo_requerido_jusante) {
      
      atendeNormaCalculado = 
        comprimento_montante >= minimo_requerido_montante && 
        comprimento_jusante >= minimo_requerido_jusante;
    }
    
    const novoTrecho = {
      id: trechosRetos.length + 1,
      tag_ponto,
      localizacao: localizacao || '',
      diametro_nominal: parseFloat(diametro_nominal),
      comprimento_montante: parseFloat(comprimento_montante) || 0,
      comprimento_jusante: parseFloat(comprimento_jusante) || 0,
      comprimento_total: parseFloat(comprimento_total) || 
        (parseFloat(comprimento_montante) || 0) + (parseFloat(comprimento_jusante) || 0),
      minimo_requerido_montante: parseFloat(minimo_requerido_montante) || 0,
      minimo_requerido_jusante: parseFloat(minimo_requerido_jusante) || 0,
      norma_referencia: norma_referencia || 'ISO 5167',
      atende_norma: atendeNormaCalculado !== undefined ? atendeNormaCalculado : false,
      tipo_perturbacao_montante: tipo_perturbacao_montante || 'Nenhuma',
      tipo_perturbacao_jusante: tipo_perturbacao_jusante || 'Nenhuma',
      status_trecho: status_trecho || 'Ativo',
      data_inspecao: data_inspecao || new Date().toISOString().split('T')[0],
      responsavel_inspecao: responsavel_inspecao || '',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    trechosRetos.push(novoTrecho);
    
    res.status(201).json({
      success: true,
      data: novoTrecho,
      message: 'Trecho reto criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar trecho reto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/trechos-retos/:id
 * Atualiza trecho reto existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trechoIndex = trechosRetos.findIndex(t => t.id === parseInt(id));
    
    if (trechoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Trecho reto não encontrado'
      });
    }
    
    // Recalcular atende_norma se dados de comprimento foram alterados
    const dadosAtualizacao = { ...req.body };
    
    if (dadosAtualizacao.comprimento_montante || dadosAtualizacao.comprimento_jusante ||
        dadosAtualizacao.minimo_requerido_montante || dadosAtualizacao.minimo_requerido_jusante) {
      
      const trechoAtual = trechosRetos[trechoIndex];
      const comprimentoMontante = parseFloat(dadosAtualizacao.comprimento_montante) || trechoAtual.comprimento_montante;
      const comprimentoJusante = parseFloat(dadosAtualizacao.comprimento_jusante) || trechoAtual.comprimento_jusante;
      const minimoMontante = parseFloat(dadosAtualizacao.minimo_requerido_montante) || trechoAtual.minimo_requerido_montante;
      const minimoJusante = parseFloat(dadosAtualizacao.minimo_requerido_jusante) || trechoAtual.minimo_requerido_jusante;
      
      if (comprimentoMontante && comprimentoJusante && minimoMontante && minimoJusante) {
        dadosAtualizacao.atende_norma = comprimentoMontante >= minimoMontante && comprimentoJusante >= minimoJusante;
      }
      
      // Atualizar comprimento total se não foi fornecido
      if (!dadosAtualizacao.comprimento_total) {
        dadosAtualizacao.comprimento_total = comprimentoMontante + comprimentoJusante;
      }
    }
    
    const trechoAtualizado = {
      ...trechosRetos[trechoIndex],
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    };
    
    trechosRetos[trechoIndex] = trechoAtualizado;
    
    res.json({
      success: true,
      data: trechoAtualizado,
      message: 'Trecho reto atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar trecho reto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/trechos-retos/:id
 * Remove trecho reto
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const trechoIndex = trechosRetos.findIndex(t => t.id === parseInt(id));
    
    if (trechoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Trecho reto não encontrado'
      });
    }
    
    const trechoRemovido = trechosRetos[trechoIndex];
    trechosRetos.splice(trechoIndex, 1);
    
    res.json({
      success: true,
      data: trechoRemovido,
      message: 'Trecho reto removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover trecho reto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/trechos-retos/normas/lista
 * Lista normas de referência disponíveis
 */
router.get('/normas/lista', (req, res) => {
  const normas = [
    'ISO 5167',
    'AGA-3',
    'API MPMS 14.3',
    'ASME MFC-3M',
    'BS 1042',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: normas,
    message: 'Normas de referência carregadas'
  });
});

/**
 * GET /api/trechos-retos/perturbacoes/lista
 * Lista tipos de perturbações disponíveis
 */
router.get('/perturbacoes/lista', (req, res) => {
  const perturbacoes = [
    'Nenhuma',
    'Curva 90°',
    'Curva 45°',
    'Tê',
    'Redução Concêntrica',
    'Redução Excêntrica',
    'Válvula',
    'Filtro',
    'Flange',
    'Soldas',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: perturbacoes,
    message: 'Tipos de perturbações carregados'
  });
});

/**
 * GET /api/trechos-retos/status/lista
 * Lista status disponíveis para trechos
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Ativo',
    'Inativo',
    'Em Revisão',
    'Não Conforme',
    'Aguardando Correção',
    'Arquivado'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de trechos carregados'
  });
});

/**
 * GET /api/trechos-retos/ponto/:tag_ponto
 * Lista trechos por ponto de medição
 */
router.get('/ponto/:tag_ponto', async (req, res) => {
  try {
    const { tag_ponto } = req.params;
    const trechosPonto = trechosRetos.filter(t => t.tag_ponto === tag_ponto);
    
    res.json({
      success: true,
      data: trechosPonto,
      total: trechosPonto.length,
      message: `Trechos retos do ponto ${tag_ponto} carregados`
    });
    
  } catch (error) {
    console.error('Erro ao buscar trechos por ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/trechos-retos/validar-norma
 * Valida se um trecho atende às exigências da norma
 */
router.post('/validar-norma', async (req, res) => {
  try {
    const {
      comprimento_montante,
      comprimento_jusante,
      diametro_nominal,
      norma_referencia = 'ISO 5167',
      tipo_perturbacao_montante = 'Nenhuma',
      tipo_perturbacao_jusante = 'Nenhuma'
    } = req.body;
    
    if (!comprimento_montante || !comprimento_jusante || !diametro_nominal) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Comprimentos e diâmetro são obrigatórios'
      });
    }
    
    // Tabela simplificada de requisitos (em diâmetros)
    // Na implementação real, seria mais complexa baseada na norma específica
    let minimoMontante = 10; // 10D para caso geral
    let minimoJusante = 5;   // 5D para caso geral
    
    // Ajustar baseado no tipo de perturbação
    switch (tipo_perturbacao_montante) {
      case 'Curva 90°':
        minimoMontante = 44;
        break;
      case 'Curva 45°':
        minimoMontante = 22;
        break;
      case 'Tê':
        minimoMontante = 28;
        break;
      case 'Válvula':
        minimoMontante = 18;
        break;
      case 'Redução Concêntrica':
        minimoMontante = 12;
        break;
      default:
        minimoMontante = 10;
    }
    
    switch (tipo_perturbacao_jusante) {
      case 'Curva 90°':
      case 'Curva 45°':
      case 'Tê':
        minimoJusante = 8;
        break;
      case 'Válvula':
        minimoJusante = 7;
        break;
      default:
        minimoJusante = 5;
    }
    
    // Converter para unidades absolutas
    const minimoMontanteAbs = minimoMontante * diametro_nominal;
    const minimoJusanteAbs = minimoJusante * diametro_nominal;
    
    const atendeMontante = comprimento_montante >= minimoMontanteAbs;
    const atendeJusante = comprimento_jusante >= minimoJusanteAbs;
    const atendeNorma = atendeMontante && atendeJusante;
    
    res.json({
      success: true,
      data: {
        norma_referencia,
        diametro_nominal,
        comprimento_montante,
        comprimento_jusante,
        minimo_requerido_montante: minimoMontanteAbs,
        minimo_requerido_jusante: minimoJusanteAbs,
        minimo_montante_diametros: minimoMontante,
        minimo_jusante_diametros: minimoJusante,
        atende_montante: atendeMontante,
        atende_jusante: atendeJusante,
        atende_norma: atendeNorma,
        deficit_montante: atendeMontante ? 0 : minimoMontanteAbs - comprimento_montante,
        deficit_jusante: atendeJusante ? 0 : minimoJusanteAbs - comprimento_jusante,
        recomendacao: atendeNorma ? 
          'Trecho reto atende aos requisitos da norma' : 
          'Trecho reto NÃO atende aos requisitos. Verificar déficits.',
        data_validacao: new Date().toISOString()
      },
      message: 'Validação concluída'
    });
    
  } catch (error) {
    console.error('Erro ao validar norma:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/trechos-retos/importar
 * Importa trechos retos via CSV/bulk
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
    
    const trechosImportados = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const trecho = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!trecho.tag_ponto || !trecho.diametro_nominal) {
          erros.push(`Linha ${i + 1}: Tag do ponto e diâmetro nominal são obrigatórios`);
          continue;
        }
        
        const novoTrecho = {
          id: trechosRetos.length + trechosImportados.length + 1,
          tag_ponto: trecho.tag_ponto,
          localizacao: trecho.localizacao || '',
          diametro_nominal: parseFloat(trecho.diametro_nominal),
          comprimento_montante: parseFloat(trecho.comprimento_montante) || 0,
          comprimento_jusante: parseFloat(trecho.comprimento_jusante) || 0,
          comprimento_total: parseFloat(trecho.comprimento_total) || 
            (parseFloat(trecho.comprimento_montante) || 0) + (parseFloat(trecho.comprimento_jusante) || 0),
          minimo_requerido_montante: parseFloat(trecho.minimo_requerido_montante) || 0,
          minimo_requerido_jusante: parseFloat(trecho.minimo_requerido_jusante) || 0,
          norma_referencia: trecho.norma_referencia || 'ISO 5167',
          atende_norma: trecho.atende_norma !== undefined ? trecho.atende_norma : false,
          tipo_perturbacao_montante: trecho.tipo_perturbacao_montante || 'Nenhuma',
          tipo_perturbacao_jusante: trecho.tipo_perturbacao_jusante || 'Nenhuma',
          status_trecho: trecho.status_trecho || 'Ativo',
          data_inspecao: trecho.data_inspecao || new Date().toISOString().split('T')[0],
          responsavel_inspecao: trecho.responsavel_inspecao || '',
          observacoes: trecho.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        trechosImportados.push(novoTrecho);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar trechos válidos
    trechosRetos.push(...trechosImportados);
    
    res.json({
      success: true,
      data: {
        importados: trechosImportados.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${trechosImportados.length} trechos retos importados com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar trechos retos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;