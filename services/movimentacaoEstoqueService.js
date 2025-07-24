// ============================================================================
// SERVICE PARA MOVIMENTAÇÃO DE ESTOQUE - SGM
// ============================================================================

const MovimentacaoEstoque = require('../models/movimentacaoEstoque');
const EstoqueService = require('./estoqueService');
const { Op } = require('sequelize');

class MovimentacaoEstoqueService {
  /**
   * Lista movimentações de estoque com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        codigo_item, tipo_movimentacao, data_inicio, data_fim, responsavel,
        search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (codigo_item) {
        where.codigo_item = codigo_item;
      }
      
      if (tipo_movimentacao) {
        where.tipo_movimentacao = tipo_movimentacao;
      }
      
      if (responsavel) {
        where.responsavel = {
          [Op.like]: `%${responsavel}%`
        };
      }
      
      if (data_inicio) {
        where.data_movimentacao = {
          [Op.gte]: new Date(data_inicio)
        };
      }
      
      if (data_fim) {
        where.data_movimentacao = {
          ...where.data_movimentacao,
          [Op.lte]: new Date(data_fim)
        };
      }
      
      if (search) {
        where[Op.or] = [
          { codigo_item: { [Op.like]: `%${search}%` } },
          { descricao_item: { [Op.like]: `%${search}%` } },
          { responsavel: { [Op.like]: `%${search}%` } },
          { observacoes: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await MovimentacaoEstoque.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['data_movimentacao', 'DESC']]
      });
      
      return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(resultado.count / limit)
      };
      
    } catch (error) {
      console.error('Erro no service ao listar movimentações:', error);
      throw new Error('Erro ao buscar movimentações de estoque');
    }
  }
  
  /**
   * Busca movimentação por ID
   */
  async buscarPorId(id) {
    try {
      const movimentacao = await MovimentacaoEstoque.findByPk(id);
      
      if (!movimentacao) {
        throw new Error('Movimentação não encontrada');
      }
      
      return movimentacao;
      
    } catch (error) {
      console.error('Erro no service ao buscar movimentação:', error);
      throw error;
    }
  }
  
  /**
   * Cria nova movimentação de estoque
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Calcular valor total
      const dadosCompletos = this.calcularValorTotal(dados);
      
      // Criar movimentação
      const novaMovimentacao = await MovimentacaoEstoque.create(dadosCompletos);
      
      // Atualizar estoque correspondente
      await this.atualizarEstoque(dados);
      
      return novaMovimentacao;
      
    } catch (error) {
      console.error('Erro no service ao criar movimentação:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza movimentação existente
   */
  async atualizar(id, dados) {
    try {
      const movimentacao = await this.buscarPorId(id);
      
      // Reverter movimentação anterior no estoque
      await this.reverterMovimentacaoEstoque(movimentacao);
      
      // Recalcular valor total
      const dadosAtualizados = this.calcularValorTotal({
        ...movimentacao.dataValues,
        ...dados
      });
      
      await movimentacao.update(dadosAtualizados);
      
      // Aplicar nova movimentação no estoque
      await this.atualizarEstoque(dadosAtualizados);
      
      return movimentacao;
      
    } catch (error) {
      console.error('Erro no service ao atualizar movimentação:', error);
      throw error;
    }
  }
  
  /**
   * Remove movimentação
   */
  async remover(id) {
    try {
      const movimentacao = await this.buscarPorId(id);
      
      // Reverter movimentação no estoque
      await this.reverterMovimentacaoEstoque(movimentacao);
      
      await movimentacao.destroy();
      
      return { message: 'Movimentação removida com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover movimentação:', error);
      throw error;
    }
  }
  
