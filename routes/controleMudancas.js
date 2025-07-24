// ============================================================================
// ROUTES PARA CONTROLE DE MUDANÇAS (MOC) - SGM
// ============================================================================

const express = require('express');
const router = express.Router();

// Simulação de dados - será substituído por conexão real com banco
let controleMudancas = [];

/**
 * GET /api/controle-mudancas
 * Lista todas as solicitações de mudança
 */
router.get('/', async (req, res) => {
  try {
    // Filtros opcionais
    const { status, tipo_mudanca, prioridade, solicitante, data_inicio, data_fim, search } = req.query;
    
    let filteredMudancas = [...controleMudancas];
    
    if (status && status !== 'all') {
      filteredMudancas = filteredMudancas.filter(mudanca => mudanca.status_mudanca === status);
    }
    
    if (tipo_mudanca) {
      filteredMudancas = filteredMudancas.filter(mudanca => mudanca.tipo_mudanca === tipo_mudanca);
    }
    
    if (prioridade) {
      filteredMudancas = filteredMudancas.filter(mudanca => mudanca.prioridade === prioridade);
    }
    
    if (solicitante) {
      filteredMudancas = filteredMudancas.filter(mudanca => 
        mudanca.solicitante.toLowerCase().includes(solicitante.toLowerCase())
      );
    }
    
    if (data_inicio) {
      filteredMudancas = filteredMudancas.filter(mudanca => 
        new Date(mudanca.data_solicitacao) >= new Date(data_inicio)
      );
    }
    
    if (data_fim) {
      filteredMudancas = filteredMudancas.filter(mudanca => 
        new Date(mudanca.data_solicitacao) <= new Date(data_fim)
      );
    }
    
    if (search) {
      filteredMudancas = filteredMudancas.filter(mudanca => 
        mudanca.numero_moc.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.titulo.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.descricao_mudanca.toLowerCase().includes(search.toLowerCase()) ||
        mudanca.solicitante.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Ordenar por data de solicitação mais recente
    filteredMudancas.sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao));
    
    res.json({
      success: true,
      data: filteredMudancas,
      total: filteredMudancas.length,
      message: 'Controle de mudanças carregado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao buscar controle de mudanças:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar controle de mudanças'
    });
  }
});

/**
 * GET /api/controle-mudancas/:id
 * Busca solicitação de mudança por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mudanca = controleMudancas.find(m => m.id === parseInt(id));
    
    if (!mudanca) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de mudança não encontrada',
        message: `Solicitação com ID ${id} não existe`
      });
    }
    
    res.json({
      success: true,
      data: mudanca,
      message: 'Solicitação de mudança encontrada'
    });
    
  } catch (error) {
    console.error('Erro ao buscar solicitação de mudança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/controle-mudancas
 * Cria nova solicitação de mudança
 */
