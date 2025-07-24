// ============================================================================
// ROUTES PARA ESTOQUE - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let estoque = [];

/**
 * GET /api/estoque/categorias/lista
 * Lista categorias disponíveis
 */
router.get('/categorias/lista', (req, res) => {
  const categorias = [
    'Equipamentos de Medição',
    'Placas de Orifício',
    'Transmissores',
    'Válvulas',
    'Instrumentos',
    'Sensores',
    'Cabos e Conectores',
    'Padrões de Calibração',
    'Ferramentas',
    'Sobressalentes',
    'Consumíveis',
    'EPI',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: categorias,
    message: 'Categorias carregadas'
  });
});

/**
 * GET /api/estoque/unidades/lista
 * Lista unidades de medida disponíveis
 */
router.get('/unidades/lista', (req, res) => {
  const unidades = [
    'UN', 'PC', 'M', 'CM', 'MM', 'KG', 'G', 'L', 'ML', 
    'M²', 'M³', 'SET', 'KIT', 'PAR', 'CX', 'Outros'
  ];
  
  res.json({
    success: true,
    data: unidades,
    message: 'Unidades de medida carregadas'
  });
});

/**
 * GET /api/estoque/status/lista
 * Lista status disponíveis para itens
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Ativo', 'Inativo', 'Em Uso', 'Disponível', 'Reservado',
    'Manutenção', 'Calibração', 'Vencido', 'Descartado', 'Aguardando Recebimento'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de itens carregados'
  });
});

/**
 * GET /api/estoque/baixo-estoque
 * Lista itens com estoque baixo
 */
router.get('/baixo-estoque', async (req, res) => {
  try {
    const itensBaixoEstoque = estoque.filter(item => 
      item.quantidade_atual <= item.estoque_minimo && item.estoque_minimo > 0
    );
    
    res.json({
      success: true,
      data: itensBaixoEstoque,
      total: itensBaixoEstoque.length,
      message: 'Itens com estoque baixo carregados'
    });
    
  } catch (error) {
    console.error('Erro ao buscar itens com estoque baixo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/estoque/vencidos
 * Lista itens vencidos ou próximos ao vencimento
 */
router.get('/vencidos', async (req, res) => {
  try {
    const { dias_alerta = 30 } = req.query;
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + parseInt(dias_alerta));
    
    const itensVencidos = estoque.filter(item => {
      if (!item.data_validade) return false;
      const dataValidade = new Date(item.data_validade);
      return dataValidade <= dataLimite;
    });
    
    res.json({
      success: true,
      data: itensVencidos,
      total: itensVencidos.length,
      dias_alerta: parseInt(dias_alerta),
      message: 'Itens vencidos ou próximos ao vencimento carregados'
    });
    
  } catch (error) {
    console.error('Erro ao buscar itens vencidos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/estoque
 * Lista todos os itens de estoque
 */
router.get('/', async (req, res) => {
  try {
    const { categoria, status, baixo_estoque, search } = req.query;
    
    let filteredEstoque = [...estoque];
    
    if (categoria) {
      filteredEstoque = filteredEstoque.filter(item => item.categoria === categoria);
    }
    
    if (status && status !== 'all') {
      filteredEstoque = filteredEstoque.filter(item => item.status_item === status);
    }
    
    if (baixo_estoque === 'true') {
      filteredEstoque = filteredEstoque.filter(item => 
        item.quantidade_atual <= item.estoque_minimo
      );
    }
    
    if (search) {
      filteredEstoque = filteredEstoque.filter(item => 
        item.codigo_item.toLowerCase().includes(search.toLowerCase()) ||
        item.descricao.toLowerCase().includes(search.toLowerCase()) ||
        item.fabricante.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredEstoque,
      total: filteredEstoque.length,
      message: 'Itens de estoque carregados com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar itens de estoque'
    });
  }
});

/**
 * GET /api/estoque/:id
 * Busca item de estoque por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = estoque.find(e => e.id === parseInt(id));
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado',
        message: `Item com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: item,
      message: 'Item de estoque encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao buscar item de estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/estoque
 * Cria novo item de estoque
 */
router.post('/', async (req, res) => {
  try {
    const {
      codigo_item, descricao, categoria, subcategoria, unidade_medida, fabricante,
      modelo, numero_serie, quantidade_atual, estoque_minimo, estoque_maximo,
      valor_unitario, localizacao_fisica, data_aquisicao, data_validade,
      fornecedor, numero_nota_fiscal, certificado_calibracao, status_item, observacoes
    } = req.body;
    
    if (!codigo_item || !descricao || !categoria) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Código, descrição e categoria são obrigatórios'
      });
    }
    
    if (estoque.find(item => item.codigo_item === codigo_item)) {
      return res.status(400).json({
        success: false,
        error: 'Código já existe',
        message: `Código ${codigo_item} já está em uso`
      });
    }
    
    const valorTotal = quantidade_atual && valor_unitario ? 
      parseFloat(quantidade_atual) * parseFloat(valor_unitario) : 0;
    
    const novoItem = {
      id: estoque.length + 1,
      codigo_item,
      descricao,
      categoria,
      subcategoria: subcategoria || '',
      unidade_medida: unidade_medida || 'UN',
      fabricante: fabricante || '',
      modelo: modelo || '',
      numero_serie: numero_serie || '',
      quantidade_atual: parseFloat(quantidade_atual) || 0,
      estoque_minimo: parseFloat(estoque_minimo) || 0,
      estoque_maximo: parseFloat(estoque_maximo) || 0,
      valor_unitario: parseFloat(valor_unitario) || 0,
      valor_total_estoque: valorTotal,
      localizacao_fisica: localizacao_fisica || '',
      data_aquisicao: data_aquisicao || null,
      data_validade: data_validade || null,
      fornecedor: fornecedor || '',
      numero_nota_fiscal: numero_nota_fiscal || '',
      certificado_calibracao: certificado_calibracao || '',
      status_item: status_item || 'Ativo',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    estoque.push(novoItem);
    
    res.status(201).json({
      success: true,
      data: novoItem,
      message: 'Item de estoque criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar item de estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/estoque/:id
 * Atualiza item de estoque existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = estoque.findIndex(e => e.id === parseInt(id));
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }
    
    const dadosAtualizacao = { ...req.body };
    const itemAtual = estoque[itemIndex];
    
    const quantidadeAtual = dadosAtualizacao.quantidade_atual !== undefined ? 
      parseFloat(dadosAtualizacao.quantidade_atual) : itemAtual.quantidade_atual;
    const valorUnitario = dadosAtualizacao.valor_unitario !== undefined ? 
      parseFloat(dadosAtualizacao.valor_unitario) : itemAtual.valor_unitario;
    
    if (quantidadeAtual !== undefined && valorUnitario !== undefined) {
      dadosAtualizacao.valor_total_estoque = quantidadeAtual * valorUnitario;
    }
    
    const itemAtualizado = {
      ...itemAtual,
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    };
    
    estoque[itemIndex] = itemAtualizado;
    
    res.json({
      success: true,
      data: itemAtualizado,
      message: 'Item de estoque atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar item de estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/estoque/:id
 * Remove item de estoque
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemIndex = estoque.findIndex(e => e.id === parseInt(id));
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item de estoque não encontrado'
      });
    }
    
    const itemRemovido = estoque[itemIndex];
    estoque.splice(itemIndex, 1);
    
    res.json({
      success: true,
      data: itemRemovido,
      message: 'Item de estoque removido com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover item de estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;