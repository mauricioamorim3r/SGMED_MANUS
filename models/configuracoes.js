// Modelo de configurações do sistema SGM
const configuracoes = {
  // Configurações do sistema
  sistema: {
    nome: 'Sistema de Gestão de Medições',
    versao: '1.0.0',
    ambiente: process.env.NODE_ENV || 'development'
  },
  
  // Configurações do banco de dados
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'sgm_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },
  
  // Configurações da API
  api: {
    port: process.env.API_PORT || 3000,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },
  
  // Configurações de autenticação
  auth: {
    secret: process.env.JWT_SECRET || 'sgm-secret-key',
    expiresIn: '24h'
  }
};

module.exports = configuracoes;