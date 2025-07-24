// ============================================================================
// SERVICE PARA CONTROLE DE MUDANÇAS (MOC) - SGM
// ============================================================================

const ControleMudanca = require('../models/controleMudancas');
const { Op } = require('sequelize');

class ControleMudancasService {
  /**
   * Lista solicitações de mudança com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        status, tipo_mudanca, prioridade, solicitante, data_inicio, data_fim,
        search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (status && status !== 'all') {
        where.status_mudanca = status;
      }
      
      if (tipo_mudanca) {
        where.tipo_mudanca = tipo_mudanca;
      }
      
      if (prioridade) {
        where.prioridade = prioridade;
      }
      
      if (solicitante) {
        where.solicitante = {
          [Op.like]: `%${solicitante}%`
        };
      }
      
      if (data_inicio) {
        where.data_solicitacao = {
          [Op.gte]: new Date(data_inicio)
        };
      }
      
      if (data_fim) {
        where.data_solicitacao = {
          ...where.data_solicitacao,
          [Op.lte]: new Date(data_fim)
        };
      }
      
      if (search) {
        where[Op.or] = [
          { numero_moc: { [Op.like]: `%${search}%` } },
          { titulo: { [Op.like]: `%${search}%` } },
          { descricao_mudanca: { [Op.like]: `%${search}%` } },
          { solicitante: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await ControleMudanca.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_solicitacao', 'DESC']]
      });
      
      return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(resultado.count / limit)
      };
      
    } catch (error) {
      console.error('Erro no service ao listar controle de mudanças:', error);
      throw new Error('Erro ao buscar controle de mudanças');
    }
  }
  
  /**
   * Busca solicitação de mudança por ID
   */
  async buscarPorId(id) {
    try {
      const mudanca = await ControleMudanca.findByPk(id);
      
      if (!mudanca) {
        throw new Error('Solicitação de mudança não encontrada');
      }
      
      return mudanca;
      
    } catch (error) {
      console.error('Erro no service ao buscar solicitação de mudança:', error);
      throw error;
    }
  }
  
  /**
   * Cria nova solicitação de mudança
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Gerar número MOC único
      const numeroMoc = await this.gerarNumeroMOC();
      
      const dadosCompletos = {
        ...dados,
        numero_moc: numeroMoc,
        status_mudanca: 'Solicitada',
        fase_atual: 'Análise Inicial',
        historico_aprovacoes: [],
        documentos_anexos: []
      };
      
      const novaMudanca = await ControleMudanca.create(dadosCompletos);
      
      return novaMudanca;
      
    } catch (error) {
      console.error('Erro no service ao criar solicitação de mudança:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza solicitação de mudança existente
   */
  async atualizar(id, dados) {
    try {
      const mudanca = await this.buscarPorId(id);
      
      await mudanca.update(dados);
      
      return mudanca;
      
    } catch (error) {
      console.error('Erro no service ao atualizar solicitação de mudança:', error);
      throw error;
    }
  }
  
  /**
   * Remove solicitação de mudança
   */
  async remover(id) {
    try {
      const mudanca = await this.buscarPorId(id);
      
      await mudanca.destroy();
      
      return { message: 'Solicitação de mudança removida com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover solicitação de mudança:', error);
      throw error;
    }
  }
  
  /**
   * Aprova uma solicitação de mudança
   */
  async aprovar(id, dadosAprovacao) {
    try {
      const { aprovador, comentarios } = dadosAprovacao;
      
      if (!aprovador) {
        throw new Error('Aprovador é obrigatório');
      }
      
      const mudanca = await this.buscarPorId(id);
      
      // Adicionar ao histórico de aprovações
      const aprovacao = {
        aprovador,
        data_aprovacao: new Date().toISOString(),
        acao: 'Aprovada',
        comentarios: comentarios || ''
      };
      
      const historicoAtual = mudanca.historico_aprovacoes || [];
      historicoAtual.push(aprovacao);
      
      await mudanca.update({
        historico_aprovacoes: historicoAtual,
        status_mudanca: 'Aprovada',
        fase_atual: 'Aprovada - Aguardando Implementação',
        data_aprovacao: new Date().toISOString(),
        aprovador_final: aprovador
      });
      
      return mudanca;
      
    } catch (error) {
      console.error('Erro no service ao aprovar mudança:', error);
      throw error;
    }
  }
  
  /**
   * Rejeita uma solicitação de mudança
   */
  async rejeitar(id, dadosRejeicao) {
    try {
      const { aprovador, motivo_rejeicao } = dadosRejeicao;
      
      if (!aprovador || !motivo_rejeicao) {
        throw new Error('Aprovador e motivo da rejeição são obrigatórios');
      }
      
      const mudanca = await this.buscarPorId(id);
      
      // Adicionar ao histórico de aprovações
      const rejeicao = {
        aprovador,
        data_aprovacao: new Date().toISOString(),
        acao: 'Rejeitada',
        comentarios: motivo_rejeicao
      };
      
      const historicoAtual = mudanca.historico_aprovacoes || [];
      historicoAtual.push(rejeicao);
      
      await mudanca.update({
        historico_aprovacoes: historicoAtual,
        status_mudanca: 'Rejeitada',
        fase_atual: 'Rejeitada',
        data_fechamento: new Date().toISOString()
      });
      
      return mudanca;
      
    } catch (error) {
      console.error('Erro no service ao rejeitar mudança:', error);
      throw error;
    }
  }
  
