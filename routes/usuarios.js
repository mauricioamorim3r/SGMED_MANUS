// ============================================================================
// ROTA USUÁRIOS - PARTE 5: SISTEMA E SEGURANÇA
// ============================================================================

const express = require('express');
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const router = express.Router();

// ============================================================================
// GET /api/usuarios - Listar usuários
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['senha_hash', 'salt'] }, // Não retornar dados sensíveis
      order: [['nome_usuario', 'ASC']]
    });
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// POST /api/usuarios - Criar usuário
// ============================================================================
router.post('/', async (req, res) => {
  try {
    const {
      nome_usuario,
      login,
      email,
      senha,
      perfil_usuario,
      telefone,
      cargo,
      departamento,
      empresa,
      matricula,
      supervisor_id,
      polos_acesso,
      instalacoes_acesso,
      observacoes
    } = req.body;

    // Validações básicas
    if (!nome_usuario || !login || !email || !senha || !perfil_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome_usuario, login, email, senha, perfil_usuario'
      });
    }

    // Verificar se usuário já existe
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Usuario.sequelize.Sequelize.Op.or]: [
          { login },
          { email }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Usuário com este login ou email já existe'
      });
    }

    // Criar usuário
    const novoUsuario = await Usuario.create({
      nome_usuario,
      login,
      email,
      perfil_usuario,
      telefone,
      cargo,
      departamento,
      empresa,
      matricula,
      supervisor_id,
      polos_acesso,
      instalacoes_acesso,
      observacoes,
      ativo: true,
      primeiro_acesso: true,
      deve_alterar_senha: false
    });

    // Hash da senha
    await novoUsuario.hashSenha(senha);
    await novoUsuario.save();

    // Retornar usuário sem dados sensíveis
    const usuarioRetorno = await Usuario.findByPk(novoUsuario.id, {
      attributes: { exclude: ['senha_hash', 'salt'] }
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: usuarioRetorno
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/usuarios/:id - Buscar usuário por ID
// ============================================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['senha_hash', 'salt'] }
    });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// PUT /api/usuarios/:id - Atualizar usuário
// ============================================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Se tem nova senha, fazer hash
    if (updates.senha) {
      await usuario.hashSenha(updates.senha);
      delete updates.senha; // Remover do updates
    }
    
    // Atualizar usuário
    await usuario.update(updates);
    
    // Retornar usuário atualizado sem dados sensíveis
    const usuarioAtualizado = await Usuario.findByPk(id, {
      attributes: { exclude: ['senha_hash', 'salt'] }
    });
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// DELETE /api/usuarios/:id - Desativar usuário (soft delete)
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Soft delete - marcar como inativo
    await usuario.update({ ativo: false });
    
    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// POST /api/usuarios/login - Autenticação
// ============================================================================
router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    
    if (!login || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Login e senha são obrigatórios'
      });
    }
    
    // Buscar usuário
    const usuario = await Usuario.findOne({
      where: {
        [Usuario.sequelize.Sequelize.Op.or]: [
          { login },
          { email: login }
        ],
        ativo: true
      }
    });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    // Verificar se usuário está bloqueado
    if (usuario.bloqueado) {
      return res.status(423).json({
        success: false,
        message: 'Usuário bloqueado',
        motivo: usuario.motivo_bloqueio
      });
    }
    
    // Verificar senha
    const senhaValida = await usuario.verificarSenha(senha);
    
    if (!senhaValida) {
      // Incrementar tentativas de login
      await usuario.incrementarTentativasLogin();
      
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    // Verificar se senha expirou
    if (usuario.senhaExpirada()) {
      return res.status(422).json({
        success: false,
        message: 'Senha expirada',
        deve_alterar_senha: true
      });
    }
    
    // Registrar login bem-sucedido
    const ip = req.ip || req.connection.remoteAddress;
    await usuario.registrarLogin(ip);
    
    // Retornar dados do usuário (sem senha)
    const usuarioData = await Usuario.findByPk(usuario.id, {
      attributes: { exclude: ['senha_hash', 'salt'] }
    });
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: usuarioData,
      primeiro_acesso: usuario.primeiro_acesso,
      deve_alterar_senha: usuario.deve_alterar_senha
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// POST /api/usuarios/:id/bloquear - Bloquear usuário
// ============================================================================
router.post('/:id/bloquear', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    await usuario.bloquear(motivo || 'Bloqueado manualmente', null);
    
    res.json({
      success: true,
      message: 'Usuário bloqueado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// ============================================================================
// POST /api/usuarios/:id/desbloquear - Desbloquear usuário
// ============================================================================
router.post('/:id/desbloquear', async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    await usuario.desbloquear(null);
    
    res.json({
      success: true,
      message: 'Usuário desbloqueado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;