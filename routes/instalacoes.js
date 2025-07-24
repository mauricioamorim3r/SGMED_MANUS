// ============================================================================
// ROUTES PARA INSTALAÇÕES - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let instalacoes = [];

/**
 * GET /api/instalacoes
 * Lista todas as instalações
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { polo_id, status, tipo, search } = req.query;
    
    let filteredInstalacoes = [...instalacoes];
    
    if (polo_id) {
      filteredInstalacoes = filteredInstalacoes.filter(inst => inst.polo_id === parseInt(polo_id));
    }
    
    if (status && status !== 'all') {
      filteredInstalacoes = filteredInstalacoes.filter(inst => inst.status_instalacao === status);
    }
    
    if (tipo) {
      filteredInstalacoes = filteredInstalacoes.filter(inst => inst.tipo_instalacao === tipo);
    }
    
    if (search) {
      filteredInstalacoes = filteredInstalacoes.filter(inst => 
        inst.nome_instalacao.toLowerCase().includes(search.toLowerCase()) ||
        inst.codigo_instalacao.toLowerCase().includes(search.toLowerCase()) ||
        inst.localizacao.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredInstalacoes,
      total: filteredInstalacoes.length,
      message: 'Instalações carregadas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar instalações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar instalações'
    });
  }
});

/**
 * GET /api/instalacoes/:id
 * Busca instalação por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instalacao = instalacoes.find(inst => inst.id === parseInt(id));
    
    if (!instalacao) {
      return res.status(404).json({
        success: false,
        error: 'Instalação não encontrada',
        message: `Instalação com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: instalacao,
      message: 'Instalação encontrada'
    });
    
  } catch (error) {
    console.error('Erro ao buscar instalação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/instalacoes
 * Cria nova instalação
 */
router.post('/', async (req, res) => {
  try {
    const {
      polo_id,
      nome_instalacao,
      codigo_instalacao,
      tipo_instalacao,
      localizacao,
      responsavel_tecnico,
      contato_responsavel,
      status_instalacao,
      data_inicio_operacao,
      capacidade_producao,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!nome_instalacao || !codigo_instalacao || !polo_id) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Nome, código da instalação e polo são obrigatórios'
      });
    }
    
    // Verificar se código já existe
    const existeCodigo = instalacoes.some(inst => inst.codigo_instalacao === codigo_instalacao);
    if (existeCodigo) {
      return res.status(400).json({
        success: false,
        error: 'Código já existe',
        message: `Instalação com código ${codigo_instalacao} já está cadastrada`
      });
    }
    
    const novaInstalacao = {
      id: instalacoes.length + 1,
      polo_id: parseInt(polo_id),
      nome_instalacao,
      codigo_instalacao,
      tipo_instalacao: tipo_instalacao || 'UPGN',
      localizacao: localizacao || '',
      responsavel_tecnico: responsavel_tecnico || '',
      contato_responsavel: contato_responsavel || '',
      status_instalacao: status_instalacao || 'Operacional',
      data_inicio_operacao: data_inicio_operacao || null,
      capacidade_producao: capacidade_producao || null,
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    instalacoes.push(novaInstalacao);
    
    res.status(201).json({
      success: true,
      data: novaInstalacao,
      message: 'Instalação criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar instalação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/instalacoes/:id
 * Atualiza instalação existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instalacaoIndex = instalacoes.findIndex(inst => inst.id === parseInt(id));
    
    if (instalacaoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Instalação não encontrada'
      });
    }
    
    // Verificar se novo código já existe (se foi alterado)
    if (req.body.codigo_instalacao && req.body.codigo_instalacao !== instalacoes[instalacaoIndex].codigo_instalacao) {
      const existeCodigo = instalacoes.some(inst => inst.codigo_instalacao === req.body.codigo_instalacao);
      if (existeCodigo) {
        return res.status(400).json({
          success: false,
          error: 'Código já existe',
          message: `Instalação com código ${req.body.codigo_instalacao} já está cadastrada`
        });
      }
    }
    
    const instalacaoAtualizada = {
      ...instalacoes[instalacaoIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    instalacoes[instalacaoIndex] = instalacaoAtualizada;
    
    res.json({
      success: true,
      data: instalacaoAtualizada,
      message: 'Instalação atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar instalação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/instalacoes/:id
 * Remove instalação
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instalacaoIndex = instalacoes.findIndex(inst => inst.id === parseInt(id));
    
    if (instalacaoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Instalação não encontrada'
      });
    }
    
    const instalacaoRemovida = instalacoes[instalacaoIndex];
    instalacoes.splice(instalacaoIndex, 1);
    
    res.json({
      success: true,
      data: instalacaoRemovida,
      message: 'Instalação removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover instalação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/instalacoes/tipos/lista
 * Lista tipos de instalações disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'UPGN',
    'UTGA',
    'Estação de Medição',
    'Terminal Aquaviário',
    'Terminal Terrestre',
    'Refinaria',
    'Plataforma Marítima',
    'FPSO',
    'UEP',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de instalações carregados'
  });
});

/**
 * GET /api/instalacoes/status/lista
 * Lista status disponíveis para instalações
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Operacional',
    'Parada',
    'Manutenção',
    'Construção',
    'Comissionamento',
    'Descomissionada',
    'Inativa'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de instalações carregados'
  });
});

/**
 * GET /api/instalacoes/polo/:polo_id
 * Lista instalações por polo
 */
router.get('/polo/:polo_id', async (req, res) => {
  try {
    const { polo_id } = req.params;
    const instalacoesPolo = instalacoes.filter(inst => inst.polo_id === parseInt(polo_id));
    
    res.json({
      success: true,
      data: instalacoesPolo,
      total: instalacoesPolo.length,
      message: `Instalações do polo ${polo_id} carregadas`
    });
    
  } catch (error) {
    console.error('Erro ao buscar instalações por polo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/instalacoes/importar
 * Importa instalações via CSV/bulk
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
    
    const instalacoesImportadas = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const instalacao = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!instalacao.nome_instalacao || !instalacao.codigo_instalacao || !instalacao.polo_id) {
          erros.push(`Linha ${i + 1}: Nome, código e polo são obrigatórios`);
          continue;
        }
        
        // Verificar duplicatas
        const existeCodigo = instalacoes.some(inst => inst.codigo_instalacao === instalacao.codigo_instalacao) ||
                            instalacoesImportadas.some(inst => inst.codigo_instalacao === instalacao.codigo_instalacao);
        
        if (existeCodigo) {
          erros.push(`Linha ${i + 1}: Código ${instalacao.codigo_instalacao} já existe`);
          continue;
        }
        
        const novaInstalacao = {
          id: instalacoes.length + instalacoesImportadas.length + 1,
          polo_id: parseInt(instalacao.polo_id),
          nome_instalacao: instalacao.nome_instalacao,
          codigo_instalacao: instalacao.codigo_instalacao,
          tipo_instalacao: instalacao.tipo_instalacao || 'UPGN',
          localizacao: instalacao.localizacao || '',
          responsavel_tecnico: instalacao.responsavel_tecnico || '',
          contato_responsavel: instalacao.contato_responsavel || '',
          status_instalacao: instalacao.status_instalacao || 'Operacional',
          data_inicio_operacao: instalacao.data_inicio_operacao || null,
          capacidade_producao: instalacao.capacidade_producao || null,
          observacoes: instalacao.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        instalacoesImportadas.push(novaInstalacao);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar instalações válidas
    instalacoes.push(...instalacoesImportadas);
    
    res.json({
      success: true,
      data: {
        importadas: instalacoesImportadas.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${instalacoesImportadas.length} instalações importadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar instalações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;