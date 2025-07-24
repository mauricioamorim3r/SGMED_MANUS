// ============================================================================
// SERVICE PARA POLOS - SGM
// ============================================================================

const Polo = require('../models/polos');
const { Op } = require('sequelize');

class PolosService {
  /**
   * Lista polos com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { status, search, page = 1, limit = 100 } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (status && status !== 'all') {
        where.status_polo = status;
      }
      
      if (search) {
        where[Op.or] = [
          { nome_polo: { [Op.iLike]: `%${search}%` } },
          { codigo_polo: { [Op.iLike]: `%${search}%` } },
          { localizacao: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Polo.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome_polo', 'ASC']]
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
      console.error('Erro no serviço de listagem de polos:', error);
      throw new Error('Erro ao listar polos');
    }
  }
  
  /**
   * Busca polo por ID
   */
  async buscarPorId(id) {
    try {
      const polo = await Polo.findByPk(id);
      
      if (!polo) {
        return {
          success: false,
          error: 'Polo não encontrado'
        };
      }
      
      return {
        success: true,
        data: polo
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca de polo:', error);
      throw new Error('Erro ao buscar polo');
    }
  }
  
  /**
   * Busca polo por código
   */
  async buscarPorCodigo(codigo) {
    try {
      const polo = await Polo.findByCodigo(codigo);
      
      return {
        success: true,
        data: polo
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca por código:', error);
      throw new Error('Erro ao buscar polo por código');
    }
  }
  
  /**
   * Cria novo polo
   */
  async criar(dadosPolo) {
    try {
      // Validar dados obrigatórios
      const { nome_polo, codigo_polo } = dadosPolo;
      
      if (!nome_polo || !codigo_polo) {
        return {
          success: false,
          error: 'Dados obrigatórios faltando',
          message: 'Nome e código do polo são obrigatórios'
        };
      }
      
      // Verificar se código já existe
      const existeCodigo = await Polo.findOne({
        where: { codigo_polo }
      });
      
      if (existeCodigo) {
        return {
          success: false,
          error: 'Código já existe',
          message: `Polo com código ${codigo_polo} já está cadastrado`
        };
      }
      
      // Criar polo
      const novoPolo = await Polo.create(dadosPolo);
      
      return {
        success: true,
        data: novoPolo,
        message: 'Polo criado com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de criação de polo:', error);
      throw new Error('Erro ao criar polo');
    }
  }
  
  /**
   * Atualiza polo existente
   */
  async atualizar(id, dadosAtualizacao) {
    try {
      const polo = await Polo.findByPk(id);
      
      if (!polo) {
        return {
          success: false,
          error: 'Polo não encontrado'
        };
      }
      
      // Verificar conflitos de código (se foi alterado)
      if (dadosAtualizacao.codigo_polo && dadosAtualizacao.codigo_polo !== polo.codigo_polo) {
        const existeCodigo = await Polo.findOne({
          where: { 
            codigo_polo: dadosAtualizacao.codigo_polo,
            id: { [Op.ne]: id }
          }
        });
        
        if (existeCodigo) {
          return {
            success: false,
            error: 'Código já existe',
            message: `Polo com código ${dadosAtualizacao.codigo_polo} já está cadastrado`
          };
        }
      }
      
      // Atualizar polo
      const poloAtualizado = await polo.update(dadosAtualizacao);
      
      return {
        success: true,
        data: poloAtualizado,
        message: 'Polo atualizado com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de atualização de polo:', error);
      throw new Error('Erro ao atualizar polo');
    }
  }
  
  /**
   * Remove polo
   */
  async remover(id) {
    try {
      const polo = await Polo.findByPk(id);
      
      if (!polo) {
        return {
          success: false,
          error: 'Polo não encontrado'
        };
      }
      
      // TODO: Verificar se polo possui instalações antes de permitir exclusão
      // const temInstalacoes = await polo.getTotalInstalacoes();
      // if (temInstalacoes > 0) {
      //   return {
      //     success: false,
      //     error: 'Polo possui instalações',
      //     message: 'Não é possível excluir polo que possui instalações cadastradas'
      //   };
      // }
      
      await polo.destroy();
      
      return {
        success: true,
        data: polo,
        message: 'Polo removido com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de remoção de polo:', error);
      throw new Error('Erro ao remover polo');
    }
  }
  
  /**
   * Lista polos por status
   */
  async listarPorStatus(status) {
    try {
      const polos = await Polo.findByStatus(status);
      
      return {
        success: true,
        data: polos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por status:', error);
      throw new Error('Erro ao listar polos por status');
    }
  }
  
  /**
   * Lista apenas polos ativos
   */
  async listarAtivos() {
    try {
      const polos = await Polo.findAtivos();
      
      return {
        success: true,
        data: polos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem de ativos:', error);
      throw new Error('Erro ao listar polos ativos');
    }
  }
  
  /**
   * Gera relatório de polos
   */
  async gerarRelatorio(filtros = {}) {
    try {
      const polos = await this.listar(filtros);
      
      if (!polos.success) {
        return polos;
      }
      
      // Agrupar por status
      const porStatus = {};
      polos.data.forEach(polo => {
        const status = polo.status_polo;
        if (!porStatus[status]) {
          porStatus[status] = 0;
        }
        porStatus[status]++;
      });
      
      // Agrupar por localização (estado/região)
      const porLocalizacao = {};
      polos.data.forEach(polo => {
        const localizacao = polo.localizacao || 'Não informado';
        // Extrair estado/região da localização
        const estado = localizacao.split('-')[0]?.trim() || localizacao;
        if (!porLocalizacao[estado]) {
          porLocalizacao[estado] = 0;
        }
        porLocalizacao[estado]++;
      });
      
      return {
        success: true,
        data: {
          total: polos.total,
          resumo: {
            porStatus,
            porLocalizacao
          },
          polos: polos.data
        }
      };
      
    } catch (error) {
      console.error('Erro no serviço de relatório:', error);
      throw new Error('Erro ao gerar relatório de polos');
    }
  }
  
  /**
   * Importa polos em lote
   */
  async importarLote(dadosPolos) {
    try {
      const polosImportados = [];
      const erros = [];
      
      for (let i = 0; i < dadosPolos.length; i++) {
        const polo = dadosPolos[i];
        
        try {
          const resultado = await this.criar(polo);
          
          if (resultado.success) {
            polosImportados.push(resultado.data);
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
          importados: polosImportados.length,
          erros: erros.length,
          detalhes_erros: erros,
          polos: polosImportados
        },
        message: `${polosImportados.length} polos importados com sucesso`
      };
      
    } catch (error) {
      console.error('Erro no serviço de importação:', error);
      throw new Error('Erro ao importar polos');
    }
  }
  
  /**
   * Busca polos com suas instalações
   */
  async listarComInstalacoes() {
    try {
      // TODO: Implementar quando tiver relacionamento ativo
      const polos = await Polo.findAll({
        order: [['nome_polo', 'ASC']]
      });
      
      return {
        success: true,
        data: polos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem com instalações:', error);
      throw new Error('Erro ao listar polos com instalações');
    }
  }
  
  /**
   * Altera status do polo
   */
  async alterarStatus(id, novoStatus) {
    try {
      const statusValidos = ['Ativo', 'Inativo', 'Manutenção', 'Planejamento', 'Descomissionado'];
      
      if (!statusValidos.includes(novoStatus)) {
        return {
          success: false,
          error: 'Status inválido',
          message: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
        };
      }
      
      const resultado = await this.atualizar(id, { status_polo: novoStatus });
      
      if (resultado.success) {
        resultado.message = `Status do polo alterado para ${novoStatus}`;
      }
      
      return resultado;
      
    } catch (error) {
      console.error('Erro no serviço de alteração de status:', error);
      throw new Error('Erro ao alterar status do polo');
    }
  }
}

module.exports = new PolosService();