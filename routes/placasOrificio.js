// ============================================================================
// ROUTES PARA PLACAS DE ORIFÍCIO - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let placasOrificio = [];

/**
 * GET /api/placas-orificio
 * Lista todas as placas de orifício
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { tag_ponto, fabricante, status, search } = req.query;
    
    let filteredPlacas = [...placasOrificio];
    
    if (tag_ponto) {
      filteredPlacas = filteredPlacas.filter(placa => placa.tag_ponto === tag_ponto);
    }
    
    if (fabricante) {
      filteredPlacas = filteredPlacas.filter(placa => 
        placa.fabricante.toLowerCase().includes(fabricante.toLowerCase())
      );
    }
    
    if (status && status !== 'all') {
      filteredPlacas = filteredPlacas.filter(placa => placa.status_placa === status);
    }
    
    if (search) {
      filteredPlacas = filteredPlacas.filter(placa => 
        placa.tag_ponto.toLowerCase().includes(search.toLowerCase()) ||
        placa.numero_serie.toLowerCase().includes(search.toLowerCase()) ||
        placa.fabricante.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredPlacas,
      total: filteredPlacas.length,
      message: 'Placas de orifício carregadas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar placas de orifício:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar placas de orifício'
    });
  }
});

/**
 * GET /api/placas-orificio/:id
 * Busca placa de orifício por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const placa = placasOrificio.find(p => p.id === parseInt(id));
    
    if (!placa) {
      return res.status(404).json({
        success: false,
        error: 'Placa de orifício não encontrada',
        message: `Placa com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: placa,
      message: 'Placa de orifício encontrada'
    });
    
  } catch (error) {
    console.error('Erro ao buscar placa de orifício:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/placas-orificio
 * Cria nova placa de orifício
 */
