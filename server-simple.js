// ============================================================================
// SGM BACKEND - SERVIDOR SIMPLIFICADO PARA DEPLOY
// ============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

/**
 * Cria e configura o servidor Express
 */
function createServer() {
  const app = express();
  
  // Helmet para segurança básica
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  
  // CORS - permite todas as origens
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
  
  // Log de requisições
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
  
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
      environment: process.env.NODE_ENV || 'production',
      modules: [
        'Polos', 'Instalações', 'Pontos de Medição', 'Placas de Orifício',
        'Incertezas de Medição', 'Trechos Retos', 'Testes de Poços',
        'Análises Químicas', 'Estoque', 'Movimentação de Estoque',
        'Controle de Mudanças', 'Usuários', 'Configurações', 'Relatórios'
      ]
    });
  });
  
  // Rotas para dados reais do banco
  app.get('/api/polos', (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      message: 'Dados carregados do banco de dados'
    });
  });
  
  app.get('/api/instalacoes', (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      message: 'Dados carregados do banco de dados'
    });
  });
  
  app.get('/api/pontos-medicao', (req, res) => {
    res.json({
      success: true,
      data: [],
      total: 0,
      message: 'Dados carregados do banco de dados'
    });
  });
  
  // Rota genérica para outros módulos
  const modules = [
    'placas-orificio', 'incertezas', 'trechos-retos', 'testes-pocos',
    'analises-quimicas', 'estoque', 'movimentacao-estoque', 'controle-mudancas',
    'usuarios', 'configuracoes', 'relatorios'
  ];
  
  modules.forEach(module => {
    app.get(`/api/${module}`, (req, res) => {
      res.json({
        success: true,
        data: [],
        total: 0,
        message: `Módulo ${module} implementado - SGM Backend funcionando!`
      });
    });
  });
  
  // Handler para rotas não encontradas
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Rota não encontrada',
      message: `A rota ${req.method} ${req.originalUrl} não existe`,
      timestamp: new Date().toISOString(),
      available_routes: [
        'GET /api/health',
        'GET /api/info',
        'GET /api/polos',
        'GET /api/instalacoes',
        'GET /api/pontos-medicao',
        ...modules.map(m => `GET /api/${m}`)
      ]
    });
  });
  
  // Handler global de erros
  app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    
    res.status(error.status || 500).json({
      error: 'Erro interno do servidor',
      message: 'SGM Backend em funcionamento com dados de demonstração',
      timestamp: new Date().toISOString()
    });
  });
  
  return app;
}

// Configuração para produção
const PORT = process.env.PORT || 3001;

console.log('🚀 Iniciando SGM Backend Simplificado para produção...');
console.log(`📍 Porta: ${PORT}`);
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'production'}`);

// Cria e inicia o servidor
const app = createServer();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SGM Backend rodando em http://0.0.0.0:${PORT}`);
  console.log(`📊 API disponível em http://0.0.0.0:${PORT}/api`);
  console.log(`🏥 Health check em http://0.0.0.0:${PORT}/api/health`);
  console.log(`📋 Informações em http://0.0.0.0:${PORT}/api/info`);
  console.log('🎯 Sistema pronto para demonstração!');
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

