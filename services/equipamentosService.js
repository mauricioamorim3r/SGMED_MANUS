// ============================================================================
// SERVICE PARA EQUIPAMENTOS - SGM
// ============================================================================

const Equipamento = require('../models/equipamentos');
const { Op } = require('sequelize');

class EquipamentosService {
  /**
   * Lista equipamentos com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { status, tipo, fabricante, search, page = 1, limit = 100 } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (status) {
        where.status_atual = status;
      }
      
      if (tipo) {
        where.tipo_equipamento = tipo;
      }
      
      if (fabricante) {
        where.fabricante = {
          [Op.iLike]: `%${fabricante}%`
        };
      }
      
      if (search) {
        where[Op.or] = [
          { nome_equipamento: { [Op.iLike]: `%${search}%` } },
          { numero_serie: { [Op.iLike]: `%${search}%` } },
          { tag_equipamento: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Equipamento.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome_equipamento', 'ASC']]
      });
      
      return {
        success: true,
        data: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem de equipamentos:', error);
      throw new Error('Erro ao listar equipamentos');
    }
  }
  
  /**
   * Busca equipamento por ID
   */
  async buscarPorId(id) {
    try {
      const equipamento = await Equipamento.findByPk(id);
      
      if (!equipamento) {
        return {
          success: false,
          error: 'Equipamento não encontrado'
        };
      }
      
      return {
        success: true,
        data: equipamento
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca de equipamento:', error);
      throw new Error('Erro ao buscar equipamento');
    }
  }
  
  /**
   * Busca equipamento por número de série
   */
  async buscarPorNumeroSerie(numeroSerie) {
    try {
      const equipamento = await Equipamento.findOne({
        where: { numero_serie: numeroSerie }
      });
      
      return {
        success: true,
        data: equipamento
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca por número de série:', error);
      throw new Error('Erro ao buscar equipamento por número de série');
    }
  }
  
  /**
   * Cria novo equipamento
   */
  async criar(dadosEquipamento) {
    try {
      // Validar dados obrigatórios
      const { numero_serie, tag_equipamento, nome_equipamento } = dadosEquipamento;
      
      if (!numero_serie || !tag_equipamento || !nome_equipamento) {
        return {
          success: false,
          error: 'Dados obrigatórios faltando',
          message: 'Número de série, tag e nome do equipamento são obrigatórios'
        };
      }
      
      // Verificar se número de série já existe
      const existeNumeroSerie = await Equipamento.findOne({
        where: { numero_serie }
      });
      
      if (existeNumeroSerie) {
        return {
          success: false,
          error: 'Número de série já existe',
          message: `Equipamento com número de série ${numero_serie} já está cadastrado`
        };
      }
      
      // Verificar se tag já existe
      const existeTag = await Equipamento.findOne({
        where: { tag_equipamento }
      });
      
      if (existeTag) {
        return {
          success: false,
          error: 'Tag já existe',
          message: `Equipamento com tag ${tag_equipamento} já está cadastrado`
        };
      }
      
      // Criar equipamento
      const novoEquipamento = await Equipamento.create(dadosEquipamento);
      
      return {
        success: true,
        data: novoEquipamento,
        message: 'Equipamento criado com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de criação de equipamento:', error);
      throw new Error('Erro ao criar equipamento');
    }
  }
  
  /**
   * Atualiza equipamento existente
   */
  async atualizar(id, dadosAtualizacao) {
    try {
      const equipamento = await Equipamento.findByPk(id);
      
      if (!equipamento) {
        return {
          success: false,
          error: 'Equipamento não encontrado'
        };
      }
      
      // Verificar conflitos de número de série (se foi alterado)
      if (dadosAtualizacao.numero_serie && dadosAtualizacao.numero_serie !== equipamento.numero_serie) {
        const existeNumeroSerie = await Equipamento.findOne({
          where: { 
            numero_serie: dadosAtualizacao.numero_serie,
            id: { [Op.ne]: id }
          }
        });
        
        if (existeNumeroSerie) {
          return {
            success: false,
            error: 'Número de série já existe'
          };
        }
      }
      
      // Verificar conflitos de tag (se foi alterada)
      if (dadosAtualizacao.tag_equipamento && dadosAtualizacao.tag_equipamento !== equipamento.tag_equipamento) {
        const existeTag = await Equipamento.findOne({
          where: { 
            tag_equipamento: dadosAtualizacao.tag_equipamento,
            id: { [Op.ne]: id }
          }
        });
        
        if (existeTag) {
          return {
            success: false,
            error: 'Tag já existe'
          };
        }
      }
      
      // Atualizar equipamento
      const equipamentoAtualizado = await equipamento.update(dadosAtualizacao);
      
      return {
        success: true,
        data: equipamentoAtualizado,
        message: 'Equipamento atualizado com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de atualização de equipamento:', error);
      throw new Error('Erro ao atualizar equipamento');
    }
  }
  
  /**
   * Remove equipamento
   */
  async remover(id) {
    try {
      const equipamento = await Equipamento.findByPk(id);
      
      if (!equipamento) {
        return {
          success: false,
          error: 'Equipamento não encontrado'
        };
      }
      
      // TODO: Verificar se equipamento está sendo usado em pontos de medição
      // antes de permitir exclusão
      
      await equipamento.destroy();
      
      return {
        success: true,
        data: equipamento,
        message: 'Equipamento removido com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de remoção de equipamento:', error);
      throw new Error('Erro ao remover equipamento');
    }
  }
  
  /**
   * Lista equipamentos por tipo
   */
  async listarPorTipo(tipo) {
    try {
      const equipamentos = await Equipamento.findByTipo(tipo);
      
      return {
        success: true,
        data: equipamentos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por tipo:', error);
      throw new Error('Erro ao listar equipamentos por tipo');
    }
  }
  
  /**
   * Lista equipamentos por status
   */
  async listarPorStatus(status) {
    try {
      const equipamentos = await Equipamento.findByStatus(status);
      
      return {
        success: true,
        data: equipamentos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por status:', error);
      throw new Error('Erro ao listar equipamentos por status');
    }
  }
  
  /**
   * Lista equipamentos por fabricante
   */
  async listarPorFabricante(fabricante) {
    try {
      const equipamentos = await Equipamento.findByFabricante(fabricante);
      
      return {
        success: true,
        data: equipamentos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por fabricante:', error);
      throw new Error('Erro ao listar equipamentos por fabricante');
    }
  }
  
  /**
   * Lista equipamentos com calibração vencida
   */
  async listarVencidos() {
    try {
      // Esta funcionalidade seria implementada quando tivermos
      // o relacionamento com certificados/calibrações
      const equipamentos = await Equipamento.findAll({
        where: {
          status_atual: {
            [Op.in]: ['Instalado', 'Estoque']
          }
        }
      });
      
      // TODO: Implementar lógica de vencimento baseada em certificados
      const equipamentosVencidos = equipamentos.filter(eq => eq.isVencido());
      
      return {
        success: true,
        data: equipamentosVencidos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem de vencidos:', error);
      throw new Error('Erro ao listar equipamentos vencidos');
    }
  }
  
  /**
   * Gera relatório de equipamentos
   */
  async gerarRelatorio(filtros = {}) {
    try {
      const equipamentos = await this.listar(filtros);
      
      if (!equipamentos.success) {
        return equipamentos;
      }
      
      // Agrupar por status
      const porStatus = {};
      equipamentos.data.forEach(eq => {
        const status = eq.status_atual;
        if (!porStatus[status]) {
          porStatus[status] = 0;
        }
        porStatus[status]++;
      });
      
      // Agrupar por tipo
      const porTipo = {};
      equipamentos.data.forEach(eq => {
        const tipo = eq.tipo_equipamento;
        if (!porTipo[tipo]) {
          porTipo[tipo] = 0;
        }
        porTipo[tipo]++;
      });
      
      // Agrupar por fabricante
      const porFabricante = {};
      equipamentos.data.forEach(eq => {
        const fabricante = eq.fabricante || 'Não informado';
        if (!porFabricante[fabricante]) {
          porFabricante[fabricante] = 0;
        }
        porFabricante[fabricante]++;
      });
      
      return {
        success: true,
        data: {
          total: equipamentos.total,
          resumo: {
            porStatus,
            porTipo,
            porFabricante
          },
          equipamentos: equipamentos.data
        }
      };
      
    } catch (error) {
      console.error('Erro no serviço de relatório:', error);
      throw new Error('Erro ao gerar relatório de equipamentos');
    }
  }
  
  /**
   * Importa equipamentos em lote
   */
  async importarLote(dadosEquipamentos) {
    try {
      const equipamentosImportados = [];
      const erros = [];
      
      for (let i = 0; i < dadosEquipamentos.length; i++) {
        const equipamento = dadosEquipamentos[i];
        
        try {
          const resultado = await this.criar(equipamento);
          
          if (resultado.success) {
            equipamentosImportados.push(resultado.data);
          } else {
            erros.push(`Linha ${i + 1}: ${resultado.message || resultado.error}`);
          }
          
        } catch (error) {
          erros.push(`Linha ${i + 1}: ${error.message}`);
        }
      }
      
      return {
        success: true,
        data: {
          importados: equipamentosImportados.length,
          erros: erros.length,
          detalhes_erros: erros,
          equipamentos: equipamentosImportados
        },
        message: `${equipamentosImportados.length} equipamentos importados com sucesso`
      };
      
    } catch (error) {
      console.error('Erro no serviço de importação:', error);
      throw new Error('Erro ao importar equipamentos');
    }
  }
}

module.exports = new EquipamentosService();