router.post('/', async (req, res) => {
  try {
    const {
      tag_ponto,
      numero_serie,
      fabricante,
      material_placa,
      diametro_interno_montante,
      diametro_interno_jusante,
      diametro_furo,
      espessura_placa,
      tipo_tomada_pressao,
      acabamento_superficie,
      relacao_diametros,
      status_placa,
      data_instalacao,
      data_ultima_inspecao,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!tag_ponto || !numero_serie || !fabricante) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Tag do ponto, número de série e fabricante são obrigatórios'
      });
    }
    
    // Verificar se número de série já existe
    const existeNumeroSerie = placasOrificio.some(p => p.numero_serie === numero_serie);
    if (existeNumeroSerie) {
      return res.status(400).json({
        success: false,
        error: 'Número de série já existe',
        message: `Placa com número de série ${numero_serie} já está cadastrada`
      });
    }
    
    const novaPlaca = {
      id: placasOrificio.length + 1,
      tag_ponto,
      numero_serie,
      fabricante,
      material_placa: material_placa || 'Aço Inoxidável 316',
      diametro_interno_montante: parseFloat(diametro_interno_montante) || 0,
      diametro_interno_jusante: parseFloat(diametro_interno_jusante) || 0,
      diametro_furo: parseFloat(diametro_furo) || 0,
      espessura_placa: parseFloat(espessura_placa) || 0,
      tipo_tomada_pressao: tipo_tomada_pressao || 'Corner',
      acabamento_superficie: acabamento_superficie || 'Ra ≤ 10 μm',
      relacao_diametros: parseFloat(relacao_diametros) || 0,
      status_placa: status_placa || 'Ativa',
      data_instalacao: data_instalacao || null,
      data_ultima_inspecao: data_ultima_inspecao || null,
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    placasOrificio.push(novaPlaca);
    
    res.status(201).json({
      success: true,
      data: novaPlaca,
      message: 'Placa de orifício criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar placa de orifício:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/placas-orificio/:id
 * Atualiza placa de orifício existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const placaIndex = placasOrificio.findIndex(p => p.id === parseInt(id));
    
    if (placaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Placa de orifício não encontrada'
      });
    }
    
    // Verificar se novo número de série já existe (se foi alterado)
    if (req.body.numero_serie && req.body.numero_serie !== placasOrificio[placaIndex].numero_serie) {
      const existeNumeroSerie = placasOrificio.some(p => p.numero_serie === req.body.numero_serie);
      if (existeNumeroSerie) {
        return res.status(400).json({
          success: false,
          error: 'Número de série já existe',
          message: `Placa com número de série ${req.body.numero_serie} já está cadastrada`
        });
      }
    }
    
    const placaAtualizada = {
      ...placasOrificio[placaIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    placasOrificio[placaIndex] = placaAtualizada;
    
    res.json({
      success: true,
      data: placaAtualizada,
      message: 'Placa de orifício atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar placa de orifício:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/placas-orificio/:id
 * Remove placa de orifício
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const placaIndex = placasOrificio.findIndex(p => p.id === parseInt(id));
    
    if (placaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Placa de orifício não encontrada'
      });
    }
    
    const placaRemovida = placasOrificio[placaIndex];
    placasOrificio.splice(placaIndex, 1);
    
    res.json({
      success: true,
      data: placaRemovida,
      message: 'Placa de orifício removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover placa de orifício:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/placas-orificio/materiais/lista
 * Lista materiais disponíveis para placas
 */
router.get('/materiais/lista', (req, res) => {
  const materiais = [
    'Aço Inoxidável 316',
    'Aço Inoxidável 316L',
    'Aço Carbono',
    'Inconel 625',
    'Hastelloy C-276',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: materiais,
    message: 'Materiais de placas carregados'
  });
});

/**
 * GET /api/placas-orificio/tomadas/lista
 * Lista tipos de tomadas de pressão
 */
router.get('/tomadas/lista', (req, res) => {
  const tomadas = [
    'Corner',
    'D e D/2',
    'Flange',
    'Pipe',
    'Vena Contracta'
  ];
  
  res.json({
    success: true,
    data: tomadas,
    message: 'Tipos de tomadas carregados'
  });
});

/**
 * GET /api/placas-orificio/status/lista
 * Lista status disponíveis para placas
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Ativa',
    'Inativa',
    'Manutenção',
    'Danificada',
    'Substituída',
    'Descartada'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de placas carregados'
  });
});

/**
 * GET /api/placas-orificio/ponto/:tag_ponto
 * Lista placas por ponto de medição
 */
router.get('/ponto/:tag_ponto', async (req, res) => {
  try {
    const { tag_ponto } = req.params;
    const placasPonto = placasOrificio.filter(p => p.tag_ponto === tag_ponto);
    
    res.json({
      success: true,
      data: placasPonto,
      total: placasPonto.length,
      message: `Placas do ponto ${tag_ponto} carregadas`
    });
    
  } catch (error) {
    console.error('Erro ao buscar placas por ponto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/placas-orificio/importar
 * Importa placas de orifício via CSV/bulk
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
    
    const placasImportadas = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const placa = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!placa.tag_ponto || !placa.numero_serie || !placa.fabricante) {
          erros.push(`Linha ${i + 1}: Tag do ponto, número de série e fabricante são obrigatórios`);
          continue;
        }
        
        // Verificar duplicatas
        const existeNumeroSerie = placasOrificio.some(p => p.numero_serie === placa.numero_serie) ||
                                 placasImportadas.some(p => p.numero_serie === placa.numero_serie);
        
        if (existeNumeroSerie) {
          erros.push(`Linha ${i + 1}: Número de série ${placa.numero_serie} já existe`);
          continue;
        }
        
        const novaPlaca = {
          id: placasOrificio.length + placasImportadas.length + 1,
          tag_ponto: placa.tag_ponto,
          numero_serie: placa.numero_serie,
          fabricante: placa.fabricante,
          material_placa: placa.material_placa || 'Aço Inoxidável 316',
          diametro_interno_montante: parseFloat(placa.diametro_interno_montante) || 0,
          diametro_interno_jusante: parseFloat(placa.diametro_interno_jusante) || 0,
          diametro_furo: parseFloat(placa.diametro_furo) || 0,
          espessura_placa: parseFloat(placa.espessura_placa) || 0,
          tipo_tomada_pressao: placa.tipo_tomada_pressao || 'Corner',
          acabamento_superficie: placa.acabamento_superficie || 'Ra ≤ 10 μm',
          relacao_diametros: parseFloat(placa.relacao_diametros) || 0,
          status_placa: placa.status_placa || 'Ativa',
          data_instalacao: placa.data_instalacao || null,
          data_ultima_inspecao: placa.data_ultima_inspecao || null,
          observacoes: placa.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        placasImportadas.push(novaPlaca);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar placas válidas
    placasOrificio.push(...placasImportadas);
    
    res.json({
      success: true,
      data: {
        importadas: placasImportadas.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${placasImportadas.length} placas de orifício importadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar placas de orifício:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/placas-orificio/:id/calcular-beta
 * Calcula relação β (beta) da placa
 */
router.get('/:id/calcular-beta', async (req, res) => {
  try {
    const { id } = req.params;
    const placa = placasOrificio.find(p => p.id === parseInt(id));
    
    if (!placa) {
      return res.status(404).json({
        success: false,
        error: 'Placa de orifício não encontrada'
      });
    }
    
    // Calcular β = d/D (diâmetro do furo / diâmetro interno)
    const diametroTubo = placa.diametro_interno_montante || placa.diametro_interno_jusante;
    
    if (!diametroTubo || !placa.diametro_furo) {
      return res.status(400).json({
        success: false,
        error: 'Dados insuficientes',
        message: 'Diâmetro do tubo e diâmetro do furo são necessários para calcular β'
      });
    }
    
    const beta = placa.diametro_furo / diametroTubo;
    
    // Verificar se β está dentro dos limites recomendados (0.1 ≤ β ≤ 0.75)
    const dentroDoLimite = beta >= 0.1 && beta <= 0.75;
    
    res.json({
      success: true,
      data: {
        beta: parseFloat(beta.toFixed(4)),
        diametro_furo: placa.diametro_furo,
        diametro_tubo: diametroTubo,
        dentro_do_limite: dentroDoLimite,
        limite_minimo: 0.1,
        limite_maximo: 0.75,
        recomendacao: dentroDoLimite ? 
          'Relação β dentro dos limites recomendados' : 
          'Relação β fora dos limites recomendados (0.1 ≤ β ≤ 0.75)'
      },
      message: 'Relação β calculada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao calcular β:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;