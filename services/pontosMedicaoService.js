// ============================================================================
// SERVICE PARA PONTOS DE MEDIÇÃO - SGM
// ============================================================================

const PontoMedicao = require('../models/pontosMedicao');
const { Op } = require('sequelize');

class PontosMedicaoService {
  /**
   * Lista pontos de medição com filtros e paginação
   */
  async listar(filtros = {}, paginacao = {}) {
    try {
      const { 
        instalacao_id, 
        polo_id, 
        status, 
        classificacao, 
        tipo_medidor, 
        fluido,
        search, 
        page = 1, 
        limit = 100 
      } = { ...filtros, ...paginacao };
      
      const where = {};
      
      // Aplicar filtros
      if (polo_id) {
        where.polo_id = polo_id;
      }
      
      if (instalacao_id) {
        where.instalacao_id = instalacao_id;
      }
      
      if (status && status !== 'all') {
        where.status_ponto = status;
      }
      
      if (classificacao) {
        where.classificacao = classificacao;
      }
      
      if (tipo_medidor) {
        where.tipo_medidor_primario = tipo_medidor;
      }
      
      if (fluido) {
        where.fluido_medido = fluido;
      }
      
      if (search) {
        where[Op.or] = [
          { tag_ponto: { [Op.iLike]: `%${search}%` } },
          { nome_ponto: { [Op.iLike]: `%${search}%` } },
          { localizacao: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await PontoMedicao.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['tag_ponto', 'ASC']]
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
      console.error('Erro no serviço de listagem de pontos de medição:', error);
      throw new Error('Erro ao listar pontos de medição');
    }
  }
  
  /**
   * Busca ponto de medição por ID
   */
  async buscarPorId(id) {
    try {
      const ponto = await PontoMedicao.findByPk(id);
      
      if (!ponto) {
        return {
          success: false,
          error: 'Ponto de medição não encontrado'
        };
      }
      
      return {
        success: true,
        data: ponto
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca de ponto:', error);
      throw new Error('Erro ao buscar ponto de medição');
    }
  }
  
  /**
   * Busca ponto de medição por tag
   */
  async buscarPorTag(tag) {
    try {
      const ponto = await PontoMedicao.findByTag(tag);
      
      return {
        success: true,
        data: ponto
      };
      
    } catch (error) {
      console.error('Erro no serviço de busca por tag:', error);
      throw new Error('Erro ao buscar ponto por tag');
    }
  }
  
  /**
   * Cria novo ponto de medição
   */
  async criar(dadosPonto) {
    try {
      // Validar dados obrigatórios
      const { tag_ponto, nome_ponto, polo_id, instalacao_id } = dadosPonto;
      
      if (!tag_ponto || !nome_ponto || !polo_id || !instalacao_id) {
        return {
          success: false,
          error: 'Dados obrigatórios faltando',
          message: 'Tag, nome, polo e instalação são obrigatórios'
        };
      }
      
      // Verificar se tag já existe
      const existeTag = await PontoMedicao.findOne({
        where: { tag_ponto }
      });
      
      if (existeTag) {
        return {
          success: false,
          error: 'Tag já existe',
          message: `Ponto com tag ${tag_ponto} já está cadastrado`
        };
      }
      
      // TODO: Verificar se polo_id e instalacao_id são válidos
      // TODO: Verificar se instalacao pertence ao polo
      
      // Criar ponto de medição
      const novoPonto = await PontoMedicao.create(dadosPonto);
      
      return {
        success: true,
        data: novoPonto,
        message: 'Ponto de medição criado com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de criação de ponto:', error);
      throw new Error('Erro ao criar ponto de medição');
    }
  }
  
  /**
   * Atualiza ponto de medição existente
   */
  async atualizar(id, dadosAtualizacao) {
    try {
      const ponto = await PontoMedicao.findByPk(id);
      
      if (!ponto) {
        return {
          success: false,
          error: 'Ponto de medição não encontrado'
        };
      }
      
      // Verificar conflitos de tag (se foi alterada)
      if (dadosAtualizacao.tag_ponto && dadosAtualizacao.tag_ponto !== ponto.tag_ponto) {
        const existeTag = await PontoMedicao.findOne({
          where: { 
            tag_ponto: dadosAtualizacao.tag_ponto,
            id: { [Op.ne]: id }
          }
        });
        
        if (existeTag) {
          return {
            success: false,
            error: 'Tag já existe',
            message: `Ponto com tag ${dadosAtualizacao.tag_ponto} já está cadastrado`
          };
        }
      }
      
      // Atualizar ponto
      const pontoAtualizado = await ponto.update(dadosAtualizacao);
      
      return {
        success: true,
        data: pontoAtualizado,
        message: 'Ponto de medição atualizado com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de atualização de ponto:', error);
      throw new Error('Erro ao atualizar ponto de medição');
    }
  }
  
  /**
   * Remove ponto de medição
   */
  async remover(id) {
    try {
      const ponto = await PontoMedicao.findByPk(id);
      
      if (!ponto) {
        return {
          success: false,
          error: 'Ponto de medição não encontrado'
        };
      }
      
      // TODO: Verificar dependências antes de permitir exclusão
      // - Placas de orifício
      // - Incertezas
      // - Histórico de instalações
      
      await ponto.destroy();
      
      return {
        success: true,
        data: ponto,
        message: 'Ponto de medição removido com sucesso'
      };
      
    } catch (error) {
      console.error('Erro no serviço de remoção de ponto:', error);
      throw new Error('Erro ao remover ponto de medição');
    }
  }
  
  /**
   * Lista pontos por polo
   */
  async listarPorPolo(polo_id) {
    try {
      const pontos = await PontoMedicao.findByPolo(polo_id);
      
      return {
        success: true,
        data: pontos,
        total: pontos.length
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por polo:', error);
      throw new Error('Erro ao listar pontos por polo');
    }
  }
  
  /**
   * Lista pontos por instalação
   */
  async listarPorInstalacao(instalacao_id) {
    try {
      const pontos = await PontoMedicao.findByInstalacao(instalacao_id);
      
      return {
        success: true,
        data: pontos,
        total: pontos.length
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por instalação:', error);
      throw new Error('Erro ao listar pontos por instalação');
    }
  }
  
  /**
   * Lista pontos por tipo de medidor
   */
  async listarPorTipo(tipo) {
    try {
      const pontos = await PontoMedicao.findByTipo(tipo);
      
      return {
        success: true,
        data: pontos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por tipo:', error);
      throw new Error('Erro ao listar pontos por tipo');
    }
  }
  
  /**
   * Lista pontos por fluido
   */
  async listarPorFluido(fluido) {
    try {
      const pontos = await PontoMedicao.findByFluido(fluido);
      
      return {
        success: true,
        data: pontos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por fluido:', error);
      throw new Error('Erro ao listar pontos por fluido');
    }
  }
  
  /**
   * Lista pontos por status
   */
  async listarPorStatus(status) {
    try {
      const pontos = await PontoMedicao.findByStatus(status);
      
      return {
        success: true,
        data: pontos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem por status:', error);
      throw new Error('Erro ao listar pontos por status');
    }
  }
  
  /**
   * Lista pontos fiscais
   */
  async listarFiscais() {
    try {
      const pontos = await PontoMedicao.findFiscais();
      
      return {
        success: true,
        data: pontos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem fiscais:', error);
      throw new Error('Erro ao listar pontos fiscais');
    }
  }
  
  /**
   * Lista pontos com calibração vencida
   */
  async listarVencidos() {
    try {
      const pontos = await PontoMedicao.findVencidos();
      
      return {
        success: true,
        data: pontos
      };
      
    } catch (error) {
      console.error('Erro no serviço de listagem vencidos:', error);
      throw new Error('Erro ao listar pontos vencidos');
    }
  }
  
  /**
   * Gera relatório de pontos de medição
   */
  async gerarRelatorio(filtros = {}) {
    try {
      const pontos = await this.listar(filtros);
      
      if (!pontos.success) {
        return pontos;
      }
      
      // Agrupar por status
      const porStatus = {};
      pontos.data.forEach(ponto => {
        const status = ponto.status_ponto;
        if (!porStatus[status]) {
          porStatus[status] = 0;
        }
        porStatus[status]++;
      });
      
      // Agrupar por classificação
      const porClassificacao = {};
      pontos.data.forEach(ponto => {
        const classificacao = ponto.classificacao;
        if (!porClassificacao[classificacao]) {
          porClassificacao[classificacao] = 0;
        }
        porClassificacao[classificacao]++;
      });
      
      // Agrupar por tipo de medidor
      const porTipoMedidor = {};
      pontos.data.forEach(ponto => {
        const tipo = ponto.tipo_medidor_primario;
        if (!porTipoMedidor[tipo]) {
          porTipoMedidor[tipo] = 0;
        }
        porTipoMedidor[tipo]++;
      });
      
      // Agrupar por fluido
      const porFluido = {};
      pontos.data.forEach(ponto => {
        const fluido = ponto.fluido_medido;
        if (!porFluido[fluido]) {
          porFluido[fluido] = 0;
        }
        porFluido[fluido]++;
      });
      
      // Análise de vencimentos
      const statusCalibracoes = {
        'Em dia': 0,
        'Atenção': 0,
        'Próximo ao vencimento': 0,
        'Vencido': 0,
        'Sem data definida': 0
      };
      
      pontos.data.forEach(ponto => {
        const statusCalibracao = ponto.getStatusCalibração();
        statusCalibracoes[statusCalibracao]++;
      });
      
      return {
        success: true,
        data: {
          total: pontos.total,
          resumo: {
            porStatus,
            porClassificacao,
            porTipoMedidor,
            porFluido,
            statusCalibracoes
          },
          pontos: pontos.data
        }
      };
      
    } catch (error) {
      console.error('Erro no serviço de relatório:', error);
      throw new Error('Erro ao gerar relatório de pontos de medição');
    }
  }
  
  /**
   * Importa pontos de medição em lote
   */
  async importarLote(dadosPontos) {
    try {
      const pontosImportados = [];
      const erros = [];
      
      for (let i = 0; i < dadosPontos.length; i++) {
        const ponto = dadosPontos[i];
        
        try {
          const resultado = await this.criar(ponto);
          
          if (resultado.success) {
            pontosImportados.push(resultado.data);
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
          importados: pontosImportados.length,
          erros: erros.length,
          detalhes_erros: erros,
          pontos: pontosImportados
        },
        message: `${pontosImportados.length} pontos de medição importados com sucesso`
      };
      
    } catch (error) {
      console.error('Erro no serviço de importação:', error);
      throw new Error('Erro ao importar pontos de medição');
    }
  }
  
  /**
   * Altera status do ponto
   */
  async alterarStatus(id, novoStatus) {
    try {
      const statusValidos = ['Ativo', 'Inativo', 'Manutenção', 'Calibração', 'Bloqueado', 'Em_Teste'];
      
      if (!statusValidos.includes(novoStatus)) {
        return {
          success: false,
          error: 'Status inválido',
          message: `Status deve ser um dos seguintes: ${statusValidos.join(', ')}`
        };
      }
      
      const resultado = await this.atualizar(id, { status_ponto: novoStatus });
      
      if (resultado.success) {
        resultado.message = `Status do ponto alterado para ${novoStatus}`;
      }
      
      return resultado;
      
    } catch (error) {
      console.error('Erro no serviço de alteração de status:', error);
      throw new Error('Erro ao alterar status do ponto');
    }
  }
  
  /**
   * Atualiza datas de calibração
   */
  async atualizarCalibração(id, dadosCalibração) {
    try {
      const { data_ultima_calibracao, data_proxima_calibracao, numero_serie_atual } = dadosCalibração;
      
      const dadosAtualizacao = {};
      
      if (data_ultima_calibracao) {
        dadosAtualizacao.data_ultima_calibracao = new Date(data_ultima_calibracao);
      }
      
      if (data_proxima_calibracao) {
        dadosAtualizacao.data_proxima_calibracao = new Date(data_proxima_calibracao);
      }
      
      if (numero_serie_atual) {
        dadosAtualizacao.numero_serie_atual = numero_serie_atual;
        dadosAtualizacao.data_instalacao_atual = new Date();
      }
      
      const resultado = await this.atualizar(id, dadosAtualizacao);
      
      if (resultado.success) {
        resultado.message = 'Dados de calibração atualizados com sucesso';
      }
      
      return resultado;
      
    } catch (error) {
      console.error('Erro no serviço de atualização de calibração:', error);
      throw new Error('Erro ao atualizar calibração');
    }
  }
}

module.exports = new PontosMedicaoService();