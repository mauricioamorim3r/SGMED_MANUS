// ============================================================================
// SERVICE PARA ESTOQUE - SGM
// ============================================================================

const Estoque = require('../models/estoque');
const { Op } = require('sequelize');

class EstoqueService {
  /**
   * Lista itens de estoque com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        categoria, status, baixo_estoque, search, page = 1, limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (categoria) {
        where.categoria = categoria;
      }
      
      if (status && status !== 'all') {
        where.status_item = status;
      }
      
      if (baixo_estoque === 'true') {
        where[Op.and] = [
          { quantidade_atual: { [Op.lte]: { [Op.col]: 'estoque_minimo' } } },
          { estoque_minimo: { [Op.gt]: 0 } }
        ];
      }
      
      if (search) {
        where[Op.or] = [
          { codigo_item: { [Op.like]: `%${search}%` } },
          { descricao: { [Op.like]: `%${search}%` } },
          { fabricante: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const resultado = await Estoque.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['codigo_item', 'ASC']]
      });
      
      return {
        dados: resultado.rows,
        total: resultado.count,
        pagina: parseInt(page),
        totalPaginas: Math.ceil(resultado.count / limit)
      };
      
    } catch (error) {
      console.error('Erro no service ao listar estoque:', error);
      throw new Error('Erro ao buscar itens de estoque');
    }
  }
  
  /**
   * Busca item de estoque por ID
   */
  async buscarPorId(id) {
    try {
      const item = await Estoque.findByPk(id);
      
      if (!item) {
        throw new Error('Item de estoque não encontrado');
      }
      
      return item;
      
    } catch (error) {
      console.error('Erro no service ao buscar item de estoque:', error);
      throw error;
    }
  }
  
  /**
   * Busca item de estoque por código
   */
  async buscarPorCodigo(codigo_item) {
    try {
      const item = await Estoque.findOne({
        where: { codigo_item }
      });
      
      return item;
      
    } catch (error) {
      console.error('Erro no service ao buscar item por código:', error);
      throw error;
    }
  }
  
