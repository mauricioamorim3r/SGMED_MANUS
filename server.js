// ============================================================================
// SERVIDOR EXPRESS - SGM
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Importações locais
const { initializeDatabase } = require('./database/init');
const equipamentosRoutes = require('./routes/equipamentos');
const placasOrificioRoutes = require('./routes/placasOrificio');
const incertezasRoutes = require('./routes/incertezas');
const polosRoutes = require('./routes/polos');
const instalacoesRoutes = require('./routes/instalacoes');
const trechosRetosRoutes = require('./routes/trechosRetos');
const testesPocoRoutes = require('./routes/testesPocos');
const analisesQuimicasRoutes = require('./routes/analisesQuimicas');
const configuracoesRoutes = require('./routes/configuracoes_simples');

/**
 * Cria e configura o servidor Express
 */
async function createServer() {
  const app = express();
  
  // ============================================================================
  // MIDDLEWARES DE SEGURANÇA E PERFORMANCE
  // ============================================================================
  
  // Helmet para segurança básica
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado para desenvolvimento
    crossOriginEmbedderPolicy: false
  }));
  
  // CORS - permite todas as origens para desenvolvimento
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
  }));
  
  // Compressão de respostas
  app.use(compression());
  
  // Parse de JSON e URL encoded
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // ============================================================================
  // MIDDLEWARES DE LOGGING E MONITORAMENTO
  // ============================================================================
  
  // Log de requisições
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
  
  // Middleware de tempo de resposta
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method} ${req.url}] ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
  
  // ============================================================================
  // ROTAS DA API
  // ============================================================================
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'SGM API'
    });
  });
  
  // Informações do sistema
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Sistema de Gerenciamento Metrológico',
      version: '1.0.0',
      description: 'API para gestão de equipamentos de medição',
      author: 'SGM Development Team',
      database: 'SQLite',
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Rotas de equipamentos
  app.use('/api/equipamentos', equipamentosRoutes);
  
  // Rotas de placas de orifício
  app.use('/api/placas-orificio', placasOrificioRoutes);
  
  // Rotas de incertezas
  app.use('/api/incertezas', incertezasRoutes);
  
  // Rotas de polos
  app.use('/api/polos', polosRoutes);
  
  // Rotas de instalações
  app.use('/api/instalacoes', instalacoesRoutes);
  
  // Rotas de trechos retos
  app.use('/api/trechos-retos', trechosRetosRoutes);
  
  // Rotas de estoque
  app.use('/api/estoque', require('./routes/estoque'));
  
  // Rotas de movimentação de estoque
  app.use('/api/movimentacao-estoque', require('./routes/movimentacaoEstoque'));
  
  // Rotas de controle de mudanças (MOC)
  app.use('/api/controle-mudancas', require('./routes/controleMudancas'));
  
  // Rotas de testes de poços
  app.use('/api/testes-pocos', testesPocoRoutes);
  
  // Rotas de análises químicas
  app.use('/api/analises-quimicas', analisesQuimicasRoutes);
  
  // Rotas de configurações
  app.use('/api/configuracoes', configuracoesRoutes);
  
  // Rota para servir arquivos estáticos (certificados, relatórios, etc.)
  app.use('/api/files', express.static(path.join(__dirname, '../../uploads')));
  
  // ============================================================================
  // MIDDLEWARE DE TRATAMENTO DE ERROS
  // ============================================================================
  
  // Handler para rotas não encontradas
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Rota não encontrada',
      message: `A rota ${req.method} ${req.originalUrl} não existe`,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handler global de erros
  app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    
    res.status(error.status || 500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  });
  
  return app;
}

/**
 * Inicia o servidor
 */
async function startServer(port = 3001) {
  try {
    console.log('🚀 Iniciando servidor SGM...');
    
    // Inicializa o banco de dados
    await initializeDatabase();
    
    // Cria o servidor
    const app = await createServer();
    
    // Inicia o servidor
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Servidor SGM rodando em http://0.0.0.0:${port}`);
      console.log(`📊 API disponível em http://0.0.0.0:${port}/api`);
      console.log(`🏥 Health check em http://0.0.0.0:${port}/api/health`);
      console.log(`📋 Documentação em http://0.0.0.0:${port}/api/info`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Recebido SIGTERM, encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Recebido SIGINT, encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });
    
    return server;
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Inicia o servidor se este arquivo for executado diretamente
if (require.main === module) {
  const port = process.env.PORT || 3001;
  startServer(port);
}

module.exports = {
  createServer,
  startServer
};

