// ============================================================================
// ROTAS DE CONFIGURAÇÕES SIMPLIFICADAS - SGM
// ============================================================================

const express = require('express');
const router = express.Router();
const { UnidadeMedida, ConfiguracaoCampo, PerfilConfiguracao, HistoricoConversao } = require('../models/configuracoes');
const { Op } = require('sequelize');

/**
 * GET /api/configuracoes
 * Listar configurações (usando ConfiguracaoCampo como base)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, modulo } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (modulo) where.modulo = modulo;
    
    const { count, rows } = await ConfiguracaoCampo.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['modulo', 'ASC'], ['ordem_exibicao', 'ASC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/configuracoes/unidades-medida
 * Listar unidades de medida
 */
router.get('/unidades-medida', async (req, res) => {
  try {
    const { grandeza_fisica } = req.query;
    
    const where = { ativo: true };
    if (grandeza_fisica) where.grandeza_fisica = grandeza_fisica;
    
    const unidades = await UnidadeMedida.findAll({
      where,
      order: [['grandeza_fisica', 'ASC'], ['nome_unidade', 'ASC']]
    });

    res.json({
      success: true,
      data: unidades
    });

  } catch (error) {
    console.error('Erro ao listar unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/configuracoes/perfis
 * Listar perfis de configuração
 */
router.get('/perfis', async (req, res) => {
  try {
    const { setor_aplicacao } = req.query;
    
    const where = { ativo: true };
    if (setor_aplicacao) where.setor_aplicacao = setor_aplicacao;
    
    const perfis = await PerfilConfiguracao.findAll({
      where,
      order: [['nome_perfil', 'ASC']]
    });

    res.json({
      success: true,
      data: perfis
    });

  } catch (error) {
    console.error('Erro ao listar perfis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/configuracoes/campos/:modulo
 * Obter campos visíveis de um módulo
 */
router.get('/campos/:modulo', async (req, res) => {
  try {
    const { modulo } = req.params;
    
    const campos = await ConfiguracaoCampo.findAll({
      where: { 
        modulo,
        ativo: true
      },
      order: [['ordem_exibicao', 'ASC']]
    });

    res.json({
      success: true,
      data: campos
    });

  } catch (error) {
    console.error('Erro ao obter campos do módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/configuracoes/campos
 * Criar nova configuração de campo
 */
router.post('/campos', async (req, res) => {
  try {
    const campo = await ConfiguracaoCampo.create(req.body);

    res.status(201).json({
      success: true,
      data: campo,
      message: 'Campo configurado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar configuração de campo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/configuracoes/health
 * Health check das configurações
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Configurações SGM',
    timestamp: new Date().toISOString(),
    models: ['UnidadeMedida', 'ConfiguracaoCampo', 'PerfilConfiguracao', 'HistoricoConversao']
  });
});

module.exports = router;

