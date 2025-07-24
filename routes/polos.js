// ============================================================================
// ROUTES PARA POLOS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let polos = [];

/**
 * GET /api/polos
 * Lista todos os polos
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { status, search } = req.query;
    
    let filteredPolos = [...polos];
    
    if (status && status !== 'all') {
      filteredPolos = filteredPolos.filter(polo => polo.status_polo === status);
    }
    
    if (search) {
      filteredPolos = filteredPolos.filter(polo => 
        polo.nome_polo.toLowerCase().includes(search.toLowerCase()) ||
        polo.codigo_polo.toLowerCase().includes(search.toLowerCase()) ||
        polo.localizacao.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredPolos,
      total: filteredPolos.length,
      message: 'Polos carregados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar polos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar polos'
    });
  }
});

/**
 * GET /api/polos/:id
 * Busca polo por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const polo = polos.find(p => p.id === parseInt(id));
    
    if (!polo) {
      return res.status(404).json({
        success: false,
        error: 'Polo não encontrado',
        message: `Polo com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: polo,
      message: 'Polo encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao buscar polo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/polos
 * Cria novo polo
 */
router.post('/', async (req, res) => {
  try {
    const {
      nome_polo,
      codigo_polo,
      localizacao,
      responsavel_tecnico,
      contato_responsavel,
      status_polo,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!nome_polo || !codigo_polo) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Nome e código do polo são obrigatórios'
      });
    }
    
    // Verificar se código já existe
    const existeCodigo = polos.some(p => p.codigo_polo === codigo_polo);
    if (existeCodigo) {
      return res.status(400).json({
        success: false,
        error: 'Código já existe',
        message: `Polo com código ${codigo_polo} já está cadastrado`
      });
    }
    
    const novoPolo = {
      id: polos.length + 1,
      nome_polo,
      codigo_polo,
      localizacao: localizacao || '',
      responsavel_tecnico: responsavel_tecnico || '',
      contato_responsavel: contato_responsavel || '',
      status_polo: status_polo || 'Ativo',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    polos.push(novoPolo);
    
    res.status(201).json({
      success: true,
      data: novoPolo,
      message: 'Polo criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar polo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/polos/:id
 * Atualiza polo existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poloIndex = polos.findIndex(p => p.id === parseInt(id));
    
    if (poloIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Polo não encontrado'
      });
    }
    
    // Verificar se novo código já existe (se foi alterado)
    if (req.body.codigo_polo && req.body.codigo_polo !== polos[poloIndex].codigo_polo) {
      const existeCodigo = polos.some(p => p.codigo_polo === req.body.codigo_polo);
      if (existeCodigo) {
        return res.status(400).json({
          success: false,
          error: 'Código já existe',
          message: `Polo com código ${req.body.codigo_polo} já está cadastrado`
        });
      }
    }
    
    const poloAtualizado = {
      ...polos[poloIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    polos[poloIndex] = poloAtualizado;
    
    res.json({
      success: true,
      data: poloAtualizado,
      message: 'Polo atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar polo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/polos/:id
 * Remove polo
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poloIndex = polos.findIndex(p => p.id === parseInt(id));
    
    if (poloIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Polo não encontrado'
      });
    }
    
    const poloRemovido = polos[poloIndex];
    polos.splice(poloIndex, 1);
    
    res.json({
      success: true,
      data: poloRemovido,
      message: 'Polo removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover polo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/polos/status/lista
 * Lista status disponíveis para polos
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Ativo',
    'Inativo',
    'Manutenção',
    'Planejamento',
    'Descomissionado'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de polos carregados'
  });
});

/**
 * POST /api/polos/importar
 * Importa polos via CSV/bulk
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
    
    const polosImportados = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const polo = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!polo.nome_polo || !polo.codigo_polo) {
          erros.push(`Linha ${i + 1}: Nome e código são obrigatórios`);
          continue;
        }
        
        // Verificar duplicatas
        const existeCodigo = polos.some(p => p.codigo_polo === polo.codigo_polo) ||
                            polosImportados.some(p => p.codigo_polo === polo.codigo_polo);
        
        if (existeCodigo) {
          erros.push(`Linha ${i + 1}: Código ${polo.codigo_polo} já existe`);
          continue;
        }
        
        const novoPolo = {
          id: polos.length + polosImportados.length + 1,
          nome_polo: polo.nome_polo,
          codigo_polo: polo.codigo_polo,
          localizacao: polo.localizacao || '',
          responsavel_tecnico: polo.responsavel_tecnico || '',
          contato_responsavel: polo.contato_responsavel || '',
          status_polo: polo.status_polo || 'Ativo',
          observacoes: polo.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        polosImportados.push(novoPolo);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar polos válidos
    polos.push(...polosImportados);
    
    res.json({
      success: true,
      data: {
        importados: polosImportados.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${polosImportados.length} polos importados com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar polos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;