  /**
   * Cria novo item de estoque
   */
  async criar(dados) {
    try {
      // Validações
      this.validarDados(dados);
      
      // Verificar se código já existe
      const itemExistente = await this.buscarPorCodigo(dados.codigo_item);
      if (itemExistente) {
        throw new Error(`Código ${dados.codigo_item} já está em uso`);
      }
      
      // Calcular valor total do estoque
      const dadosCompletos = this.calcularValorTotal(dados);
      
      const novoItem = await Estoque.create(dadosCompletos);
      
      return novoItem;
      
    } catch (error) {
      console.error('Erro no service ao criar item de estoque:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza item de estoque existente
   */
  async atualizar(id, dados) {
    try {
      const item = await this.buscarPorId(id);
      
      // Recalcular valor total se quantidade ou valor unitário foi alterado
      const dadosAtualizados = this.calcularValorTotal({
        ...item.dataValues,
        ...dados
      });
      
      await item.update(dadosAtualizados);
      
      return item;
      
    } catch (error) {
      console.error('Erro no service ao atualizar item de estoque:', error);
      throw error;
    }
  }
  
  /**
   * Remove item de estoque
   */
  async remover(id) {
    try {
      const item = await this.buscarPorId(id);
      
      await item.destroy();
      
      return { message: 'Item de estoque removido com sucesso' };
      
    } catch (error) {
      console.error('Erro no service ao remover item de estoque:', error);
      throw error;
    }
  }
  
  /**
   * Lista itens com estoque baixo
   */
  async listarBaixoEstoque() {
    try {
      const itensBaixoEstoque = await Estoque.findAll({
        where: {
          [Op.and]: [
            { quantidade_atual: { [Op.lte]: { [Op.col]: 'estoque_minimo' } } },
            { estoque_minimo: { [Op.gt]: 0 } }
          ]
        },
        order: [['quantidade_atual', 'ASC']]
      });
      
      return itensBaixoEstoque;
      
    } catch (error) {
      console.error('Erro ao buscar itens com estoque baixo:', error);
      throw error;
    }
  }
  
  /**
   * Lista itens vencidos ou próximos ao vencimento
   */
  async listarVencidos(dias_alerta = 30) {
    try {
      const hoje = new Date();
      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() + parseInt(dias_alerta));
      
      const itensVencidos = await Estoque.findAll({
        where: {
          data_validade: {
            [Op.and]: [
              { [Op.ne]: null },
              { [Op.lte]: dataLimite }
            ]
          }
        },
        order: [['data_validade', 'ASC']]
      });
      
      return {
        itens: itensVencidos,
        dias_alerta: parseInt(dias_alerta),
        total: itensVencidos.length
      };
      
    } catch (error) {
      console.error('Erro ao buscar itens vencidos:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório de estoque valorizado
   */
  async gerarRelatorioValorizado(categoria = null) {
    try {
      const where = {};
      
      if (categoria) {
        where.categoria = categoria;
      }
      
      const itensRelatorio = await Estoque.findAll({
        where,
        order: [['categoria', 'ASC'], ['codigo_item', 'ASC']]
      });
      
      // Calcular valor total geral
      const valorTotalGeral = itensRelatorio.reduce((total, item) => {
        return total + (parseFloat(item.valor_total_estoque) || 0);
      }, 0);
      
      // Resumo por categoria
      const resumoPorCategoria = {};
      itensRelatorio.forEach(item => {
        if (!resumoPorCategoria[item.categoria]) {
          resumoPorCategoria[item.categoria] = {
            categoria: item.categoria,
            quantidade_itens: 0,
            valor_total: 0
          };
        }
        resumoPorCategoria[item.categoria].quantidade_itens++;
        resumoPorCategoria[item.categoria].valor_total += (parseFloat(item.valor_total_estoque) || 0);
      });
      
      return {
        itens: itensRelatorio,
        valor_total_geral: parseFloat(valorTotalGeral.toFixed(2)),
        resumo_por_categoria: Object.values(resumoPorCategoria),
        data_relatorio: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao gerar relatório valorizado:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza quantidade em estoque (para movimentações)
   */
  async atualizarQuantidade(codigo_item, quantidade, tipo_operacao = 'entrada') {
    try {
      const item = await this.buscarPorCodigo(codigo_item);
      
      if (!item) {
        throw new Error(`Item com código ${codigo_item} não encontrado`);
      }
      
      let novaQuantidade;
      
      switch (tipo_operacao) {
        case 'entrada':
        case 'ajuste_positivo':
        case 'devolucao':
        case 'retorno_emprestimo':
          novaQuantidade = parseFloat(item.quantidade_atual) + parseFloat(quantidade);
          break;
        case 'saida':
        case 'ajuste_negativo':
        case 'emprestimo':
        case 'consumo':
        case 'perda':
        case 'descarte':
          novaQuantidade = parseFloat(item.quantidade_atual) - parseFloat(quantidade);
          break;
        default:
          throw new Error('Tipo de operação inválido');
      }
      
      // Não permitir quantidade negativa
      if (novaQuantidade < 0) {
        throw new Error('Quantidade em estoque não pode ser negativa');
      }
      
      // Atualizar item
      const valorTotal = novaQuantidade * parseFloat(item.valor_unitario || 0);
      
      await item.update({
        quantidade_atual: novaQuantidade,
        valor_total_estoque: valorTotal
      });
      
      return item;
      
    } catch (error) {
      console.error('Erro ao atualizar quantidade em estoque:', error);
      throw error;
    }
  }
  
  /**
   * Importa itens de estoque em lote
   */
  async importarLote(dados) {
    try {
      if (!Array.isArray(dados)) {
        throw new Error('Dados devem ser um array');
      }
      
      const itensImportados = [];
      const erros = [];
      
      for (let i = 0; i < dados.length; i++) {
        const item = dados[i];
        
        try {
          // Validar dados obrigatórios
          if (!item.codigo_item || !item.descricao || !item.categoria) {
            erros.push(`Linha ${i + 1}: Código, descrição e categoria são obrigatórios`);
            continue;
          }
          
          // Verificar se código já existe
          const itemExistente = await this.buscarPorCodigo(item.codigo_item);
          if (itemExistente) {
            erros.push(`Linha ${i + 1}: Código ${item.codigo_item} já existe`);
            continue;
          }
          
          // Calcular valor total
          const dadosCompletos = this.calcularValorTotal(item);
          
          const novoItem = await Estoque.create(dadosCompletos);
          itensImportados.push(novoItem);
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        importados: itensImportados.length,
        erros: erros.length,
        detalhes_erros: erros,
        dados: itensImportados
      };
      
    } catch (error) {
      console.error('Erro ao importar itens de estoque:', error);
      throw error;
    }
  }
  
  /**
   * Gera relatório de movimentação por período
   */
  async gerarRelatorioMovimentacao(data_inicio, data_fim) {
    try {
      // Esta função precisaria integração com MovimentacaoEstoque
      // Por ora, retorna dados simulados baseados no estoque atual
      
      const itens = await Estoque.findAll({
        order: [['categoria', 'ASC'], ['codigo_item', 'ASC']]
      });
      
      return {
        periodo: {
          data_inicio,
          data_fim
        },
        total_itens: itens.length,
        itens_baixo_estoque: itens.filter(item => 
          item.quantidade_atual <= item.estoque_minimo && item.estoque_minimo > 0
        ).length,
        valor_total_estoque: itens.reduce((total, item) => 
          total + (parseFloat(item.valor_total_estoque) || 0), 0
        ),
        data_relatorio: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Erro ao gerar relatório de movimentação:', error);
      throw error;
    }
  }
  
  // Métodos auxiliares privados
  
  /**
   * Valida dados obrigatórios
   */
  validarDados(dados) {
    if (!dados.codigo_item || !dados.descricao || !dados.categoria) {
      throw new Error('Código, descrição e categoria são obrigatórios');
    }
  }
  
  /**
   * Calcula valor total do estoque
   */
  calcularValorTotal(dados) {
    const quantidade = parseFloat(dados.quantidade_atual) || 0;
    const valorUnitario = parseFloat(dados.valor_unitario) || 0;
    
    return {
      ...dados,
      valor_total_estoque: quantidade * valorUnitario
    };
  }
  
  /**
   * Lista categorias disponíveis
   */
  async listarCategorias() {
    return [
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
  }
  
  /**
   * Lista unidades de medida disponíveis
   */
  async listarUnidades() {
    return [
      'UN', 'PC', 'M', 'CM', 'MM', 'KG', 'G', 'L', 'ML', 
      'M²', 'M³', 'SET', 'KIT', 'PAR', 'CX', 'Outros'
    ];
  }
  
  /**
   * Lista status disponíveis para itens
   */
  async listarStatus() {
    return [
      'Ativo', 'Inativo', 'Em Uso', 'Disponível', 'Reservado',
      'Manutenção', 'Calibração', 'Vencido', 'Descartado', 'Aguardando Recebimento'
    ];
  }
}

module.exports = new EstoqueService();