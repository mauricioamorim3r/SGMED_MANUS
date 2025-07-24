// ============================================================================
// ROUTES PARA EQUIPAMENTOS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let equipamentos = [];

/**
 * GET /api/equipamentos
 * Lista todos os equipamentos
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { status, tipo, fabricante, search } = req.query;
    
    let filteredEquipamentos = [...equipamentos];
    
    if (status) {
      filteredEquipamentos = filteredEquipamentos.filter(eq => eq.status_atual === status);
    }
    
    if (tipo) {
      filteredEquipamentos = filteredEquipamentos.filter(eq => eq.tipo_equipamento === tipo);
    }
    
    if (fabricante) {
      filteredEquipamentos = filteredEquipamentos.filter(eq => 
        eq.fabricante.toLowerCase().includes(fabricante.toLowerCase())
      );
    }
    
    if (search) {
      filteredEquipamentos = filteredEquipamentos.filter(eq => 
        eq.nome_equipamento.toLowerCase().includes(search.toLowerCase()) ||
        eq.numero_serie.toLowerCase().includes(search.toLowerCase()) ||
        eq.tag_equipamento.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredEquipamentos,
      total: filteredEquipamentos.length,
      message: 'Equipamentos carregados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar equipamentos'
    });
  }
});

/**
 * GET /api/equipamentos/:id
 * Busca equipamento por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipamento = equipamentos.find(eq => eq.id === parseInt(id));
    
    if (!equipamento) {
      return res.status(404).json({
        success: false,
        error: 'Equipamento não encontrado',
        message: `Equipamento com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: equipamento,
      message: 'Equipamento encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao buscar equipamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/equipamentos
 * Cria novo equipamento
 */
router.post('/', async (req, res) => {
  try {
    const {
      numero_serie,
      tag_equipamento,
      nome_equipamento,
      fabricante,
      modelo,
      tipo_equipamento,
      faixa_equipamento,
      faixa_pam,
      faixa_calibrada,
      unidade_medicao,
      erro_maximo_admissivel,
      criterio_aceitacao,
      status_atual,
      localizacao_fisica,
      frequencia_calibracao,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!numero_serie || !tag_equipamento || !nome_equipamento) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Número de série, tag e nome do equipamento são obrigatórios'
      });
    }
    
    // Verificar se número de série já existe
    const existeNumeroSerie = equipamentos.some(eq => eq.numero_serie === numero_serie);
    if (existeNumeroSerie) {
      return res.status(400).json({
        success: false,
        error: 'Número de série já existe',
        message: `Equipamento com número de série ${numero_serie} já está cadastrado`
      });
    }
    
    // Verificar se tag já existe
    const existeTag = equipamentos.some(eq => eq.tag_equipamento === tag_equipamento);
    if (existeTag) {
      return res.status(400).json({
        success: false,
        error: 'Tag já existe',
        message: `Equipamento com tag ${tag_equipamento} já está cadastrado`
      });
    }
    
    const novoEquipamento = {
      id: equipamentos.length + 1,
      numero_serie,
      tag_equipamento,
      nome_equipamento,
      fabricante: fabricante || '',
      modelo: modelo || '',
      tipo_equipamento: tipo_equipamento || 'Outros',
      faixa_equipamento: faixa_equipamento || '',
      faixa_pam: faixa_pam || '',
      faixa_calibrada: faixa_calibrada || '',
      unidade_medicao: unidade_medicao || '',
      erro_maximo_admissivel: erro_maximo_admissivel || '',
      criterio_aceitacao: criterio_aceitacao || '',
      status_atual: status_atual || 'Estoque',
      localizacao_fisica: localizacao_fisica || '',
      frequencia_calibracao: frequencia_calibracao || 12,
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    equipamentos.push(novoEquipamento);
    
    res.status(201).json({
      success: true,
      data: novoEquipamento,
      message: 'Equipamento criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar equipamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/equipamentos/:id
 * Atualiza equipamento existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipamentoIndex = equipamentos.findIndex(eq => eq.id === parseInt(id));
    
    if (equipamentoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Equipamento não encontrado'
      });
    }
    
    const equipamentoAtualizado = {
      ...equipamentos[equipamentoIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    equipamentos[equipamentoIndex] = equipamentoAtualizado;
    
    res.json({
      success: true,
      data: equipamentoAtualizado,
      message: 'Equipamento atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/equipamentos/:id
 * Remove equipamento
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const equipamentoIndex = equipamentos.findIndex(eq => eq.id === parseInt(id));
    
    if (equipamentoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Equipamento não encontrado'
      });
    }
    
    const equipamentoRemovido = equipamentos[equipamentoIndex];
    equipamentos.splice(equipamentoIndex, 1);
    
    res.json({
      success: true,
      data: equipamentoRemovido,
      message: 'Equipamento removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover equipamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/equipamentos/tipos/lista
 * Lista tipos de equipamentos disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'Transmissor_Pressao',
    'Transmissor_Temperatura',
    'Transmissor_Vazao',
    'Ultrassonico',
    'Coriolis',
    'Turbina',
    'Placa_Orificio',
    'Analisador',
    'Cromatografo',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de equipamentos carregados'
  });
});

/**
 * GET /api/equipamentos/status/lista
 * Lista status disponíveis
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Instalado',
    'Estoque',
    'Calibração',
    'Manutenção',
    'Reserva',
    'Descartado',
    'Inativo'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de equipamentos carregados'
  });
});

module.exports = router;