// ============================================================================
// SERVICE PARA INSTALAÇÕES - SGM
// ============================================================================

const Instalacao = require('../models/instalacoes');
const { Op } = require('sequelize');

class InstalacoesService {
  /**
   * Lista instalações com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { polo_id, status, tipo, search, page = 1, limit = 100 } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (polo_id) {
        where.polo_id = polo_id;
      }
      
      if (status && status !== 'all') {
        where.status_instalacao = status;
      }
      
      if (tipo) {
        where.tipo_instalacao = tipo;
      }
      
      if (search) {
        where[Op.or] = [
          { nome_instalacao: { [Op.iLike]: `%${search}%` } },
          { codigo_instalacao: { [Op.iLike]: `%${search}%` } },
          { localizacao: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await Instalacao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nome_instalacao', 'ASC']]
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
      console.error('Erro no serviço de listagem de instalações:', error);
      throw new Error('Erro ao listar instalações');
    }
  }
  
  /**
   * Busca instalação por ID
   */
  async buscarPorId(id) {
    try {
      const instalacao = await Instalacao.findByPk(id);
      
      if (!instalacao) {
        return {
          success: false,
          error: 'Instalação não encontrada'
        };
      }
      
      return {
        success: true,
        data: instalacao
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca de instalação:', error);
      throw new Error('Erro ao buscar instalação');
    }
  }
  
  /**
   * Busca instalação por código
   */
  async buscarPorCodigo(codigo) {
    try {
      const instalacao = await Instalacao.findByCodigo(codigo);
      
      return {
        success: true,
        data: instalacao
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca por código:', error);
      throw new Error('Erro ao buscar instalação por código');
    }
  }
  
  /**
   * Cria nova instalação
   */
  async criar(dadosInstalacao) {
    try {
      // Validar dados obrigatórios
      const { nome_instalacao, codigo_instalacao, polo_id } = dadosInstalacao;
      
      if (!nome_instalacao || !codigo_instalacao || !polo_id) {
        return {
          success: false,
          error: 'Dados obrigatórios faltando',
          message: 'Nome, código da instalação e polo são obrigatórios'
        };
      }
      
      // Verificar se código já existe
      const existeCodigo = await Instalacao.findOne({
        where: { codigo_instalacao }
      });
      
      if (existeCodigo) {
        return {
          success: false,
          error: 'Código já existe',
          message: `Instalação com código ${codigo_instalacao} já está cadastrada`
        };
      }
      
      // TODO: Verificar se polo_id é válido
      // const poloExiste = await Polo.findByPk(polo_id);
      // if (!poloExiste) {
      //   return {
      //     success: false,
      //     error: 'Polo não encontrado',
      //     message: `Polo com ID ${polo_id} não existe`
      //   };
      // }
      
      // Criar instalação
      const novaInstalacao = await Instalacao.create(dadosInstalacao);
      
      return {
        success: true,
        data: novaInstalacao,
        message: 'Instalação criada com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de criação de instalação:', error);
      throw new Error('Erro ao criar instalação');
    }
  }
  
  /**
   * Atualiza instalação existente
   */
  async atualizar(id, dadosAtualizacao) {
    try {
      const instalacao = await Instalacao.findByPk(id);
      
      if (!instalacao) {
        return {
          success: false,
          error: 'Instalação não encontrada'
        };
      }
      
      // Verificar conflitos de código (se foi alterado)
      if (dadosAtualizacao.codigo_instalacao && dadosAtualizacao.codigo_instalacao !== instalacao.codigo_instalacao) {
        const existeCodigo = await Instalacao.findOne({
          where: { 
            codigo_instalacao: dadosAtualizacao.codigo_instalacao,
            id: { [Op.ne]: id }
          }
        });
        
        if (existeCodigo) {
          return {
            success: false,
            error: 'Código já existe',
            message: `Instalação com código ${dadosAtualizacao.codigo_instalacao} já está cadastrada`
          };
        }
      }
      
      // Atualizar instalação
      const instalacaoAtualizada = await instalacao.update(dadosAtualizacao);
      
      return {
        success: true,
        data: instalacaoAtualizada,
        message: 'Instalação atualizada com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de atualização de instalação:', error);
      throw new Error('Erro ao atualizar instalação');
    }
  }
  
  /**
   * Remove instalação
   */
  async remover(id) {
    try {
      const instalacao = await Instalacao.findByPk(id);
      
      if (!instalacao) {
        return {
          success: false,
          error: 'Instalação não encontrada'
        };
      }
      
      // TODO: Verificar se instalação possui pontos de medição antes de permitir exclusão
      // const temPontos = await instalacao.getTotalPontosMedicao();
      // if (temPontos > 0) {
      //   return {
      //     success: false,
      //     error: 'Instalação possui pontos de medição',
      //     message: 'Não é possível excluir instalação que possui pontos de medição cadastrados'
      //   };
      // }
      
      await instalacao.destroy();
      
      return {
        success: true,
        data: instalacao,
        message: 'Instalação removida com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de remoção de instalação:', error);
      throw new Error('Erro ao remover instalação');
    }
  }
  
  /**
   * Lista instalações por polo
   */
  async listarPorPolo(polo_id) {
    try {
      const instalacoes = await Instalacao.findByPolo(polo_id);
      
      return {
        success: true,
        data: instalacoes,
        total: instalacoes.length
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por polo:', error);
      throw new Error('Erro ao listar instalações por polo');
    }
  }
  
  /**
   * Lista instalações por tipo
   */
  async listarPorTipo(tipo) {
    try {
      const instalacoes = await Instalacao.findByTipo(tipo);
      
      return {
        success: true,
        data: instalacoes
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por tipo:', error);
      throw new Error('Erro ao listar instalações por tipo');
    }
  }
  
  /**
   * Lista instalações por status
   */
  async listarPorStatus(status) {
    try {
      const instalacoes = await Instalacao.findByStatus(status);
      
      return {
        success: true,
        data: instalacoes
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por status:', error);
      throw new Error('Erro ao listar instalações por status');
    }
  }
  
  /**
   * Lista apenas instalações operacionais
   */
  async listarOperacionais() {
    try {
      const instalacoes = await Instalacao.findOperacionais();
      
      return {
        success: true,
        data: instalacoes
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem operacionais:', error);
      throw new Error('Erro ao listar instalações operacionais');
    }
  }
  
  /**
   * Gera relatório de instalações
   */
  async gerarRelatorio(filtros = {}) {
    try {
      const instalacoes = await this.listar(filtros);
      
      if (!instalacoes.success) {
        return instalacoes;
      }
      
      // Agrupar por status
      const porStatus = {};
      instalacoes.data.forEach(inst => {
        const status = inst.status_instalacao;
        if (!porStatus[status]) {
          porStatus[status] = 0;
        }
        porStatus[status]++;
      });
      
      // Agrupar por tipo
      const porTipo = {};
      instalacoes.data.forEach(inst => {
        const tipo = inst.tipo_instalacao;
        if (!porTipo[tipo]) {
          porTipo[tipo] = 0;
        }
        porTipo[tipo]++;
      });
      
      // Agrupar por polo
      const porPolo = {};
      instalacoes.data.forEach(inst => {
        const polo = inst.polo_id;
        if (!porPolo[polo]) {
          porPolo[polo] = 0;
        }
        porPolo[polo]++;
      });
      
      // Calcular capacidade total por tipo
      const capacidadePorTipo = {};
      instalacoes.data.forEach(inst => {
        if (inst.capacidade_producao) {
          const tipo = inst.tipo_instalacao;
          if (!capacidadePorTipo[tipo]) {
            capacidadePorTipo[tipo] = 0;
          }
          capacidadePorTipo[tipo] += parseFloat(inst.capacidade_producao);
        }
      });
      
      return {
        success: true,
        data: {
          total: instalacoes.total,
          resumo: {
            porStatus,
            porTipo,
            porPolo,
            capacidadePorTipo
          },
          instalacoes: instalacoes.data
        }
      };
      
    } catch (error) {
      console.error('Erro no serviço de relatório:', error);
      throw new Error('Erro ao gerar relatório de instalações');
    }
  }
  
  /**
   * Importa instalações em lote
   */
  async importarLote(dadosInstalacoes) {
    try {
      const instalacoesImportadas = [];
      const erros = [];
      
      for (let i = 0; i < dadosInstalacoes.length; i++) {
        const instalacao = dadosInstalacoes[i];
        
        try {
          const resultado = await this.criar(instalacao);
          
          if (resultado.success) {
            instalacoesImportadas.push(resultado.data);
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
          importadas: instalacoesImportadas.length,
          erros: erros.length,
          detalhes_erros: erros,
          instalacoes: instalacoesImportadas
        },
        message: `${instalacoesImportadas.length} instalações importadas com sucesso`
      };
      
    } catch (error) {
      console.error('Erro no serviço de importação:', error);
      throw new Error('Erro ao importar instalações');
    }
  }
  
  /**
   * Altera status da instalação
   */
  async alterarStatus(id, novoStatus) {
    try {
      const statusValidos = ['Operacional', 'Parada', 'Manutenção', 'Construção', 'Comissionamento', 'Descomissionada', 'Inativa'];
      
      if (!statusValidos.includes(novoStatus)) {
        return {
          success: false,
          error: 'Status inválido',
          message: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
        };
      }
      
      const resultado = await this.atualizar(id, { status_instalacao: novoStatus });
      
      if (resultado.success) {
        resultado.message = `Status da instalação alterado para ${novoStatus}`;
      }
      
      return resultado;
      
    } catch (error) {
      console.error('Erro no serviço de alteração de status:', error);
      throw new Error('Erro ao alterar status da instalação');
    }
  }
  
  /**
   * Busca instalações com seus pontos de medição
   */
  async listarComPontosMedicao(polo_id = null) {
    try {
      const where = {};
      if (polo_id) {
        where.polo_id = polo_id;
      }
      
      // TODO: Implementar quando tiver relacionamento ativo
      const instalacoes = await Instalacao.findAll({
        where,
        order: [['nome_instalacao', 'ASC']]
      });
      
      return {
        success: true,
        data: instalacoes
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem com pontos:', error);
      throw new Error('Erro ao listar instalações com pontos de medição');
    }
  }
}

module.exports = new InstalacoesService();