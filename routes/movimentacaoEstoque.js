// ============================================================================
// ROUTES PARA MOVIMENTAÇÃO DE ESTOQUE - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let movimentacoes = [];

/**
 * GET /api/movimentacao-estoque
 * Lista todas as movimentações de estoque
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { codigo_item, tipo_movimentacao, data_inicio, data_fim, responsavel, search } = req.query;
    
    let filteredMovimentacoes = [...movimentacoes];
    
    if (codigo_item) {
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => mov.codigo_item === codigo_item);
    }
    
    if (tipo_movimentacao) {
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => mov.tipo_movimentacao === tipo_movimentacao);
    }
    
    if (responsavel) {
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => 
        mov.responsavel.toLowerCase().includes(responsavel.toLowerCase())
      );
    }
    
    if (data_inicio) {
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => 
        new Date(mov.data_movimentacao) >= new Date(data_inicio)
      );
    }
    
    if (data_fim) {
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => 
        new Date(mov.data_movimentacao) <= new Date(data_fim)
      );
    }
    
    if (search) {
      filteredMovimentacoes = filteredMovimentacoes.filter(mov => 
        mov.codigo_item.toLowerCase().includes(search.toLowerCase()) ||
        mov.descricao_item.toLowerCase().includes(search.toLowerCase()) ||
        mov.responsavel.toLowerCase().includes(search.toLowerCase()) ||
        mov.observacoes.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Ordenar por data mais recente
    filteredMovimentacoes.sort((a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao));
    
    res.json({
      success: true,
      data: filteredMovimentacoes,
      total: filteredMovimentacoes.length,
      message: 'Movimentações de estoque carregadas com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar movimentações de estoque'
    });
  }
});

/**
 * GET /api/movimentacao-estoque/:id
 * Busca movimentação por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacao = movimentacoes.find(m => m.id === parseInt(id));
    
    if (!movimentacao) {
      return res.status(404).json({
        success: false,
        error: 'Movimentação não encontrada',
        message: `Movimentação com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: movimentacao,
      message: 'Movimentação encontrada'
    });
    
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/movimentacao-estoque
 * Cria nova movimentação de estoque
 */
router.post('/', async (req, res) => {
  try {
    const {
      codigo_item,
      descricao_item,
      tipo_movimentacao,
      quantidade,
      unidade_medida,
      valor_unitario,
      data_movimentacao,
      origem,
      destino,
      responsavel,
      documento_referencia,
      numero_nota_fiscal,
      fornecedor_cliente,
      centro_custo,
      projeto,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!codigo_item || !tipo_movimentacao || !quantidade || !responsavel) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Código do item, tipo de movimentação, quantidade e responsável são obrigatórios'
      });
    }
    
    // Calcular valor total
    const valorTotal = valor_unitario ? parseFloat(quantidade) * parseFloat(valor_unitario) : 0;
    
    const novaMovimentacao = {
      id: movimentacoes.length + 1,
      codigo_item,
      descricao_item: descricao_item || '',
      tipo_movimentacao,
      quantidade: parseFloat(quantidade),
      unidade_medida: unidade_medida || 'UN',
      valor_unitario: parseFloat(valor_unitario) || 0,
      valor_total: valorTotal,
      data_movimentacao: data_movimentacao || new Date().toISOString(),
      origem: origem || '',
      destino: destino || '',
      responsavel,
      documento_referencia: documento_referencia || '',
      numero_nota_fiscal: numero_nota_fiscal || '',
      fornecedor_cliente: fornecedor_cliente || '',
      centro_custo: centro_custo || '',
      projeto: projeto || '',
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    movimentacoes.push(novaMovimentacao);
    
    res.status(201).json({
      success: true,
      data: novaMovimentacao,
      message: 'Movimentação de estoque criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/movimentacao-estoque/:id
 * Atualiza movimentação existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacaoIndex = movimentacoes.findIndex(m => m.id === parseInt(id));
    
    if (movimentacaoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Movimentação não encontrada'
      });
    }
    
    // Recalcular valor total se quantidade ou valor unitário foi alterado
    const dadosAtualizacao = { ...req.body };
    const movimentacaoAtual = movimentacoes[movimentacaoIndex];
    
    const quantidade = dadosAtualizacao.quantidade !== undefined ? 
      parseFloat(dadosAtualizacao.quantidade) : movimentacaoAtual.quantidade;
    const valorUnitario = dadosAtualizacao.valor_unitario !== undefined ? 
      parseFloat(dadosAtualizacao.valor_unitario) : movimentacaoAtual.valor_unitario;
    
    if (quantidade !== undefined && valorUnitario !== undefined) {
      dadosAtualizacao.valor_total = quantidade * valorUnitario;
    }
    
    const movimentacaoAtualizada = {
      ...movimentacaoAtual,
      ...dadosAtualizacao,
      updated_at: new Date().toISOString()
    };
    
    movimentacoes[movimentacaoIndex] = movimentacaoAtualizada;
    
    res.json({
      success: true,
      data: movimentacaoAtualizada,
      message: 'Movimentação atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/movimentacao-estoque/:id
 * Remove movimentação
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movimentacaoIndex = movimentacoes.findIndex(m => m.id === parseInt(id));
    
    if (movimentacaoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Movimentação não encontrada'
      });
    }
    
    const movimentacaoRemovida = movimentacoes[movimentacaoIndex];
    movimentacoes.splice(movimentacaoIndex, 1);
    
    res.json({
      success: true,
      data: movimentacaoRemovida,
      message: 'Movimentação removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/movimentacao-estoque/tipos/lista
 * Lista tipos de movimentação disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'Entrada',
    'Saída',
    'Transferência',
    'Ajuste Positivo',
    'Ajuste Negativo',
    'Devolução',
    'Empréstimo',
    'Retorno Empréstimo',
    'Consumo',
    'Perda',
    'Descarte',
    'Inventário'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de movimentação carregados'
  });
});

