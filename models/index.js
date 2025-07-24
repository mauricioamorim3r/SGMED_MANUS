// ============================================================================
// ÍNDICE DE MODELS - SGM
// ============================================================================

// Importar models existentes
const Equipamento = require('./equipamentos');
const Polo = require('./polos');
const Instalacao = require('./instalacoes');
const PontoMedicao = require('./pontosMedicao');

// Models que ainda não foram criados - exportar como null por enquanto
const Certificado = null;
const PlacaOrificio = null;
const HistoricoInstalacao = null;
const IncertezaSistema = null;
const TrechoReto = null;
const TestePocos = null;
const AnaliseQuimica = null;
const Usuario = require('./usuarios');
const Sessao = null;
const Auditoria = null;
const Estoque = null;
const MovimentacaoEstoque = null;
const ControleMudancas = null;
const Configuracao = null;

// Configurar associações quando todos os models estiverem disponíveis
function setupAssociations() {
  // Por enquanto, apenas configurar associações básicas
  if (Equipamento && typeof Equipamento.associate === 'function') {
    // Equipamento.associate({ PontoMedicao, Polo, Instalacao });
  }
  
  if (Polo && typeof Polo.associate === 'function') {
    // Polo.associate({ Instalacao, PontoMedicao });
  }
  
  if (Instalacao && typeof Instalacao.associate === 'function') {
    // Instalacao.associate({ Polo, PontoMedicao });
  }
  
  if (PontoMedicao && typeof PontoMedicao.associate === 'function') {
    // PontoMedicao.associate({ Polo, Instalacao, Equipamento });
  }
}

module.exports = {
  // Models principais
  Equipamento,
  Polo,
  Instalacao,
  PontoMedicao,
  
  // Models ainda não criados
  Certificado,
  PlacaOrificio,
  HistoricoInstalacao,
  IncertezaSistema,
  TrechoReto,
  TestePocos,
  AnaliseQuimica,
  Usuario,
  Sessao,
  Auditoria,
  Estoque,
  MovimentacaoEstoque,
  ControleMudancas,
  Configuracao,
  
  // Função para configurar associações
  setupAssociations
};