router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      descricao_mudanca,
      tipo_mudanca,
      categoria_mudanca,
      justificativa,
      impacto_operacional,
      impacto_seguranca,
      impacto_ambiental,
      impacto_financeiro,
      prioridade,
      data_solicitacao,
      prazo_implementacao,
      solicitante,
      area_responsavel,
      equipamentos_afetados,
      procedimentos_afetados,
      treinamento_necessario,
      recursos_necessarios,
      aprovadores_necessarios,
      observacoes
    } = req.body;
    
    // Validações básicas
    if (!titulo || !descricao_mudanca || !tipo_mudanca || !solicitante) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando',
        message: 'Título, descrição, tipo de mudança e solicitante são obrigatórios'
      });
    }
    
    // Gerar número MOC único
    const proximoNumero = controleMudancas.length + 1;
    const ano = new Date().getFullYear();
    const numeroMoc = `MOC-${ano}-${proximoNumero.toString().padStart(3, '0')}`;
    
    const novaMudanca = {
      id: controleMudancas.length + 1,
      numero_moc: numeroMoc,
      titulo,
      descricao_mudanca,
      tipo_mudanca,
      categoria_mudanca: categoria_mudanca || 'Técnica',
      justificativa: justificativa || '',
      impacto_operacional: impacto_operacional || 'Baixo',
      impacto_seguranca: impacto_seguranca || 'Baixo',
      impacto_ambiental: impacto_ambiental || 'Baixo',
      impacto_financeiro: parseFloat(impacto_financeiro) || 0,
      prioridade: prioridade || 'Média',
      data_solicitacao: data_solicitacao || new Date().toISOString(),
      prazo_implementacao: prazo_implementacao || null,
      data_aprovacao: null,
      data_implementacao: null,
      data_fechamento: null,
      solicitante,
      area_responsavel: area_responsavel || '',
      aprovador_final: '',
      equipamentos_afetados: equipamentos_afetados || '',
      procedimentos_afetados: procedimentos_afetados || '',
      treinamento_necessario: treinamento_necessario || false,
      recursos_necessarios: recursos_necessarios || '',
      aprovadores_necessarios: aprovadores_necessarios || '',
      status_mudanca: 'Solicitada',
      fase_atual: 'Análise Inicial',
      historico_aprovacoes: [],
      documentos_anexos: [],
      observacoes: observacoes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    controleMudancas.push(novaMudanca);
    
    res.status(201).json({
      success: true,
      data: novaMudanca,
      message: 'Solicitação de mudança criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar solicitação de mudança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/controle-mudancas/:id
 * Atualiza solicitação de mudança existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mudancaIndex = controleMudancas.findIndex(m => m.id === parseInt(id));
    
    if (mudancaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de mudança não encontrada'
      });
    }
    
    const mudancaAtualizada = {
      ...controleMudancas[mudancaIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    controleMudancas[mudancaIndex] = mudancaAtualizada;
    
    res.json({
      success: true,
      data: mudancaAtualizada,
      message: 'Solicitação de mudança atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar solicitação de mudança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/controle-mudancas/:id
 * Remove solicitação de mudança
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mudancaIndex = controleMudancas.findIndex(m => m.id === parseInt(id));
    
    if (mudancaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de mudança não encontrada'
      });
    }
    
    const mudancaRemovida = controleMudancas[mudancaIndex];
    controleMudancas.splice(mudancaIndex, 1);
    
    res.json({
      success: true,
      data: mudancaRemovida,
      message: 'Solicitação de mudança removida com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao remover solicitação de mudança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/controle-mudancas/tipos/lista
 * Lista tipos de mudança disponíveis
 */
router.get('/tipos/lista', (req, res) => {
  const tipos = [
    'Modificação de Equipamento',
    'Alteração de Procedimento',
    'Mudança de Processo',
    'Substituição de Componente',
    'Upgrade de Sistema',
    'Alteração de Layout',
    'Mudança de Especificação',
    'Implementação de Melhoria',
    'Correção de Não Conformidade',
    'Adequação Regulatória',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: tipos,
    message: 'Tipos de mudança carregados'
  });
});

/**
 * GET /api/controle-mudancas/categorias/lista
 * Lista categorias de mudança disponíveis
 */
router.get('/categorias/lista', (req, res) => {
  const categorias = [
    'Técnica',
    'Operacional',
    'Segurança',
    'Ambiental',
    'Qualidade',
    'Regulatória',
    'Econômica',
    'Organizacional'
  ];
  
  res.json({
    success: true,
    data: categorias,
    message: 'Categorias de mudança carregadas'
  });
});

/**
 * GET /api/controle-mudancas/status/lista
 * Lista status disponíveis para mudanças
 */
router.get('/status/lista', (req, res) => {
  const status = [
    'Solicitada',
    'Em Análise',
    'Aguardando Aprovação',
    'Aprovada',
    'Rejeitada',
    'Em Implementação',
    'Implementada',
    'Em Verificação',
    'Concluída',
    'Cancelada'
  ];
  
  res.json({
    success: true,
    data: status,
    message: 'Status de mudanças carregados'
  });
});

/**
 * GET /api/controle-mudancas/prioridades/lista
 * Lista prioridades disponíveis
 */
router.get('/prioridades/lista', (req, res) => {
  const prioridades = [
    'Baixa',
    'Média',
    'Alta',
    'Crítica',
    'Emergencial'
  ];
  
  res.json({
    success: true,
    data: prioridades,
    message: 'Prioridades carregadas'
  });
});

/**
 * POST /api/controle-mudancas/:id/aprovar
 * Aprova uma solicitação de mudança
 */
router.post('/:id/aprovar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aprovador, comentarios } = req.body;
    
    const mudancaIndex = controleMudancas.findIndex(m => m.id === parseInt(id));
    
    if (mudancaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de mudança não encontrada'
      });
    }
    
    if (!aprovador) {
      return res.status(400).json({
        success: false,
        error: 'Aprovador é obrigatório'
      });
    }
    
    const mudanca = controleMudancas[mudancaIndex];
    
    // Adicionar ao histórico de aprovações
    const aprovacao = {
      aprovador,
      data_aprovacao: new Date().toISOString(),
      acao: 'Aprovada',
      comentarios: comentarios || ''
    };
    
    mudanca.historico_aprovacoes = mudanca.historico_aprovacoes || [];
    mudanca.historico_aprovacoes.push(aprovacao);
    
    // Atualizar status
    mudanca.status_mudanca = 'Aprovada';
    mudanca.fase_atual = 'Aprovada - Aguardando Implementação';
    mudanca.data_aprovacao = new Date().toISOString();
    mudanca.aprovador_final = aprovador;
    mudanca.updated_at = new Date().toISOString();
    
    controleMudancas[mudancaIndex] = mudanca;
    
    res.json({
      success: true,
      data: mudanca,
      message: 'Solicitação de mudança aprovada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao aprovar mudança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/controle-mudancas/:id/rejeitar
 * Rejeita uma solicitação de mudança
 */
router.post('/:id/rejeitar', async (req, res) => {
  try {
    const { id } = req.params;
    const { aprovador, motivo_rejeicao } = req.body;
    
    const mudancaIndex = controleMudancas.findIndex(m => m.id === parseInt(id));
    
    if (mudancaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de mudança não encontrada'
      });
    }
    
    if (!aprovador || !motivo_rejeicao) {
      return res.status(400).json({
        success: false,
        error: 'Aprovador e motivo da rejeição são obrigatórios'
      });
    }
    
    const mudanca = controleMudancas[mudancaIndex];
    
    // Adicionar ao histórico de aprovações
    const rejeicao = {
      aprovador,
      data_aprovacao: new Date().toISOString(),
      acao: 'Rejeitada',
      comentarios: motivo_rejeicao
    };
    
    mudanca.historico_aprovacoes = mudanca.historico_aprovacoes || [];
    mudanca.historico_aprovacoes.push(rejeicao);
    
    // Atualizar status
    mudanca.status_mudanca = 'Rejeitada';
    mudanca.fase_atual = 'Rejeitada';
    mudanca.data_fechamento = new Date().toISOString();
    mudanca.updated_at = new Date().toISOString();
    
    controleMudancas[mudancaIndex] = mudanca;
    
    res.json({
      success: true,
      data: mudanca,
      message: 'Solicitação de mudança rejeitada'
    });
    
  } catch (error) {
    console.error('Erro ao rejeitar mudança:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * POST /api/controle-mudancas/:id/implementar
 * Marca mudança como implementada
 */
router.post('/:id/implementar', async (req, res) => {
  try {
    const { id } = req.params;
    const { responsavel_implementacao, data_implementacao, comentarios } = req.body;
    
    const mudancaIndex = controleMudancas.findIndex(m => m.id === parseInt(id));
    
    if (mudancaIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação de mudança não encontrada'
      });
    }
    
    const mudanca = controleMudancas[mudancaIndex];
    
    if (mudanca.status_mudanca !== 'Aprovada') {
      return res.status(400).json({
        success: false,
        error: 'Mudança deve estar aprovada para ser implementada'
      });
    }
    
    // Atualizar status
    mudanca.status_mudanca = 'Implementada';
    mudanca.fase_atual = 'Implementada - Aguardando Verificação';
    mudanca.data_implementacao = data_implementacao || new Date().toISOString();
    mudanca.responsavel_implementacao = responsavel_implementacao || '';
    mudanca.comentarios_implementacao = comentarios || '';
    mudanca.updated_at = new Date().toISOString();
    
    controleMudancas[mudancaIndex] = mudanca;
    
    res.json({
      success: true,
      data: mudanca,
      message: 'Mudança marcada como implementada'
    });
    
  } catch (error) {
    console.error('Erro ao marcar implementação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/controle-mudancas/relatorio/dashboard
 * Dashboard com estatísticas das mudanças
 */
router.get('/relatorio/dashboard', async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
    
    // Calcular data limite baseada no período
    const hoje = new Date();
    let dataLimite = new Date();
    
    switch (periodo) {
      case 'semana':
        dataLimite.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        dataLimite.setMonth(hoje.getMonth() - 1);
        break;
      case 'trimestre':
        dataLimite.setMonth(hoje.getMonth() - 3);
        break;
      case 'ano':
        dataLimite.setFullYear(hoje.getFullYear() - 1);
        break;
      default:
        dataLimite.setMonth(hoje.getMonth() - 1);
    }
    
    const mudancasPeriodo = controleMudancas.filter(m => 
      new Date(m.data_solicitacao) >= dataLimite
    );
    
    // Estatísticas por status
    const estatisticasStatus = {};
    controleMudancas.forEach(m => {
      estatisticasStatus[m.status_mudanca] = (estatisticasStatus[m.status_mudanca] || 0) + 1;
    });
    
    // Estatísticas por prioridade
    const estatisticasPrioridade = {};
    controleMudancas.forEach(m => {
      estatisticasPrioridade[m.prioridade] = (estatisticasPrioridade[m.prioridade] || 0) + 1;
    });
    
    // Estatísticas por tipo
    const estatisticasTipo = {};
    controleMudancas.forEach(m => {
      estatisticasTipo[m.tipo_mudanca] = (estatisticasTipo[m.tipo_mudanca] || 0) + 1;
    });
    
    // Tempo médio de aprovação
    const mudancasAprovadas = controleMudancas.filter(m => m.data_aprovacao);
    let tempoMedioAprovacao = 0;
    
    if (mudancasAprovadas.length > 0) {
      const somaTempos = mudancasAprovadas.reduce((soma, m) => {
        const dataAprovacao = new Date(m.data_aprovacao);
        const dataSolicitacao = new Date(m.data_solicitacao);
        return soma + (dataAprovacao - dataSolicitacao);
      }, 0);
      
      tempoMedioAprovacao = Math.round(somaTempos / mudancasAprovadas.length / (1000 * 60 * 60 * 24)); // em dias
    }
    
    res.json({
      success: true,
      data: {
        periodo,
        total_mudancas: controleMudancas.length,
        mudancas_periodo: mudancasPeriodo.length,
        tempo_medio_aprovacao_dias: tempoMedioAprovacao,
        estatisticas_status: estatisticasStatus,
        estatisticas_prioridade: estatisticasPrioridade,
        estatisticas_tipo: estatisticasTipo,
        mudancas_pendentes: controleMudancas.filter(m => 
          ['Solicitada', 'Em Análise', 'Aguardando Aprovação'].includes(m.status_mudanca)
        ).length,
        mudancas_implementadas_mes: mudancasPeriodo.filter(m => 
          m.status_mudanca === 'Implementada'
        ).length,
        data_relatorio: new Date().toISOString()
      },
      message: 'Dashboard de controle de mudanças gerado'
    });
    
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;