/**
 * GET /api/movimentacao-estoque/item/:codigo_item
 * Lista movimentações por item
 */
router.get('/item/:codigo_item', async (req, res) => {
  try {
    const { codigo_item } = req.params;
    const movimentacoesItem = movimentacoes
      .filter(m => m.codigo_item === codigo_item)
      .sort((a, b) => new Date(b.data_movimentacao) - new Date(a.data_movimentacao));
    
    // Calcular saldo atual baseado nas movimentações
    let saldoAtual = 0;
    movimentacoesItem.reverse().forEach(mov => {
      switch (mov.tipo_movimentacao) {
        case 'Entrada':
        case 'Ajuste Positivo':
        case 'Devolução':
        case 'Retorno Empréstimo':
          saldoAtual += mov.quantidade;
          break;
        case 'Saída':
        case 'Ajuste Negativo':
        case 'Empréstimo':
        case 'Consumo':
        case 'Perda':
        case 'Descarte':
          saldoAtual -= mov.quantidade;
          break;
        case 'Transferência':
          // Depende se é origem ou destino - simplificado aqui
          break;
      }
    });
    
    res.json({
      success: true,
      data: {
        movimentacoes: movimentacoesItem.reverse(),
        saldo_atual: saldoAtual,
        total_movimentacoes: movimentacoesItem.length
      },
      message: `Histórico do item ${codigo_item} carregado`
    });
    
  } catch (error) {
    console.error('Erro ao buscar histórico do item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/movimentacao-estoque/relatorio/periodo
 * Relatório de movimentações por período
 */
router.get('/relatorio/periodo', async (req, res) => {
  try {
    const { data_inicio, data_fim, tipo_movimentacao } = req.query;
    
    if (!data_inicio || !data_fim) {
      return res.status(400).json({
        success: false,
        error: 'Período obrigatório',
        message: 'Data de início e fim são obrigatórias'
      });
    }
    
    let movimentacoesPeriodo = movimentacoes.filter(mov => {
      const dataMovimentacao = new Date(mov.data_movimentacao);
      return dataMovimentacao >= new Date(data_inicio) && 
             dataMovimentacao <= new Date(data_fim);
    });
    
    if (tipo_movimentacao) {
      movimentacoesPeriodo = movimentacoesPeriodo.filter(mov => 
        mov.tipo_movimentacao === tipo_movimentacao
      );
    }
    
    // Resumo por tipo de movimentação
    const resumoPorTipo = {};
    movimentacoesPeriodo.forEach(mov => {
      if (!resumoPorTipo[mov.tipo_movimentacao]) {
        resumoPorTipo[mov.tipo_movimentacao] = {
          tipo: mov.tipo_movimentacao,
          quantidade_movimentacoes: 0,
          valor_total: 0
        };
      }
      resumoPorTipo[mov.tipo_movimentacao].quantidade_movimentacoes++;
      resumoPorTipo[mov.tipo_movimentacao].valor_total += (mov.valor_total || 0);
    });
    
    const valorTotalPeriodo = movimentacoesPeriodo.reduce((total, mov) => {
      return total + (mov.valor_total || 0);
    }, 0);
    
    res.json({
      success: true,
      data: {
        periodo: {
          data_inicio,
          data_fim
        },
        movimentacoes: movimentacoesPeriodo,
        resumo_por_tipo: Object.values(resumoPorTipo),
        valor_total_periodo: parseFloat(valorTotalPeriodo.toFixed(2)),
        total_movimentacoes: movimentacoesPeriodo.length,
        data_relatorio: new Date().toISOString()
      },
      message: 'Relatório de movimentações por período gerado'
    });
    
  } catch (error) {
    console.error('Erro ao gerar relatório de período:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/movimentacao-estoque/entrada-lote
 * Entrada de lote de itens
 */
router.post('/entrada-lote', async (req, res) => {
  try {
    const { itens, dados_comuns } = req.body;
    
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de itens obrigatória'
      });
    }
    
    const movimentacoesLote = [];
    const erros = [];
    
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      
      try {
        if (!item.codigo_item || !item.quantidade) {
          erros.push(`Item ${i + 1}: Código e quantidade são obrigatórios`);
          continue;
        }
        
        const valorTotal = item.valor_unitario ? 
          parseFloat(item.quantidade) * parseFloat(item.valor_unitario) : 0;
        
        const novaMovimentacao = {
          id: movimentacoes.length + movimentacoesLote.length + 1,
          codigo_item: item.codigo_item,
          descricao_item: item.descricao_item || '',
          tipo_movimentacao: 'Entrada',
          quantidade: parseFloat(item.quantidade),
          unidade_medida: item.unidade_medida || 'UN',
          valor_unitario: parseFloat(item.valor_unitario) || 0,
          valor_total: valorTotal,
          data_movimentacao: dados_comuns?.data_movimentacao || new Date().toISOString(),
          origem: dados_comuns?.origem || '',
          destino: dados_comuns?.destino || '',
          responsavel: dados_comuns?.responsavel || '',
          documento_referencia: dados_comuns?.documento_referencia || '',
          numero_nota_fiscal: dados_comuns?.numero_nota_fiscal || '',
          fornecedor_cliente: dados_comuns?.fornecedor_cliente || '',
          centro_custo: dados_comuns?.centro_custo || '',
          projeto: dados_comuns?.projeto || '',
          observacoes: item.observacoes || dados_comuns?.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        movimentacoesLote.push(novaMovimentacao);
        
      } catch (error) {
        erros.push(`Item ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar movimentações válidas
    movimentacoes.push(...movimentacoesLote);
    
    res.json({
      success: true,
      data: {
        movimentacoes_criadas: movimentacoesLote.length,
        erros: erros.length,
        detalhes_erros: erros,
        movimentacoes: movimentacoesLote
      },
      message: `${movimentacoesLote.length} movimentações de entrada criadas em lote`
    });
    
  } catch (error) {
    console.error('Erro ao processar entrada em lote:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/movimentacao-estoque/importar
 * Importa movimentações via CSV/bulk
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
    
    const movimentacoesImportadas = [];
    const erros = [];
    
    for (let i = 0; i < dados.length; i++) {
      const mov = dados[i];
      
      try {
        // Validar dados obrigatórios
        if (!mov.codigo_item || !mov.tipo_movimentacao || !mov.quantidade || !mov.responsavel) {
          erros.push(`Linha ${i + 1}: Código do item, tipo de movimentação, quantidade e responsável são obrigatórios`);
          continue;
        }
        
        const valorTotal = mov.valor_unitario ? parseFloat(mov.quantidade) * parseFloat(mov.valor_unitario) : 0;
        
        const novaMovimentacao = {
          id: movimentacoes.length + movimentacoesImportadas.length + 1,
          codigo_item: mov.codigo_item,
          descricao_item: mov.descricao_item || '',
          tipo_movimentacao: mov.tipo_movimentacao,
          quantidade: parseFloat(mov.quantidade),
          unidade_medida: mov.unidade_medida || 'UN',
          valor_unitario: parseFloat(mov.valor_unitario) || 0,
          valor_total: valorTotal,
          data_movimentacao: mov.data_movimentacao || new Date().toISOString(),
          origem: mov.origem || '',
          destino: mov.destino || '',
          responsavel: mov.responsavel,
          documento_referencia: mov.documento_referencia || '',
          numero_nota_fiscal: mov.numero_nota_fiscal || '',
          fornecedor_cliente: mov.fornecedor_cliente || '',
          centro_custo: mov.centro_custo || '',
          projeto: mov.projeto || '',
          observacoes: mov.observacoes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        movimentacoesImportadas.push(novaMovimentacao);
        
      } catch (error) {
        erros.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    // Adicionar movimentações válidas
    movimentacoes.push(...movimentacoesImportadas);
    
    res.json({
      success: true,
      data: {
        importadas: movimentacoesImportadas.length,
        erros: erros.length,
        detalhes_erros: erros
      },
      message: `${movimentacoesImportadas.length} movimentações importadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar movimentações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;