  /**
   * Lista movimentações por item
   */
  async listarPorItem(codigo_item) {
    try {
      const movimentacoesItem = await MovimentacaoEstoque.findAll({
        where: { codigo_item },
        order: [['data_movimentacao', 'DESC']]
      });
      
      // Calcular saldo atual baseado nas movimentações
      let saldoAtual = 0;
      const movimentacoesComSaldo = [];
      
      // Processar em ordem cronológica para calcular saldo progressivo
      const movimentacoesOrdenadas = [...movimentacoesItem].reverse();
      
      movimentacoesOrdenadas.forEach(mov => {
        const quantidade = parseFloat(mov.quantidade);
        
        switch (mov.tipo_movimentacao) {
          case 'Entrada':
          case 'Ajuste Positivo':
          case 'Devolução':
          case 'Retorno Empréstimo':
            saldoAtual += quantidade;
            break;
          case 'Saída':
          case 'Ajuste Negativo':
          case 'Empréstimo':
          case 'Consumo':
          case 'Perda':
          case 'Descarte':
            saldoAtual -= quantidade;
            break;
        }
        
        movimentacoesComSaldo.push({
          ...mov.dataValues,
          saldo_apos_movimentacao: saldoAtual
        });
      });
      
      return {
        movimentacoes: movimentacoesComSaldo.reverse(),
        saldo_atual: saldoAtual,
        total_movimentacoes: movimentacoesItem.length
      };
      
    } catch (error) {
      console.error('Erro ao buscar histórico do item:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório de movimentações por período
   */
  async gerarRelatorioPeriodo(data_inicio, data_fim, tipo_movimentacao = null) {
    try {
      if (!data_inicio || !data_fim) {
        throw new Error('Período é obrigatório');
      }
      
      const where = {
        data_movimentacao: {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        }
      };
      
      if (tipo_movimentacao) {
        where.tipo_movimentacao = tipo_movimentacao;
      }
      
      const movimentacoesPeriodo = await MovimentacaoEstoque.findAll({
        where,
        order: [['data_movimentacao', 'DESC']]
      });
      
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
        resumoPorTipo[mov.tipo_movimentacao].valor_total += (parseFloat(mov.valor_total) || 0);
      });
      
      const valorTotalPeriodo = movimentacoesPeriodo.reduce((total, mov) => {
        return total + (parseFloat(mov.valor_total) || 0);
      }, 0);
      
      return {
        periodo: {
          data_inicio,
          data_fim
        },
        movimentacoes: movimentacoesPeriodo,
        resumo_por_tipo: Object.values(resumoPorTipo),
        valor_total_periodo: parseFloat(valorTotalPeriodo.toFixed(2)),
        total_movimentacoes: movimentacoesPeriodo.length,
        data_relatorio: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao gerar relatório de período:', error);
      throw error;
    }
  }
  
  /**
   * Processa entrada de lote de itens
   */
  async processarEntradaLote(itens, dados_comuns) {
    try {
      if (!Array.isArray(itens) || itens.length === 0) {
        throw new Error('Lista de itens é obrigatória');
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
          
          const dadosMovimentacao = {
            codigo_item: item.codigo_item,
            descricao_item: item.descricao_item || '',
            tipo_movimentacao: 'Entrada',
            quantidade: parseFloat(item.quantidade),
            unidade_medida: item.unidade_medida || 'UN',
            valor_unitario: parseFloat(item.valor_unitario) || 0,
            data_movimentacao: dados_comuns?.data_movimentacao || new Date().toISOString(),
            origem: dados_comuns?.origem || '',
            destino: dados_comuns?.destino || '',
            responsavel: dados_comuns?.responsavel || '',
            documento_referencia: dados_comuns?.documento_referencia || '',
            numero_nota_fiscal: dados_comuns?.numero_nota_fiscal || '',
            fornecedor_cliente: dados_comuns?.fornecedor_cliente || '',
            centro_custo: dados_comuns?.centro_custo || '',
            projeto: dados_comuns?.projeto || '',
            observacoes: item.observacoes || dados_comuns?.observacoes || ''
          };
          
          const novaMovimentacao = await this.criar(dadosMovimentacao);
          movimentacoesLote.push(novaMovimentacao);
          
        } catch (error) {
          erros.push(`Item ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        movimentacoes_criadas: movimentacoesLote.length,
        erros: erros.length,
        detalhes_erros: erros,
        movimentacoes: movimentacoesLote
      };
      
    } catch (error) {
      console.error('Erro ao processar entrada em lote:', error);
      throw error;
    }
  }
  
  /**
   * Importa movimentações em lote
   */
  async importarLote(dados) {
    try {
      if (!Array.isArray(dados)) {
        throw new Error('Dados devem ser um array');
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
          
          const novaMovimentacao = await this.criar(mov);
          movimentacoesImportadas.push(novaMovimentacao);
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        importadas: movimentacoesImportadas.length,
        erros: erros.length,
        detalhes_erros: erros,
        dados: movimentacoesImportadas
      };
      
    } catch (error) {
      console.error('Erro ao importar movimentações:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.codigo_item || !dados.tipo_movimentacao || !dados.quantidade || !dados.responsavel) {
      throw new Error('Código do item, tipo de movimentação, quantidade e responsável são obrigatórios');
    }
  }
  
  /**
   * Calcula valor total da movimentação
   */
  calcularValorTotal(dados) {
    const quantidade = parseFloat(dados.quantidade) || 0;
    const valorUnitario = parseFloat(dados.valor_unitario) || 0;
    
    return {
      ...dados,
      valor_total: quantidade * valorUnitario
    };
  }
  
  /**
   * Atualiza estoque baseado na movimentação
   */
  async atualizarEstoque(dados) {
    try {
      // Determinar se é entrada ou saída
      const tiposEntrada = ['Entrada', 'Ajuste Positivo', 'Devolução', 'Retorno Empréstimo'];
      const tipoOperacao = tiposEntrada.includes(dados.tipo_movimentacao) ? 'entrada' : 'saida';
      
      await EstoqueService.atualizarQuantidade(
        dados.codigo_item,
        dados.quantidade,
        tipoOperacao
      );
      
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }
  
  /**
   * Reverte movimentação no estoque
   */
  async reverterMovimentacaoEstoque(movimentacao) {
    try {
      // Inverter o tipo de operação para reverter
      const tiposEntrada = ['Entrada', 'Ajuste Positivo', 'Devolução', 'Retorno Empréstimo'];
      const tipoOperacaoReversa = tiposEntrada.includes(movimentacao.tipo_movimentacao) ? 'saida' : 'entrada';
      
      await EstoqueService.atualizarQuantidade(
        movimentacao.codigo_item,
        movimentacao.quantidade,
        tipoOperacaoReversa
      );
      
    } catch (error) {
      console.error('Erro ao reverter movimentação no estoque:', error);
      throw error;
    }
  }
  
  /**
   * Lista tipos de movimentação disponíveis
   */
  async listarTipos() {
    return [
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
  }
}

module.exports = new MovimentacaoEstoqueService();