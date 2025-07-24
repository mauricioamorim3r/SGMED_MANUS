// ============================================================================
// INICIALIZAÇÃO DO BANCO DE DADOS SGM
// ============================================================================

const { sequelize } = require('./config');
const { criarDadosExemplo } = require('./seedData');
const {
  Equipamento,
  PontoMedicao,
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
  ControleMudancas
} = require('../models');

/**
 * Inicializa o banco de dados criando todas as tabelas
 */
async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados SGM...');
    
    // Testa a conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com SQLite estabelecida com sucesso.');
    
    // Sincroniza os modelos (cria as tabelas)
    await sequelize.sync({ force: false });
    console.log('✅ Tabelas criadas/sincronizadas com sucesso.');
    
    // Verifica se existem dados iniciais
    const equipamentosCount = await Equipamento.count();
    const pontosCount = await PontoMedicao.count();
    
    console.log(`📊 Equipamentos cadastrados: ${equipamentosCount}`);
    console.log(`📊 Pontos de medição cadastrados: ${pontosCount}`);
    
    // Se não há dados, cria dados de exemplo
    if (equipamentosCount === 0 && pontosCount === 0) {
      console.log('🔄 Criando dados de exemplo...');
      await createSampleData();
    }
    
    console.log('🎉 Banco de dados inicializado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

/**
 * Cria dados de exemplo para demonstração
 */
async function createSampleData() {
  try {
    // Dados de exemplo baseados na análise do sistema atual
    const equipamentosExemplo = [
      {
        numero_serie: '7-PPT-50HP-RJS',
        tag_equipamento: 'PPT-50',
        nome_equipamento: 'Transmissor de Pressão Principal',
        fabricante: 'Rosemount',
        modelo: '3051CD',
        tipo_equipamento: 'Transmissor_Pressao',
        faixa_equipamento: '0 a 10 bar',
        faixa_pam: '2 a 8 bar',
        faixa_calibrada: '0 a 10 bar',
        unidade_medicao: 'bar',
        erro_maximo_admissivel: '±0.075%',
        criterio_aceitacao: '±0.05%',
        status_atual: 'Instalado',
        localizacao_fisica: 'Skid de Medição Principal',
        frequencia_calibracao: 12,
        observacoes: 'Transmissor principal do sistema fiscal'
      },
      {
        numero_serie: '7-PPT-51HP-RJS',
        tag_equipamento: 'PPT-51',
        nome_equipamento: 'Transmissor de Pressão Backup',
        fabricante: 'Rosemount',
        modelo: '3051CD',
        tipo_equipamento: 'Transmissor_Pressao',
        faixa_equipamento: '0 a 10 bar',
        faixa_pam: '2 a 8 bar',
        faixa_calibrada: '0 a 10 bar',
        unidade_medicao: 'bar',
        erro_maximo_admissivel: '±0.075%',
        criterio_aceitacao: '±0.05%',
        status_atual: 'Reserva',
        localizacao_fisica: 'Almoxarifado',
        frequencia_calibracao: 12,
        observacoes: 'Transmissor de backup para contingência'
      },
      {
        numero_serie: '309-FT-9144',
        tag_equipamento: 'FT-9144',
        nome_equipamento: 'Medidor Ultrassônico Principal',
        fabricante: 'Daniel',
        modelo: 'SeniorSonic',
        tipo_equipamento: 'Ultrassonico',
        faixa_equipamento: '0 a 5000 m³/h',
        faixa_pam: '500 a 4000 m³/h',
        faixa_calibrada: '0 a 5000 m³/h',
        unidade_medicao: 'm³/h',
        erro_maximo_admissivel: '±0.5%',
        criterio_aceitacao: '±0.3%',
        status_atual: 'Instalado',
        localizacao_fisica: 'Linha Principal 3R2',
        frequencia_calibracao: 12,
        observacoes: 'Medidor fiscal principal - Tocha da P-61'
      }
    ];
    
    // Cria equipamentos
    for (const equipamento of equipamentosExemplo) {
      await Equipamento.create(equipamento);
    }
    
    // Pontos de medição de exemplo (temporários - serão atualizados após criação de Polos)
    const pontosExemplo = [
      {
        tag_ponto: '3R2-FT-91',
        nome_ponto: 'Vazão Gás Natural',
        polo_id: 1, // Será atualizado após criação dos polos
        instalacao_id: 1, // Será atualizado após criação das instalações
        localizacao: 'Manifold Principal',
        tipo_medidor_primario: 'Ultrassonico',
        fluido_medido: 'Gas_Natural',
        direcao_fluxo: 'Entrada',
        diametro_nominal: 0.150,
        solicitacao_calibracao: 'Executada',
        status_ponto: 'Ativo',
        sistema_medicao: 'Sistema Fiscal Principal',
        classificacao: 'Fiscal',
        numero_serie_atual: '309-FT-9144',
        data_instalacao_atual: '2024-01-15',
        data_ultima_calibracao: '2024-01-15',
        data_proxima_calibracao: '2025-01-15',
        observacoes: 'Ponto de medição fiscal principal da instalação 3R2'
      },
      {
        tag_ponto: '3R2-PPT-50',
        nome_ponto: 'Pressão Sistema Principal',
        polo_id: 1, // Será atualizado após criação dos polos
        instalacao_id: 1, // Será atualizado após criação das instalações
        localizacao: 'Separador de Teste',
        tipo_medidor_primario: 'Coriolis',
        fluido_medido: 'Oleo_Cru',
        direcao_fluxo: 'Saida',
        diametro_nominal: 0.100,
        solicitacao_calibracao: 'Executada',
        status_ponto: 'Ativo',
        sistema_medicao: 'Sistema Fiscal Principal',
        classificacao: 'Fiscal',
        numero_serie_atual: '7-PPT-50HP-RJS',
        data_instalacao_atual: '2024-02-01',
        data_ultima_calibracao: '2024-02-01',
        data_proxima_calibracao: '2025-02-01',
        observacoes: 'Medição de pressão do sistema fiscal'
      }
    ];
    
    // Cria pontos de medição
    for (const ponto of pontosExemplo) {
      await PontoMedicao.create(ponto);
    }
    
    // Certificados de exemplo
    const certificadosExemplo = [
      {
        numero_serie: '7-PPT-50HP-RJS',
        numero_certificado: 'CEXIS-2024-001234',
        laboratorio: 'CEXIS',
        numero_acreditacao: 'CGCRE-001',
        data_emissao: '2024-01-20',
        data_calibracao: '2024-01-15',
        data_validade: '2025-01-15',
        rastreabilidade_si: 'Padrão primário rastreável ao NIST via RBC/Inmetro',
        incerteza_medicao: '0.05% (k=2)',
        fator_abrangencia: 2.0,
        status_calibracao: 'Aprovado',
        observacoes: 'Certificado emitido conforme ISO 17025'
      },
      {
        numero_serie: '309-FT-9144',
        numero_certificado: 'SOCORRO-2024-005678',
        laboratorio: 'SOCORRO',
        numero_acreditacao: 'CGCRE-002',
        data_emissao: '2024-01-25',
        data_calibracao: '2024-01-15',
        data_validade: '2025-01-15',
        rastreabilidade_si: 'Padrão secundário rastreável ao PTB via Inmetro',
        incerteza_medicao: '0.3% (k=2)',
        fator_abrangencia: 2.0,
        status_calibracao: 'Aprovado',
        observacoes: 'Calibração em bancada de vazão de gás'
      }
    ];
    
    // Cria certificados
    for (const certificado of certificadosExemplo) {
      await Certificado.create(certificado);
    }
    
    // Histórico de instalações
    const historicoExemplo = [
      {
        numero_serie: '309-FT-9144',
        tag_ponto: '3R2-FT-9144',
        data_instalacao: '2024-01-15',
        motivo_instalacao: 'Instalação inicial do sistema',
        responsavel_instalacao: 'Equipe de Instrumentação',
        ativo: true,
        observacoes: 'Instalação conforme procedimento PI-001'
      },
      {
        numero_serie: '7-PPT-50HP-RJS',
        tag_ponto: '3R2-PPT-50',
        data_instalacao: '2024-02-01',
        motivo_instalacao: 'Instalação inicial do sistema',
        responsavel_instalacao: 'Equipe de Instrumentação',
        ativo: true,
        observacoes: 'Instalação conforme procedimento PI-002'
      }
    ];
    
    // Cria histórico
    for (const historico of historicoExemplo) {
      await HistoricoInstalacao.create(historico);
    }
    
    console.log('✅ Dados de exemplo criados com sucesso!');
    
    // Criar dados de exemplo para Polos e Instalações
    await criarDadosExemplo();
    
  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
    throw error;
  }
}

/**
 * Reseta o banco de dados (CUIDADO: apaga todos os dados)
 */
async function resetDatabase() {
  try {
    console.log('⚠️  RESETANDO banco de dados...');
    await sequelize.sync({ force: true });
    console.log('✅ Banco de dados resetado com sucesso!');
    
    // Recria dados de exemplo
    await createSampleData();
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  }
}

/**
 * Fecha a conexão com o banco
 */
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('✅ Conexão com banco de dados fechada.');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão:', error);
  }
}

module.exports = {
  initializeDatabase,
  resetDatabase,
  closeDatabase,
  createSampleData
};

