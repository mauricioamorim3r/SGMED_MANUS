// ============================================================================
// CONFIGURAÇÃO DA API - SGM
// ============================================================================

// Configuração do backend
const API_CONFIG = {
  // URL base do backend local (desenvolvimento)
  LOCAL_BASE_URL: 'http://localhost:3002/api',
  
  // URL base do backend em produção (se houver)
  PROD_BASE_URL: 'https://nghki1cl06l9.manus.space/api',
  
  // Timeout para requisições (ms)
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Determinar qual URL usar baseado no ambiente
const getApiBaseUrl = () => {
  // Em desenvolvimento, usar sempre local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return API_CONFIG.LOCAL_BASE_URL;
  }
  
  // Em produção, usar URL de produção
  return API_CONFIG.PROD_BASE_URL;
};

// Exportar configuração
export const API_BASE_URL = getApiBaseUrl();
export const API_TIMEOUT = API_CONFIG.TIMEOUT;
export const API_HEADERS = API_CONFIG.DEFAULT_HEADERS;

// Função utilitária para fazer requisições
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    timeout: API_TIMEOUT,
    headers: {
      ...API_HEADERS,
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Endpoints específicos para facilitar uso
export const API_ENDPOINTS = {
  // Sistema
  HEALTH: '/health',
  INFO: '/info',
  
  // Módulos principais
  EQUIPAMENTOS: '/equipamentos',
  POLOS: '/polos',
  INSTALACOES: '/instalacoes',
  PONTOS_MEDICAO: '/pontos-medicao',
  
  // Módulos especializados
  PLACAS_ORIFICIO: '/placas-orificio',
  INCERTEZAS: '/incertezas',
  TRECHOS_RETOS: '/trechos-retos',
  
  // Módulos avançados
  TESTES_POCOS: '/testes-pocos',
  ANALISES_QUIMICAS: '/analises-quimicas',
  
  // Gestão
  ESTOQUE: '/estoque',
  MOVIMENTACAO_ESTOQUE: '/movimentacao-estoque',
  CONTROLE_MUDANCAS: '/controle-mudancas',
  
  // Sistema
  USUARIOS: '/usuarios',
  SESSOES: '/sessoes',
  AUDITORIA: '/auditoria',
  CONFIGURACOES: '/configuracoes'
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_HEADERS,
  API_ENDPOINTS,
  apiRequest
};