  /**
   * Marca mudança como implementada
   */
  async implementar(id, dadosImplementacao) {
    try {
      const { responsavel_implementacao, data_implementacao, comentarios } = dadosImplementacao;
      
      const mudanca = await this.buscarPorId(id);
      
      if (mudanca.status_mudanca !== 'Aprovada') {
        throw new Error('Mudança deve estar aprovada para ser implementada');
      }
      
      await mudanca.update({
        status_mudanca: 'Implementada',
        fase_atual: 'Implementada - Aguardando Verificação',
        data_implementacao: data_implementacao || new Date().toISOString(),
        responsavel_implementacao: responsavel_implementacao || '',
        comentarios_implementacao: comentarios || ''
      });
      
      return mudanca;
      
    } catch (error) {
      console.error('Erro no service ao marcar implementação:', error);
      throw error;
    }
  }
  
  /**
   * Gera dashboard com estatísticas das mudanças
   */
  async gerarDashboard(periodo = 'mes') {
    try {
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
      
      // Buscar todas as mudanças
      const todasMudancas = await ControleMudanca.findAll();
      
      // Mudanças do período
      const mudancasPeriodo = await ControleMudanca.findAll({
        where: {
          data_solicitacao: {
            [Op.gte]: dataLimite
          }
        }
      });
      
      // Estatísticas por status
      const estatisticasStatus = {};
      todasMudancas.forEach(m => {
        estatisticasStatus[m.status_mudanca] = (estatisticasStatus[m.status_mudanca] || 0) + 1;
      });
      
      // Estatísticas por prioridade
      const estatisticasPrioridade = {};
      todasMudancas.forEach(m => {
        estatisticasPrioridade[m.prioridade] = (estatisticasPrioridade[m.prioridade] || 0) + 1;
      });
      
      // Estatísticas por tipo
      const estatisticasTipo = {};
      todasMudancas.forEach(m => {
        estatisticasTipo[m.tipo_mudanca] = (estatisticasTipo[m.tipo_mudanca] || 0) + 1;
      });
      
      // Tempo médio de aprovação
      const mudancasAprovadas = todasMudancas.filter(m => m.data_aprovacao);
      let tempoMedioAprovacao = 0;
      
      if (mudancasAprovadas.length > 0) {
        const somaTempos = mudancasAprovadas.reduce((soma, m) => {
          const dataAprovacao = new Date(m.data_aprovacao);
          const dataSolicitacao = new Date(m.data_solicitacao);
          return soma + (dataAprovacao - dataSolicitacao);
        }, 0);
        
        tempoMedioAprovacao = Math.round(somaTempos / mudancasAprovadas.length / (1000 * 60 * 60 * 24)); // em dias
      }
      
      return {
        periodo,
        total_mudancas: todasMudancas.length,
        mudancas_periodo: mudancasPeriodo.length,
        tempo_medio_aprovacao_dias: tempoMedioAprovacao,
        estatisticas_status: estatisticasStatus,
        estatisticas_prioridade: estatisticasPrioridade,
        estatisticas_tipo: estatisticasTipo,
        mudancas_pendentes: todasMudancas.filter(m => 
          ['Solicitada', 'Em Análise', 'Aguardando Aprovação'].includes(m.status_mudanca)
        ).length,
        mudancas_implementadas_mes: mudancasPeriodo.filter(m => 
          m.status_mudanca === 'Implementada'
        ).length,
        data_relatorio: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao gerar dashboard:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.titulo || !dados.descricao_mudanca || !dados.tipo_mudanca || !dados.solicitante) {
      throw new Error('Título, descrição, tipo de mudança e solicitante são obrigatórios');
    }
  }
  
  /**
   * Gera número MOC único
   */
  async gerarNumeroMOC() {
    try {
      const count = await ControleMudanca.count();
      const proximoNumero = count + 1;
      const ano = new Date().getFullYear();
      return `MOC-${ano}-${proximoNumero.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número MOC:', error);
      throw error;
    }
  }
  
  /**
   * Lista tipos de mudança disponíveis
   */
  async listarTipos() {
    return [
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
  }
  
  /**
   * Lista categorias de mudança disponíveis
   */
  async listarCategorias() {
    return [
      'Técnica',
      'Operacional',
      'Segurança',
      'Ambiental',
      'Qualidade',
      'Regulatória',
      'Econômica',
      'Organizacional'
    ];
  }
  
  /**
   * Lista status disponíveis para mudanças
   */
  async listarStatus() {
    return [
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
  }
  
  /**
   * Lista prioridades disponíveis
   */
  async listarPrioridades() {
    return [
      'Baixa',
      'Média',
      'Alta',
      'Crítica',
      'Emergencial'
    ];
  }
}

module.exports = new ControleMudancasService();